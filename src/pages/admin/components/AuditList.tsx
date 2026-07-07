import { Badge } from '../../../components'
import type { AdminUser, AuditLog } from '../../../types'
import { formatDate, getUserName } from '../utils'

type AuditListProps = {
  audits: AuditLog[]
  expanded?: boolean
  users?: AdminUser[]
}

function AuditList({ audits, expanded = false, users = [] }: AuditListProps) {
  if (!audits.length) {
    return <p className="rounded-md bg-surface-container px-4 py-6 text-center text-sm text-on-surface-variant">No hay auditorias para mostrar.</p>
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[760px] text-left text-sm lg:min-w-[980px]">
        <thead className="text-xs uppercase text-on-surface-variant">
          <tr>
            <th className="p-3">Accion</th>
            <th className="p-3">Actor</th>
            <th className="p-3">Usuario afectado</th>
            <th className="p-3">Entidad</th>
            <th className="p-3">Razon</th>
            <th className="p-3">Fecha</th>
            {expanded && <th className="p-3">Cambios</th>}
          </tr>
        </thead>
        <tbody>
          {audits.map((audit) => (
            <tr key={audit.id} className="border-t border-outline-variant align-top hover:bg-surface-container-low">
              <td className="p-3"><Badge label={audit.action} /></td>
              <td className="p-3">{formatAuditUser(audit.actor_id, users)}</td>
              <td className="p-3">{formatAuditUser(audit.target_user_id, users)}</td>
              <td className="p-3">{audit.entity_type}</td>
              <td className="max-w-xs p-3 text-on-surface-variant">{audit.reason || 'Sin razon'}</td>
              <td className="p-3 text-on-surface-variant">{formatDate(audit.created_at)}</td>
              {expanded && <td className="p-3"><ChangeSummary oldValues={audit.old_values} newValues={audit.new_values} /></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatAuditUser(userId: string | null, users: AdminUser[]) {
  if (!userId) return 'Sistema'

  const user = users.find((item) => item.id === userId)
  if (user) return getUserName(user)

  return `ID ${userId.slice(0, 8)}...`
}

function ChangeSummary({ oldValues, newValues }: { oldValues: Record<string, unknown> | null; newValues: Record<string, unknown> | null }) {
  if (!oldValues && !newValues) return <span className="text-on-surface-variant">Sin cambios detallados</span>

  const changedKeys = Array.from(new Set([...Object.keys(oldValues ?? {}), ...Object.keys(newValues ?? {})]))

  return (
    <div className="space-y-1">
      {changedKeys.slice(0, 3).map((key) => (
        <div key={key} className="rounded-md bg-surface-container px-2 py-1 text-xs">
          <strong>{key}:</strong> {String(oldValues?.[key] ?? 'vacio')} -&gt; {String(newValues?.[key] ?? 'vacio')}
        </div>
      ))}
      {changedKeys.length > 3 && <span className="text-xs text-on-surface-variant">+{changedKeys.length - 3} cambios mas</span>}
    </div>
  )
}

export default AuditList
