export type UserRole = 'USER' | 'AGENT' | 'ADMIN'
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

export type DashboardStats = {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  bannedUsers: number
  totalAgents: number
  totalAdmins: number
  verifiedUsers: number
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
