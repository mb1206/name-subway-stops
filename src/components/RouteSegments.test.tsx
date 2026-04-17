import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouteSegments } from './RouteSegments'

describe('RouteSegments', () => {
  it('renders a source element', () => {
    render(<RouteSegments guessed={new Set()} />)
    expect(screen.getByTestId('source')).toBeInTheDocument()
  })
})
