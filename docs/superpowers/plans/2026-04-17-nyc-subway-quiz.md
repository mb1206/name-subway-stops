# NYC Subway Stops Quiz — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based NYC subway stops quiz where players type stop names to reveal them on a full-screen interactive map, with all ~472 stops hidden until named correctly.

**Architecture:** Vite + React + TypeScript SPA. MapLibre GL JS (via `react-map-gl`) renders a full-screen vector tile map with subway stop markers overlaid. Quiz state lives in a `useQuiz` hook. Stop data is pre-generated from the MTA GTFS feed into a bundled JSON file. Deployable to GitHub Pages — no backend.

**Tech Stack:** React 18, TypeScript 5, Vite 5, react-map-gl 7, maplibre-gl 4, Vitest, @testing-library/react, tsx (for GTFS script)

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/types.ts` | Shared interfaces: `Stop`, `Toast`, `MapStyleId`, `LineId` |
| `src/data/lines.ts` | MTA line color constants keyed by `LineId` |
| `src/data/aliases.ts` | Hand-curated map: official name → accepted common names |
| `src/data/stops.json` | Generated stop data (run `npm run parse-gtfs` once) |
| `src/lib/matching.ts` | `normalize()` + `findMatch()` — pure functions, fully tested |
| `src/hooks/useQuiz.ts` | Quiz state: guessed set, active toasts, `onMatch` handler |
| `src/components/Header.tsx` | Title, `X / 472` counter, map style toggle button |
| `src/components/QuizInput.tsx` | Controlled text input, runs matching on every keystroke |
| `src/components/ToastStack.tsx` | Active toasts with auto-dismiss after 2s |
| `src/components/StopMarker.tsx` | MapLibre `<Marker>` with MTA-colored dots per line |
| `src/components/Map.tsx` | Full-screen MapLibre map, renders all `<StopMarker>`s |
| `src/styles/streets-style.ts` | MapLibre style config for geographic view |
| `src/styles/schematic-style.ts` | MapLibre style config for transit-focused schematic view |
| `src/App.tsx` | Root: wires `useQuiz` + all components |
| `src/main.tsx` | React DOM entry point |
| `src/index.css` | Global CSS reset + layout (full-screen map, input positioning) |
| `src/test-setup.ts` | Vitest global setup (`@testing-library/jest-dom`) |
| `scripts/parse-gtfs.ts` | Downloads MTA GTFS zip, parses it, writes `stops.json` |
| `vite.config.ts` | Vite config: React plugin, `base` path for GitHub Pages, Vitest config |
| `index.html` | HTML shell |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`
- Create: `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/test-setup.ts`
- Create: `.gitignore`

- [ ] **Step 1: Scaffold the Vite project**

```bash
cd /Users/meredith/Source/name-subway-stops
npm create vite@latest . -- --template react-ts
```

When prompted about the existing directory, confirm you want to scaffold here.

- [ ] **Step 2: Install dependencies**

```bash
npm install react-map-gl maplibre-gl
npm install --save-dev vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @types/node tsx adm-zip papaparse @types/papaparse
```

- [ ] **Step 3: Replace `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/name-subway-stops/',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 4: Create `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Update `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 6: Add scripts to `package.json`**

Merge into the `"scripts"` section:

```json
"test": "vitest",
"test:run": "vitest run",
"parse-gtfs": "tsx scripts/parse-gtfs.ts"
```

- [ ] **Step 7: Create `.gitignore`**

```
node_modules/
dist/
.superpowers/
/src/data/stops.json
```

Note: `stops.json` is generated — commit the parser script, not the output. If you want to commit the generated data for GitHub Pages to work without running the parser, remove `stops.json` from `.gitignore` after generating it.

- [ ] **Step 8: Replace `src/App.tsx` with a placeholder**

```tsx
export default function App() {
  return <div>NYC Subway Quiz</div>
}
```

- [ ] **Step 9: Replace `src/index.css` with a reset**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

- [ ] **Step 10: Verify the scaffold runs**

```bash
npm run dev
```

Expected: Vite dev server starts at http://localhost:5173. Browser shows "NYC Subway Quiz".

- [ ] **Step 11: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript project"
```

---

## Task 2: Shared Types and Line Colors

**Files:**
- Create: `src/types.ts`
- Create: `src/data/lines.ts`

- [ ] **Step 1: Write `src/types.ts`**

```ts
export type LineId =
  | '1' | '2' | '3'
  | '4' | '5' | '6' | '6X'
  | '7' | '7X'
  | 'A' | 'C' | 'E'
  | 'B' | 'D' | 'F' | 'FX' | 'M'
  | 'G'
  | 'J' | 'Z'
  | 'L'
  | 'N' | 'Q' | 'R' | 'W'
  | 'S' | 'SIR'

export interface Stop {
  id: string
  name: string
  aliases: string[]
  coordinates: [number, number]  // [lng, lat]
  lines: LineId[]
}

export interface Toast {
  id: string
  stop: Stop
}

export type MapStyleId = 'streets' | 'schematic'
```

- [ ] **Step 2: Write `src/data/lines.ts`**

```ts
import type { LineId } from '../types'

export const LINE_COLORS: Record<LineId, string> = {
  '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
  '4': '#00933C', '5': '#00933C', '6': '#00933C', '6X': '#00933C',
  '7': '#B933AD', '7X': '#B933AD',
  'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
  'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'FX': '#FF6319', 'M': '#FF6319',
  'G': '#6CBE45',
  'J': '#996633', 'Z': '#996633',
  'L': '#A7A9AC',
  'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
  'S': '#808183', 'SIR': '#0039A6',
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types.ts src/data/lines.ts
git commit -m "feat: add shared types and MTA line colors"
```

---

## Task 3: Aliases

**Files:**
- Create: `src/data/aliases.ts`

- [ ] **Step 1: Write `src/data/aliases.ts`**

Maps official MTA stop names to accepted common alternatives. This list is intentionally non-exhaustive — it covers the most confusing cases where the official name has a street address suffix.

