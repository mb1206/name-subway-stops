import { useState } from 'react'
import { BOROUGH_SHORT } from '../lib/borough'
import type { BoroughStat } from '../lib/borough'
import './Header.css'

const SEGMENTS = 40

interface Props {
  guessedCount: number
  totalCount: number
  milesUnlocked: number
  totalMiles: number
  boroughStats: BoroughStat[]
}

export function Header({ guessedCount, totalCount, milesUnlocked, totalMiles, boroughStats }: Props) {
  const [expanded, setExpanded] = useState(false)
  const pct = totalCount > 0 ? Math.round(guessedCount / totalCount * 100) : 0
  const filled = totalCount > 0 ? Math.round(guessedCount / totalCount * SEGMENTS) : 0

  return (
    <header className="header">
      <div className="header-bar">
        <div className="header-count">
          <span className="header-count-num">{guessedCount}</span>
          <span className="header-count-sep"> / {totalCount}</span>
          <span className="header-count-pct">{pct}%</span>
        </div>
        <button
          className={`header-toggle${expanded ? ' header-toggle--open' : ''}`}
          onClick={() => setExpanded(v => !v)}
          aria-label={expanded ? 'Hide progress details' : 'Show progress details'}
          aria-expanded={expanded}
        >
          <svg className="header-chevron" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M5 7l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="header-dots">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={`header-seg${i < filled ? ' header-seg--filled' : ''}`} />
        ))}
      </div>
      {expanded && (
        <div className="header-detail">
          <div className="header-borough-stats">
            {boroughStats.map(({ borough, pct: bPct }) => (
              <div key={borough} className="header-borough-row">
                <span className="header-borough-name">{BOROUGH_SHORT[borough]}</span>
                <div className="header-borough-bar">
                  <div className="header-borough-fill" style={{ width: `${bPct}%` }} />
                </div>
                <span className="header-borough-pct">{bPct}%</span>
              </div>
            ))}
          </div>
          <div className="header-miles">
            <span className="header-miles-val">
              {Math.round(milesUnlocked) >= totalMiles ? totalMiles : milesUnlocked.toFixed(1)}
            </span>
            <span className="header-miles-label">{' / '}{totalMiles} mi of track</span>
          </div>
        </div>
      )}
    </header>
  )
}
