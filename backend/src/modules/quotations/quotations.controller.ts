import { Request, Response, NextFunction } from 'express'
import { quotationsService } from './quotations.service'
import { CreateQuotationDTOSchema } from './dto/create-quotation.dto'
import { UpdateQuotationDTOSchema } from './dto/update-quotation.dto'
import { ChangeQuotationStatusDTOSchema } from './dto/change-quotation-status.dto'
import { AddQuotationItemDTOSchema } from './dto/add-quotation-item.dto'
import { QuotationStatus } from '@prisma/client'

export class QuotationsController {
  /**
   * GET /quotations
   * Obtener todas las cotizaciones con filtros
   */
  async getAllQuotations(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const estado = req.query.estado as QuotationStatus | undefined
      const idLead = req.query.idLead ? parseInt(req.query.idLead as string) : undefined

      const result = await quotationsService.getAllQuotations(page, limit, {
        estado,
        idLead
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
        error: error.message || 'Error al obtener cotizaciones'
      })
    }
  }

  /**
   * GET /quotations/:id
   * Obtener cotización por ID
   */
  async getQuotationById(req: Request, res: Response, next: NextFunction) {
    try {
      const quotationId = parseInt(req.params.id)

      if (isNaN(quotationId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de cotización inválido'
        })
      }

      const quotation = await quotationsService.getQuotationById(quotationId)

      res.status(200).json({
        success: true,
        data: quotation
      })
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'Cotización no encontrada'
      })
    }
  }

  /**
   * POST /quotations
   * Crear nueva cotización
   */
  async createQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateQuotationDTOSchema.parse(req.body)

      const quotation = await quotationsService.createQuotation(validatedData)

      res.status(201).json({
        success: true,
        data: quotation,
        message: 'Cotización creada exitosamente'
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
        error: error.message || 'Error al crear cotización'
      })
    }
  }

  /**
   * PUT /quotations/:id
   * Actualizar cotización
   */
  async updateQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const quotationId = parseInt(req.params.id)

      if (isNaN(quotationId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de cotización inválido'
        })
      }

      const validatedData = UpdateQuotationDTOSchema.parse(req.body)

      const quotation = await quotationsService.updateQuotation(quotationId, validatedData)

      res.status(200).json({
        success: true,
        data: quotation,
        message: 'Cotización actualizada exitosamente'
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(error.message.includes('no encontrada') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al actualizar cotización'
      })
    }
  }

  /**
   * PATCH /quotations/:id/change-status
   * Cambiar estado de la cotización
   */
  async changeQuotationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const quotationId = parseInt(req.params.id)

      if (isNaN(quotationId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de cotización inválido'
        })
      }

      const validatedData = ChangeQuotationStatusDTOSchema.parse(req.body)

      const quotation = await quotationsService.changeQuotationStatus(
        quotationId,
        validatedData.estado as QuotationStatus,
        validatedData.observacion
      )

      res.status(200).json({
        success: true,
        data: quotation,
        message: `Estado cambiado a ${validatedData.estado}`
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(error.message.includes('no encontrada') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al cambiar estado'
      })
    }
  }

  /**
   * POST /quotations/:id/items
   * Agregar item a la cotización
   */
  async addQuotationItem(req: Request, res: Response, next: NextFunction) {
    try {
      const quotationId = parseInt(req.params.id)

      if (isNaN(quotationId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de cotización inválido'
        })
      }

      const validatedData = AddQuotationItemDTOSchema.parse(req.body)

      const quotation = await quotationsService.addQuotationItem(quotationId, validatedData)

      res.status(201).json({
        success: true,
        data: quotation,
        message: 'Item agregado exitosamente'
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(error.message.includes('no encontrada') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al agregar item'
      })
    }
  }

  /**
   * DELETE /quotations/:quotationId/items/:itemId
   * Eliminar item de la cotización
   */
  async removeQuotationItem(req: Request, res: Response, next: NextFunction) {
    try {
      const quotationId = parseInt(req.params.quotationId)
      const itemId = parseInt(req.params.itemId)

      if (isNaN(itemId) || isNaN(quotationId)) {
        return res.status(400).json({
          success: false,
          error: 'ID inválido'
        })
      }

      const result = await quotationsService.removeQuotationItem(itemId, quotationId)

      res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al eliminar item'
      })
    }
  }

  /**
   * DELETE /quotations/:id
   * Eliminar cotización
   */
  async deleteQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const quotationId = parseInt(req.params.id)

      if (isNaN(quotationId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de cotización inválido'
        })
      }

      const result = await quotationsService.deleteQuotation(quotationId)

      res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      res.status(error.message.includes('no encontrada') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al eliminar cotización'
      })
    }
  }

  /**
   * POST /quotations/:id/send-email
   * Enviar cotización por correo con PDF adjunto
   */
  async sendQuotationByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const quotationId = parseInt(req.params.id)

      if (isNaN(quotationId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de cotización inválido'
        })
      }

      const result = await quotationsService.sendQuotationByEmail(quotationId)

      res.status(200).json({
        success: true,
        data: result.quotation,
        sentTo: result.sentTo,
        message: `Cotización enviada correctamente a ${result.sentTo}`
      })
    } catch (error: any) {
      res.status(error.message.includes('no encontrada') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al enviar cotización'
      })
    }
  }

  /**
   * GET /quotations/by-lead/:leadId
   * Obtener cotizaciones de un lead
   */
  async getQuotationsByLead(req: Request, res: Response, next: NextFunction) {
    try {
      const leadId = parseInt(req.params.leadId)

      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de lead inválido'
        })
      }

      const quotations = await quotationsService.getQuotationsByLead(leadId)

      res.status(200).json({
        success: true,
        data: quotations,
        count: quotations.length
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener cotizaciones'
      })
    }
  }

  /**
   * GET /quotations/status/:status
   * Obtener cotizaciones por estado
   */
  async getQuotationsByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.params.status as QuotationStatus

      const validStates = ['borrador', 'enviada', 'vista', 'aceptada', 'rechazada', 'expirada']

      if (!validStates.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Estado inválido. Estados válidos: ${validStates.join(', ')}`
        })
      }

      const quotations = await quotationsService.getQuotationsByStatus(status)

      res.status(200).json({
        success: true,
        data: quotations,
        count: quotations.length
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener cotizaciones'
      })
    }
  }
}

export const quotationsController = new QuotationsController()
