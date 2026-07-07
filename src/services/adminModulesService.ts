import { api } from '../api'

export type AdminRecord = Record<string, unknown> & {
  id?: string
  created_at?: string
  status?: string
}

type AdminListResponse =
  | AdminRecord[]
  | {
      data?: AdminRecord[] | Record<string, unknown>
      [key: string]: unknown
    }

export async function listAdminResource(endpoint: string, listKeys: string[], params: Record<string, string>) {
  const cleanParams = Object.fromEntries(Object.entries(params).filter(([, value]) => value))
  const { data } = await api.get<AdminListResponse>(endpoint, { params: cleanParams })
  return readAdminList(data, listKeys)
}

export async function createAdminResource(endpoint: string, payload: Record<string, unknown>) {
  return api.post(endpoint, normalizePayload(payload))
}

export async function updateAdminResource(endpoint: string, id: string, payload: Record<string, unknown>) {
  return api.put(`${endpoint}/${id}`, normalizePayload(payload))
}

export async function runAdminAction(endpoint: string, id: string, action: string, payload: Record<string, unknown> = {}) {
  return api.patch(`${endpoint}/${id}/${action}`, normalizePayload(payload))
}

function readAdminList(response: AdminListResponse, keys: string[]): AdminRecord[] {
  if (Array.isArray(response)) return response

  for (const key of keys) {
    const value = response[key]
    if (Array.isArray(value)) return value as AdminRecord[]

    if (value && typeof value === 'object') {
      const nested = readAdminList(value as AdminListResponse, keys)
      if (nested.length) return nested
    }
  }

  return []
}

function normalizePayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (value === '') return [key, null]
      if (value === 'true') return [key, true]
      if (value === 'false') return [key, false]
      return [key, value]
    }),
  )
}
