import { FiRefreshCw, FiSearch } from 'react-icons/fi'
import { Loader, Panel } from '../../../components'
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
  { label: 'Todas las acciones', value: '' },
  { label: 'Creación de Usuario', value: 'ADMIN_USER_CREATED' },
  { label: 'Perfil Actualizado', value: 'USER_PROFILE_UPDATED_BY_ADMIN' },
  { label: 'Cambio de Rol', value: 'USER_ROLE_UPDATED' },
  { label: 'Cambio de Estado', value: 'USER_STATUS_UPDATED' },
]

const entityOptions = [
  { label: 'Todas las entidades', value: '' },
  { label: 'Usuarios', value: 'users' },
  { label: 'Misiones', value: 'missions' },
  { label: 'Recompensas', value: 'rewards' },
  { label: 'Organizaciones', value: 'organizations' },
]

function AuditPage({ audits, filters, loading, users, onFiltersChange, onLoadAudits }: AuditPageProps) {
  return (
    <div className="space-y-6 min-w-0">
      <Panel
        title="Logs generales de auditoría"
        action={
          <button
            className="icon-tab"
            onClick={onLoadAudits}
            title="Actualizar auditorías"
            aria-label="Actualizar auditorías"
          >
            <FiRefreshCw />
          </button>
        }
      >
        {/* Filtros superiores con diseño estandarizado */}
        <div className="mb-6 space-y-4">
          {/* Fila 1: Búsqueda general unificada */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
              Búsqueda General (Acción, usuario, actor, motivo o entidad)
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              <input
                type="text"
                placeholder="Buscar por cualquier término (ej: Juan, USER_ROLE_UPDATED, misiones...)..."
                value={filters.search || ''}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 pl-9 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Fila 2: Buscadores específicos por Usuario Afectado y Actor */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Buscador Usuario Afectado */}
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                Usuario Afectado
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, correo o cédula..."
                  value={filters.targetCedula || ''}
                  onChange={(e) => onFiltersChange({ ...filters, targetCedula: e.target.value })}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 pl-9 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            {/* Buscador Actor */}
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                Actor (Ejecutor)
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                <input
                  type="text"
                  placeholder="Buscar actor por nombre, correo o cédula..."
                  value={filters.actorCedula || ''}
                  onChange={(e) => onFiltersChange({ ...filters, actorCedula: e.target.value })}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 pl-9 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Fila 2: Selectores estilizados de Acción y Entidad */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                Acción Realizada
              </label>
              <select
                value={filters.action}
                onChange={(e) => onFiltersChange({ ...filters, action: e.target.value })}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-hidden font-semibold transition-colors cursor-pointer"
              >
                {actionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                Entidad Afectada
              </label>
              <select
                value={filters.entityType}
                onChange={(e) => onFiltersChange({ ...filters, entityType: e.target.value })}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-hidden font-semibold transition-colors cursor-pointer"
              >
                {entityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? <Loader message="Cargando auditorías..." /> : <AuditList audits={audits} users={users} expanded />}
      </Panel>
    </div>
  )
}

export default AuditPage
