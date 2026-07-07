import { FiAward, FiCheckCircle, FiClock, FiGift, FiTarget, FiTrendingUp, FiUsers } from 'react-icons/fi'
import { Panel, StatCard } from '../../../components'
import type { AdminUser, AuditLog, DashboardLabelCount, DashboardMissionItem, DashboardRewardItem, DashboardStats, DashboardTopUser } from '../../../types'
import AuditList from '../components/AuditList'
import UserTable from '../users/UserTable'

type DashboardHomeProps = {
  audits: AuditLog[]
  stats: DashboardStats
  users: AdminUser[]
  onSelectUser: (id: string) => void
  onShowUsers: () => void
}

function DashboardHome({ audits, stats, users, onSelectUser, onShowUsers }: DashboardHomeProps) {
  const { missions, points, rewards, summary } = stats
  const cards = [
    { label: 'Usuarios totales', value: summary.total_users, icon: FiUsers, tone: 'bg-primary/10 text-primary' },
    { label: 'Usuarios activos', value: summary.active_users, icon: FiCheckCircle, tone: 'bg-success/15 text-success' },
    { label: 'Misiones publicadas', value: summary.published_missions, icon: FiTarget, tone: 'bg-tertiary/10 text-tertiary' },
    { label: 'Validaciones pendientes', value: summary.pending_evidences, icon: FiClock, tone: 'bg-warning/15 text-warning' },
    { label: 'Puntos generados', value: summary.total_points_generated, icon: FiAward, tone: 'bg-primary/10 text-primary' },
    { label: 'Canjes realizados', value: summary.total_rewards_redeemed, icon: FiGift, tone: 'bg-tertiary/10 text-tertiary' },
  ]

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map((item) => <StatCard key={item.label} {...item} />)}
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-3">
        <Panel title="Usuarios">
          <MetricRows rows={stats.users.byStatus} labelKey="status" emptyText="Sin usuarios por estado" />
        </Panel>
        <Panel title="Roles">
          <MetricRows rows={stats.users.byRole} labelKey="role" emptyText="Sin usuarios por rol" />
        </Panel>
        <Panel title="Puntos">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <MiniMetric label="Entregados" value={points.totals.delivered} />
            <MiniMetric label="Redimidos" value={points.totals.redeemed} />
          </div>
        </Panel>
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Misiones por estado">
          <MetricRows rows={missions.byStatus} labelKey="status" emptyText="Sin misiones por estado" />
        </Panel>
        <Panel title="Misiones mas populares">
          <RankedList
            items={missions.mostPopular}
            getLabel={(item) => item.title}
            getValue={(item) => item.registrations ?? 0}
            valueLabel="inscripciones"
            emptyText="Sin inscripciones registradas"
          />
        </Panel>
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Usuarios con mas puntos">
          <RankedList
            items={points.topUsers}
            getLabel={(item) => `${item.first_name} ${item.last_name}`}
            getValue={(item) => item.points}
            valueLabel="pts"
            emptyText="Sin usuarios con puntos"
          />
        </Panel>
        <Panel title="Recompensas mas canjeadas">
          <RankedList
            items={rewards.mostRedeemed}
            getLabel={(item) => item.title}
            getValue={(item) => item.redemptions ?? 0}
            valueLabel="canjes"
            emptyText="Sin canjes registrados"
          />
        </Panel>
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
        <Panel title="Usuarios recientes" action={<button className="button-secondary w-full sm:w-auto" onClick={onShowUsers}>Ver usuarios</button>}>
          <UserTable users={users.slice(0, 6)} onSelect={onSelectUser} />
        </Panel>
        <Panel title="Actividad reciente">
          <AuditList audits={audits.slice(0, 6)} />
        </Panel>
      </section>
    </>
  )
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
      <p className="text-sm text-on-surface-variant">{label}</p>
      <strong className="mt-1 block text-2xl text-on-surface">{formatNumber(value)}</strong>
    </div>
  )
}

function MetricRows({ emptyText, labelKey, rows }: { emptyText: string; labelKey: keyof DashboardLabelCount; rows: DashboardLabelCount[] }) {
  if (rows.length === 0) return <EmptyState text={emptyText} />

  const max = Math.max(...rows.map((row) => row.total), 1)

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const label = String(row[labelKey] ?? 'Sin dato')
        const width = `${Math.max((row.total / max) * 100, 8)}%`

        return (
          <div key={label} className="min-w-0">
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-on-surface">{formatLabel(label)}</span>
              <span className="shrink-0 text-on-surface-variant">{formatNumber(row.total)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full rounded-full bg-primary" style={{ width }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RankedList<T extends DashboardMissionItem | DashboardRewardItem | DashboardTopUser>({
  emptyText,
  getLabel,
  getValue,
  items,
  valueLabel,
}: {
  emptyText: string
  getLabel: (item: T) => string
  getValue: (item: T) => number
  items: T[]
  valueLabel: string
}) {
  if (items.length === 0) return <EmptyState text={emptyText} />

  return (
    <div className="divide-y divide-outline-variant">
      {items.slice(0, 6).map((item, index) => (
        <div key={item.id} className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-on-surface">{getLabel(item)}</p>
            <p className="flex items-center gap-1 text-sm text-on-surface-variant">
              <FiTrendingUp size={14} /> {formatNumber(getValue(item))} {valueLabel}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant">{text}</p>
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ').toLowerCase()
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-DO').format(value)
}

export default DashboardHome
