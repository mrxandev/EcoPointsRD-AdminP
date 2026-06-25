import type { FormEvent } from 'react'
import { FiPlus, FiRefreshCw, FiSearch } from 'react-icons/fi'
import { Input, Loader, Panel, Select } from '../../../components'
import { roles, statuses } from '../../../constants'
import { formatDominicanCedula, formatDominicanPhone } from '../../../formatters'
import type { AdminUser, AuditLog, UserFormState, UserRole, UserStatus } from '../../../types'
import type { SavingAction, UserFilters } from '../types'
import UserDetail from './UserDetail'
import UserTable from './UserTable'

type UsersPageProps = {
  createErrors: Partial<Record<keyof UserFormState, string>>
  createForm: UserFormState
  editForm: Partial<AdminUser>
  filters: UserFilters
  loading: boolean
  roleChange: { role: UserRole; reason: string }
  roleReasonError: string
  savingAction: SavingAction
  selectedUser: AdminUser | null
  statusChange: { status: UserStatus; reason: string }
  statusReasonError: string
  userAudits: AuditLog[]
  users: AdminUser[]
  onCreateFormChange: (value: UserFormState) => void
  onCreateUser: (event: FormEvent) => void
  onEditFormChange: (value: Partial<AdminUser>) => void
  onFiltersChange: (value: UserFilters) => void
  onLoadUsers: () => void
  onRoleChange: (value: { role: UserRole; reason: string }) => void
  onSelectUser: (id: string) => void
  onStatusChange: (value: { status: UserStatus; reason: string }) => void
  onUpdateRole: () => void
  onUpdateStatus: () => void
  onUpdateUser: (event: FormEvent) => void
}

function UsersPage(props: UsersPageProps) {
  const {
    createErrors,
    createForm,
    editForm,
    filters,
    loading,
    roleChange,
    roleReasonError,
    savingAction,
    selectedUser,
    statusChange,
    statusReasonError,
    userAudits,
    users,
  } = props

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        <Panel title="Gestion de usuarios" action={<button className="button-secondary" onClick={props.onLoadUsers}><FiRefreshCw /> Actualizar</button>}>
          <div className="mb-4 grid items-end gap-3 md:grid-cols-[1fr_160px_160px]">
            <Input label="Busqueda" leftIcon={<FiSearch />} placeholder="Nombre, email o cedula" value={filters.search} onChange={(value) => props.onFiltersChange({ ...filters, search: value })} />
            <Select label="Rol" value={filters.role} onChange={(value) => props.onFiltersChange({ ...filters, role: value })} options={['', ...roles]} />
            <Select label="Estado" value={filters.status} onChange={(value) => props.onFiltersChange({ ...filters, status: value })} options={['', ...statuses]} />
          </div>
          {loading ? <Loader message="Cargando usuarios..." /> : <UserTable users={users} onSelect={props.onSelectUser} />}
        </Panel>

        <Panel title="Crear usuario" action={<FiPlus />}>
          <form onSubmit={props.onCreateUser} className="grid gap-3 md:grid-cols-2">
            <Input label="Cedula" error={createErrors.cedula} inputMode="numeric" maxLength={13} placeholder="000-0000000-0" value={formatDominicanCedula(createForm.cedula)} onChange={(value) => props.onCreateFormChange({ ...createForm, cedula: formatDominicanCedula(value) })} />
            <Input label="Telefono" inputMode="tel" maxLength={14} placeholder="(809)-844-3434" value={formatDominicanPhone(createForm.phone)} onChange={(value) => props.onCreateFormChange({ ...createForm, phone: formatDominicanPhone(value) })} />
            <Input label="Nombre" error={createErrors.first_name} placeholder="Nombre" value={createForm.first_name} onChange={(value) => props.onCreateFormChange({ ...createForm, first_name: value })} />
            <Input label="Apellido" error={createErrors.last_name} placeholder="Apellido" value={createForm.last_name} onChange={(value) => props.onCreateFormChange({ ...createForm, last_name: value })} />
            <Input label="Email" error={createErrors.email} placeholder="Email" value={createForm.email} onChange={(value) => props.onCreateFormChange({ ...createForm, email: value })} />
            <Input label="Contraseña" error={createErrors.password} placeholder="Contraseña" type="password" value={createForm.password} onChange={(value) => props.onCreateFormChange({ ...createForm, password: value })} />
            <Select label="Rol" value={createForm.role} onChange={(value) => props.onCreateFormChange({ ...createForm, role: value as UserRole })} options={roles} />
            <Select label="Estado" value={createForm.status} onChange={(value) => props.onCreateFormChange({ ...createForm, status: value as UserStatus })} options={statuses} />
            <Input label="Provincia" placeholder="Provincia" value={createForm.province} onChange={(value) => props.onCreateFormChange({ ...createForm, province: value })} />
            <Input label="Municipio" placeholder="Municipio" value={createForm.municipality} onChange={(value) => props.onCreateFormChange({ ...createForm, municipality: value })} />
            <button className="button-primary md:col-span-2" disabled={savingAction === 'create'}>{savingAction === 'create' ? 'Creando usuario...' : 'Crear usuario'}</button>
          </form>
        </Panel>
      </div>

      <UserDetail
        editForm={editForm}
        roleChange={roleChange}
        selectedUser={selectedUser}
        statusChange={statusChange}
        userAudits={userAudits}
        onRoleChange={props.onRoleChange}
        onStatusChange={props.onStatusChange}
        onUpdateRole={props.onUpdateRole}
        onUpdateStatus={props.onUpdateStatus}
        onEditFormChange={props.onEditFormChange}
        onSubmit={props.onUpdateUser}
        roleReasonError={roleReasonError}
        savingAction={savingAction}
        statusReasonError={statusReasonError}
      />
    </section>
  )
}

export default UsersPage
