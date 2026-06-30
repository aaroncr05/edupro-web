import { Router } from 'express'
import { formsController } from './forms.controller'
import { jwtGuard } from '../auth/guards/jwt.guard'
import { requireRole } from '@/common/middleware/roles.middleware'
import { formSubmitLimiter } from '@/common/middleware/rate-limiter'

const router = Router()

/**
 * Rutas públicas (sin autenticación)
 */

/**
 * GET /forms/public/active
 * Obtener formularios activos
 */
router.get('/public/active', (req, res, next) => formsController.getActiveForms(req, res, next))

/**
 * POST /forms/submit
 * Enviar respuesta de formulario
 */
router.post('/submit', formSubmitLimiter, (req, res, next) => formsController.submitFormResponse(req, res, next))

/**
 * Rutas protegidas (requieren autenticación y rol administrador)
 */

/**
 * POST /forms
 * Crear nuevo formulario
 */
router.post('/', jwtGuard, requireRole('administrador'), (req, res, next) =>
  formsController.createForm(req, res, next)
)

/**
 * GET /forms
 * Obtener todos los formularios
 */
router.get('/', jwtGuard, requireRole('administrador'), (req, res, next) =>
  formsController.getAllForms(req, res, next)
)

/**
 * GET /forms/:id
 * Obtener formulario por ID
 */
router.get('/:id', jwtGuard, requireRole('administrador'), (req, res, next) =>
  formsController.getFormById(req, res, next)
)

/**
 * PATCH /forms/:id
 * Actualizar formulario
 */
router.patch('/:id', jwtGuard, requireRole('administrador'), (req, res, next) =>
  formsController.updateForm(req, res, next)
)

/**
 * DELETE /forms/:id
 * Eliminar formulario
 */
router.delete('/:id', jwtGuard, requireRole('administrador'), (req, res, next) =>
  formsController.deleteForm(req, res, next)
)

/**
 * GET /forms/:id/responses
 * Obtener respuestas de un formulario
 */
router.get('/:id/responses', jwtGuard, requireRole('administrador'), (req, res, next) =>
  formsController.getFormResponses(req, res, next)
)

export default router
