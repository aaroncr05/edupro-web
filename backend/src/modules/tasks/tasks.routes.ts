import { Router } from 'express'
import { jwtGuard } from '@/modules/auth/guards/jwt.guard'
import { tasksController } from './tasks.controller'

const router = Router()

router.get('/mine', jwtGuard, (req, res, next) =>
  tasksController.getMine(req, res, next)
)

router.patch('/:id/complete', jwtGuard, (req, res, next) =>
  tasksController.completeMine(req, res, next)
)

export default router
