import type { MapStyleId } from '../types'
import './SettingsMenu.css'

interface Props {
  mapStyle: MapStyleId
  onToggleStyle: () => void
  onReset: () => void
  showBoroughDebug: boolean
  onToggleBoroughDebug: () => void
}

export function SettingsMenu({ mapStyle, onToggleStyle, onReset, showBoroughDebug, onToggleBoroughDebug }: Props) {
  function handleReset() {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      onReset()
    }
  }

  return (
    <div className="settings-wrap">
      <div className="style-toggle" role="group" aria-label="Map style">
        <button
          className={`style-toggle-opt${mapStyle === 'streets' ? ' style-toggle-opt--active' : ''}`}
          onClick={mapStyle !== 'streets' ? onToggleStyle : undefined}
          aria-pressed={mapStyle === 'streets'}
        >
          Dark
        </button>
        <button
          className={`style-toggle-opt${mapStyle === 'schematic' ? ' style-toggle-opt--active' : ''}`}
          onClick={mapStyle !== 'schematic' ? onToggleStyle : undefined}
          aria-pressed={mapStyle === 'schematic'}
        >
          Light
        </button>
        <div className="style-toggle-divider" />
        <button
          className={`style-toggle-opt${showBoroughDebug ? ' style-toggle-opt--active' : ''}`}
          onClick={onToggleBoroughDebug}
          aria-pressed={showBoroughDebug}
        >
          Boroughs
        </button>
        <div className="style-toggle-divider" />
        <button className="style-toggle-opt style-toggle-reset" onClick={handleReset} aria-label="Reset progress">
          Reset
        </button>
      </div>
      <p className="map-attribution">
        © <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a>
        {' · '}
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
      </p>
    </div>
  )
}
