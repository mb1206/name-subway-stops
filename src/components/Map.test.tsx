import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuizMap } from './Map'
import type { Stop } from '../types'

const stops: Stop[] = [
  {
    id: '1',
    name: 'Fulton St',
    aliases: [],
    coordinates: [-74.009, 40.709],
    lines: ['A', 'C'],
  },
  {
    id: '2',
    name: 'Wall St',
    aliases: [],
    coordinates: [-74.011, 40.707],
    lines: ['4', '5'],
  },
]

describe('QuizMap', () => {
  it('renders a marker for every stop', () => {
    render(<QuizMap stops={stops} guessed={new Set()} mapStyle="streets" />)
    expect(screen.getAllByTestId('marker')).toHaveLength(2)
  })

  it('renders named markers for guessed stops', () => {
    const guessed = new Set(['1'])
    render(<QuizMap stops={stops} guessed={guessed} mapStyle="streets" />)
    expect(screen.getByText('Fulton St')).toBeInTheDocument()
    expect(screen.queryByText('Wall St')).not.toBeInTheDocument()
  })
})
