import type { Stop } from '../types'

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[-/]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(\d+)(st|nd|rd|th)\b/g, '$1')
    .replace(/\s+(av|ave|st|blvd|rd|ln|dr|ct|pl|pkwy|tpke|sts|avs)\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function stopMatchesNormalized(stop: Stop, normalized: string): boolean {
  if ([stop.name, ...stop.aliases].some(name => normalize(name) === normalized)) return true
  // Also match against the first segment of compound names like "34 St-Penn Station" → "34 St"
  const dashIdx = stop.name.indexOf('-')
  if (dashIdx > 0) {
    const firstPart = stop.name.slice(0, dashIdx).trim()
    if (normalize(firstPart) === normalized) return true
  }
  return false
}

export function findMatch(
  input: string,
  stops: Stop[],
  guessed: Set<string>,
): Stop | null {
  const normalized = normalize(input)
  if (!normalized) return null
  return stops.find(stop => !guessed.has(stop.id) && stopMatchesNormalized(stop, normalized)) ?? null
}

export function findAllMatches(
  input: string,
  stops: Stop[],
  guessed: Set<string>,
): Stop[] {
  const normalized = normalize(input)
  if (!normalized) return []
  return stops.filter(stop => !guessed.has(stop.id) && stopMatchesNormalized(stop, normalized))
}
