import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizInput } from './QuizInput'

describe('QuizInput', () => {
  it('renders a text input', () => {
    render(<QuizInput onInput={vi.fn()} />)
    expect(screen.getByPlaceholderText(/type a stop name/i)).toBeInTheDocument()
  })

  it('does not call onInput on keystroke, only on Enter', async () => {
    const onInput = vi.fn()
    render(<QuizInput onInput={onInput} />)
    const input = screen.getByPlaceholderText(/type a stop name/i)
    await userEvent.type(input, 'Fu')
    expect(onInput).not.toHaveBeenCalled()
    await userEvent.type(input, '{Enter}')
    expect(onInput).toHaveBeenCalledOnce()
    expect(onInput).toHaveBeenCalledWith('Fu')
  })

  it('clears after a successful match signal (value reset externally)', async () => {
    const { rerender } = render(<QuizInput onInput={vi.fn()} />)
    const input = screen.getByPlaceholderText(/type a stop name/i) as HTMLInputElement
    await userEvent.type(input, 'Fulton')
    expect(input.value).toBe('Fulton')
    rerender(<QuizInput onInput={vi.fn()} resetKey={1} />)
    expect(input.value).toBe('')
  })

  it('shows already-named hint with stop names when checkAlreadyGuessed returns matches', async () => {
    const mockStop = { id: 'x', name: 'Fulton St', aliases: [], coordinates: [-74, 40.7] as [number, number], lines: ['A'] as any }
    const check = vi.fn().mockReturnValue([mockStop])
    render(<QuizInput onInput={vi.fn()} checkAlreadyGuessed={check} />)
    const input = screen.getByPlaceholderText(/type a stop name/i)
    await userEvent.type(input, 'fulton')
    expect(screen.getByText('Fulton St')).toBeInTheDocument()
  })
})
