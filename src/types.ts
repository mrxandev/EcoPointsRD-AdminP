export type UserRole = 'USER' | 'AGENT' | 'AUDITOR' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED'

export type AdminUser = {
  id: string
  cedula: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  is_verified: boolean
  email_verified_at?: string | null
  profile_image?: string | null
  country?: string | null
  province?: string | null
  municipality?: string | null
  points: number
  total_points_earned?: number
  total_points_redeemed?: number
  completed_missions?: number
  created_at?: string
  updated_at?: string
}

export type AuthUser = Pick<
  AdminUser,
  'id' | 'cedula' | 'first_name' | 'last_name' | 'email' | 'phone' | 'role' | 'status' | 'points' | 'is_verified'
>

export type DashboardSummary = {
  total_users: number
  active_users: number
  total_missions: number
  published_missions: number
  completed_missions: number
  total_points_generated: number
  total_rewards_redeemed: number
  pending_evidences: number
}

export type DashboardCount = {
  total: number
}

export type DashboardLabelCount = DashboardCount & {
  role?: string
  status?: string
  mission_type?: string
  month?: string
}

export type DashboardMissionItem = {
  id: string
  title: string
  registrations?: number
  points?: number
}

export type DashboardPointTotals = {
  delivered: number
  redeemed: number
}

export type DashboardTopUser = Pick<AdminUser, 'id' | 'first_name' | 'last_name' | 'points'>

export type DashboardPointTransaction = {
  id: string
  user_id?: string | null
  points: number
  transaction_type: string
  description?: string | null
  created_at?: string
}

export type DashboardRewardItem = {
  id: string
  title: string
  redemptions?: number
  stock?: number
}

export type DashboardStats = {
  summary: DashboardSummary
  users: {
    byRole: DashboardLabelCount[]
    byStatus: DashboardLabelCount[]
    registeredByMonth: DashboardLabelCount[]
  }
  missions: {
    byType: DashboardLabelCount[]
    byStatus: DashboardLabelCount[]
    mostPopular: DashboardMissionItem[]
    mostPointsAwarded: DashboardMissionItem[]
  }
  points: {
    totals: DashboardPointTotals
    topUsers: DashboardTopUser[]
    recentTransactions: DashboardPointTransaction[]
  }
  rewards: {
    mostRedeemed: DashboardRewardItem[]
    outOfStock: DashboardRewardItem[]
    pendingRedemptions: number
    deliveredRedemptions: number
  }
}

export type AuditLog = {
  id: string
  actor_id: string | null
  target_user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  reason: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export type UserFormState = {
  cedula: string
  first_name: string
  last_name: string
  email: string
  password: string
  phone: string
  role: UserRole
  status: UserStatus
  province: string
  municipality: string
}
