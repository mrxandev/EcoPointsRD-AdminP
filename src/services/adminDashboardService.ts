import { api } from '../api'
import type { DashboardStats } from '../types'

type ApiEnvelope<T> = T | { data?: T | ApiEnvelope<T> }

export async function getAdminDashboard() {
  const [summary, users, missions, points, rewards] = await Promise.all([
    getDashboardResource<DashboardStats['summary']>('summary'),
    getDashboardResource<DashboardStats['users']>('users'),
    getDashboardResource<DashboardStats['missions']>('missions'),
    getDashboardResource<DashboardStats['points']>('points'),
    getDashboardResource<DashboardStats['rewards']>('rewards'),
  ])

  return { summary, users, missions, points, rewards }
}

async function getDashboardResource<T>(resource: string) {
  const { data } = await api.get<ApiEnvelope<T>>(`/api/admin/dashboard/${resource}`)
  return unwrapDashboard(data)
}

function unwrapDashboard<T>(response: ApiEnvelope<T>): T {
  if (isApiEnvelope(response)) return unwrapDashboard(response.data)
  return response as T
}

function isApiEnvelope<T>(response: ApiEnvelope<T>): response is { data: ApiEnvelope<T> } {
  return Boolean(response && typeof response === 'object' && 'data' in response && response.data)
}
