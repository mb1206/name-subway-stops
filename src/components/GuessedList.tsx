import { LINE_COLORS, lineTextColor } from '../data/lines'
import type { Stop } from '../types'
import './GuessedList.css'

const SEGMENTS = 40

interface Props {
  stops: Stop[]
  guessedCount: number
  totalCount: number
}

export function GuessedList({ stops, guessedCount, totalCount }: Props) {
  const pct = totalCount > 0 ? Math.round(guessedCount / totalCount * 100) : 0
  const filled = totalCount > 0 ? Math.round(guessedCount / totalCount * SEGMENTS) : 0

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
        <div className="sidebar-label">
          {guessedCount} stop{guessedCount !== 1 ? 's' : ''} named
        </div>
      </div>

      <div className="sidebar-body">
        {stops.length === 0 ? (
          <p className="sidebar-empty">Start typing to name stops.</p>
        ) : (
          [...stops].reverse().map(stop => (
            <div key={stop.id} className="sidebar-item">
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
