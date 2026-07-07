import type { UserRole, UserStatus } from '../types'

type BadgeTone = 'default' | 'success' | 'warning' | 'danger' | 'info'

function Badge({ label, tone = 'default' }: { label: string; tone?: BadgeTone }) {
  const tones: Record<BadgeTone, string> = {
    default: 'bg-primary-fixed text-on-primary-fixed',
    success: 'bg-success/20 text-primary',
    warning: 'bg-warning/20 text-[#8a4b00]',
    danger: 'bg-error-container text-on-error-container',
    info: 'bg-tertiary/10 text-tertiary',
  }

  return <span className={`inline-flex max-w-full items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{label}</span>
}

export function StatusBadge({ status }: { status: UserStatus }) {
  const toneByStatus: Record<UserStatus, BadgeTone> = {
    ACTIVE: 'success',
    SUSPENDED: 'warning',
    BANNED: 'danger',
  }

  return <Badge label={status} tone={toneByStatus[status]} />
}

export function RoleBadge({ role }: { role: UserRole }) {
  const toneByRole: Record<UserRole, BadgeTone> = {
    USER: 'default',
    AGENT: 'success',
    ADMIN: 'info',
  }

  return <Badge label={role} tone={toneByRole[role]} />
}

export default Badge
