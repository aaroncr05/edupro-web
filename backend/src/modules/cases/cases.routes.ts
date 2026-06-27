import { Router } from 'express'
import { casesController } from './cases.controller'
import { jwtGuard } from '../auth/guards/jwt.guard'

const router = Router()

/**
 * GET /cases
 * Obtener todos los casos (requiere autenticación)
 */
router.get('/', jwtGuard, (req, res, next) => casesController.getAllCases(req, res, next))

/**
 * POST /cases
 * Crear nuevo caso (requiere autenticación)
 */
router.post('/', jwtGuard, (req, res, next) => casesController.createCase(req, res, next))

/**
 * GET /cases/status/:status
 * Obtener casos por estado (requiere autenticación)
 */
router.get('/status/:status', jwtGuard, (req, res, next) =>
  casesController.getCasesByStatus(req, res, next)
)

/**
 * GET /cases/priority/:priority
 * Obtener casos por prioridad (requiere autenticación)
 */
router.get('/priority/:priority', jwtGuard, (req, res, next) =>
  casesController.getCasesByPriority(req, res, next)
)

/**
 * GET /cases/client/:clientId
 * Obtener casos de un cliente (requiere autenticación)
 */
router.get('/client/:clientId', jwtGuard, (req, res, next) =>
  casesController.getCasesByClient(req, res, next)
)

/**
 * GET /cases/responsible/:responsibleId
 * Obtener casos de un responsable (requiere autenticación)
 */
router.get('/responsible/:responsibleId', jwtGuard, (req, res, next) =>
  casesController.getCasesByResponsible(req, res, next)
)

/**
 * GET /cases/:id
 * Obtener caso por ID (requiere autenticación)
 */
router.get('/:id', jwtGuard, (req, res, next) => casesController.getCaseById(req, res, next))

/**
 * PUT /cases/:id
 * Actualizar caso (requiere autenticación)
 */
router.put('/:id', jwtGuard, (req, res, next) => casesController.updateCase(req, res, next))

/**
 * PATCH /cases/:id/change-status
 * Cambiar estado del caso (requiere autenticación)
 */
router.patch('/:id/change-status', jwtGuard, (req, res, next) =>
  casesController.changeCaseStatus(req, res, next)
)

/**
 * PATCH /cases/:id/assign
 * Asignar caso a responsable (requiere autenticación)
 */
router.patch('/:id/assign', jwtGuard, (req, res, next) =>
  casesController.assignCaseToResponsible(req, res, next)
)

/**
 * DELETE /cases/:id
 * Eliminar caso (requiere autenticación)
 */
router.delete('/:id', jwtGuard, (req, res, next) => casesController.deleteCase(req, res, next))

/**
 * POST /cases/:id/send-resolution-documentation
 * Enviar documentacion de resolucion por correo
 */
router.post('/:id/send-resolution-documentation', jwtGuard, (req, res, next) =>
  casesController.sendResolutionDocumentation(req, res, next)
)

export default router