```ts
// Maps official MTA stop name → accepted common alternatives
export const ALIASES: Record<string, string[]> = {
  'Times Square-42 St':                  ['Times Square', 'Times Sq', '42nd St'],
  'Atlantic Av-Barclays Ctr':            ['Atlantic Ave', 'Atlantic Av', 'Atlantic', 'Barclays'],
  'Jay St-MetroTech':                    ['Jay St', 'Jay Street', 'MetroTech'],
  'Grand Central-42 St':                 ['Grand Central', 'Grand Central Station'],
  '34 St-Penn Station':                  ['Penn Station', 'Penn', '34th St Penn'],
  '34 St-Herald Sq':                     ['Herald Square', 'Herald Sq', '34 St Herald'],
  '14 St-Union Sq':                      ['Union Square', 'Union Sq', '14 St Union'],
  'Columbus Circle-59 St':               ['Columbus Circle', '59 St Columbus'],
  '59 St-Columbus Circle':               ['Columbus Circle', '59th St'],
  '68 St-Hunter College':                ['68 St', 'Hunter College'],
  'Fulton St':                           ['Fulton Street', 'Fulton'],
  '42 St-Bryant Park':                   ['Bryant Park', '42 St Bryant'],
  'Whitehall St-South Ferry':            ['Whitehall St', 'South Ferry', 'Whitehall'],
  'Chambers St':                         ['Chambers Street'],
  'Cortlandt St':                        ['Cortlandt Street', 'WTC Cortlandt'],
  'World Trade Center':                  ['WTC', 'World Trade Ctr'],
  'Delancey St-Essex St':                ['Delancey St', 'Essex St', 'Delancey Essex'],
  'Broadway-Lafayette St':               ['Broadway Lafayette', 'Lafayette St'],
  'Myrtle-Willoughby Avs':               ['Myrtle Ave', 'Willoughby Ave'],
  'Bedford-Nostrand Avs':                ['Bedford Ave', 'Nostrand Ave'],
  'Clinton-Washington Avs':              ['Clinton Ave', 'Washington Ave'],
  'Sutter Av-Rutland Rd':                ['Sutter Ave', 'Rutland Rd'],
  'Flatbush Av-Brooklyn College':        ['Flatbush Ave', 'Flatbush', 'Brooklyn College'],
  'Coney Island-Stillwell Av':           ['Coney Island', 'Stillwell Ave'],
  'Far Rockaway-Mott Av':                ['Far Rockaway', 'Mott Ave'],
  'Jamaica-179 St':                      ['Jamaica', '179 St'],
  'Jamaica Center-Parsons/Archer':       ['Jamaica Center', 'Parsons', 'Archer'],
  'Howard Beach-JFK Airport':            ['Howard Beach', 'JFK Airport', 'JFK'],
  'Flushing-Main St':                    ['Flushing', 'Main St Flushing'],
  'Jackson Heights-Roosevelt Av':        ['Jackson Heights', 'Roosevelt Ave'],
  'Forest Hills-71 Av':                  ['Forest Hills', '71 Ave'],
  'Kew Gardens-Union Tpke':              ['Kew Gardens', 'Union Turnpike'],
  'Sutphin Blvd-Archer Av-JFK Airport':  ['Sutphin Blvd', 'Archer Ave', 'JFK Airport'],
  'Eastern Pkwy-Brooklyn Museum':        ['Eastern Pkwy', 'Brooklyn Museum'],
  'Crown Heights-Utica Av':              ['Crown Heights', 'Utica Ave'],
  '161 St-Yankee Stadium':               ['Yankee Stadium', '161 St'],
  '149 St-Grand Concourse':              ['149 St', 'Grand Concourse'],
  '125 St':                              ['125th St', 'Harlem 125'],
  'Christopher St-Sheridan Sq':          ['Christopher St', 'Sheridan Square'],
  'Court Sq-23 St':                      ['Court Square', 'Court Sq'],
  'Long Island City-Court Sq':           ['Long Island City', 'LIC'],
  'Queensboro Plaza':                    ['Queens Plaza', 'Queensboro'],
  'Bay Ridge-95 St':                     ['Bay Ridge', '95 St'],
  'Smith-9 Sts':                         ['Smith 9th St', 'Smith St'],
  '15 St-Prospect Park':                 ['15 St Prospect Park', 'Prospect Park 15'],
  'Hoyt-Schermerhorn Sts':               ['Hoyt Schermerhorn', 'Hoyt St'],
  '5 Av/59 St':                          ['5th Ave 59 St', 'Fifth Ave 59 St'],
  'Lexington Av/59 St':                  ['Lexington Ave 59 St', '59 St Lex'],
  'Lexington Av/63 St':                  ['Lexington Ave 63 St', '63 St Lex'],
  '21 St-Queensbridge':                  ['21 St Queensbridge', 'Queensbridge'],
  'Canarsie-Rockaway Pkwy':              ['Canarsie', 'Rockaway Pkwy'],
  'Ozone Park-Lefferts Blvd':            ['Ozone Park', 'Lefferts Blvd'],
  'Fort Hamilton Pkwy':                  ['Fort Hamilton'],
  'Kings Hwy':                           ['Kings Highway'],
  'Bay Pkwy':                            ['Bay Parkway'],
  'New Utrecht Av':                      ['New Utrecht Ave'],
  'Aqueduct-North Conduit Av':           ['Aqueduct', 'North Conduit'],
  'Rockaway Av':                         ['Rockaway Ave'],
  'Pennsylvania Av':                     ['Pennsylvania Ave'],
  'Liberty Av':                          ['Liberty Ave'],
  'Van Siclen Av':                       ['Van Siclen Ave'],
  'New Lots Av':                         ['New Lots Ave'],
  'Euclid Av':                           ['Euclid Ave'],
  'Shepherd Av':                         ['Shepherd Ave'],
  'Lefferts Blvd':                       ['Lefferts Boulevard'],
  'Classon Av':                          ['Classon Ave'],
  'Myrtle Av':                           ['Myrtle Ave'],
  'Wilson Av':                           ['Wilson Ave'],
  'Norwood Av':                          ['Norwood Ave'],
  'Cleveland St':                        ['Cleveland Street'],
  'Cypress Hills':                       ['Cypress Hills'],
  'Bushwick Av-Aberdeen St':             ['Bushwick Ave', 'Aberdeen St'],
  'Kosciuszko St':                       ['Kosciuszko Street'],
  'Gates Av':                            ['Gates Ave'],
  'Halsey St':                           ['Halsey Street'],
  'Parkside Av':                         ['Parkside Ave'],
  'Church Av':                           ['Church Ave'],
  'Beverley Rd':                         ['Beverly Rd', 'Beverley Road'],
  'Cortelyou Rd':                        ['Cortelyou Road'],
  'Newkirk Av':                          ['Newkirk Ave'],
  'Ditmas Av':                           ['Ditmas Ave'],
  'Bath Av':                             ['Bath Ave'],
  'Bay Ridge Av':                        ['Bay Ridge Ave'],
  'Eastern Pkwy':                        ['Eastern Parkway'],
  'Woodhaven Blvd':                      ['Woodhaven Boulevard'],
  '86 St':                               ['86th St', '86th Street'],
  '96 St':                               ['96th St', '96th Street'],
  '72 St':                               ['72nd St', '72nd Street'],
  '110 St':                              ['110th St', 'Cathedral Pkwy'],
  '116 St':                              ['116th St'],
  '135 St':                              ['135th St'],
  '145 St':                              ['145th St'],
  '168 St':                              ['168th St', 'Washington Heights'],
  '175 St':                              ['175th St'],
  '181 St':                              ['181st St'],
  '190 St':                              ['190th St'],
  '207 St':                              ['207th St'],
  '215 St':                              ['215th St'],
  '225 St':                              ['225th St'],
  '231 St':                              ['231st St'],
  '238 St':                              ['238th St'],
  '242 St':                              ['242nd St'],
  '14 St':                               ['14th St'],
  '23 St':                               ['23rd St'],
  '28 St':                               ['28th St'],
  '33 St':                               ['33rd St'],
  '50 St':                               ['50th St'],
  '51 St':                               ['51st St'],
  '55 St':                               ['55th St'],
  '62 St':                               ['62nd St'],
  '71 St':                               ['71st St'],
  '77 St':                               ['77th St'],
  '79 St':                               ['79th St'],
  '103 St':                              ['103rd St'],
  '9 Av':                                ['9th Ave', '9th Av'],
  '18 Av':                               ['18th Ave'],
  '20 Av':                               ['20th Ave'],
  '18 St':                               ['18th St'],
  '4 Av-9 St':                           ['4th Ave 9th St', '4 Ave 9 St'],
  'Wall St':                             ['Wall Street'],
  'Broad St':                            ['Broad Street'],
  'Canal St':                            ['Canal Street'],
  'Spring St':                           ['Spring Street'],
  'Houston St':                          ['Houston Street'],
  'Bleecker St':                         ['Bleecker Street'],
  'Astor Pl':                            ['Astor Place'],
  'Prince St':                           ['Prince Street'],
  'Grand St':                            ['Grand Street'],
  'High St':                             ['High Street'],
  'York St':                             ['York Street'],
  'Carroll St':                          ['Carroll Street'],
  'Court St':                            ['Court Street'],
  'Bergen St':                           ['Bergen Street'],
  'Nassau St':                           ['Nassau Street'],
  'Rector St':                           ['Rector Street'],
  'Junius St':                           ['Junius Street'],
  'Crystal St':                          ['Crystal Street'],
  'East Broadway':                       ['East Broadway'],
  'Broadway Junction':                   ['Broadway Junction'],
  'Atlantic Av':                         ['Atlantic Ave'],
  'Prospect Park':                       ['Prospect Park'],
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/aliases.ts
git commit -m "feat: add hand-curated stop name aliases"
```

