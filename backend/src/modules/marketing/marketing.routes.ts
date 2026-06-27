import { Router } from 'express'
import { jwtGuard } from '@/modules/auth/guards/jwt.guard'
import { marketingController } from './marketing.controller'

const router = Router()

router.get('/audience', jwtGuard, (req, res, next) =>
  marketingController.getAudience(req, res, next)
)

router.post('/send-announcement', jwtGuard, (req, res, next) =>
  marketingController.sendAnnouncement(req, res, next)
)

export default router
