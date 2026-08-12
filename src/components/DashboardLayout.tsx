import type { ReactNode } from 'react'
import {
  FiActivity,
  FiAward,
  FiBarChart2,
  FiCreditCard,
  FiEdit3,
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
import UserAvatar from './UserAvatar'

type DashboardLayoutProps = {
  adminName: string
  adminRole: string
  adminUser?: { first_name?: string | null; last_name?: string | null; profile_image?: string | null } | null
  children: ReactNode
  sidebarExpanded: boolean
  view: AdminView
  onEditProfile?: () => void
  onLogout: () => void
  onToggleSidebar: () => void
  onViewChange: (view: AdminView) => void
}

const navItems: Array<{ icon: ReactNode; label: string; view: AdminView }> = [
  { view: 'dashboard', label: 'Dashboard', icon: <FiBarChart2 /> },
  { view: 'podium', label: 'Podio', icon: <FiAward /> },
  { view: 'users', label: 'Usuarios', icon: <FiUsers /> },
  { view: 'organizations', label: 'Organizaciones', icon: <FiPackage /> },
  { view: 'recyclingCenters', label: 'Centros', icon: <FiMapPin /> },
  { view: 'missions', label: 'Misiones', icon: <FiTarget /> },
  { view: 'points', label: 'Puntos', icon: <FiAward /> },
  { view: 'rewards', label: 'Recompensas', icon: <FiGift /> },
  { view: 'redemptions', label: 'Canjes', icon: <FiCreditCard /> },
  { view: 'recycling', label: 'Reciclaje', icon: <FiMapPin /> },
  { view: 'audit', label: 'Auditorias', icon: <FiShield /> },
]

function DashboardLayout({
  adminName,
  adminRole,
  adminUser,
  children,
  sidebarExpanded,
  view,
  onEditProfile,
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

      <aside className={`admin-sidebar overflow-visible fixed inset-y-0 left-0 z-30 flex flex-col border-r border-outline-variant bg-surface-container-lowest p-4 transition-[transform,width] duration-200 ${sidebarStateClass} ${sidebarClass}`}>
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

        <div className={`sidebar-nav flex min-h-0 flex-1 flex-col gap-2 pr-1 ${sidebarExpanded ? 'overflow-y-auto' : 'overflow-visible'}`}>
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

        <button
          className={`group relative mt-4 flex h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-error hover:bg-error-container ${
            sidebarExpanded ? '' : 'justify-center'
          }`}
          onClick={onLogout}
          aria-label="Cerrar sesion"
          title="Cerrar sesion"
        >
          <FiLogOut /> {sidebarExpanded && 'Cerrar sesion'}
          <span className="sidebar-tooltip">Cerrar sesion</span>
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

            {/* Perfil del Administrador en la esquina superior derecha */}
            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-1.5 shadow-2xs">
                <UserAvatar
                  user={adminUser ?? { first_name: adminName }}
                  imageClassName="h-9 w-9 rounded-full object-cover shrink-0 border border-primary/30"
                  fallbackClassName="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-extrabold text-xs shrink-0"
                />
                <div className="min-w-0 text-left pr-1">
                  <span className="block truncate text-xs font-bold text-on-surface">{adminName}</span>
                  <span className="block text-[10px] font-semibold text-on-surface-variant uppercase">{adminRole}</span>
                </div>
              </div>

              {onEditProfile && (
                <button
                  onClick={onEditProfile}
                  className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3.5 py-2 text-xs font-bold text-on-surface transition-all hover:bg-primary/10 hover:border-primary/40 hover:text-primary active:scale-95 shadow-2xs"
                  title="Editar perfil"
                >
                  <FiEdit3 size={15} />
                  <span className="hidden sm:inline">Editar Perfil</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="space-y-6 p-5 lg:p-8">{children}</div>
      </section>
    </main>
  )
}

export default DashboardLayout
