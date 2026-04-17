import type { MapStyleId } from '../types'
import './SettingsMenu.css'

interface Props {
  mapStyle: MapStyleId
  onToggleStyle: () => void
}

export function SettingsMenu({ mapStyle, onToggleStyle }: Props) {
  return (
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
    </div>
  )
}
