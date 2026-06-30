import { Router } from 'express'
import { jwtGuard } from '@/modules/auth/guards/jwt.guard'
import { requirePermission } from '@/common/middleware/roles.middleware'
import { Permission } from '@/common/constants/roles.permissions'
import { marketingController } from './marketing.controller'

const router = Router()

router.get('/audience', jwtGuard, requirePermission(Permission.VIEW_LEADS), (req, res, next) =>
  marketingController.getAudience(req, res, next)
)

router.post('/send-announcement', jwtGuard, requirePermission(Permission.MANAGE_SETTINGS), (req, res, next) =>
  marketingController.sendAnnouncement(req, res, next)
)

export default router
