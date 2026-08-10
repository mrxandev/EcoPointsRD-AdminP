import Select from './Select'
import { ALL_PROVINCE_NAMES, getMunicipalitiesForProvince } from '../data/rdGeography'

type GeographyInputProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  label?: string
  error?: string
}

type MunicipalityInputProps = GeographyInputProps & {
  province?: string
}

export function ProvinceInput({ disabled, error, label = 'Provincia', onChange, value }: GeographyInputProps) {
  const provinceOptions = [
    { label: 'Seleccionar provincia...', value: '' },
    ...ALL_PROVINCE_NAMES.map((prov) => ({ label: prov, value: prov })),
  ]

  return (
    <Select
      disabled={disabled}
      error={error}
      label={label}
      options={provinceOptions}
      value={value}
      onChange={onChange}
    />
  )
}

export function MunicipalityInput({ disabled, error, label = 'Municipio', onChange, province, value }: MunicipalityInputProps) {
  const municipalities = getMunicipalitiesForProvince(province)
  const isPendingProvince = !province || !province.trim()

  const municipalityOptions = [
    {
      label: isPendingProvince
        ? 'Selecciona una provincia primero'
        : municipalities.length > 0
        ? 'Seleccionar municipio...'
        : 'No hay municipios disponibles',
      value: '',
    },
    ...municipalities.map((muni) => ({ label: muni, value: muni })),
  ]

  return (
    <Select
      disabled={disabled || isPendingProvince}
      error={error}
      label={label}
      options={municipalityOptions}
      value={isPendingProvince ? '' : value}
      onChange={onChange}
    />
  )
}
