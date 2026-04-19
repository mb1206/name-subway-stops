import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
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
  const [showShare, setShowShare] = useState(false)
  const [showHints, setShowHints] = useState(false)

  const { guessed, guessedStops, toasts, onInput, checkAlreadyGuessed, reset, guessedCount, totalCount } = useQuiz(stops, {
    onMatch: useCallback(() => setResetKey(k => k + 1), []),
  })

  const milesUnlocked = useMemo(() => computeMilesUnlocked(guessed), [guessed])
  const boroughStats = useMemo(() => computeBoroughStats(guessedStops, stops), [guessedStops])

  const stopIdsByLine = useMemo(() => {
    const map = new Map<string, string[]>()
    stops.forEach(stop => stop.lines.forEach(line => {
      if (!map.has(line)) map.set(line, [])
      map.get(line)!.push(stop.id)
    }))
    return map
  }, [stops])

  const completedLines = useMemo(() => {
    const done = new Set<string>()
    stopIdsByLine.forEach((ids, line) => {
      if (ids.every(id => guessed.has(id))) done.add(line)
    })
    return done
  }, [stopIdsByLine, guessed])

  const handleToggleStyle = useCallback(() => {
    setMapStyle(prev => prev === 'streets' ? 'schematic' : 'streets')
  }, [])

  const hasWon = guessedCount === totalCount && totalCount > 0
  const prevWonRef = useRef(false)
  useEffect(() => {
    if (hasWon && !prevWonRef.current) {
      confetti({ particleCount: 180, spread: 80, origin: { y: 0.5 } })
    }
    prevWonRef.current = hasWon
  }, [hasWon])

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    function update() {
      const offsetTop = vv!.offsetTop
      const offset = Math.max(0, window.innerHeight - vv!.height - offsetTop)
      document.documentElement.style.setProperty('--keyboard-offset', `${offset}px`)
      document.documentElement.style.setProperty('--vv-offset-top', `${offsetTop}px`)
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return (
    <div className="app" data-theme={mapStyle === 'schematic' ? 'light' : 'dark'}>
      <QuizMap stops={stops} guessed={guessed} mapStyle={mapStyle} hoveredStopId={hoveredStopId} showHints={showHints} />
      <Header guessedCount={guessedCount} totalCount={totalCount} milesUnlocked={milesUnlocked} totalMiles={TOTAL_TRACK_MILES} boroughStats={boroughStats} onShare={() => setShowShare(true)} />
      <QuizInput onInput={onInput} checkAlreadyGuessed={checkAlreadyGuessed} resetKey={resetKey} showHints={showHints} onToggleHints={() => setShowHints(v => !v)} />
      <ToastStack toasts={toasts} />
      <GuessedList stops={guessedStops} guessedCount={guessedCount} totalCount={totalCount} milesUnlocked={milesUnlocked} totalMiles={TOTAL_TRACK_MILES} boroughStats={boroughStats} onStopHover={setHoveredStopId} onShare={() => setShowShare(true)} />
      {showShare && <ShareModal guessedCount={guessedCount} totalCount={totalCount} milesUnlocked={milesUnlocked} totalMiles={TOTAL_TRACK_MILES} boroughStats={boroughStats} completedLines={completedLines} onClose={() => setShowShare(false)} />}
      <HamburgerMenu mapStyle={mapStyle} onToggleStyle={handleToggleStyle} onReset={reset} />
      <SettingsMenu mapStyle={mapStyle} onToggleStyle={handleToggleStyle} onReset={reset} />
    </div>
  )
}
