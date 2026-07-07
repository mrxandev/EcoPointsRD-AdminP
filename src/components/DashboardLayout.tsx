import type { ReactNode } from 'react'
import {
  FiActivity,
  FiAward,
  FiBarChart2,
  FiBell,
  FiCreditCard,
  FiGift,
  FiLogOut,
  FiMapPin,
  FiMenu,
  FiPackage,
  FiShield,
  FiTarget,
  FiUsers,
} from 'react-icons/fi'
import { apiDisplayUrl } from '../api'
import type { AdminView } from '../pages/admin/types'
import NavButton from './NavButton'

type DashboardLayoutProps = {
  adminName: string
  adminRole: string
  children: ReactNode
  sidebarExpanded: boolean
  view: AdminView
  onLogout: () => void
  onToggleSidebar: () => void
  onViewChange: (view: AdminView) => void
}

const navItems: Array<{ icon: ReactNode; label: string; view: AdminView }> = [
  { view: 'dashboard', label: 'Dashboard', icon: <FiBarChart2 /> },
  { view: 'users', label: 'Usuarios', icon: <FiUsers /> },
  { view: 'organizations', label: 'Organizaciones', icon: <FiPackage /> },
  { view: 'missions', label: 'Misiones', icon: <FiTarget /> },
  { view: 'points', label: 'Puntos', icon: <FiAward /> },
  { view: 'rewards', label: 'Recompensas', icon: <FiGift /> },
  { view: 'redemptions', label: 'Canjes', icon: <FiCreditCard /> },
  { view: 'recycling', label: 'Reciclaje', icon: <FiMapPin /> },
  { view: 'notifications', label: 'Notificaciones', icon: <FiBell /> },
  { view: 'audit', label: 'Auditorias', icon: <FiShield /> },
]

function DashboardLayout({
  adminName,
  adminRole,
  children,
  sidebarExpanded,
  view,
  onLogout,
  onToggleSidebar,
  onViewChange,
}: DashboardLayoutProps) {
  const sidebarClass = sidebarExpanded
    ? 'translate-x-0 w-72 md:w-72'
    : '-translate-x-full w-72 md:translate-x-0 md:w-20'
  const sidebarStateClass = sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'

  return (
    <main className="min-h-screen bg-background text-on-background">
      {sidebarExpanded && <button className="fixed inset-0 z-20 bg-inverse-surface/25 md:hidden" onClick={onToggleSidebar} aria-label="Cerrar menu" />}

      <aside className={`admin-sidebar fixed inset-y-0 left-0 z-30 flex flex-col border-r border-outline-variant bg-surface-container-lowest p-4 transition-[transform,width] duration-200 ${sidebarStateClass} ${sidebarClass}`}>
        <div className={`mb-8 flex items-center gap-3 ${sidebarExpanded ? 'justify-start' : 'md:justify-center'}`}>
          <div className={`flex items-center gap-3 ${sidebarExpanded ? '' : 'md:justify-center'}`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-on-primary">
              <FiActivity size={22} />
            </div>
            {sidebarExpanded && (
              <div>
                <h1 className="font-bold text-on-surface">EcoPoints RD</h1>
                <p className="text-xs text-on-surface-variant">Panel administrador</p>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-nav flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {navItems.map((item) => (
            <NavButton
              key={item.view}
              compact={!sidebarExpanded}
              active={view === item.view}
              icon={item.icon}
              label={item.label}
              onClick={() => onViewChange(item.view)}
            />
          ))}
        </div>

        <button className={`group relative mt-4 flex h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-error hover:bg-error-container ${sidebarExpanded ? '' : 'justify-center'}`} onClick={onLogout} aria-label="Cerrar sesion">
          <FiLogOut /> {sidebarExpanded && 'Cerrar sesion'}
          {!sidebarExpanded && <span className="sidebar-tooltip">Cerrar sesion</span>}
        </button>
      </aside>

      <section className={`min-w-0 ${sidebarExpanded ? 'md:pl-72' : 'md:pl-20'}`}>
        <header className="sticky top-0 z-10 border-b border-outline-variant bg-background/90 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button className="icon-tab" onClick={onToggleSidebar} aria-label="Mostrar u ocultar menu">
                <FiMenu />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm text-on-surface-variant">Conectado a {apiDisplayUrl}</p>
                <h2 className="truncate text-xl font-bold text-on-surface sm:text-2xl">Hola, {adminName} <span className="text-sm font-semibold text-on-surface-variant">({adminRole})</span></h2>
              </div>
            </div>
            <div className="hidden shrink-0 gap-2 sm:flex md:hidden">
              {navItems.slice(0, 4).map((item) => (
                <button key={item.view} className={`icon-tab ${view === item.view ? 'icon-tab-active' : ''}`} onClick={() => onViewChange(item.view)} aria-label={item.label}>
                  {item.icon}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="space-y-6 p-5 lg:p-8">{children}</div>
      </section>
    </main>
  )
}

export default DashboardLayout
