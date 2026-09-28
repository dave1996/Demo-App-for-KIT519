# Product iteration notes

## 28 September 2026 — Plan visit decision model

### Problem

The Plan screen asked visitors how long they intended to stay, but the answer was not used by the route-generation logic. This added effort, implied unsupported scheduling precision, and distracted from the visitor's actual decisions.

The arrival-time control also behaved as a hard filter. Animals outside the selected active period disappeared, even though a less-active animal may still be available to visit and some visitors may specifically want to see it resting.

### Decision

- Remove the visit-duration question and its unused state.
- Keep arrival time as the first planning input.
- Use arrival time to rank and explain viewing opportunities, not to restrict visitor choice.
- Present animals in two groups:
  - **Best viewing opportunities** — active around the selected arrival time.
  - **Also available to visit** — likely resting or less active, but still selectable.
- Preserve selections when the arrival time changes.
- Default generated routes to active animals when the visitor has not selected any animals.

### UX rationale

This design preserves user control and avoids equating “not active” with “not available.” It gives visitors useful guidance while still allowing personal preferences to drive the route.

## 28 September 2026 — Inclusive audience language

### Problem

Several interface labels described the product as a family itinerary tool even though the sanctuary app is intended for a wider visitor audience. Accessibility language also focused heavily on prams and did not clearly acknowledge older visitors, mobility-aid users, or people with limited stamina.

### Decision

- Replace family-specific route language with neutral visit and visitor language.
- Rename the preferences section to **Comfort & Accessibility**.
- Describe step-free routing as useful for wheelchairs, mobility aids, and prams.
- Explain that frequent shaded rest stops support older visitors and anyone who needs breaks.
- Explain shorter routes in terms of fatigue and total walking distance.
- Replace animal-level “Pram Friendly” tags with the more broadly useful “Step-free Access”.
- Preserve the original prototype brief unchanged as a historical source document.

### Future data requirement

Activity status is currently prototype data. A production version should distinguish enclosure availability, predicted activity, feeding times, and keeper talks using sanctuary-managed schedule data.

## 28 September 2026 — Path-aware map routing

### Problem

Routes were drawn as straight lines between the entrance and animal coordinates. They crossed enclosures and green spaces instead of following the paths shown on the simplified sanctuary map.

### Decision

- Trace a lightweight navigation graph over the map rather than redrawing the map in SVG.
- Include both the outer loop and the smaller paths between internal green spaces.
- Connect every animal enclosure to its nearest path junction.
- Use shortest-path routing between the entrance and each selected animal stop.
- Allow standard routes to use every internal path.
- Restrict step-free routes to edges marked as accessible.
- Render only the resulting route as an SVG polyline over the raster map.

### Prototype limitation

The graph is manually aligned to the simplified map and does not represent surveyed distances or live closures. A production implementation should replace the prototype graph with verified sanctuary path data.

## 28 September 2026 — Road geometry templates

### Problem

Connecting path junctions with straight lines still cut across grass whenever the underlying walking path curved between two junctions.

### Decision

- Add manually traced intermediate control points to every outer-loop, internal-path, and enclosure-access edge.
- Reconstruct the selected route from complete edge geometries instead of joining graph nodes directly.
- Calculate route weights from the full control-point polyline length rather than the straight-line distance between junctions.
- Keep rounded joins and caps so the overlay follows curved paths without sharp visual corners.

This preserves dynamic multi-stop routing while keeping the implementation lightweight and aligned to the fixed prototype map.

## 28 September 2026 — Raster-derived walkable routes

### Problem

Visual testing showed that manually estimated control points still deviated from the paths because the raster map is cropped and scaled inside the SVG viewport.

### Decision

- Generate a walkable-area mask directly from the fixed map asset.
- Recognise cream paths plus the green and purple loop markings as walkable pixels.
- Close small texture and anti-aliasing gaps in the mask.
- Precompute standard and accessible routes between every animal and the entrance using A*.
- Favour the centre of wider paths and simplify the resulting polylines for efficient rendering.
- Save the generated routes as static TypeScript data, so the app has no runtime image-processing dependency.
- Retain the manually defined graph only as a fallback if a generated route is unavailable.

The generated data can be refreshed by running `python scripts/build_map_routes.py` whenever the base map changes.

## 28 September 2026 — Map marker hierarchy

### Problem

Text labels attached to every animal, facility, current-location marker, and entrance marker competed for space. The large Entrance badge overlapped the current-location marker and nearby animal labels, especially around the bottom of the map.

### Decision

- Remove persistent text labels from animal and facility markers.
- Remove the separate Entrance badge and represent the entrance/current position with one location marker.
- Keep animal photos, facility symbols, and route-order badges directly on the map.
- Add accessible SVG titles so markers retain names for assistive technology and hover discovery.
- Move marker meanings and facility names into the expandable Map Key.
- Increase Map Key label text slightly for readability.

### Correction

Entrance and current location are distinct concepts. The combined marker was replaced with a fixed green entrance landmark and a separate orange current-location marker positioned just inside the sanctuary. The Map Key now explains them separately.

### Animal list update

Quokka and Koala were replaced throughout the interactive animal list with Tiger Snake and Emu. Their species details, categories, habitat descriptions, imagery, search suggestions, map markers, and route identifiers were updated while retaining the existing map nodes so navigation remains available.

The Emu map marker now uses a warm brown fallback fill and a cover crop so the circular icon has no empty background. The Tiger Snake imagery was changed to a close-up view of the head and uses the same cover treatment on the map.

## 28 September 2026 — Map visual hierarchy

### Problem

The colourful base map competed visually with animal markers, facilities, the current-location indicator, and generated route overlays.

### Decision

- Apply moderate grayscale and saturation reduction to the raster base map only.
- Slightly reduce base-map contrast and add a subtle warm neutral veil.
- Preserve full colour and contrast for interactive markers, facilities, route overlays, and controls.
- Keep enough colour in the green and purple terrain paths for them to remain understandable with the Map Key.

## 28 September 2026 — Controlled base-map palette

### Problem

Even after moderate desaturation, individual grass parcels and buildings used too many competing colours. The variation created visual noise beneath the interactive information layer.

### Decision

- Introduce a versioned base-map asset with a deliberately restricted palette.
- Use one low-saturation sage green for grass and planted areas.
- Use one muted blue for all water.
- Use one neutral warm gray family for buildings.
- Keep paths warm cream and vehicle areas charcoal gray.
- Preserve the green and purple route bands as functional accent colours.
- Reduce the CSS grayscale treatment because the asset itself now provides the required visual hierarchy.
- Regenerate raster-derived navigation data from the new map asset.

The updated map was produced with the built-in image-generation editing workflow using the original map as the edit target and strict geometry-preservation instructions.
