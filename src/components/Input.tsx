import type { ReactNode } from 'react'

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
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <span className="relative block">
        {leftIcon && <span className="field-icon">{leftIcon}</span>}
        <input className={`input ${leftIcon ? 'pl-10' : ''} ${error ? 'input-error' : ''}`} inputMode={inputMode} maxLength={maxLength} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} />
      </span>
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

export default Input
