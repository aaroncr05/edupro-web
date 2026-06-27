import { Request, Response, NextFunction } from 'express'
import { formsService } from './forms.service'
import { CreateFormDTOSchema } from './dto/create-form.dto'
import { UpdateFormDTOSchema } from './dto/update-form.dto'
import { SubmitFormResponseDTOSchema } from './dto/form-response.dto'
import { AuthenticatedRequest } from '@/modules/auth/guards/jwt.guard'

export class FormsController {
  /**
   * POST /forms
   * Crear nuevo formulario (solo administrador)
   */
  async createForm(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateFormDTOSchema.parse(req.body)

      const form = await formsService.createForm(validatedData, req.user!.userId)

      res.status(201).json({
        success: true,
        data: form,
        message: 'Formulario creado exitosamente'
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
        error: error.message || 'Error al crear formulario'
      })
    }
  }

  /**
   * GET /forms
   * Obtener todos los formularios
   */
  async getAllForms(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await formsService.getAllForms(page, limit)

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
        error: error.message || 'Error al obtener formularios'
      })
    }
  }

  /**
   * GET /forms/:id
   * Obtener formulario por ID
   */
  async getFormById(req: Request, res: Response, next: NextFunction) {
    try {
      const formId = parseInt(req.params.id)

      if (isNaN(formId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de formulario inválido'
        })
      }

      const form = await formsService.getFormById(formId)

      res.status(200).json({
        success: true,
        data: form
      })
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'Formulario no encontrado'
      })
    }
  }

  /**
   * PATCH /forms/:id
   * Actualizar formulario (solo administrador)
   */
  async updateForm(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const formId = parseInt(req.params.id)

      if (isNaN(formId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de formulario inválido'
        })
      }

      const validatedData = UpdateFormDTOSchema.parse(req.body)

      const form = await formsService.updateForm(formId, validatedData)

      res.status(200).json({
        success: true,
        data: form,
        message: 'Formulario actualizado exitosamente'
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
        error: error.message || 'Error al actualizar formulario'
      })
    }
  }

  /**
   * DELETE /forms/:id
   * Eliminar formulario (solo administrador)
   */
  async deleteForm(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const formId = parseInt(req.params.id)

      if (isNaN(formId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de formulario inválido'
        })
      }

      const result = await formsService.deleteForm(formId)

      res.status(200).json({
        success: true,
        data: result,
        message: 'Formulario eliminado exitosamente'
      })
    } catch (error: any) {
      res.status(error.message.includes('no encontrado') ? 404 : 400).json({
        success: false,
        error: error.message || 'Error al eliminar formulario'
      })
    }
  }

  /**
   * GET /forms/public/active
   * Obtener formularios activos (para uso público)
   */
  async getActiveForms(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await formsService.getActiveForms(page, limit)

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
        error: error.message || 'Error al obtener formularios'
      })
    }
  }

  /**
   * POST /forms/submit
   * Enviar respuesta de formulario (público)
   */
  async submitFormResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = SubmitFormResponseDTOSchema.parse(req.body)

      const result = await formsService.submitFormResponse(validatedData)

      res.status(201).json({
        success: true,
        data: result,
        message: 'Formulario enviado correctamente'
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
        error: error.message || 'Error al enviar formulario'
      })
    }
  }

  /**
   * GET /forms/:id/responses
   * Obtener respuestas de un formulario
   */
  async getFormResponses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const formId = parseInt(req.params.id)
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      if (isNaN(formId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de formulario inválido'
        })
      }

      const result = await formsService.getFormResponses(formId, page, limit)

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
      res.status(error.message.includes('no encontrado') ? 404 : 500).json({
        success: false,
        error: error.message || 'Error al obtener respuestas'
      })
    }
  }
}

export const formsController = new FormsController()
