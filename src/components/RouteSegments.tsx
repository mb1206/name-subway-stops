import { useMemo } from 'react'
import { Source, Layer } from 'react-map-gl/maplibre'
import type { LineLayerSpecification } from 'maplibre-gl'
import type { FeatureCollection, LineString } from 'geojson'
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

interface Props {
  guessed: Set<string>
}

const lineLayer: LineLayerSpecification = {
  id: 'route-segments',
  type: 'line',
  source: 'route-segments',
  paint: {
    'line-color': ['get', 'color'],
    'line-width': 3,
    'line-opacity': 0.9,
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round',
  },
}

export function RouteSegments({ guessed }: Props) {
  const geoJson = useMemo<FeatureCollection<LineString>>(() => ({
    type: 'FeatureCollection',
    features: segments
      .filter(seg => guessed.has(seg.fromId) && guessed.has(seg.toId))
      .map(seg => ({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: seg.coordinates },
        properties: {
          color: LINE_COLORS[seg.line as LineId] ?? '#808183',
        },
      })),
  }), [guessed])

  return (
    <Source id="route-segments" type="geojson" data={geoJson}>
      <Layer {...lineLayer} />
    </Source>
  )
}
