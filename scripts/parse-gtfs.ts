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
