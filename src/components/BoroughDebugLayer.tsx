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

// Approximate NYC borough boundary polylines (geographic, not pixel-perfect)
const BOUNDARY_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      // Harlem River: Hudson River junction → East River junction (Manhattan/Bronx)
      type: 'Feature',
      properties: { boundary: 'Harlem River' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-73.916, 40.879], [-73.921, 40.874], [-73.927, 40.867],
          [-73.930, 40.856], [-73.929, 40.840], [-73.927, 40.821],
          [-73.926, 40.812], [-73.928, 40.796],
        ],
      },
    },
    {
      // East River upper: Harlem River → LIC (Manhattan east shore)
      type: 'Feature',
      properties: { boundary: 'East River upper' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-73.928, 40.796], [-73.932, 40.783], [-73.935, 40.769],
          [-73.938, 40.757], [-73.942, 40.747], [-73.949, 40.735],
          [-73.955, 40.722], [-73.960, 40.711], [-73.963, 40.700],
        ],
      },
    },
    {
      // East River lower: LIC → Bay Ridge (Manhattan/Brooklyn)
      type: 'Feature',
      properties: { boundary: 'East River lower' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-73.963, 40.700], [-73.968, 40.688], [-73.974, 40.678],
          [-73.980, 40.670], [-73.988, 40.658], [-73.998, 40.645],
        ],
      },
    },
    {
      // Newtown Creek + overland: Brooklyn/Queens boundary
      type: 'Feature',
      properties: { boundary: 'Brooklyn-Queens' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-73.963, 40.718], [-73.944, 40.726], [-73.918, 40.727],
          [-73.907, 40.719], [-73.895, 40.708], [-73.878, 40.697],
          [-73.868, 40.695], [-73.865, 40.680], [-73.861, 40.660],
          [-73.857, 40.640], [-73.852, 40.620],
        ],
      },
    },
  ],
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
    <>
      <Source id="borough-debug" type="geojson" data={pointsGeojson}>
        <Layer
          id="borough-debug-circles"
          type="circle"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <Source id="borough-boundaries" type="geojson" data={BOUNDARY_GEOJSON}>
        <Layer
          id="borough-boundary-lines"
          type="line"
          paint={{
            'line-color': '#ffffff',
            'line-width': 2,
            'line-opacity': 0.8,
            'line-dasharray': [4, 3],
          }}
        />
      </Source>
    </>
  )
}
