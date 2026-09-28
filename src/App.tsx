import React, { useState } from "react"
import cuteWombat from "@/imports/Cute-Wombat-1.jpg"
import parkMap from "@/imports/bonorong-simplified-map-v2.png"
import { GENERATED_MAP_ROUTES } from "@/generatedMapRoutes"

type Tab = "home" | "map" | "plan"

// ── Data ───────────────────────────────────────────────────────────────────

const ANIMALS = [
  {
    id: "wombat",
    name: "Common Wombat",
    latin: "Vombatus ursinus",
    zone: "Enclosure B4 · Upper Grasslands",
    feeding: "2:00 PM",
    feedingIn: "In 25 mins",
    bestSpot: "Left-side viewing platform",
    tags: ["Step-free Access", "Shaded Seating"],
    category: "Mammals",
    img: cuteWombat,
    imgWide:
      "https://images.unsplash.com/photo-1513333420772-7b64ad15ca96?w=700&h=320&fit=crop&auto=format",
    mapX: 62,
    mapY: 43,
    activeAt: ["now", "2pm"],
  },
  {
    id: "devil",
    name: "Tasmanian Devil",
    latin: "Sarcophilus harrisii",
    zone: "Devil Den · Northern Ridge",
    feeding: "2:30 PM",
    feedingIn: "In 55 mins",
    bestSpot: "Front glass panel, ground level",
    tags: ["Step-free Access"],
    category: "Mammals",
    img: "https://images.unsplash.com/photo-1609996178114-2ebdad620206?w=400&h=400&fit=crop&auto=format",
    imgWide:
      "https://images.unsplash.com/photo-1609996178114-2ebdad620206?w=700&h=320&fit=crop&auto=format",
    mapX: 83,
    mapY: 46,
    activeAt: ["2pm", "3pm"],
  },
  {
    id: "tiger-snake",
    name: "Tiger Snake",
    latin: "Notechis scutatus",
    zone: "Reptile Habitat · East Wetlands",
    feeding: "3:00 PM",
    feedingIn: "In 1 hr 25 mins",
    bestSpot: "Front viewing window, east side",
    tags: ["Step-free Access", "Indoor Viewing"],
    category: "Reptiles",
    img: "https://commons.wikimedia.org/wiki/Special:FilePath/Chappell%20Island%20tiger%20snake.jpg?width=500",
    imgWide:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Chappell%20Island%20tiger%20snake.jpg?width=900",
    mapX: 84,
    mapY: 62,
    activeAt: ["3pm", "4pm"],
  },
  {
    id: "kangaroo",
    name: "Eastern Kangaroo",
    latin: "Macropus giganteus",
    zone: "Kangaroo Feeding Ground",
    feeding: "1:30 PM",
    feedingIn: "Next: 4:30 PM",
    bestSpot: "Feeding area centre path",
    tags: ["Step-free Access", "Open Walking Area"],
    category: "Mammals",
    img: "https://images.unsplash.com/photo-1669187497286-a818128bd5df?w=400&h=400&fit=crop&auto=format",
    imgWide:
      "https://images.unsplash.com/photo-1669187497286-a818128bd5df?w=700&h=320&fit=crop&auto=format",
    mapX: 68,
    mapY: 75,
    activeAt: ["now", "2pm", "4pm"],
  },
  {
    id: "emu",
    name: "Emu",
    latin: "Dromaius novaehollandiae",
    zone: "Emu Habitat · West Grove",
    feeding: "11:00 AM",
    feedingIn: "Next: 3:30 PM",
    bestSpot: "Lower paddock viewing rail",
    tags: ["Shaded Seating", "Keeper Talk"],
    category: "Birds",
    img: "https://commons.wikimedia.org/wiki/Special:FilePath/Emu%20portrait.jpg?width=500",
    imgWide:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Emu%20portrait.jpg?width=900",
    mapX: 28,
    mapY: 37,
    activeAt: ["3pm", "4pm"],
  },
  {
    id: "frogmouth",
    name: "Tawny Frogmouth",
    latin: "Podargus strigoides",
    zone: "Night Birds Aviary",
    feeding: "4:00 PM",
    feedingIn: "In 2 hrs 25 mins",
    bestSpot: "Rear perch near window",
    tags: ["Indoor", "All Ages"],
    category: "Birds",
    img: "https://images.unsplash.com/photo-1649562212190-6b09f242e77d?w=400&h=400&fit=crop&auto=format",
    imgWide:
      "https://images.unsplash.com/photo-1649562212190-6b09f242e77d?w=700&h=320&fit=crop&auto=format",
    mapX: 44,
    mapY: 47,
    activeAt: ["4pm"],
  },
]

const ENTRANCE = { id: "entrance", mapX: 50, mapY: 84 }
const CURRENT_LOCATION = { mapX: 50, mapY: 76 }

const FACILITIES = [
  {
    id: "picnic",
    label: "Picnic",
    symbol: "⌁",
    mapX: 73,
    mapY: 59,
    color: "#172D2A",
    bg: "#FFFDF8",
  },
  {
    id: "cafe",
    label: "Café",
    symbol: "C",
    mapX: 58,
    mapY: 23,
    color: "#C96D2B",
    bg: "#FFF3E8",
  },
  {
    id: "toilets",
    label: "Toilets",
    symbol: "WC",
    mapX: 67,
    mapY: 23,
    color: "#173E43",
    bg: "#EDF7F6",
  },
  {
    id: "first-aid",
    label: "Hospital",
    symbol: "+",
    mapX: 39,
    mapY: 16,
    color: "#4E9D4A",
    bg: "#EDF8E9",
  },
]

function getNodePos(id: string, W: number, H: number) {
  if (id === "entrance")
    return { x: (ENTRANCE.mapX / 100) * W, y: (ENTRANCE.mapY / 100) * H }
  const a = ANIMALS.find((a) => a.id === id)
  if (!a) return { x: 0, y: 0 }
  return { x: (a.mapX / 100) * W, y: (a.mapY / 100) * H }
}

type RoadNode = { x: number; y: number }
type RoadEdge = {
  from: string
  to: string
  stepFree: boolean
  points?: RoadNode[]
}

// Normalised junctions traced over the visible outer loop and internal paths.
const ROAD_NODES: Record<string, RoadNode> = {
  northHub: { x: 45, y: 14 },
  northWest: { x: 30, y: 18 },
  westUpper: { x: 22, y: 29 },
  westMid: { x: 14, y: 43 },
  westLower: { x: 19, y: 60 },
  southWest: { x: 34, y: 69 },
  southHub: { x: 51, y: 76 },
  lowerEast: { x: 70, y: 69 },
  eastMid: { x: 78, y: 53 },
  eastUpper: { x: 75, y: 36 },
  northEast: { x: 65, y: 21 },
  innerNorthWest: { x: 36, y: 29 },
  centerNorth: { x: 49, y: 32 },
  centerWest: { x: 34, y: 44 },
  center: { x: 50, y: 46 },
  centerEast: { x: 64, y: 45 },
  centerSouth: { x: 49, y: 59 },
}

