import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CheatCodeModal } from './CheatCodeModal'

describe('CheatCodeModal', () => {
  it('renders beep boop cheat code text', () => {
    render(<CheatCodeModal onClose={vi.fn()} />)
    expect(screen.getByText(/beep boop/i)).toBeInTheDocument()
  })

  it('explains that prefixed stops like south 50th street are not included', () => {
    render(<CheatCodeModal onClose={vi.fn()} />)
    expect(screen.getByText(/south 50/i)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<CheatCodeModal onClose={onClose} />)
    await userEvent.click(screen.getByLabelText(/close/i))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
