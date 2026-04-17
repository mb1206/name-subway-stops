import { useState, useCallback } from 'react'
import { findMatch } from '../lib/matching'
import type { Stop, Toast } from '../types'

interface Options {
  onMatch?: (stop: Stop) => void
}

export function useQuiz(stops: Stop[], { onMatch }: Options = {}) {
  const [guessed, setGuessed] = useState<Set<string>>(new Set())
  const [toasts, setToasts] = useState<Toast[]>([])

  const onInput = useCallback((input: string) => {
    const match = findMatch(input, stops, guessed)
    if (!match) return

    setGuessed(prev => new Set([...prev, match.id]))

    const toast: Toast = { id: `${match.id}-${Date.now()}`, stop: match }
    setToasts(prev => [...prev, toast])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 2000)

    onMatch?.(match)
  }, [stops, guessed, onMatch])

  return {
    guessed,
    toasts,
    onInput,
    guessedCount: guessed.size,
    totalCount: stops.length,
  }
}
