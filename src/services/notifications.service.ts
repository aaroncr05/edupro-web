import apiClient from '@/lib/api-client'

export interface NotificationResponse {
  id: number
  idUsuario: number
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  enlace?: string
  createdAt: string
}

export interface NotificationsListResponse {
  data: NotificationResponse[]
  unread: number
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

class NotificationsService {
  async getMine(page: number = 1, limit: number = 10): Promise<NotificationsListResponse> {
    const response = await apiClient.get<{
      success: boolean
      data: NotificationResponse[]
      unread: number
      pagination: NotificationsListResponse['pagination']
    }>('/notifications', { params: { page, limit } })

    return {
      data: response.data.data,
      unread: response.data.unread,
      pagination: response.data.pagination
    }
  }

  async markAsRead(id: number): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`)
  }
}

export const notificationsService = new NotificationsService()
