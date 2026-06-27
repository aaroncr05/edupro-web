import { Router } from 'express'
import { leadsController } from './leads.controller'
import { jwtGuard } from '../auth/guards/jwt.guard'

const router = Router()

router.get('/', jwtGuard, (req, res, next) => leadsController.getAllLeads(req, res, next))

router.post('/', jwtGuard, (req, res, next) => leadsController.createLead(req, res, next))

router.post('/public', (req, res, next) => leadsController.createLead(req, res, next))

router.get('/status/:status', jwtGuard, (req, res, next) =>
  leadsController.getLeadsByStatus(req, res, next)
)

router.get('/advisor/:advisorId', jwtGuard, (req, res, next) =>
  leadsController.getLeadsByAdvisor(req, res, next)
)

router.get('/:id/followups', jwtGuard, (req, res, next) =>
  leadsController.getLeadFollowups(req, res, next)
)

router.post('/:id/followups', jwtGuard, (req, res, next) =>
  leadsController.createLeadFollowup(req, res, next)
)

router.get('/:id', jwtGuard, (req, res, next) => leadsController.getLeadById(req, res, next))

router.put('/:id', jwtGuard, (req, res, next) => leadsController.updateLead(req, res, next))

router.patch('/:id/change-status', jwtGuard, (req, res, next) =>
  leadsController.changeLeadStatus(req, res, next)
)

router.patch('/:id/assign', jwtGuard, (req, res, next) =>
  leadsController.assignLeadToAdvisor(req, res, next)
)

router.delete('/:id', jwtGuard, (req, res, next) => leadsController.deleteLead(req, res, next))

export default router
