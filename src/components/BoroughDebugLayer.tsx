import { Source, Layer } from 'react-map-gl/maplibre'
import { getBoroughForStop } from '../lib/borough'
import type { Stop } from '../types'

const BOROUGH_COLORS: Record<string, string> = {
  'Manhattan':     '#e74c3c',
  'Bronx':         '#3498db',
  'Brooklyn':      '#2ecc71',
  'Queens':        '#f39c12',
  'Staten Island': '#9b59b6',
}

interface Props {
  stops: Stop[]
}

export function BoroughDebugLayer({ stops }: Props) {
  const pointsGeojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: stops.map(stop => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: stop.coordinates },
      properties: { borough: getBoroughForStop(stop) },
    })),
  }

  return (
    <Source id="borough-debug" type="geojson" data={pointsGeojson}>
      <Layer
        id="borough-debug-circles"
        type="circle"
        paint={{
          'circle-radius': 7,
          'circle-color': [
            'match', ['get', 'borough'],
            'Manhattan',     BOROUGH_COLORS['Manhattan'],
            'Bronx',         BOROUGH_COLORS['Bronx'],
            'Brooklyn',      BOROUGH_COLORS['Brooklyn'],
            'Queens',        BOROUGH_COLORS['Queens'],
            'Staten Island', BOROUGH_COLORS['Staten Island'],
            '#999',
          ] as any,
          'circle-opacity': 0.75,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#fff',
          'circle-stroke-opacity': 0.5,
        }}
      />
    </Source>
  )
}
