import { useState, useRef, useEffect } from 'react'
import './HamburgerMenu.css'

export function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="2" y="4"  width="14" height="1.8" rx="0.9" fill="currentColor"/>
          <rect x="2" y="8.1" width="14" height="1.8" rx="0.9" fill="currentColor"/>
          <rect x="2" y="12.2" width="14" height="1.8" rx="0.9" fill="currentColor"/>
        </svg>
      </button>

      {open && (
        <div className="hamburger-panel">
          <p className="hamburger-body">
            name NYC subway stops from memory. made by <strong>Meredith</strong>.<br /><br />heavily inspired by{' '}
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
            ☕ Buy me a coffee
          </a>
        </div>
      )}
    </div>
  )
}
