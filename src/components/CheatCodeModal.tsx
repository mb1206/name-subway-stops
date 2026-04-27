import { X } from 'lucide-react'
import './CheatCodeModal.css'

interface Props {
  onClose: () => void
}

export function CheatCodeModal({ onClose }: Props) {
  return (
    <div className="cheat-backdrop" onClick={onClose}>
      <div className="cheat-card" onClick={e => e.stopPropagation()}>
        <button className="cheat-close" onClick={onClose} aria-label="Close">
          <X size={14} aria-hidden="true" />
        </button>
        <div className="cheat-heading">
          <span className="cheat-emoji">🤖</span>
          <span className="cheat-title">Cheat code</span>
        </div>
        <p className="cheat-body">
          Hint: type <code className="cheat-code">beep boop</code> to fill in
          all number-based stops, e.g. <em>1 Av</em> or <em>42 St</em>.
        </p>
        <p className="cheat-caveat">
          Note: this only fills stops that begin directly with a number. You'll
          still need to guess stops like <em>South 50th Street</em>{' '}
          (non-existent stop used on purpose 😅) since they don't explicitly
          start with the number.
        </p>
      </div>
    </div>
  )
}
