import { BOROUGH_SHORT } from '../lib/borough'
import type { BoroughStat } from '../lib/borough'
import './ShareModal.css'

const SEGMENTS = 40
const APP_URL = 'mb1206.github.io/name-subway-stops'

interface Props {
  guessedCount: number
  totalCount: number
  milesUnlocked: number
  totalMiles: number
  boroughStats: BoroughStat[]
  onClose: () => void
}

export function ShareModal({ guessedCount, totalCount, milesUnlocked, totalMiles, boroughStats, onClose }: Props) {
  const pct = totalCount > 0 ? Math.round(guessedCount / totalCount * 100) : 0
  const filled = totalCount > 0 ? Math.round(guessedCount / totalCount * SEGMENTS) : 0
  const milesDisplay = Math.round(milesUnlocked) >= totalMiles ? totalMiles : milesUnlocked.toFixed(1)

  return (
    <div className="share-backdrop" onClick={onClose}>
      <div className="share-card" onClick={e => e.stopPropagation()}>
        <button className="share-close" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="share-heading">
          <span className="share-emoji">🚇</span>
          <span className="share-title">NYC Subway Stops</span>
        </div>

        <div className="share-count-block">
          <div className="share-count">
            <span className="share-count-num">{guessedCount}</span>
            <span className="share-count-sep"> / {totalCount}</span>
            <span className="share-count-pct">{pct}%</span>
          </div>
          <div className="share-progress">
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <span key={i} className={`share-seg${i < filled ? ' share-seg--filled' : ''}`} />
            ))}
          </div>
        </div>

        <div className="share-boroughs">
          {boroughStats.map(({ borough, pct: bPct }) => (
            <div key={borough} className="share-borough-row">
              <span className="share-borough-name">{BOROUGH_SHORT[borough]}</span>
              <div className="share-borough-bar">
                <div className="share-borough-fill" style={{ width: `${bPct}%` }} />
              </div>
              <span className="share-borough-pct">{bPct}%</span>
            </div>
          ))}
        </div>

        <div className="share-miles">
          <span className="share-miles-val">{milesDisplay}</span>
          <span className="share-miles-label"> / {totalMiles} mi of track unlocked</span>
        </div>

        <div className="share-footer">
          <span className="share-url">{APP_URL}</span>
        </div>
      </div>
    </div>
  )
}
