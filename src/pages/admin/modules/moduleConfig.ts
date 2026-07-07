import type { AdminView } from '../types'
import type { SelectOption } from '../../../components/Select'

const missionTypeOptions: SelectOption[] = [
  { label: 'Todos', value: '' },
  { label: 'Reciclaje', value: 'RECYCLING' },
  { label: 'Limpieza', value: 'CLEANUP' },
  { label: 'Educacion', value: 'EDUCATION' },
  { label: 'Comunidad', value: 'COMMUNITY' },
]

export type ModuleField = {
  allowOther?: boolean
  defaultValue?: string
  key: string
  label: string
  options?: SelectOption[]
  required?: boolean
  type?: 'choice' | 'date' | 'number' | 'select' | 'textarea' | 'text' | 'toggle'
}

export type ModuleAction = {
  action: string
  label: string
  tone?: 'danger' | 'success' | 'warning'
}

export type ModuleConfig = {
  canCreate?: boolean
  canUpdate?: boolean
  columns: string[]
  createEndpoint?: string
  createTitle?: string
  description: string
  endpoint: string
  fields?: ModuleField[]
  filters?: ModuleField[]
  listKeys: string[]
  title: string
  actions?: ModuleAction[]
}

export const moduleConfigs: Partial<Record<AdminView, ModuleConfig>> = {
  organizations: {
    title: 'Organizaciones',
    description: 'Administra aliados, patrocinadores, instituciones y organizaciones vinculadas a EcoPointsRD.',
    endpoint: '/api/admin/organizations',
    listKeys: ['organizations', 'data', 'results'],
    columns: ['name', 'organization_type', 'email', 'province', 'municipality', 'status', 'created_at'],
    canCreate: true,
    canUpdate: true,
    filters: [
      { key: 'search', label: 'Busqueda' },
      { key: 'type', label: 'Tipo' },
      { key: 'status', label: 'Estado', type: 'select', options: ['', 'ACTIVE', 'INACTIVE'] },
    ],
    fields: [
      { key: 'name', label: 'Nombre', required: true },
      { key: 'description', label: 'Descripcion', type: 'textarea' },
      { key: 'organization_type', label: 'Tipo' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Telefono' },
      { key: 'province', label: 'Provincia' },
      { key: 'municipality', label: 'Municipio' },
      { key: 'address', label: 'Direccion' },
      { key: 'logo_url', label: 'Logo URL' },
    ],
    actions: [
      { action: 'activate', label: 'Activar', tone: 'success' },
      { action: 'deactivate', label: 'Desactivar', tone: 'warning' },
    ],
  },
  missions: {
    title: 'Misiones',
    description: 'Crea, edita y controla el ciclo de vida de las misiones ecologicas.',
    endpoint: '/api/admin/missions',
    listKeys: ['missions', 'data', 'results'],
    columns: ['title', 'mission_type', 'points_reward', 'status', 'province', 'municipality', 'created_at'],
    canCreate: true,
    canUpdate: true,
    filters: [
      { key: 'status', label: 'Estado', type: 'select', options: ['', 'DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
      { key: 'type', label: 'Tipo', type: 'select', options: missionTypeOptions },
      { key: 'organization_id', label: 'Organizacion', type: 'select', options: [{ label: 'Todas', value: '' }] },
    ],
    fields: [
      { key: 'title', label: 'Titulo', required: true },
      { key: 'description', label: 'Descripcion', type: 'textarea' },
      {
        key: 'mission_type',
        label: 'Tipo',
        type: 'choice',
        allowOther: true,
        required: true,
        defaultValue: 'RECYCLING',
        options: [
          ...missionTypeOptions.filter((option) => typeof option !== 'string' && option.value),
          { label: 'Otro', value: 'Otro' },
        ],
      },
      {
        key: 'points_reward',
        label: 'Puntos',
        type: 'choice',
        allowOther: true,
        defaultValue: '25',
        options: ['10', '25', '50', '100', 'Otro'],
      },
      { key: 'start_date', label: 'Inicio', type: 'date' },
      { key: 'end_date', label: 'Fin', type: 'date' },
      { key: 'province', label: 'Provincia' },
      { key: 'municipality', label: 'Municipio' },
      { key: 'address', label: 'Direccion' },
      { key: 'latitude', label: 'Latitud', type: 'number' },
      { key: 'longitude', label: 'Longitud', type: 'number' },
      {
        key: 'max_participants',
        label: 'Max. participantes',
        type: 'choice',
        allowOther: true,
        defaultValue: '25',
        options: ['10', '25', '50', '100', 'Otro'],
      },
      { key: 'requires_qr_validation', label: 'Requiere QR', type: 'toggle', defaultValue: 'true' },
      { key: 'requires_approval', label: 'Requiere aprobacion', type: 'toggle', defaultValue: 'false' },
      { key: 'organization_id', label: 'Organizacion', type: 'select', options: [{ label: 'Sin organizacion', value: '' }] },
    ],
    actions: [
      { action: 'publish', label: 'Publicar', tone: 'success' },
      { action: 'start', label: 'Iniciar', tone: 'success' },
      { action: 'complete', label: 'Completar', tone: 'success' },
      { action: 'cancel', label: 'Cancelar', tone: 'danger' },
    ],
  },
  points: {
    title: 'Puntos',
    description: 'Consulta transacciones y registra ajustes manuales de puntos.',
    endpoint: '/api/admin/points/transactions',
    listKeys: ['transactions', 'data', 'results'],
    columns: ['user_id', 'points', 'transaction_type', 'description', 'created_at'],
    filters: [
      { key: 'user_id', label: 'Usuario ID' },
      { key: 'type', label: 'Tipo', type: 'select', options: ['', 'BONUS', 'PENALTY', 'EARNED', 'REDEEMED'] },
      { key: 'from', label: 'Desde', type: 'date' },
      { key: 'to', label: 'Hasta', type: 'date' },
    ],
    createTitle: 'Ajustar puntos',
    canCreate: true,
    createEndpoint: '/api/admin/points/adjust',
    fields: [
      { key: 'user_id', label: 'Usuario ID', required: true },
      { key: 'points', label: 'Puntos', type: 'number', required: true },
      { key: 'transaction_type', label: 'Tipo', type: 'select', required: true, options: ['BONUS', 'PENALTY'] },
      { key: 'description', label: 'Descripcion' },
    ],
  },
  rewards: {
    title: 'Recompensas',
    description: 'Gestiona recompensas, stock, patrocinadores y disponibilidad.',
    endpoint: '/api/admin/rewards',
    listKeys: ['rewards', 'data', 'results'],
    columns: ['title', 'points_required', 'stock', 'status', 'sponsor_id', 'created_at'],
    canCreate: true,
    canUpdate: true,
    fields: [
      { key: 'title', label: 'Titulo', required: true },
      { key: 'description', label: 'Descripcion', type: 'textarea' },
      { key: 'points_required', label: 'Puntos requeridos', type: 'number', required: true },
      { key: 'stock', label: 'Stock', type: 'number' },
      { key: 'image_url', label: 'Imagen URL' },
      { key: 'sponsor_id', label: 'Sponsor ID' },
    ],
    actions: [
      { action: 'activate', label: 'Activar', tone: 'success' },
      { action: 'deactivate', label: 'Desactivar', tone: 'warning' },
    ],
  },
  redemptions: {
    title: 'Canjes',
    description: 'Administra solicitudes de canje, aprobaciones, entregas y cancelaciones.',
    endpoint: '/api/admin/redemptions',
    listKeys: ['redemptions', 'data', 'results'],
    columns: ['reward_id', 'user_id', 'points_spent', 'status', 'created_at'],
    actions: [
      { action: 'approve', label: 'Aprobar', tone: 'success' },
      { action: 'deliver', label: 'Entregar', tone: 'success' },
      { action: 'cancel', label: 'Cancelar', tone: 'danger' },
    ],
  },
  recycling: {
    title: 'Reciclaje',
    description: 'Consulta logs de reciclaje y registra reciclajes manuales con puntos.',
    endpoint: '/api/admin/recycling/logs',
    listKeys: ['recyclingLogs', 'data', 'results'],
    columns: ['user_id', 'center_id', 'material_type', 'weight_kg', 'points_awarded', 'created_at'],
    canCreate: true,
    fields: [
      { key: 'user_id', label: 'Usuario ID', required: true },
      { key: 'center_id', label: 'Centro ID' },
      { key: 'material_type', label: 'Material', required: true },
      { key: 'weight_kg', label: 'Peso KG', type: 'number' },
      { key: 'points_awarded', label: 'Puntos otorgados', type: 'number' },
    ],
  },
  notifications: {
    title: 'Notificaciones',
    description: 'Envia notificaciones individuales o globales a los usuarios.',
    endpoint: '/api/admin/notifications/global',
    listKeys: ['data'],
    columns: [],
    createTitle: 'Enviar notificacion global',
    canCreate: true,
    fields: [
      { key: 'title', label: 'Titulo', required: true },
      { key: 'message', label: 'Mensaje', type: 'textarea', required: true },
      { key: 'type', label: 'Tipo' },
      { key: 'user_id', label: 'Usuario ID opcional' },
    ],
  },
}
