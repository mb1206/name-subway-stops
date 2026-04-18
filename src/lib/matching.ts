import type { Stop } from '../types'
import { ALIASES } from '../data/aliases'

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[-/]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(e|w)\b/g, m => m === 'e' ? 'east' : 'west')
    .replace(/\bhts\b/g, 'heights')
    .replace(/\b(\d+)(st|nd|rd|th)\b/g, '$1')
    .replace(/\s+(av|ave|avs|sts|st|blvd|boulevard|rd|ln|dr|ct|pl|pkwy|pkway|parkway|tpke|turnpike)\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getAliases(stop: Stop): string[] {
  const extra = ALIASES[stop.name] ?? []
  if (extra.length === 0) return stop.aliases
  const seen = new Set(stop.aliases)
  return [...stop.aliases, ...extra.filter(a => !seen.has(a))]
}

function stopMatchesNormalized(stop: Stop, normalized: string): boolean {
  // Match full name or any alias
  if ([stop.name, ...getAliases(stop)].some(name => normalize(name) === normalized)) return true
  // Match any hyphen-split segment individually
  const segments = stop.name.split('-')
  if (segments.length > 1) {
    return segments.some(seg => normalize(seg.trim()) === normalized)
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
