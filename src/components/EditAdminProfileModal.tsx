import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FiCheck } from 'react-icons/fi'
import { MunicipalityInput, ProvinceInput } from './GeographyInputs'
import Input from './Input'
import Loader from './Loader'
import Modal from './Modal'
import { PhoneInput } from './PhoneInput'
import UserAvatar from './UserAvatar'
import { getMyProfile, updateMyProfile } from '../services/adminProfileService'
import type { AdminUser, AuthUser } from '../types'

const PROFILE_IMAGE_BASE_URL =
  'https://mdiprdoemvfwsknnbcox.supabase.co/storage/v1/object/public/imagenesPerfil'

const AVAILABLE_AVATARS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  url: `${PROFILE_IMAGE_BASE_URL}/${i + 1}.png`,
}))

type EditAdminProfileModalProps = {
  isOpen: boolean
  admin: AuthUser | AdminUser | null
  onClose: () => void
  onSuccess: (updatedAdmin: AdminUser) => void
  onError: (error: unknown) => void
  onToast: (message: string, tone?: 'info' | 'success' | 'error') => void
}

export function EditAdminProfileModal({
  isOpen,
  admin,
  onClose,
  onSuccess,
  onError,
  onToast,
}: EditAdminProfileModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [province, setProvince] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [address, setAddress] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    // 1. Cargar inmediatamente datos locales si existen
    if (admin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFirstName(admin.first_name ?? '')
      setLastName(admin.last_name ?? '')
      setPhone(admin.phone ?? '')
      setProvince((admin as AdminUser).province ?? '')
      setMunicipality((admin as AdminUser).municipality ?? '')
      setAddress((admin as AdminUser).address ?? '')
      setProfileImage((admin as AdminUser).profile_image ?? '')
    }

    // 2. Traer la información más reciente desde el backend GET /api/users/me
    setIsLoadingProfile(true)
    getMyProfile()
      .then((freshUser) => {
        if (freshUser) {
          setFirstName(freshUser.first_name ?? '')
          setLastName(freshUser.last_name ?? '')
          setPhone(freshUser.phone ?? '')
          setProvince(freshUser.province ?? '')
          setMunicipality(freshUser.municipality ?? '')
          setAddress(freshUser.address ?? '')
          setProfileImage(freshUser.profile_image ?? '')
        }
      })
      .catch((err) => {
        console.warn('Error al obtener perfil del servidor:', err)
      })
      .finally(() => {
        setIsLoadingProfile(false)
      })
  }, [isOpen, admin])

  if (!isOpen || !admin) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim()) {
      onToast('Nombre y apellido son obligatorios.', 'error')
      return
    }

    setIsSaving(true)
    try {
      const updated = await updateMyProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        province: province.trim(),
        municipality: municipality.trim(),
        address: address.trim(),
        profile_image: profileImage ? profileImage.trim() : null,
      })

      onToast('Perfil actualizado correctamente.', 'success')
      onSuccess(updated)
      onClose()
    } catch (error) {
      onError(error)
    } finally {
      setIsSaving(false)
    }
  }

  const currentUserPreview = {
    first_name: firstName,
    last_name: lastName,
    profile_image: profileImage,
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Editar Mi Perfil">
      {isLoadingProfile ? (
        <div className="flex min-h-64 flex-col items-center justify-center space-y-2 py-8">
          <Loader />
          <p className="text-xs font-semibold text-on-surface-variant">Cargando información del usuario...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Vista previa del perfil */}
          <div className="flex flex-col items-center justify-center space-y-2 rounded-xl border border-outline-variant bg-surface-container-low p-4">
            <UserAvatar
              user={currentUserPreview}
              imageClassName="h-20 w-20 rounded-full object-cover border-2 border-primary shadow-xs"
              fallbackClassName="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary font-black text-2xl border-2 border-primary"
            />
            <div className="text-center">
              <span className="block font-bold text-sm text-on-surface">
                {firstName} {lastName}
              </span>
              <span className="text-xs text-on-surface-variant font-mono">{admin.email}</span>
            </div>
          </div>

          {/* Selección de avatar de imagen */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Selecciona tu imagen de perfil
            </label>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-5">
              {AVAILABLE_AVATARS.map((avatar) => {
                const isSelected = profileImage === avatar.url

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setProfileImage(avatar.url)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all hover:scale-105 focus:outline-hidden ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-xs'
                        : 'border-outline-variant hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={avatar.url}
                      alt={`Avatar ${avatar.id}`}
                      className="h-full w-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                        <FiCheck size={12} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-outline-variant/60" />

          {/* Campos de texto */}
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Nombre"
                required
                placeholder="Tu nombre"
                value={firstName}
                onChange={setFirstName}
              />
              <Input
                label="Apellido"
                required
                placeholder="Tu apellido"
                value={lastName}
                onChange={setLastName}
              />
            </div>

            <PhoneInput
              label="Teléfono"
              value={phone}
              onChange={setPhone}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <ProvinceInput
                value={province}
                onChange={(val) => {
                  setProvince(val)
                  setMunicipality('')
                }}
              />
              <MunicipalityInput
                province={province}
                value={municipality}
                onChange={setMunicipality}
              />
            </div>

            <Input
              label="Dirección"
              placeholder="Tu dirección"
              value={address}
              onChange={setAddress}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default EditAdminProfileModal
