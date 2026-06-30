import { Router } from 'express'
import { authController } from './auth.controller'
import { jwtGuard } from './guards/jwt.guard'
import { requirePermission } from '@/common/middleware/roles.middleware'
import { Permission } from '@/common/constants/roles.permissions'

const router = Router()

router.post('/login', (req, res, next) => authController.login(req, res, next))

router.post('/register', jwtGuard, requirePermission(Permission.CREATE_USERS), (req, res, next) => authController.register(req, res, next))

router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next))

router.post('/verify-code', (req, res, next) => authController.verifyCode(req, res, next))

router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next))

router.post('/refresh', jwtGuard, (req, res, next) => authController.refreshToken(req, res, next))

router.get('/me', jwtGuard, (req, res, next) => authController.getCurrentUser(req, res, next))

router.get('/csrf-token', (req, res, next) => authController.csrfToken(req, res, next))

router.post('/logout', (req, res, next) => authController.logout(req, res, next))

export default router