---

## Task 4: GTFS Parser

**Files:**
- Create: `scripts/parse-gtfs.ts`
- Create: `src/data/stops.json` (generated — run the script)

- [ ] **Step 1: Create `scripts/parse-gtfs.ts`**

```ts
import AdmZip from 'adm-zip'
import Papa from 'papaparse'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import { ALIASES } from '../src/data/aliases'

const GTFS_URL = 'http://web.mta.info/developers/data/nyct/subway/google_transit.zip'
const ZIP_PATH = '/tmp/mta-gtfs.zip'
const OUT_PATH = join(import.meta.dirname, '../src/data/stops.json')

console.log('Downloading MTA GTFS...')
execSync(`curl -L --max-time 60 -o ${ZIP_PATH} "${GTFS_URL}"`)
console.log('Download complete.')

const zip = new AdmZip(ZIP_PATH)

function parseCSV<T extends object>(filename: string): T[] {
  const content = zip.readAsText(filename)
  const result = Papa.parse<T>(content, { header: true, skipEmptyLines: true })
  if (result.errors.length > 0) {
    console.warn(`Warnings parsing ${filename}:`, result.errors.slice(0, 3))
  }
  return result.data
}

interface GtfsStop {
  stop_id: string
  stop_name: string
  stop_lat: string
  stop_lon: string
  location_type: string
  parent_station: string
}

interface GtfsRoute {
  route_id: string
  route_short_name: string
}

interface GtfsTrip {
  trip_id: string
  route_id: string
}

interface GtfsStopTime {
  trip_id: string
  stop_id: string
}

console.log('Parsing routes...')
const routes = parseCSV<GtfsRoute>('routes.txt')
const routeShortName = new Map(routes.map(r => [r.route_id, r.route_short_name]))

console.log('Parsing trips...')
const trips = parseCSV<GtfsTrip>('trips.txt')
const tripToRoute = new Map(trips.map(t => [t.trip_id, t.route_id]))

console.log('Parsing stops...')
const allStops = parseCSV<GtfsStop>('stops.txt')

const parents = allStops.filter(s => s.location_type === '1')
const childToParent = new Map<string, string>()
for (const stop of allStops) {
  if (stop.parent_station) childToParent.set(stop.stop_id, stop.parent_station)
}

console.log('Parsing stop_times (may take 30-60s)...')
const stopTimes = parseCSV<GtfsStopTime>('stop_times.txt')

const stationLines = new Map<string, Set<string>>()
for (const st of stopTimes) {
  const parentId = childToParent.get(st.stop_id) ?? st.stop_id
  const routeId = tripToRoute.get(st.trip_id)
  if (!routeId) continue
  const lineName = routeShortName.get(routeId)
  if (!lineName) continue
  if (!stationLines.has(parentId)) stationLines.set(parentId, new Set())
  stationLines.get(parentId)!.add(lineName)
}

const output = parents.map(stop => ({
  id: stop.stop_id,
  name: stop.stop_name,
  aliases: ALIASES[stop.stop_name] ?? [],
  coordinates: [parseFloat(stop.stop_lon), parseFloat(stop.stop_lat)],
  lines: Array.from(stationLines.get(stop.stop_id) ?? []).sort(),
}))

writeFileSync(OUT_PATH, JSON.stringify(output, null, 2))
console.log(`✓ Wrote ${output.length} stops to ${OUT_PATH}`)
```

- [ ] **Step 2: Run the parser**

```bash
npm run parse-gtfs
```

