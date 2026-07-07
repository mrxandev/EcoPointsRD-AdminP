import { FiEdit2, FiEye, FiSlash } from 'react-icons/fi'
import { RoleBadge, StatusBadge } from '../../../components'
import { formatDate } from '../utils'
import type { AdminUser } from '../../../types'

type UserTableProps = {
  users: AdminUser[]
  onAction?: (id: string, action: 'edit' | 'status' | 'view') => void
  onSelect?: (id: string) => void
}

function UserTable({ onAction, onSelect, users }: UserTableProps) {
  if (!users.length) {
    return <p className="table-empty">No hay usuarios para mostrar.</p>
  }

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
            {users.map((user) => (
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
                    <ActionButton label="Ver detalle" onClick={() => handleAction(user.id, 'view', onAction, onSelect)}><FiEye /></ActionButton>
                    <ActionButton label="Editar usuario" onClick={() => handleAction(user.id, 'edit', onAction, onSelect)}><FiEdit2 /></ActionButton>
                    <ActionButton danger label="Rol y estado" onClick={() => handleAction(user.id, 'status', onAction, onSelect)}><FiSlash /></ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Mostrando 1-{users.length} de {users.length} usuarios</span>
        <div className="pagination">
          <button disabled>{'<'}</button>
          <button className="active">1</button>
          <button disabled>{'>'}</button>
        </div>
      </div>
    </div>
  )
}

function ActionButton({ children, danger = false, label, onClick }: { children: React.ReactNode; danger?: boolean; label: string; onClick: () => void }) {
  return (
    <button className={`table-icon-button table-action-tooltip ${danger ? 'table-icon-danger' : ''}`} onClick={onClick} aria-label={label} title={label}>
      {children}
      <span>{label}</span>
    </button>
  )
}

function getInitials(user: AdminUser) {
  return `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'U'
}

function handleAction(id: string, action: 'edit' | 'status' | 'view', onAction?: UserTableProps['onAction'], onSelect?: UserTableProps['onSelect']) {
  if (onAction) {
    onAction(id, action)
    return
  }

  onSelect?.(id)
}

export default UserTable
