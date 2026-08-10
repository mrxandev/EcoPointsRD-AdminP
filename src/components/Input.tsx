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
  list?: string
  maxLength?: number
  required?: boolean
  type?: string
}

function Input({ error, inputMode, label, leftIcon, list, maxLength, required, value, onChange, placeholder, type = 'text' }: InputProps) {
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
          list={list}
          maxLength={maxLength}
          type={type}
          value={value}
          placeholder=" "
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-label={visibleLabel}
        />
        {visibleLabel && (
          <label className={`floating-label ${leftIcon ? 'floating-label-icon' : ''}`} htmlFor={id}>
            {visibleLabel}
            {required && <span className="text-red-500 font-bold ml-1">*</span>}
          </label>
        )}
      </span>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export default Input
