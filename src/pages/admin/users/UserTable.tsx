import { useState } from 'react'
import { FiEdit2, FiEye } from 'react-icons/fi'
import { RoleBadge, StatusBadge, TableActionButton, TablePagination } from '../../../components'
import { formatDate } from '../utils'
import type { AdminUser } from '../../../types'

type UserTableProps = {
  users: AdminUser[]
  onAction?: (id: string, action: 'edit' | 'view') => void
  onSelect?: (id: string) => void
}

function UserTable({ onAction, onSelect, users }: UserTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  if (!users.length) {
    return <p className="table-empty">No hay usuarios para mostrar.</p>
  }

  const paginatedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="data-table-shell">
      <div className="overflow-x-auto">
        <table className="data-table min-w-[820px]">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Puntos</th>
              <th>Fecha de registro</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <button className="user-cell" onClick={() => handleAction(user.id, 'view', onAction, onSelect)}>
                    <span className="user-avatar">{getInitials(user)}</span>
                    <span className="min-w-0">
                      <strong>{user.first_name} {user.last_name}</strong>
                      <small>{user.email}</small>
                    </span>
                  </button>
                </td>
                <td><RoleBadge role={user.role} /></td>
                <td><StatusBadge status={user.status} /></td>
                <td className="font-semibold text-on-surface">{new Intl.NumberFormat('es-DO').format(user.points)}</td>
                <td>{formatDate(user.created_at)}</td>
                <td>
                  <div className="table-actions justify-end">
                    <TableActionButton label="Ver detalle" onClick={() => handleAction(user.id, 'view', onAction, onSelect)}><FiEye /></TableActionButton>
                    <TableActionButton label="Editar usuario" onClick={() => handleAction(user.id, 'edit', onAction, onSelect)}><FiEdit2 /></TableActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={currentPage}
        itemLabel="usuarios"
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSize={pageSize}
        totalItems={users.length}
      />
    </div>
  )
}

function getInitials(user: AdminUser) {
  return `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'U'
}

function handleAction(id: string, action: 'edit' | 'view', onAction?: UserTableProps['onAction'], onSelect?: UserTableProps['onSelect']) {
  if (onAction) {
    onAction(id, action)
    return
  }

  onSelect?.(id)
}

export default UserTable
