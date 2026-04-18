import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { Stop } from '../types'
import './QuizInput.css'

interface Props {
  onInput: (value: string) => void
  checkAlreadyGuessed?: (value: string) => Stop[]
  resetKey?: number
}

export function QuizInput({ onInput, checkAlreadyGuessed, resetKey }: Props) {
  const [value, setValue] = useState('')
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

  function handleFocus() {
    // iOS Safari scrolls the body when an input is focused even if it's fixed;
    // restore scroll to top after the browser's automatic scroll settles.
    setTimeout(() => window.scrollTo(0, 0), 50)
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
        onFocus={handleFocus}
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
      {alreadyGuessed.length > 0 && (
        <span className="quiz-input-hint">
          already named: <span className="quiz-input-hint-names">{hintNames}</span>
        </span>
      )}
    </div>
  )
}
