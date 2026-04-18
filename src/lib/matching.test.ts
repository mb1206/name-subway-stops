import { describe, it, expect } from 'vitest'
import { normalize, findMatch, findAllMatches } from './matching'
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
    expect(normalize('  fulton st  ')).toBe('fulton')
  })

  it('strips hyphens and slashes', () => {
    expect(normalize('A/C/E')).toBe('a c east')
    expect(normalize('Smith-9 Sts')).toBe('smith 9')
  })

  it('strips ordinal suffixes from numbers', () => {
    expect(normalize('14th')).toBe('14')
    expect(normalize('1st')).toBe('1')
    expect(normalize('42nd')).toBe('42')
    expect(normalize('33rd')).toBe('33')
  })

  it('expands Hts abbreviation to heights', () => {
    expect(normalize('Jackson Hts')).toBe('jackson heights')
  })

  it('expands single-letter directional prefixes', () => {
    expect(normalize('E Broadway')).toBe('east broadway')
    expect(normalize('e broadway')).toBe('east broadway')
    expect(normalize('W 4 St')).toBe('west 4')
  })

  it('expands Mt abbreviation to mount', () => {
    expect(normalize('Mt Eden Av')).toBe('mount eden')
    expect(normalize('mount eden avenue')).toBe('mount eden')
  })

  it('strips avenue and street as suffix', () => {
    expect(normalize('Utica Avenue')).toBe('utica')
    expect(normalize('Canal Street')).toBe('canal')
  })

  it('strips trailing street type suffixes', () => {
    expect(normalize('Utica Av')).toBe('utica')
    expect(normalize('Kingston-Throop Avs')).toBe('kingston throop')
    expect(normalize('14 St')).toBe('14')
  })
})

describe('findMatch', () => {
  const timesSquare = makeStop('Times Sq-42 St', ['Times Square', 'Times Sq'])
  const fulton = makeStop('Fulton St', ['Fulton Street', 'Fulton'])
  const stops = [timesSquare, fulton]

  it('matches exact official name', () => {
    const guessed = new Set<string>()
    expect(findMatch('Times Sq-42 St', stops, guessed)).toBe(timesSquare)
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
    const guessed = new Set(['stop-Times Sq-42 St'])
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

describe('findAllMatches', () => {
  const st14a: Stop = { ...makeStop('14 St', [], ['A', 'C', 'E'] as Stop['lines']), id: '14a' }
  const st14l: Stop = { ...makeStop('14 St', [], ['L'] as Stop['lines']), id: '14l' }
  const st14f: Stop = { ...makeStop('14 St', [], ['F', 'M'] as Stop['lines']), id: '14f' }
  const multiStops = [st14a, st14l, st14f]

  it('returns all stops matching the normalized input', () => {
    expect(findAllMatches('14th', multiStops, new Set())).toHaveLength(3)
  })

  it('skips already-guessed stops', () => {
    const guessed = new Set([st14a.id])
    expect(findAllMatches('14th', multiStops, guessed)).toHaveLength(2)
  })

  it('returns empty array for no match', () => {
    expect(findAllMatches('Grand Central', multiStops, new Set())).toHaveLength(0)
  })

  it('returns empty array for empty input', () => {
    expect(findAllMatches('', multiStops, new Set())).toHaveLength(0)
  })

  it('matches via explicit alias on compound name', () => {
    const pennStation: Stop = { ...makeStop('34 St-Penn Station', ['34 St'], ['1', '2', '3'] as Stop['lines']), id: 'penn' }
    expect(findAllMatches('34th st', [pennStation], new Set())).toHaveLength(1)
  })

  it('matches via multi-word segment of compound name', () => {
    const stop = makeStop('15 St-Prospect Park', [])
    expect(findAllMatches('prospect park', [stop], new Set())).toHaveLength(1)
    expect(findAllMatches('15th st', [stop], new Set())).toHaveLength(1)
    expect(findAllMatches('15 st', [stop], new Set())).toHaveLength(1)
  })

  it('matches via pure-number segment of compound name', () => {
    const stop = makeStop('Marble Hill-225 St', [])
    expect(findAllMatches('225', [stop], new Set())).toHaveLength(1)
  })

  it('matches both standalone and compound stop sharing a word', () => {
    const compound = makeStop('Bedford-Nostrand Avs', [])
    const standalone = makeStop('Bedford Av', [])
    const results = findAllMatches('bedford', [compound, standalone], new Set())
    expect(results).toHaveLength(2)
    expect(results.map(r => r.name)).toContain('Bedford Av')
    expect(results.map(r => r.name)).toContain('Bedford-Nostrand Avs')
  })

  it('matches single-word segment of compound name', () => {
    const stop = makeStop('President St-Medgar Evers College', [])
    expect(findAllMatches('president', [stop], new Set())).toHaveLength(1)
    expect(findAllMatches('medgar evers college', [stop], new Set())).toHaveLength(1)
  })

  it('matches "e broadway" to stop named "East Broadway"', () => {
    const stop = makeStop('East Broadway', [])
    expect(findAllMatches('e broadway', [stop], new Set())).toHaveLength(1)
  })

  it('matches "world trade" and "wtc" to World Trade Center', () => {
    const stop = makeStop('World Trade Center', [], ['E'] as Stop['lines'])
    expect(findAllMatches('world trade', [stop], new Set())).toHaveLength(1)
    expect(findAllMatches('wtc', [stop], new Set())).toHaveLength(1)
  })

  it('matches compound stop alongside standalone when both share a segment', () => {
    const compound = makeStop('90 St-Elmhurst Av', [])
    const standalone = makeStop('Elmhurst Av', [])
    const results = findAllMatches('elmhurst', [compound, standalone], new Set())
    expect(results).toHaveLength(2)
  })
})
