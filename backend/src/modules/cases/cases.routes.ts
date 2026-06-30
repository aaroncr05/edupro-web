import { Router } from 'express'
import { casesController } from './cases.controller'
import { jwtGuard } from '../auth/guards/jwt.guard'
import { requirePermission } from '@/common/middleware/roles.middleware'
import { requireRole } from '@/common/middleware/roles.middleware'
import { Permission } from '@/common/constants/roles.permissions'

const router = Router()

router.get('/', jwtGuard, requirePermission(Permission.VIEW_CASES), (req, res, next) =>
  casesController.getAllCases(req, res, next)
)

router.post('/', jwtGuard, requirePermission(Permission.CREATE_CASES), (req, res, next) =>
  casesController.createCase(req, res, next)
)

router.get('/status/:status', jwtGuard, requirePermission(Permission.VIEW_CASES), (req, res, next) =>
  casesController.getCasesByStatus(req, res, next)
)

router.get('/priority/:priority', jwtGuard, requirePermission(Permission.VIEW_CASES), (req, res, next) =>
  casesController.getCasesByPriority(req, res, next)
)

// Restringido a roles con VIEW_CASES para prevenir IDOR entre clientes
router.get('/client/:clientId', jwtGuard, requirePermission(Permission.VIEW_CASES), (req, res, next) =>
  casesController.getCasesByClient(req, res, next)
)

router.get('/responsible/:responsibleId', jwtGuard, requirePermission(Permission.ASSIGN_CASES), (req, res, next) =>
  casesController.getCasesByResponsible(req, res, next)
)

router.get('/:id', jwtGuard, requirePermission(Permission.VIEW_CASES), (req, res, next) =>
  casesController.getCaseById(req, res, next)
)

router.put('/:id', jwtGuard, requirePermission(Permission.EDIT_CASES), (req, res, next) =>
  casesController.updateCase(req, res, next)
)

router.patch('/:id/change-status', jwtGuard, requirePermission(Permission.CLOSE_CASES), (req, res, next) =>
  casesController.changeCaseStatus(req, res, next)
)

router.patch('/:id/assign', jwtGuard, requirePermission(Permission.ASSIGN_CASES), (req, res, next) =>
  casesController.assignCaseToResponsible(req, res, next)
)

// Eliminar caso es operación crítica — solo administrador
router.delete('/:id', jwtGuard, requireRole('administrador'), (req, res, next) =>
  casesController.deleteCase(req, res, next)
)

router.post('/:id/send-resolution-documentation', jwtGuard, requirePermission(Permission.CLOSE_CASES), (req, res, next) =>
  casesController.sendResolutionDocumentation(req, res, next)
)

export default router
