import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  FiCheckCircle,
  FiDownload,
  FiEdit2,
  FiEye,
  FiPauseCircle,
  FiPlayCircle,
  FiRefreshCw,
  FiSend,
  FiSlash,
  FiTruck,
  FiUploadCloud,
  FiXCircle,
} from 'react-icons/fi'
import { Badge, Input, Loader, MapPicker, Modal, Panel, Select } from '../../../components'
import { getApiErrorMessage } from '../../../api'
import {
  createAdminResource,
  listAdminResource,
  runAdminAction,
  updateAdminResource,
  type AdminRecord,
} from '../../../services/adminModulesService'
import { formatDate } from '../utils'
import type { ModuleConfig, ModuleField } from './moduleConfig'

type ResourcePageProps = {
  config: ModuleConfig
  onToast: (message: string, tone?: 'info' | 'success' | 'error') => void
}

function ResourcePage({ config, onToast }: ResourcePageProps) {
  const [fields, setFields] = useState<ModuleField[]>(config.fields ?? [])
  const [filterFields, setFilterFields] = useState<ModuleField[]>(config.filters ?? [])
  const [records, setRecords] = useState<AdminRecord[]>([])
  const [filters, setFilters] = useState<Record<string, string>>({})
  const emptyForm = useMemo(() => buildInitialForm(fields), [fields])
  const [form, setForm] = useState<Record<string, unknown>>(emptyForm)
  const [selected, setSelected] = useState<AdminRecord | null>(null)
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const hasList = config.columns.length > 0
  const isMissionModule = config.endpoint === '/api/admin/missions'
  const formTitle = selected && config.canUpdate ? `Editar ${config.title}` : config.createTitle ?? `Crear ${config.title}`

  useEffect(() => {
    setFields(config.fields ?? [])
    setFilterFields(config.filters ?? [])
    setFilters({})
  }, [config])

  const loadRecords = useCallback(async () => {
    if (!hasList) return

    setLoading(true)
    try {
      setRecords(await listAdminResource(config.endpoint, config.listKeys, filters))
    } catch (error) {
      onToast(getApiErrorMessage(error), 'error')
    } finally {
      setLoading(false)
    }
  }, [config.endpoint, config.listKeys, filters, hasList, onToast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRecords()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadRecords])

  useEffect(() => {
    if (!isMissionModule) return

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const organizations = await listAdminResource('/api/admin/organizations', ['organizations', 'data', 'results'], {})
          const organizationOptions = organizations
            .filter((organization) => organization.id)
            .map((organization) => ({
              label: String(organization.name ?? organization.email ?? organization.id),
              value: String(organization.id),
            }))
          const formOrganizationOptions = [{ label: 'Sin organizacion', value: '' }, ...organizationOptions]
          const defaultOrganization = organizationOptions.find((option) => normalizeText(option.label).includes('gobierno rd')) ?? organizationOptions[0]

          setFields((current) => current.map((field) => (
            field.key === 'organization_id'
              ? { ...field, defaultValue: defaultOrganization?.value ?? '', options: formOrganizationOptions }
              : field
          )))
          setFilterFields((current) => current.map((field) => (
            field.key === 'organization_id'
              ? { ...field, options: [{ label: 'Todas', value: '' }, ...organizationOptions] }
              : field
          )))
          setForm((current) => current.organization_id ? current : { ...current, organization_id: defaultOrganization?.value ?? '' })
        } catch (error) {
          onToast(getApiErrorMessage(error), 'error')
        }
      })()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [isMissionModule, onToast])

  const handleView = (record: AdminRecord) => {
    setSelected(record)
    setModal('view')
  }

  const handleSelect = (record: AdminRecord) => {
    if (!config.canUpdate) return

    setSelected(record)
    setForm(buildFormFromRecord(fields, record))
    setModal('edit')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!config.canCreate && !selected) return

    const validation = validateRequiredFields(fields, form)
    if (validation) {
      onToast(validation, 'error')
      return
    }

    setSaving(true)
    try {
      if (selected?.id && config.canUpdate) {
        await updateAdminResource(config.endpoint, selected.id, form)
        onToast('Registro actualizado correctamente.', 'success')
      } else {
        await createAdminResource(resolveCreateEndpoint(config, form), form)
        onToast('Registro creado correctamente.', 'success')
      }

      setForm(emptyForm)
      setSelected(null)
      setModal(null)
      await loadRecords()
    } catch (error) {
      onToast(getApiErrorMessage(error), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAction = async (record: AdminRecord, action: string) => {
    if (!record.id) return

    const notes = action === 'reject' ? window.prompt('Notas del rechazo') ?? '' : ''
    setSaving(true)
    try {
      await runAdminAction(config.endpoint, record.id, action, notes ? { notes } : {})
      onToast('Accion ejecutada correctamente.', 'success')
      await loadRecords()
    } catch (error) {
      onToast(getApiErrorMessage(error), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <section className="min-w-0 space-y-6">
        <div className="page-heading">
          <div>
            <p>Admin / {config.title}</p>
            <h1>{config.title}</h1>
            <span>{config.description}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {config.canCreate && <button className="button-primary" onClick={() => { setSelected(null); setForm(emptyForm); setModal('create') }}>Crear</button>}
            {hasList && <button className="button-secondary" onClick={loadRecords}><FiRefreshCw /> Actualizar</button>}
          </div>
        </div>

        {filterFields.length > 0 && (
          <Panel title="Busqueda rapida" action={<button className="icon-tab" onClick={loadRecords} aria-label={`Actualizar ${config.title}`}><FiDownload /></button>}>
            <div className="grid items-end gap-3 md:grid-cols-3">
              {filterFields.map((field) => (
                <FieldControl
                  key={field.key}
                  field={field}
                  value={filters[field.key] ?? ''}
                  onChange={(value) => setFilters((current) => ({ ...current, [field.key]: value }))}
                />
              ))}
            </div>
          </Panel>
        )}

        <Panel title={`Listado de ${config.title}`}>
          {config.filters && (
            <p className="mb-4 text-sm text-on-surface-variant">Usa los filtros superiores para encontrar registros y revisar acciones disponibles.</p>
          )}
          {!hasList && <EmptyModule />}
          {loading && <Loader message={`Cargando ${config.title.toLowerCase()}...`} />}
          {!loading && hasList && (
            <ResourceTable
              actions={config.actions ?? []}
              columns={config.columns}
              records={records}
              saving={saving}
              selectable={Boolean(config.canUpdate)}
              onAction={handleAction}
              onSelect={handleSelect}
              onView={handleView}
            />
          )}
        </Panel>
      </section>

      <Modal title={formTitle} open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)}>
        <Panel title="Datos del registro">
          <form className="space-y-3" onSubmit={handleSubmit}>
            {fields.map((field) => (
              <FieldControl
                key={field.key}
                field={field}
                value={String(form[field.key] ?? '')}
                onChange={(value) => setForm((current) => ({ ...current, [field.key]: castFieldValue(field, value) }))}
              />
            ))}
            {isMissionModule && (
              <MapPicker
                latitude={String(form.latitude ?? '')}
                longitude={String(form.longitude ?? '')}
                onChange={(latitude, longitude) => setForm((current) => ({ ...current, latitude, longitude }))}
              />
            )}
            <button className="button-primary w-full" disabled={saving}>
              {saving ? 'Guardando...' : selected ? 'Guardar cambios' : <><FiSend /> Enviar</>}
            </button>
          </form>
        </Panel>
      </Modal>

      <Modal title={`Detalle de ${config.title}`} open={modal === 'view'} onClose={() => setModal(null)}>
        <RecordDetail record={selected} />
      </Modal>
    </>
  )
}

function ResourceTable({
  actions,
  columns,
  records,
  saving,
  selectable,
  onAction,
  onSelect,
  onView,
}: {
  actions: NonNullable<ModuleConfig['actions']>
  columns: string[]
  records: AdminRecord[]
  saving: boolean
  selectable: boolean
  onAction: (record: AdminRecord, action: string) => void
  onSelect: (record: AdminRecord) => void
  onView: (record: AdminRecord) => void
}) {
  if (records.length === 0) return <p className="rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant">No hay registros para mostrar.</p>
  const showActions = true

  return (
    <div className="data-table-shell">
      <div className="overflow-x-auto">
      <table className="data-table min-w-[860px]">
        <thead>
          <tr>
            {columns.map((column) => <th key={column} className="px-3 py-3 font-bold">{formatColumn(column)}</th>)}
            {showActions && <th className="px-3 py-3 font-bold text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
          {records.map((record, index) => (
            <tr key={String(record.id ?? index)} className="align-top">
              {columns.map((column) => (
                <td key={column} className="max-w-[240px]">
                  {renderValue(column, record[column])}
                </td>
              ))}
              {showActions && (
                <td>
                  <div className="table-actions justify-end">
                    <button className="table-icon-button" onClick={() => onView(record)} aria-label="Ver registro"><FiEye /></button>
                    {selectable && <button className="table-icon-button" onClick={() => onSelect(record)} aria-label="Editar registro"><FiEdit2 /></button>}
                    {actions.map((item) => (
                      <button
                        key={item.action}
                        className={`table-icon-button ${item.tone === 'danger' ? 'table-icon-danger' : ''}`}
                        disabled={saving}
                        title={item.label}
                        onClick={() => onAction(record, item.action)}
                      >
                        {getActionIcon(item.action)}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div className="table-footer">
        <span>Mostrando 1-{records.length} de {records.length} registros</span>
        <div className="pagination">
          <button disabled>{'<'}</button>
          <button className="active">1</button>
          <button disabled>{'>'}</button>
        </div>
      </div>
    </div>
  )
}

function FieldControl({ field, onChange, value }: { field: ModuleField; onChange: (value: string) => void; value: string }) {
  if (field.type === 'toggle') {
    return <ToggleControl field={field} value={value} onChange={onChange} />
  }

  if (field.type === 'choice') {
    return <ChoiceControl field={field} value={value} onChange={onChange} />
  }

  if (field.type === 'select') {
    return <Select label={field.label} value={value} options={field.options ?? []} onChange={onChange} />
  }

  if (field.type === 'textarea') {
    return (
      <label className="field">
        <span className="field-label">{field.label}</span>
        <textarea className="input min-h-28 resize-y" value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
    )
  }

  return <Input label={field.label} placeholder={field.label} type={field.type ?? 'text'} value={value} onChange={onChange} />
}

function ChoiceControl({ field, onChange, value }: { field: ModuleField; onChange: (value: string) => void; value: string }) {
  const [manualEntry, setManualEntry] = useState(false)
  const options = field.options ?? []
  const normalizedOptions = options.map((option) => (typeof option === 'string' ? { label: option, value: option } : option))
  const optionValues = normalizedOptions.map((option) => option.value)
  const isOtherValue = field.allowOther && value && !optionValues.includes(value)
  const showManualInput = Boolean(field.allowOther && (manualEntry || isOtherValue))
  const activeValue = showManualInput ? 'Otro' : value

  return (
    <div className="choice-field">
      <span>{field.label}</span>
      <div className="choice-grid">
        {normalizedOptions.map((option) => (
          <button
            key={option.value}
            className={`choice-chip ${activeValue === option.value ? 'choice-chip-active' : ''}`}
            type="button"
            onClick={() => {
              const isOtherOption = isOtherChoice(option.value, option.label)
              setManualEntry(isOtherOption)
              onChange(isOtherOption ? '' : option.value)
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
      {showManualInput && (
        <Input
          label={`${field.label} personalizado`}
          placeholder={`${field.label} personalizado`}
          type={field.key === 'points_reward' ? 'number' : 'text'}
          value={isOtherValue ? value : ''}
          onChange={onChange}
        />
      )}
    </div>
  )
}

function ToggleControl({ field, onChange, value }: { field: ModuleField; onChange: (value: string) => void; value: string }) {
  const enabled = value === 'true' || value === '1'

  return (
    <button className={`toggle-field ${enabled ? 'toggle-field-active' : ''}`} type="button" onClick={() => onChange(enabled ? 'false' : 'true')}>
      <span>
        <strong>{field.label}</strong>
        <small>{enabled ? 'Activado' : 'Desactivado'}</small>
      </span>
      <i aria-hidden="true" />
    </button>
  )
}

function isOtherChoice(value: string, label: string) {
  return value.toLowerCase() === 'otro' || label.toLowerCase() === 'otro'
}

function EmptyModule() {
  return <p className="rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant">Este modulo usa acciones directas. Completa el formulario lateral para enviar la solicitud al backend.</p>
}

function RecordDetail({ record }: { record: AdminRecord | null }) {
  if (!record) return <p className="table-empty">No hay registro seleccionado.</p>

  return (
    <div className="detail-grid">
      {Object.entries(record).map(([key, value]) => (
        <div className="detail-item" key={key}>
          <span>{formatColumn(key)}</span>
          <strong>{formatDetailValue(value)}</strong>
        </div>
      ))}
    </div>
  )
}

function buildInitialForm(fields: ModuleField[]) {
  return Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? getFirstOptionValue(field) ?? '']))
}

function buildFormFromRecord(fields: ModuleField[], record: AdminRecord) {
  return Object.fromEntries(fields.map((field) => [field.key, record[field.key] ?? field.defaultValue ?? getFirstOptionValue(field) ?? '']))
}

function getFirstOptionValue(field: ModuleField) {
  const first = field.options?.[0]
  if (!first) return ''
  if (typeof first === 'string') return first
  return first.value
}

function validateRequiredFields(fields: ModuleField[], form: Record<string, unknown>) {
  const missing = fields.find((field) => field.required && !String(form[field.key] ?? '').trim())
  return missing ? `${missing.label} es requerido.` : ''
}

function castFieldValue(field: ModuleField, value: string) {
  if (field.type === 'toggle') return value
  if (field.type === 'number' || ['max_participants', 'points_reward'].includes(field.key)) return value === '' || value === 'Otro' ? '' : Number(value)
  return value
}

function resolveCreateEndpoint(config: ModuleConfig, form: Record<string, unknown>) {
  if (config.endpoint === '/api/admin/notifications/global' && form.user_id) return '/api/admin/notifications/user'
  return config.createEndpoint ?? config.endpoint
}

function renderValue(column: string, value: unknown) {
  if (column === 'created_at' || column.endsWith('_at')) return <span className="text-on-surface-variant">{formatDate(String(value ?? ''))}</span>
  if (column === 'status' && value) return <Badge label={String(value)} tone={badgeTone(String(value))} />
  if (typeof value === 'boolean') return value ? 'Si' : 'No'
  if (value === null || value === undefined || value === '') return <span className="text-on-surface-variant">-</span>
  return <span className="break-words">{String(value)}</span>
}

function badgeTone(value: string) {
  if (['ACTIVE', 'APPROVED', 'DELIVERED', 'COMPLETED', 'PUBLISHED'].includes(value)) return 'success'
  if (['PENDING', 'IN_PROGRESS', 'SUSPENDED'].includes(value)) return 'warning'
  if (['BANNED', 'REJECTED', 'CANCELLED', 'INACTIVE'].includes(value)) return 'danger'
  return 'default'
}

function getActionIcon(action: string) {
  if (action === 'publish') return <FiUploadCloud />
  if (action === 'start') return <FiPlayCircle />
  if (action === 'complete' || action === 'approve' || action === 'activate') return <FiCheckCircle />
  if (action === 'deliver') return <FiTruck />
  if (action === 'deactivate') return <FiPauseCircle />
  if (action === 'cancel' || action === 'reject') return <FiXCircle />
  return <FiSlash />
}

function formatColumn(column: string) {
  return column.replaceAll('_', ' ')
}

function formatDetailValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export default ResourcePage
