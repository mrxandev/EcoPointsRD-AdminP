import { api } from '../api'
import { onlyDigits } from '../formatters'
import type { AuditFilters, ListResponse } from '../pages/admin/types'
import { readList } from '../pages/admin/utils'
import type { AdminUser, AuditLog } from '../types'

export async function getAdminAuditLogs(filters: AuditFilters, users: AdminUser[]) {
  const actorId = resolveUserIdByCedula(filters.actorCedula, users)
  const targetUserId = resolveUserIdByCedula(filters.targetCedula, users)

  if (filters.actorCedula && !actorId) {
    throw new Error('No se encontro un actor con esa cedula.')
  }

  if (filters.targetCedula && !targetUserId) {
    throw new Error('No se encontro un usuario afectado con esa cedula.')
  }

  const params = Object.fromEntries(
    Object.entries({
      action: filters.action,
      entity_type: filters.entityType,
      user_id: actorId || targetUserId,
    }).filter(([, value]) => value),
  )

  const { data } = await api.get<ListResponse<AuditLog>>('/api/admin/logs', { params })
  return readList(data, ['auditLogs', 'logs', 'data', 'results'])
}

export async function getAuditLogsByTargetUser(targetUserId: string) {
  const { data } = await api.get<ListResponse<AuditLog>>('/api/admin/logs', { params: { user_id: targetUserId } })
  return readList(data, ['auditLogs', 'logs', 'data', 'results'])
}

function resolveUserIdByCedula(cedula: string, users: AdminUser[]) {
  const digits = onlyDigits(cedula)
  if (!digits) return ''

  return users.find((user) => onlyDigits(user.cedula) === digits)?.id ?? ''
}
