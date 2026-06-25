import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { emptyUserForm } from '../constants'
import { onlyDigits } from '../formatters'
import type { UserFilters, SavingAction } from '../pages/admin/types'
import { getAuditLogsByTargetUser } from '../services/adminAuditService'
import {
  createAdminUser,
  getAdminUserDetail,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '../services/adminUsersService'
import type { AdminUser, AuditLog, UserFormState, UserRole, UserStatus } from '../types'

export function useAdminUsers({
  onAfterMutation,
  onError,
  onToast,
}: {
  onAfterMutation: () => Promise<void>
  onError: (error: unknown) => void
  onToast: (message: string, tone?: 'info' | 'success' | 'error') => void
}) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [userAudits, setUserAudits] = useState<AuditLog[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [savingAction, setSavingAction] = useState<SavingAction>(null)
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof UserFormState, string>>>({})
  const [roleReasonError, setRoleReasonError] = useState('')
  const [statusReasonError, setStatusReasonError] = useState('')
  const [filters, setFilters] = useState<UserFilters>({ role: '', status: '', search: '' })
  const [createForm, setCreateForm] = useState<UserFormState>(emptyUserForm)
  const [editForm, setEditForm] = useState<Partial<AdminUser>>({})
  const [roleChange, setRoleChange] = useState({ role: 'USER' as UserRole, reason: '' })
  const [statusChange, setStatusChange] = useState({ status: 'ACTIVE' as UserStatus, reason: '' })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUsers()
    }, 350)

    return () => window.clearTimeout(timer)
  }, [filters])

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      setUsers(await getAdminUsers(filters))
    } catch (error) {
      onError(error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const selectUser = async (id: string) => {
    setRoleReasonError('')
    setStatusReasonError('')
    try {
      const user = await getAdminUserDetail(id)

      if (!user) {
        onToast('No se pudo leer el detalle del usuario.', 'error')
        return
      }

      setSelectedUser(user)
      onToast('Usuario cargado correctamente.', 'info')
      setUserAudits(await getAuditLogsByTargetUser(id))
      setEditForm({
        cedula: user.cedula,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        is_verified: user.is_verified,
        province: user.province ?? '',
        municipality: user.municipality ?? '',
        profile_image: user.profile_image ?? '',
      })
      setRoleChange({ role: user.role, reason: '' })
      setStatusChange({ status: user.status, reason: '' })
    } catch (error) {
      onError(error)
    }
  }

  const createUser = async (event: FormEvent) => {
    event.preventDefault()
    const validation = validateCreateForm()
    if (validation) {
      onToast(validation, 'error')
      return
    }

    setSavingAction('create')
    try {
      await createAdminUser(createForm)
      setCreateForm(emptyUserForm)
      setCreateErrors({})
      onToast('Usuario creado correctamente.', 'success')
      await onAfterMutation()
    } catch (error) {
      onError(error)
    } finally {
      setSavingAction(null)
    }
  }

  const updateUser = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedUser) return

    setSavingAction('profile')
    try {
      await updateAdminUser(selectedUser.id, editForm)
      onToast('Perfil actualizado correctamente.', 'success')
      await selectUser(selectedUser.id)
      await onAfterMutation()
    } catch (error) {
      onError(error)
    } finally {
      setSavingAction(null)
    }
  }

  const updateRole = async () => {
    if (!selectedUser || !roleChange.reason.trim()) {
      setRoleReasonError('Indica una razon para cambiar el rol.')
      onToast('Debes colocar una razon para actualizar el rol.', 'error')
      return
    }

    setRoleReasonError('')
    setSavingAction('role')
    try {
      await updateAdminUserRole(selectedUser.id, roleChange.role, roleChange.reason)
      onToast('Rol actualizado correctamente.', 'success')
      await selectUser(selectedUser.id)
      await onAfterMutation()
    } catch (error) {
      onError(error)
    } finally {
      setSavingAction(null)
    }
  }

  const updateStatus = async () => {
    if (!selectedUser || !statusChange.reason.trim()) {
      setStatusReasonError('Indica una razon para cambiar el estado.')
      onToast('Debes colocar una razon para actualizar el estado.', 'error')
      return
    }

    setStatusReasonError('')
    setSavingAction('status')
    try {
      await updateAdminUserStatus(selectedUser.id, statusChange.status, statusChange.reason)
      onToast('Estado actualizado correctamente.', 'success')
      await selectUser(selectedUser.id)
      await onAfterMutation()
    } catch (error) {
      onError(error)
    } finally {
      setSavingAction(null)
    }
  }

  const setRoleChangeAndClearError = (value: { role: UserRole; reason: string }) => {
    setRoleChange(value)
    if (value.reason.trim()) setRoleReasonError('')
  }

  const setStatusChangeAndClearError = (value: { status: UserStatus; reason: string }) => {
    setStatusChange(value)
    if (value.reason.trim()) setStatusReasonError('')
  }

  const validateCreateForm = () => {
    const errors: Partial<Record<keyof UserFormState, string>> = {}
    const cedulaDigits = onlyDigits(createForm.cedula)

    if (!cedulaDigits) errors.cedula = 'La cedula es requerida.'
    else if (cedulaDigits.length !== 11) errors.cedula = 'Debe tener 11 digitos.'
    if (!createForm.first_name) errors.first_name = 'El nombre es requerido.'
    if (!createForm.last_name) errors.last_name = 'El apellido es requerido.'
    if (!createForm.email) errors.email = 'El email es requerido.'
    if (!createForm.password) errors.password = 'La contraseña es requerida.'

    setCreateErrors(errors)
    return Object.keys(errors).length ? 'Completa los campos marcados antes de crear el usuario.' : ''
  }

  return {
    createErrors,
    createForm,
    createUser,
    editForm,
    filters,
    loadingUsers,
    loadUsers,
    roleChange,
    roleReasonError,
    savingAction,
    selectedUser,
    selectUser,
    setCreateForm,
    setEditForm,
    setFilters,
    setRoleChange: setRoleChangeAndClearError,
    setStatusChange: setStatusChangeAndClearError,
    statusChange,
    statusReasonError,
    updateRole,
    updateStatus,
    updateUser,
    userAudits,
    users,
  }
}
