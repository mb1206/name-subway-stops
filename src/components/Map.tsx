import { useMemo } from 'react'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { StopMarker } from './StopMarker'
import { RouteSegments } from './RouteSegments'
import { STREETS_STYLE } from '../styles/streets-style'
import { SCHEMATIC_STYLE } from '../styles/schematic-style'
import type { Stop, MapStyleId } from '../types'
import './Map.css'

interface Props {
  stops: Stop[]
  guessed: Set<string>
  mapStyle: MapStyleId
  hoveredStopId?: string | null
  showHints?: boolean
}

const INITIAL_VIEW = {
  longitude: -73.98,
  latitude: 40.73,
  zoom: 11,
}

export function QuizMap({ stops, guessed, mapStyle, hoveredStopId, showHints }: Props) {
  const style = mapStyle === 'streets' ? STREETS_STYLE : SCHEMATIC_STYLE

  // For each line, collect all stop IDs on it (static — stops never change)
  const stopIdsByLine = useMemo(() => {
    const map = new Map<string, string[]>()
    stops.forEach(stop => {
      stop.lines.forEach(line => {
        if (!map.has(line)) map.set(line, [])
        map.get(line)!.push(stop.id)
      })
    })
    return map
  }, [stops])

  // Lines where every stop has been guessed
  const completedLines = useMemo(() => {
    const done = new Set<string>()
    stopIdsByLine.forEach((ids, line) => {
      if (ids.every(id => guessed.has(id))) done.add(line)
    })
    return done
  }, [stopIdsByLine, guessed])

  return (
    <MapGL
      initialViewState={INITIAL_VIEW}
      style={{ width: '100%', height: '100%' }}
      mapStyle={style}
      attributionControl={false}
    >
      {stops.map(stop =>
        stop.lines.every(line => completedLines.has(line)) ? null : (
          <StopMarker
            key={stop.id}
            stop={stop}
            named={guessed.has(stop.id)}
            highlighted={hoveredStopId === stop.id}
            hinted={showHints && !guessed.has(stop.id)}
          />
        )
      )}
      <RouteSegments guessed={guessed} />
    </MapGL>
  )
}
