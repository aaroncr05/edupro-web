import { Router } from 'express'
import { jwtGuard } from '@/modules/auth/guards/jwt.guard'
import { notificationsController } from './notifications.controller'

const router = Router()

router.get('/', jwtGuard, (req, res, next) =>
  notificationsController.getMine(req, res, next)
)

router.patch('/:id/read', jwtGuard, (req, res, next) =>
  notificationsController.markAsRead(req, res, next)
)

export default router
