import { useId, useState, useRef, useEffect, useMemo } from 'react'
import { translateText } from '../utils/translations'
import { FiChevronDown } from 'react-icons/fi'

export type SelectOption = string | {
  label: string
  value: string
}

type SearchableSelectProps = {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
  placeholder?: string
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

function SearchableSelect({ disabled, error, label, required, value, onChange, options, placeholder = 'Buscar...' }: SearchableSelectProps) {
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const normalizedOptions = useMemo(() => options.map(normalizeOption), [options])

  const selectedOption = useMemo(() => 
    normalizedOptions.find(opt => opt.value === value),
  [normalizedOptions, value])

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return normalizedOptions
    const lowerSearch = searchTerm.toLowerCase()
    return normalizedOptions.filter(opt => 
      (opt.label || 'Todos').toLowerCase().includes(lowerSearch) || 
      opt.value.toLowerCase().includes(lowerSearch)
    )
  }, [normalizedOptions, searchTerm])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
    }
  }, [isOpen])

  const handleSelect = (newValue: string) => {
    onChange(newValue)
    setIsOpen(false)
  }

  return (
    <div className="field floating-field" ref={containerRef}>
      <span className="relative block">
        <div 
          className={`relative flex items-center w-full input floating-input ${error ? 'input-error' : ''} ${disabled ? 'opacity-60 cursor-not-allowed bg-surface-container' : 'cursor-text'} ${isOpen ? 'ring-2 ring-primary border-primary' : ''}`}
          onClick={() => {
            if (!disabled) {
              setIsOpen(true)
              inputRef.current?.focus()
            }
          }}
        >
          {(!isOpen && selectedOption) ? (
             <span className="flex-1 truncate block py-[1px]">
               {selectedOption.label || 'Todos'}
             </span>
          ) : (
            <input
              id={id}
              ref={inputRef}
              type="text"
              disabled={disabled}
              className="w-full bg-transparent outline-none truncate"
              placeholder={selectedOption?.label || placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              aria-invalid={Boolean(error)}
              aria-label={label}
            />
          )}
          <FiChevronDown className={`ml-2 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <ul className="absolute z-50 w-full mt-1 bg-surface-container border border-outline-variant rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value || 'all'}
                  className={`px-4 py-2 cursor-pointer hover:bg-surface-container-high transition-colors ${opt.value === value ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface'}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(opt.value)
                  }}
                >
                  {opt.label || 'Todos'}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-on-surface-variant text-center">
                No hay resultados
              </li>
            )}
          </ul>
        )}

        {label && (
          <label className={`floating-label ${(isOpen || value || searchTerm) ? 'floating-label-active' : ''}`} htmlFor={id}>
            {label}
            {required && <span className="text-red-500 font-bold ml-1">*</span>}
          </label>
        )}
      </span>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export default SearchableSelect
