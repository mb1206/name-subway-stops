import { useState, useCallback, useRef, useEffect } from 'react'
import { findAllMatches } from '../lib/matching'
import type { Stop, Toast } from '../types'

interface Options {
  onMatch?: (stop: Stop) => void
}

export function useQuiz(stops: Stop[], { onMatch }: Options = {}) {
  const [guessed, setGuessed] = useState<Set<string>>(new Set())
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

  return {
    guessed,
    toasts,
    onInput,
    guessedCount: guessed.size,
    totalCount: stops.length,
  }
}
