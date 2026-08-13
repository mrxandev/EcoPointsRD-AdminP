import { api } from '../api'
import { onlyDigits } from '../formatters'
import type { AuditFilters, ListResponse } from '../pages/admin/types'
import { readList } from '../pages/admin/utils'
import type { AdminUser, AuditLog } from '../types'

export async function getAdminAuditLogs(filters: AuditFilters, users: AdminUser[]) {
  const actorQuery = (filters.actorCedula || '').trim()
  const targetQuery = (filters.targetCedula || '').trim()
  const generalSearch = (filters.search || '').trim()

  const params = Object.fromEntries(
    Object.entries({
      action: filters.action,
      entity_type: filters.entityType,
    }).filter(([, value]) => value),
  )

  let logs: AuditLog[]
  try {
    const { data } = await api.get<ListResponse<AuditLog>>('/api/admin/logs', { params })
    logs = readList(data, ['auditLogs', 'logs', 'data', 'results'])
  } catch {
    return []
  }

  const matchingActorUserIds = actorQuery ? findMatchingUserIds(actorQuery, users) : null
  const matchingTargetUserIds = targetQuery ? findMatchingUserIds(targetQuery, users) : null

  if (actorQuery) {
    logs = logs.filter((log) => matchAuditUser(log.actor_id, actorQuery, users, matchingActorUserIds))
  }

  if (targetQuery) {
    logs = logs.filter((log) => matchAuditUser(log.target_user_id, targetQuery, users, matchingTargetUserIds))
  }

  if (generalSearch && !targetQuery && !actorQuery) {
    const matchingSearchUserIds = findMatchingUserIds(generalSearch, users)
    const normalizedGeneral = normalizeSearch(generalSearch)

    logs = logs.filter((log) => {
      const matchActor = matchAuditUser(log.actor_id, generalSearch, users, matchingSearchUserIds)
      const matchTarget = matchAuditUser(log.target_user_id, generalSearch, users, matchingSearchUserIds)
      const matchAction = normalizeSearch(log.action).includes(normalizedGeneral)
      const matchEntity = normalizeSearch(log.entity_type).includes(normalizedGeneral)
      const matchReason = normalizeSearch(log.reason || '').includes(normalizedGeneral)

      return matchActor || matchTarget || matchAction || matchEntity || matchReason
    })
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

function findMatchingUserIds(searchQuery: string, users: AdminUser[]): Set<string> {
  const query = normalizeSearch(searchQuery)
  const digits = onlyDigits(searchQuery)
  const matchedIds = new Set<string>()

  if (!query) return matchedIds

  users.forEach((user) => {
    const fullName = normalizeSearch(`${user.first_name} ${user.last_name}`)
    const firstName = normalizeSearch(user.first_name)
    const lastName = normalizeSearch(user.last_name)
    const email = normalizeSearch(user.email)
    const cedula = normalizeSearch(user.cedula)
    const userDigits = onlyDigits(user.cedula)
    const id = normalizeSearch(user.id)

    if (
      fullName.includes(query) ||
      firstName.includes(query) ||
      lastName.includes(query) ||
      email.includes(query) ||
      cedula.includes(query) ||
      (digits !== '' && userDigits.includes(digits)) ||
      id.includes(query)
    ) {
      matchedIds.add(user.id)
    }
  })

  return matchedIds
}

function matchAuditUser(
  userId: string | null,
  query: string,
  users: AdminUser[],
  matchingUserIds: Set<string> | null,
): boolean {
  if (!query) return true
  const normalizedQuery = normalizeSearch(query)

  if (!userId) {
    return 'sistema'.includes(normalizedQuery) || 'system'.includes(normalizedQuery)
  }

  // 1. Verificar si el ID del usuario fue encontrado en los usuarios coincidentes
  if (matchingUserIds && matchingUserIds.has(userId)) {
    return true
  }

  // 2. Verificar datos en el usuario si está en el listado
  const user = users.find((u) => u.id === userId)
  if (user) {
    const fullName = normalizeSearch(`${user.first_name} ${user.last_name}`)
    const firstName = normalizeSearch(user.first_name)
    const lastName = normalizeSearch(user.last_name)
    const email = normalizeSearch(user.email)
    const cedula = normalizeSearch(user.cedula)
    const cedulaDigits = onlyDigits(user.cedula)
    const queryDigits = onlyDigits(query)
    const id = normalizeSearch(user.id)

    return (
      fullName.includes(normalizedQuery) ||
      firstName.includes(normalizedQuery) ||
      lastName.includes(normalizedQuery) ||
      email.includes(normalizedQuery) ||
      cedula.includes(normalizedQuery) ||
      (queryDigits !== '' && cedulaDigits.includes(queryDigits)) ||
      id.includes(normalizedQuery)
    )
  }

  // 3. Comparación por defecto de cadenas
  return normalizeSearch(userId).includes(normalizedQuery)
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
