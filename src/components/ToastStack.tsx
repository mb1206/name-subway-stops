import { LINE_COLORS } from '../data/lines'
import type { Toast } from '../types'
import './ToastStack.css'

interface Props {
  toasts: Toast[]
}

export function ToastStack({ toasts }: Props) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-stack">
      {toasts.map(toast => (
        <div key={toast.id} className="toast">
          <span className="toast-name">{toast.stop.name}</span>
          <span className="toast-lines">
            {toast.stop.lines.map(line => (
              <span
                key={line}
                className="toast-line-dot"
                data-testid="line-dot"
                style={{ background: LINE_COLORS[line] }}
                title={line}
              />
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}