Expected output (stop_times parsing takes ~30-60s):
```
Downloading MTA GTFS...
Download complete.
Parsing routes...
Parsing trips...
Parsing stops...
Parsing stop_times (may take 30-60s)...
✓ Wrote 472 stops to .../src/data/stops.json
```

If the MTA GTFS URL is no longer valid, check https://new.mta.info/developers for the current GTFS download link.

- [ ] **Step 3: Spot-check the output**

```bash
node -e "
const stops = require('./src/data/stops.json');
console.log('Total stops:', stops.length);
const timesq = stops.find(s => s.name.includes('Times Square'));
console.log('Times Square:', JSON.stringify(timesq, null, 2));
"
```

Expected: Times Square-42 St with lines `["1","2","3","A","C","E","N","Q","R","W"]` (or similar — exact lines depend on service).

- [ ] **Step 4: Remove `stops.json` from `.gitignore` and commit everything**

Edit `.gitignore` to remove the `/src/data/stops.json` line, then:

```bash
git add scripts/parse-gtfs.ts src/data/stops.json
git commit -m "feat: add GTFS parser and generated stops data"
```

---

## Task 5: Matching Logic

**Files:**
- Create: `src/lib/matching.ts`
- Create: `src/lib/matching.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/matching.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { normalize, findMatch } from './matching'
import type { Stop } from '../types'

const makeStop = (name: string, aliases: string[] = [], lines = ['1'] as Stop['lines']): Stop => ({
  id: `stop-${name}`,
  name,
  aliases,
  coordinates: [-74, 40.7],
  lines,
})

describe('normalize', () => {
  it('lowercases input', () => {
    expect(normalize('Times Square')).toBe('times square')
  })

  it('trims whitespace', () => {
    expect(normalize('  fulton st  ')).toBe('fulton st')
  })

  it('strips punctuation', () => {
    expect(normalize('Jay St-MetroTech')).toBe('jay st metatrotech')
  })

  it('strips hyphens and slashes', () => {
    expect(normalize('A/C/E')).toBe('a c e')
    expect(normalize('Smith-9 Sts')).toBe('smith 9 sts')
  })
})

describe('findMatch', () => {
  const timesSquare = makeStop('Times Square-42 St', ['Times Square', 'Times Sq'])
  const fulton = makeStop('Fulton St', ['Fulton Street', 'Fulton'])
  const stops = [timesSquare, fulton]

  it('matches exact official name', () => {
    const guessed = new Set<string>()
    expect(findMatch('Times Square-42 St', stops, guessed)).toBe(timesSquare)
  })

  it('matches an alias', () => {
    const guessed = new Set<string>()
    expect(findMatch('Times Square', stops, guessed)).toBe(timesSquare)
  })

  it('matches case-insensitively', () => {
    const guessed = new Set<string>()
    expect(findMatch('times square', stops, guessed)).toBe(timesSquare)
  })

  it('matches with extra whitespace', () => {
    const guessed = new Set<string>()
    expect(findMatch('  Fulton St  ', stops, guessed)).toBe(fulton)
  })

  it('does not match a stop that is already guessed', () => {
    const guessed = new Set(['stop-Times Square-42 St'])
    expect(findMatch('Times Square', stops, guessed)).toBeNull()
  })

  it('returns null for no match', () => {
    const guessed = new Set<string>()
    expect(findMatch('Grand Central', stops, guessed)).toBeNull()
  })

  it('returns null for partial match', () => {
    const guessed = new Set<string>()
    expect(findMatch('Times', stops, guessed)).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- src/lib/matching.test.ts
```

Expected: `FAIL` — `Cannot find module './matching'`

- [ ] **Step 3: Implement `src/lib/matching.ts`**

```ts
import type { Stop } from '../types'

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[-/]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function findMatch(
  input: string,
  stops: Stop[],
  guessed: Set<string>,
): Stop | null {
  const normalized = normalize(input)
  if (!normalized) return null

  return stops.find(stop => {
    if (guessed.has(stop.id)) return false
    return [stop.name, ...stop.aliases].some(
      name => normalize(name) === normalized
    )
  }) ?? null
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:run -- src/lib/matching.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/matching.ts src/lib/matching.test.ts
git commit -m "feat: add stop name matching logic with tests"
```

---

## Task 6: useQuiz Hook

**Files:**
- Create: `src/hooks/useQuiz.ts`
- Create: `src/hooks/useQuiz.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useQuiz.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuiz } from './useQuiz'
import type { Stop } from '../types'

const stop1: Stop = {
  id: '1',
  name: 'Times Square-42 St',
  aliases: ['Times Square'],
  coordinates: [-73.987, 40.755],
  lines: ['1', '2', '3'],
}

const stop2: Stop = {
  id: '2',
  name: 'Fulton St',
  aliases: ['Fulton Street'],
  coordinates: [-74.009, 40.709],
  lines: ['A', 'C'],
}

const stops = [stop1, stop2]

describe('useQuiz', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts with no guessed stops', () => {
    const { result } = renderHook(() => useQuiz(stops))
    expect(result.current.guessed.size).toBe(0)
  })

  it('starts with no toasts', () => {
    const { result } = renderHook(() => useQuiz(stops))
    expect(result.current.toasts).toHaveLength(0)
  })

  it('onInput with correct name adds stop to guessed', () => {
    const { result } = renderHook(() => useQuiz(stops))
    act(() => result.current.onInput('Times Square'))
    expect(result.current.guessed.has('1')).toBe(true)
  })

  it('onInput with correct name adds a toast', () => {
    const { result } = renderHook(() => useQuiz(stops))
    act(() => result.current.onInput('Times Square'))
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].stop).toBe(stop1)
  })

  it('toast auto-dismisses after 2 seconds', () => {
    const { result } = renderHook(() => useQuiz(stops))
    act(() => result.current.onInput('Times Square'))
    expect(result.current.toasts).toHaveLength(1)
    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.toasts).toHaveLength(0)
  })

  it('onInput with wrong name does not change state', () => {
    const { result } = renderHook(() => useQuiz(stops))
    act(() => result.current.onInput('Grand Central'))
    expect(result.current.guessed.size).toBe(0)
    expect(result.current.toasts).toHaveLength(0)
  })

  it('cannot guess the same stop twice', () => {
    const { result } = renderHook(() => useQuiz(stops))
    act(() => result.current.onInput('Times Square'))
    act(() => result.current.onInput('Times Square'))
    expect(result.current.guessed.size).toBe(1)
    expect(result.current.toasts).toHaveLength(1)
  })

  it('returns correct guessedCount', () => {
    const { result } = renderHook(() => useQuiz(stops))
    expect(result.current.guessedCount).toBe(0)
    act(() => result.current.onInput('Times Square'))
    expect(result.current.guessedCount).toBe(1)
    act(() => result.current.onInput('Fulton St'))
    expect(result.current.guessedCount).toBe(2)
  })

  it('returns correct totalCount', () => {
    const { result } = renderHook(() => useQuiz(stops))
    expect(result.current.totalCount).toBe(2)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- src/hooks/useQuiz.test.ts
```

