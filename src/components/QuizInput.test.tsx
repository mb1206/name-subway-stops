import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizInput } from './QuizInput'

describe('QuizInput', () => {
  it('renders a text input', () => {
    render(<QuizInput onInput={vi.fn()} />)
    expect(screen.getByPlaceholderText(/type a stop name/i)).toBeInTheDocument()
  })

  it('calls onInput with the current value on each keystroke', async () => {
    const onInput = vi.fn()
    render(<QuizInput onInput={onInput} />)
    const input = screen.getByPlaceholderText(/type a stop name/i)
    await userEvent.type(input, 'Fu')
    expect(onInput).toHaveBeenCalledWith('F')
    expect(onInput).toHaveBeenCalledWith('Fu')
  })

  it('clears after a successful match signal (value reset externally)', async () => {
    const { rerender } = render(<QuizInput onInput={vi.fn()} />)
    const input = screen.getByPlaceholderText(/type a stop name/i) as HTMLInputElement
    await userEvent.type(input, 'Fulton')
    expect(input.value).toBe('Fulton')
    // Parent clears by passing resetKey
    rerender(<QuizInput onInput={vi.fn()} resetKey={1} />)
    expect(input.value).toBe('')
  })
})