const ROAD_EDGES: RoadEdge[] = [
  // Outer loop
  { from: "entrance", to: "southHub", stepFree: true, points: [{ x: 50, y: 80 }] },
  { from: "southHub", to: "lowerEast", stepFree: true, points: [{ x: 57, y: 75 }, { x: 64, y: 73 }] },
  { from: "lowerEast", to: "eastMid", stepFree: true, points: [{ x: 75, y: 66 }, { x: 79, y: 60 }] },
  { from: "eastMid", to: "eastUpper", stepFree: true, points: [{ x: 80, y: 48 }, { x: 79, y: 41 }] },
  { from: "eastUpper", to: "northEast", stepFree: true, points: [{ x: 73, y: 31 }, { x: 69, y: 25 }] },
  { from: "northEast", to: "northHub", stepFree: true, points: [{ x: 60, y: 18 }, { x: 52, y: 16 }] },
  { from: "northHub", to: "northWest", stepFree: true, points: [{ x: 40, y: 14 }, { x: 35, y: 15 }] },
  { from: "northWest", to: "westUpper", stepFree: false, points: [{ x: 26, y: 21 }, { x: 23, y: 25 }] },
  { from: "westUpper", to: "westMid", stepFree: false, points: [{ x: 18, y: 33 }, { x: 15, y: 38 }] },
  { from: "westMid", to: "westLower", stepFree: false, points: [{ x: 13, y: 49 }, { x: 15, y: 55 }] },
  { from: "westLower", to: "southWest", stepFree: false, points: [{ x: 23, y: 64 }, { x: 28, y: 67 }] },
  { from: "southWest", to: "southHub", stepFree: false, points: [{ x: 39, y: 72 }, { x: 46, y: 75 }] },
  // Internal paths between the green spaces
  { from: "northWest", to: "innerNorthWest", stepFree: true, points: [{ x: 33, y: 23 }] },
  { from: "innerNorthWest", to: "centerNorth", stepFree: true, points: [{ x: 41, y: 30 }, { x: 45, y: 31 }] },
  { from: "centerNorth", to: "northHub", stepFree: true, points: [{ x: 48, y: 25 }, { x: 46, y: 19 }] },
  { from: "innerNorthWest", to: "centerWest", stepFree: false, points: [{ x: 34, y: 35 }, { x: 33, y: 40 }] },
  { from: "centerWest", to: "westMid", stepFree: false, points: [{ x: 27, y: 43 }, { x: 20, y: 43 }] },
  { from: "centerWest", to: "center", stepFree: true, points: [{ x: 40, y: 45 }, { x: 45, y: 46 }] },
  { from: "centerNorth", to: "center", stepFree: true, points: [{ x: 50, y: 37 }, { x: 50, y: 41 }] },
  { from: "center", to: "centerEast", stepFree: true, points: [{ x: 55, y: 46 }, { x: 60, y: 45 }] },
  { from: "centerEast", to: "eastMid", stepFree: true, points: [{ x: 70, y: 47 }, { x: 75, y: 50 }] },
  { from: "center", to: "centerSouth", stepFree: true, points: [{ x: 49, y: 51 }, { x: 49, y: 55 }] },
  { from: "centerSouth", to: "southHub", stepFree: true, points: [{ x: 48, y: 65 }, { x: 49, y: 71 }] },
  { from: "centerSouth", to: "southWest", stepFree: false, points: [{ x: 43, y: 63 }, { x: 38, y: 66 }] },
  { from: "centerEast", to: "lowerEast", stepFree: true, points: [{ x: 66, y: 53 }, { x: 68, y: 61 }] },
  // Short enclosure access paths
  { from: "wombat", to: "centerNorth", stepFree: true, points: [{ x: 56, y: 38 }, { x: 52, y: 35 }] },
  { from: "devil", to: "eastUpper", stepFree: true, points: [{ x: 80, y: 42 }] },
  { from: "tiger-snake", to: "eastMid", stepFree: true, points: [{ x: 81, y: 58 }] },
  { from: "kangaroo", to: "lowerEast", stepFree: true, points: [{ x: 69, y: 72 }] },
  { from: "emu", to: "northWest", stepFree: true, points: [{ x: 29, y: 27 }, { x: 29, y: 22 }] },
  { from: "frogmouth", to: "center", stepFree: true, points: [{ x: 46, y: 46 }] },
]

function getRoadNodePos(id: string, W: number, H: number) {
  const roadNode = ROAD_NODES[id]
  if (roadNode) return { x: (roadNode.x / 100) * W, y: (roadNode.y / 100) * H }
  return getNodePos(id, W, H)
}

function getRoadEdgePoints(edge: RoadEdge, from: string, W: number, H: number) {
  const normalised = [
    getRoadNodePos(edge.from, W, H),
    ...(edge.points ?? []).map((point) => ({
      x: (point.x / 100) * W,
      y: (point.y / 100) * H,
    })),
    getRoadNodePos(edge.to, W, H),
  ]
  return from === edge.from ? normalised : normalised.reverse()
}

function getPolylineLength(points: RoadNode[]) {
  return points.slice(1).reduce((total, point, index) => {
    const previous = points[index]
    return total + Math.hypot(point.x - previous.x, point.y - previous.y)
  }, 0)
}

function findRoadPath(
  start: string,
  end: string,
  stepFree: boolean,
  W: number,
  H: number,
) {
  const generatedRoute =
    GENERATED_MAP_ROUTES[`${stepFree ? "accessible" : "standard"}:${start}:${end}`]
  if (generatedRoute) {
    return generatedRoute.map((point) => ({
      x: (point.x / 100) * W,
      y: (point.y / 100) * H,
    }))
  }

  const nodeIds = new Set<string>([start, end])
  const usableEdges = ROAD_EDGES.filter((edge) => !stepFree || edge.stepFree)
  usableEdges.forEach((edge) => {
    nodeIds.add(edge.from)
    nodeIds.add(edge.to)
  })

  const distances = new Map<string, number>()
  const previous = new Map<string, string>()
  const unvisited = new Set(nodeIds)
  nodeIds.forEach((id) => distances.set(id, Number.POSITIVE_INFINITY))
  distances.set(start, 0)

  while (unvisited.size) {
    const current = [...unvisited].reduce((best, id) =>
      (distances.get(id) ?? Infinity) < (distances.get(best) ?? Infinity)
        ? id
        : best,
    )
    if (current === end || !Number.isFinite(distances.get(current) ?? Infinity)) break
    unvisited.delete(current)

    usableEdges
      .filter((edge) => edge.from === current || edge.to === current)
      .forEach((edge) => {
        const neighbour = edge.from === current ? edge.to : edge.from
        if (!unvisited.has(neighbour)) return
        const edgePoints = getRoadEdgePoints(edge, current, W, H)
        const candidate =
          (distances.get(current) ?? Infinity) + getPolylineLength(edgePoints)
        if (candidate < (distances.get(neighbour) ?? Infinity)) {
          distances.set(neighbour, candidate)
          previous.set(neighbour, current)
        }
      })
  }

  const path = [end]
  while (path[0] !== start && previous.has(path[0])) {
    path.unshift(previous.get(path[0])!)
  }
  if (path[0] !== start) return [getRoadNodePos(start, W, H), getRoadNodePos(end, W, H)]

  return path.slice(1).reduce<RoadNode[]>((points, nodeId, index) => {
    const from = path[index]
    const edge = usableEdges.find(
      (candidate) =>
        (candidate.from === from && candidate.to === nodeId) ||
        (candidate.to === from && candidate.from === nodeId),
    )
    if (!edge) return points
    const edgePoints = getRoadEdgePoints(edge, from, W, H)
    return [...points, ...edgePoints.slice(points.length ? 1 : 0)]
  }, [])
}

