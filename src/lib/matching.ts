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

export function findAllMatches(
  input: string,
  stops: Stop[],
  guessed: Set<string>,
): Stop[] {
  const normalized = normalize(input)
  if (!normalized) return []
  return stops.filter(stop => {
    if (guessed.has(stop.id)) return false
    return [stop.name, ...stop.aliases].some(name => normalize(name) === normalized)
  })
}
