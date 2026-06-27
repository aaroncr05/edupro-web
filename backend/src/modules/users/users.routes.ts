import { Router } from 'express'
import { usersController } from './users.controller'
import { jwtGuard } from '../auth/guards/jwt.guard'

const router = Router()

/**
 * GET /users
 * Obtener todos los usuarios (requiere autenticación)
 */
router.get('/', jwtGuard, (req, res, next) => usersController.getAllUsers(req, res, next))

/**
 * POST /users
 * Crear nuevo usuario (requiere autenticación)
 */
router.post('/', jwtGuard, (req, res, next) => usersController.createUser(req, res, next))

/**
 * GET /users/:id
 * Obtener usuario por ID (requiere autenticación)
 */
router.get('/:id', jwtGuard, (req, res, next) => usersController.getUserById(req, res, next))

/**
 * PUT /users/:id
 * Actualizar usuario (requiere autenticación)
 */
router.put('/:id', jwtGuard, (req, res, next) => usersController.updateUser(req, res, next))

/**
 * PATCH /users/:id/change-password
 * Cambiar contraseña (requiere autenticación)
 */
router.patch('/:id/change-password', jwtGuard, (req, res, next) =>
  usersController.changePassword(req, res, next)
)

/**
 * PATCH /users/:id/deactivate
 * Desactivar usuario (requiere autenticación)
 */
router.patch('/:id/deactivate', jwtGuard, (req, res, next) =>
  usersController.deactivateUser(req, res, next)
)

/**
 * PATCH /users/:id/activate
 * Activar usuario (requiere autenticación)
 */
router.patch('/:id/activate', jwtGuard, (req, res, next) =>
  usersController.activateUser(req, res, next)
)

/**
 * DELETE /users/:id
 * Eliminar usuario (requiere autenticación)
 */
router.delete('/:id', jwtGuard, (req, res, next) => usersController.deleteUser(req, res, next))

/**
 * GET /users/role/:roleId
 * Obtener usuarios por rol (requiere autenticación)
 */
router.get('/role/:roleId', jwtGuard, (req, res, next) =>
  usersController.getUsersByRole(req, res, next)
)

export default router
