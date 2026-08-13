import { api } from '../api'
import type { AdminUser } from '../types'

export type UpdateAdminProfilePayload = {
  first_name?: string
  last_name?: string
  phone?: string
  province?: string
  municipality?: string
  address?: string
  profile_image?: string | null
}

// Extract the user object cleanly regardless of backend response wrapper structure ({ data: { user: {...} } } vs { user: {...} })
function extractUser(response: Record<string, unknown> | null | undefined): AdminUser {
  if (!response) return null as unknown as AdminUser

  if (response.user && typeof response.user === 'object') {
    return response.user as AdminUser
  }

  if (response.data && typeof response.data === 'object') {
    const dataObj = response.data as Record<string, unknown>
    if (dataObj.user && typeof dataObj.user === 'object') {
      return dataObj.user as AdminUser
    }
    if ('id' in dataObj || 'email' in dataObj) {
      return dataObj as unknown as AdminUser
    }
    return extractUser(dataObj)
  }

  return response as unknown as AdminUser
}

export async function getMyProfile(): Promise<AdminUser> {
  try {
    const { data } = await api.get('/api/users/me')
    return extractUser(data as Record<string, unknown>)
  } catch (error) {
    try {
      const { data } = await api.get('/api/admin/me')
      return extractUser(data as Record<string, unknown>)
    } catch {
      throw error
    }
  }
}

export async function updateMyProfile(payload: UpdateAdminProfilePayload): Promise<AdminUser> {
  try {
    const { data } = await api.put('/api/users/me', payload)
    return extractUser(data as Record<string, unknown>)
  } catch (error) {
    try {
      const { data } = await api.put('/api/admin/me', payload)
      return extractUser(data as Record<string, unknown>)
    } catch {
      throw error
    }
  }
}
