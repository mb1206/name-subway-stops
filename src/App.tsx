import { useState, useCallback, useMemo } from 'react'
import { useQuiz } from './hooks/useQuiz'
import { Header } from './components/Header'
import { QuizInput } from './components/QuizInput'
import { ToastStack } from './components/ToastStack'
import { QuizMap } from './components/Map'
import { GuessedList } from './components/GuessedList'
import { SettingsMenu } from './components/SettingsMenu'
import { ShareModal } from './components/ShareModal'
import { HamburgerMenu } from './components/HamburgerMenu'
import stopsData from './data/stops.json'
import { computeMilesUnlocked, TOTAL_TRACK_MILES } from './lib/mileage'
import { computeBoroughStats } from './lib/borough'
import type { Stop, MapStyleId } from './types'
import './App.css'

const stops = stopsData as Stop[]

export default function App() {
  const [mapStyle, setMapStyle] = useState<MapStyleId>('streets')
  const [resetKey, setResetKey] = useState(0)
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null)
  const [showBoroughDebug, setShowBoroughDebug] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const { guessed, guessedStops, toasts, onInput, checkAlreadyGuessed, reset, guessedCount, totalCount } = useQuiz(stops, {
    onMatch: useCallback(() => setResetKey(k => k + 1), []),
  })

  const milesUnlocked = useMemo(() => computeMilesUnlocked(guessed), [guessed])
  const boroughStats = useMemo(() => computeBoroughStats(guessedStops, stops), [guessedStops])

  const handleToggleStyle = useCallback(() => {
    setMapStyle(prev => prev === 'streets' ? 'schematic' : 'streets')
  }, [])

  return (
    <div className="app" data-theme={mapStyle === 'schematic' ? 'light' : 'dark'}>
      <QuizMap stops={stops} guessed={guessed} mapStyle={mapStyle} hoveredStopId={hoveredStopId} showBoroughDebug={showBoroughDebug} />
      <Header guessedCount={guessedCount} totalCount={totalCount} milesUnlocked={milesUnlocked} totalMiles={TOTAL_TRACK_MILES} boroughStats={boroughStats} onShare={() => setShowShare(true)} />
      <QuizInput onInput={onInput} checkAlreadyGuessed={checkAlreadyGuessed} resetKey={resetKey} />
      <ToastStack toasts={toasts} />
      <GuessedList stops={guessedStops} guessedCount={guessedCount} totalCount={totalCount} milesUnlocked={milesUnlocked} totalMiles={TOTAL_TRACK_MILES} boroughStats={boroughStats} onStopHover={setHoveredStopId} onShare={() => setShowShare(true)} />
      {showShare && <ShareModal guessedCount={guessedCount} totalCount={totalCount} milesUnlocked={milesUnlocked} totalMiles={TOTAL_TRACK_MILES} boroughStats={boroughStats} onClose={() => setShowShare(false)} />}
      <HamburgerMenu />
      <SettingsMenu mapStyle={mapStyle} onToggleStyle={handleToggleStyle} onReset={reset} showBoroughDebug={showBoroughDebug} onToggleBoroughDebug={() => setShowBoroughDebug(v => !v)} />
    </div>
  )
}
