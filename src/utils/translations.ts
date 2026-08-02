const translationMap: Record<string, string> = {
  // Roles
  USER: 'Usuario',
  AGENT: 'Agente',
  AUDITOR: 'Auditor',
  ADMIN: 'Administrador',

  // Estados
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  SUSPENDED: 'Suspendido',
  BANNED: 'Baneado',
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  DELIVERED: 'Entregado',
  REJECTED: 'Rechazado',
  MISSION_VALIDATED: 'Misión Validada',
  VALIDATED: 'Validado',

  // Tipos de Transacciones / Puntos
  BONUS: 'Bono',
  PENALTY: 'Penalización',
  EARNED: 'Ganado',
  REDEEMED: 'Canjeado',

  // Tipos de Misiones
  RECYCLING: 'Reciclaje',
  CLEANUP: 'Limpieza',
  EDUCATION: 'Educación',
  COMMUNITY: 'Comunidad',

  // Acciones de auditoría y sistema
  ADMIN_USER_CREATED: 'Usuario creado (Admin)',
  USER_PROFILE_UPDATED_BY_ADMIN: 'Perfil actualizado por Admin',
  USER_ROLE_UPDATED: 'Rol de usuario actualizado',
  USER_STATUS_UPDATED: 'Estado de usuario actualizado',
  PUBLISH: 'Publicar',
  START: 'Iniciar',
  COMPLETE: 'Completar',
  CANCEL: 'Cancelar',
  APPROVE: 'Aprobar',
  DELIVER: 'Entregar',
  DEACTIVATE: 'Desactivar',
  ACTIVATE: 'Activar',
  REJECT: 'Rechazar',

  // Entidades
  USERS: 'Usuarios',
  ORGANIZATIONS: 'Organizaciones',
  MISSIONS: 'Misiones',
  REWARDS: 'Recompensas',
  REDEMPTIONS: 'Canjes',
  RECYCLING_LOGS: 'Reciclaje',
}

export function translateText(value: string | undefined | null): string {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (translationMap[trimmed]) {
    return translationMap[trimmed]
  }

  const upper = trimmed.toUpperCase()
  if (translationMap[upper]) {
    return translationMap[upper]
  }

  return trimmed.replaceAll('_', ' ')
}
