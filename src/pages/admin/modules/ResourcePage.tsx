import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiEye,
  FiFileText,
  FiMapPin,
  FiPauseCircle,
  FiPlayCircle,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiSettings,
  FiSlash,
  FiTruck,
  FiUploadCloud,
  FiXCircle,
} from 'react-icons/fi'
import { Badge, Input, Loader, MapPicker, Modal, MunicipalityInput, Panel, PhoneInput, ProvinceInput, Select, TableActionButton, TablePagination } from '../../../components'
import { getApiErrorMessage } from '../../../api'
import { onlyDigits } from '../../../formatters'
import {
  createAdminResource,
  listAdminResource,
  runAdminAction,
  updateAdminResource,
  type AdminRecord,
} from '../../../services/adminModulesService'
import { getAdminUsers } from '../../../services/adminUsersService'
import type { AdminUser } from '../../../types'
import { formatDate, getUserName } from '../utils'
import { translateText } from '../../../utils/translations'
import type { ModuleConfig, ModuleField } from './moduleConfig'

type ResourcePageProps = {
  config: ModuleConfig
  users: AdminUser[]
  onToast: (message: string, tone?: 'info' | 'success' | 'error') => void
}

type ResourceReferences = {
  centers: AdminRecord[]
  missions: AdminRecord[]
  organizations: AdminRecord[]
  rewards: AdminRecord[]
}

type ReferenceOption = {
  keywords: string
  label: string
  value: string
}

type PendingAction = {
  action: string
  label: string
  record: AdminRecord
} | null

