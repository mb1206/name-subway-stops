# NYC Subway Stops Quiz — Design Spec

**Date:** 2026-04-17

## Overview

A browser-based geography quiz where the NYC subway map is displayed with all stop names hidden. Players type stop names one at a time; correct answers reveal the stop on the map. The goal is to name all 472 stops.

Inspired by: https://carvin.github.io/sf-street-names/#

---

## Core Mechanic

- Type any stop name into a single text input at the bottom of the screen
- On every keystroke, the input is matched against all unguessed stops
- A match triggers: the stop marker reveals on the map, a toast notification appears, the counter increments, and the input clears
- No timer, no give-up button — the player keeps going until all stops are named
- Once a stop is matched it cannot be matched again

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | React + TypeScript |
| Build tool | Vite |
| Map library | MapLibre GL JS via `react-map-gl` |
| Deployment | GitHub Pages (fully static, no backend) |
| Stop data | MTA public GTFS feed, pre-parsed at build time |

---

## Map

### Default view
OpenStreetMap-based vector tile style (MapTiler "Streets" free tier). Full geographic map with street grid visible. Subway stop markers overlaid.

### Toggle view
A custom MapLibre style JSON styled to resemble the 2025 MTA subway map redesign — simplified street labels, transit-focused, schematic feel. Accessible via a toggle button in the header.

The style toggle swaps the MapLibre `style` prop; all marker state is preserved across the switch.

---

## Stop Data

Source: MTA GTFS static feed (`stops.txt`, `routes.txt`, `stop_times.txt`).

Parsed at build time into `src/data/stops.json`. Each entry:

```ts
interface Stop {
  id: string;           // MTA stop ID
  name: string;         // Official MTA name, e.g. "Times Square-42 St"
  aliases: string[];    // Common names accepted, e.g. ["Times Square", "Times Sq"]
  coordinates: [number, number]; // [lng, lat]
  lines: Line[];        // Subway lines serving this stop, e.g. ["1","2","3","A","C","E"]
}
```

Total stops: ~472 (all lines, all stations).

---

## Name Matching

On every keystroke:
1. Normalize: lowercase, trim whitespace, strip punctuation
2. Compare against each unguessed stop's `name` and `aliases` (also normalized)
3. On exact match (normalized): reveal stop, show toast, increment counter, clear input
4. No fuzzy matching — common names / aliases handle the flexibility

Alias examples:
- `"Times Square"` → matches `"Times Square-42 St"`
- `"Atlantic Av"` → matches `"Atlantic Av-Barclays Ctr"`
- `"Jay St"` → matches `"Jay St-MetroTech"`

---

## UI Layout

Full-screen map. No sidebars.

```
┌─────────────────────────────────────────┐
│  Name the Subway Stops       203 / 472  │  ← slim header bar
│                           [Map Style ⇄] │
│                                         │
│                                         │
│              MAP                        │
│                                         │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Type a stop name...              │  │  ← bottom input
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Components

### `<App>`
Root component. Holds quiz state: `guessed: Set<string>`, `toasts: Toast[]`. Renders `<Map>`, `<Header>`, `<QuizInput>`, `<ToastStack>`.

### `<Map>`
Full-screen MapLibre map. Accepts `guessed` set and `mapStyle` prop. Renders a `<StopMarker>` for every stop. On style toggle, swaps `style` prop — marker state preserved.

### `<StopMarker>`
Renders a cluster of MTA-colored dots (one per line serving the stop). Unnamed: single small grey dot. Named: full line-colored dot cluster + label, animates in with a pop.

### `<Header>`
Slim top bar: app title, `X / 472` counter, map style toggle button.

### `<QuizInput>`
Bottom-center text input. On every keystroke, runs matching logic against all stops in `src/data/stops.json`. Dispatches match event to `<App>` on success.

### `<ToastStack>`
Renders active toasts. Each toast shows the full official stop name + line badge icons (colored circles). Auto-dismisses after 2 seconds.

---

## Matching Logic (detail)

```ts
function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

function findMatch(input: string, stops: Stop[], guessed: Set<string>): Stop | null {
  const normalized = normalize(input);
  return stops.find(stop =>
    !guessed.has(stop.id) &&
    [stop.name, ...stop.aliases].some(name => normalize(name) === normalized)
  ) ?? null;
}
```

---

## Data Pipeline

A build-time script (`scripts/parse-gtfs.ts`) downloads the MTA GTFS zip, extracts `stops.txt` and `routes.txt`, and outputs `src/data/stops.json` and `src/data/lines.json`. The aliases list is hand-curated in `src/data/aliases.ts` and merged at build time.

---

## Out of Scope

- Timer or countdown mode
- Give up / reveal remaining stops
- Per-line filtering
- Mobile-specific optimizations (desktop first)
- User accounts or score persistence
