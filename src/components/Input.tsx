import type { ReactNode } from 'react'
import { useId } from 'react'

type InputProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  error?: string
  inputMode?: 'text' | 'search' | 'email' | 'tel' | 'url' | 'none' | 'numeric' | 'decimal'
  label?: string
  leftIcon?: ReactNode
  maxLength?: number
  type?: string
}

function Input({ error, inputMode, label, leftIcon, maxLength, value, onChange, placeholder, type = 'text' }: InputProps) {
  const id = useId()
  const visibleLabel = label ?? placeholder

  return (
    <div className="field floating-field">
      <span className="relative block">
        {leftIcon && <span className="field-icon">{leftIcon}</span>}
        <input
          id={id}
          className={`input floating-input ${leftIcon ? 'pl-10' : ''} ${error ? 'input-error' : ''}`}
          inputMode={inputMode}
          maxLength={maxLength}
          type={type}
          value={value}
          placeholder=" "
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-label={visibleLabel}
        />
        {visibleLabel && <label className={`floating-label ${leftIcon ? 'floating-label-icon' : ''}`} htmlFor={id}>{visibleLabel}</label>}
      </span>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export default Input
