from __future__ import annotations

import heapq
import math
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "imports" / "bonorong-simplified-map-v2.png"
OUTPUT = ROOT / "src" / "generatedMapRoutes.ts"
GRID_SIZE = (256, 384)

# Existing prototype marker positions transformed into the source-image grid.
STOPS = {
    "entrance": (128, 274),
    "wombat": (159, 170),
    "devil": (212, 174),
    "tiger-snake": (215, 213),
    "kangaroo": (174, 298),
    "emu": (72, 156),
    "frogmouth": (113, 191),
}


def classify(image: Image.Image) -> tuple[Image.Image, Image.Image]:
    standard = Image.new("L", image.size, 0)
    accessible = Image.new("L", image.size, 0)
    source = image.load()
    standard_pixels = standard.load()
    accessible_pixels = accessible.load()

    for y in range(image.height):
        for x in range(image.width):
            r, g, b = source[x, y]
            cream = r > 220 and g > 205 and b > 175 and max(r, g, b) - min(r, g, b) < 75
            green = r < 125 and g > 105 and g > r * 1.2 and g > b * 1.12
            purple = b > 115 and b > g * 1.1 and b > r * 1.04
            if cream or green or purple:
                standard_pixels[x, y] = 255
            if cream or green:
                accessible_pixels[x, y] = 255

    # Close small texture/anti-aliasing gaps without materially widening paths.
    standard = standard.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
    accessible = accessible.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
    return standard, accessible


def nearest_walkable(mask: Image.Image, origin: tuple[int, int]) -> tuple[int, int]:
    pixels = mask.load()
    queue = deque([origin])
    seen = {origin}
    while queue:
        x, y = queue.popleft()
        if 0 <= x < mask.width and 0 <= y < mask.height and pixels[x, y] > 0:
            return x, y
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            candidate = (x + dx, y + dy)
            if candidate not in seen and -1 <= candidate[0] <= mask.width and -1 <= candidate[1] <= mask.height:
                seen.add(candidate)
                queue.append(candidate)
    raise RuntimeError(f"No walkable pixel near {origin}")


def clearance(mask: Image.Image) -> list[list[int]]:
    pixels = mask.load()
    distances = [[10_000] * mask.width for _ in range(mask.height)]
    queue: deque[tuple[int, int]] = deque()
    for y in range(mask.height):
        for x in range(mask.width):
            if pixels[x, y] == 0:
                distances[y][x] = 0
                queue.append((x, y))
    while queue:
        x, y = queue.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < mask.width and 0 <= ny < mask.height and distances[ny][nx] > distances[y][x] + 1:
                distances[ny][nx] = distances[y][x] + 1
                queue.append((nx, ny))
    return distances


def astar(mask: Image.Image, start: tuple[int, int], end: tuple[int, int]) -> list[tuple[int, int]]:
    pixels = mask.load()
    centre_distance = clearance(mask)
    start = nearest_walkable(mask, start)
    end = nearest_walkable(mask, end)
    frontier = [(0.0, start)]
    cost = {start: 0.0}
    previous: dict[tuple[int, int], tuple[int, int]] = {}

    while frontier:
        _, current = heapq.heappop(frontier)
        if current == end:
            break
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
            nx, ny = current[0] + dx, current[1] + dy
            if not (0 <= nx < mask.width and 0 <= ny < mask.height) or pixels[nx, ny] == 0:
                continue
            step = math.hypot(dx, dy) * (1 + 2.5 / (centre_distance[ny][nx] + 1))
            candidate = cost[current] + step
            neighbour = (nx, ny)
            if candidate < cost.get(neighbour, math.inf):
                cost[neighbour] = candidate
                previous[neighbour] = current
                heuristic = math.hypot(end[0] - nx, end[1] - ny)
                heapq.heappush(frontier, (candidate + heuristic, neighbour))

    if end not in previous and end != start:
        raise RuntimeError(f"No route from {start} to {end}")
    path = [end]
    while path[0] != start:
        path.insert(0, previous[path[0]])
    return path


def simplify(points: list[tuple[int, int]], epsilon: float = 1.35) -> list[tuple[int, int]]:
    if len(points) < 3:
        return points
    start, end = points[0], points[-1]
    dx, dy = end[0] - start[0], end[1] - start[1]
    denominator = math.hypot(dx, dy)
    distances = []
    for point in points[1:-1]:
        if denominator == 0:
            distance = math.hypot(point[0] - start[0], point[1] - start[1])
        else:
            distance = abs(dy * point[0] - dx * point[1] + end[0] * start[1] - end[1] * start[0]) / denominator
        distances.append(distance)
    maximum = max(distances, default=0)
    if maximum <= epsilon:
        return [start, end]
    index = distances.index(maximum) + 1
    return simplify(points[: index + 1], epsilon)[:-1] + simplify(points[index:], epsilon)


def to_percent(point: tuple[int, int]) -> tuple[float, float]:
    # The source image is fitted into the 360×440 SVG image viewport using
    # xMidYMid slice: 360×540 content, cropped by 50 units at top and bottom.
    x = point[0] / GRID_SIZE[0] * 100
    y = ((point[1] / GRID_SIZE[1] * 540) - 50) / 440 * 100
    return round(x, 2), round(y, 2)


def main() -> None:
    source = Image.open(SOURCE).convert("RGB").resize(GRID_SIZE, Image.Resampling.LANCZOS)
    masks = dict(zip(("standard", "accessible"), classify(source)))
    routes: dict[str, list[tuple[float, float]]] = {}
    for mode, mask in masks.items():
        for start_id, start in STOPS.items():
            for end_id, end in STOPS.items():
                if start_id == end_id:
                    continue
                route = simplify(astar(mask, start, end))
                routes[f"{mode}:{start_id}:{end_id}"] = [to_percent(point) for point in route]

    lines = [
        "// Generated from bonorong-simplified-map.png by scripts/build_map_routes.py.",
        "// Coordinates are percentages of the SVG map viewport.",
        "export type GeneratedRoutePoint = { x: number; y: number }", 
        "export const GENERATED_MAP_ROUTES: Record<string, GeneratedRoutePoint[]> = {",
    ]
    for key, points in sorted(routes.items()):
        values = ", ".join(f"{{ x: {x}, y: {y} }}" for x, y in points)
        lines.append(f'  "{key}": [{values}],')
    lines.append("}\n")
    OUTPUT.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
