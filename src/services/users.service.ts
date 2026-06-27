import apiClient from '@/lib/api-client'

export interface UserResponse {
  id: number
  nombre: string
  email: string
  telefono: string | null
  idRol: number
  activo: boolean
  createdAt: string
  updatedAt: string
  rol?: {
    id: number
    nombre: string
  }
}

export interface UsersListResponse {
  success: boolean
  data: UserResponse[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

class UsersService {
  async getAllUsers(params?: {
    page?: number
    limit?: number
    search?: string
    idRol?: number
  }): Promise<UsersListResponse> {
    try {
      const response = await apiClient.get('/users', { params })
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener usuarios')
    }
  }

  async createUser(data: unknown): Promise<{ success: boolean; data: UserResponse }> {
    try {
      const response = await apiClient.post('/users', data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al crear usuario')
    }
  }

  async updateUser(id: number, data: Partial<UserResponse>): Promise<{ success: boolean; data: UserResponse }> {
    try {
      const response = await apiClient.put(`/users/${id}`, data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al actualizar usuario')
    }
  }

  async deleteUser(id: number): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(`/users/${id}`)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al eliminar usuario')
    }
  }
}

export const usersService = new UsersService()
