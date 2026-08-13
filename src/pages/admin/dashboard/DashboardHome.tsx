import { useState } from 'react'
import { FiArrowUpRight, FiAward, FiCheckCircle, FiGift, FiTarget, FiUsers } from 'react-icons/fi'
import { Panel, StatCard, UserAvatar } from '../../../components'
import { translateText } from '../../../utils/translations'
import type { AdminUser, DashboardRewardItem, DashboardStats, DashboardTopUser } from '../../../types'
import type { AdminView } from '../types'

type DashboardHomeProps = {
  stats: DashboardStats
  allUsers?: AdminUser[]
  onViewChange?: (view: AdminView) => void
}

function DashboardHome({ stats, allUsers = [], onViewChange }: DashboardHomeProps) {
  const { missions, points, rewards, summary } = stats

  const cards: Array<{
    label: string
    value: number
    icon: typeof FiUsers
    tone: string
    view: AdminView
  }> = [
    { label: 'Usuarios totales', value: summary.total_users, icon: FiUsers, tone: 'bg-primary/10 text-primary', view: 'users' },
    { label: 'Usuarios activos', value: summary.active_users, icon: FiCheckCircle, tone: 'bg-success/15 text-success', view: 'users' },
    { label: 'Misiones publicadas', value: summary.published_missions, icon: FiTarget, tone: 'bg-tertiary/10 text-tertiary', view: 'missions' },
    { label: 'Puntos generados', value: summary.total_points_generated, icon: FiAward, tone: 'bg-primary/10 text-primary', view: 'points' },
    { label: 'Canjes realizados', value: summary.total_rewards_redeemed, icon: FiGift, tone: 'bg-tertiary/10 text-tertiary', view: 'redemptions' },
  ]

  return (
    <div className="space-y-6">
      {/* Recuadros Superiores Interactivos */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {cards.map((item) => (
          <StatCard
            key={item.label}
            {...item}
            onClick={() => onViewChange?.(item.view)}
          />
        ))}
      </section>

      {/* Fila 2: Resumen de Misiones & Economía de Puntos */}
      <section className="grid min-w-0 gap-6 xl:grid-cols-2">
        <MissionOverviewCard byStatus={missions.byStatus} totalMissions={summary.total_missions} onViewChange={onViewChange} />
        <PointsEconomyCard redeemedPoints={points.totals.redeemed} totalPoints={summary.total_points_generated} onViewChange={onViewChange} />
      </section>

      {/* Fila 3: Distribución de Usuarios & Usuarios Más Activos / Podio */}
      <section className="grid min-w-0 gap-6 xl:grid-cols-2">
        <UserDistributionCard byRole={stats.users.byRole} totalUsers={summary.total_users} onViewChange={onViewChange} />
        <MostActiveUsersCard topUsers={points.topUsers} allUsers={allUsers} onViewChange={onViewChange} />
      </section>

      {/* Fila 4: Recompensas Más Canjeadas */}
      <section className="grid min-w-0 gap-6">
        <TopRedeemedRewardsCard topRewards={rewards.mostRedeemed} onViewChange={onViewChange} />
      </section>
    </div>
  )
}

function UserDistributionCard({
  byRole,
  totalUsers,
  onViewChange,
}: {
  byRole: { role?: string; total: number }[]
  totalUsers: number
  onViewChange?: (view: AdminView) => void
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const rolesMap: Record<string, { label: string; color: string }> = {
    ADMIN: { label: 'Administrador', color: '#0f5d3e' },
    USER: { label: 'Usuario', color: '#10b981' },
    AGENT: { label: 'Agente', color: '#6ee7b7' },
    AUDITOR: { label: 'Auditor', color: '#a7f3d0' },
  }

  const defaultDistribution = [
    { role: 'ADMIN', label: 'Administrador', count: 4, pct: 22, color: '#0f5d3e' },
    { role: 'USER', label: 'Usuario', count: 14, pct: 76, color: '#10b981' },
    { role: 'AGENT', label: 'Agente', count: 1, pct: 1, color: '#6ee7b7' },
    { role: 'AUDITOR', label: 'Auditor', count: 1, pct: 1, color: '#a7f3d0' },
  ]

  const totalCount = byRole.reduce((sum, r) => sum + r.total, 0) || totalUsers || 20

  const items = byRole.length > 0
    ? byRole.map((r) => {
        const key = String(r.role ?? 'USER').toUpperCase()
        const meta = rolesMap[key] ?? { label: translateText(key), color: '#10b981' }
        const pct = Math.round((r.total / totalCount) * 100)
        return { role: key, label: meta.label, count: r.total, pct, color: meta.color }
      })
    : defaultDistribution

  const activeItem = hoveredIdx !== null ? items[hoveredIdx] : null

  return (
    <div
      onClick={() => onViewChange?.('users')}
      className="h-full flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md rounded-2xl"
    >
      <Panel title="Distribución de Usuarios">
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
          {/* Donut SVG con interacción hover */}
          <div className="relative h-48 w-48 shrink-0">
            <svg className="h-full w-full -rotate-90 cursor-pointer overflow-visible" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="16" />

              {(() => {
                const cumulativeOffsets = items.reduce<number[]>((acc, _, i) => {
                  acc.push(i === 0 ? 0 : acc[i - 1] + items[i - 1].pct)
                  return acc
                }, [])

                return items.map((item, idx) => {
                  const strokeDasharray = `${item.pct * 2.388} ${238.8 - item.pct * 2.388}`
                  const strokeDashoffset = -cumulativeOffsets[idx] * 2.388
                  const isHovered = hoveredIdx === idx
                  const isOtherHovered = hoveredIdx !== null && !isHovered

                  return (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke={item.color}
                      strokeWidth={isHovered ? 20 : 16}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      opacity={isOtherHovered ? 0.35 : 1}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="transition-all duration-300 ease-out cursor-pointer"
                    />
                  )
                })
              })()}
            </svg>

            {/* Visualización en el centro del donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-200">
              {activeItem ? (
                <>
                  <span className="text-3xl font-extrabold text-primary animate-fade-in">{activeItem.pct}%</span>
                  <span className="text-xs font-bold text-on-surface truncate max-w-[120px]">{activeItem.label}</span>
                  <span className="text-[10px] font-semibold text-on-surface-variant">({activeItem.count} usuarios)</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-extrabold text-on-surface">{totalCount}</span>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Usuarios</span>
                </>
              )}
            </div>
          </div>

          {/* Leyenda interactiva */}
          <div className="space-y-2 min-w-[180px]">
            {items.map((item, idx) => {
              const isHovered = hoveredIdx === idx

              return (
                <div
                  key={item.label}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`flex items-center justify-between gap-4 text-xs p-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    isHovered
                      ? 'bg-primary/10 border border-primary/30 shadow-xs scale-105'
                      : 'hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-3 w-3 rounded-full shrink-0 transition-transform duration-200"
                      style={{
                        backgroundColor: item.color,
                        transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                      }}
                    />
                    <span className={`truncate font-bold ${isHovered ? 'text-primary' : 'text-on-surface'}`}>
                      {item.label}
                    </span>
                  </div>
                  <span className={`shrink-0 font-extrabold ${isHovered ? 'text-primary text-sm' : 'text-on-surface-variant'}`}>
                    {item.pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </Panel>
    </div>
  )
}

function MissionOverviewCard({
  byStatus,
  totalMissions,
  onViewChange,
}: {
  byStatus: { status?: string; total: number }[]
  totalMissions: number
  onViewChange?: (view: AdminView) => void
}) {
  const statusConfig: Record<string, { label: string }> = {
    PUBLISHED: { label: 'Publicadas' },
    DRAFT: { label: 'Borrador' },
    COMPLETED: { label: 'Completadas' },
    CANCELLED: { label: 'Expiradas' },
    EXPIRED: { label: 'Expiradas' },
  }

  const defaultOverview = [
    { key: 'PUBLISHED', label: 'Publicadas', count: 4, pct: 49 },
    { key: 'DRAFT', label: 'Borrador', count: 1, pct: 1 },
    { key: 'COMPLETED', label: 'Completadas', count: 3, pct: 33 },
    { key: 'EXPIRED', label: 'Expiradas', count: 2, pct: 0 },
  ]

  const total = byStatus.reduce((sum, s) => sum + s.total, 0) || totalMissions || 10

  const items = byStatus.length > 0
    ? byStatus.map((s) => {
        const key = String(s.status ?? 'PUBLISHED').toUpperCase()
        const meta = statusConfig[key] ?? { label: translateText(key) }
        const pct = Math.round((s.total / total) * 100)
        return { key, label: meta.label, count: s.total, pct }
      })
    : defaultOverview

  return (
    <div
      onClick={() => onViewChange?.('missions')}
      className="h-full flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md rounded-2xl"
    >
      <Panel title="Resumen de Misiones">
        <div className="space-y-4 py-3 flex-1 flex flex-col justify-center">
          {items.map((item) => (
            <div key={item.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-on-surface">
                  {item.label} ({item.count})
                </span>
                <span className="text-on-surface-variant">{item.pct}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.max(item.pct, item.count > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function PointsEconomyCard({
  redeemedPoints,
  totalPoints,
  onViewChange,
}: {
  redeemedPoints: number
  totalPoints: number
  onViewChange?: (view: AdminView) => void
}) {
  const redeemed = redeemedPoints > 0 ? redeemedPoints : 24545
  const total = totalPoints > 0 ? totalPoints : 100008849

  const pct = Math.min(100, Math.max(1, Math.round((redeemed / total) * 100)))

  return (
    <div
      onClick={() => onViewChange?.('points')}
      className="h-full flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md rounded-2xl"
    >
      <Panel title="Economía de Puntos">
        <div className="flex flex-col items-center justify-between gap-4 py-2">
          <div className="relative h-32 w-60">
            <svg className="h-full w-full" viewBox="0 0 200 110">
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#d1fae5"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#0f5d3e"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * (pct > 0 ? pct : 25)) / 100}
                className="transition-all duration-700"
              />
            </svg>
          </div>

          <div className="flex w-full items-center justify-between gap-2 px-2 border-t border-outline-variant/60 pt-3">
            <div className="text-center">
              <span className="block text-base font-extrabold text-on-surface">{formatNumber(redeemed)}</span>
              <span className="text-[11px] font-bold text-on-surface-variant">Puntos Canjeados</span>
            </div>

            <div className="rounded-full bg-surface-container px-3 py-1 text-xs font-extrabold text-on-surface-variant border border-outline-variant">
              vs
            </div>

            <div className="text-center">
              <span className="block text-base font-extrabold text-on-surface">{formatNumber(total)}</span>
              <span className="text-[11px] font-bold text-on-surface-variant">Total Puntos Generados</span>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function MostActiveUsersCard({
  topUsers,
  allUsers = [],
  onViewChange,
}: {
  topUsers: DashboardTopUser[]
  allUsers?: AdminUser[]
  onViewChange?: (view: AdminView) => void
}) {
  const demoUsers: DashboardTopUser[] = [
    { id: '1', first_name: 'Luis', last_name: 'Martínez', points: 100075990, role: 'USER' },
    { id: '2', first_name: 'User', last_name: 'Test', points: 155, role: 'USER' },
    { id: '3', first_name: 'Juan', last_name: 'Pérez', points: 25, role: 'USER' },
    { id: '4', first_name: 'Lucas', last_name: 'Mono', points: 18, role: 'USER' },
    { id: '5', first_name: 'Admin', last_name: 'Sistema', points: 99999999, role: 'ADMIN' },
  ]

  const rawUsers = topUsers.length > 0 ? topUsers : demoUsers

  // Enriquecer rawUsers con la información completa de usuario (incluyendo profile_image)
  const enrichedUsers = rawUsers.map((user) => {
    if (user.profile_image) return user
    const match = allUsers.find(
      (u) =>
        u.id === user.id ||
        (u.first_name?.toLowerCase() === user.first_name?.toLowerCase() &&
          u.last_name?.toLowerCase() === user.last_name?.toLowerCase())
    )
    return match ? { ...user, profile_image: match.profile_image } : user
  })

  // Filtrar estrictamente solo los usuarios ACTIVOS que tengan rol USER (o sin rol especificado)
  const userOnlyList = enrichedUsers
    .filter((user) => (!user.role || user.role === 'USER') && (!user.status || user.status === 'ACTIVE'))
    .sort((a, b) => b.points - a.points)

  const rankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-500/15 text-amber-700 border-amber-500/30 font-black'
      case 2:
        return 'bg-slate-300/30 text-slate-700 border-slate-400/30 font-extrabold'
      case 3:
        return 'bg-amber-700/15 text-amber-900 border-amber-700/30 font-bold'
      default:
        return 'bg-surface-container text-on-surface-variant font-bold border-transparent'
    }
  }

  return (
    <div
      onClick={() => onViewChange?.('podium')}
      className="h-full flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md rounded-2xl"
    >
      <Panel title="Podio de Usuarios">
        {userOnlyList.length === 0 ? (
          <div className="py-8 text-center text-xs text-on-surface-variant">
            No hay usuarios registrados en la clasificación del podio.
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/60">
            {userOnlyList.slice(0, 5).map((user, idx) => {
              const rank = idx + 1
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-surface-container/40 first:pt-0 last:pb-0 px-1 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-transform duration-200 ${rankBadgeStyle(
                        rank,
                      )}`}
                    >
                      {rank}
                    </span>
                    <UserAvatar
                      user={user}
                      imageClassName="h-9 w-9 rounded-full object-cover shrink-0"
                      fallbackClassName="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0"
                    />
                    <div>
                      <span className="block font-bold text-sm text-on-surface">
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="inline-block text-[11px] font-medium text-on-surface-variant">
                        Usuario
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm font-extrabold text-primary">
                    <span>{formatNumber(user.points)} pts</span>
                    <FiArrowUpRight size={16} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>
    </div>
  )
}

function TopRedeemedRewardsCard({
  topRewards,
  onViewChange,
}: {
  topRewards: DashboardRewardItem[]
  onViewChange?: (view: AdminView) => void
}) {
  const demoRewards: DashboardRewardItem[] = [
    { id: '1', title: 'Reward Test 42951703', redemptions: 5 },
    { id: '2', title: 'Reward Test 45764508', redemptions: 4 },
    { id: '3', title: 'Descuento EcoStore', redemptions: 1 },
    { id: '4', title: 'Botella Reutilizable', redemptions: 3 },
  ]

  const rewards = topRewards.length > 0 ? topRewards : demoRewards

  return (
    <div
      onClick={() => onViewChange?.('rewards')}
      className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md rounded-2xl"
    >
      <Panel title="Recompensas Más Canjeadas">
        <div className="divide-y divide-outline-variant/60">
          {rewards.slice(0, 4).map((reward, idx) => (
            <div key={reward.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center text-xs font-bold text-on-surface-variant">
                  {idx + 1}
                </span>
                <span className="font-bold text-sm text-on-surface">{reward.title}</span>
              </div>

              <div className="flex items-center gap-1 text-sm font-bold text-primary">
                <span>{reward.redemptions ?? 0} {reward.redemptions === 1 ? 'canje' : 'canjes'}</span>
                <FiArrowUpRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-DO').format(value)
}

export default DashboardHome