// ── Shared styles ─────────────────────────────────────────────────────────

const font = {
  display: "'Fraunces', Georgia, serif",
  body: "'Outfit', system-ui, sans-serif",
}
const c = {
  green: "#1B4D3E",
  greenLight: "#2E6B52",
  ochre: "#D97736",
  cream: "#F4F0E6",
  bg: "#F4F0E6",
  text: "#0F172A",
  muted: "#475569",
  border: "rgba(27,77,62,0.12)",
  card: "#FDFAF5",
}

// ── Icons ──────────────────────────────────────────────────────────────────

function Ico({
  d,
  size = 20,
  stroke = c.green,
  fill = "none",
  sw = 2,
}: {
  d: string | string[]
  size?: number
  stroke?: string
  fill?: string
  sw?: number
}) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}

function SearchIcon({
  size = 18,
  color = c.muted,
}: {
  size?: number
  color?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function CheckIcon({
  size = 12,
  color = "white",
}: {
  size?: number
  color?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ── Bottom Nav ─────────────────────────────────────────────────────────────

function BottomNav({
  active,
  onChange,
}: {
  active: Tab
  onChange: (t: Tab) => void
}) {
  const tabs: {
    id: Tab
    label: string
    icon: (a: boolean) => React.ReactElement
  }[] = [
    {
      id: "home",
      label: "Home",
      icon: (a) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={a ? c.green : c.muted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
      ),
    },
    {
      id: "map",
      label: "Map",
      icon: (a) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={a ? c.green : c.muted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      icon: (a) => (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={a ? c.green : c.muted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="9" y1="7" x2="15" y2="7" />
          <line x1="9" y1="11" x2="15" y2="11" />
          <line x1="9" y1="15" x2="12" y2="15" />
        </svg>
      ),
    },
  ]
  return (
    <nav
      className="flex items-center justify-around px-4 pt-3 pb-6 shrink-0"
      style={{ background: c.card, borderTop: `1px solid ${c.border}` }}
    >
      {tabs.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="flex flex-col items-center gap-1 min-w-[56px]"
        >
          {icon(active === id)}
          <span
            style={{
              fontSize: "11px",
              fontWeight: active === id ? 600 : 400,
              color: active === id ? c.green : c.muted,
              fontFamily: font.body,
            }}
          >
            {label}
          </span>
        </button>
      ))}
    </nav>
  )
}

// ── HOME ───────────────────────────────────────────────────────────────────

function HomeScreen({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const [searchQ, setSearchQ] = useState("")
  const chips = ["Wombat", "Tasmanian Devil", "Emu", "Kangaroos"]

  const filteredAnimals = searchQ.trim()
    ? ANIMALS.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQ.toLowerCase()) ||
          a.latin.toLowerCase().includes(searchQ.toLowerCase()),
      )
    : []

  return (
    <div
      className="flex flex-col flex-1 overflow-y-auto"
      style={{ background: c.bg }}
    >
      {/* Header */}
      <div
        className="relative overflow-hidden px-5 pt-14 pb-6"
        style={{
          background: `linear-gradient(155deg, ${c.green} 0%, ${c.greenLight} 70%, #3A7A5C 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 30%, white 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="flex items-start justify-between mb-1">
          <div>
            <p
              style={{
                fontFamily: font.body,
                fontSize: "11px",
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Bonorong Wildlife Sanctuary
            </p>
            <h1
              style={{
                fontFamily: font.display,
                fontSize: "clamp(24px,6vw,30px)",
                fontWeight: 600,
                color: "#FDFAF5",
                lineHeight: 1.2,
                fontStyle: "italic",
                marginTop: "4px",
              }}
            >
              Welcome to
              <br />
              Bonorong!
            </h1>
          </div>
          {/* Weather widget */}
          <div className="flex flex-col items-end gap-1 pt-1 shrink-0">
            <span style={{ fontFamily: font.body, fontSize: "18px" }}>☀️</span>
            <span
              style={{
                fontFamily: font.body,
                fontSize: "13px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              18°C
            </span>
            <span
              style={{
                fontFamily: font.body,
                fontSize: "10px",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Light Breeze
            </span>
          </div>
        </div>
        {/* Park status */}
        <div className="flex items-center gap-2 mt-3">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{
              background: "#10B981",
              boxShadow: "0 0 0 3px rgba(16,185,129,0.3)",
            }}
          />
          <span
            style={{
              fontFamily: font.body,
              fontSize: "12px",
              color: "rgba(255,255,255,0.8)",
              fontWeight: 500,
            }}
          >
            Open Today · 9:00 AM – 5:00 PM
          </span>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4 py-4">
        {/* Search */}
        <div>
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-3"
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              boxShadow: "0 2px 12px rgba(27,77,62,0.07)",
            }}
          >
            <SearchIcon size={18} color={c.muted} />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search animals (e.g. Wombat, Devil)…"
              style={{
                fontFamily: font.body,
                fontSize: "14px",
                color: c.text,
                background: "transparent",
                border: "none",
                outline: "none",
                flex: 1,
              }}
            />
            {searchQ && (
              <button
                onClick={() => setSearchQ("")}
                style={{ color: c.muted, fontSize: "18px", lineHeight: 1 }}
              >
                ×
              </button>
            )}
          </div>
          {/* Chips */}
          {!searchQ && (
            <div
              className="flex gap-2 mt-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setSearchQ(chip)}
                  className="rounded-full px-3 py-1.5 shrink-0 transition-all active:scale-95"
                  style={{
                    fontFamily: font.body,
                    fontSize: "12px",
                    fontWeight: 500,
                    color: c.green,
                    background: "#E8F2EE",
                    border: `1px solid rgba(27,77,62,0.18)`,
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
          {/* Search results */}
          {filteredAnimals.length > 0 && (
            <div
              className="mt-2 rounded-2xl overflow-hidden"
              style={{
                background: c.card,
                border: `1px solid ${c.border}`,
                boxShadow: "0 4px 20px rgba(27,77,62,0.1)",
              }}
            >
              {filteredAnimals.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setSearchQ("")
                    onNavigate("map")
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left transition-all active:bg-[#F0F7F4]"
                  style={{
                    borderBottom:
                      i < filteredAnimals.length - 1
                        ? `1px solid ${c.border}`
                        : "none",
                  }}
                >
                  <img
                    src={a.img}
                    alt={a.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <p
                      style={{
                        fontFamily: font.body,
                        fontSize: "14px",
                        fontWeight: 600,
                        color: c.text,
                      }}
                    >
                      {a.name}
                    </p>
                    <p
                      style={{
                        fontFamily: font.body,
                        fontSize: "11px",
                        color: c.muted,
                      }}
                    >
                      Feeding {a.feeding} · {a.zone}
                    </p>
                  </div>
                  <svg
                    className="ml-auto"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={c.muted}
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          )}
          {searchQ && filteredAnimals.length === 0 && (
            <div
              className="mt-2 rounded-2xl px-4 py-5 text-center"
              style={{ background: c.card, border: `1px solid ${c.border}` }}
            >
              <p
                style={{
                  fontFamily: font.body,
                  fontSize: "13px",
                  color: c.muted,
                }}
              >
                No animals found for "{searchQ}"
              </p>
              <p
                style={{
                  fontFamily: font.body,
                  fontSize: "11px",
                  color: c.muted,
                  marginTop: "4px",
                }}
              >
                Try: Wombat, Devil, Emu
              </p>
            </div>
          )}
        </div>

        {/* Hero action cards */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onNavigate("map")}
            className="flex items-center gap-4 rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
            style={{
              background: c.card,
              boxShadow: "0 2px 12px rgba(27,77,62,0.1)",
              border: `1px solid ${c.border}`,
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(135deg, ${c.green}, ${c.greenLight})`,
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="#FDFAF5"
                stroke="none"
              >
                <polygon
                  points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"
                  opacity="0.6"
                />
                <line
                  x1="8"
                  y1="2"
                  x2="8"
                  y2="18"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <line
                  x1="16"
                  y1="6"
                  x2="16"
                  y2="22"
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontFamily: font.body,
                  fontSize: "16px",
                  fontWeight: 600,
                  color: c.text,
                }}
              >
                Explore Interactive Map
              </p>
              <p
                style={{
                  fontFamily: font.body,
                  fontSize: "12px",
                  color: c.muted,
                }}
              >
                Find enclosures · Get directions
              </p>
            </div>
            <svg
              className="ml-auto"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C4C0B8"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            onClick={() => onNavigate("plan")}
            className="flex items-center gap-4 rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
            style={{
              background: c.card,
              boxShadow: "0 2px 12px rgba(27,77,62,0.1)",
              border: `1px solid ${c.border}`,
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(135deg, ${c.ochre}, #E8933A)`,
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="9" y1="7" x2="15" y2="7" />
                <line x1="9" y1="11" x2="15" y2="11" />
                <polyline points="9 15 10 16 13 13" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontFamily: font.body,
                  fontSize: "16px",
                  fontWeight: 600,
                  color: c.text,
                }}
              >
                Plan My Visit
              </p>
              <p
                style={{
                  fontFamily: font.body,
                  fontSize: "12px",
                  color: c.muted,
                }}
              >
                Personalised visit route
              </p>
            </div>
            <svg
              className="ml-auto"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C4C0B8"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Secondary grid */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-4"
            style={{ background: c.card, border: `1px solid ${c.border}` }}
          >
            <p
              style={{
                fontFamily: font.body,
                fontSize: "11px",
                color: c.ochre,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Today's Schedule
            </p>
            {[
              { time: "1:35 PM", label: "Wombat Keeper Talk" },
              { time: "2:00 PM", label: "Wombat Feeding" },
              { time: "2:30 PM", label: "Devil Feeding" },
            ].map(({ time, label }) => (
              <div key={time} className="flex items-center gap-2 mt-2">
                <span
                  style={{
                    fontFamily: font.body,
                    fontSize: "10px",
                    color: c.muted,
                    minWidth: "42px",
                  }}
                >
                  {time}
                </span>
                <span
                  style={{
                    fontFamily: font.body,
                    fontSize: "12px",
                    color: c.text,
                    fontWeight: 500,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
          <a
            href="https://www.bonorong.com.au/donate/"
            target="_blank"
            rel="noreferrer"
            aria-label="Donate to Bonorong Wildlife Sanctuary (opens in a new tab)"
            className="rounded-2xl overflow-hidden relative"
            style={{ border: `1px solid ${c.border}` }}
          >
            <img
              src="https://images.unsplash.com/photo-1609996178114-2ebdad620206?w=300&h=200&fit=crop&auto=format"
              alt="Tasmanian Devil"
              className="w-full h-full object-cover"
              style={{ minHeight: "120px" }}
            />
            <div
              className="absolute inset-0 flex flex-col justify-end p-3"
              style={{
                background:
                  "linear-gradient(to top, rgba(27,77,62,0.85) 0%, transparent 60%)",
              }}
            >
              <p
                style={{
                  fontFamily: font.body,
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Conservation
              </p>
              <p
                style={{
                  fontFamily: font.display,
                  fontSize: "13px",
                  color: "white",
                  fontWeight: 600,
                  fontStyle: "italic",
                }}
              >
                Support & Donate
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

// ── MAP ────────────────────────────────────────────────────────────────────

type RouteConfig = { animalIds: string[] stepFree: boolean } | null

function MapScreen({
  routeConfig,
  onClearRoute,
}: {
  routeConfig: RouteConfig
  onClearRoute: () => void
}) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null)
  const [keyOpen, setKeyOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const filters = ["All", "Mammals", "Birds", "Facilities", "Accessible"]

  const W = 360,
    H = 440
  const viewW = W / zoom
  const viewH = H / zoom
  const mapViewBox = `${(W - viewW) / 2} ${(H - viewH) / 2} ${viewW} ${viewH}`

  const showFacilities = filter === "All" || filter === "Facilities"

  const visibleAnimals = ANIMALS.filter((a) => {
    if (filter === "Facilities") return false
    if (filter === "Mammals") return a.category === "Mammals"
    if (filter === "Birds") return a.category === "Birds"
    if (filter === "Accessible")
      return a.tags.some((t) => t.includes("Step-free") || t.includes("Pram"))
    return true
  }).filter(
    (a) => !search || a.name.toLowerCase().includes(search.toLowerCase()),
  )

  const selectedAnimal = selectedId
    ? ANIMALS.find((a) => a.id === selectedId)
    : null

  // Build a path for each leg through the traced path network.
  const routeSegments: [string, string][] = routeConfig
    ? [
        ["entrance", routeConfig.animalIds[0]],
        ...routeConfig.animalIds
          .slice(1)
          .map((id, i): [string, string] => [routeConfig.animalIds[i], id]),
      ]
    : []
  const routePaths = routeSegments.map(([from, to]) =>
    findRoadPath(from, to, routeConfig?.stepFree ?? false, W, H),
  )
  const singleAnimalPath = activeRouteId
    ? findRoadPath("entrance", activeRouteId, true, W, H)
    : []

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden"
      style={{ background: c.bg }}
    >
      {/* Header */}
      <div
        className="flex flex-col gap-2 px-4 pt-12 pb-3 shrink-0"
        style={{ background: c.green }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              style={{
                fontFamily: font.body,
                fontSize: "11px",
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Sanctuary
            </p>
            <h2
              style={{
                fontFamily: font.display,
                fontSize: "20px",
                fontWeight: 600,
                color: "#FDFAF5",
                fontStyle: "italic",
              }}
            >
              Explore Map
            </h2>
          </div>
          <div className="flex gap-3 items-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </div>
        </div>
        {/* Search bar */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{
            background: "rgba(255,255,255,0.14)",
            border: "1.5px solid rgba(255,255,255,0.24)",
          }}
        >
          <SearchIcon size={16} color="rgba(255,255,255,0.75)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search animals or locations…"
            style={{
              fontFamily: font.body,
              fontSize: "14px",
              color: "white",
              background: "transparent",
              border: "none",
              outline: "none",
              flex: 1,
            }}
            className="placeholder-white/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "18px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
        {/* Filter chips */}
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-full px-3 py-1 shrink-0 transition-all"
              style={{
                fontFamily: font.body,
                fontSize: "12px",
                fontWeight: 500,
                background:
                  filter === f
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.12)",
                color: filter === f ? c.green : "rgba(255,255,255,0.8)",
                border: `1px solid ${
                  filter === f ? "transparent" : "rgba(255,255,255,0.2)"
                }`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Offline status bar — FR6 / NFR5 */}
      <div
        className="flex items-center justify-between px-4 py-1.5 shrink-0"
        style={{ background: "rgba(15,23,42,0.88)" }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: "#10B981" }}
          />
          <span
            style={{
              fontFamily: font.body,
              fontSize: "11px",
              color: "rgba(255,255,255,0.8)",
              fontWeight: 500,
            }}
          >
            Offline Ready
          </span>
        </div>
        <span
          style={{
            fontFamily: font.body,
            fontSize: "11px",
            color: "rgba(255,255,255,0.42)",
          }}
        >
          Updated 10m ago
        </span>
      </div>

      {/* Active single-animal route banner */}
      {activeRouteId && !routeConfig && (
        <div
          className="flex items-center gap-2 px-4 py-2 shrink-0"
          style={{ background: "#059669" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          <p
            style={{
              fontFamily: font.body,
              fontSize: "12px",
              fontWeight: 600,
              color: "white",
              flex: 1,
            }}
          >
            Step-free route ·{" "}
            {ANIMALS.find((a) => a.id === activeRouteId)?.name} · ~4 min
          </p>
          <button
            onClick={() => setActiveRouteId(null)}
            style={{
              fontFamily: font.body,
              fontSize: "18px",
              lineHeight: 1,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Multi-stop route banner */}
      {routeConfig && (
        <div
          className="flex items-center gap-2 px-4 py-2 shrink-0"
          style={{ background: "#10B981" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p
            style={{
              fontFamily: font.body,
              fontSize: "12px",
              fontWeight: 600,
              color: "white",
              flex: 1,
            }}
          >
            Visit route active · {routeConfig.animalIds.length} stops ·{" "}
            {routeConfig.stepFree ? "Step-free" : "Standard"} path
          </p>
          <button
            onClick={onClearRoute}
            style={{
              fontFamily: font.body,
              fontSize: "11px",
              color: "rgba(255,255,255,0.75)",
              textDecoration: "underline",
            }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Map */}
      <div
        className="flex-1 min-h-0 overflow-hidden relative"
        style={{ background: "#DDE8C5" }}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ background: "#DDE8C5" }}
        >
          <svg
            viewBox={mapViewBox}
            className="w-full h-full absolute inset-0 transition-all duration-300"
            preserveAspectRatio="xMidYMid slice"
          >
            <image
              href={parkMap}
              width={W}
              height={H}
              preserveAspectRatio="xMidYMid slice"
              style={{
                filter: "grayscale(16%) saturate(84%) contrast(94%) brightness(1.02)",
                opacity: 0.94,
              }}
            />
            <rect
              width={W}
              height={H}
              fill="rgba(244,240,230,0.12)"
              pointerEvents="none"
            />

            {/* Active multi-stop route */}
            {routePaths.map((path, i) => {
              const points = path.map((point) => `${point.x},${point.y}`).join(" ")
              return (
                <g key={`route-${i}`}>
                  <polyline
                    points={points}
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <polyline
                    points={points}
                    stroke="#0A8F63"
                    strokeWidth="4"
                    strokeDasharray="9 5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </g>
              )
            })}

            {activeRouteId &&
              !routeConfig &&
              (() => {
                const points = singleAnimalPath
                  .map((point) => `${point.x},${point.y}`)
                  .join(" ")
                return (
                  <g>
                    <polyline
                      points={points}
                      stroke="white"
                      strokeWidth="10"
                      strokeOpacity="0.85"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <polyline
                      points={points}
                      stroke="#058A61"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="10 5"
                      fill="none"
                    />
                  </g>
                )
              })()}

            {/* You are here */}
            {(() => {
              const youX = (CURRENT_LOCATION.mapX / 100) * W,
                youY = (CURRENT_LOCATION.mapY / 100) * H
              return (
                <g>
                  <path
                    d={`M${youX - 18} ${youY - 10}L${youX} ${youY - 48}L${youX + 18} ${youY - 10}Z`}
                    fill="url(#locationGlow)"
                    opacity="0.8"
                  />
                  <defs>
                    <linearGradient
                      id="locationGlow"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0" stopColor="#F59D43" stopOpacity="0" />
                      <stop offset="1" stopColor="#F59D43" stopOpacity="0.75" />
                    </linearGradient>
                  </defs>
                  <circle cx={youX} cy={youY} r={15} fill="white" />
                  <circle cx={youX} cy={youY} r={11} fill={c.ochre} />
                  <circle cx={youX} cy={youY} r={5} fill="white" />
                </g>
              )
            })()}

            {/* Fixed entrance landmark */}
            {(() => {
              const pos = getNodePos("entrance", W, H)
              return (
                <g>
                  <title>Entrance</title>
                  <rect
                    x={pos.x - 13}
                    y={pos.y - 13}
                    width="26"
                    height="26"
                    rx="8"
                    fill={c.green}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path
                    d={`M${pos.x - 7} ${pos.y + 7}V${pos.y - 4}L${pos.x} ${pos.y - 10}L${pos.x + 7} ${pos.y - 4}V${pos.y + 7}M${pos.x - 2} ${pos.y + 7}V${pos.y + 1}H${pos.x + 2}V${pos.y + 7}`}
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )
            })()}

            {/* Animal nodes */}
            {visibleAnimals.map((animal) => {
              const pos = getNodePos(animal.id, W, H)
              const isSel = selectedId === animal.id
              const routeIdx = routeConfig
                ? routeConfig.animalIds.indexOf(animal.id)
                : -1
              const r = isSel ? 20 : 16
              return (
                <g
                  key={animal.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedId(isSel ? null : animal.id)}
                >
                  <title>{animal.name} — tap for details</title>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r + 3}
                    fill="rgba(34,34,34,0.18)"
                  />
                  <circle cx={pos.x} cy={pos.y} r={r + 1} fill="white" />
                  <clipPath id={`cp-${animal.id}`}>
                    <circle cx={pos.x} cy={pos.y} r={r - 1} />
                  </clipPath>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r - 1}
                    fill={animal.id === "emu" ? "#6F5947" : "#DDE8C5"}
                  />
                  <image
                    href={animal.img}
                    x={pos.x - r + 1}
                    y={pos.y - r + 1}
                    width={(r - 1) * 2}
                    height={(r - 1) * 2}
                    clipPath={`url(#cp-${animal.id})`}
                    preserveAspectRatio={
                      animal.id === "emu" || animal.id === "tiger-snake"
                        ? "xMidYMid slice"
                        : "xMidYMid meet"
                    }
                  />
                  {/* Route number badge */}
                  {routeIdx >= 0 && (
                    <g>
                      <circle
                        cx={pos.x + r - 4}
                        cy={pos.y - r + 4}
                        r={9}
                        fill="#10B981"
                      />
                      <text
                        x={pos.x + r - 4}
                        y={pos.y - r + 8}
                        textAnchor="middle"
                        style={{ font: `bold 9px ${font.body}`, fill: "white" }}
                      >
                        {routeIdx + 1}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            {/* Facility nodes */}
            {showFacilities &&
              FACILITIES.map((fac) => {
                const px = (fac.mapX / 100) * W
                const py = (fac.mapY / 100) * H
                const s = 12
                return (
                  <g key={fac.id}>
                    <title>{fac.label}</title>
                    <rect
                      x={px - s}
                      y={py - s}
                      width={s * 2}
                      height={s * 2}
                      rx={5}
                      fill={fac.color}
                      stroke="white"
                      strokeWidth={1.5}
                    />
                    <text
                      x={px}
                      y={py + (fac.symbol.length > 1 ? 4 : 4.5)}
                      textAnchor="middle"
                      style={{
                        font: `700 ${
                          fac.symbol.length > 1 ? "7" : "12"
                        }px ${font.body}`,
                        fill: "white",
                      }}
                    >
                      {fac.symbol}
                    </text>
                  </g>
                )
              })}

          </svg>

          {/* Map controls */}
          <div className="absolute right-4 top-4 flex flex-col gap-2">
            <div
              className="w-11 h-11 rounded-full flex flex-col items-center justify-center"
              style={{
                background: "rgba(255,253,248,0.96)",
                boxShadow: "0 3px 12px rgba(23,45,42,0.18)",
              }}
            >
              <svg width="18" height="20" viewBox="0 0 18 20">
                <path d="M9 1L15 14L9 11L3 14Z" fill="#172D2A" />
                <text
                  x="9"
                  y="19"
                  textAnchor="middle"
                  style={{ font: `700 7px ${font.body}` }}
                >
                  N
                </text>
              </svg>
            </div>
            <button
              aria-label="Locate me"
              onClick={() => setZoom(1)}
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,253,248,0.96)",
                boxShadow: "0 3px 12px rgba(23,45,42,0.18)",
              }}
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#172D2A"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" fill="#172D2A" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            </button>
            <button
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Math.min(1.45, z + 0.15))}
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,253,248,0.96)",
                boxShadow: "0 3px 12px rgba(23,45,42,0.18)",
                fontFamily: font.body,
                fontSize: "27px",
                color: "#172D2A",
              }}
            >
              +
            </button>
            <button
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(1, z - 0.15))}
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,253,248,0.96)",
                boxShadow: "0 3px 12px rgba(23,45,42,0.18)",
                fontFamily: font.body,
                fontSize: "28px",
                color: "#172D2A",
              }}
            >
              −
            </button>
          </div>
        </div>

        {/* Compact floating map key — keeps the map visible and centered */}
        <div className="absolute left-4 bottom-4 z-10">
          {keyOpen && (
            <div
              className="mb-2 rounded-2xl p-3"
              style={{
                width: "250px",
                background: "rgba(255,253,248,0.97)",
                border: `1px solid ${c.border}`,
                boxShadow: "0 8px 28px rgba(23,45,42,0.16)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  style={{
                    fontFamily: font.body,
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#172D2A",
                  }}
                >
                  Map Key
                </span>
                <button
                  onClick={() => setKeyOpen(false)}
                  style={{
                    fontFamily: font.body,
                    fontSize: "16px",
                    color: c.muted,
                  }}
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {[
                  { label: "Gentle slopes", color: "#55AC50", kind: "line" },
                  { label: "Rough terrain", color: "#8873D0", kind: "line" },
                  { label: "You are here", color: c.ochre, kind: "dot" },
                  { label: "Entrance", color: c.green, kind: "entrance" },
                  { label: "Animal marker · tap for details", color: c.green, kind: "animal" },
                  {
                    label: "Hospital",
                    color: "#4E9D4A",
                    kind: "letter",
                    mark: "+",
                  },
                  {
                    label: "Toilets",
                    color: "#173E43",
                    kind: "letter",
                    mark: "WC",
                  },
                  {
                    label: "Café",
                    color: "#C96D2B",
                    kind: "letter",
                    mark: "C",
                  },
                  {
                    label: "Picnic",
                    color: "#172D2A",
                    kind: "letter",
                    mark: "⌁",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 min-w-0"
                  >
                    {item.kind === "line" && (
                      <span
                        className="w-7 h-1.5 rounded-full shrink-0"
                        style={{ background: item.color }}
                      />
                    )}
                    {item.kind === "dot" && (
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{
                          background: item.color,
                          border: "3px solid white",
                          boxShadow: `0 0 0 1px ${item.color}`,
                        }}
                      />
                    )}
                    {item.kind === "zone" && (
                      <span
                        className="w-6 h-4 rounded-md shrink-0"
                        style={{ background: item.color }}
                      />
                    )}
                    {item.kind === "animal" && (
                      <span
                        className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
                        style={{
                          background: item.color,
                          border: "2px solid white",
                          boxShadow: "0 0 0 1px rgba(27,77,62,0.25)",
                          color: "white",
                          fontSize: "11px",
                        }}
                      >
                        ●
                      </span>
                    )}
                    {item.kind === "entrance" && (
                      <span
                        className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center"
                        style={{
                          background: item.color,
                          border: "2px solid white",
                          boxShadow: "0 0 0 1px rgba(27,77,62,0.25)",
                          color: "white",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        ⌂
                      </span>
                    )}
                    {item.kind === "letter" && (
                      <span
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{
                          background: item.color,
                          color: "white",
                          fontFamily: font.body,
                          fontSize: item.mark === "WC" ? "6px" : "11px",
                          fontWeight: 700,
                        }}
                      >
                        {item.mark}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: font.body,
                        fontSize: "10px",
                        lineHeight: 1.15,
                        color: "#3F4C47",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={() => setKeyOpen((open) => !open)}
            className="flex items-center gap-2 rounded-full px-4 py-2.5"
            style={{
              background: "rgba(255,253,248,0.97)",
              border: `1px solid ${c.border}`,
              boxShadow: "0 4px 16px rgba(23,45,42,0.16)",
              fontFamily: font.body,
              fontSize: "12px",
              fontWeight: 700,
              color: c.green,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke={c.green}
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Map Key
          </button>
        </div>
      </div>

      {/* Bottom sheet */}
      {selectedAnimal && (
        <div
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl flex flex-col overflow-hidden"
          style={{
            background: c.card,
            boxShadow: "0 -8px 40px rgba(27,77,62,0.2)",
            maxHeight: "55%",
            zIndex: 20,
          }}
        >
          {/* Handle + dismiss */}
          <div className="flex items-center justify-between pt-3 pb-1 px-4">
            <div className="flex-1" />
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: "rgba(0,0,0,0.15)",
              }}
            />
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setSelectedId(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(0,0,0,0.07)",
                  fontSize: "16px",
                  color: c.muted,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          </div>

          <div className="overflow-y-auto">
            {/* Header row: photo + title */}
            <div className="flex items-start gap-3 px-4 pt-1 pb-3">
              <img
                src={selectedAnimal.img}
                alt={selectedAnimal.name}
                className="rounded-2xl object-cover shrink-0"
                style={{ width: 64, height: 64 }}
              />
              <div className="flex-1 min-w-0">
                <h3
                  style={{
                    fontFamily: font.display,
                    fontSize: "19px",
                    fontWeight: 600,
                    color: c.text,
                    fontStyle: "italic",
                    lineHeight: 1.2,
                  }}
                >
                  {selectedAnimal.name}
                </h3>
                <p
                  style={{
                    fontFamily: font.body,
                    fontSize: "11px",
                    color: c.muted,
                    fontStyle: "italic",
                    marginTop: "2px",
                  }}
                >
                  {selectedAnimal.latin}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedAnimal.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full px-2.5 py-0.5"
                      style={{
                        fontFamily: font.body,
                        fontSize: "10px",
                        fontWeight: 500,
                        color: c.green,
                        background: "#E8F2EE",
                        border: `1px solid rgba(27,77,62,0.15)`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-4 pb-5 flex flex-col gap-3">
              {/* Key info row */}
              <div className="flex gap-2.5">
                {/* Feeding time */}
                <div
                  className="flex-1 rounded-2xl p-3"
                  style={{
                    background: "#F0F7F4",
                    border: `1px solid rgba(27,77,62,0.1)`,
                  }}
                >
                  <p
                    style={{
                      fontFamily: font.body,
                      fontSize: "9px",
                      color: c.muted,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Feeding
                  </p>
                  <p
                    style={{
                      fontFamily: font.body,
                      fontSize: "17px",
                      fontWeight: 700,
                      color: c.green,
                      lineHeight: 1.1,
                      marginTop: "2px",
                    }}
                  >
                    {selectedAnimal.feeding}
                  </p>
                  <p
                    style={{
                      fontFamily: font.body,
                      fontSize: "10px",
                      color: "#10B981",
                      fontWeight: 600,
                      marginTop: "2px",
                    }}
                  >
                    {selectedAnimal.feedingIn}
                  </p>
                </div>
                {/* Best viewing spot */}
                <div
                  className="flex-1 rounded-2xl p-3"
                  style={{
                    background: "#FFFBEB",
                    border: `1px solid rgba(217,119,54,0.18)`,
                  }}
                >
                  <p
                    style={{
                      fontFamily: font.body,
                      fontSize: "9px",
                      color: c.muted,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Best Viewing Spot
                  </p>
                  <p
                    style={{
                      fontFamily: font.body,
                      fontSize: "12px",
                      fontWeight: 600,
                      color: c.text,
                      lineHeight: 1.3,
                      marginTop: "3px",
                    }}
                  >
                    {selectedAnimal.bestSpot}
                  </p>
                </div>
              </div>

              {/* Get Step-free Route CTA */}
              <button
                onClick={() => {
                  setActiveRouteId(selectedAnimal.id)
                  setSelectedId(null)
                }}
                className="w-full rounded-2xl py-4 flex items-center justify-center gap-2.5 transition-all active:scale-[0.97]"
                style={{
                  background: `linear-gradient(135deg, ${c.green}, ${c.greenLight})`,
                  fontFamily: font.body,
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "white",
                  boxShadow: "0 6px 20px rgba(27,77,62,0.3)",
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                Show Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── PLAN ───────────────────────────────────────────────────────────────────

const ARRIVAL_TIMES = [
  { id: "now", label: "Now", time: "1:35 PM" },
  { id: "2pm", label: "2 PM", time: "2:00 PM" },
  { id: "3pm", label: "3 PM", time: "3:00 PM" },
  { id: "4pm", label: "4 PM", time: "4:00 PM" },
]

function PlanScreen({
  onNavigate,
  onRouteCreated,
}: {
  onNavigate: (t: Tab) => void
  onRouteCreated: (cfg: RouteConfig) => void
}) {
  const [arrivalTime, setArrivalTime] = useState("now")
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([])
  const [stepFree, setStepFree] = useState(false)
  const [shadedStops, setShadedStops] = useState(false)
  const [shorterWalk, setShorterWalk] = useState(false)
  const [toast, setToast] = useState(false)

  const activeAnimals = ANIMALS.filter((animal) =>
    animal.activeAt.includes(arrivalTime),
  )
  const otherAnimals = ANIMALS.filter(
    (animal) => !animal.activeAt.includes(arrivalTime),
  )

  function changeArrivalTime(id: string) {
    setArrivalTime(id)
  }

  function toggleAnimal(id: string) {
    setSelectedAnimals((p) =>
      p.includes(id) ? p.filter((a) => a !== id) : [...p, id],
    )
  }

  function generate() {
    const ordered =
      selectedAnimals.length > 0
        ? selectedAnimals
        : activeAnimals.slice(0, 3).map((a) => a.id)
    onRouteCreated({ animalIds: ordered, stepFree })
    setToast(true)
    setTimeout(() => {
      setToast(false)
      onNavigate("map")
    }, 1400)
  }

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden relative"
      style={{ background: c.bg }}
    >
      {/* Toast */}
      {toast && (
        <div
          className="absolute top-16 left-4 right-4 z-30 flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            background: "#10B981",
            boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
          }}
        >
          <CheckIcon size={16} color="white" />
          <p
            style={{
              fontFamily: font.body,
              fontSize: "14px",
              fontWeight: 600,
              color: "white",
            }}
          >
            Optimal route created! Opening map…
          </p>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-12 pb-4 shrink-0" style={{ background: c.green }}>
        <p
          style={{
            fontFamily: font.body,
            fontSize: "11px",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Customise
        </p>
        <h2
          style={{
            fontFamily: font.display,
            fontSize: "22px",
            fontWeight: 600,
            color: "#FDFAF5",
            fontStyle: "italic",
          }}
        >
          Plan Your Visit
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">
        {/* Arrival time informs recommendations without restricting choice */}
        <section>
          <div className="flex items-end justify-between mb-2.5">
            <p
              style={{
                fontFamily: font.body,
                fontSize: "12px",
                fontWeight: 600,
                color: "#4A3728",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              When will you arrive?
            </p>
            <span style={{ fontFamily: font.body, fontSize: "11px", color: c.muted }}>
              {activeAnimals.length} animals active
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ARRIVAL_TIMES.map(({ id, label, time }) => {
              const selected = arrivalTime === id
              return (
                <button
                  key={id}
                  onClick={() => changeArrivalTime(id)}
                  className="rounded-2xl py-2.5 flex flex-col items-center transition-all active:scale-[0.97]"
                  style={{
                    background: selected ? c.ochre : c.card,
                    border: `1.5px solid ${selected ? c.ochre : c.border}`,
                    color: selected ? "white" : c.text,
                  }}
                >
                  <span style={{ fontFamily: font.body, fontSize: "12px", fontWeight: 700 }}>
                    {label}
                  </span>
                  <span style={{ fontFamily: font.body, fontSize: "9px", opacity: 0.72 }}>
                    {time}
                  </span>
                </button>
              )
            })}
          </div>
          <p style={{ fontFamily: font.body, fontSize: "11px", color: c.muted, marginTop: "8px" }}>
            We’ll recommend the best viewing opportunities, but every animal remains available to visit.
          </p>
        </section>

        {/* Animals */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p style={{ fontFamily: font.body, fontSize: "12px", fontWeight: 700, color: "#4A3728", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Animals active at your arrival time
              </p>
              <p style={{ fontFamily: font.body, fontSize: "11px", color: c.muted, marginTop: "3px" }}>
                Select the animals you’d like to visit.
              </p>
            </div>
            {selectedAnimals.length > 0 && (
              <span style={{ fontFamily: font.body, fontSize: "11px", color: c.ochre, fontWeight: 700 }}>
                {selectedAnimals.length} selected
              </span>
            )}
          </div>

          {[
            { title: "Best viewing opportunities", animals: activeAnimals, active: true },
            { title: "Also available to visit", animals: otherAnimals, active: false },
          ].map((group) => (
            <div key={group.title} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: group.active ? "#10B981" : "#94A3B8" }} />
                <p style={{ fontFamily: font.body, fontSize: "11px", fontWeight: 600, color: group.active ? c.green : c.muted }}>
                  {group.title}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {group.animals.map(({ id, name, img, feeding, feedingIn }) => {
                  const sel = selectedAnimals.includes(id)
                  return (
                    <button
                      key={id}
                      onClick={() => toggleAnimal(id)}
                      className="rounded-2xl overflow-hidden text-left transition-all active:scale-[0.97]"
                      style={{
                        border: sel ? `2.5px solid ${c.ochre}` : `1.5px solid ${c.border}`,
                        background: c.card,
                        boxShadow: sel ? `0 4px 16px rgba(217,119,54,0.2)` : "0 2px 8px rgba(27,77,62,0.05)",
                        opacity: group.active ? 1 : 0.88,
                      }}
                    >
                      <div className="relative">
                        <img
                          src={img}
                          alt={name}
                          className="w-full h-24 object-cover"
                          style={{
                            objectPosition:
                              id === "kangaroo" ? "50% 28%" : "center",
                          }}
                        />
                        {sel && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: c.ochre }}>
                            <CheckIcon />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 rounded-full px-2 py-1" style={{ background: group.active ? "rgba(5,150,105,0.92)" : "rgba(71,85,105,0.9)" }}>
                          <span style={{ fontFamily: font.body, fontSize: "9px", fontWeight: 700, color: "white" }}>
                            {group.active ? "Active" : "May be resting"}
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 70%, transparent 100%)" }}>
                          <p style={{ fontFamily: font.body, fontSize: "11px", color: "white", fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                            🕐 {feeding} · {feedingIn}
                          </p>
                        </div>
                      </div>
                      <div className="px-2.5 py-2">
                        <p style={{ fontFamily: font.body, fontSize: "12px", fontWeight: 600, color: sel ? c.ochre : c.text, lineHeight: 1.2 }}>
                          {name}
                        </p>
                        {!group.active && (
                          <p style={{ fontFamily: font.body, fontSize: "9px", color: c.muted, marginTop: "3px", lineHeight: 1.25 }}>
                            Still open to visit at this time
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Accessibility */}
        <section>
          <p
            style={{
              fontFamily: font.body,
              fontSize: "12px",
              fontWeight: 600,
              color: "#4A3728",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Comfort & Accessibility
          </p>
          <div
            className="flex flex-col gap-1 rounded-2xl p-3"
            style={{ background: c.card, border: `1.5px solid ${c.border}` }}
          >
            {[
              {
                label: "Step-free Route",
                sub: "For wheelchairs, mobility aids and prams",
                icon: "♿",
                val: stepFree,
                set: setStepFree,
              },
              {
                label: "Frequent Shaded Rest Stops",
                sub: "More seating for older visitors and anyone needing breaks",
                icon: "🌳",
                val: shadedStops,
                set: setShadedStops,
              },
              {
                label: "Shorter Walking Distance",
                sub: "Reduce fatigue and minimise total distance",
                icon: "👟",
                val: shorterWalk,
                set: setShorterWalk,
              },
            ].map(({ label, sub, icon, val, set }) => (
              <button
                key={label}
                onClick={() => set(!val)}
                className="flex items-center gap-3 py-2.5 px-1 text-left rounded-xl transition-all active:bg-[#F0F7F4]"
              >
                <span style={{ fontSize: "18px" }}>{icon}</span>
                <div className="flex-1">
                  <p
                    style={{
                      fontFamily: font.body,
                      fontSize: "13px",
                      fontWeight: 500,
                      color: c.text,
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontFamily: font.body,
                      fontSize: "11px",
                      color: c.muted,
                    }}
                  >
                    {sub}
                  </p>
                </div>
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
                  style={{
                    border: val ? "none" : `2px solid rgba(27,77,62,0.3)`,
                    background: val ? c.green : "transparent",
                  }}
                >
                  {val && <CheckIcon />}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* CTA */}
        <button
          onClick={generate}
          disabled={toast}
          className="w-full rounded-2xl py-4 transition-all active:scale-[0.97]"
          style={{
            background: `linear-gradient(135deg, ${c.green}, ${c.greenLight})`,
            fontFamily: font.body,
            fontSize: "15px",
            fontWeight: 700,
            color: "white",
            letterSpacing: "0.02em",
            boxShadow: "0 8px 24px rgba(27,77,62,0.35)",
          }}
        >
          Generate My Visit Route →
        </button>
        <div className="h-2" />
      </div>
    </div>
  )
}

// ── ROOT ───────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState<Tab>("home")
  const [routeConfig, setRouteConfig] = useState<RouteConfig>(null)

  return (
    <div
      className="size-full flex items-center justify-center"
      style={{ background: "#E8E3DA" }}
    >
      <div
        className="flex flex-col overflow-hidden relative"
        style={{
          width: "min(393px, 100vw)",
          height: "min(852px, 100dvh)",
          background: c.bg,
          borderRadius: "min(48px, 6vw)",
          boxShadow:
            "0 48px 120px rgba(0,0,0,0.38), 0 8px 32px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.12)",
        }}
      >
        {/* Status bar */}
        <div
          className="flex justify-between items-center px-6 pt-3 pb-1 absolute top-0 left-0 right-0 z-10 pointer-events-none"
          style={{
            color:
              tab === "home" || tab === "map" || tab === "plan"
                ? "rgba(255,255,255,0.85)"
                : c.text,
          }}
        >
          <span
            style={{ fontFamily: font.body, fontSize: "12px", fontWeight: 600 }}
          >
            9:41
          </span>
          <div className="flex gap-1.5 items-center">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <rect x="0" y="4" width="3" height="8" rx="0.5" opacity="0.4" />
              <rect
                x="4.5"
                y="2.5"
                width="3"
                height="9.5"
                rx="0.5"
                opacity="0.6"
              />
              <rect x="9" y="0.5" width="3" height="11.5" rx="0.5" />
            </svg>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
              <path d="M7.5 2.5C9.8 2.5 11.8 3.5 13.2 5.1l1.4-1.4C13 1.8 10.4 0.5 7.5 0.5S2 1.8 0.4 3.7l1.4 1.4C3.2 3.5 5.2 2.5 7.5 2.5z" />
              <path d="M7.5 5.5c1.5 0 2.8.6 3.8 1.6l1.4-1.4C11.4 4.1 9.6 3.5 7.5 3.5S3.6 4.1 2.3 5.7l1.4 1.4c1-.9 2.3-1.6 3.8-1.6z" />
              <circle cx="7.5" cy="9.5" r="1.5" />
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
              <rect
                x="0.5"
                y="0.5"
                width="21"
                height="11"
                rx="3.5"
                stroke="currentColor"
                strokeOpacity="0.4"
                fill="none"
              />
              <rect x="2" y="2" width="17" height="8" rx="2" />
              <path d="M23 4v4a2 2 0 000-4z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          {tab === "home" && <HomeScreen onNavigate={setTab} />}
          {tab === "map" && (
            <MapScreen
              routeConfig={routeConfig}
              onClearRoute={() => setRouteConfig(null)}
            />
          )}
          {tab === "plan" && (
            <PlanScreen onNavigate={setTab} onRouteCreated={setRouteConfig} />
          )}
        </div>

        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  )
}
