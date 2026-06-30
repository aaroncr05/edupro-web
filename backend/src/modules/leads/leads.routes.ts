import { Router } from 'express'
import { leadsController } from './leads.controller'
import { jwtGuard } from '../auth/guards/jwt.guard'
import { requirePermission } from '@/common/middleware/roles.middleware'
import { Permission } from '@/common/constants/roles.permissions'
import { leadPublicLimiter } from '@/common/middleware/rate-limiter'

const router = Router()

router.get('/', jwtGuard, requirePermission(Permission.VIEW_LEADS), (req, res, next) =>
  leadsController.getAllLeads(req, res, next)
)

router.post('/', jwtGuard, requirePermission(Permission.CREATE_LEADS), (req, res, next) =>
  leadsController.createLead(req, res, next)
)

// Ruta pública para formularios del sitio web — con rate limit y sin enumerar emails
router.post('/public', leadPublicLimiter, (req, res, next) =>
  leadsController.createLeadPublic(req, res, next)
)

router.get('/status/:status', jwtGuard, requirePermission(Permission.VIEW_LEADS), (req, res, next) =>
  leadsController.getLeadsByStatus(req, res, next)
)

// Ruta estática antes de /:id para evitar conflicto de rutas
router.get('/advisor/:advisorId', jwtGuard, requirePermission(Permission.VIEW_LEADS), (req, res, next) =>
  leadsController.getLeadsByAdvisor(req, res, next)
)

router.get('/:id/followups', jwtGuard, requirePermission(Permission.VIEW_LEADS), (req, res, next) =>
  leadsController.getLeadFollowups(req, res, next)
)

router.post('/:id/followups', jwtGuard, requirePermission(Permission.EDIT_LEADS), (req, res, next) =>
  leadsController.createLeadFollowup(req, res, next)
)

router.get('/:id', jwtGuard, requirePermission(Permission.VIEW_LEADS), (req, res, next) =>
  leadsController.getLeadById(req, res, next)
)

router.put('/:id', jwtGuard, requirePermission(Permission.EDIT_LEADS), (req, res, next) =>
  leadsController.updateLead(req, res, next)
)

router.patch('/:id/change-status', jwtGuard, requirePermission(Permission.EDIT_LEADS), (req, res, next) =>
  leadsController.changeLeadStatus(req, res, next)
)

router.patch('/:id/assign', jwtGuard, requirePermission(Permission.ASSIGN_LEADS), (req, res, next) =>
  leadsController.assignLeadToAdvisor(req, res, next)
)

router.delete('/:id', jwtGuard, requirePermission(Permission.DELETE_LEADS), (req, res, next) =>
  leadsController.deleteLead(req, res, next)
)

export default router