function ResourcePage({ config, onToast, users }: ResourcePageProps) {
  const [fields, setFields] = useState<ModuleField[]>(config.fields ?? [])
  const [filterFields, setFilterFields] = useState<ModuleField[]>(config.filters ?? [])
  const [records, setRecords] = useState<AdminRecord[]>([])
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [referenceUsers, setReferenceUsers] = useState<AdminUser[]>(users)
  const [references, setReferences] = useState<ResourceReferences>({ centers: [], missions: [], organizations: [], rewards: [] })
  const emptyForm = useMemo(() => buildInitialForm(fields), [fields])
  const [form, setForm] = useState<Record<string, unknown>>(emptyForm)
  const [selected, setSelected] = useState<AdminRecord | null>(null)
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | 'confirmAction' | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const hasList = config.columns.length > 0
  const isMissionModule = config.endpoint === '/api/admin/missions'
  const isPointsModule = config.endpoint === '/api/admin/points/transactions' || config.title === 'Puntos'
  const isRecyclingCentersModule = config.endpoint === '/api/admin/recycling/centers'
  const isRecyclingLogModule = config.endpoint === '/api/admin/recycling/logs' || config.title === 'Reciclaje'
  const formTitle = selected && config.canUpdate ? `Editar ${config.title}` : config.createTitle ?? `Crear ${config.title}`
  const displayFilterFields = useMemo(() => buildDisplayFilterFields(filterFields), [filterFields])
  const lookupUsers = referenceUsers.length ? referenceUsers : users
  const resolvedFilters = useMemo(() => resolveUserFilters(filters, lookupUsers), [filters, lookupUsers])

  const displayRecords = useMemo(() => {
    if (!isRecyclingLogModule) return records

    const userQuery = String(filters.user_id ?? '').trim().toLowerCase()
    const matQuery = String(filters.material_type ?? '').trim().toUpperCase()
    const standardMaterials = ['ALUMINUM', 'GLASS', 'PET', 'PAPER', 'E_WASTE']

    return records.filter((r) => {
      if (matQuery) {
        const itemMat = String(r.material_type ?? '').trim().toUpperCase()
        if (matQuery === 'OTHER') {
          if (standardMaterials.includes(itemMat)) {
            return false
          }
        } else if (itemMat !== matQuery) {
          return false
        }
      }

      if (userQuery) {
        const u = lookupUsers.find((user) => String(user.id) === String(r.user_id))
        const matchUserId = String(r.user_id ?? '').toLowerCase().includes(userQuery)

        if (!u) {
          return matchUserId
        }

        const matchName = getUserName(u).toLowerCase().includes(userQuery)
        const matchEmail = String(u.email ?? '').toLowerCase().includes(userQuery)
        const matchCedula = String(u.cedula ?? '').toLowerCase().includes(userQuery)

        return matchUserId || matchName || matchEmail || matchCedula
      }

      return true
    })
  }, [isRecyclingLogModule, records, filters.user_id, filters.material_type, lookupUsers])

  const loadRecords = useCallback(async () => {
    if (!hasList) return

    setLoading(true)
    try {
      setRecords(await listAdminResource(config.endpoint, config.listKeys, resolvedFilters))
    } catch (error) {
      onToast(getApiErrorMessage(error), 'error')
    } finally {
      setLoading(false)
    }
  }, [config.endpoint, config.listKeys, hasList, onToast, resolvedFilters])

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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const [allUsers, organizations, missions, rewards, centers] = await Promise.all([
            getAdminUsers({ role: '', status: 'ACTIVE', search: '' }),
            listAdminResource('/api/admin/organizations', ['organizations', 'data', 'results'], {}),
            listAdminResource('/api/admin/missions', ['missions', 'data', 'results'], {}),
            listAdminResource('/api/admin/rewards', ['rewards', 'data', 'results'], {}),
            listAdminResource('/api/admin/recycling/centers', ['centers', 'data', 'results'], {}),
          ])

          setReferenceUsers(allUsers)
          setReferences({ centers, organizations, missions, rewards })
        } catch {
          setReferenceUsers(users)
          setReferences({ centers: [], organizations: [], missions: [], rewards: [] })
        }
      })()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [users])

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
      const rawPayload = Object.fromEntries(
        Object.entries(form).map(([key, val]) => [key, val === '' ? null : val])
      )

      const sanitizedPayload: Record<string, unknown> = { ...rawPayload }

      const isUuid = (str: unknown) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim())

      // Limpiar claves foráneas opcionales que no tengan un UUID válido
      Object.keys(sanitizedPayload).forEach((key) => {
        if (key.endsWith('_id') && key !== 'user_id') {
          if (!isUuid(sanitizedPayload[key])) {
            sanitizedPayload[key] = null
          }
        }
      })

      if (isRecyclingLogModule) {
        const lbs = parseFloat(String(sanitizedPayload.weight_lbs ?? sanitizedPayload.weight_kg ?? '0')) || 0
        const pts = parseInt(String(sanitizedPayload.points_awarded ?? '0'), 10) || 0

        sanitizedPayload.weight_lbs = lbs
        sanitizedPayload.weight_kg = lbs
        sanitizedPayload.points_awarded = pts
      }

      if (selected?.id && config.canUpdate) {
        await updateAdminResource(resolveMutationEndpoint(config), selected.id, sanitizedPayload)
        onToast('Registro actualizado correctamente.', 'success')
      } else {
        await createAdminResource(resolveCreateEndpoint(config, sanitizedPayload), sanitizedPayload)
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

  const handleActionRequest = (record: AdminRecord, action: string, label: string) => {
    if (!record.id) return

    setPendingAction({ action, label, record })
    setActionNotes('')
    setModal('confirmAction')
  }

  const closeActionConfirmation = () => {
    if (saving) return

    setPendingAction(null)
    setActionNotes('')
    setModal(null)
  }

  const handleConfirmAction = async () => {
    if (!pendingAction?.record.id) return

    setSaving(true)
    try {
      const payload = actionNotes.trim() ? { notes: actionNotes.trim() } : {}
      await runAdminAction(resolveMutationEndpoint(config), pendingAction.record.id, pendingAction.action, payload)
      onToast('Accion ejecutada correctamente.', 'success')
      setPendingAction(null)
      setActionNotes('')
      setModal(null)
      if (isRecyclingCentersModule && (pendingAction.action === 'activate' || pendingAction.action === 'deactivate')) {
        setRecords((current) => current.map((record) => (
          record.id === pendingAction.record.id
            ? { ...record, status: pendingAction.action === 'activate' ? 'ACTIVE' : 'INACTIVE' }
            : record
        )))
      } else {
        await loadRecords()
      }
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
          </div>
        </div>

        {filterFields.length > 0 && (
          <Panel title="Busqueda rapida" action={<button className="icon-tab" onClick={loadRecords} title={`Actualizar ${config.title}`} aria-label={`Actualizar ${config.title}`}><FiRefreshCw /></button>}>
            {isRecyclingLogModule ? (
              <div className="grid gap-4 md:grid-cols-2">
                {/* Buscador de Usuario estandarizado estilo Audit */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                    Usuario
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar por usuario (nombre, correo o cédula)..."
                      value={filters.user_id ?? ''}
                      onChange={(e) => setFilters((current) => ({ ...current, user_id: e.target.value }))}
                      className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 pl-9 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-hidden transition-colors"
                    />
                  </div>
                </div>

                {/* Selector de Material estandarizado estilo Audit */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                    Material
                  </label>
                  <select
                    value={filters.material_type ?? ''}
                    onChange={(e) => setFilters((current) => ({ ...current, material_type: e.target.value }))}
                    className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-hidden font-semibold transition-colors cursor-pointer"
                  >
                    {getRecyclingMaterialFilterOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid items-end gap-3 md:grid-cols-3">
                {displayFilterFields.map((field) => (
                  <FilterFieldControl
                    key={field.key}
                    field={field}
                    value={filters[field.key] ?? ''}
                    onChange={(value) => setFilters((current) => ({ ...current, [field.key]: value }))}
                  />
                ))}
              </div>
            )}
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
              references={references}
              records={isRecyclingLogModule ? displayRecords : records}
              saving={saving}
              selectable={Boolean(config.canUpdate)}
              users={lookupUsers}
              onAction={handleActionRequest}
              onSelect={handleSelect}
              onView={handleView}
            />
          )}
        </Panel>
      </section>

      <Modal title={formTitle} open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {isPointsModule ? (
            <PointsAdjustmentForm
              fields={fields}
              form={form}
              references={references}
              users={lookupUsers}
              onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))}
            />
          ) : isRecyclingLogModule ? (
            <RecyclingLogForm
              fields={fields}
              form={form}
              references={references}
              users={lookupUsers}
              onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))}
            />
          ) : (
            <div className={`grid gap-4 ${fields.length > 3 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {groupFieldsIntoBentoCards(fields, config.endpoint).map((group) => (
                <div key={group.title} className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
                    {group.icon}
                    <span>{group.title}</span>
                  </div>
                  <div className="space-y-3">
                    {group.fields.map((field) => (
                      <ResourceFieldControl
                        key={field.key}
                        field={field}
                        formValues={form}
                        references={references}
                        users={lookupUsers}
                        value={String(form[field.key] ?? '')}
                        onChange={(value) => setForm((current) => ({ ...current, [field.key]: castFieldValue(field, value) }))}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(isMissionModule || isRecyclingCentersModule) && (
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
                <FiMapPin className="text-success" />
                <span>Ubicación Geográfica en el Mapa</span>
              </div>
              <MapPicker
                latitude={String(form.latitude ?? '')}
                longitude={String(form.longitude ?? '')}
                onChange={(latitude, longitude) => setForm((current) => ({ ...current, latitude, longitude }))}
              />
            </div>
          )}

          <button className="button-primary w-full" disabled={saving}>
            {saving ? 'Guardando...' : selected ? 'Guardar cambios' : <><FiSend /> Enviar</>}
          </button>
        </form>
      </Modal>

      <Modal title={`Detalle de ${config.title}`} open={modal === 'view'} onClose={() => setModal(null)}>
        <RecordDetail record={selected} references={references} users={lookupUsers} />
      </Modal>

      <Modal title="Confirmar accion" open={modal === 'confirmAction'} onClose={closeActionConfirmation}>
        <ActionConfirmation
          action={pendingAction}
          notes={actionNotes}
          saving={saving}
          moduleTitle={config.title}
          onCancel={closeActionConfirmation}
          onConfirm={handleConfirmAction}
          onNotesChange={setActionNotes}
        />
      </Modal>
    </>
  )
}

function ActionConfirmation({
  action,
  moduleTitle,
  notes,
  saving,
  onCancel,
  onConfirm,
  onNotesChange,
}: {
  action: PendingAction
  moduleTitle: string
  notes: string
  saving: boolean
  onCancel: () => void
  onConfirm: () => void
  onNotesChange: (value: string) => void
}) {
  if (!action) return <p className="table-empty">No hay accion seleccionada.</p>

  const recordName = getRecordDisplayName(action.record)
  const needsNotes = action.action === 'reject'

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-on-surface">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="mt-0.5 shrink-0 text-lg text-warning" />
          <div className="space-y-1">
            <p className="font-bold">Estas a punto de ejecutar una accion.</p>
            <p className="text-on-surface-variant">
              Confirma si deseas <strong className="text-on-surface">{action.label.toLowerCase()}</strong> este registro de {moduleTitle.toLowerCase()}.
            </p>
          </div>
        </div>
      </div>

      <div className="detail-item">
        <span>Registro</span>
        <strong>{recordName}</strong>
      </div>

      {needsNotes && (
        <div className="field">
          <label className="field-label" htmlFor="action-notes">Notas del rechazo</label>
          <textarea
            id="action-notes"
            className="input min-h-28 resize-y"
            placeholder="Motivo o comentario para el rechazo"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
          />
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button className="button-secondary" disabled={saving} type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button className="button-primary" disabled={saving} type="button" onClick={onConfirm}>
          {saving ? 'Ejecutando...' : `Confirmar ${action.label.toLowerCase()}`}
        </button>
      </div>
    </div>
  )
}

function ResourceTable({
  actions,
  columns,
  references,
  records,
  saving,
  selectable,
  users,
  onAction,
  onSelect,
  onView,
}: {
  actions: NonNullable<ModuleConfig['actions']>
  columns: string[]
  references: ResourceReferences
  records: AdminRecord[]
  saving: boolean
  selectable: boolean
  users: AdminUser[]
  onAction: (record: AdminRecord, action: string, label: string) => void
  onSelect: (record: AdminRecord) => void
  onView: (record: AdminRecord) => void
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  if (records.length === 0) return <p className="table-empty">No hay registros para mostrar.</p>
  const showActions = true

  const paginatedRecords = records.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
          {paginatedRecords.map((record, index) => (
            <tr key={String(record.id ?? index)} className="align-top">
              {columns.map((column) => (
                <td key={column} className="max-w-[240px]">
                  {renderValue(column, record[column], references, users, record)}
                </td>
              ))}
              {showActions && (
                <td>
                  <div className="table-actions justify-end">
                    <TableActionButton label="Ver detalle" onClick={() => onView(record)}><FiEye /></TableActionButton>
                    {selectable && <TableActionButton label="Editar registro" onClick={() => onSelect(record)}><FiEdit2 /></TableActionButton>}
                    {actions.map((item) => (
                      <TableActionButton
                        key={item.action}
                        danger={item.tone === 'danger'}
                        disabled={saving}
                        label={item.label}
                        onClick={() => onAction(record, item.action, item.label)}
                      >
                        {getActionIcon(item.action)}
                      </TableActionButton>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <TablePagination
        currentPage={currentPage}
        itemLabel="registros"
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSize={pageSize}
        totalItems={records.length}
      />
    </div>
  )
}

function ResourceFieldControl({
  field,
  formValues,
  onChange,
  references,
  users,
  value,
}: {
  field: ModuleField
  formValues?: Record<string, unknown>
  onChange: (value: string) => void
  references: ResourceReferences
  users: AdminUser[]
  value: string
}) {
  const referenceOptions = getReferenceOptions(field.key, references, users)
  if (referenceOptions.length) {
    return <ReferenceFieldControl field={field} options={referenceOptions} value={value} onChange={onChange} />
  }

  return <FieldControl field={field} formValues={formValues} value={value} onChange={onChange} />
}

function ReferenceFieldControl({ field, onChange, options, value }: { field: ModuleField; onChange: (value: string) => void; options: ReferenceOption[]; value: string }) {
  const selectOptions = [
    { label: getReferencePlaceholder(field.key) || 'Seleccionar...', value: '' },
    ...options.map((option) => ({ label: option.label, value: option.value })),
  ]

  return (
    <Select
      label={formatReferenceFieldLabel(field)}
      required={field.required}
      options={selectOptions}
      value={value}
      onChange={onChange}
    />
  )
}

function FilterFieldControl({
  field,
  onChange,
  value,
}: {
  field: ModuleField
  onChange: (value: string) => void
  value: string
}) {
  const options = field.options ?? []

  if (field.type === 'date' || field.key.endsWith('_date') || field.key === 'desde' || field.key === 'hasta' || field.key === 'start_date' || field.key === 'end_date') {
    return (
      <div>
        <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
          {field.label}
        </label>
        <div className="relative">
          <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={16} />
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 pl-9 text-sm text-on-surface focus:border-primary focus:outline-hidden font-semibold transition-colors cursor-pointer"
          />
        </div>
      </div>
    )
  }

  if (field.type === 'select' || field.type === 'choice' || options.length > 0) {
    const normalizedOptions = options.map((opt) =>
      typeof opt === 'string' ? { label: opt || 'Todos', value: opt } : { label: opt.label, value: opt.value }
    )

    return (
      <div>
        <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
          {field.label}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-hidden font-semibold transition-colors cursor-pointer"
        >
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div>
      <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
        {field.label}
      </label>
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
        <input
          type="text"
          placeholder={`Buscar por ${field.label.toLowerCase()}...`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 pl-9 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-hidden transition-colors"
        />
      </div>
    </div>
  )
}

function FieldControl({
  field,
  formValues,
  onChange,
  value,
}: {
  field: ModuleField
  formValues?: Record<string, unknown>
  onChange: (value: string) => void
  value: string
}) {
  if (field.key === 'phone' || field.key === 'telefono') {
    return <PhoneInput label={field.label} value={value} onChange={onChange} />
  }

  if (field.key === 'province' || field.key === 'provincia') {
    return <ProvinceInput label={field.label} value={value} onChange={onChange} />
  }

  if (field.key === 'municipality' || field.key === 'municipio') {
    const selectedProvince = String(formValues?.province ?? formValues?.provincia ?? '')
    return <MunicipalityInput label={field.label} province={selectedProvince} value={value} onChange={onChange} />
  }

  if (field.type === 'toggle') {
    return <ToggleControl field={field} value={value} onChange={onChange} />
  }

  if (field.type === 'choice') {
    return <ChoiceControl field={field} value={value} onChange={onChange} />
  }

  if (field.type === 'select') {
    return <Select label={field.label} required={field.required} value={value} options={field.options ?? []} onChange={onChange} />
  }

  if (field.type === 'textarea') {
    return (
      <label className="field">
        <span className="field-label">
          {field.label}
          {field.required && <span className="text-red-500 font-bold ml-1">*</span>}
        </span>
        <textarea className="input min-h-28 resize-y" value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
    )
  }

  return <Input label={field.label} placeholder={field.label} required={field.required} type={field.type ?? 'text'} value={value} onChange={onChange} />
}

function ChoiceControl({ field, onChange, value }: { field: ModuleField; onChange: (value: string) => void; value: string }) {
  const options = field.options ?? []
  const normalizedOptions = options.map((option) => (typeof option === 'string' ? { label: option, value: option } : option))
  const presetValues = normalizedOptions.filter((opt) => !isOtherChoice(opt.value, opt.label)).map((opt) => opt.value)

  const [customMode, setCustomMode] = useState(() => {
    return Boolean(field.allowOther && value && !presetValues.includes(value))
  })

  const showManualInput = Boolean(field.allowOther && customMode)

  const handleChipClick = (optionValue: string, optionLabel: string) => {
    const isOther = isOtherChoice(optionValue, optionLabel)
    setCustomMode(isOther)
    if (isOther) {
      if (presetValues.includes(value)) {
        onChange('')
      }
    } else {
      onChange(optionValue)
    }
  }

  return (
    <div className="choice-field">
      <span>
        {field.label}
        {field.required && <span className="text-red-500 font-bold ml-1">*</span>}
      </span>
      <div className="choice-grid">
        {normalizedOptions.map((option) => {
          const isOther = isOtherChoice(option.value, option.label)
          const isActive = isOther ? customMode : (!customMode && value === option.value)

          return (
            <button
              key={option.value}
              className={`choice-chip ${isActive ? 'choice-chip-active' : ''}`}
              type="button"
              onClick={() => handleChipClick(option.value, option.label)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {showManualInput && (
        <Input
          label={`${field.label} personalizado`}
          placeholder={`${field.label} personalizado (ej: 123415)`}
          type={field.key === 'points' || field.key === 'points_reward' || field.key === 'max_participants' ? 'number' : 'text'}
          value={value}
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

function RecordDetail({ record, references, users }: { record: AdminRecord | null; references: ResourceReferences; users: AdminUser[] }) {
  if (!record) return <p className="table-empty">No hay registro seleccionado.</p>

  const entries = Object.entries(record)
  const title = String(record.title ?? record.name ?? 'Detalle del registro')
  const status = record.status ? String(record.status) : null
  const type = record.mission_type ?? record.organization_type ?? record.transaction_type ?? record.material_type ?? record.type ? String(record.mission_type ?? record.organization_type ?? record.transaction_type ?? record.material_type ?? record.type) : null

  const mainKeys = ['title', 'name', 'description', 'points_reward', 'points_required', 'points', 'stock', 'weight_kg', 'points_awarded', 'message', 'points_spent']
  const locationKeys = ['province', 'municipality', 'address', 'latitude', 'longitude']
  const dateKeys = ['start_date', 'end_date', 'delivered_at', 'approved_at', 'created_at', 'updated_at']
  const configKeys = ['requires_qr_validation', 'requires_approval', 'requires_evidence', 'is_verified', 'max_participants']

  const mainEntries = entries.filter(([k]) => mainKeys.includes(k) && k !== 'title' && k !== 'name')
  const locationEntries = entries.filter(([k]) => locationKeys.includes(k))
  const dateEntries = entries.filter(([k]) => dateKeys.includes(k))
  const configEntries = entries.filter(([k]) => configKeys.includes(k))
  const otherEntries = entries.filter(([k]) => !['id', 'title', 'name', 'status', ...mainKeys, ...locationKeys, ...dateKeys, ...configKeys].includes(k))
  const hasMapCoordinates = hasValidCoordinates(record.latitude, record.longitude)

  return (
    <div className="space-y-4">
      {/* Header Bento Box */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-on-surface">{title}</h3>
          <p className="text-xs text-on-surface-variant font-mono mt-0.5">ID: {String(record.id ?? '-')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {type && <Badge label={type} tone="info" />}
          {status && <Badge label={status} tone={badgeTone(status)} />}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Card 1: Información General */}
        {mainEntries.length > 0 && (
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
              <FiFileText className="text-primary" />
              <span>Información General</span>
            </div>
            <div className="grid gap-3">
              {mainEntries.map(([key, value]) => (
                <DetailRow key={key} label={formatColumn(key)} value={formatDetailValue(key, value, references, users)} />
              ))}
            </div>
          </div>
        )}

        {/* Card 2: Configuración y Reglas */}
        {configEntries.length > 0 && (
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
              <FiSettings className="text-warning" />
              <span>Configuración y Reglas</span>
            </div>
            <div className="grid gap-3">
              {configEntries.map(([key, value]) => (
                <DetailRow key={key} label={formatColumn(key)} value={formatDetailValue(key, value, references, users)} />
              ))}
            </div>
          </div>
        )}

        {/* Card 3: Ubicación */}
        {locationEntries.length > 0 && (
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
              <FiMapPin className="text-success" />
              <span>Ubicación</span>
            </div>
            <div className="grid gap-3">
              {locationEntries.map(([key, value]) => (
                <DetailRow key={key} label={formatColumn(key)} value={formatDetailValue(key, value, references, users)} />
              ))}
            </div>
            {hasMapCoordinates && (
              <MapPicker
                latitude={String(record.latitude)}
                longitude={String(record.longitude)}
                readOnly
                title="Ubicación en el mapa"
                description="Punto registrado para esta misión."
              />
            )}
          </div>
        )}

        {/* Card 4: Fechas y Tiempos */}
        {dateEntries.length > 0 && (
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
              <FiCalendar className="text-tertiary" />
              <span>Fechas y Tiempos</span>
            </div>
            <div className="grid gap-3">
              {dateEntries.map(([key, value]) => (
                <DetailRow key={key} label={formatColumn(key)} value={formatDetailValue(key, value, references, users)} />
              ))}
            </div>
          </div>
        )}

        {/* Card 5: Otros Detalles */}
        {otherEntries.length > 0 && (
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
              <FiFileText className="text-on-surface-variant" />
              <span>Detalles Adicionales</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {otherEntries.map(([key, value]) => (
                <DetailRow key={key} label={formatColumn(key)} value={formatDetailValue(key, value, references, users)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
      <span className="text-on-surface-variant font-medium">{label}</span>
      <span className="font-semibold text-on-surface break-words">{value}</span>
    </div>
  )
}

function hasValidCoordinates(latitude: unknown, longitude: unknown) {
  const parsedLatitude = Number(latitude)
  const parsedLongitude = Number(longitude)

  return (
    Number.isFinite(parsedLatitude) &&
    Number.isFinite(parsedLongitude) &&
    parsedLatitude >= -90 &&
    parsedLatitude <= 90 &&
    parsedLongitude >= -180 &&
    parsedLongitude <= 180
  )
}

function getRecordDisplayName(record: AdminRecord) {
  const label = record.title ?? record.name ?? record.email ?? record.description ?? record.id
  return String(label ?? 'Registro seleccionado')
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
  return config.createEndpoint ?? config.mutationEndpoint ?? config.endpoint
}

function resolveMutationEndpoint(config: ModuleConfig) {
  return config.mutationEndpoint ?? config.endpoint
}

function renderValue(column: string, value: unknown, references: ResourceReferences, users: AdminUser[], record?: AdminRecord) {
  if (column === 'created_at' || column.endsWith('_at')) return <span className="text-on-surface-variant">{formatDate(String(value ?? ''))}</span>
  if ((column === 'status' || column.endsWith('_status') || column.endsWith('_type') || column === 'role') && value) {
    return <Badge label={String(value)} tone={badgeTone(String(value))} />
  }
  if (column === 'weight_kg' || column === 'weight_lbs') {
    const rawVal = value ?? record?.weight_kg ?? record?.weight_lbs
    if (rawVal !== null && rawVal !== undefined && rawVal !== '') {
      return <span className="font-semibold text-on-surface">{String(rawVal)} lbs</span>
    }
  }
  if (typeof value === 'boolean') return value ? 'Si' : 'No'
  if (value === null || value === undefined || value === '') return <span className="text-on-surface-variant">-</span>
  const label = resolveReferenceLabel(column, value, references, users)
  if (label) return <span className="break-words">{label}</span>
  return <span className="break-words">{translateText(String(value))}</span>
}

function badgeTone(value: string) {
  const upper = String(value).toUpperCase()
  if (['ACTIVE', 'APPROVED', 'DELIVERED', 'COMPLETED', 'PUBLISHED', 'BONUS', 'EARNED'].includes(upper)) return 'success'
  if (['PENDING', 'IN_PROGRESS', 'SUSPENDED'].includes(upper)) return 'warning'
  if (['BANNED', 'REJECTED', 'CANCELLED', 'INACTIVE', 'PENALTY', 'PENALIZATION', 'PENALIZACIÓN', 'PENALIZACION'].includes(upper) || upper.includes('PENAL')) return 'danger'
  if (['REDEEMED'].includes(upper)) return 'info'
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
  const columnMap: Record<string, string> = {
    id: 'ID',
    title: 'Título',
    name: 'Nombre',
    description: 'Descripción',
    status: 'Estado',
    type: 'Tipo',
    mission_type: 'Tipo de Misión',
    organization_type: 'Tipo de Organización',
    points: 'Puntos',
    points_reward: 'Puntos de Recompensa',
    points_required: 'Puntos Requeridos',
    points_spent: 'Puntos Gastados',
    start_date: 'Fecha de Inicio',
    end_date: 'Fecha de Fin',
    province: 'Provincia',
    municipality: 'Municipio',
    address: 'Dirección',
    latitude: 'Latitud',
    longitude: 'Longitud',
    max_participants: 'Máx. Participantes',
    requires_evidence: 'Requiere Evidencia',
    requires_qr_validation: 'Requiere QR',
    requires_approval: 'Requiere Aprobación',
    organization_id: 'Organización',
    sponsor_id: 'Patrocinador',
    center_id: 'Centro',
    mission_id: 'Misión',
    reward_id: 'Recompensa',
    user_id: 'Usuario',
    actor_id: 'Actor',
    target_user_id: 'Usuario Afectado',
    material_type: 'Tipo de Material',
    weight_kg: 'Peso (LBS)',
    weight_lbs: 'Peso (LBS)',
    points_awarded: 'Puntos Otorgados',
    stock: 'Stock',
    created_by: 'Creado por',
    created_at: 'Fecha de Creación',
    updated_at: 'Última Actualización',
    delivered_at: 'Fecha de Entrega',
    approved_at: 'Fecha de Aprobación',
  }

  if (columnMap[column]) return columnMap[column]
  return column.replaceAll('_', ' ')
}

function formatDetailValue(key: string, value: unknown, references: ResourceReferences, users: AdminUser[]): React.ReactNode {
  if (value === null || value === undefined || value === '') return '-'

  if (typeof value === 'boolean' || value === 'true' || value === 'false') {
    const isTrue = value === true || value === 'true'
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${isTrue ? 'bg-success/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
        {isTrue ? 'Sí' : 'No'}
      </span>
    )
  }

  if (key === 'weight_kg' || key === 'weight_lbs') {
    return <span className="font-semibold text-on-surface">{String(value)} lbs</span>
  }

  if (key === 'created_at' || key.endsWith('_at') || key.endsWith('_date')) {
    return formatDate(String(value))
  }

  if (key === 'status' || key.endsWith('_status') || key.endsWith('_type') || key === 'role') {
    return <Badge label={String(value)} tone={badgeTone(String(value))} />
  }

  const label = resolveReferenceLabel(key, value, references, users)
  if (label) return label

  if (typeof value === 'object') return JSON.stringify(value)

  return translateText(String(value))
}

function getRecyclingMaterialFilterOptions() {
  return [
    { label: 'Todos los materiales', value: '' },
    { label: 'Latas de Aluminio (40 pts/lb)', value: 'ALUMINUM' },
    { label: 'Vidrio (3 pts/lb)', value: 'GLASS' },
    { label: 'Botellas PET (10 pts/lb)', value: 'PET' },
    { label: 'Papel y Cartón (5 pts/lb)', value: 'PAPER' },
    { label: 'Electrónicos (50 pts/lb)', value: 'E_WASTE' },
    { label: 'Otros Materiales (10 pts/lb)', value: 'OTHER' },
  ]
}

function buildDisplayFilterFields(fields: ModuleField[]) {
  return fields.map((field) => {
    if (field.key === 'user_id') {
      return { ...field, label: 'Usuario', type: 'text' as const }
    }

    if (field.key === 'search') {
      return { ...field, label: 'Nombre' }
    }

    return field
  })
}

function getReferenceOptions(fieldKey: string, references: ResourceReferences, users: AdminUser[]): ReferenceOption[] {
  if (fieldKey === 'user_id') {
    return users
      .filter((user) => !user.status || user.status === 'ACTIVE')
      .map((user) => ({
        value: user.id,
        label: `${getUserName(user)} - ${user.cedula}`,
        keywords: normalizeText([getUserName(user), user.cedula, onlyDigits(user.cedula), user.email].filter(Boolean).join(' ')),
      }))
  }

  if (fieldKey === 'organization_id' || fieldKey === 'sponsor_id') {
    return recordsToReferenceOptions(references.organizations, ['name', 'email', 'organization_type'])
  }

  if (fieldKey === 'center_id') {
    return recordsToReferenceOptions(references.centers, ['name', 'province', 'municipality'])
  }

  if (fieldKey === 'reward_id') {
    return recordsToReferenceOptions(references.rewards, ['title', 'name'])
  }

  if (fieldKey === 'mission_id') {
    return recordsToReferenceOptions(references.missions, ['title', 'name', 'mission_type'])
  }

  return []
}

function recordsToReferenceOptions(records: AdminRecord[], labelKeys: string[]) {
  return records
    .filter((record) => record.id)
    .map((record) => {
      const labelValue = labelKeys.map((key) => record[key]).find((value) => value) ?? record.id
      const secondaryValue = labelKeys
        .slice(1)
        .map((key) => record[key])
        .find((value) => value && value !== labelValue)
      const label = secondaryValue ? `${labelValue} - ${secondaryValue}` : String(labelValue)

      return {
        value: String(record.id),
        label,
        keywords: normalizeText([label, record.id].filter(Boolean).join(' ')),
      }
    })
}



function formatReferenceFieldLabel(field: ModuleField) {
  if (field.key === 'user_id') return field.required ? 'Usuario' : 'Usuario opcional'
  if (field.key === 'organization_id') return 'Organizacion'
  if (field.key === 'sponsor_id') return 'Patrocinador'
  if (field.key === 'center_id') return 'Centro'
  if (field.key === 'reward_id') return 'Recompensa'
  if (field.key === 'mission_id') return 'Mision'
  return field.label
}

function getReferencePlaceholder(fieldKey: string) {
  if (fieldKey === 'user_id') return 'Buscar por cedula o nombre'
  if (fieldKey === 'organization_id' || fieldKey === 'sponsor_id' || fieldKey === 'center_id') return 'Buscar por nombre'
  if (fieldKey === 'reward_id') return 'Buscar recompensa'
  if (fieldKey === 'mission_id') return 'Buscar mision'
  return 'Buscar'
}

function resolveUserFilters(filters: Record<string, string>, users: AdminUser[]) {
  const userSearch = filters.user_id?.trim()
  if (!userSearch) return filters

  const user = findUserBySearch(userSearch, users)
  return { ...filters, user_id: user?.id ?? '__no_user_match__' }
}

function findUserBySearch(search: string, users: AdminUser[]) {
  const normalizedSearch = normalizeText(search)
  const cedulaDigits = onlyDigits(search)

  return users
    .filter((user) => !user.status || user.status === 'ACTIVE')
    .find((user) => {
      const searchable = [
        user.cedula,
        cedulaDigits ? onlyDigits(user.cedula) : '',
        user.first_name,
        user.last_name,
        getUserName(user),
        user.email,
      ]
        .filter(Boolean)
        .map((value) => normalizeText(String(value)))

      return searchable.some((value) => value.includes(normalizedSearch) || (cedulaDigits && value.includes(cedulaDigits)))
    })
}

function resolveReferenceLabel(column: string, value: unknown, references: ResourceReferences, users: AdminUser[]) {
  const id = String(value)
  if (!id) return ''

  if (column === 'user_id' || column.endsWith('_user_id')) {
    const user = users.find((item) => item.id === id)
    return user ? `${getUserName(user)} (${user.cedula})` : shortId(id)
  }

  if (column === 'organization_id' || column === 'sponsor_id') {
    return findRecordLabel(id, references.organizations, ['name', 'email']) || shortId(id)
  }

  if (column === 'center_id') {
    return findRecordLabel(id, references.centers, ['name', 'province', 'municipality']) || shortId(id)
  }

  if (column === 'mission_id') {
    return findRecordLabel(id, references.missions, ['title', 'name']) || shortId(id)
  }

  if (column === 'reward_id') {
    return findRecordLabel(id, references.rewards, ['title', 'name']) || shortId(id)
  }

  return ''
}

function findRecordLabel(id: string, records: AdminRecord[], keys: string[]) {
  const record = records.find((item) => item.id === id)
  if (!record) return ''

  const label = keys.map((key) => record[key]).find((value) => value)
  return label ? String(label) : ''
}

function shortId(id: string) {
  return id.length > 12 ? `ID ${id.slice(0, 8)}...` : id
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

type BentoGroup = {
  title: string
  icon: React.ReactNode
  fields: ModuleField[]
}

function groupFieldsIntoBentoCards(fields: ModuleField[], endpoint?: string): BentoGroup[] {
  if (endpoint?.includes('missions')) {
    const mainKeys = ['title', 'description', 'mission_type', 'points_reward']
    const dateKeys = ['start_date', 'end_date', 'max_participants']
    const locationKeys = ['province', 'municipality', 'address', 'latitude', 'longitude']
    const configKeys = ['requires_qr_validation', 'requires_approval', 'organization_id']

    return [
      { title: 'Información de la Misión', icon: <FiFileText className="text-primary" />, fields: fields.filter((f) => mainKeys.includes(f.key)) },
      { title: 'Fechas y Capacidad', icon: <FiCalendar className="text-tertiary" />, fields: fields.filter((f) => dateKeys.includes(f.key)) },
      { title: 'Ubicación Geográfica', icon: <FiMapPin className="text-success" />, fields: fields.filter((f) => locationKeys.includes(f.key)) },
      { title: 'Reglas y Validación', icon: <FiSettings className="text-warning" />, fields: fields.filter((f) => configKeys.includes(f.key)) },
    ].filter((g) => g.fields.length > 0)
  }

  if (endpoint?.includes('organizations')) {
    const orgKeys = ['name', 'description', 'organization_type', 'logo_url']
    return [
      { title: 'Datos de la Organización', icon: <FiFileText className="text-primary" />, fields: fields.filter((f) => orgKeys.includes(f.key)) },
      { title: 'Contacto y Ubicación', icon: <FiMapPin className="text-success" />, fields: fields.filter((f) => !orgKeys.includes(f.key)) },
    ].filter((g) => g.fields.length > 0)
  }

  if (endpoint?.includes('/recycling/centers')) {
    const mainKeys = ['name', 'description']
    const locationKeys = ['province', 'municipality', 'address', 'latitude', 'longitude', 'phone']
    return [
      { title: 'Datos del Centro', icon: <FiFileText className="text-primary" />, fields: fields.filter((f) => mainKeys.includes(f.key)) },
      { title: 'Ubicacion y Contacto', icon: <FiMapPin className="text-success" />, fields: fields.filter((f) => locationKeys.includes(f.key)) },
    ].filter((g) => g.fields.length > 0)
  }

  if (endpoint?.includes('rewards')) {
    const rewardKeys = ['title', 'description', 'image_url']
    return [
      { title: 'Detalles de Recompensa', icon: <FiFileText className="text-primary" />, fields: fields.filter((f) => rewardKeys.includes(f.key)) },
      { title: 'Canje y Stock', icon: <FiSettings className="text-tertiary" />, fields: fields.filter((f) => !rewardKeys.includes(f.key)) },
    ].filter((g) => g.fields.length > 0)
  }

  if (fields.length > 3) {
    const half = Math.ceil(fields.length / 2)
    return [
      { title: 'Datos Principales', icon: <FiFileText className="text-primary" />, fields: fields.slice(0, half) },
      { title: 'Detalles Adicionales', icon: <FiSettings className="text-tertiary" />, fields: fields.slice(half) },
    ]
  }

  return [
    { title: 'Detalles del Registro', icon: <FiFileText className="text-primary" />, fields },
  ]
}

function PointsAdjustmentForm({
  fields,
  form,
  references,
  users,
  onChange,
}: {
  fields: ModuleField[]
  form: Record<string, unknown>
  references: ResourceReferences
  users: AdminUser[]
  onChange: (key: string, value: unknown) => void
}) {
  const transactionType = String(form.transaction_type ?? 'BONUS')
  const isBonus = transactionType === 'BONUS'
  const isPenalty = transactionType === 'PENALTY' || transactionType === 'PENALIZATION'

  const currentPoints = Number(form.points) || 10
  const presetValues = [10, 25, 50, 100, 500]

  const [isCustom, setIsCustom] = useState(() => !presetValues.includes(currentPoints))

  const prefix = isPenalty ? '-' : '+'

  const handleSelectPreset = (val: number) => {
    setIsCustom(false)
    onChange('points', val)
  }

  const handleSelectCustom = () => {
    setIsCustom(true)
    if (!form.points || Number(form.points) <= 0) {
      onChange('points', 10)
    }
  }

  const handlePointsInputChange = (val: string) => {
    const rawDigits = onlyDigits(val)
    const num = rawDigits ? parseInt(rawDigits, 10) : ''
    onChange('points', num)
  }

  useEffect(() => {
    if (!form.transaction_type) {
      onChange('transaction_type', 'BONUS')
    }
    if (!form.points) {
      onChange('points', 10)
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Banner Informativo explicativo */}
      <div
        className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm transition-all ${
          isBonus
            ? 'border-success/30 bg-success/10 text-primary'
            : 'border-error/30 bg-error/10 text-error'
        }`}
      >
        <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />
        <div className="space-y-0.5">
          <p className="font-bold">
            {isBonus ? 'Modo de Ajuste: Bono de Puntos (+)' : 'Modo de Ajuste: Penalización de Puntos (-)'}
          </p>
          <p className="text-xs opacity-90 leading-relaxed">
            {isBonus
              ? 'El tipo seleccionado es de BONO. La cantidad indicada se SUMARÁ automáticamente a la cuenta del usuario.'
              : 'El tipo seleccionado es de PENALIZACIÓN. La cantidad indicada se RESTARÁ automáticamente de la cuenta del usuario.'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Bento Card 1: Selección de Usuario y Puntos */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
            <FiFileText className="text-primary" />
            <span>Datos del Usuario y Puntos</span>
          </div>

          {/* Selector de Usuario */}
          {fields.find((f) => f.key === 'user_id') && (
            <ResourceFieldControl
              field={fields.find((f) => f.key === 'user_id')!}
              formValues={form}
              references={references}
              users={users}
              value={String(form.user_id ?? '')}
              onChange={(val) => onChange('user_id', val)}
            />
          )}

          {/* Badges de selección de puntos */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
              Cantidad de Puntos
            </label>
            <div className="flex flex-wrap gap-2">
              {presetValues.map((val) => {
                const isSelected = !isCustom && currentPoints === val
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectPreset(val)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border ${
                      isSelected
                        ? isBonus
                          ? 'bg-primary text-on-primary border-primary shadow-sm scale-105'
                          : 'bg-error text-on-error border-error shadow-sm scale-105'
                        : isBonus
                        ? 'border-success/30 bg-success/15 text-primary hover:bg-success/25'
                        : 'border-error/30 bg-error/15 text-error hover:bg-error/25'
                    }`}
                  >
                    {prefix}{val} pts
                  </button>
                )
              })}
              <button
                type="button"
                onClick={handleSelectCustom}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border ${
                  isCustom
                    ? isBonus
                      ? 'bg-primary text-on-primary border-primary shadow-sm scale-105'
                      : 'bg-error text-on-error border-error shadow-sm scale-105'
                    : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Personalizado
              </button>
            </div>

            {/* Input de cantidad personalizada */}
            {isCustom && (
              <div className="pt-2">
                <Input
                  label="Cantidad personalizada (puntos)"
                  placeholder="Ej: 150"
                  inputMode="numeric"
                  value={String(currentPoints || '')}
                  onChange={handlePointsInputChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bento Card 2: Tipo y Descripción */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
            <FiSettings className="text-secondary" />
            <span>Configuración del Ajuste</span>
          </div>

          <Select
            label="Tipo de Ajuste"
            value={transactionType}
            options={[
              { label: 'Bono (+ Puntos)', value: 'BONUS' },
              { label: 'Penalización (- Puntos)', value: 'PENALTY' },
            ]}
            onChange={(val) => onChange('transaction_type', val)}
          />

          {fields.find((f) => f.key === 'description') && (
            <Input
              label="Descripción o motivo del ajuste"
              placeholder="Ej: Bono por excelente conducta ambiental"
              value={String(form.description ?? '')}
              onChange={(val) => onChange('description', val)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function getMaterialRate(materialType: string): { rate: number; label: string } {
  const norm = (materialType || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  if (norm.includes('alumin') || norm.includes('lata') || norm === 'aluminum') {
    return { rate: 40, label: 'Latas de Aluminio (40 pts/lb)' }
  }
  if (norm.includes('vidrio') || norm === 'glass') {
    return { rate: 3, label: 'Vidrio (3 pts/lb)' }
  }
  if (norm.includes('pet') || norm.includes('botella') || norm.includes('plastic') || norm === 'pet') {
    return { rate: 10, label: 'Botellas PET (10 pts/lb)' }
  }
  if (norm.includes('papel') || norm.includes('carton') || norm === 'paper') {
    return { rate: 5, label: 'Papel y Cartón (5 pts/lb)' }
  }
  if (norm.includes('electron') || norm === 'e_waste') {
    return { rate: 50, label: 'Electrónicos (50 pts/lb)' }
  }

  return { rate: 10, label: 'Otros Materiales (10 pts/lb)' }
}

function RecyclingLogForm({
  fields,
  form,
  references,
  users,
  onChange,
}: {
  fields: ModuleField[]
  form: Record<string, unknown>
  references: ResourceReferences
  users: AdminUser[]
  onChange: (key: string, value: unknown) => void
}) {
  const materialType = String(form.material_type ?? 'ALUMINUM')
  const rawWeight = String(form.weight_lbs ?? form.weight_kg ?? '')
  const weightLbs = parseFloat(rawWeight) || 0

  const { rate } = getMaterialRate(materialType)

  // Cálculo automático: Peso (lbs) * Tasa (pts/lb)
  const calculatedPoints = Math.round(weightLbs * rate * 100) / 100

  useEffect(() => {
    if (!form.material_type) {
      onChange('material_type', 'ALUMINUM')
    }
  }, [])

  useEffect(() => {
    onChange('points_awarded', calculatedPoints)
    if (weightLbs > 0) {
      onChange('weight_kg', weightLbs)
      onChange('weight_lbs', weightLbs)
    }
  }, [materialType, weightLbs, calculatedPoints])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Bento Card 1: Selección de Usuario */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
            <FiFileText className="text-primary" />
            <span>Datos del Usuario</span>
          </div>

          {/* Selector de Usuario */}
          {fields.find((f) => f.key === 'user_id') && (
            <ResourceFieldControl
              field={fields.find((f) => f.key === 'user_id')!}
              formValues={form}
              references={references}
              users={users}
              value={String(form.user_id ?? '')}
              onChange={(val) => onChange('user_id', val)}
            />
          )}
        </div>

        {/* Bento Card 2: Material, Peso y Puntos */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
            <FiSettings className="text-tertiary" />
            <span>Material y Peso Entregado</span>
          </div>

          {/* Selector de Material */}
          <Select
            label="Tipo de Material Reciclado"
            value={materialType}
            options={[
              { label: 'Latas de Aluminio (40 pts/lb)', value: 'ALUMINUM' },
              { label: 'Vidrio (3 pts/lb)', value: 'GLASS' },
              { label: 'Botellas PET (10 pts/lb)', value: 'PET' },
              { label: 'Papel y Cartón (5 pts/lb)', value: 'PAPER' },
              { label: 'Electrónicos (50 pts/lb)', value: 'E_WASTE' },
              { label: 'Otros Materiales (10 pts/lb)', value: 'OTHER' },
            ]}
            onChange={(val) => onChange('material_type', val)}
          />

          {/* Input de Peso numérico estricto */}
          <Input
            label="Peso del Material (Libras / lbs)"
            placeholder="Ej: 3.5, 10 o 2.2"
            type="number"
            inputMode="decimal"
            value={String(form.weight_lbs ?? form.weight_kg ?? '')}
            onChange={(val) => {
              const cleanVal = val.replace(/[^0-9.]/g, '')
              onChange('weight_lbs', cleanVal)
            }}
          />

          {/* Resumen del cálculo de puntos no editable */}
          <div className="rounded-lg border border-primary/30 bg-surface p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
              <span>Fórmula Aplicada:</span>
              <span className="text-primary font-bold">{weightLbs} lbs × {rate} pts/lb</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-outline-variant/40">
              <span className="text-sm font-bold text-on-surface">Puntos a Otorgar:</span>
              <span className="text-xl font-black text-primary">{calculatedPoints} pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourcePage
