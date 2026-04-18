import { useMemo } from 'react'
import { Source, Layer } from 'react-map-gl/maplibre'
import type { FeatureCollection, Feature, LineString } from 'geojson'
import segmentsData from '../data/segments.json'
import { LINE_COLORS } from '../data/lines'
import type { LineId } from '../types'

interface Segment {
  fromId: string
  toId: string
  line: string
  coordinates: [number, number][]
}

const segments = segmentsData as Segment[]
const LINE_WIDTH = 3

interface Props {
  guessed: Set<string>
}

export function RouteSegments({ guessed }: Props) {
  const geoJson = useMemo<FeatureCollection<LineString>>(() => {
    const visible = segments.filter(seg => guessed.has(seg.fromId) && guessed.has(seg.toId))

    // Group by canonical segment key (deduplicates bidirectional copies of the same track).
    // Within each group, one entry per distinct color — B/D/F/FX are all orange so they
    // collapse to a single strip, while D+N/R/W on a shared trunk gives orange + yellow strips.
    const groups = new Map<string, Map<string, [number, number][]>>()

    for (const seg of visible) {
      const [canonA, canonB] = seg.fromId < seg.toId
        ? [seg.fromId, seg.toId]
        : [seg.toId, seg.fromId]
      const key = `${canonA}|${canonB}`
      const coords: [number, number][] = seg.fromId === canonA
        ? seg.coordinates
        : [...seg.coordinates].reverse()

      if (!groups.has(key)) groups.set(key, new Map())
      const colorMap = groups.get(key)!
      const color = LINE_COLORS[seg.line as LineId] ?? '#808183'
      if (!colorMap.has(color)) colorMap.set(color, coords)
    }

    const features: Feature<LineString>[] = []

    for (const colorMap of groups.values()) {
      const colors = [...colorMap.keys()].sort()
      const N = colors.length
      colors.forEach((color, idx) => {
        const offset = (idx - (N - 1) / 2) * LINE_WIDTH
        features.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: colorMap.get(color)! },
          properties: { color, offset },
        })
      })
    }

    return { type: 'FeatureCollection', features }
  }, [guessed])

  return (
    <Source id="route-segments" type="geojson" data={geoJson}>
      <Layer
        id="route-segments"
        type="line"
        paint={{
          'line-color': ['get', 'color'],
          'line-width': LINE_WIDTH,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          'line-offset': ['get', 'offset'] as any,
          'line-opacity': 0.9,
        }}
        layout={{
          'line-cap': 'round',
          'line-join': 'round',
        }}
      />
    </Source>
  )
}
