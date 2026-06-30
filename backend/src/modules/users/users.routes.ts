import { Router } from 'express'
import { usersController } from './users.controller'
import { jwtGuard } from '../auth/guards/jwt.guard'
import { requirePermission } from '@/common/middleware/roles.middleware'
import { Permission } from '@/common/constants/roles.permissions'

const router = Router()

router.get('/', jwtGuard, requirePermission(Permission.VIEW_USERS), (req, res, next) =>
  usersController.getAllUsers(req, res, next)
)

router.post('/', jwtGuard, requirePermission(Permission.CREATE_USERS), (req, res, next) =>
  usersController.createUser(req, res, next)
)

// Ruta estática /role/:roleId debe ir ANTES de /:id para evitar conflicto de rutas
router.get('/role/:roleId', jwtGuard, requirePermission(Permission.VIEW_USERS), (req, res, next) =>
  usersController.getUsersByRole(req, res, next)
)

router.get('/:id', jwtGuard, requirePermission(Permission.VIEW_USERS), (req, res, next) =>
  usersController.getUserById(req, res, next)
)

router.put('/:id', jwtGuard, requirePermission(Permission.EDIT_USERS), (req, res, next) =>
  usersController.updateUser(req, res, next)
)

// change-password: el usuario puede cambiar su propia contraseña (sin permiso especial)
router.patch('/:id/change-password', jwtGuard, (req, res, next) =>
  usersController.changePassword(req, res, next)
)

router.patch('/:id/deactivate', jwtGuard, requirePermission(Permission.DEACTIVATE_USERS), (req, res, next) =>
  usersController.deactivateUser(req, res, next)
)

router.patch('/:id/activate', jwtGuard, requirePermission(Permission.ACTIVATE_USERS), (req, res, next) =>
  usersController.activateUser(req, res, next)
)

router.delete('/:id', jwtGuard, requirePermission(Permission.DELETE_USERS), (req, res, next) =>
  usersController.deleteUser(req, res, next)
)

export default router
