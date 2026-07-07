import type { DashboardStats, UserFormState, UserRole, UserStatus } from './types'

export const roles: UserRole[] = ['USER', 'AGENT', 'ADMIN']
export const statuses: UserStatus[] = ['ACTIVE', 'SUSPENDED', 'BANNED']

export const emptyStats: DashboardStats = {
  summary: {
    total_users: 0,
    active_users: 0,
    total_missions: 0,
    published_missions: 0,
    completed_missions: 0,
    total_points_generated: 0,
    total_rewards_redeemed: 0,
    pending_evidences: 0,
  },
  users: {
    byRole: [],
    byStatus: [],
    registeredByMonth: [],
  },
  missions: {
    byType: [],
    byStatus: [],
    mostPopular: [],
    mostPointsAwarded: [],
  },
  points: {
    totals: {
      delivered: 0,
      redeemed: 0,
    },
    topUsers: [],
    recentTransactions: [],
  },
  rewards: {
    mostRedeemed: [],
    outOfStock: [],
    pendingRedemptions: 0,
    deliveredRedemptions: 0,
  },
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
