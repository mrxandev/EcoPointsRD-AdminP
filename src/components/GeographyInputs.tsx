import { useId } from 'react'
import Input from './Input'
import { ALL_PROVINCE_NAMES, getMunicipalitiesForProvince } from '../data/rdGeography'

type GeographyInputProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
}

type MunicipalityInputProps = GeographyInputProps & {
  province?: string
}

export function ProvinceInput({ error, label = 'Provincia', onChange, placeholder = 'Escribe o selecciona una provincia', value }: GeographyInputProps) {
  const listId = useId()

  return (
    <>
      <Input
        error={error}
        label={label}
        list={listId}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <datalist id={listId}>
        {ALL_PROVINCE_NAMES.map((prov) => (
          <option key={prov} value={prov} />
        ))}
      </datalist>
    </>
  )
}

export function MunicipalityInput({ error, label = 'Municipio', onChange, placeholder = 'Escribe o selecciona un municipio', province, value }: MunicipalityInputProps) {
  const listId = useId()
  const municipalities = getMunicipalitiesForProvince(province)

  return (
    <>
      <Input
        error={error}
        label={label}
        list={listId}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <datalist id={listId}>
        {municipalities.map((muni) => (
          <option key={muni} value={muni} />
        ))}
      </datalist>
    </>
  )
}
