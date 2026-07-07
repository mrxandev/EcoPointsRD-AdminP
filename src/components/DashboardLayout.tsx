import type { ReactNode } from 'react'
import { FiActivity, FiBarChart2, FiLogOut, FiMenu, FiShield, FiUsers } from 'react-icons/fi'
import { apiDisplayUrl } from '../api'
import NavButton from './NavButton'

type DashboardView = 'dashboard' | 'users' | 'audit'

type DashboardLayoutProps = {
  adminName: string
  children: ReactNode
  sidebarExpanded: boolean
  view: DashboardView
  onLogout: () => void
  onToggleSidebar: () => void
  onViewChange: (view: DashboardView) => void
}

function DashboardLayout({
  adminName,
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

  return (
    <main className="min-h-screen bg-background text-on-background">
      {sidebarExpanded && <button className="fixed inset-0 z-20 bg-inverse-surface/25 md:hidden" onClick={onToggleSidebar} aria-label="Cerrar menu" />}

      <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-outline-variant bg-surface-container-lowest p-4 transition-[transform,width] duration-200 ${sidebarClass}`}>
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

        <div className="flex flex-col gap-2">
          <NavButton compact={!sidebarExpanded} active={view === 'dashboard'} icon={<FiBarChart2 />} label="Dashboard" onClick={() => onViewChange('dashboard')} />
          <NavButton compact={!sidebarExpanded} active={view === 'users'} icon={<FiUsers />} label="Usuarios" onClick={() => onViewChange('users')} />
          <NavButton compact={!sidebarExpanded} active={view === 'audit'} icon={<FiShield />} label="Auditorias" onClick={() => onViewChange('audit')} />
        </div>

        <button className={`group relative mt-auto flex h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-error hover:bg-error-container ${sidebarExpanded ? '' : 'justify-center'}`} onClick={onLogout} aria-label="Cerrar sesion">
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
                <h2 className="truncate text-xl font-bold text-on-surface sm:text-2xl">Hola, {adminName}</h2>
              </div>
            </div>
            <div className="hidden shrink-0 gap-2 sm:flex md:hidden">
              <button className={`icon-tab ${view === 'dashboard' ? 'icon-tab-active' : ''}`} onClick={() => onViewChange('dashboard')}>
                <FiBarChart2 />
              </button>
              <button className={`icon-tab ${view === 'users' ? 'icon-tab-active' : ''}`} onClick={() => onViewChange('users')}>
                <FiUsers />
              </button>
              <button className={`icon-tab ${view === 'audit' ? 'icon-tab-active' : ''}`} onClick={() => onViewChange('audit')}>
                <FiShield />
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6 p-5 lg:p-8">{children}</div>
      </section>
    </main>
  )
}

export default DashboardLayout
