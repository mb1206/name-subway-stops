import { useState, useEffect, useRef } from 'react'
import './QuizInput.css'

interface Props {
  onInput: (value: string) => void
  resetKey?: number
}

export function QuizInput({ onInput, resetKey }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue('')
    inputRef.current?.focus()
  }, [resetKey])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setValue(newValue)
    onInput(newValue)
  }

  return (
    <div className="quiz-input-container">
      <input
        ref={inputRef}
        className="quiz-input"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type a stop name..."
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        autoFocus
      />
    </div>
  )
}
