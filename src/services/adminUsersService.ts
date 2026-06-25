import { api } from '../api'
import { onlyDigits } from '../formatters'
import type { DetailResponse, ListResponse, UserFilters } from '../pages/admin/types'
import { readDetail, readList } from '../pages/admin/utils'
import type { AdminUser, UserFormState } from '../types'

export async function getAdminUsers(filters: UserFilters) {
  const search = filters.search.trim()
  const shouldFilterFullNameLocally = search.includes(' ')
  const params = Object.fromEntries(
    Object.entries({
      ...filters,
      search: shouldFilterFullNameLocally ? '' : search,
    }).filter(([, value]) => value),
  )

  const { data } = await api.get<ListResponse<AdminUser>>('/api/admin/users', { params })
  const users = readList(data, ['users', 'data', 'results'])

  return shouldFilterFullNameLocally ? filterUsersBySearch(users, search) : users
}

export async function getAdminUserDetail(id: string) {
  const { data } = await api.get<DetailResponse<AdminUser>>(`/api/admin/users/${id}`)
  return readDetail(data, ['user', 'data', 'result'])
}

export async function createAdminUser(form: UserFormState) {
  return api.post('/api/admin/users', normalizeUserPayload(form))
}

export async function updateAdminUser(id: string, form: Partial<AdminUser>) {
  return api.patch(`/api/admin/users/${id}`, normalizeUserPayload(form))
}

export async function updateAdminUserRole(id: string, role: string, reason: string) {
  return api.patch(`/api/admin/users/${id}/role`, { role, reason })
}

export async function updateAdminUserStatus(id: string, status: string, reason: string) {
  return api.patch(`/api/admin/users/${id}/status`, { status, reason })
}

function normalizeUserPayload<T extends Partial<UserFormState> | Partial<AdminUser>>(payload: T) {
  return {
    ...payload,
    cedula: payload.cedula ? onlyDigits(payload.cedula) : payload.cedula,
    phone: payload.phone ? onlyDigits(payload.phone) : payload.phone,
  }
}

function filterUsersBySearch(users: AdminUser[], search: string) {
  const normalizedSearch = normalizeSearch(search)

  return users.filter((user) => {
    const searchable = [
      user.first_name,
      user.last_name,
      `${user.first_name} ${user.last_name}`,
      user.email,
      user.cedula,
      user.phone,
    ]
      .filter(Boolean)
      .map((value) => normalizeSearch(String(value)))

    return searchable.some((value) => value.includes(normalizedSearch))
  })
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
