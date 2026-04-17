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

interface GtfsShape {
  shape_id: string
  shape_pt_lat: string
  shape_pt_lon: string
  shape_pt_sequence: string
}

interface GtfsStopTimeFull {
  trip_id: string
  stop_id: string
  stop_sequence: string
}

interface GtfsTripFull {
  trip_id: string
  route_id: string
  direction_id: string
  shape_id: string
}

console.log('Parsing shapes...')
const shapes = parseCSV<GtfsShape>('shapes.txt')

// Build shape points: shape_id → sorted [{lng, lat}] by shape_pt_sequence
// NOTE: MTA GTFS does not include shape_dist_traveled, so we project stops onto
// the shape polyline by index of the nearest point.
const shapePoints = new Map<string, Array<{lng: number, lat: number, seq: number}>>()
for (const pt of shapes) {
  const arr = shapePoints.get(pt.shape_id) ?? []
  arr.push({
    lng: parseFloat(pt.shape_pt_lon),
    lat: parseFloat(pt.shape_pt_lat),
    seq: parseInt(pt.shape_pt_sequence),
  })
  shapePoints.set(pt.shape_id, arr)
}
for (const [, pts] of shapePoints) {
  pts.sort((a, b) => a.seq - b.seq)
}

console.log('Parsing trips with direction...')
const fullTrips = parseCSV<GtfsTripFull>('trips.txt')

// Pick one representative trip per (route_id, direction_id)
const repTrips = new Map<string, GtfsTripFull>()
for (const trip of fullTrips) {
  const key = `${trip.route_id}::${trip.direction_id}`
  if (!repTrips.has(key)) repTrips.set(key, trip)
}

console.log('Building segments from stop_times...')
const fullStopTimes = parseCSV<GtfsStopTimeFull>('stop_times.txt')

// Group stop_times by trip_id for representative trips
const repTripIds = new Set(Array.from(repTrips.values()).map(t => t.trip_id))
const tripStopTimes = new Map<string, GtfsStopTimeFull[]>()
for (const st of fullStopTimes) {
  if (!repTripIds.has(st.trip_id)) continue
  const arr = tripStopTimes.get(st.trip_id) ?? []
  arr.push(st)
  tripStopTimes.set(st.trip_id, arr)
}
for (const [, sts] of tripStopTimes) {
  sts.sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence))
}

// Build stop_id → {lng, lat} lookup for nearest-point projection
const stopCoords = new Map<string, {lng: number, lat: number}>()
for (const stop of allStops) {
  stopCoords.set(stop.stop_id, {
    lng: parseFloat(stop.stop_lon),
    lat: parseFloat(stop.stop_lat),
  })
}

function nearestIndex(
  pts: Array<{lng: number, lat: number}>,
  target: {lng: number, lat: number},
  startIdx: number = 0,
): number {
  let best = startIdx
  let bestDist = Infinity
  for (let i = startIdx; i < pts.length; i++) {
    const dlng = pts[i].lng - target.lng
    const dlat = pts[i].lat - target.lat
    const d = dlng * dlng + dlat * dlat
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}

interface Segment {
  fromId: string
  toId: string
  line: string
  coordinates: [number, number][]
}

const segments: Segment[] = []
const seen = new Set<string>()

for (const trip of repTrips.values()) {
  const lineName = routeShortName.get(trip.route_id)
  if (!lineName) continue
  const shapePts = shapePoints.get(trip.shape_id)
  if (!shapePts || shapePts.length === 0) continue
  const stopTimes = tripStopTimes.get(trip.trip_id)
  if (!stopTimes || stopTimes.length < 2) continue

  // Project each stop onto the shape by nearest-point, walking forward
  // along the shape so projections stay monotonic.
  const stopIndices: number[] = []
  let searchFrom = 0
  let projectionFailed = false
  for (const st of stopTimes) {
    const coord = stopCoords.get(st.stop_id)
    if (!coord) {
      projectionFailed = true
      break
    }
    const idx = nearestIndex(shapePts, coord, searchFrom)
    stopIndices.push(idx)
    searchFrom = idx
  }
  if (projectionFailed) continue

  for (let i = 0; i < stopTimes.length - 1; i++) {
    const stA = stopTimes[i]
    const stB = stopTimes[i + 1]
    const parentA = childToParent.get(stA.stop_id) ?? stA.stop_id
    const parentB = childToParent.get(stB.stop_id) ?? stB.stop_id
    if (parentA === parentB) continue

    const segKey = `${parentA}::${parentB}::${lineName}`
    if (seen.has(segKey)) continue
    seen.add(segKey)

    const idxA = stopIndices[i]
    const idxB = stopIndices[i + 1]
    if (idxB <= idxA) continue

    const coords: [number, number][] = shapePts
      .slice(idxA, idxB + 1)
      .map(pt => [pt.lng, pt.lat])

    if (coords.length < 2) continue
    segments.push({ fromId: parentA, toId: parentB, line: lineName, coordinates: coords })
  }
}

const SEGMENTS_PATH = join(import.meta.dirname, '../src/data/segments.json')
writeFileSync(SEGMENTS_PATH, JSON.stringify(segments, null, 0))
console.log(`✓ Wrote ${segments.length} segments to ${SEGMENTS_PATH}`)
