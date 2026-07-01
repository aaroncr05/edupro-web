import { Router } from 'express'
import { CMSController } from './cms.controller'
import { jwtGuard } from '../auth/guards/jwt.guard'
import { requireRole } from '@/common/middleware/roles.middleware'

const router = Router()
const cmsController = new CMSController()

// Courses - GETs públicos (sirven el sitio web), escrituras requieren admin
router.get('/courses', (req, res) => cmsController.getCourses(req, res))
router.get('/courses/slug/:slug', (req, res) => cmsController.getCourseBySlug(req, res))
router.post('/courses', jwtGuard, requireRole('administrador'), (req, res) => cmsController.createCourse(req, res))
router.put('/courses/:id', jwtGuard, requireRole('administrador'), (req, res) => cmsController.updateCourse(req, res))

// Services - GETs públicos, escrituras requieren admin
router.get('/services', (req, res) => cmsController.getServices(req, res))
router.get('/services/slug/:slug', (req, res) => cmsController.getServiceBySlug(req, res))
router.post('/services', jwtGuard, requireRole('administrador'), (req, res) => cmsController.createService(req, res))
router.put('/services/:id', jwtGuard, requireRole('administrador'), (req, res) => cmsController.updateService(req, res))

// Settings - requiere auth para evitar exposición de config interna, escritura requiere admin
router.get('/settings', jwtGuard, (req, res) => cmsController.getSettings(req, res))
router.post('/settings/batch', jwtGuard, requireRole('administrador'), (req, res) => cmsController.updateSettingsBatch(req, res))

export default router
