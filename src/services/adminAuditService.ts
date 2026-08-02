import { api } from '../api'
import { onlyDigits } from '../formatters'
import type { AuditFilters, ListResponse } from '../pages/admin/types'
import { readList } from '../pages/admin/utils'
import type { AdminUser, AuditLog } from '../types'

export async function getAdminAuditLogs(filters: AuditFilters, users: AdminUser[]) {
  const actorQuery = filters.actorCedula.trim()
  const targetQuery = filters.targetCedula.trim()
  const actorId = actorQuery ? resolveUserIdByCedula(actorQuery, users) : ''
  const targetUserId = targetQuery ? resolveUserIdByCedula(targetQuery, users) : ''

  const params = Object.fromEntries(
    Object.entries({
      action: filters.action,
      entity_type: filters.entityType,
      user_id: actorId || targetUserId,
    }).filter(([, value]) => value),
  )

  let logs: AuditLog[] = []
  try {
    const { data } = await api.get<ListResponse<AuditLog>>('/api/admin/logs', { params })
    logs = readList(data, ['auditLogs', 'logs', 'data', 'results'])
  } catch {
    return []
  }

  if (actorQuery) {
    logs = logs.filter((log) => matchAuditUser(log.actor_id, actorQuery, users))
  }

  if (targetQuery) {
    logs = logs.filter((log) => matchAuditUser(log.target_user_id, targetQuery, users))
  }

  return logs
}

export async function getAuditLogsByTargetUser(targetUserId: string) {
  try {
    const { data } = await api.get<ListResponse<AuditLog>>('/api/admin/logs', { params: { user_id: targetUserId } })
    return readList(data, ['auditLogs', 'logs', 'data', 'results'])
  } catch {
    return []
  }
}

function resolveUserIdByCedula(searchQuery: string, users: AdminUser[]) {
  if (!searchQuery.trim()) return ''
  const query = normalizeSearch(searchQuery)
  const digits = onlyDigits(searchQuery)

  if (digits) {
    const matchCedula = users.find((user) => {
      const userDigits = onlyDigits(user.cedula)
      return userDigits === digits || userDigits.includes(digits)
    })
    if (matchCedula) return matchCedula.id
  }

  const matchUser = users.find((user) => {
    const fullName = normalizeSearch(`${user.first_name} ${user.last_name}`)
    const email = normalizeSearch(user.email)
    const id = normalizeSearch(user.id)
    return fullName.includes(query) || email.includes(query) || id.includes(query)
  })

  return matchUser ? matchUser.id : ''
}

function matchAuditUser(userId: string | null, query: string, users: AdminUser[]): boolean {
  if (!query) return true
  const normalizedQuery = normalizeSearch(query)

  if (!userId) {
    return 'sistema'.includes(normalizedQuery) || 'system'.includes(normalizedQuery)
  }

  const user = users.find((u) => u.id === userId)
  if (user) {
    const fullName = normalizeSearch(`${user.first_name} ${user.last_name}`)
    const firstName = normalizeSearch(user.first_name)
    const lastName = normalizeSearch(user.last_name)
    const email = normalizeSearch(user.email)
    const cedula = normalizeSearch(user.cedula)
    const cedulaDigits = onlyDigits(user.cedula)
    const id = normalizeSearch(user.id)

    return (
      fullName.includes(normalizedQuery) ||
      firstName.includes(normalizedQuery) ||
      lastName.includes(normalizedQuery) ||
      email.includes(normalizedQuery) ||
      cedula.includes(normalizedQuery) ||
      cedulaDigits.includes(normalizedQuery) ||
      id.includes(normalizedQuery)
    )
  }

  return normalizeSearch(userId).includes(normalizedQuery)
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
