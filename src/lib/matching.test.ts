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
    expect(normalize('A/C/E')).toBe('a c e')
    expect(normalize('Smith-9 Sts')).toBe('smith 9')
  })

  it('strips ordinal suffixes from numbers', () => {
    expect(normalize('14th')).toBe('14')
    expect(normalize('1st')).toBe('1')
    expect(normalize('42nd')).toBe('42')
    expect(normalize('33rd')).toBe('33')
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
})
