import { useId } from 'react'

export type SelectOption = string | {
  label: string
  value: string
}

type SelectProps = {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  error?: string
  label?: string
}

function Select({ error, label, value, onChange, options }: SelectProps) {
  const id = useId()

  return (
    <div className="field floating-field">
      <span className="relative block">
      <select id={id} className={`input floating-input ${error ? 'input-error' : ''}`} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-label={label}>
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
  if (typeof option === 'string') return { label: option, value: option }
  return option
}

export default Select
