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
  beforeEach(() => vi.useFakeTimers())
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
})