Expected: `FAIL` — `Cannot find module './useQuiz'`

- [ ] **Step 3: Implement `src/hooks/useQuiz.ts`**

```ts
import { useState, useCallback } from 'react'
import { findMatch } from '../lib/matching'
import type { Stop, Toast } from '../types'

export function useQuiz(stops: Stop[]) {
  const [guessed, setGuessed] = useState<Set<string>>(new Set())
  const [toasts, setToasts] = useState<Toast[]>([])

  const onInput = useCallback((input: string) => {
    const match = findMatch(input, stops, guessed)
    if (!match) return

    setGuessed(prev => new Set([...prev, match.id]))

    const toast: Toast = { id: `${match.id}-${Date.now()}`, stop: match }
    setToasts(prev => [...prev, toast])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 2000)
  }, [stops, guessed])

  return {
    guessed,
    toasts,
    onInput,
    guessedCount: guessed.size,
    totalCount: stops.length,
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:run -- src/hooks/useQuiz.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useQuiz.ts src/hooks/useQuiz.test.ts
git commit -m "feat: add useQuiz hook with tests"
```

---

## Task 7: Header Component

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/Header.test.tsx`
- Create: `src/components/Header.css`

- [ ] **Step 1: Write the failing tests**

Create `src/components/Header.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'

describe('Header', () => {
  it('displays the correct count', () => {
    render(<Header guessedCount={3} totalCount={472} mapStyle="streets" onToggleStyle={vi.fn()} />)
    expect(screen.getByText('3 / 472')).toBeInTheDocument()
  })

  it('shows "Streets" toggle button when on streets style', () => {
    render(<Header guessedCount={0} totalCount={472} mapStyle="streets" onToggleStyle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /map style/i })).toBeInTheDocument()
  })

  it('calls onToggleStyle when toggle button is clicked', async () => {
    const onToggle = vi.fn()
    render(<Header guessedCount={0} totalCount={472} mapStyle="streets" onToggleStyle={onToggle} />)
    await userEvent.click(screen.getByRole('button', { name: /map style/i }))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
```

Install userEvent:

```bash
npm install --save-dev @testing-library/user-event
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- src/components/Header.test.tsx
```

Expected: `FAIL` — `Cannot find module './Header'`

- [ ] **Step 3: Implement `src/components/Header.tsx`**

```tsx
import type { MapStyleId } from '../types'
import './Header.css'

interface Props {
  guessedCount: number
  totalCount: number
  mapStyle: MapStyleId
  onToggleStyle: () => void
}

export function Header({ guessedCount, totalCount, mapStyle, onToggleStyle }: Props) {
  return (
    <header className="header">
      <span className="header-title">Name the Subway Stops</span>
      <span className="header-counter">{guessedCount} / {totalCount}</span>
      <button className="header-toggle" onClick={onToggleStyle} aria-label="Map style toggle">
        {mapStyle === 'streets' ? 'Schematic' : 'Streets'}
      </button>
    </header>
  )
}
```

- [ ] **Step 4: Create `src/components/Header.css`**

```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  height: 44px;
  background: rgba(15, 20, 40, 0.92);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  color: #fff;
  font-size: 14px;
}

.header-title {
  font-weight: 600;
  flex: 1;
}

.header-counter {
  font-variant-numeric: tabular-nums;
  color: #a0aec0;
}

.header-toggle {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
}

.header-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm run test:run -- src/components/Header.test.tsx
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/Header.tsx src/components/Header.test.tsx src/components/Header.css
git commit -m "feat: add Header component with tests"
```

---

## Task 8: QuizInput Component

**Files:**
- Create: `src/components/QuizInput.tsx`
- Create: `src/components/QuizInput.test.tsx`
- Create: `src/components/QuizInput.css`

- [ ] **Step 1: Write the failing tests**

Create `src/components/QuizInput.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizInput } from './QuizInput'

