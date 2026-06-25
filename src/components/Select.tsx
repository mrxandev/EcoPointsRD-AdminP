type SelectProps = {
  value: string
  onChange: (value: string) => void
  options: string[]
  error?: string
  label?: string
}

function Select({ error, label, value, onChange, options }: SelectProps) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <select className={`input ${error ? 'input-error' : ''}`} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)}>
        {options.map((option) => (
          <option key={option || 'all'} value={option}>
            {option || 'Todos'}
          </option>
        ))}
      </select>
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

export default Select
