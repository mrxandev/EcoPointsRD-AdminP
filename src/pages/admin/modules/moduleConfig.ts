import type { AdminView } from '../types'
import type { SelectOption } from '../../../components/Select'

const missionTypeOptions: SelectOption[] = [
  { label: 'Todos', value: '' },
  { label: 'Reciclaje', value: 'RECYCLING' },
  { label: 'Limpieza', value: 'CLEANUP' },
  { label: 'Educacion', value: 'EDUCATION' },
  { label: 'Comunidad', value: 'COMMUNITY' },
]

const organizationTypeOptions: SelectOption[] = [
  { label: 'Supermercado', value: 'Supermercado' },
  { label: 'Super', value: 'Super' },
  { label: 'ONG', value: 'ONG' },
  { label: 'Institución Gubernamental', value: 'Institución Gubernamental' },
  { label: 'Empresa Privada', value: 'Empresa Privada' },
  { label: 'Centro Educativo', value: 'Centro Educativo' },
  { label: 'Centro de Reciclaje', value: 'Centro de Reciclaje' },
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
  mutationEndpoint?: string
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
      { key: 'type', label: 'Tipo', type: 'select', options: [{ label: 'Todos', value: '' }, ...organizationTypeOptions] },
      { key: 'status', label: 'Estado', type: 'select', options: ['', 'ACTIVE', 'INACTIVE'] },
    ],
    fields: [
      { key: 'name', label: 'Nombre', required: true },
      { key: 'description', label: 'Descripcion', type: 'textarea' },
      {
        key: 'organization_type',
        label: 'Tipo',
        type: 'select',
        options: [{ label: 'Seleccionar tipo...', value: '' }, ...organizationTypeOptions],
      },
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
  recyclingCenters: {
    title: 'Centros de reciclaje',
    description: 'Administra centros disponibles, ubicacion, contacto y estado operativo.',
    endpoint: '/api/admin/recycling/centers',
    listKeys: ['centers', 'data', 'results'],
    columns: ['name', 'province', 'municipality', 'address', 'phone', 'status', 'created_at'],
    canCreate: true,
    canUpdate: true,
    filters: [
      { key: 'search', label: 'Búsqueda' },
      { key: 'status', label: 'Estado', type: 'select', options: ['', 'ACTIVE', 'INACTIVE'] },
    ],
    fields: [
      { key: 'name', label: 'Nombre', required: true },
      { key: 'description', label: 'Descripcion', type: 'textarea' },
      { key: 'province', label: 'Provincia' },
      { key: 'municipality', label: 'Municipio' },
      { key: 'address', label: 'Direccion' },
      { key: 'latitude', label: 'Latitud', type: 'number' },
      { key: 'longitude', label: 'Longitud', type: 'number' },
      { key: 'phone', label: 'Telefono' },
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
      { key: 'search', label: 'Búsqueda' },
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
      { key: 'search', label: 'Búsqueda' },
      { key: 'type', label: 'Tipo', type: 'select', options: ['', 'BONUS', 'PENALTY', 'EARNED', 'REDEEMED'] },
      { key: 'from', label: 'Desde', type: 'date' },
      { key: 'to', label: 'Hasta', type: 'date' },
    ],
    createTitle: 'Ajustar puntos',
    canCreate: true,
    createEndpoint: '/api/admin/points/adjust',
    fields: [
      { key: 'user_id', label: 'Usuario', required: true },
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
    filters: [
      { key: 'search', label: 'Búsqueda' },
      { key: 'status', label: 'Estado', type: 'select', options: ['', 'ACTIVE', 'INACTIVE'] },
    ],
    fields: [
      { key: 'title', label: 'Titulo', required: true },
      { key: 'description', label: 'Descripcion', type: 'textarea' },
      { key: 'points_required', label: 'Puntos requeridos', type: 'number', required: true },
      { key: 'stock', label: 'Stock', type: 'number' },
      { key: 'image_url', label: 'Imagen URL' },
      { key: 'sponsor_id', label: 'Patrocinador' },
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
    filters: [
      { key: 'search', label: 'Búsqueda' },
      { key: 'status', label: 'Estado', type: 'select', options: ['', 'PENDING', 'APPROVED', 'DELIVERED', 'CANCELLED'] },
    ],
    actions: [
      { action: 'approve', label: 'Aprobar', tone: 'success' },
      { action: 'deliver', label: 'Entregar', tone: 'success' },
      { action: 'cancel', label: 'Cancelar', tone: 'danger' },
    ],
  },
  recycling: {
    title: 'Reciclaje',
    description: 'Consulta logs de reciclaje y registra reciclajes manuales con cálculo automático de puntos por peso (lbs).',
    endpoint: '/api/admin/recycling/logs',
    listKeys: ['recyclingLogs', 'data', 'results'],
    columns: ['user_id', 'material_type', 'weight_kg', 'points_awarded', 'created_at'],
    canCreate: true,
    filters: [
      { key: 'search', label: 'Búsqueda' },
      {
        key: 'material_type',
        label: 'Material',
        type: 'select',
        options: [
          { label: 'Todos', value: '' },
          { label: 'Latas de Aluminio', value: 'ALUMINUM' },
          { label: 'Vidrio', value: 'GLASS' },
          { label: 'Botellas PET', value: 'PET' },
          { label: 'Papel y Cartón', value: 'PAPER' },
          { label: 'Electrónicos', value: 'E_WASTE' },
          { label: 'Otros Materiales', value: 'OTHER' },
        ],
      },
    ],
    fields: [
      { key: 'user_id', label: 'Usuario', required: true },
      { key: 'center_id', label: 'Centro', type: 'select' },
      {
        key: 'material_type',
        label: 'Tipo de Material',
        type: 'select',
        required: true,
        options: [
          { label: 'Latas de Aluminio (40 pts/lb)', value: 'ALUMINUM' },
          { label: 'Vidrio (3 pts/lb)', value: 'GLASS' },
          { label: 'Botellas PET (10 pts/lb)', value: 'PET' },
          { label: 'Papel y Cartón (5 pts/lb)', value: 'PAPER' },
          { label: 'Electrónicos (50 pts/lb)', value: 'E_WASTE' },
          { label: 'Otros Materiales (10 pts/lb)', value: 'OTHER' },
        ],
      },
      { key: 'weight_lbs', label: 'Peso en Libras (lbs)', type: 'number', required: true },
      { key: 'points_awarded', label: 'Puntos a Otorgar', type: 'number', required: true },
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
      { key: 'user_id', label: 'Usuario opcional' },
    ],
  },
}
