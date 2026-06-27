import apiClient from '@/lib/api-client'

export interface PaginationDTO {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'date'
  required: boolean
  placeholder?: string
  options?: string[]
  order: number
}

export interface FormResponse {
  id: number
  nombre: string
  descripción?: string
  campos: FormField[]
  activo: boolean
  totalResponses?: number
  createdAt: string
}

export interface CreateFormDTO {
  nombre: string
  descripción?: string
  campos: FormField[]
  activo?: boolean
}

export interface UpdateFormDTO {
  nombre?: string
  descripción?: string
  campos?: FormField[]
  activo?: boolean
}

export interface FormSubmissionDTO {
  idFormulario: number
  respuestas: Record<string, string | number | boolean | string[]>
  email?: string
}

export interface FormResponsesDTO {
  data: Array<{ id: number; respuestas: Record<string, string | number | boolean>; createdAt: string }>
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface FormsListResponse {
  data: FormResponse[]
  pagination: PaginationDTO
}

class FormsService {
  /**
   * Crear nuevo formulario
   */
  async createForm(data: CreateFormDTO): Promise<FormResponse> {
    try {
      const response = await apiClient.post<{ success: boolean; data: FormResponse }>(
        '/forms',
        data
      )
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al crear formulario')
    }
  }

  /**
   * Obtener todos los formularios
   */
  async getAllForms(page: number = 1, limit: number = 10): Promise<FormsListResponse> {
    try {
      const response = await apiClient.get<{ success: boolean; data: FormResponse[]; pagination: PaginationDTO }>(
        '/forms',
        {
          params: { page, limit }
        }
      )
      return {
        data: response.data.data,
        pagination: response.data.pagination
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener formularios')
    }
  }

  /**
   * Obtener formulario por ID
   */
  async getFormById(id: number): Promise<FormResponse> {
    try {
      const response = await apiClient.get<{ success: boolean; data: FormResponse }>(
        `/forms/${id}`
      )
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener formulario')
    }
  }

  /**
   * Actualizar formulario
   */
  async updateForm(id: number, data: UpdateFormDTO): Promise<FormResponse> {
    try {
      const response = await apiClient.patch<{ success: boolean; data: FormResponse }>(
        `/forms/${id}`,
        data
      )
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al actualizar formulario')
    }
  }

  /**
   * Eliminar formulario
   */
  async deleteForm(id: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; data: { message: string } }>(
        `/forms/${id}`
      )
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al eliminar formulario')
    }
  }

  /**
   * Obtener formularios activos (públicos)
   */
  async getActiveForms(page: number = 1, limit: number = 10): Promise<FormsListResponse> {
    try {
      const response = await apiClient.get<{ success: boolean; data: FormResponse[]; pagination: PaginationDTO }>(
        '/forms/public/active',
        {
          params: { page, limit }
        }
      )
      return {
        data: response.data.data,
        pagination: response.data.pagination
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener formularios activos')
    }
  }

  /**
   * Enviar respuesta de formulario
   */
  async submitForm(data: FormSubmissionDTO): Promise<{ id: number; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: { id: number; message: string } }>(
        '/forms/submit',
        data
      )
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al enviar formulario')
    }
  }

  /**
   * Obtener respuestas de un formulario
   */
  async getFormResponses(id: number, page: number = 1, limit: number = 10): Promise<FormResponsesDTO> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Array<{ id: number; respuestas: Record<string, string | number | boolean>; createdAt: string }>; pagination: PaginationDTO }>(
        `/forms/${id}/responses`,
        {
          params: { page, limit }
        }
      )
      return {
        data: response.data.data,
        pagination: response.data.pagination
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener respuestas')
    }
  }
}

export const formsService = new FormsService()
