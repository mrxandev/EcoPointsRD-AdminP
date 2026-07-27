import Select from './Select'
import { ALL_PROVINCE_NAMES, getMunicipalitiesForProvince } from '../data/rdGeography'

type GeographyInputProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
}

type MunicipalityInputProps = GeographyInputProps & {
  province?: string
}

export function ProvinceInput({ error, label = 'Provincia', onChange, value }: GeographyInputProps) {
  const provinceOptions = [
    { label: 'Seleccionar provincia...', value: '' },
    ...ALL_PROVINCE_NAMES.map((prov) => ({ label: prov, value: prov })),
  ]

  return (
    <Select
      error={error}
      label={label}
      options={provinceOptions}
      value={value}
      onChange={onChange}
    />
  )
}

export function MunicipalityInput({ error, label = 'Municipio', onChange, province, value }: MunicipalityInputProps) {
  const municipalities = getMunicipalitiesForProvince(province)
  const municipalityOptions = [
    { label: 'Seleccionar municipio...', value: '' },
    ...municipalities.map((muni) => ({ label: muni, value: muni })),
  ]

  return (
    <Select
      error={error}
      label={label}
      options={municipalityOptions}
      value={value}
      onChange={onChange}
    />
  )
}
