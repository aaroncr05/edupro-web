import { Router } from 'express'
import { quotationsController } from './quotations.controller'
import { jwtGuard } from '../auth/guards/jwt.guard'
import { requirePermission } from '@/common/middleware/roles.middleware'
import { Permission } from '@/common/constants/roles.permissions'
import { quotationEmailLimiter } from '@/common/middleware/rate-limiter'

const router = Router()

router.get('/', jwtGuard, requirePermission(Permission.VIEW_QUOTATIONS), (req, res, next) =>
  quotationsController.getAllQuotations(req, res, next)
)

router.post('/', jwtGuard, requirePermission(Permission.CREATE_QUOTATIONS), (req, res, next) =>
  quotationsController.createQuotation(req, res, next)
)

router.get('/status/:status', jwtGuard, requirePermission(Permission.VIEW_QUOTATIONS), (req, res, next) =>
  quotationsController.getQuotationsByStatus(req, res, next)
)

router.get('/by-lead/:leadId', jwtGuard, requirePermission(Permission.VIEW_QUOTATIONS), (req, res, next) =>
  quotationsController.getQuotationsByLead(req, res, next)
)

router.get('/:id', jwtGuard, requirePermission(Permission.VIEW_QUOTATIONS), (req, res, next) =>
  quotationsController.getQuotationById(req, res, next)
)

router.put('/:id', jwtGuard, requirePermission(Permission.EDIT_QUOTATIONS), (req, res, next) =>
  quotationsController.updateQuotation(req, res, next)
)

router.patch('/:id/change-status', jwtGuard, requirePermission(Permission.EDIT_QUOTATIONS), (req, res, next) =>
  quotationsController.changeQuotationStatus(req, res, next)
)

// Rate limit para prevenir spam de emails de cotizaciones
router.post('/:id/send-email', jwtGuard, requirePermission(Permission.SEND_QUOTATIONS), quotationEmailLimiter, (req, res, next) =>
  quotationsController.sendQuotationByEmail(req, res, next)
)

router.post('/:id/items', jwtGuard, requirePermission(Permission.EDIT_QUOTATIONS), (req, res, next) =>
  quotationsController.addQuotationItem(req, res, next)
)

// quotationId se valida en el controller/service para prevenir IDOR
router.delete('/:quotationId/items/:itemId', jwtGuard, requirePermission(Permission.EDIT_QUOTATIONS), (req, res, next) =>
  quotationsController.removeQuotationItem(req, res, next)
)

router.delete('/:id', jwtGuard, requirePermission(Permission.DELETE_QUOTATIONS), (req, res, next) =>
  quotationsController.deleteQuotation(req, res, next)
)

export default router
