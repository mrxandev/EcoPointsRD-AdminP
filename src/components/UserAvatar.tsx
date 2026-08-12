import { useState } from 'react'

export type UserAvatarProps = {
  user?: {
    first_name?: string | null
    last_name?: string | null
    profile_image?: string | null
  } | null
  imageClassName?: string
  fallbackClassName?: string
}

export function getInitials(user?: { first_name?: string | null; last_name?: string | null } | null) {
  if (!user) return 'U'
  const first = user.first_name?.trim()?.[0] ?? ''
  const last = user.last_name?.trim()?.[0] ?? ''
  return (first + last).toUpperCase() || 'U'
}

export function UserAvatar({
  user,
  imageClassName = 'h-9 w-9 rounded-full object-cover shrink-0',
  fallbackClassName = 'flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0',
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false)

  const initials = getInitials(user)
  const hasImage = Boolean(user?.profile_image && user.profile_image.trim() !== '')

  if (hasImage && !hasError) {
    return (
      <img
        src={user!.profile_image!}
        alt={`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || 'Avatar'}
        className={imageClassName}
        onError={() => setHasError(true)}
      />
    )
  }

  return <div className={fallbackClassName}>{initials}</div>
}

export default UserAvatar
