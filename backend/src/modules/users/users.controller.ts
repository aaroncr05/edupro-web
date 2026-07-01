import { Request, Response, NextFunction } from 'express'
import { userService } from './users.service'
import { CreateUserDTOSchema } from './dto/create-user.dto'
import { UpdateUserDTOSchema } from './dto/update-user.dto'

export class UsersController {
  /**
   * GET /users
   * Obtener todos los usuarios con paginación
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100)

      const result = await userService.getAllUsers(page, limit)

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages
        }
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener usuarios'
      })
    }
  }

  /**
   * GET /users/:id
   * Obtener usuario por ID
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id)

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario inválido'
        })
      }

      const user = await userService.getUserById(userId)

      res.status(200).json({
        success: true,
        data: user
      })
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'Usuario no encontrado'
      })
    }
  }

  /**
   * POST /users
   * Crear nuevo usuario (solo admin)
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateUserDTOSchema.parse(req.body)

      const user = await userService.createUser(validatedData)

      res.status(201).json({
        success: true,
        data: user,
        message: 'Usuario creado exitosamente'
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(400).json({
        success: false,
        error: error.message || 'Error al crear usuario'
      })
    }
  }

  /**
   * PUT /users/:id
   * Actualizar usuario
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id)

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario inválido'
        })
      }

      const validatedData = UpdateUserDTOSchema.parse(req.body)

      const user = await userService.updateUser(userId, validatedData)

      res.status(200).json({
        success: true,
        data: user,
        message: 'Usuario actualizado exitosamente'
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al actualizar usuario'
      })
    }
  }

  /**
   * PATCH /users/:id/change-password
   * Cambiar contraseña del usuario
   */
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Token no válido'
        })
      }

      // Validar que el :id de la URL coincide con el usuario del JWT
      const paramId = parseInt(req.params.id)
      if (isNaN(paramId) || paramId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'No autorizado'
        })
      }

      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'currentPassword y newPassword son requeridos'
        })
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'La nueva contraseña debe tener al menos 6 caracteres'
        })
      }

      const result = await userService.changePassword(userId, currentPassword, newPassword)

      res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Error al cambiar contraseña'
      })
    }
  }

  /**
   * PATCH /users/:id/deactivate
   * Desactivar usuario
   */
  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id)

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario inválido'
        })
      }

      const result = await userService.deactivateUser(userId)

      res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al desactivar usuario'
      })
    }
  }

  /**
   * PATCH /users/:id/activate
   * Activar usuario
   */
  async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id)

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario inválido'
        })
      }

      const result = await userService.activateUser(userId)

      res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al activar usuario'
      })
    }
  }

  /**
   * DELETE /users/:id
   * Eliminar usuario
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id)

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario inválido'
        })
      }

      const result = await userService.deleteUser(userId)

      res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al eliminar usuario'
      })
    }
  }

  /**
   * GET /users/role/:roleId
   * Obtener usuarios por rol
   */
  async getUsersByRole(req: Request, res: Response, next: NextFunction) {
    try {
      const roleId = parseInt(req.params.roleId)

      if (isNaN(roleId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de rol inválido'
        })
      }

      const users = await userService.getUsersByRole(roleId)

      res.status(200).json({
        success: true,
        data: users
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener usuarios'
      })
    }
  }
}

export const usersController = new UsersController()
