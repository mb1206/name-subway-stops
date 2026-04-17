import { Marker } from 'react-map-gl/maplibre'
import { LINE_COLORS } from '../data/lines'
import type { Stop } from '../types'
import './StopMarker.css'

interface Props {
  stop: Stop
  named: boolean
}

export function StopMarker({ stop, named }: Props) {
  return (
    <Marker longitude={stop.coordinates[0]} latitude={stop.coordinates[1]} anchor="center">
      {named ? (
        <div className="stop-named">
          <div className="stop-hover-popup">
            <span className="stop-label">{stop.name}</span>
            <div className="stop-dots">
              {stop.lines.map(line => (
                <span
                  key={line}
                  className="stop-dot-named"
                  data-testid="stop-line-dot"
                  style={{ background: LINE_COLORS[line] }}
                />
              ))}
            </div>
          </div>
          <span
            className="stop-dot-primary"
            data-testid="stop-dot-primary"
            style={{ background: LINE_COLORS[stop.lines[0]] }}
          />
        </div>
      ) : (
        <div className="stop-dot-unnamed" data-testid="stop-dot-unnamed" />
      )}
    </Marker>
  )
}
