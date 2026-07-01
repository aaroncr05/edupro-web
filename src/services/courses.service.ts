import apiClient from '@/lib/api-client'

export interface CourseResponse {
  id: number
  titulo: string
  slug: string
  descripción: string
  imagen: string
  objetivos: string[]
  dirigidoA: string
  contenido: string[]
  precio: number
  activo: boolean
  linkInscripcion?: string
  createdAt: string
  updatedAt: string
}

export interface CoursesListResponse {
  success: boolean
  data: CourseResponse[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

class CoursesService {
  async getAllCourses(params?: {
    page?: number
    limit?: number
    activo?: boolean
  }): Promise<CoursesListResponse> {
    try {
      const response = await apiClient.get('/courses', { params })
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener cursos')
    }
  }

  async getCourseBySlug(slug: string): Promise<{ success: boolean; data: CourseResponse }> {
    try {
      const response = await apiClient.get(`/courses/slug/${slug}`)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener curso')
    }
  }

  async createCourse(data: unknown): Promise<{ success: boolean; data: CourseResponse }> {
    try {
      const response = await apiClient.post('/courses', data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al crear curso')
    }
  }

  async updateCourse(id: number, data: unknown): Promise<{ success: boolean; data: CourseResponse }> {
    try {
      const response = await apiClient.put(`/courses/${id}`, data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al actualizar curso')
    }
  }

  async deleteCourse(id: number): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(`/courses/${id}`)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al eliminar curso')
    }
  }
}

export const coursesService = new CoursesService()
