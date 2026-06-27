/**
 * Definición de permisos por rol (Frontend)
 * Espejo del backend para UI consistency
 */

export const ROLE_PERMISSIONS = {
  administrador: {
    name: 'Administrador',
    color: '#FF7101',
    description: 'Acceso total al sistema',
    permissions: [
      'view_users',
      'create_users',
      'edit_users',
      'delete_users',
      'activate_users',
      'deactivate_users',
      'view_leads',
      'create_leads',
      'edit_leads',
      'delete_leads',
      'assign_leads',
      'export_leads',
      'view_quotations',
      'create_quotations',
      'edit_quotations',
      'delete_quotations',
      'send_quotations',
      'export_quotations',
      'view_cases',
      'create_cases',
      'edit_cases',
      'close_cases',
      'assign_cases',
      'view_reports',
      'export_reports',
      'view_analytics',
      'manage_settings',
      'view_activity_log'
    ]
  },
  asesor_ventas: {
    name: 'Asesor de Ventas',
    color: '#0740E4',
    description: 'Gestiona leads y cotizaciones',
    permissions: [
      'view_leads',
      'create_leads',
      'edit_leads',
      'assign_leads',
      'export_leads',
      'view_quotations',
      'create_quotations',
      'edit_quotations',
      'send_quotations',
      'export_quotations',
      'view_reports',
      'view_analytics',
      'view_activity_log'
    ]
  },
  atencion_cliente: {
    name: 'Soporte Técnico',
    color: '#34A853',
    description: 'Gestiona casos de soporte',
    permissions: [
      'view_cases',
      'create_cases',
      'edit_cases',
      'close_cases',
      'assign_cases',
      'view_leads',
      'view_reports',
      'view_activity_log'
    ]
  },
  gerente_comercial: {
    name: 'Gerente Comercial',
    color: '#9333EA',
    description: 'Supervisa ventas y reportes',
    permissions: [
      'view_leads',
      'edit_leads',
      'assign_leads',
      'export_leads',
      'view_quotations',
      'edit_quotations',
      'send_quotations',
      'export_quotations',
      'view_cases',
      'assign_cases',
      'view_reports',
      'export_reports',
      'view_analytics',
      'view_activity_log'
    ]
  },
  cliente: {
    name: 'Cliente',
    color: '#808080',
    description: 'Cliente externo',
    permissions: [
      'view_quotations',
      'view_cases',
      'create_cases'
    ]
  }
}

export const MODULE_ACCESS = {
  administrador: {
    dashboard: true,
    leads: true,
    quotations: true,
    cases: true,
    users: true,
    reports: true,
    settings: true
  },
  asesor_ventas: {
    dashboard: true,
    leads: true,
    quotations: true,
    cases: false,
    users: false,
    reports: true,
    settings: false
  },
  atencion_cliente: {
    dashboard: true,
    leads: false,
    quotations: false,
    cases: true,
    users: false,
    reports: true,
    settings: false
  },
  gerente_comercial: {
    dashboard: true,
    leads: true,
    quotations: true,
    cases: true,
    users: false,
    reports: true,
    settings: false
  },
  cliente: {
    dashboard: false,
    leads: false,
    quotations: true,
    cases: true,
    users: false,
    reports: false,
    settings: false
  }
}

/**
 * Acciones específicas permitidas por rol
 */
export const ROLE_ACTIONS = {
  administrador: {
    canDeleteUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteLeads: true,
    canDeleteQuotations: false,
    canExportData: true,
    canViewAnalytics: true,
    canManageRoles: true
  },
  asesor_ventas: {
    canDeleteUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteLeads: false,
    canDeleteQuotations: false,
    canExportData: true,
    canViewAnalytics: true,
    canManageRoles: false
  },
  atencion_cliente: {
    canDeleteUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteLeads: false,
    canDeleteQuotations: false,
    canExportData: false,
    canViewAnalytics: false,
    canManageRoles: false
  },
  gerente_comercial: {
    canDeleteUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteLeads: false,
    canDeleteQuotations: false,
    canExportData: true,
    canViewAnalytics: true,
    canManageRoles: false
  },
  cliente: {
    canDeleteUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteLeads: false,
    canDeleteQuotations: false,
    canExportData: false,
    canViewAnalytics: false,
    canManageRoles: false
  }
}

/**
 * Verificar si un rol tiene permiso para una acción
 */
export const hasPermission = (role: string, permission: string): boolean => {
  const rolePerms = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
  return rolePerms?.permissions.includes(permission) ?? false
}

/**
 * Verificar si un rol puede acceder a un módulo
 */
export const canAccessModule = (role: string, module: string): boolean => {
  const access = MODULE_ACCESS[role as keyof typeof MODULE_ACCESS]
  return access?.[module as keyof typeof access] ?? false
}

/**
 * Obtener nombre de rol formateado
 */
export const getRoleName = (role: string): string => {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]?.name || role
}

/**
 * Obtener color de rol
 */
export const getRoleColor = (role: string): string => {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]?.color || '#666'
}
