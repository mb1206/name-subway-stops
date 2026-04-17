import { useState, useCallback, useRef, useEffect } from 'react'
import { findAllMatches } from '../lib/matching'
import type { Stop, Toast } from '../types'

const EMPTY_SET = new Set<string>()

interface Options {
  onMatch?: (stop: Stop) => void
}

export function useQuiz(stops: Stop[], { onMatch }: Options = {}) {
  const [guessed, setGuessed] = useState<Set<string>>(new Set())
  const [guessedStops, setGuessedStops] = useState<Stop[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const timerIds = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  useEffect(() => {
    return () => {
      timerIds.current.forEach(id => clearTimeout(id))
    }
  }, [])

  const onInput = useCallback((input: string) => {
    const matches = findAllMatches(input, stops, guessed)
    if (matches.length === 0) return

    setGuessed(prev => {
      const next = new Set(prev)
      matches.forEach(m => next.add(m.id))
      return next
    })
    setGuessedStops(prev => [...prev, ...matches])

    const now = Date.now()
    const newToasts: Toast[] = matches.map(m => ({ id: `${m.id}-${now}`, stop: m }))
    setToasts(prev => [...prev, ...newToasts])

    newToasts.forEach(toast => {
      const timerId = setTimeout(() => {
        timerIds.current.delete(timerId)
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 2000)
      timerIds.current.add(timerId)
    })

    onMatch?.(matches[0])
  }, [stops, guessed, onMatch])

  const checkAlreadyGuessed = useCallback((input: string): Stop[] => {
    const allMatches = findAllMatches(input, stops, EMPTY_SET)
    if (allMatches.length === 0 || !allMatches.every(m => guessed.has(m.id))) return []
    return allMatches
  }, [stops, guessed])

  return {
    guessed,
    guessedStops,
    toasts,
    onInput,
    checkAlreadyGuessed,
    guessedCount: guessed.size,
    totalCount: stops.length,
  }
}
