import type { MapStyleId } from '../types'
import './Header.css'

interface Props {
  guessedCount: number
  totalCount: number
  mapStyle: MapStyleId
  onToggleStyle: () => void
}

export function Header({ guessedCount, totalCount, mapStyle, onToggleStyle }: Props) {
  return (
    <header className="header">
      <span className="header-title">Name the Subway Stops</span>
      <span className="header-counter">{guessedCount} / {totalCount}</span>
      <button className="header-toggle" onClick={onToggleStyle} aria-label="Map style toggle">
        {mapStyle === 'streets' ? 'Schematic' : 'Streets'}
      </button>
    </header>
  )
}
