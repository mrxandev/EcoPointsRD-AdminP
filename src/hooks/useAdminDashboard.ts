import { useCallback, useState } from 'react'
import { emptyStats } from '../constants'
import { getAdminDashboard } from '../services/adminDashboardService'
import type { DashboardStats } from '../types'

export function useAdminDashboard(onError: (error: unknown) => void) {
  const [stats, setStats] = useState<DashboardStats>(emptyStats)

  const loadDashboard = useCallback(async () => {
    try {
      setStats(await getAdminDashboard())
    } catch (error) {
      onError(error)
    }
  }, [onError])

  return { loadDashboard, stats }
}
