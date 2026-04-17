import { useState, useCallback, useRef, useEffect } from 'react'
import { findAllMatches } from '../lib/matching'
import type { Stop, Toast } from '../types'

const EMPTY_SET = new Set<string>()
const STORAGE_KEY = 'nyc-subway-quiz-guessed'

function loadSavedStops(stops: Stop[]): Stop[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const ids: string[] = JSON.parse(raw)
    const byId = new Map(stops.map(s => [s.id, s]))
    return ids.map(id => byId.get(id)).filter((s): s is Stop => s !== undefined)
  } catch {
    return []
  }
}

interface Options {
  onMatch?: (stop: Stop) => void
}

export function useQuiz(stops: Stop[], { onMatch }: Options = {}) {
  const [guessedStops, setGuessedStops] = useState<Stop[]>(() => loadSavedStops(stops))
  const [guessed, setGuessed] = useState<Set<string>>(
    () => new Set(loadSavedStops(stops).map(s => s.id))
  )
  const [toasts, setToasts] = useState<Toast[]>([])
  const timerIds = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  useEffect(() => {
    return () => { timerIds.current.forEach(id => clearTimeout(id)) }
  }, [])

  // Persist guessed stop IDs whenever the list changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guessedStops.map(s => s.id)))
  }, [guessedStops])

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
      const fadeId = setTimeout(() => {
        timerIds.current.delete(fadeId)
        setToasts(prev => prev.map(t => t.id === toast.id ? { ...t, fading: true } : t))
      }, 1700)
      const removeId = setTimeout(() => {
        timerIds.current.delete(removeId)
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 2000)
      timerIds.current.add(fadeId)
      timerIds.current.add(removeId)
    })

    onMatch?.(matches[0])
  }, [stops, guessed, onMatch])

  const checkAlreadyGuessed = useCallback((input: string): Stop[] => {
    const allMatches = findAllMatches(input, stops, EMPTY_SET)
    if (allMatches.length === 0 || !allMatches.every(m => guessed.has(m.id))) return []
    return allMatches
  }, [stops, guessed])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setGuessed(new Set())
    setGuessedStops([])
    setToasts([])
  }, [])

  return {
    guessed,
    guessedStops,
    toasts,
    onInput,
    checkAlreadyGuessed,
    reset,
    guessedCount: guessed.size,
    totalCount: stops.length,
  }
}
