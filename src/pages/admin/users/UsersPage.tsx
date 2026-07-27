import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ReactNode } from 'react'
import { FiCheckCircle, FiDownload, FiPlus, FiSearch, FiSlash, FiUserPlus } from 'react-icons/fi'
import { Input, Loader, Modal, Panel, Select } from '../../../components'
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
  const [modal, setModal] = useState<'create' | 'edit' | 'status' | 'view' | null>(null)
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
  const activeUsers = users.filter((user) => user.status === 'ACTIVE').length
  const suspendedUsers = users.filter((user) => user.status === 'SUSPENDED').length
  const bannedUsers = users.filter((user) => user.status === 'BANNED').length

  const openUserModal = async (id: string, action: 'edit' | 'status' | 'view') => {
    setModal(action)
    await props.onSelectUser(id)
  }

  return (
    <>
      <section className="min-w-0 space-y-6">
        <div className="page-heading">
          <div>
            <p>Admin / Usuarios</p>
            <h1>Gestion de Usuarios</h1>
            <span>Supervisa y administra el acceso de los miembros de la plataforma EcoPointsRD.</span>
          </div>
          <button className="button-primary" onClick={() => setModal('create')}><FiUserPlus /> Crear Usuario</button>
        </div>

        <div className="metric-strip">
          <MiniUserMetric icon={<FiUserPlus />} label="Nuevos hoy" value={`+${Math.min(users.length, 24)}`} tone="success" />
          <MiniUserMetric icon={<FiCheckCircle />} label="Activos" value={activeUsers} tone="success" />
          <MiniUserMetric icon={<FiSlash />} label="Suspendidos" value={suspendedUsers} tone="warning" />
          <MiniUserMetric icon={<FiSlash />} label="Baneados" value={bannedUsers} tone="danger" />
        </div>

        <Panel title="Busqueda rapida" action={<button className="icon-tab" onClick={props.onLoadUsers} aria-label="Actualizar usuarios"><FiDownload /></button>}>
          <div className="grid items-end gap-3 md:grid-cols-[1fr_180px_180px]">
            <Input label="Nombre, email o cedula" leftIcon={<FiSearch />} placeholder="Buscar usuario..." value={filters.search} onChange={(value) => props.onFiltersChange({ ...filters, search: value })} />
            <Select label="Rol de usuario" value={filters.role} onChange={(value) => props.onFiltersChange({ ...filters, role: value })} options={['', ...roles]} />
            <Select label="Estado cuenta" value={filters.status} onChange={(value) => props.onFiltersChange({ ...filters, status: value })} options={['', ...statuses]} />
          </div>
        </Panel>

        <Panel title="Usuarios registrados">
          {loading ? <Loader message="Cargando usuarios..." /> : <UserTable users={users} onAction={openUserModal} />}
        </Panel>
      </section>

      <Modal title="Crear usuario" open={modal === 'create'} onClose={() => setModal(null)}>
        <Panel title="Datos del usuario" action={<FiPlus />}>
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
      </Modal>

      <Modal title={modal === 'view' ? 'Detalle del usuario' : modal === 'status' ? 'Rol y estado' : 'Editar usuario'} open={modal === 'view' || modal === 'edit' || modal === 'status'} onClose={() => setModal(null)}>
        <UserDetail
          editForm={editForm}
          mode={modal === 'view' ? 'view' : modal === 'status' ? 'status' : 'edit'}
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
      </Modal>
    </>
  )
}

function MiniUserMetric({ icon, label, tone, value }: { icon: ReactNode; label: string; tone: 'danger' | 'success' | 'warning'; value: number | string }) {
  return (
    <article className="mini-metric">
      <span className={`mini-metric-icon mini-metric-${tone}`}>{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </article>
  )
}

export default UsersPage
