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
function extractUser(response: any): AdminUser {
  if (!response) return response
  if (response.user) return response.user
  if (response.data) {
    if (response.data.user) return response.data.user
    if (typeof response.data === 'object' && 'id' in response.data) return response.data
    return extractUser(response.data)
  }
  return response
}

export async function getMyProfile(): Promise<AdminUser> {
  const { data } = await api.get('/api/users/me')
  return extractUser(data)
}

export async function updateMyProfile(payload: UpdateAdminProfilePayload): Promise<AdminUser> {
  const { data } = await api.put('/api/users/me', payload)
  return extractUser(data)
}
