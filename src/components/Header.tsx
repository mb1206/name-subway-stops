import './Header.css'

const SEGMENTS = 40

interface Props {
  guessedCount: number
  totalCount: number
}

export function Header({ guessedCount, totalCount }: Props) {
  const pct = totalCount > 0 ? Math.round(guessedCount / totalCount * 100) : 0
  const filled = totalCount > 0 ? Math.round(guessedCount / totalCount * SEGMENTS) : 0

  return (
    <header className="header">
      <div className="header-main">
        <span className="header-title">Name the Subway Stops</span>
      </div>
      <div className="header-mobile-stats" aria-hidden="true">
        <div className="header-mobile-count">
          <span className="header-mobile-num">{guessedCount}</span>
          <span className="header-mobile-sep"> / {totalCount}</span>
          <span className="header-mobile-pct">{pct}%</span>
        </div>
        <div className="header-mobile-progress">
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span key={i} className={`header-seg${i < filled ? ' header-seg--filled' : ''}`} />
          ))}
        </div>
      </div>
    </header>
  )
}
