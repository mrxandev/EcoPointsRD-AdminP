import Input from './Input'
import { formatDominicanPhone } from '../formatters'

type PhoneInputProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
}

export function PhoneInput({ error, label = 'Telefono', onChange, placeholder = '(809)-844-3434', value }: PhoneInputProps) {
  return (
    <Input
      error={error}
      inputMode="tel"
      label={label}
      maxLength={14}
      placeholder={placeholder}
      value={formatDominicanPhone(value)}
      onChange={(val) => onChange(formatDominicanPhone(val))}
    />
  )
}
