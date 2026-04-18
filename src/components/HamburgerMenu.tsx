import { useState, useRef, useEffect } from 'react'
import { Menu } from 'lucide-react'
import type { MapStyleId } from '../types'
import './HamburgerMenu.css'

interface Props {
  mapStyle: MapStyleId
  onToggleStyle: () => void
  onReset: () => void
}

export function HamburgerMenu({ mapStyle, onToggleStyle, onReset }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  function handleReset() {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      onReset()
      setOpen(false)
    }
  }

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="hamburger-root" ref={ref}>
      <button
        className={`hamburger-btn${open ? ' hamburger-btn--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <Menu size={18} aria-hidden="true" />
      </button>

      {open && (
        <div className="hamburger-panel">
          <p className="hamburger-body">
            name NYC subway stops from memory. made by <strong>Meredith</strong> and Claude Code.<br /><br />heavily inspired by{' '}
            <a
              href="https://carvin.github.io/sf-street-names/#"
              target="_blank"
              rel="noopener noreferrer"
              className="hamburger-link"
            >
              SF Street Names
            </a>.
          </p>
          <a
            href="https://buymeacoffee.com/mb1206"
            target="_blank"
            rel="noopener noreferrer"
            className="hamburger-coffee"
          >
            ☕ buy me a coffee
          </a>

          <div className="hamburger-settings">
            <div className="hamburger-settings-divider" />
            <div className="settings-controls">
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
              <button className="settings-reset-btn" onClick={handleReset} aria-label="Reset progress">
                Reset
              </button>
            </div>
            <p className="map-attribution">
              © <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a>
              {' · '}
              © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
