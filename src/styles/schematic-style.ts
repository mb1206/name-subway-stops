import type { StyleSpecification } from 'maplibre-gl'

export const SCHEMATIC_STYLE: StyleSpecification = {
  version: 8,
  name: 'Schematic',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#f5f5f2' },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'fill-color': '#c8d8e8' },
    },
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['==', 'class', 'park'],
      paint: { 'fill-color': '#e5efe0' },
    },
    {
      id: 'roads-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service', 'track'],
      paint: { 'line-color': '#e0ddd8', 'line-width': 1 },
    },
    {
      id: 'roads-major',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'primary', 'secondary', 'tertiary', 'trunk'],
      paint: { 'line-color': '#d0ccc4', 'line-width': 1.5 },
    },
    {
      id: 'roads-motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      paint: { 'line-color': '#c0bbb0', 'line-width': 2 },
    },
    {
      id: 'place-labels',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['in', 'class', 'neighbourhood', 'suburb'],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 11,
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.1,
      },
      paint: {
        'text-color': '#9a9690',
        'text-halo-color': '#f5f5f2',
        'text-halo-width': 1,
      },
    },
  ],
}
