import { RoleBadge, StatusBadge } from '../../../components'
import type { AdminUser } from '../../../types'

type UserTableProps = {
  users: AdminUser[]
  onSelect: (id: string) => void
}

function UserTable({ users, onSelect }: UserTableProps) {
  if (!users.length) {
    return <p className="rounded-md bg-surface-container px-4 py-6 text-center text-sm text-on-surface-variant">No hay usuarios para mostrar.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-xs uppercase text-on-surface-variant">
          <tr><th className="p-3">Usuario</th><th className="p-3">Rol</th><th className="p-3">Estado</th><th className="p-3">Puntos</th><th className="p-3">Verificado</th></tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="cursor-pointer border-t border-outline-variant hover:bg-surface-container-low" onClick={() => onSelect(user.id)}>
              <td className="p-3"><strong>{user.first_name} {user.last_name}</strong><p className="text-xs text-on-surface-variant">{user.email}</p></td>
              <td className="p-3"><RoleBadge role={user.role} /></td>
              <td className="p-3"><StatusBadge status={user.status} /></td>
              <td className="p-3">{user.points}</td>
              <td className="p-3">{user.is_verified ? 'Si' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable
