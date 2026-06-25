export function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

export function formatDominicanCedula(value: string) {
  const digits = onlyDigits(value).slice(0, 11)
  const first = digits.slice(0, 3)
  const second = digits.slice(3, 10)
  const third = digits.slice(10, 11)

  if (digits.length <= 3) return first
  if (digits.length <= 10) return `${first}-${second}`
  return `${first}-${second}-${third}`
}

export function formatDominicanPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 10)
  const area = digits.slice(0, 3)
  const prefix = digits.slice(3, 6)
  const line = digits.slice(6, 10)

  if (digits.length <= 3) return area ? `(${area}` : ''
  if (digits.length <= 6) return `(${area})-${prefix}`
  return `(${area})-${prefix}-${line}`
}
