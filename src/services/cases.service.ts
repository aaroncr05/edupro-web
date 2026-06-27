import apiClient from '@/lib/api-client'

export interface CaseResponse {
  id: number
  codigo: string
  numeroCaso: string
  idLead: number
  idAsesor: number | null
  asunto: string
  titulo: string
  descripcion: string
  descripción: string
  estadoCaso: string
  estado: string
  prioridad: string
  fechaCierre: string | null
  cerradoEn?: string | null
  fechaVencimiento?: string | null
  createdAt: string
  updatedAt: string
  resolucion?: string | null
  lead?: {
    id: number
    nombre: string
    empresa?: string
    email?: string
    telefono?: string
  }
  asesor?: {
    id: number
    nombre: string
  }
}

interface RawCaseResponse {
  id: number
  numeroCaso: string
  cliente: {
    id: number
    nombre: string
    email?: string
    telefono?: string
    empresa?: string
  }
  cotizacion?: {
    id: number
    numeroCotizacion: string
  }
  titulo: string
  descripcion: string
  resolucion?: string | null
  estado: string
  estadoCaso?: string
  prioridad: string
  responsable?: {
    id: number
    nombre: string
    email?: string
  }
  fechaVencimiento?: string | null
  cerradoEn?: string | null
  createdAt: string
  updatedAt: string
}

export interface CasesListResponse {
  success: boolean
  data: CaseResponse[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface CreateCaseDTO {
  numeroCaso: string
  idCliente: number
  idCotizacion?: number
  titulo: string
  descripcion?: string
  descripción?: string
  prioridad: 'bajo' | 'medio' | 'alto' | 'critico'
  idResponsable?: number
  fechaVencimiento?: string
}

export interface UpdateCaseDTO {
  titulo?: string
  descripcion?: string
  descripción?: string
  resolucion?: string
  prioridad?: 'bajo' | 'medio' | 'alto' | 'critico'
  fechaVencimiento?: string
}

export interface ChangeCaseStatusDTO {
  estado: 'abierto' | 'en_progreso' | 'en_espera' | 'resuelto' | 'cerrado' | 'reabierto'
  observacion?: string
  resolucion?: string
}

class CasesService {
  private normalizeCase(item: RawCaseResponse | CaseResponse): CaseResponse {
    const current = item as CaseResponse
    const raw = item as RawCaseResponse

    if (current.codigo && current.asunto && current.estadoCaso) {
      return {
        ...current,
        descripcion: current.descripcion || current.descripción || '',
        descripción: current.descripción || current.descripcion || ''
      }
    }

    const descripcion = raw.descripcion || ''

    return {
      id: raw.id,
      codigo: raw.numeroCaso,
      numeroCaso: raw.numeroCaso,
      idLead: raw.cliente?.id,
      idAsesor: raw.responsable?.id ?? null,
      asunto: raw.titulo,
      titulo: raw.titulo,
      descripcion,
      descripción: descripcion,
      resolucion: raw.resolucion || null,
      estadoCaso: raw.estadoCaso || raw.estado,
      estado: raw.estadoCaso || raw.estado,
      prioridad: raw.prioridad,
      fechaCierre: raw.cerradoEn || null,
      cerradoEn: raw.cerradoEn || null,
      fechaVencimiento: raw.fechaVencimiento || null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      lead: raw.cliente
        ? {
            id: raw.cliente.id,
            nombre: raw.cliente.nombre,
            empresa: raw.cliente.empresa,
            email: raw.cliente.email,
            telefono: raw.cliente.telefono
          }
        : undefined,
      asesor: raw.responsable
        ? {
            id: raw.responsable.id,
            nombre: raw.responsable.nombre
          }
        : undefined
    }
  }

  private normalizePayload<T extends CreateCaseDTO | UpdateCaseDTO>(data: T) {
    const payload: Record<string, unknown> = { ...data }
    payload.descripcion = data.descripcion || data.descripción || ''
    delete payload.descripción
    return payload
  }

  async getAllCases(params?: {
    page?: number
    limit?: number
    estado?: string
    prioridad?: string
  }): Promise<CasesListResponse> {
    try {
      const response = await apiClient.get<CasesListResponse & { data: RawCaseResponse[] }>('/cases', { params })
      return {
        ...response.data,
        data: response.data.data.map((item) => this.normalizeCase(item))
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener casos')
    }
  }

  async createCase(data: CreateCaseDTO): Promise<CaseResponse> {
    try {
      const response = await apiClient.post<{ success: boolean; data: RawCaseResponse }>(
        '/cases',
        this.normalizePayload(data)
      )
      return this.normalizeCase(response.data.data)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; details?: Array<{ message?: string }> } } }
      throw new Error(
        err.response?.data?.details?.[0]?.message ||
          err.response?.data?.error ||
          'Error al crear caso'
      )
    }
  }

  async updateCase(id: number, data: UpdateCaseDTO): Promise<CaseResponse> {
    try {
      const response = await apiClient.put<{ success: boolean; data: RawCaseResponse }>(
        `/cases/${id}`,
        this.normalizePayload(data)
      )
      return this.normalizeCase(response.data.data)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; details?: Array<{ message?: string }> } } }
      throw new Error(
        err.response?.data?.details?.[0]?.message ||
          err.response?.data?.error ||
          'Error al actualizar caso'
      )
    }
  }

  async changeCaseStatus(id: number, data: ChangeCaseStatusDTO): Promise<CaseResponse> {
    try {
      const response = await apiClient.patch<{ success: boolean; data: RawCaseResponse }>(`/cases/${id}/change-status`, data)
      return this.normalizeCase(response.data.data)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; details?: Array<{ message?: string }> } } }
      throw new Error(
        err.response?.data?.details?.[0]?.message ||
          err.response?.data?.error ||
          'Error al cambiar estado del caso'
      )
    }
  }

  async sendResolutionDocumentation(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(`/cases/${id}/send-resolution-documentation`)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } }
      throw new Error(err.response?.data?.error || 'Error al enviar documentación del caso')
    }
  }
}

export const casesService = new CasesService()
