import segmentsData from '../data/segments.json'

interface Segment {
  fromId: string
  toId: string
  coordinates: [number, number][]
}

const segments = segmentsData as unknown as Segment[]

function haversine(a: [number, number], b: [number, number]): number {
  const R = 3958.8 // miles
  const dLat = (b[1] - a[1]) * Math.PI / 180
  const dLon = (b[0] - a[0]) * Math.PI / 180
  const lat1 = a[1] * Math.PI / 180
  const lat2 = b[1] * Math.PI / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(x))
}

function polylineLength(coords: [number, number][]): number {
  let total = 0
  for (let i = 1; i < coords.length; i++) total += haversine(coords[i - 1], coords[i])
  return total
}

// Pre-compute canonical segment lengths once at module load.
// Key = sorted([fromId, toId]).join('|') so each physical track counted once.
const SEGMENT_LENGTHS = new Map<string, number>()
for (const seg of segments) {
  const key = [seg.fromId, seg.toId].sort().join('|')
  if (!SEGMENT_LENGTHS.has(key)) {
    SEGMENT_LENGTHS.set(key, polylineLength(seg.coordinates))
  }
}

export const TOTAL_TRACK_MILES = Math.round(
  [...SEGMENT_LENGTHS.values()].reduce((a, b) => a + b, 0)
)

export function computeMilesUnlocked(guessed: Set<string>): number {
  let total = 0
  for (const [key, len] of SEGMENT_LENGTHS) {
    const pipe = key.indexOf('|')
    const a = key.slice(0, pipe)
    const b = key.slice(pipe + 1)
    if (guessed.has(a) && guessed.has(b)) total += len
  }
  return total
}
