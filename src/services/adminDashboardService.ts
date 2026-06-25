import { api } from '../api'
import type { DashboardStats } from '../types'

export async function getAdminDashboard() {
  const { data } = await api.get<DashboardStats>('/api/admin/dashboard')
  return data
}
