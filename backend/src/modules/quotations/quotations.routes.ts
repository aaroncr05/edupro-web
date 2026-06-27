import { Router } from 'express'
import { quotationsController } from './quotations.controller'
import { jwtGuard } from '../auth/guards/jwt.guard'

const router = Router()

/**
 * GET /quotations
 * Obtener todas las cotizaciones (requiere autenticación)
 */
router.get('/', jwtGuard, (req, res, next) => quotationsController.getAllQuotations(req, res, next))

/**
 * POST /quotations
 * Crear nueva cotización (requiere autenticación)
 */
router.post('/', jwtGuard, (req, res, next) => quotationsController.createQuotation(req, res, next))

/**
 * GET /quotations/status/:status
 * Obtener cotizaciones por estado (requiere autenticación)
 */
router.get('/status/:status', jwtGuard, (req, res, next) =>
  quotationsController.getQuotationsByStatus(req, res, next)
)

/**
 * GET /quotations/by-lead/:leadId
 * Obtener cotizaciones de un lead (requiere autenticación)
 */
router.get('/by-lead/:leadId', jwtGuard, (req, res, next) =>
  quotationsController.getQuotationsByLead(req, res, next)
)

/**
 * GET /quotations/:id
 * Obtener cotización por ID (requiere autenticación)
 */
router.get('/:id', jwtGuard, (req, res, next) =>
  quotationsController.getQuotationById(req, res, next)
)

/**
 * PUT /quotations/:id
 * Actualizar cotización (requiere autenticación)
 */
router.put('/:id', jwtGuard, (req, res, next) =>
  quotationsController.updateQuotation(req, res, next)
)

/**
 * PATCH /quotations/:id/change-status
 * Cambiar estado de la cotización (requiere autenticación)
 */
router.patch('/:id/change-status', jwtGuard, (req, res, next) =>
  quotationsController.changeQuotationStatus(req, res, next)
)

/**
 * POST /quotations/:id/send-email
 * Enviar cotización por correo con PDF adjunto
 */
router.post('/:id/send-email', jwtGuard, (req, res, next) =>
  quotationsController.sendQuotationByEmail(req, res, next)
)

/**
 * POST /quotations/:id/items
 * Agregar item a la cotización (requiere autenticación)
 */
router.post('/:id/items', jwtGuard, (req, res, next) =>
  quotationsController.addQuotationItem(req, res, next)
)

/**
 * DELETE /quotations/:quotationId/items/:itemId
 * Eliminar item de la cotización (requiere autenticación)
 */
router.delete('/:quotationId/items/:itemId', jwtGuard, (req, res, next) =>
  quotationsController.removeQuotationItem(req, res, next)
)

/**
 * DELETE /quotations/:id
 * Eliminar cotización (requiere autenticación)
 */
router.delete('/:id', jwtGuard, (req, res, next) =>
  quotationsController.deleteQuotation(req, res, next)
)

export default router
