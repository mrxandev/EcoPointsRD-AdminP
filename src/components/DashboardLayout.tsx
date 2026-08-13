import { type ReactNode, useState, useRef, useEffect } from 'react'
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

        {/* Perfil del Administrador en la parte inferior del Sidebar */}
        <div className="mt-4 relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={`group flex w-full items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 shadow-2xs transition-all hover:bg-surface-container-low hover:border-primary/30 cursor-pointer ${
              sidebarExpanded ? '' : 'justify-center'
            }`}
            aria-label="Opciones de perfil"
          >
            <UserAvatar
              user={adminUser ?? { first_name: adminName }}
              imageClassName="h-9 w-9 rounded-full object-cover shrink-0 border border-primary/30"
              fallbackClassName="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-extrabold text-xs shrink-0"
            />
            {sidebarExpanded && (
              <div className="min-w-0 text-left pr-1">
                <span className="block truncate text-xs font-bold text-on-surface">{adminName}</span>
                <span className="block text-[10px] font-semibold text-on-surface-variant uppercase">{adminRole}</span>
              </div>
            )}
            {!sidebarExpanded && <span className="sidebar-tooltip">Opciones de perfil</span>}
          </button>

          {/* Menu Dropdown de Perfil */}
          {isProfileMenuOpen && (
            <div
              className={`absolute bottom-full mb-2 w-48 rounded-xl border border-outline-variant bg-surface-container shadow-lg z-50 overflow-hidden py-1 ${
                sidebarExpanded ? 'left-0' : 'left-14'
              }`}
            >
              {onEditProfile && (
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    onEditProfile()
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <FiEdit3 size={16} className="text-primary" />
                  Editar Perfil
                </button>
              )}
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-error hover:bg-error-container transition-colors border-t border-outline-variant mt-1"
              >
                <FiLogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      <section className={`min-w-0 ${sidebarExpanded ? 'md:pl-72' : 'md:pl-20'}`}>
        <header className="sticky top-0 z-10 border-b border-outline-variant bg-background/90 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button className="icon-tab" onClick={onToggleSidebar} aria-label="Mostrar u ocultar menu">
                <FiMenu />
              </button>
              
              <div className="min-w-0">
                <p className="truncate text-sm text-on-surface-variant">
                  Conectado a <a href={apiDisplayUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline transition-colors font-medium">{apiDisplayUrl}</a>
                </p>
                <h2 className="truncate text-xl font-bold text-on-surface sm:text-2xl">Hola, {adminName} <span className="text-sm font-semibold text-on-surface-variant">({adminRole})</span></h2>
              </div>
            </div>

          </div>
        </header>

        <div className="space-y-6 p-5 lg:p-8">{children}</div>
      </section>
    </main>
  )
}

export default DashboardLayout
