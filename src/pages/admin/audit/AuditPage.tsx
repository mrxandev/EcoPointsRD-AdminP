import { FiRefreshCw } from 'react-icons/fi'
import { Input, Loader, Panel, Select } from '../../../components'
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
    <div className="space-y-6 min-w-0">
      <Panel title="Logs generales" action={<button className="icon-tab" onClick={onLoadAudits} title="Actualizar auditorias" aria-label="Actualizar auditorias"><FiRefreshCw /></button>}>
        <div className="mb-4 grid items-end gap-3 md:grid-cols-4">
          <Select label="Accion" value={filters.action} onChange={(value) => onFiltersChange({ ...filters, action: value })} options={actionOptions} />
          <Select label="Entidad" value={filters.entityType} onChange={(value) => onFiltersChange({ ...filters, entityType: value })} options={entityOptions} />
          <Input label="Actor" placeholder="Cedula o nombre del actor" value={filters.actorCedula} onChange={(value) => onFiltersChange({ ...filters, actorCedula: value })} />
          <Input label="Usuario afectado" placeholder="Cedula o nombre del usuario" value={filters.targetCedula} onChange={(value) => onFiltersChange({ ...filters, targetCedula: value })} />
        </div>
        {loading ? <Loader message="Cargando auditorias..." /> : <AuditList audits={audits} users={users} expanded />}
      </Panel>
    </div>
  )
}

export default AuditPage
