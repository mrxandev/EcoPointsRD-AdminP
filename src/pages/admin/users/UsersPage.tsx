import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ReactNode } from 'react'
import { FiCheckCircle, FiPlus, FiRefreshCw, FiSearch, FiShield, FiSlash, FiUser, FiUserPlus } from 'react-icons/fi'
import { Input, Loader, Modal, MunicipalityInput, Panel, PhoneInput, ProvinceInput, Select } from '../../../components'
import { roles, statuses } from '../../../constants'
import { formatDominicanCedula } from '../../../formatters'
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

  const openUserModal = async (id: string, action: 'edit' | 'view') => {
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
          <MiniUserMetric icon={<FiCheckCircle />} label="Activos" value={activeUsers} tone="success" />
          <MiniUserMetric icon={<FiSlash />} label="Suspendidos" value={suspendedUsers} tone="warning" />
          <MiniUserMetric icon={<FiSlash />} label="Baneados" value={bannedUsers} tone="danger" />
        </div>

        <Panel title="Busqueda rapida" action={<button className="icon-tab" onClick={props.onLoadUsers} title="Actualizar usuarios" aria-label="Actualizar usuarios"><FiRefreshCw /></button>}>
          <div className="grid gap-4 md:grid-cols-3 items-end">
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                Buscar Usuario
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, correo o cédula..."
                  value={filters.search}
                  onChange={(e) => props.onFiltersChange({ ...filters, search: e.target.value })}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 pl-9 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-hidden transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                Rol de Usuario
              </label>
              <select
                value={filters.role}
                onChange={(e) => props.onFiltersChange({ ...filters, role: e.target.value as UserRole })}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-hidden font-semibold transition-colors cursor-pointer"
              >
                <option value="">Todos los roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r === 'ADMIN' ? 'Administrador' : r === 'AGENT' ? 'Agente' : 'Usuario'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                Estado Cuenta
              </label>
              <select
                value={filters.status}
                onChange={(e) => props.onFiltersChange({ ...filters, status: e.target.value as UserStatus })}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-hidden font-semibold transition-colors cursor-pointer"
              >
                <option value="">Todos los estados</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s === 'ACTIVE' ? 'Activo' : s === 'SUSPENDED' ? 'Suspendido' : 'Baneado'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Panel>

        <Panel title="Usuarios registrados">
          {loading ? <Loader message="Cargando usuarios..." /> : <UserTable users={users} onAction={openUserModal} />}
        </Panel>
      </section>

      <Modal title="Crear usuario" open={modal === 'create'} onClose={() => setModal(null)}>
        <form onSubmit={props.onCreateUser} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Bento Card 1: Datos Personales */}
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
                <FiUser className="text-primary" />
                <span>Información Personal</span>
              </div>
              <Input label="Cedula" required error={createErrors.cedula} inputMode="numeric" maxLength={13} placeholder="000-0000000-0" value={formatDominicanCedula(createForm.cedula)} onChange={(value) => props.onCreateFormChange({ ...createForm, cedula: formatDominicanCedula(value) })} />
              <PhoneInput label="Telefono" value={createForm.phone} onChange={(value) => props.onCreateFormChange({ ...createForm, phone: value })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Nombre" required error={createErrors.first_name} placeholder="Nombre" value={createForm.first_name} onChange={(value) => props.onCreateFormChange({ ...createForm, first_name: value })} />
                <Input label="Apellido" required error={createErrors.last_name} placeholder="Apellido" value={createForm.last_name} onChange={(value) => props.onCreateFormChange({ ...createForm, last_name: value })} />
              </div>
              <Input label="Email" required error={createErrors.email} placeholder="Email" value={createForm.email} onChange={(value) => props.onCreateFormChange({ ...createForm, email: value })} />
              <Input label="Contraseña" required error={createErrors.password} placeholder="Contraseña" type="password" value={createForm.password} onChange={(value) => props.onCreateFormChange({ ...createForm, password: value })} />
            </div>

            {/* Bento Card 2: Rol, Estado y Ubicación */}
            <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
                  <FiShield className="text-tertiary" />
                  <span>Rol, Estado y Ubicación</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select label="Rol" required value={createForm.role} onChange={(value) => props.onCreateFormChange({ ...createForm, role: value as UserRole })} options={roles} />
                  <Select label="Estado" required value={createForm.status} onChange={(value) => props.onCreateFormChange({ ...createForm, status: value as UserStatus })} options={statuses} />
                </div>
                <ProvinceInput value={createForm.province} onChange={(value) => props.onCreateFormChange({ ...createForm, province: value, municipality: '' })} />
                <MunicipalityInput province={createForm.province} value={createForm.municipality} onChange={(value) => props.onCreateFormChange({ ...createForm, municipality: value })} />
              </div>
              <button className="button-primary w-full mt-2" disabled={savingAction === 'create'}>
                <FiPlus /> {savingAction === 'create' ? 'Creando usuario...' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal title={modal === 'view' ? 'Detalle del usuario' : 'Editar usuario'} open={modal === 'view' || modal === 'edit'} onClose={() => setModal(null)}>
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
