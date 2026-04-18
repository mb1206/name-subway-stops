import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'

const defaultProps = {
  guessedCount: 0,
  totalCount: 496,
  milesUnlocked: 0,
  totalMiles: 298,
  boroughStats: [],
}

describe('Header', () => {
  it('renders guessed count and total', () => {
    render(<Header {...defaultProps} guessedCount={142} />)
    expect(screen.getByText('142')).toBeInTheDocument()
    expect(screen.getByText('/ 496')).toBeInTheDocument()
  })

  it('renders percentage', () => {
    render(<Header {...defaultProps} guessedCount={248} totalCount={496} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('borough detail is hidden by default', () => {
    render(<Header {...defaultProps} boroughStats={[{ borough: 'Manhattan', guessed: 10, total: 100, pct: 10 }]} />)
    expect(screen.queryByText('Manhattan')).not.toBeInTheDocument()
  })

  it('expands to show borough stats when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<Header {...defaultProps} boroughStats={[{ borough: 'Manhattan', guessed: 10, total: 100, pct: 10 }]} />)
    await user.click(screen.getByRole('button', { name: /show progress/i }))
    expect(screen.getByText('Manhattan')).toBeInTheDocument()
  })

  it('collapses again when toggle is clicked a second time', async () => {
    const user = userEvent.setup()
    render(<Header {...defaultProps} boroughStats={[{ borough: 'Manhattan', guessed: 10, total: 100, pct: 10 }]} />)
    const btn = screen.getByRole('button')
    await user.click(btn)
    await user.click(btn)
    expect(screen.queryByText('Manhattan')).not.toBeInTheDocument()
  })
})
