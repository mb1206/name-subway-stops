import { describe, it, expect } from 'vitest'
import { findAllMatches } from '../lib/matching'
import { NUMBER_STOP_IDS } from './number-stop-ids'
import stopsData from './stops.json'
import type { Stop } from '../types'

const stops = stopsData as Stop[]

describe('NUMBER_STOP_IDS', () => {
  it('covers every stop that any numeric input 1–250 could match', () => {
    const guessed = new Set(NUMBER_STOP_IDS)

    for (let i = 1; i <= 250; i++) {
      const remaining = findAllMatches(String(i), stops, guessed)
      expect(
        remaining,
        `"${i}" still matches unguessed stops: ${remaining.map(s => `${s.name} (${s.id})`).join(', ')}`
      ).toHaveLength(0)
    }
  })
})
