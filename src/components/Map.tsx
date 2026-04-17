import { Map } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { StopMarker } from './StopMarker'
import { RouteSegments } from './RouteSegments'
import { BoroughDebugLayer } from './BoroughDebugLayer'
import { STREETS_STYLE } from '../styles/streets-style'
import { SCHEMATIC_STYLE } from '../styles/schematic-style'
import type { Stop, MapStyleId } from '../types'
import './Map.css'

interface Props {
  stops: Stop[]
  guessed: Set<string>
  mapStyle: MapStyleId
  hoveredStopId?: string | null
  showBoroughDebug?: boolean
}

const INITIAL_VIEW = {
  longitude: -73.98,
  latitude: 40.73,
  zoom: 11,
}

export function QuizMap({ stops, guessed, mapStyle, hoveredStopId, showBoroughDebug }: Props) {
  const style = mapStyle === 'streets' ? STREETS_STYLE : SCHEMATIC_STYLE

  return (
    <Map
      initialViewState={INITIAL_VIEW}
      style={{ width: '100%', height: '100%' }}
      mapStyle={style}
      attributionControl={false}
    >
      {showBoroughDebug && <BoroughDebugLayer stops={stops} />}
      {stops.map(stop => (
        <StopMarker
          key={stop.id}
          stop={stop}
          named={guessed.has(stop.id)}
          highlighted={hoveredStopId === stop.id}
        />
      ))}
      <RouteSegments guessed={guessed} />
    </Map>
  )
}
