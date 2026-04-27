import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuiz } from './useQuiz'
import type { Stop } from '../types'

const stop1: Stop = {
  id: '1',
  name: 'Times Sq-42 St',
  aliases: ['Times Square'],
  coordinates: [-73.987, 40.755],
  lines: ['1', '2', '3'],
}

const stop2: Stop = {
  id: '2',
  name: 'Fulton St',
  aliases: ['Fulton Street'],
  coordinates: [-74.009, 40.709],
  lines: ['A', 'C'],
}

const stops = [stop1, stop2]

describe('useQuiz', () => {
  beforeEach(() => { vi.useFakeTimers(); localStorage.clear() })
  afterEach(() => vi.useRealTimers())

  it('starts with no guessed stops', () => {
    const { result } = renderHook(() => useQuiz(stops))
    expect(result.current.guessed.size).toBe(0)
  })

  it('starts with no toasts', () => {
    const { result } = renderHook(() => useQuiz(stops))
    expect(result.current.toasts).toHaveLength(0)
  })

  it('onInput with correct name adds stop to guessed', () => {
    const { result } = renderHook(() => useQuiz(stops))
    act(() => result.current.onInput('Times Square'))
    expect(result.current.guessed.has('1')).toBe(true)
  })

  it('onInput with correct name adds a toast', () => {
    const { result } = renderHook(() => useQuiz(stops))
    act(() => result.current.onInput('Times Square'))
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].stop).toBe(stop1)
  })

  it('toast auto-dismisses after 2 seconds', () => {
    const { result } = renderHook(() => useQuiz(stops))
    act(() => result.current.onInput('Times Square'))
    expect(result.current.toasts).toHaveLength(1)
    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.toasts).toHaveLength(0)
  })

  it('onInput with wrong name does not change state', () => {
    const { result } = renderHook(() => useQuiz(stops))
    act(() => result.current.onInput('Grand Central'))
    expect(result.current.guessed.size).toBe(0)
    expect(result.current.toasts).toHaveLength(0)
  })

  it('cannot guess the same stop twice', () => {
    const { result } = renderHook(() => useQuiz(stops))
    act(() => result.current.onInput('Times Square'))
    act(() => result.current.onInput('Times Square'))
    expect(result.current.guessed.size).toBe(1)
    expect(result.current.toasts).toHaveLength(1)
  })

  it('returns correct guessedCount', () => {
    const { result } = renderHook(() => useQuiz(stops))
    expect(result.current.guessedCount).toBe(0)
    act(() => result.current.onInput('Times Square'))
    expect(result.current.guessedCount).toBe(1)
    act(() => result.current.onInput('Fulton St'))
    expect(result.current.guessedCount).toBe(2)
  })

  it('returns correct totalCount', () => {
    const { result } = renderHook(() => useQuiz(stops))
    expect(result.current.totalCount).toBe(2)
  })

  it('calls onMatch callback when a stop is correctly guessed', () => {
    const onMatch = vi.fn()
    const { result } = renderHook(() => useQuiz(stops, { onMatch }))
    act(() => result.current.onInput('Times Square'))
    expect(onMatch).toHaveBeenCalledOnce()
    expect(onMatch).toHaveBeenCalledWith(stop1)
  })

  it('reveals all matching stops at once for a shared name', () => {
    const multiStop1: Stop = { id: 'ms1', name: '14 St', aliases: [], coordinates: [-74, 40.7], lines: ['A', 'C', 'E'] }
    const multiStop2: Stop = { id: 'ms2', name: '14 St', aliases: [], coordinates: [-73.99, 40.73], lines: ['L'] }
    const multiStops = [multiStop1, multiStop2]
    const { result } = renderHook(() => useQuiz(multiStops))
    act(() => result.current.onInput('14th'))
    expect(result.current.guessed.has('ms1')).toBe(true)
    expect(result.current.guessed.has('ms2')).toBe(true)
    expect(result.current.guessedCount).toBe(2)
  })
})

describe('showBeepBoopHint', () => {
  // IDs taken from NUMBER_STOP_IDS; names chosen to be unambiguously matchable
  const numStop1: Stop = { id: 'L06', name: 'nstop alpha', aliases: [], coordinates: [0, 0], lines: [] }
  const numStop2: Stop = { id: 'F14', name: 'nstop beta', aliases: [], coordinates: [0, 0], lines: [] }
  const numStop3: Stop = { id: '221', name: 'nstop gamma', aliases: [], coordinates: [0, 0], lines: [] }
  const regularStop: Stop = { id: 'NONNUM', name: 'nstop regular', aliases: [], coordinates: [0, 0], lines: [] }
  const allStops = [numStop1, numStop2, numStop3, regularStop]

  beforeEach(() => { vi.useFakeTimers(); localStorage.clear() })
  afterEach(() => vi.useRealTimers())

  it('is false when no stops have been guessed', () => {
    const { result } = renderHook(() => useQuiz(allStops))
    expect(result.current.showBeepBoopHint).toBe(false)
  })

  it('is false after guessing exactly 2 number-based stops', () => {
    const { result } = renderHook(() => useQuiz(allStops))
    act(() => result.current.onInput('nstop alpha'))
    act(() => result.current.onInput('nstop beta'))
    expect(result.current.showBeepBoopHint).toBe(false)
  })

  it('becomes true after guessing more than 2 number-based stops', () => {
    const { result } = renderHook(() => useQuiz(allStops))
    act(() => result.current.onInput('nstop alpha'))
    act(() => result.current.onInput('nstop beta'))
    act(() => result.current.onInput('nstop gamma'))
    expect(result.current.showBeepBoopHint).toBe(true)
  })

  it('stays false when only non-number stops are guessed', () => {
    const { result } = renderHook(() => useQuiz(allStops))
    act(() => result.current.onInput('nstop regular'))
    expect(result.current.showBeepBoopHint).toBe(false)
  })

  it('becomes false again after beep boop cheat code is used', () => {
    const { result } = renderHook(() => useQuiz(allStops))
    act(() => result.current.onInput('nstop alpha'))
    act(() => result.current.onInput('nstop beta'))
    act(() => result.current.onInput('nstop gamma'))
    expect(result.current.showBeepBoopHint).toBe(true)
    act(() => result.current.onInput('beep boop'))
    expect(result.current.showBeepBoopHint).toBe(false)
  })
})
