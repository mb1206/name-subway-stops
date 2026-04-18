import { useState, useEffect, useRef } from 'react'
import type { Stop } from '../types'
import './QuizInput.css'

interface Props {
  onInput: (value: string) => void
  checkAlreadyGuessed?: (value: string) => Stop[]
  resetKey?: number
  isFilling?: boolean
}

export function QuizInput({ onInput, checkAlreadyGuessed, resetKey, isFilling }: Props) {
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

  useEffect(() => {
    if (isFilling) setValue('')
  }, [isFilling])

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

  const hintNames = alreadyGuessed.map(s => s.name).join(', ')

  return (
    <div className="quiz-input-container">
      <input
        ref={inputRef}
        className={`quiz-input${alreadyGuessed.length > 0 ? ' quiz-input--already' : ''}${isFilling ? ' quiz-input--filling' : ''}`}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={isFilling ? 'filling in numbers…' : 'Type a station and press Enter...'}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
        disabled={isFilling}
      />
      {alreadyGuessed.length > 0 && (
        <span className="quiz-input-hint">
          already named: <span className="quiz-input-hint-names">{hintNames}</span>
        </span>
      )}
    </div>
  )
}
