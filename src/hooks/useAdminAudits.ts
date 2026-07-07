import { useCallback, useEffect, useState } from 'react'
import type { AuditFilters } from '../pages/admin/types'
import { getAdminAuditLogs } from '../services/adminAuditService'
import type { AdminUser, AuditLog } from '../types'

export function useAdminAudits(users: AdminUser[], onError: (error: unknown) => void) {
  const [audits, setAudits] = useState<AuditLog[]>([])
  const [auditFilters, setAuditFilters] = useState<AuditFilters>({ action: '', actorCedula: '', entityType: '', targetCedula: '' })
  const [loadingAudits, setLoadingAudits] = useState(false)

  const loadAudits = useCallback(async () => {
    setLoadingAudits(true)
    try {
      setAudits(await getAdminAuditLogs(auditFilters, users))
    } catch (error) {
      onError(error)
    } finally {
      setLoadingAudits(false)
    }
  }, [auditFilters, onError, users])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAudits()
    }, 350)

    return () => window.clearTimeout(timer)
  }, [loadAudits])

  return {
    auditFilters,
    audits,
    loadingAudits,
    loadAudits,
    setAuditFilters,
  }
}
