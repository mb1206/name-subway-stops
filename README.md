# Name the Subway Stops

A quiz game: name all ~496 NYC subway stops from memory. Stops appear on the map as you identify them, and route segments light up between consecutive guessed stops.

Built with React, TypeScript, Vite, and MapLibre GL JS. Stop and segment data derived from the [MTA's GTFS feed](https://new.mta.info/developers).

## Track mileage algorithm

The sidebar shows how many miles of unique subway track you've uncovered. Here's how that number is calculated — it turns out to be a surprisingly interesting problem.

### The naive approach fails

The GTFS feed represents each subway line as a sequence of stop-to-stop segments. A segment records `fromStopId`, `toStopId`, `line`, and the GPS polyline between the stops.

The obvious approach — sum up the length of every segment — wildly overcounts. The A, C, and D trains all share the same physical tracks between Columbus Circle and 125th St. If you sum each line's segments separately, you count that corridor three times.

### Deduplication by stop-ID pair

The key insight is that when multiple lines share a physical track, the GTFS assigns them **the same stop IDs** at both ends of the segment. The A, C, and D all stop at stop `A24` (59th St–Columbus Circle) and stop `A15` (125th St), so each of their segments between those two stops has the canonical pair `A15|A24`.

Deduplicating by canonical sorted stop-ID pair (`[fromId, toId].sort().join('|')`) eliminates these duplicates automatically:

```
A train:  A24 → A15  (line=A)  ┐
C train:  A24 → A15  (line=C)  ├─ all collapse to one A15|A24 entry
D train:  A24 → A15  (line=D)  ┘
```

The segment is counted once, and the Haversine distance along the GPS polyline is added to the total.

### Why 298 mi, not 248

Wikipedia reports the NYC subway as **248 route-miles** (treating a four-track corridor as one line) and **665 revenue-track miles** (counting every individual rail). Our figure of ~298 miles lands between those two numbers.

The gap above 248 comes from **parallel express and local tracks**. Where express and local trains use *different* stop IDs — because they stop at different stations — they produce distinct canonical segment pairs and are each counted separately:

```
3 train (express):  stop 123 → stop 120   (72nd St → 96th St, skipping 79th and 86th)
1 train (local):    stop 123 → stop 124   (72nd St → 79th St)
                    stop 124 → stop 125   (79th St → 86th St)
                    stop 125 → stop 120   (86th St → 96th St)
```

These segments sit on **physically separate parallel tracks**. The express track is a real additional 1.5 miles of steel — so counting it is correct. It just means our total is "unique track routes" rather than "unique corridors."

The Staten Island Railway works as a useful sanity check: it has no parallel express tracks, so all segments deduplicate cleanly. Our calculation gives **14.3 miles**, matching Wikipedia's reported 14 miles.

### Implementation

All segment lengths are pre-computed at module load using the [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula) (Earth radius 3,958.8 mi) applied along the full GPS polyline, not just straight-line stop-to-stop distance. When the player makes a guess, a `useMemo` re-sums only the segments whose both endpoints have been identified — O(531 unique segments) per guess.

See [`src/lib/mileage.ts`](src/lib/mileage.ts) for the full implementation.
