import { Request, Response, NextFunction } from 'express'
import { leadsService } from './leads.service'
import { CreateLeadDTOSchema } from './dto/create-lead.dto'
import { UpdateLeadDTOSchema } from './dto/update-lead.dto'
import { ChangeLeadStatusDTOSchema } from './dto/change-lead-status.dto'
import { CreateFollowupDTOSchema } from './dto/create-followup.dto'
import { LeadStatus } from '@prisma/client'

const normalizeLeadStatus = (status: string): LeadStatus => {
  const aliases: Record<string, LeadStatus> = {
    cotizacion_enviada: 'propuesta_enviada',
    aceptado: 'convertido',
    no_aceptado: 'rechazado'
  }

  return (aliases[status] || status) as LeadStatus
}

export class LeadsController {
  /**
   * GET /leads
   * Obtener todos los leads con filtros opcionales
   */
  async getAllLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100)
      const estado = req.query.estado as LeadStatus | undefined
      const probabilidad = req.query.probabilidad ? parseInt(req.query.probabilidad as string) : undefined
      const idAsesor = req.query.idAsesor ? parseInt(req.query.idAsesor as string) : undefined

      const result = await leadsService.getAllLeads(page, limit, {
        estado,
        probabilidad,
        idAsesor
      })

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages
        }
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener leads'
      })
    }
  }

  /**
   * GET /leads/:id
   * Obtener lead por ID
   */
  async getLeadById(req: Request, res: Response, next: NextFunction) {
    try {
      const leadId = parseInt(req.params.id)

      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de lead inválido'
        })
      }

      const lead = await leadsService.getLeadById(leadId)

      res.status(200).json({
        success: true,
        data: lead
      })
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'Lead no encontrado'
      })
    }
  }

  /**
   * POST /leads/public
   * Crear lead desde formulario público — no revela si el email ya existe (anti-enumeración)
   */
  async createLeadPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateLeadDTOSchema.parse(req.body)
      await leadsService.createLead(validatedData)
      res.status(201).json({ success: true, message: 'Solicitud recibida' })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: 'Validación fallida', details: error.errors })
      }
      // Si el email ya existe, responder igualmente con éxito para no revelar datos
      if (error.message?.includes('ya está registrado')) {
        return res.status(201).json({ success: true, message: 'Solicitud recibida' })
      }
      res.status(400).json({ success: false, error: 'Error al procesar solicitud' })
    }
  }

  /**
   * POST /leads
   * Crear nuevo lead
   */
  async createLead(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateLeadDTOSchema.parse(req.body)

      const lead = await leadsService.createLead(validatedData)

      res.status(201).json({
        success: true,
        data: lead,
        message: 'Lead creado exitosamente'
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(400).json({
        success: false,
        error: error.message || 'Error al crear lead'
      })
    }
  }

  /**
   * PUT /leads/:id
   * Actualizar lead
   */
  async updateLead(req: Request, res: Response, next: NextFunction) {
    try {
      const leadId = parseInt(req.params.id)

      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de lead inválido'
        })
      }

      const validatedData = UpdateLeadDTOSchema.parse(req.body)

      const lead = await leadsService.updateLead(leadId, validatedData)

      res.status(200).json({
        success: true,
        data: lead,
        message: 'Lead actualizado exitosamente'
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al actualizar lead'
      })
    }
  }

  /**
   * PATCH /leads/:id/change-status
   * Cambiar estado del lead
   */
  async changeLeadStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const leadId = parseInt(req.params.id)

      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de lead inválido'
        })
      }

      const validatedData = ChangeLeadStatusDTOSchema.parse(req.body)
      const requestedStatus = validatedData.estado || validatedData.estadoLead

      const lead = await leadsService.changeLeadStatus(
        leadId,
        normalizeLeadStatus(requestedStatus!),
        validatedData.observacion
      )

      res.status(200).json({
        success: true,
        data: lead,
        message: `Estado del lead cambiado a ${requestedStatus}`
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al cambiar estado'
      })
    }
  }

  /**
   * DELETE /leads/:id
   * Eliminar lead
   */
  async deleteLead(req: Request, res: Response, next: NextFunction) {
    try {
      const leadId = parseInt(req.params.id)

      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de lead inválido'
        })
      }

      const result = await leadsService.deleteLead(leadId)

      res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al eliminar lead'
      })
    }
  }

  /**
   * GET /leads/advisor/:advisorId
   * Obtener leads de un asesor
   */
  async getLeadsByAdvisor(req: Request, res: Response, next: NextFunction) {
    try {
      const advisorId = parseInt(req.params.advisorId)

      if (isNaN(advisorId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de asesor inválido'
        })
      }

      const leads = await leadsService.getLeadsByAdvisor(advisorId)

      res.status(200).json({
        success: true,
        data: leads,
        count: leads.length
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener leads'
      })
    }
  }

  /**
   * GET /leads/status/:status
   * Obtener leads por estado
   */
  async getLeadsByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.params.status as LeadStatus

      // Validar que el estado es válido
      const validStates = [
        'nuevo',
        'contactado',
        'interesado',
        'calificado',
        'propuesta_enviada',
        'cotizacion_enviada',
        'negociacion',
        'convertido',
        'aceptado',
        'rechazado',
        'perdido',
        'no_aceptado'
      ]

      if (!validStates.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Estado inválido. Estados válidos: ${validStates.join(', ')}`
        })
      }

      const leads = await leadsService.getLeadsByStatus(normalizeLeadStatus(status))

      res.status(200).json({
        success: true,
        data: leads,
        count: leads.length
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener leads'
      })
    }
  }

  /**
   * GET /leads/:id/followups
   * Obtener historial de seguimiento de un lead
   */
  async getLeadFollowups(req: Request, res: Response, next: NextFunction) {
    try {
      const leadId = parseInt(req.params.id)

      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de lead inválido'
        })
      }

      const followups = await leadsService.getLeadFollowups(leadId)

      // Renombra descripcion → descripción para que coincida con el tipo del frontend
      const mapped = followups.map((f: any) => {
        const { descripcion, ...rest } = f
        return { ...rest, 'descripción': descripcion }
      })

      res.status(200).json({
        success: true,
        data: mapped
      })
    } catch (error: any) {
      res.status(error.message.includes('no encontrado') ? 404 : 500).json({
        success: false,
        error: error.message || 'Error al obtener historial'
      })
    }
  }

  /**
   * POST /leads/:id/followups
   * Registrar seguimiento de un lead
   */
  async createLeadFollowup(req: Request, res: Response, next: NextFunction) {
    try {
      const leadId = parseInt(req.params.id)

      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de lead inválido'
        })
      }

      // Normaliza descripción (con tilde) → descripcion antes de validación Zod
      const body = { ...req.body, descripcion: req.body.descripcion ?? req.body['descripción'] }
      const validatedData = CreateFollowupDTOSchema.parse(body)
      const userId = (req as any).user?.userId
      const followup = await leadsService.createLeadFollowup(leadId, userId, validatedData)

      res.status(201).json({
        success: true,
        data: followup,
        message: 'Seguimiento registrado exitosamente'
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al registrar seguimiento'
      })
    }
  }

  /**
   * PATCH /leads/:id/assign
   * Asignar lead a asesor
   */
  async assignLeadToAdvisor(req: Request, res: Response, next: NextFunction) {
    try {
      const leadId = parseInt(req.params.id)
      const { advisorId } = req.body

      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de lead inválido'
        })
      }

      if (!advisorId || isNaN(advisorId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de asesor requerido y debe ser un número'
        })
      }

      const lead = await leadsService.assignLeadToAdvisor(leadId, advisorId)

      res.status(200).json({
        success: true,
        data: lead,
        message: 'Lead asignado exitosamente'
      })
    } catch (error: any) {
      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al asignar lead'
      })
    }
  }
}

export const leadsController = new LeadsController()
