import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToastStack } from './ToastStack'
import type { Toast, Stop } from '../types'

const makeToast = (name: string, lines: Stop['lines']): Toast => ({
  id: `toast-${name}`,
  stop: {
    id: `stop-${name}`,
    name,
    aliases: [],
    coordinates: [-74, 40.7],
    lines,
  },
})

describe('ToastStack', () => {
  it('renders nothing when toasts array is empty', () => {
    const { container } = render(<ToastStack toasts={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the stop name in the toast', () => {
    const toasts = [makeToast('Fulton St', ['A', 'C'])]
    render(<ToastStack toasts={toasts} />)
    expect(screen.getByText('Fulton St')).toBeInTheDocument()
  })

  it('renders a dot for each line', () => {
    const toasts = [makeToast('Times Sq-42 St', ['1', '2', '3', 'A', 'C', 'E', 'N', 'Q', 'R', 'W'])]
    render(<ToastStack toasts={toasts} />)
    const dots = screen.getAllByTestId('line-dot')
    expect(dots).toHaveLength(10)
  })

  it('renders multiple toasts', () => {
    const toasts = [makeToast('Fulton St', ['A']), makeToast('Wall St', ['4', '5'])]
    render(<ToastStack toasts={toasts} />)
    expect(screen.getByText('Fulton St')).toBeInTheDocument()
    expect(screen.getByText('Wall St')).toBeInTheDocument()
  })
})
