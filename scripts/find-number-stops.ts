import { findMatch } from '../src/lib/matching'
import stopsData from '../src/data/stops.json'
import type { Stop } from '../src/types'

const stops = stopsData as Stop[]
const guessed = new Set<string>()
const results: { input: string; stop: Stop }[] = []

for (let i = 1; i <= 250; i++) {
  const match = findMatch(String(i), stops, guessed)
  if (match) {
    results.push({ input: String(i), stop: match })
    guessed.add(match.id)
  }
}

console.log(`Matched ${results.length} stops:\n`)
for (const { input, stop } of results) {
  console.log(`  "${input}" → ${stop.id}  (${stop.name})`)
}

console.log('\nStop IDs for cheat code:')
console.log(JSON.stringify(results.map(r => r.stop.id)))
