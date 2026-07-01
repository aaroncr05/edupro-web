import apiClient from '@/lib/api-client'

export interface ServiceResponse {
  id: number
  titulo: string
  slug: string
  descripción: string
  icono: string // Lucide icon name or image URL
  imagen: string
  caracteristicas: string[]
  precioBase: number
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface ServicesListResponse {
  success: boolean
  data: ServiceResponse[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

class ServicesService {
  async getAllServices(params?: {
    page?: number
    limit?: number
    activo?: boolean
  }): Promise<ServicesListResponse> {
    try {
      const response = await apiClient.get('/services', { params })
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener servicios')
    }
  }

  async getServiceBySlug(slug: string): Promise<{ success: boolean; data: ServiceResponse }> {
    try {
      const response = await apiClient.get(`/services/slug/${slug}`)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener servicio')
    }
  }

  async createService(data: unknown): Promise<{ success: boolean; data: ServiceResponse }> {
    try {
      const response = await apiClient.post('/services', data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al crear servicio')
    }
  }

  async updateService(id: number, data: unknown): Promise<{ success: boolean; data: ServiceResponse }> {
    try {
      const response = await apiClient.put(`/services/${id}`, data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al actualizar servicio')
    }
  }

  async deleteService(id: number): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(`/services/${id}`)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al eliminar servicio')
    }
  }
}

export const servicesService = new ServicesService()
