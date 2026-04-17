import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StopMarker } from './StopMarker'
import type { Stop } from '../types'

const stop: Stop = {
  id: 'test-stop',
  name: 'Times Sq-42 St',
  aliases: [],
  coordinates: [-73.987, 40.755],
  lines: ['1', '2', '3', 'A', 'C', 'E'],
}

describe('StopMarker', () => {
  it('renders when named=false as a small grey dot with no label', () => {
    render(<StopMarker stop={stop} named={false} />)
    expect(screen.queryByText('Times Sq-42 St')).not.toBeInTheDocument()
    expect(screen.getByTestId('stop-dot-unnamed')).toBeInTheDocument()
  })

  it('renders when named=true with the stop name label', () => {
    render(<StopMarker stop={stop} named={true} />)
    expect(screen.getByText('Times Sq-42 St')).toBeInTheDocument()
  })

  it('renders one colored dot per line when named=true', () => {
    render(<StopMarker stop={stop} named={true} />)
    const dots = screen.getAllByTestId('stop-line-dot')
    expect(dots).toHaveLength(6)
  })
})
