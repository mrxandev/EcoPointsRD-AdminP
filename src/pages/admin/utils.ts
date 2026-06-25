import type { AdminUser } from '../../types'
import type { DetailResponse, ListResponse } from './types'

export function readList<T>(response: ListResponse<T>, keys: Array<keyof Exclude<ListResponse<T>, T[]>>) {
  if (Array.isArray(response)) return response

  for (const key of keys) {
    const value = response[key]
    if (Array.isArray(value)) return value
  }

  return []
}

export function readDetail<T>(response: DetailResponse<T>, keys: Array<'data' | 'user' | 'auditLog' | 'result'>) {
  if (!response || typeof response !== 'object') return null

  const container = response as {
    data?: T
    user?: T
    auditLog?: T
    result?: T
  }

  for (const key of keys) {
    const value = container[key]
    if (value && typeof value === 'object') return value
  }

  return response as T
}

export function formatDate(date?: string) {
  if (!date) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-DO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}

export function getUserName(user: AdminUser) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  return fullName || user.email || user.cedula || 'Usuario seleccionado'
}
