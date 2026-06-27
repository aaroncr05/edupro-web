import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { Permission, rolePermissions } from '@/common/constants/roles.permissions'
import { AuthenticatedRequest } from '@/modules/auth/guards/jwt.guard'

const prisma = new PrismaClient()

/**
 * Middleware para verificar que el usuario tiene un rol específico
 * Uso: app.post('/api/leads', requireRole('asesor_ventas'), createLeadHandler)
 */
export const requireRole = (requiredRoles: string | string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
        return res.status(403).json({
          success: false,
          error: 'Usuario sin rol asignado'
        })
      }

      const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

      if (!allowedRoles.includes(usuario.rol.nombre)) {
        return res.status(403).json({
          success: false,
          error: `Acceso denegado. Este módulo requiere uno de estos roles: ${allowedRoles.join(', ')}`
        })
      }

      // Adjuntar rol al request
      ;(req as any).userRole = usuario.rol.nombre

      next()
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al verificar rol'
      })
    }
  }
}

/**
 * Middleware para verificar permisos específicos
 * Uso: app.post('/api/users', requirePermission(Permission.CREATE_USERS), createUserHandler)
 */
export const requirePermission = (requiredPermissions: Permission | Permission[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
        return res.status(403).json({
          success: false,
          error: 'Usuario sin rol asignado'
        })
      }

      const permissions = rolePermissions[usuario.rol.nombre] || []
      const requiredPerms = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]

      const hasPermission = requiredPerms.some((perm) => permissions.includes(perm))

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: `No tienes permiso para realizar esta acción. Se requiere: ${requiredPerms.join(', ')}`
        })
      }

      // Adjuntar permisos al request
      ;(req as any).userPermissions = permissions

      next()
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al verificar permisos'
      })
    }
  }
}
