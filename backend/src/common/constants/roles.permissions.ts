/**
 * Definición de permisos por rol
 * Cada rol puede realizar acciones específicas en el sistema
 */

export enum Permission {
  // Usuarios
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  ACTIVATE_USERS = 'activate_users',
  DEACTIVATE_USERS = 'deactivate_users',

  // Leads/Prospectos
  VIEW_LEADS = 'view_leads',
  CREATE_LEADS = 'create_leads',
  EDIT_LEADS = 'edit_leads',
  DELETE_LEADS = 'delete_leads',
  ASSIGN_LEADS = 'assign_leads',
  EXPORT_LEADS = 'export_leads',

  // Cotizaciones
  VIEW_QUOTATIONS = 'view_quotations',
  CREATE_QUOTATIONS = 'create_quotations',
  EDIT_QUOTATIONS = 'edit_quotations',
  DELETE_QUOTATIONS = 'delete_quotations',
  SEND_QUOTATIONS = 'send_quotations',
  EXPORT_QUOTATIONS = 'export_quotations',

  // Casos de Soporte
  VIEW_CASES = 'view_cases',
  CREATE_CASES = 'create_cases',
  EDIT_CASES = 'edit_cases',
  CLOSE_CASES = 'close_cases',
  ASSIGN_CASES = 'assign_cases',

  // Reportes
  VIEW_REPORTS = 'view_reports',
  EXPORT_REPORTS = 'export_reports',
  VIEW_ANALYTICS = 'view_analytics',

  // Configuración
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_ACTIVITY_LOG = 'view_activity_log',
}

export const rolePermissions: Record<string, Permission[]> = {
  // ADMINISTRADOR: Acceso total al sistema
  administrador: [
    // Usuarios
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.ACTIVATE_USERS,
    Permission.DEACTIVATE_USERS,

    // Leads
    Permission.VIEW_LEADS,
    Permission.CREATE_LEADS,
    Permission.EDIT_LEADS,
    Permission.DELETE_LEADS,
    Permission.ASSIGN_LEADS,
    Permission.EXPORT_LEADS,

    // Cotizaciones
    Permission.VIEW_QUOTATIONS,
    Permission.CREATE_QUOTATIONS,
    Permission.EDIT_QUOTATIONS,
    Permission.DELETE_QUOTATIONS,
    Permission.SEND_QUOTATIONS,
    Permission.EXPORT_QUOTATIONS,

    // Casos
    Permission.VIEW_CASES,
    Permission.CREATE_CASES,
    Permission.EDIT_CASES,
    Permission.CLOSE_CASES,
    Permission.ASSIGN_CASES,

    // Reportes
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_ANALYTICS,

    // Configuración
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_ACTIVITY_LOG,
  ],

  // ASESOR DE VENTAS: Gestiona leads y cotizaciones
  asesor_ventas: [
    // Usuarios (necesario para ver lista de asesores al asignar leads)
    Permission.VIEW_USERS,

    // Leads
    Permission.VIEW_LEADS,
    Permission.CREATE_LEADS,
    Permission.EDIT_LEADS,
    Permission.ASSIGN_LEADS,
    Permission.EXPORT_LEADS,

    // Cotizaciones
    Permission.VIEW_QUOTATIONS,
    Permission.CREATE_QUOTATIONS,
    Permission.EDIT_QUOTATIONS,
    Permission.SEND_QUOTATIONS,
    Permission.EXPORT_QUOTATIONS,

    // Casos de post-venta (solo lectura para ver estado de sus clientes)
    Permission.VIEW_CASES,

    // Reportes (solo lectura)
    Permission.VIEW_REPORTS,
    Permission.VIEW_ANALYTICS,

    // Ver registro de actividades
    Permission.VIEW_ACTIVITY_LOG,
  ],

  // ATENCIÓN AL CLIENTE / SOPORTE: Gestiona casos de soporte
  atencion_cliente: [
    // Casos
    Permission.VIEW_CASES,
    Permission.CREATE_CASES,
    Permission.EDIT_CASES,
    Permission.CLOSE_CASES,
    Permission.ASSIGN_CASES,

    // Leads (solo lectura)
    Permission.VIEW_LEADS,

    // Reportes (solo lectura)
    Permission.VIEW_REPORTS,
    Permission.VIEW_ACTIVITY_LOG,
  ],

  // GERENTE COMERCIAL: Supervisa ventas y genera reportes
  gerente_comercial: [
    // Usuarios (necesario para ver asesores en leads)
    Permission.VIEW_USERS,

    // Leads
    Permission.VIEW_LEADS,
    Permission.EDIT_LEADS,
    Permission.ASSIGN_LEADS,
    Permission.EXPORT_LEADS,

    // Cotizaciones
    Permission.VIEW_QUOTATIONS,
    Permission.EDIT_QUOTATIONS,
    Permission.SEND_QUOTATIONS,
    Permission.EXPORT_QUOTATIONS,

    // Casos
    Permission.VIEW_CASES,
    Permission.ASSIGN_CASES,

    // Reportes
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_ANALYTICS,

    // Ver actividades
    Permission.VIEW_ACTIVITY_LOG,
  ],

  // CLIENTE: Solo puede ver su propia información
  cliente: [
    // Cotizaciones de sí mismo
    Permission.VIEW_QUOTATIONS,

    // Casos de soporte propios
    Permission.VIEW_CASES,
    Permission.CREATE_CASES,
  ],
}

/**
 * Descripción de cada rol para mostrar en la UI
 */
export const roleDescriptions: Record<string, string> = {
  administrador: 'Acceso total al sistema. Gestiona usuarios, leads, cotizaciones y reportes.',
  asesor_ventas: 'Gestiona leads y cotizaciones. Puede crear y enviar cotizaciones.',
  atencion_cliente: 'Soporte técnico. Gestiona casos de soporte y atención al cliente.',
  gerente_comercial: 'Supervisión de ventas. Acceso a reportes y analytics de ventas.',
  cliente: 'Cliente externo. Solo visualiza cotizaciones y casos de soporte propios.',
}
