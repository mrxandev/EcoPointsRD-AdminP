import { FiRefreshCw } from 'react-icons/fi'
import { Input, Loader, Panel, Select } from '../../../components'
import { formatDominicanCedula } from '../../../formatters'
import type { AdminUser, AuditLog } from '../../../types'
import AuditList from '../components/AuditList'
import type { AuditFilters } from '../types'

type AuditPageProps = {
  audits: AuditLog[]
  filters: AuditFilters
  loading: boolean
  users: AdminUser[]
  onFiltersChange: (value: AuditFilters) => void
  onLoadAudits: () => void
}

const auditSections = [
  { id: 'general', label: 'Logs generales', enabled: true },
  { id: 'users', label: 'Cambios de usuarios', enabled: false },
  { id: 'security', label: 'Seguridad', enabled: false },
]

const actionOptions = [
  '',
  'ADMIN_USER_CREATED',
  'USER_PROFILE_UPDATED_BY_ADMIN',
  'USER_ROLE_UPDATED',
  'USER_STATUS_UPDATED',
]

const entityOptions = ['', 'users']

function AuditPage({ audits, filters, loading, users, onFiltersChange, onLoadAudits }: AuditPageProps) {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
      <Panel title="Auditorias">
        <div className="space-y-2">
          {auditSections.map((section) => (
            <button
              key={section.id}
              className={`flex min-h-12 w-full items-center justify-between rounded-md px-3 text-left text-sm font-semibold ${section.enabled ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant opacity-70'}`}
              disabled={!section.enabled}
            >
              <span>{section.label}</span>
              {!section.enabled && <span className="text-xs">Pronto</span>}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Logs generales" action={<button className="button-secondary w-full sm:w-auto" onClick={onLoadAudits}><FiRefreshCw /> Actualizar</button>}>
        <div className="mb-4 grid items-end gap-3 md:grid-cols-4">
          <Select label="Accion" value={filters.action} onChange={(value) => onFiltersChange({ ...filters, action: value })} options={actionOptions} />
          <Select label="Entidad" value={filters.entityType} onChange={(value) => onFiltersChange({ ...filters, entityType: value })} options={entityOptions} />
          <Input label="Actor" inputMode="numeric" maxLength={13} placeholder="Cedula del actor" value={formatDominicanCedula(filters.actorCedula)} onChange={(value) => onFiltersChange({ ...filters, actorCedula: formatDominicanCedula(value) })} />
          <Input label="Usuario afectado" inputMode="numeric" maxLength={13} placeholder="Cedula del usuario" value={formatDominicanCedula(filters.targetCedula)} onChange={(value) => onFiltersChange({ ...filters, targetCedula: formatDominicanCedula(value) })} />
        </div>
        {loading ? <Loader message="Cargando auditorias..." /> : <AuditList audits={audits} users={users} expanded />}
      </Panel>
    </div>
  )
}

export default AuditPage
