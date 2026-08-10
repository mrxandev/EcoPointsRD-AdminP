import { useId } from 'react'
import { translateText } from '../utils/translations'

export type SelectOption = string | {
  label: string
  value: string
}

type SelectProps = {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  error?: string
  label?: string
}

function Select({ disabled, error, label, value, onChange, options }: SelectProps) {
  const id = useId()

  return (
    <div className="field floating-field">
      <span className="relative block">
        <select
          id={id}
          disabled={disabled}
          className={`input floating-input ${error ? 'input-error' : ''} ${disabled ? 'opacity-60 cursor-not-allowed bg-surface-container' : ''}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-label={label}
        >
          {options.map((option) => {
            const normalized = normalizeOption(option)

            return (
              <option key={normalized.value || 'all'} value={normalized.value}>
                {normalized.label || 'Todos'}
              </option>
            )
          })}
        </select>
        {label && <label className="floating-label floating-label-active" htmlFor={id}>{label}</label>}
      </span>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

function normalizeOption(option: SelectOption) {
  if (typeof option === 'string') {
    return { label: translateText(option), value: option }
  }
  return {
    label: translateText(option.label),
    value: option.value,
  }
}

export default Select
