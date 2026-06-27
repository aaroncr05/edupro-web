import { Router } from 'express'
import { CMSController } from './cms.controller'

const router = Router()
const cmsController = new CMSController()

// Courses
router.get('/courses', (req, res) => cmsController.getCourses(req, res))
router.get('/courses/slug/:slug', (req, res) => cmsController.getCourseBySlug(req, res))
router.post('/courses', (req, res) => cmsController.createCourse(req, res))
router.put('/courses/:id', (req, res) => cmsController.updateCourse(req, res))

// Services
router.get('/services', (req, res) => cmsController.getServices(req, res))
router.get('/services/slug/:slug', (req, res) => cmsController.getServiceBySlug(req, res))
router.post('/services', (req, res) => cmsController.createService(req, res))
router.put('/services/:id', (req, res) => cmsController.updateService(req, res))

// Settings
router.get('/settings', (req, res) => cmsController.getSettings(req, res))
router.post('/settings/batch', (req, res) => cmsController.updateSettingsBatch(req, res))

export default router
