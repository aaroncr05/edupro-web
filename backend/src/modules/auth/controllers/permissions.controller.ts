import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { Permission, rolePermissions, roleDescriptions } from '@/common/constants/roles.permissions'
import { AuthenticatedRequest } from '@/modules/auth/guards/jwt.guard'

const prisma = new PrismaClient()

export class PermissionsController {
  /**
   * GET /api/auth/permissions
   * Obtener los permisos del usuario autenticado
   */
  async getMyPermissions(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'No autenticado'
        })
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: req.user.userId },
        include: { rol: true }
      })

      if (!usuario || !usuario.rol) {
        return res.status(404).json({
          success: false,
          error: 'Usuario o rol no encontrado'
        })
      }

      const permissions = rolePermissions[usuario.rol.nombre] || []

      res.status(200).json({
        success: true,
        data: {
          userId: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: {
            id: usuario.rol.id,
            nombre: usuario.rol.nombre,
            descripcion: roleDescriptions[usuario.rol.nombre] || ''
          },
          permissions,
          canCreate: {
            users: permissions.includes(Permission.CREATE_USERS),
            leads: permissions.includes(Permission.CREATE_LEADS),
            quotations: permissions.includes(Permission.CREATE_QUOTATIONS),
            cases: permissions.includes(Permission.CREATE_CASES)
          },
          canEdit: {
            users: permissions.includes(Permission.EDIT_USERS),
            leads: permissions.includes(Permission.EDIT_LEADS),
            quotations: permissions.includes(Permission.EDIT_QUOTATIONS),
            cases: permissions.includes(Permission.EDIT_CASES)
          },
          canDelete: {
            users: permissions.includes(Permission.DELETE_USERS),
            leads: permissions.includes(Permission.DELETE_LEADS),
            quotations: permissions.includes(Permission.DELETE_QUOTATIONS)
          },
          canView: {
            users: permissions.includes(Permission.VIEW_USERS),
            leads: permissions.includes(Permission.VIEW_LEADS),
            quotations: permissions.includes(Permission.VIEW_QUOTATIONS),
            cases: permissions.includes(Permission.VIEW_CASES),
            reports: permissions.includes(Permission.VIEW_REPORTS),
            analytics: permissions.includes(Permission.VIEW_ANALYTICS),
            activityLog: permissions.includes(Permission.VIEW_ACTIVITY_LOG)
          },
          canExport: {
            leads: permissions.includes(Permission.EXPORT_LEADS),
            quotations: permissions.includes(Permission.EXPORT_QUOTATIONS),
            reports: permissions.includes(Permission.EXPORT_REPORTS)
          }
        }
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener permisos'
      })
    }
  }
}
