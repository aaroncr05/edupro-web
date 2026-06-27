import { Request, Response, NextFunction } from 'express'
import { casesService } from './cases.service'
import { CreateCaseDTOSchema } from './dto/create-case.dto'
import { UpdateCaseDTOSchema } from './dto/update-case.dto'
import { ChangeCaseStatusDTOSchema } from './dto/change-case-status.dto'
import { CaseStatus, CasePriority } from '@prisma/client'
import { AuthenticatedRequest } from '@/modules/auth/guards/jwt.guard'

export class CasesController {
  /**
   * GET /cases
   * Obtener todos los casos con filtros
   */
  async getAllCases(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const estado = req.query.estado as CaseStatus | undefined
      const prioridad = req.query.prioridad as CasePriority | undefined
      const idResponsable = req.query.idResponsable ? parseInt(req.query.idResponsable as string) : undefined
      const idCliente = req.query.idCliente ? parseInt(req.query.idCliente as string) : undefined

      const result = await casesService.getAllCases(page, limit, {
        estado,
        prioridad,
        idResponsable,
        idCliente
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
        error: error.message || 'Error al obtener casos'
      })
    }
  }

  /**
   * GET /cases/:id
   * Obtener caso por ID
   */
  async getCaseById(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = parseInt(req.params.id)

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de caso inválido'
        })
      }

      const caso = await casesService.getCaseById(caseId)

      res.status(200).json({
        success: true,
        data: caso
      })
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'Caso no encontrado'
      })
    }
  }

  /**
   * POST /cases
   * Crear nuevo caso
   */
  async createCase(req: Request, res: Response, next: NextFunction) {
    try {
      const authenticatedReq = req as AuthenticatedRequest
      const validatedData = CreateCaseDTOSchema.parse({
        ...req.body,
        idResponsable: req.body.idResponsable ?? authenticatedReq.user?.userId
      })

      const caso = await casesService.createCase(validatedData)

      res.status(201).json({
        success: true,
        data: caso,
        message: 'Caso creado exitosamente'
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
        error: error.message || 'Error al crear caso'
      })
    }
  }

  /**
   * PUT /cases/:id
   * Actualizar caso
   */
  async updateCase(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = parseInt(req.params.id)

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de caso inválido'
        })
      }

      const validatedData = UpdateCaseDTOSchema.parse(req.body)

      const caso = await casesService.updateCase(caseId, validatedData)

      res.status(200).json({
        success: true,
        data: caso,
        message: 'Caso actualizado exitosamente'
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
        error: error.message || 'Error al actualizar caso'
      })
    }
  }

  /**
   * PATCH /cases/:id/change-status
   * Cambiar estado del caso
   */
  async changeCaseStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = parseInt(req.params.id)

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de caso inválido'
        })
      }

      const validatedData = ChangeCaseStatusDTOSchema.parse(req.body)

      const caso = await casesService.changeCaseStatus(
        caseId,
        validatedData.estado as CaseStatus,
        validatedData.observacion,
        validatedData.resolucion
      )

      res.status(200).json({
        success: true,
        data: caso,
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

      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al cambiar estado'
      })
    }
  }

  /**
   * PATCH /cases/:id/assign
   * Asignar caso a responsable
   */
  async assignCaseToResponsible(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = parseInt(req.params.id)
      const { responsibleId } = req.body

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de caso inválido'
        })
      }

      if (!responsibleId || isNaN(responsibleId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de responsable requerido y debe ser un número'
        })
      }

      const caso = await casesService.assignCaseToResponsible(caseId, responsibleId)

      res.status(200).json({
        success: true,
        data: caso,
        message: 'Caso asignado exitosamente'
      })
    } catch (error: any) {
      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al asignar caso'
      })
    }
  }

  /**
   * DELETE /cases/:id
   * Eliminar caso
   */
  async deleteCase(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = parseInt(req.params.id)

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de caso inválido'
        })
      }

      const result = await casesService.deleteCase(caseId)

      res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al eliminar caso'
      })
    }
  }

  /**
   * POST /cases/:id/send-resolution-documentation
   * Enviar documentacion de resolucion por correo
   */
  async sendResolutionDocumentation(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = parseInt(req.params.id)

      if (isNaN(caseId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de caso invalido'
        })
      }

      const result = await casesService.sendResolutionDocumentation(caseId)

      res.status(200).json({
        success: true,
        data: result,
        message: result.message
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Error al enviar documentacion del caso'
      })
    }
  }

  /**
   * GET /cases/status/:status
   * Obtener casos por estado
   */
  async getCasesByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.params.status as CaseStatus

      const validStates = ['abierto', 'en_progreso', 'en_espera', 'resuelto', 'cerrado', 'reabierto']

      if (!validStates.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Estado inválido. Estados válidos: ${validStates.join(', ')}`
        })
      }

      const casos = await casesService.getCasesByStatus(status)

      res.status(200).json({
        success: true,
        data: casos,
        count: casos.length
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener casos'
      })
    }
  }

  /**
   * GET /cases/priority/:priority
   * Obtener casos por prioridad
   */
  async getCasesByPriority(req: Request, res: Response, next: NextFunction) {
    try {
      const priority = req.params.priority as CasePriority

      const validPriorities = ['bajo', 'medio', 'alto', 'critico']

      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          error: `Prioridad inválida. Prioridades válidas: ${validPriorities.join(', ')}`
        })
      }

      const casos = await casesService.getCasesByPriority(priority)

      res.status(200).json({
        success: true,
        data: casos,
        count: casos.length
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener casos'
      })
    }
  }

  /**
   * GET /cases/client/:clientId
   * Obtener casos de un cliente
   */
  async getCasesByClient(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = parseInt(req.params.clientId)

      if (isNaN(clientId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de cliente inválido'
        })
      }

      const casos = await casesService.getCasesByClient(clientId)

      res.status(200).json({
        success: true,
        data: casos,
        count: casos.length
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener casos'
      })
    }
  }

  /**
   * GET /cases/responsible/:responsibleId
   * Obtener casos de un responsable
   */
  async getCasesByResponsible(req: Request, res: Response, next: NextFunction) {
    try {
      const responsibleId = parseInt(req.params.responsibleId)

      if (isNaN(responsibleId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de responsable inválido'
        })
      }

      const casos = await casesService.getCasesByResponsible(responsibleId)

      res.status(200).json({
        success: true,
        data: casos,
        count: casos.length
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener casos'
      })
    }
  }
}

export const casesController = new CasesController()
