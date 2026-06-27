import apiClient from '@/lib/api-client'

export interface LeadResponse {
  id: number
  nombre: string
  email: string
  telefono?: string
  empresa?: string
  cargo?: string
  presupuesto?: number
  estadoLead: string
  probabilidad: number
  esCliente: boolean
  convertidoClienteEn?: string
  habilitadoMarketing: boolean
  segmentoMarketing?: string
  fechaIngresoMarketing?: string
  ultimoEnvioMarketing?: string
  notas?: string
  fechaContacto?: string
  idAsesor?: number
  asesor?: {
    id: number
    nombre: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateLeadDTO {
  nombre: string
  email: string
  telefono?: string
  empresa?: string
  cargo?: string
  presupuesto?: number
  notas?: string
}

export interface UpdateLeadDTO {
  nombre?: string
  email?: string
  telefono?: string
  empresa?: string
  cargo?: string
  presupuesto?: number
  notas?: string
}

export interface LeadsResponse {
  success: boolean
  data: LeadResponse[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface LeadFilters {
  estado?: string
  probabilidad?: number
  idAsesor?: number
  search?: string
}

export interface AssignLeadDTO {
  advisorId: number
}

export interface ChangeLeadStatusDTO {
  estado: string
  observacion?: string
}

export interface FollowupResponse {
  id: number
  idLead: number
  idUsuario?: number
  tipoSeguimiento: string
  descripción: string
  resultado?: string
  proximaAccion?: string
  fechaProximaAccion?: string
  createdAt: string
  usuario?: {
    id: number
    nombre: string
    email: string
  }
}

export interface CreateFollowupDTO {
  tipoSeguimiento: string
  descripción: string
  resultado?: string
  proximaAccion?: string
  fechaProximaAccion?: string
}

class LeadsService {
  async getAllLeads(
    page: number = 1,
    limit: number = 10,
    filters?: LeadFilters
  ): Promise<LeadsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.estado && { estado: filters.estado }),
        ...(filters?.probabilidad && { probabilidad: filters.probabilidad.toString() }),
        ...(filters?.idAsesor && { idAsesor: filters.idAsesor.toString() }),
        ...(filters?.search && { search: filters.search })
      })

      const response = await apiClient.get<LeadsResponse>(`/leads?${params}`)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener leads')
    }
  }

  async getLeadById(id: number): Promise<LeadResponse> {
    try {
      const response = await apiClient.get<{ success: boolean; data: LeadResponse }>(`/leads/${id}`)
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener lead')
    }
  }

  async createLead(data: CreateLeadDTO): Promise<LeadResponse> {
    try {
      const response = await apiClient.post<{ success: boolean; data: LeadResponse }>('/leads', data)
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al crear lead')
    }
  }

  async updateLead(id: number, data: UpdateLeadDTO): Promise<LeadResponse> {
    try {
      const response = await apiClient.put<{ success: boolean; data: LeadResponse }>(`/leads/${id}`, data)
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al actualizar lead')
    }
  }

  async deleteLead(id: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/leads/${id}`)
      return { message: response.data.message }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al eliminar lead')
    }
  }

  async assignLeadToAdvisor(id: number, data: AssignLeadDTO): Promise<LeadResponse> {
    try {
      const response = await apiClient.patch<{ success: boolean; data: LeadResponse }>(`/leads/${id}/assign`, data)
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al asignar lead')
    }
  }

  async changeLeadStatus(id: number, data: ChangeLeadStatusDTO): Promise<LeadResponse> {
    try {
      const response = await apiClient.patch<{ success: boolean; data: LeadResponse }>(`/leads/${id}/change-status`, data)
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al cambiar estado')
    }
  }

  async getLeadsByStatus(status: string): Promise<LeadResponse[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: LeadResponse[] }>(`/leads/status/${status}`)
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener leads por estado')
    }
  }

  async getLeadsByAdvisor(advisorId: number): Promise<LeadResponse[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: LeadResponse[] }>(`/leads/advisor/${advisorId}`)
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener leads del asesor')
    }
  }

  async getLeadFollowups(id: number): Promise<FollowupResponse[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: FollowupResponse[] }>(`/leads/${id}/followups`)
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener historial')
    }
  }

  async createLeadFollowup(id: number, data: CreateFollowupDTO): Promise<FollowupResponse> {
    try {
      const response = await apiClient.post<{ success: boolean; data: FollowupResponse }>(`/leads/${id}/followups`, data)
      return response.data.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al registrar seguimiento')
    }
  }

  /**
   * Crear un nuevo lead desde un formulario público (legacy)
   */
  async createPublicLead(data: CreateLeadDTO): Promise<{ success: boolean; data: LeadResponse }> {
    try {
      const response = await apiClient.post('/leads/public', data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al enviar la solicitud')
    }
  }
}

export const leadsService = new LeadsService()
