import type { AuditLog } from '../../types'

export type AdminView = 'dashboard' | 'users' | 'audit'
export type SavingAction = 'create' | 'profile' | 'role' | 'status' | null

export type ListResponse<T> =
  | T[]
  | {
      data?: T[]
      users?: T[]
      auditLogs?: T[]
      logs?: T[]
      results?: T[]
    }

export type DetailResponse<T> =
  | T
  | {
      data?: T
      user?: T
      auditLog?: T
      result?: T
    }

export type AuditFilters = {
  action: string
  actorCedula: string
  entityType: string
  targetCedula: string
}

export type UserFilters = {
  role: string
  status: string
  search: string
}

export type RoleChange = {
  role: 'USER' | 'AGENT' | 'ADMIN'
  reason: string
}

export type StatusChange = {
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'
  reason: string
}

export type UserAuditState = {
  userAudits: AuditLog[]
}
