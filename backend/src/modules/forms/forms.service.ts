import { formsRepository } from './repositories/forms.repository'
import { CreateFormDTO } from './dto/create-form.dto'
import { UpdateFormDTO } from './dto/update-form.dto'
import { SubmitFormResponseDTO } from './dto/form-response.dto'
import { notificationsService } from '@/modules/notifications/notifications.service'

export class FormsService {
  private getFieldValue(campos: any[], respuestas: Record<string, any>, matcher: (campo: any) => boolean) {
    const campo = campos.find(matcher)
    if (!campo) return undefined

    const value = respuestas[campo.id] ?? respuestas[campo.name]
    if (Array.isArray(value)) return value.join(', ')
    return value ? String(value).trim() : undefined
  }

  private async createOrFindLeadFromResponse(formulario: any, respuestas: Record<string, any>) {
    const campos = formulario.campos as any[]
    const normalized = (campo: any) =>
      `${campo.name || ''} ${campo.label || ''} ${campo.id || ''}`.toLowerCase()

    const email = this.getFieldValue(
      campos,
      respuestas,
      (campo) => campo.type === 'email' || normalized(campo).includes('email') || normalized(campo).includes('correo')
    )

    if (!email) return undefined

    const existingLead = await formsRepository.findLeadByEmail(email)
    if (existingLead) return existingLead.id

    const nombre = this.getFieldValue(
      campos,
      respuestas,
      (campo) => normalized(campo).includes('nombre') || normalized(campo).includes('name')
    ) || 'Lead desde formulario web'

    const telefono = this.getFieldValue(
      campos,
      respuestas,
      (campo) => campo.type === 'phone' || normalized(campo).includes('telefono') || normalized(campo).includes('teléfono') || normalized(campo).includes('phone')
    )

    const empresa = this.getFieldValue(
      campos,
      respuestas,
      (campo) => normalized(campo).includes('empresa') || normalized(campo).includes('servicio') || normalized(campo).includes('interes')
    )

    const notas = [
      `Origen: Formulario web - ${formulario.nombre}`,
      ...campos.map((campo) => {
        const value = respuestas[campo.id] ?? respuestas[campo.name]
        if (value === undefined || value === null || value === '') return null
        return `${campo.label || campo.name}: ${Array.isArray(value) ? value.join(', ') : value}`
      }).filter(Boolean)
    ].join('\n')

    const lead = await formsRepository.createLeadFromForm({
      nombre,
      email,
      telefono,
      empresa,
      notas
    })

    return lead.id
  }

  /**
   * Crear nuevo formulario
   */
  async createForm(data: CreateFormDTO, userId: number) {
    try {
      const formulario = await formsRepository.create({
        ...data,
        createdBy: userId
      })

      return {
        id: formulario.id,
        nombre: formulario.nombre,
        descripcion: formulario.descripcion,
        campos: formulario.campos,
        activo: formulario.activo,
        createdAt: formulario.createdAt
      }
    } catch (error: any) {
      throw new Error(`Error al crear formulario: ${error.message}`)
    }
  }

  /**
   * Obtener todos los formularios
   */
  async getAllForms(page: number = 1, limit: number = 10) {
    try {
      const result = await formsRepository.findAll(page, limit)
      return {
        data: result.data.map(f => ({
          id: f.id,
          nombre: f.nombre,
          descripcion: f.descripcion,
          campos: f.campos,
          activo: f.activo,
          totalResponses: f._count.respuestas,
          createdAt: f.createdAt
        })),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      }
    } catch (error: any) {
      throw new Error(`Error al obtener formularios: ${error.message}`)
    }
  }

  /**
   * Obtener formulario por ID
   */
  async getFormById(id: number) {
    try {
      const formulario = await formsRepository.findById(id)

      if (!formulario) {
        throw new Error('Formulario no encontrado')
      }

      return {
        id: formulario.id,
        nombre: formulario.nombre,
        descripcion: formulario.descripcion,
        campos: formulario.campos,
        activo: formulario.activo,
        totalResponses: formulario._count.respuestas,
        createdAt: formulario.createdAt
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener formulario')
    }
  }

  /**
   * Actualizar formulario
   */
  async updateForm(id: number, data: UpdateFormDTO) {
    try {
      const formulario = await formsRepository.findById(id)

      if (!formulario) {
        throw new Error('Formulario no encontrado')
      }

      const updated = await formsRepository.update(id, data)

      return {
        id: updated.id,
        nombre: updated.nombre,
        descripcion: updated.descripcion,
        campos: updated.campos,
        activo: updated.activo,
        createdAt: updated.createdAt
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al actualizar formulario')
    }
  }

  /**
   * Eliminar formulario
   */
  async deleteForm(id: number) {
    try {
      const formulario = await formsRepository.findById(id)

      if (!formulario) {
        throw new Error('Formulario no encontrado')
      }

      await formsRepository.delete(id)

      return {
        message: 'Formulario eliminado correctamente',
        id
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al eliminar formulario')
    }
  }

  /**
   * Obtener formularios activos (para uso público)
   */
  async getActiveForms(page: number = 1, limit: number = 10) {
    try {
      const result = await formsRepository.findActive(page, limit)
      return {
        data: result.data,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      }
    } catch (error: any) {
      throw new Error(`Error al obtener formularios activos: ${error.message}`)
    }
  }

  /**
   * Enviar respuesta de formulario
   */
  async submitFormResponse(data: SubmitFormResponseDTO) {
    try {
      const formulario = await formsRepository.findById(data.idFormulario)

      if (!formulario) {
        throw new Error('Formulario no encontrado')
      }

      if (!formulario.activo) {
        throw new Error('Este formulario no está disponible')
      }

      // Validar que todas las respuestas tienen campos requeridos
      for (const campo of formulario.campos as any[]) {
        if (campo.required && !data.respuestas[campo.id]) {
          throw new Error(`El campo ${campo.label} es requerido`)
        }
      }

      const idLead = await this.createOrFindLeadFromResponse(formulario, data.respuestas)

      const respuesta = await formsRepository.createResponse(
        data.idFormulario,
        data.respuestas,
        idLead
      )

      try {
        const campos = formulario.campos as any[]
        const normalized = (campo: any) =>
          `${campo.name || ''} ${campo.label || ''} ${campo.id || ''}`.toLowerCase()
        const leadName = this.getFieldValue(
          campos,
          data.respuestas,
          (campo) => normalized(campo).includes('nombre') || normalized(campo).includes('name')
        )
        const leadEmail = this.getFieldValue(
          campos,
          data.respuestas,
          (campo) => campo.type === 'email' || normalized(campo).includes('email') || normalized(campo).includes('correo')
        )

        await notificationsService.notifySalesAdvisorsAboutFormResponse({
          formName: formulario.nombre,
          responseId: respuesta.id,
          leadId: idLead,
          leadName,
          leadEmail
        })
      } catch (notificationError) {
        console.error('Error creating form notification:', notificationError)
      }

      return {
        id: respuesta.id,
        message: 'Formulario enviado correctamente'
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al enviar formulario')
    }
  }

  /**
   * Obtener respuestas de un formulario
   */
  async getFormResponses(idFormulario: number, page: number = 1, limit: number = 10) {
    try {
      const formulario = await formsRepository.findById(idFormulario)

      if (!formulario) {
        throw new Error('Formulario no encontrado')
      }

      const result = await formsRepository.findResponses(idFormulario, page, limit)

      return {
        data: result.data,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener respuestas')
    }
  }
}

export const formsService = new FormsService()
