import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'

describe('Header', () => {
  it('displays the correct count', () => {
    render(<Header guessedCount={3} totalCount={472} mapStyle="streets" onToggleStyle={vi.fn()} />)
    expect(screen.getByText('3 / 472')).toBeInTheDocument()
  })

  it('shows "Streets" toggle button when on streets style', () => {
    render(<Header guessedCount={0} totalCount={472} mapStyle="streets" onToggleStyle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /map style/i })).toBeInTheDocument()
  })

  it('calls onToggleStyle when toggle button is clicked', async () => {
    const onToggle = vi.fn()
    render(<Header guessedCount={0} totalCount={472} mapStyle="streets" onToggleStyle={onToggle} />)
    await userEvent.click(screen.getByRole('button', { name: /map style/i }))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
