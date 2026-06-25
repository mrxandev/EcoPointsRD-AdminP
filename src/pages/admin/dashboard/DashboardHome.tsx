import { FiCheckCircle, FiClock, FiShield, FiUsers } from 'react-icons/fi'
import { Panel, StatCard } from '../../../components'
import type { AdminUser, AuditLog, DashboardStats } from '../../../types'
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
  const cards = [
    { label: 'Usuarios totales', value: stats.totalUsers, icon: FiUsers, tone: 'bg-primary/10 text-primary' },
    { label: 'Activos', value: stats.activeUsers, icon: FiCheckCircle, tone: 'bg-success/15 text-success' },
    { label: 'Suspendidos', value: stats.suspendedUsers, icon: FiClock, tone: 'bg-warning/15 text-warning' },
    { label: 'Admins', value: stats.totalAdmins, icon: FiShield, tone: 'bg-tertiary/10 text-tertiary' },
  ]

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => <StatCard key={item.label} {...item} />)}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <Panel title="Usuarios recientes" action={<button className="button-secondary" onClick={onShowUsers}>Ver usuarios</button>}>
          <UserTable users={users.slice(0, 6)} onSelect={onSelectUser} />
        </Panel>
        <Panel title="Actividad reciente">
          <AuditList audits={audits.slice(0, 6)} />
        </Panel>
      </section>
    </>
  )
}

export default DashboardHome
