import { useState } from 'react'
import { Share2, ChevronDown } from 'lucide-react'
import { BOROUGH_SHORT } from '../lib/borough'
import type { BoroughStat } from '../lib/borough'
import './Header.css'

const SEGMENTS = 20

interface Props {
  guessedCount: number
  totalCount: number
  milesUnlocked: number
  totalMiles: number
  boroughStats: BoroughStat[]
  onShare: () => void
}

export function Header({ guessedCount, totalCount, milesUnlocked, totalMiles, boroughStats, onShare }: Props) {
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
        <button className="header-share-btn" onPointerDown={e => e.preventDefault()} onClick={onShare} aria-label="Share progress">
          <Share2 size={16} aria-hidden="true" />
        </button>
        <button
          className={`header-toggle${expanded ? ' header-toggle--open' : ''}`}
          onPointerDown={e => e.preventDefault()}
          onClick={() => setExpanded(v => !v)}
          aria-label={expanded ? 'Hide progress details' : 'Show progress details'}
          aria-expanded={expanded}
        >
          <ChevronDown size={18} className="header-chevron" aria-hidden="true" />
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
