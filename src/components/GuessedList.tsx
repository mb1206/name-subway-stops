import { LINE_COLORS, lineTextColor } from '../data/lines'
import { computeBoroughStats, BOROUGH_SHORT } from '../lib/borough'
import type { Stop } from '../types'
import './GuessedList.css'

const SEGMENTS = 40

interface Props {
  stops: Stop[]
  allStops: Stop[]
  guessedCount: number
  totalCount: number
  onStopHover: (id: string | null) => void
}

export function GuessedList({ stops, allStops, guessedCount, totalCount, onStopHover }: Props) {
  const pct = totalCount > 0 ? Math.round(guessedCount / totalCount * 100) : 0
  const filled = totalCount > 0 ? Math.round(guessedCount / totalCount * SEGMENTS) : 0
  const boroughStats = computeBoroughStats(stops, allStops)

  return (
    <aside className="sidebar" aria-label="Guessed stops">
      <div className="sidebar-stats">
        <div className="sidebar-count">
          <span className="sidebar-count-main">{guessedCount}</span>
          <span className="sidebar-count-sep"> / {totalCount}</span>
          <span className="sidebar-count-pct">{pct}%</span>
        </div>
        <div className="sidebar-progress">
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span key={i} className={`sidebar-seg${i < filled ? ' sidebar-seg--filled' : ''}`} />
          ))}
        </div>
        <div className="sidebar-borough-stats">
          {boroughStats.map(({ borough, pct: bPct }) => (
            <div key={borough} className="sidebar-borough-row">
              <span className="sidebar-borough-name">{BOROUGH_SHORT[borough]}</span>
              <div className="sidebar-borough-bar">
                <div className="sidebar-borough-fill" style={{ width: `${bPct}%` }} />
              </div>
              <span className="sidebar-borough-pct">{bPct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-body">
        {stops.length === 0 ? (
          <p className="sidebar-empty">Start typing to name stops.</p>
        ) : (
          [...stops].reverse().map(stop => (
            <div
              key={stop.id}
              className="sidebar-item"
              onMouseEnter={() => onStopHover(stop.id)}
              onMouseLeave={() => onStopHover(null)}
            >
              <span className="sidebar-name">{stop.name}</span>
              <div className="sidebar-dots">
                {stop.lines.map(line => (
                  <span
                    key={line}
                    className="sidebar-dot"
                    style={{ background: LINE_COLORS[line], color: lineTextColor(line) }}
                  >
                    {line}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
