import type { FormEvent } from 'react'
import { FiEdit3, FiUser } from 'react-icons/fi'
import { Input, Panel, Select, StatusBadge } from '../../../components'
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
          <div className="detail-grid">
            <DetailItem label="Email" value={selectedUser.email} />
            <DetailItem label="Cedula" value={formatDominicanCedula(selectedUser.cedula)} />
            <DetailItem label="Telefono" value={formatDominicanPhone(selectedUser.phone ?? '')} />
            <DetailItem label="Rol" value={selectedUser.role} />
            <DetailItem label="Provincia" value={selectedUser.province ?? '-'} />
            <DetailItem label="Municipio" value={selectedUser.municipality ?? '-'} />
            <DetailItem label="Puntos" value={String(selectedUser.points)} />
            <DetailItem label="Verificado" value={selectedUser.is_verified ? 'Si' : 'No'} />
          </div>
        </Panel>
      )}

      {mode === 'edit' && (
        <Panel title={getUserName(selectedUser)} action={<StatusBadge status={selectedUser.status} />}>
        <form onSubmit={props.onSubmit} className="space-y-3">
          <Input label="Nombre" placeholder="Nombre" value={String(editForm.first_name ?? '')} onChange={(value) => props.onEditFormChange({ ...editForm, first_name: value })} />
          <Input label="Apellido" placeholder="Apellido" value={String(editForm.last_name ?? '')} onChange={(value) => props.onEditFormChange({ ...editForm, last_name: value })} />
          <Input label="Email" placeholder="Email" value={String(editForm.email ?? '')} onChange={(value) => props.onEditFormChange({ ...editForm, email: value })} />
          <Input label="Cedula" inputMode="numeric" maxLength={13} placeholder="000-0000000-0" value={formatDominicanCedula(String(editForm.cedula ?? ''))} onChange={(value) => props.onEditFormChange({ ...editForm, cedula: formatDominicanCedula(value) })} />
          <Input label="Telefono" inputMode="tel" maxLength={14} placeholder="(809)-844-3434" value={formatDominicanPhone(String(editForm.phone ?? ''))} onChange={(value) => props.onEditFormChange({ ...editForm, phone: formatDominicanPhone(value) })} />
          <Input label="Provincia" placeholder="Provincia" value={String(editForm.province ?? '')} onChange={(value) => props.onEditFormChange({ ...editForm, province: value })} />
          <Input label="Municipio" placeholder="Municipio" value={String(editForm.municipality ?? '')} onChange={(value) => props.onEditFormChange({ ...editForm, municipality: value })} />
          <label className="flex items-center gap-2 text-sm text-on-surface"><input type="checkbox" checked={Boolean(editForm.is_verified)} onChange={(event) => props.onEditFormChange({ ...editForm, is_verified: event.target.checked })} /> Usuario verificado</label>
          <button className="button-primary w-full" disabled={savingAction === 'profile'}><FiEdit3 /> {savingAction === 'profile' ? 'Guardando perfil...' : 'Guardar perfil'}</button>
        </form>
        </Panel>
      )}

      {mode === 'status' && (
        <Panel title="Rol y estado">
        <div className="space-y-3">
          <Select label="Nuevo rol" value={roleChange.role} onChange={(value) => props.onRoleChange({ ...roleChange, role: value as UserRole })} options={roles} />
          <Input label="Razon del cambio de rol" error={roleReasonError} placeholder="Razon del cambio de rol" value={roleChange.reason} onChange={(value) => props.onRoleChange({ ...roleChange, reason: value })} />
          <button className="button-secondary w-full" onClick={props.onUpdateRole} disabled={savingAction === 'role'}>{savingAction === 'role' ? 'Actualizando rol...' : 'Actualizar rol'}</button>
          <Select label="Nuevo estado" value={statusChange.status} onChange={(value) => props.onStatusChange({ ...statusChange, status: value as UserStatus })} options={statuses} />
          <Input label="Razon del cambio de estado" error={statusReasonError} placeholder="Razon del cambio de estado" value={statusChange.reason} onChange={(value) => props.onStatusChange({ ...statusChange, reason: value })} />
          <button className="button-secondary w-full" onClick={props.onUpdateStatus} disabled={savingAction === 'status'}>{savingAction === 'status' ? 'Actualizando estado...' : 'Actualizar estado'}</button>
        </div>
        </Panel>
      )}

      {mode === 'view' && <Panel title="Auditorias del usuario">
        <AuditList audits={userAudits.slice(0, 5)} />
      </Panel>}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  )
}

export default UserDetail
