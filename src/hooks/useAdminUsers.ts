import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { emptyUserForm } from '../constants'
import { onlyDigits } from '../formatters'
import type { SavingAction, UserFilters } from '../pages/admin/types'
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      setUsers(await getAdminUsers(filters))
    } catch (error) {
      onError(error)
    } finally {
      setLoadingUsers(false)
    }
  }, [filters, onError])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUsers()
    }, 350)

    return () => window.clearTimeout(timer)
  }, [loadUsers])

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
        province: user.province ?? '',
        municipality: user.municipality ?? '',
        is_verified: user.is_verified,
      })
      setRoleChange({ role: user.role, reason: '' })
      setStatusChange({ status: user.status, reason: '' })
    } catch (error) {
      onError(error)
    }
  }

  const handleCreateFormChange = (newForm: UserFormState) => {
    setCreateForm(newForm)
    setCreateErrors((prev) => {
      const updated = { ...prev }
      if (newForm.email?.trim() && EMAIL_REGEX.test(newForm.email.trim())) {
        delete updated.email
      }
      if (newForm.first_name?.trim()) delete updated.first_name
      if (newForm.last_name?.trim()) delete updated.last_name
      if (onlyDigits(newForm.cedula).length === 11) delete updated.cedula
      if (newForm.password && newForm.password.length >= 6) delete updated.password
      return updated
    })
  }

  const validateCreateForm = () => {
    const errors: Partial<Record<keyof UserFormState, string>> = {}
    const cedulaDigits = onlyDigits(createForm.cedula)

    if (!cedulaDigits) {
      errors.cedula = 'La cédula es requerida.'
    } else if (cedulaDigits.length !== 11) {
      errors.cedula = 'La cédula debe tener 11 dígitos.'
    }

    if (!createForm.first_name?.trim()) {
      errors.first_name = 'El nombre es requerido.'
    }

    if (!createForm.last_name?.trim()) {
      errors.last_name = 'El apellido es requerido.'
    }

    const emailTrimmed = createForm.email?.trim() ?? ''
    if (!emailTrimmed) {
      errors.email = 'El correo electrónico es requerido.'
    } else if (!EMAIL_REGEX.test(emailTrimmed)) {
      errors.email = 'Ingresa un correo electrónico válido (ejemplo: usuario@correo.com).'
    }

    if (!createForm.password) {
      errors.password = 'La contraseña es requerida.'
    } else if (createForm.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres.'
    }

    setCreateErrors(errors)
    return Object.keys(errors).length ? 'Por favor corrige los campos marcados antes de crear el usuario.' : ''
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
      await createAdminUser({
        ...createForm,
        email: createForm.email.trim().toLowerCase(),
        first_name: createForm.first_name.trim(),
        last_name: createForm.last_name.trim(),
      })
      setCreateForm(emptyUserForm)
      setCreateErrors({})
      onToast('Usuario creado correctamente.', 'success')
      await loadUsers()
      await onAfterMutation()
    } catch (error: any) {
      const msg = String(error?.response?.data?.message || error?.message || '')
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('correo')) {
        setCreateErrors((prev) => ({ ...prev, email: 'El correo electrónico ya está registrado.' }))
      } else if (msg.toLowerCase().includes('cedula')) {
        setCreateErrors((prev) => ({ ...prev, cedula: 'La cédula ya está registrada.' }))
      }
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
      await loadUsers()
      await onAfterMutation()
    } catch (error) {
      onError(error)
    } finally {
      setSavingAction(null)
    }
  }

  const updateRole = async () => {
    if (!selectedUser || !roleChange.reason.trim()) {
      setRoleReasonError('Indica una razón para cambiar el rol.')
      onToast('Debes colocar una razón para actualizar el rol.', 'error')
      return
    }

    setRoleReasonError('')
    setSavingAction('role')
    try {
      await updateAdminUserRole(selectedUser.id, roleChange.role, roleChange.reason)
      onToast('Rol actualizado correctamente.', 'success')
      await selectUser(selectedUser.id)
      await loadUsers()
      await onAfterMutation()
    } catch (error) {
      onError(error)
    } finally {
      setSavingAction(null)
    }
  }

  const updateStatus = async () => {
    if (!selectedUser || !statusChange.reason.trim()) {
      setStatusReasonError('Indica una razón para cambiar el estado.')
      onToast('Debes colocar una razón para actualizar el estado.', 'error')
      return
    }

    setStatusReasonError('')
    setSavingAction('status')
    try {
      await updateAdminUserStatus(selectedUser.id, statusChange.status, statusChange.reason)
      onToast('Estado actualizado correctamente.', 'success')
      await selectUser(selectedUser.id)
      await loadUsers()
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
    setCreateForm: handleCreateFormChange,
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
