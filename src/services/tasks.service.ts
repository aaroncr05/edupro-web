import apiClient from '@/lib/api-client'

export interface AutomaticTaskResponse {
  id: number
  nombre: string
  descripción?: string
  workflowId: string
  tipoTrigger: string
  estado: boolean
  ultimaEjecucion?: string
  proximaEjecucion?: string
  createdBy?: number
  createdAt: string
}

class TasksService {
  async getMine(limit: number = 8): Promise<AutomaticTaskResponse[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: AutomaticTaskResponse[] }>('/tasks/mine', {
        params: { limit }
      })
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener tareas')
    }
  }

  async complete(id: number): Promise<void> {
    try {
      await apiClient.patch(`/tasks/${id}/complete`)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al completar tarea')
    }
  }
}

export const tasksService = new TasksService()
