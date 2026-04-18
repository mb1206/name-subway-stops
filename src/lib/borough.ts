import type { Stop } from '../types'

export type Borough = 'Manhattan' | 'Bronx' | 'Brooklyn' | 'Queens' | 'Staten Island'

export const BOROUGHS: Borough[] = ['Manhattan', 'Bronx', 'Brooklyn', 'Queens', 'Staten Island']

export const BOROUGH_SHORT: Record<Borough, string> = {
  'Manhattan': 'Manhattan',
  'Bronx': 'Bronx',
  'Brooklyn': 'Brooklyn',
  'Queens': 'Queens',
  'Staten Island': 'Staten Is.',
}

// Inwood/Washington Heights 1/A train stops that sit east of the Harlem River
// longitude threshold but are in Manhattan borough.
const MANHATTAN_UPPER_IDS = new Set(['A03', '109', 'A02', '108', '107', '110'])

// Grant Av (A57) is in Brooklyn despite sitting east of the J-train Queens stops
// at the same latitude — no longitude threshold cleanly separates them.
const BROOKLYN_IDS = new Set(['A57'])

export function getBoroughForStop(stop: Stop): Borough {
  const [lng, lat] = stop.coordinates

  if (stop.lines.includes('SIR')) return 'Staten Island'

  // Bronx: north of Harlem River, east of upper Manhattan corridor
  if (lat > 40.803 && lng > -73.930 && !MANHATTAN_UPPER_IDS.has(stop.id)) return 'Bronx'

  // Queens: eastern Queens (Rockaways, Jamaica, Flushing)
  if (lng > -73.865) return 'Queens'
  // LIC (lat 40.738–40.758): catches Vernon Blvd, Court Sq, Queensboro Plaza, 7-train start
  if (lat > 40.738 && lat < 40.758 && lng > -73.955) return 'Queens'
  // Astoria (lat 40.758–40.800): east of the East River (~-73.937); excludes UES Lex Ave stops
  // which are at lng -73.944 to -73.956 (Manhattan, west of the river)
  if (lat > 40.758 && lat < 40.800 && lng > -73.937) return 'Queens'
  // Southern Queens: Ozone Park / J line east of Brooklyn border
  // Grant Av (A57) is excluded — it sits east of J-train Queens stops but is in Brooklyn
  if (lat < 40.695 && lng > -73.870 && !BROOKLYN_IDS.has(stop.id)) return 'Queens'
  // Mid-Queens: E/F/M/R and M-line stops (Woodhaven Blvd, Grand Av-Newtown, Middle Village, etc.)
  // lat > 40.697 (not 40.695) excludes Halsey St L (lat=40.6956, Brooklyn)
  // lng > -73.909 (not -73.905) includes Seneca Av (lng=-73.908, Queens)
  if (lat > 40.697 && lat < 40.742 && lng > -73.909) return 'Queens'

  // Brooklyn (Queens rules above must fire first to avoid overlap in lat 40.738-40.755)
  if (lat < 40.695) return 'Brooklyn'                          // south Brooklyn
  if (lat < 40.704 && lng > -73.994) return 'Brooklyn'        // Brooklyn Heights, DUMBO
  if (lat < 40.720 && lng > -73.960) return 'Brooklyn'        // Williamsburg
  if (lat < 40.755 && lng > -73.955) return 'Brooklyn'        // Greenpoint, northern Brooklyn

  return 'Manhattan'
}

export interface BoroughStat {
  borough: Borough
  guessed: number
  total: number
  pct: number
}

export function computeBoroughStats(guessedStops: Stop[], allStops: Stop[]): BoroughStat[] {
  const allByBorough = new Map<Borough, number>(BOROUGHS.map(b => [b, 0]))
  const guessedByBorough = new Map<Borough, number>(BOROUGHS.map(b => [b, 0]))

  for (const stop of allStops) {
    const b = getBoroughForStop(stop)
    allByBorough.set(b, (allByBorough.get(b) ?? 0) + 1)
  }
  for (const stop of guessedStops) {
    const b = getBoroughForStop(stop)
    guessedByBorough.set(b, (guessedByBorough.get(b) ?? 0) + 1)
  }

  return BOROUGHS.map(b => {
    const total = allByBorough.get(b) ?? 0
    const guessed = guessedByBorough.get(b) ?? 0
    return { borough: b, guessed, total, pct: total > 0 ? Math.round(guessed / total * 100) : 0 }
  })
}
