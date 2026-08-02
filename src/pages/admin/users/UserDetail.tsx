import type { FormEvent } from 'react'
import { FiEdit3, FiMapPin, FiShield, FiSlash, FiUser } from 'react-icons/fi'
import { Input, MunicipalityInput, Panel, PhoneInput, ProvinceInput, RoleBadge, Select, StatusBadge } from '../../../components'
import { roles, statuses } from '../../../constants'
import { formatDominicanCedula, formatDominicanPhone } from '../../../formatters'
import type { AdminUser, AuditLog, UserRole, UserStatus } from '../../../types'
import AuditList from '../components/AuditList'
import type { SavingAction } from '../types'
import { getUserName } from '../utils'

type UserDetailProps = {
  selectedUser: AdminUser | null
  editForm: Partial<AdminUser>
  mode?: 'edit' | 'status' | 'view'
  roleChange: { role: UserRole; reason: string }
  roleReasonError: string
  savingAction: SavingAction
  statusChange: { status: UserStatus; reason: string }
  statusReasonError: string
  userAudits: AuditLog[]
  onEditFormChange: (value: Partial<AdminUser>) => void
  onRoleChange: (value: { role: UserRole; reason: string }) => void
  onStatusChange: (value: { status: UserStatus; reason: string }) => void
  onSubmit: (event: FormEvent) => void
  onUpdateRole: () => void
  onUpdateStatus: () => void
}

function UserDetail(props: UserDetailProps) {
  const { mode = 'edit', selectedUser, editForm, roleChange, roleReasonError, savingAction, statusChange, statusReasonError, userAudits } = props

  if (!selectedUser) {
    return <Panel title="Detalle"><div className="flex min-h-64 flex-col items-center justify-center text-center text-on-surface-variant"><FiUser size={36} /><p className="mt-3 text-sm">Selecciona un usuario para editar su perfil, rol o estado.</p></div></Panel>
  }

  return (
    <div className="space-y-6">
      {mode === 'view' && (
        <Panel title={getUserName(selectedUser)} action={<StatusBadge status={selectedUser.status} />}>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Bento Card 1: Información de la Cuenta */}
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
                <FiUser className="text-primary" />
                <span>Información de la Cuenta</span>
              </div>
              <div className="space-y-2">
                <DetailRow label="Email" value={selectedUser.email} />
                <DetailRow label="Cédula" value={formatDominicanCedula(selectedUser.cedula)} />
                <DetailRow label="Teléfono" value={formatDominicanPhone(selectedUser.phone ?? '')} />
                <DetailRow label="Rol" value={<RoleBadge role={selectedUser.role} />} />
                <DetailRow label="Estado" value={<StatusBadge status={selectedUser.status} />} />
                <DetailRow label="Verificado" value={selectedUser.is_verified ? 'Sí' : 'No'} />
              </div>
            </div>

            {/* Bento Card 2: Ubicación y Puntos */}
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
                <FiMapPin className="text-success" />
                <span>Ubicación y Puntos</span>
              </div>
              <div className="space-y-2">
                <DetailRow label="Provincia" value={selectedUser.province ?? '-'} />
                <DetailRow label="Municipio" value={selectedUser.municipality ?? '-'} />
                <DetailRow label="Puntos acumulados" value={`${new Intl.NumberFormat('es-DO').format(selectedUser.points)} pts`} />
              </div>
            </div>
          </div>
        </Panel>
      )}

      {(mode === 'edit' || mode === 'status') && (
        <Panel title={getUserName(selectedUser)} action={<StatusBadge status={selectedUser.status} />}>
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            {/* Bento Card 1: Datos Personales */}
            <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
                  <FiUser className="text-primary" />
                  <span>Información Personal</span>
                </div>
                <form id="user-profile-form" onSubmit={props.onSubmit} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Nombre" placeholder="Nombre" value={String(editForm.first_name ?? '')} onChange={(value) => props.onEditFormChange({ ...editForm, first_name: value })} />
                    <Input label="Apellido" placeholder="Apellido" value={String(editForm.last_name ?? '')} onChange={(value) => props.onEditFormChange({ ...editForm, last_name: value })} />
                  </div>
                  <Input label="Email" placeholder="Email" value={String(editForm.email ?? '')} onChange={(value) => props.onEditFormChange({ ...editForm, email: value })} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Cedula" inputMode="numeric" maxLength={13} placeholder="000-0000000-0" value={formatDominicanCedula(String(editForm.cedula ?? ''))} onChange={(value) => props.onEditFormChange({ ...editForm, cedula: formatDominicanCedula(value) })} />
                    <PhoneInput label="Telefono" value={String(editForm.phone ?? '')} onChange={(value) => props.onEditFormChange({ ...editForm, phone: value })} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ProvinceInput value={String(editForm.province ?? '')} onChange={(value) => props.onEditFormChange({ ...editForm, province: value })} />
                    <MunicipalityInput province={String(editForm.province ?? '')} value={String(editForm.municipality ?? '')} onChange={(value) => props.onEditFormChange({ ...editForm, municipality: value })} />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-on-surface pt-1 cursor-pointer">
                    <input type="checkbox" checked={Boolean(editForm.is_verified)} onChange={(event) => props.onEditFormChange({ ...editForm, is_verified: event.target.checked })} />
                    Usuario verificado
                  </label>
                </form>
              </div>
              <button form="user-profile-form" type="submit" className="button-primary w-full mt-2" disabled={savingAction === 'profile'}>
                <FiEdit3 /> {savingAction === 'profile' ? 'Guardando perfil...' : 'Guardar perfil'}
              </button>
            </div>

            {/* Bento Column 2: Administración (Rol y Estado) */}
            <div className="space-y-4">
              {/* Bento Card 2: Gestión de Rol */}
              <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
                  <FiShield className="text-tertiary" />
                  <span>Gestión de Rol</span>
                </div>
                <Select label="Nuevo rol" value={roleChange.role} onChange={(value) => props.onRoleChange({ ...roleChange, role: value as UserRole })} options={roles} />
                <Input label="Razon del cambio de rol" error={roleReasonError} placeholder="Razon del cambio de rol" value={roleChange.reason} onChange={(value) => props.onRoleChange({ ...roleChange, reason: value })} />
                <button className="button-secondary w-full" onClick={props.onUpdateRole} disabled={savingAction === 'role'}>
                  {savingAction === 'role' ? 'Actualizando rol...' : 'Actualizar rol'}
                </button>
              </div>

              {/* Bento Card 3: Gestión de Estado */}
              <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-on-surface border-b border-outline-variant pb-2">
                  <FiSlash className="text-warning" />
                  <span>Gestión de Estado</span>
                </div>
                <Select label="Nuevo estado" value={statusChange.status} onChange={(value) => props.onStatusChange({ ...statusChange, status: value as UserStatus })} options={statuses} />
                <Input label="Razon del cambio de estado" error={statusReasonError} placeholder="Razon del cambio de estado" value={statusChange.reason} onChange={(value) => props.onStatusChange({ ...statusChange, reason: value })} />
                <button className="button-secondary w-full" onClick={props.onUpdateStatus} disabled={savingAction === 'status'}>
                  {savingAction === 'status' ? 'Actualizando estado...' : 'Actualizar estado'}
                </button>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {mode === 'view' && <Panel title="Auditorias del usuario">
        <AuditList audits={userAudits.slice(0, 5)} />
      </Panel>}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
      <span className="text-on-surface-variant font-medium">{label}</span>
      <span className="font-semibold text-on-surface break-words">{value || '-'}</span>
    </div>
  )
}

export default UserDetail