describe('QuizInput', () => {
  it('renders a text input', () => {
    render(<QuizInput onInput={vi.fn()} />)
    expect(screen.getByPlaceholderText(/type a stop name/i)).toBeInTheDocument()
  })

  it('calls onInput with the current value on each keystroke', async () => {
    const onInput = vi.fn()
    render(<QuizInput onInput={onInput} />)
    const input = screen.getByPlaceholderText(/type a stop name/i)
    await userEvent.type(input, 'Fu')
    expect(onInput).toHaveBeenCalledWith('F')
    expect(onInput).toHaveBeenCalledWith('Fu')
  })

  it('clears after a successful match signal (value reset externally)', async () => {
    const { rerender } = render(<QuizInput onInput={vi.fn()} />)
    const input = screen.getByPlaceholderText(/type a stop name/i) as HTMLInputElement
    await userEvent.type(input, 'Fulton')
    expect(input.value).toBe('Fulton')
    // Parent clears by passing resetKey
    rerender(<QuizInput onInput={vi.fn()} resetKey={1} />)
    expect(input.value).toBe('')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- src/components/QuizInput.test.tsx
```

Expected: `FAIL` — `Cannot find module './QuizInput'`

- [ ] **Step 3: Implement `src/components/QuizInput.tsx`**

The component clears itself when `resetKey` changes — the parent bumps it on each successful match.

```tsx
import { useState, useEffect, useRef } from 'react'
import './QuizInput.css'

interface Props {
  onInput: (value: string) => void
  resetKey?: number
}

export function QuizInput({ onInput, resetKey }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue('')
    inputRef.current?.focus()
  }, [resetKey])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setValue(newValue)
    onInput(newValue)
  }

  return (
    <div className="quiz-input-container">
      <input
        ref={inputRef}
        className="quiz-input"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type a stop name..."
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        autoFocus
      />
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/QuizInput.css`**

```css
.quiz-input-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: min(420px, calc(100vw - 32px));
}

.quiz-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  background: rgba(15, 20, 40, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #fff;
  outline: none;
}

.quiz-input::placeholder {
  color: #4a5568;
}

.quiz-input:focus {
  border-color: rgba(255, 255, 255, 0.35);
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm run test:run -- src/components/QuizInput.test.tsx
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/QuizInput.tsx src/components/QuizInput.test.tsx src/components/QuizInput.css
git commit -m "feat: add QuizInput component with tests"
```

---

## Task 9: ToastStack Component

**Files:**
- Create: `src/components/ToastStack.tsx`
- Create: `src/components/ToastStack.test.tsx`
- Create: `src/components/ToastStack.css`

- [ ] **Step 1: Write the failing tests**

Create `src/components/ToastStack.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToastStack } from './ToastStack'
import type { Toast, Stop } from '../types'

const makeToast = (name: string, lines: Stop['lines']): Toast => ({
  id: `toast-${name}`,
  stop: {
    id: `stop-${name}`,
    name,
    aliases: [],
    coordinates: [-74, 40.7],
    lines,
  },
})

describe('ToastStack', () => {
  it('renders nothing when toasts array is empty', () => {
    const { container } = render(<ToastStack toasts={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the stop name in the toast', () => {
    const toasts = [makeToast('Fulton St', ['A', 'C'])]
    render(<ToastStack toasts={toasts} />)
    expect(screen.getByText('Fulton St')).toBeInTheDocument()
  })

  it('renders a dot for each line', () => {
    const toasts = [makeToast('Times Square-42 St', ['1', '2', '3', 'A', 'C', 'E', 'N', 'Q', 'R', 'W'])]
    render(<ToastStack toasts={toasts} />)
    const dots = screen.getAllByTestId('line-dot')
    expect(dots).toHaveLength(10)
  })

  it('renders multiple toasts', () => {
    const toasts = [makeToast('Fulton St', ['A']), makeToast('Wall St', ['4', '5'])]
    render(<ToastStack toasts={toasts} />)
    expect(screen.getByText('Fulton St')).toBeInTheDocument()
    expect(screen.getByText('Wall St')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- src/components/ToastStack.test.tsx
```

Expected: `FAIL` — `Cannot find module './ToastStack'`

- [ ] **Step 3: Implement `src/components/ToastStack.tsx`**

```tsx
import { LINE_COLORS } from '../data/lines'
import type { Toast } from '../types'
import './ToastStack.css'

interface Props {
  toasts: Toast[]
}

export function ToastStack({ toasts }: Props) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-stack">
      {toasts.map(toast => (
        <div key={toast.id} className="toast">
          <span className="toast-name">{toast.stop.name}</span>
          <span className="toast-lines">
            {toast.stop.lines.map(line => (
              <span
                key={line}
                className="toast-line-dot"
                data-testid="line-dot"
                style={{ background: LINE_COLORS[line] }}
                title={line}
              />
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/ToastStack.css`**

```css
.toast-stack {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  pointer-events: none;
}

.toast {
  background: rgba(15, 20, 40, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: toast-in 0.15s ease-out;
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.toast-name {
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.toast-lines {
  display: flex;
  gap: 4px;
}

.toast-line-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm run test:run -- src/components/ToastStack.test.tsx
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/ToastStack.tsx src/components/ToastStack.test.tsx src/components/ToastStack.css
git commit -m "feat: add ToastStack component with tests"
```

---

## Task 10: Map Styles

**Files:**
- Create: `src/styles/streets-style.ts`
- Create: `src/styles/schematic-style.ts`

- [ ] **Step 1: Create `src/styles/streets-style.ts`**

Uses OpenFreeMap's free "Liberty" style — OpenStreetMap-based, no API key required.

```ts
export const STREETS_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'
```

- [ ] **Step 2: Create `src/styles/schematic-style.ts`**

A minimal transit-focused style: light background, muted geography, large clear labels. Approximates the clean schematic feel of the 2025 MTA redesign.

```ts
import type { StyleSpecification } from 'maplibre-gl'

export const SCHEMATIC_STYLE: StyleSpecification = {
  version: 8,
  name: 'Schematic',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#f5f5f2' },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'fill-color': '#c8d8e8' },
    },
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['==', 'class', 'park'],
      paint: { 'fill-color': '#e5efe0' },
    },
    {
      id: 'roads-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service', 'track'],
      paint: { 'line-color': '#e0ddd8', 'line-width': 1 },
    },
    {
      id: 'roads-major',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'primary', 'secondary', 'tertiary', 'trunk'],
      paint: { 'line-color': '#d0ccc4', 'line-width': 1.5 },
    },
    {
      id: 'roads-motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      paint: { 'line-color': '#c0bbb0', 'line-width': 2 },
    },
    {
      id: 'place-labels',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['in', 'class', 'neighbourhood', 'suburb'],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 11,
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.1,
      },
      paint: {
        'text-color': '#9a9690',
        'text-halo-color': '#f5f5f2',
        'text-halo-width': 1,
      },
    },
  ],
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/streets-style.ts src/styles/schematic-style.ts
git commit -m "feat: add map style configurations"
```

---

## Task 11: StopMarker Component

**Files:**
- Create: `src/components/StopMarker.tsx`
- Create: `src/components/StopMarker.test.tsx`
- Create: `src/components/StopMarker.css`

- [ ] **Step 1: Mock maplibre-gl for tests**

Create `src/test-mocks/react-map-gl.tsx`:

```tsx
import type { ReactNode } from 'react'

export function Map({ children }: { children?: ReactNode }) {
  return <div data-testid="map">{children}</div>
}

export function Marker({ children, longitude, latitude }: {
  children?: ReactNode
  longitude: number
  latitude: number
}) {
  return (
    <div data-testid="marker" data-lng={longitude} data-lat={latitude}>
      {children}
    </div>
  )
}
```

Add to `vite.config.ts` inside the `test` object:

```ts
alias: {
  'react-map-gl': '/src/test-mocks/react-map-gl.tsx',
},
```

- [ ] **Step 2: Write the failing tests**

Create `src/components/StopMarker.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StopMarker } from './StopMarker'
import type { Stop } from '../types'

const stop: Stop = {
  id: 'test-stop',
  name: 'Times Square-42 St',
  aliases: [],
  coordinates: [-73.987, 40.755],
  lines: ['1', '2', '3', 'A', 'C', 'E'],
}

describe('StopMarker', () => {
  it('renders when named=false as a small grey dot with no label', () => {
    render(<StopMarker stop={stop} named={false} />)
    expect(screen.queryByText('Times Square-42 St')).not.toBeInTheDocument()
    expect(screen.getByTestId('stop-dot-unnamed')).toBeInTheDocument()
  })

  it('renders when named=true with the stop name label', () => {
    render(<StopMarker stop={stop} named={true} />)
    expect(screen.getByText('Times Square-42 St')).toBeInTheDocument()
  })

  it('renders one colored dot per line when named=true', () => {
    render(<StopMarker stop={stop} named={true} />)
    const dots = screen.getAllByTestId('stop-line-dot')
    expect(dots).toHaveLength(6)
  })
})
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
npm run test:run -- src/components/StopMarker.test.tsx
```

Expected: `FAIL` — `Cannot find module './StopMarker'`

- [ ] **Step 4: Implement `src/components/StopMarker.tsx`**

```tsx
import { Marker } from 'react-map-gl/maplibre'
import { LINE_COLORS } from '../data/lines'
import type { Stop } from '../types'
import './StopMarker.css'

interface Props {
  stop: Stop
  named: boolean
}

export function StopMarker({ stop, named }: Props) {
  return (
    <Marker longitude={stop.coordinates[0]} latitude={stop.coordinates[1]} anchor="center">
      {named ? (
        <div className="stop-named">
          <div className="stop-dots">
            {stop.lines.map(line => (
              <span
                key={line}
                className="stop-dot-named"
                data-testid="stop-line-dot"
                style={{ background: LINE_COLORS[line] }}
              />
            ))}
          </div>
          <span className="stop-label">{stop.name}</span>
        </div>
      ) : (
        <div className="stop-dot-unnamed" data-testid="stop-dot-unnamed" />
      )}
    </Marker>
  )
}
```

- [ ] **Step 5: Create `src/components/StopMarker.css`**

```css
.stop-dot-unnamed {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4a5568;
  cursor: default;
}

.stop-named {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  animation: pop-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop-in {
  from { transform: scale(0.4); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.stop-dots {
  display: flex;
  gap: 2px;
}

.stop-dot-named {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.stop-label {
  font-size: 9px;
  font-weight: 600;
  color: #1a202c;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.85);
  padding: 1px 3px;
  border-radius: 2px;
  pointer-events: none;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
npm run test:run -- src/components/StopMarker.test.tsx
```

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/StopMarker.tsx src/components/StopMarker.test.tsx src/components/StopMarker.css src/test-mocks/react-map-gl.tsx vite.config.ts
git commit -m "feat: add StopMarker component with tests"
```

---

## Task 12: Map Component

**Files:**
- Create: `src/components/Map.tsx`
- Create: `src/components/Map.test.tsx`
- Create: `src/components/Map.css`

- [ ] **Step 1: Write the failing tests**

Create `src/components/Map.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuizMap } from './Map'
import type { Stop } from '../types'

const stops: Stop[] = [
  {
    id: '1',
    name: 'Fulton St',
    aliases: [],
    coordinates: [-74.009, 40.709],
    lines: ['A', 'C'],
  },
  {
    id: '2',
    name: 'Wall St',
    aliases: [],
    coordinates: [-74.011, 40.707],
    lines: ['4', '5'],
  },
]

describe('QuizMap', () => {
  it('renders a marker for every stop', () => {
    render(
      <QuizMap
        stops={stops}
        guessed={new Set()}
        mapStyle="streets"
      />
    )
    expect(screen.getAllByTestId('marker')).toHaveLength(2)
  })

  it('renders named markers for guessed stops', () => {
    const guessed = new Set(['1'])
    render(<QuizMap stops={stops} guessed={guessed} mapStyle="streets" />)
    expect(screen.getByText('Fulton St')).toBeInTheDocument()
    expect(screen.queryByText('Wall St')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- src/components/Map.test.tsx
```

Expected: `FAIL` — `Cannot find module './Map'`

- [ ] **Step 3: Implement `src/components/Map.tsx`**

```tsx
import { Map } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { StopMarker } from './StopMarker'
import { STREETS_STYLE_URL } from '../styles/streets-style'
import { SCHEMATIC_STYLE } from '../styles/schematic-style'
import type { Stop, MapStyleId } from '../types'
import './Map.css'

interface Props {
  stops: Stop[]
  guessed: Set<string>
  mapStyle: MapStyleId
}

const INITIAL_VIEW = {
  longitude: -73.98,
  latitude: 40.73,
  zoom: 11,
}

export function QuizMap({ stops, guessed, mapStyle }: Props) {
  const style = mapStyle === 'streets' ? STREETS_STYLE_URL : SCHEMATIC_STYLE

  return (
    <Map
      initialViewState={INITIAL_VIEW}
      style={{ width: '100%', height: '100%' }}
      mapStyle={style}
    >
      {stops.map(stop => (
        <StopMarker
          key={stop.id}
          stop={stop}
          named={guessed.has(stop.id)}
        />
      ))}
    </Map>
  )
}
```

- [ ] **Step 4: Create `src/components/Map.css`**

```css
.maplibregl-canvas {
  outline: none;
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm run test:run -- src/components/Map.test.tsx
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/Map.tsx src/components/Map.test.tsx src/components/Map.css
git commit -m "feat: add Map component with tests"
```

---

## Task 13: App Composition

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.css`

- [ ] **Step 1: Write `src/App.css`**

```css
.app {
  position: relative;
  width: 100vw;
  height: 100vh;
}
```

- [ ] **Step 2: Rewrite `src/App.tsx`**

```tsx
import { useState, useCallback } from 'react'
import { useQuiz } from './hooks/useQuiz'
import { Header } from './components/Header'
import { QuizInput } from './components/QuizInput'
import { ToastStack } from './components/ToastStack'
import { QuizMap } from './components/Map'
import stopsData from './data/stops.json'
import type { Stop, MapStyleId } from './types'
import './App.css'

const stops = stopsData as Stop[]

export default function App() {
  const { guessed, toasts, onInput, guessedCount, totalCount } = useQuiz(stops)
  const [mapStyle, setMapStyle] = useState<MapStyleId>('streets')
  const [resetKey, setResetKey] = useState(0)

  const handleInput = useCallback((value: string) => {
    const prevCount = guessedCount
    onInput(value)
    // If a match was made (count will increase), bump resetKey to clear input
    // We check on next render via effect — instead use a ref approach:
    // Actually, onInput is synchronous within the same render batch.
    // We handle reset by checking if a new toast was added, which happens
    // in useQuiz. To keep App simple, we pass onMatch callback into useQuiz.
    // See step 3 below for the updated useQuiz signature.
    void prevCount
  }, [onInput, guessedCount])

  const handleToggleStyle = useCallback(() => {
    setMapStyle(prev => prev === 'streets' ? 'schematic' : 'streets')
  }, [])

  return (
    <div className="app">
      <QuizMap stops={stops} guessed={guessed} mapStyle={mapStyle} />
      <Header
        guessedCount={guessedCount}
        totalCount={totalCount}
        mapStyle={mapStyle}
        onToggleStyle={handleToggleStyle}
      />
      <ToastStack toasts={toasts} />
      <QuizInput onInput={onInput} resetKey={resetKey} />
    </div>
  )
}
```

Wait — `QuizInput` needs to be cleared when a match happens, but `onInput` in `useQuiz` handles matching internally. We need a way to signal success back to the input. Update `useQuiz` to accept an optional `onMatch` callback:

- [ ] **Step 3: Update `useQuiz` to accept `onMatch` callback**

Modify `src/hooks/useQuiz.ts` — add an optional `onMatch` parameter:

```ts
import { useState, useCallback } from 'react'
import { findMatch } from '../lib/matching'
import type { Stop, Toast } from '../types'

interface Options {
  onMatch?: (stop: Stop) => void
}

export function useQuiz(stops: Stop[], { onMatch }: Options = {}) {
  const [guessed, setGuessed] = useState<Set<string>>(new Set())
  const [toasts, setToasts] = useState<Toast[]>([])

  const onInput = useCallback((input: string) => {
    const match = findMatch(input, stops, guessed)
    if (!match) return

    setGuessed(prev => new Set([...prev, match.id]))

    const toast: Toast = { id: `${match.id}-${Date.now()}`, stop: match }
    setToasts(prev => [...prev, toast])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 2000)

    onMatch?.(match)
  }, [stops, guessed, onMatch])

  return {
    guessed,
    toasts,
    onInput,
    guessedCount: guessed.size,
    totalCount: stops.length,
  }
}
```

- [ ] **Step 4: Rewrite `src/App.tsx` cleanly**

```tsx
import { useState, useCallback } from 'react'
import { useQuiz } from './hooks/useQuiz'
import { Header } from './components/Header'
import { QuizInput } from './components/QuizInput'
import { ToastStack } from './components/ToastStack'
import { QuizMap } from './components/Map'
import stopsData from './data/stops.json'
import type { Stop, MapStyleId } from './types'
import './App.css'

const stops = stopsData as Stop[]

export default function App() {
  const [mapStyle, setMapStyle] = useState<MapStyleId>('streets')
  const [resetKey, setResetKey] = useState(0)

  const { guessed, toasts, onInput, guessedCount, totalCount } = useQuiz(stops, {
    onMatch: () => setResetKey(k => k + 1),
  })

  const handleToggleStyle = useCallback(() => {
    setMapStyle(prev => prev === 'streets' ? 'schematic' : 'streets')
  }, [])

  return (
    <div className="app">
      <QuizMap stops={stops} guessed={guessed} mapStyle={mapStyle} />
      <Header
        guessedCount={guessedCount}
        totalCount={totalCount}
        mapStyle={mapStyle}
        onToggleStyle={handleToggleStyle}
      />
      <ToastStack toasts={toasts} />
      <QuizInput onInput={onInput} resetKey={resetKey} />
    </div>
  )
}
```

- [ ] **Step 5: Run all tests to confirm nothing is broken**

```bash
npm run test:run
```

Expected: All tests pass.

- [ ] **Step 6: Start the dev server and verify the full app works**

```bash
npm run dev
```

Check:
- Map loads centered on NYC
- Subway stop dots are visible
- Type "Fulton St" → dot reveals, toast appears with line colors, input clears
- Type "Times Square" → reveals Times Square-42 St
- Counter increments with each correct answer
- Map style toggle button switches between geographic and schematic views

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/App.css src/hooks/useQuiz.ts
git commit -m "feat: compose full app and wire quiz state to all components"
```

---

## Task 14: GitHub Pages Deployment

**Files:**
- Modify: `package.json`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Add gh-pages package**

```bash
npm install --save-dev gh-pages
```

- [ ] **Step 2: Add deploy script to `package.json`**

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

- [ ] **Step 3: Create GitHub Actions workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

- [ ] **Step 4: Create GitHub repository**

```bash
gh repo create name-subway-stops --public --source=. --remote=origin --push
```

If `gh` CLI is not installed: go to https://github.com/new, create the repo, then:

```bash
git remote add origin https://github.com/<your-username>/name-subway-stops.git
git push -u origin main
```

- [ ] **Step 5: Enable GitHub Pages**

```bash
gh api repos/:owner/:repo/pages -X POST -f source='{"branch":"gh-pages","path":"/"}'
```

Or: go to the repo Settings → Pages → Source: "Deploy from branch" → branch: `gh-pages`.

- [ ] **Step 6: Verify deployment**

After the Actions workflow completes (~2-3 min):

Open `https://<your-username>.github.io/name-subway-stops/`

Expected: App loads, map renders, quiz is playable.

- [ ] **Step 7: Commit**

```bash
git add .github/workflows/deploy.yml package.json package-lock.json
git commit -m "feat: add GitHub Pages deployment workflow"
git push
```

---

## Self-Review Checklist

- [x] **Spec coverage:**
  - Type-to-reveal mechanic → Task 5 (matching) + Task 8 (QuizInput)
  - All ~472 stops → Task 4 (GTFS parser)
  - Untimed → no timer anywhere, by design
  - Geographic map default → Task 10 + 12 (streets style + Map)
  - Map style toggle → Task 10 (schematic style) + Task 7 (Header toggle) + Task 13 (App)
  - Common name matching → Task 3 (aliases) + Task 5 (matching logic)
  - Running counter → Task 7 (Header)
  - MTA-colored line dots per stop → Task 2 (LINE_COLORS) + Task 11 (StopMarker)
  - Toast notification on correct answer → Task 9 (ToastStack) + Task 6 (useQuiz)
  - GitHub Pages deployment → Task 14
- [x] **Placeholder scan:** No TBDs, TODOs, or vague steps found.
- [x] **Type consistency:** `Stop`, `Toast`, `MapStyleId`, `LineId` defined in Task 2 and used consistently. `useQuiz` returns `{ guessed, toasts, onInput, guessedCount, totalCount }` — matches App usage in Task 13. `onMatch` callback added in Task 13 and accounted for in the updated `useQuiz`.
