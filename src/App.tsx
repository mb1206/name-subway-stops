import { useState, useCallback } from 'react'
import { useQuiz } from './hooks/useQuiz'
import { Header } from './components/Header'
import { QuizInput } from './components/QuizInput'
import { ToastStack } from './components/ToastStack'
import { QuizMap } from './components/Map'
import stopsData from './data/stops.json'
import type { Stop, MapStyleId } from './types'
import './App.css'

const stops = stopsData as Stop[]

export default function App() {
  const [mapStyle, setMapStyle] = useState<MapStyleId>('streets')
  const [resetKey, setResetKey] = useState(0)

  const { guessed, toasts, onInput, guessedCount, totalCount } = useQuiz(stops, {
    onMatch: useCallback(() => setResetKey(k => k + 1), []),
  })

  const handleToggleStyle = useCallback(() => {
    setMapStyle(prev => prev === 'streets' ? 'schematic' : 'streets')
  }, [])

  return (
    <div className="app">
      <QuizMap stops={stops} guessed={guessed} mapStyle={mapStyle} />
      <Header
        guessedCount={guessedCount}
        totalCount={totalCount}
        mapStyle={mapStyle}
        onToggleStyle={handleToggleStyle}
      />
      <ToastStack toasts={toasts} />
      <QuizInput onInput={onInput} resetKey={resetKey} />
    </div>
  )
}
