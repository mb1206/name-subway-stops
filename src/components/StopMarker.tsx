import { Marker } from 'react-map-gl/maplibre'
import { LINE_COLORS, lineTextColor } from '../data/lines'
import type { Stop } from '../types'
import './StopMarker.css'

interface Props {
  stop: Stop
  named: boolean
  highlighted?: boolean
  hinted?: boolean
}

export function StopMarker({ stop, named, highlighted, hinted }: Props) {
  return (
    <Marker longitude={stop.coordinates[0]} latitude={stop.coordinates[1]} anchor="center">
      {named ? (
        <div className={`stop-named${highlighted ? ' stop-named--highlighted' : ''}`}>
          <div className="stop-hover-popup">
            <span className="stop-label">{stop.name}</span>
            <div className="stop-dots">
              {stop.lines.map(line => (
                <span
                  key={line}
                  className="stop-dot-named"
                  data-testid="stop-line-dot"
                  style={{ background: LINE_COLORS[line], color: lineTextColor(line) }}
                >
                  {line}
                </span>
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
        <div className={hinted ? 'stop-dot-hinted' : 'stop-dot-unnamed'} data-testid="stop-dot-unnamed" />
      )}
    </Marker>
  )
}
