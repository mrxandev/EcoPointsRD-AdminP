import { useState } from 'react'
import { FiAward, FiSearch, FiUser } from 'react-icons/fi'
import { Panel, StatusBadge, TablePagination } from '../../../components'
import type { AdminUser, DashboardTopUser } from '../../../types'

type PodiumPageProps = {
  users?: AdminUser[]
  topUsers?: DashboardTopUser[]
}

export default function PodiumPage({ users = [], topUsers = [] }: PodiumPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Obtener la lista de usuarios combinada (priorizar usuarios reales activos de la base de datos con rol USER)
  const userList: AdminUser[] = (() => {
    const activeUsersOnly = users.filter((u) => u.role === 'USER' && u.status === 'ACTIVE')
    if (activeUsersOnly.length > 0) return activeUsersOnly

    // Si aún no hay usuarios completos cargados, adaptar topUsers a la estructura de AdminUser (solo activos)
    const fallbackTop: DashboardTopUser[] = topUsers.length > 0
      ? topUsers.filter((u) => (!u.role || u.role === 'USER') && (!u.status || u.status === 'ACTIVE'))
      : [
          { id: '1', first_name: 'Luis', last_name: 'Martínez', points: 100075990, role: 'USER' },
          { id: '2', first_name: 'User', last_name: 'Test', points: 155, role: 'USER' },
          { id: '3', first_name: 'Juan', last_name: 'Pérez', points: 25, role: 'USER' },
          { id: '4', first_name: 'Lucas', last_name: 'Mono', points: 18, role: 'USER' },
        ]

    return fallbackTop.map((top) => ({
      id: top.id,
      cedula: '000-0000000-0',
      first_name: top.first_name,
      last_name: top.last_name,
      email: `${top.first_name.toLowerCase()}@ecopoints.rd`,
      phone: '809-000-0000',
      role: 'USER' as const,
      status: 'ACTIVE' as const,
      is_verified: true,
      points: top.points,
    }))
  })()

  // Ordenar por puntos desc
  const sortedUsers = [...userList].sort((a, b) => b.points - a.points)

  // Aplicar filtros de búsqueda (solo usuarios activos)
  const filteredUsers = sortedUsers.filter((user) => {
    return (
      searchTerm === '' ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cedula.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Obtener top 3 para la vista de podio destacada
  const top1 = sortedUsers[0]
  const top2 = sortedUsers[1]
  const top3 = sortedUsers[2]

  return (
    <div className="space-y-6">
      {/* Header de la sección */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Podio de Usuarios</h1>
          <p className="text-sm text-on-surface-variant">
            Clasificación oficial de usuarios activos (rol USER) por puntuación acumulada
          </p>
        </div>
      </div>

      {/* Podio Destacado (Top 3) */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* 2do Lugar (Izquierda) */}
        {top2 ? (
          <div className="order-2 md:order-1 flex flex-col justify-between rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-5 text-center shadow-xs">
            <div className="flex flex-col items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-extrabold text-sm border border-slate-300">
                2.º
              </span>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold border-2 border-slate-300">
                <FiUser size={32} />
              </div>
              <h3 className="font-bold text-base text-on-surface mt-1">
                {top2.first_name} {top2.last_name}
              </h3>
              <span className="text-xs text-on-surface-variant truncate max-w-full">{top2.email}</span>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/60">
              <span className="block text-xl font-extrabold text-primary">{formatNumber(top2.points)}</span>
              <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Puntos</span>
            </div>
          </div>
        ) : null}

        {/* 1er Lugar (Centro - Destacado) */}
        {top1 ? (
          <div className="order-1 md:order-2 flex flex-col justify-between rounded-xl border-2 border-amber-500/50 bg-amber-500/5 p-6 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-lg tracking-wider">
              Líder
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white font-black text-base shadow-xs">
                1.º
              </span>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold border-2 border-amber-500">
                <FiAward size={40} />
              </div>
              <h3 className="font-extrabold text-lg text-on-surface mt-1">
                {top1.first_name} {top1.last_name}
              </h3>
              <span className="text-xs text-on-surface-variant truncate max-w-full">{top1.email}</span>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-500/30">
              <span className="block text-2xl font-black text-amber-700">{formatNumber(top1.points)}</span>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Puntos Totales</span>
            </div>
          </div>
        ) : null}

        {/* 3er Lugar (Derecha) */}
        {top3 ? (
          <div className="order-3 flex flex-col justify-between rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-5 text-center shadow-xs">
            <div className="flex flex-col items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-800/15 text-amber-900 font-extrabold text-sm border border-amber-800/30">
                3.º
              </span>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-900 font-bold border-2 border-amber-700/40">
                <FiUser size={32} />
              </div>
              <h3 className="font-bold text-base text-on-surface mt-1">
                {top3.first_name} {top3.last_name}
              </h3>
              <span className="text-xs text-on-surface-variant truncate max-w-full">{top3.email}</span>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/60">
              <span className="block text-xl font-extrabold text-primary">{formatNumber(top3.points)}</span>
              <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Puntos</span>
            </div>
          </div>
        ) : null}
      </section>

      {/* Tabla Completa de Posiciones */}
      <Panel title="Tabla Completa de Clasificación">
        {/* Controles de filtro y búsqueda */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 pl-9 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-hidden"
            />
          </div>
        </div>

        {/* Tabla estandarizada */}
        <div className="data-table-shell">
          <div className="overflow-x-auto">
            <table className="data-table min-w-[720px]">
              <thead>
                <tr>
                  <th className="w-20 text-center">Posición</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Estado</th>
                  <th className="text-right">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant text-xs">
                      No se encontraron usuarios en el podio.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const rank = sortedUsers.findIndex((u) => u.id === user.id) + 1
                    return (
                      <tr key={user.id}>
                        <td className="text-center">
                          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${getRankStyle(rank)}`}>
                            {rank}
                          </span>
                        </td>
                        <td>
                          <div className="user-cell">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0">
                              <FiUser size={18} />
                            </div>
                            <div className="min-w-0">
                              <strong className="text-sm font-bold text-on-surface truncate">
                                {user.first_name} {user.last_name}
                              </strong>
                              {user.cedula && (
                                <small className="text-[11px] text-on-surface-variant font-mono">{user.cedula}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-on-surface-variant text-xs">{user.email}</td>
                        <td>
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="text-right font-extrabold text-primary text-base">
                          {formatNumber(user.points)} <span className="text-xs font-semibold text-on-surface-variant">pts</span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            currentPage={currentPage}
            itemLabel="usuarios"
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSize={pageSize}
            totalItems={filteredUsers.length}
          />
        </div>
      </Panel>
    </div>
  )
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return 'bg-amber-500 text-white font-extrabold'
    case 2:
      return 'bg-slate-300 text-slate-800 font-extrabold'
    case 3:
      return 'bg-amber-800/20 text-amber-900 font-bold border border-amber-800/30'
    default:
      return 'bg-surface-container text-on-surface-variant font-medium'
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-DO').format(value)
}
