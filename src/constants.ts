import type { DashboardStats, UserFormState, UserRole, UserStatus } from './types'

export const roles: UserRole[] = ['USER', 'AGENT', 'ADMIN']
export const statuses: UserStatus[] = ['ACTIVE', 'SUSPENDED', 'BANNED']

export const emptyStats: DashboardStats = {
  totalUsers: 0,
  activeUsers: 0,
  suspendedUsers: 0,
  bannedUsers: 0,
  totalAgents: 0,
  totalAdmins: 0,
  verifiedUsers: 0,
}

export const emptyUserForm: UserFormState = {
  cedula: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phone: '',
  role: 'USER',
  status: 'ACTIVE',
  province: '',
  municipality: '',
}
