import { useState, useEffect, useRef } from 'react'
import { X, Binoculars, Zap } from 'lucide-react'
import { CheatCodeModal } from './CheatCodeModal'
import type { Stop } from '../types'
import './QuizInput.css'

interface Props {
  onInput: (value: string) => void
  checkAlreadyGuessed?: (value: string) => Stop[]
  resetKey?: number
  showHints?: boolean
  onToggleHints?: () => void
  showBeepBoopHint?: boolean
}

export function QuizInput({ onInput, checkAlreadyGuessed, resetKey, showHints, onToggleHints, showBeepBoopHint }: Props) {
  const [value, setValue] = useState('')
  const [showCheatModal, setShowCheatModal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const justSubmittedRef = useRef(false)
  const alreadyGuessed = !justSubmittedRef.current && value.trim() !== '' ? (checkAlreadyGuessed?.(value) ?? []) : []

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    justSubmittedRef.current = false
    setValue('')
  }, [resetKey])

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    justSubmittedRef.current = false
    setValue(e.target.value)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      justSubmittedRef.current = true
      onInput(value)
    }
  }

  function handleClear() {
    justSubmittedRef.current = false
    setValue('')
    inputRef.current?.focus()
  }

  const hintNames = alreadyGuessed.map(s => s.name).join(', ')

  return (
    <div className="quiz-input-container">
      <input
        ref={inputRef}
        className={`quiz-input${alreadyGuessed.length > 0 ? ' quiz-input--already' : ''}`}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a station and press Enter..."
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
      />
      {value && (
        <button className="quiz-input-clear" onClick={handleClear} tabIndex={-1} aria-label="Clear input">
          <X size={14} />
        </button>
      )}
      {(onToggleHints || showBeepBoopHint) && (
        <div className="quiz-input-actions">
          {showBeepBoopHint && (
            <button
              className="quiz-help-toggle"
              onPointerDown={e => e.preventDefault()}
              onClick={() => setShowCheatModal(true)}
              aria-label="Show cheat code"
            >
              <Zap size={15} aria-hidden="true" />
            </button>
          )}
          {onToggleHints && (
            <button
              className={`quiz-hint-toggle${showHints ? ' quiz-hint-toggle--active' : ''}`}
              onPointerDown={e => e.preventDefault()}
              onClick={onToggleHints}
              aria-label={showHints ? 'Hide missing stops' : 'Show missing stops'}
              aria-pressed={showHints}
            >
              <Binoculars size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      {showCheatModal && <CheatCodeModal onClose={() => setShowCheatModal(false)} />}
      {alreadyGuessed.length > 0 && (
        <span className="quiz-input-hint">
          already named: <span className="quiz-input-hint-names">{hintNames}</span>
        </span>
      )}
    </div>
  )
}
