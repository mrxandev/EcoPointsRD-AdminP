import { useState } from 'react'
import { Badge, TablePagination } from '../../../components'
import type { AdminUser, AuditLog } from '../../../types'
import { formatDate, getUserName } from '../utils'

type AuditListProps = {
  audits: AuditLog[]
  expanded?: boolean
  users?: AdminUser[]
}

function AuditList({ audits, expanded = false, users = [] }: AuditListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  if (!audits.length) {
    return <p className="table-empty">No hay auditorías para mostrar.</p>
  }

  const paginatedAudits = audits.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="data-table-shell">
      <div className="overflow-x-auto">
        <table className="data-table min-w-[820px] lg:min-w-[980px]">
          <thead>
            <tr>
              <th>Acción</th>
              <th>Actor</th>
              <th>Usuario afectado</th>
              <th>Entidad</th>
              <th>Razón</th>
              <th>Fecha</th>
              {expanded && <th>Cambios</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedAudits.map((audit) => (
              <tr key={audit.id} className="align-top">
                <td><Badge label={audit.action} /></td>
                <td className="font-semibold text-on-surface">{formatAuditUser(audit.actor_id, users)}</td>
                <td className="font-semibold text-on-surface">{formatAuditUser(audit.target_user_id, users)}</td>
                <td className="font-medium text-on-surface">{audit.entity_type}</td>
                <td className="max-w-xs text-on-surface-variant">{audit.reason || 'Sin razón'}</td>
                <td className="text-on-surface-variant text-xs">{formatDate(audit.created_at)}</td>
                {expanded && <td><ChangeSummary oldValues={audit.old_values} newValues={audit.new_values} /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={currentPage}
        itemLabel="auditorías"
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSize={pageSize}
        totalItems={audits.length}
      />
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
