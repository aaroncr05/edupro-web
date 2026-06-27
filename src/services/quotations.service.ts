import apiClient from '@/lib/api-client'

export interface QuotationItemResponse {
  id: number
  idCotizacion?: number
  descripcion?: string
  descripción?: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface QuotationResponse {
  id: number
  codigo: string
  numeroCotizacion?: string
  idLead: number
  idUsuario?: number
  fechaEmision: string
  validezDias?: number
  subtotal: number
  impuestos: number
  total: number
  montoTotal?: number
  moneda: string
  estadoCotizacion: string
  estado?: string
  condiciones?: string
  notasAdicionales?: string
  notas?: string
  enviadoEn?: string
  aceptadoEn?: string
  rechazadoEn?: string
  createdAt: string
  updatedAt: string
  items?: QuotationItemResponse[]
  lead?: {
    id: number
    nombre: string
    empresa?: string
    email?: string
    telefono?: string
  }
}

export interface CreateQuotationDTO {
  numeroCotizacion: string
  idLead: number
  montoTotal: number
  moneda?: string
  notas?: string
  fechaVencimiento?: string
}

export interface AddQuotationItemDTO {
  descripcion?: string
  descripción?: string
  cantidad: number
  precioUnitario: number
}

export interface QuotationsListResponse {
  success: boolean
  data: QuotationResponse[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

type BackendQuotationResponse = Partial<QuotationResponse> & {
  numeroCotizacion?: string
  codigo?: string
  montoTotal?: number
  total?: number
  estado?: string
  estadoCotizacion?: string
  enviadoEn?: string
  aceptadoEn?: string
  rechazadoEn?: string
}

const normalizeQuotation = (quotation: BackendQuotationResponse): QuotationResponse => {
  const total = Number(quotation.total ?? quotation.montoTotal ?? 0)
  const createdAt = quotation.createdAt || new Date().toISOString()

  return {
    ...quotation,
    id: quotation.id || 0,
    codigo: quotation.codigo || quotation.numeroCotizacion || `COT-${quotation.id}`,
    numeroCotizacion: quotation.numeroCotizacion || quotation.codigo || `COT-${quotation.id}`,
    idLead: quotation.idLead || quotation.lead?.id || 0,
    fechaEmision: quotation.fechaEmision || createdAt,
    subtotal: quotation.subtotal ?? total,
    impuestos: quotation.impuestos ?? 0,
    total,
    montoTotal: total,
    moneda: quotation.moneda || 'PEN',
    estadoCotizacion: quotation.estadoCotizacion || quotation.estado || 'borrador',
    estado: quotation.estado || quotation.estadoCotizacion || 'borrador',
    notasAdicionales: quotation.notasAdicionales || quotation.notas,
    createdAt,
    updatedAt: quotation.updatedAt || createdAt,
    items: quotation.items || []
  }
}

class QuotationsService {
  async getAllQuotations(params?: {
    page?: number
    limit?: number
    estado?: string
    idLead?: number
  }): Promise<QuotationsListResponse> {
    try {
      const response = await apiClient.get('/quotations', { params })
      return {
        ...response.data,
        data: response.data.data.map(normalizeQuotation)
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener cotizaciones')
    }
  }

  async createQuotation(data: CreateQuotationDTO): Promise<QuotationResponse> {
    try {
      const response = await apiClient.post('/quotations', data)
      return normalizeQuotation(response.data.data)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al crear cotización')
    }
  }

  async addQuotationItem(id: number, data: AddQuotationItemDTO): Promise<QuotationResponse> {
    try {
      const response = await apiClient.post(`/quotations/${id}/items`, {
        descripcion: data.descripcion || data.descripción,
        cantidad: data.cantidad,
        precioUnitario: data.precioUnitario
      })
      return normalizeQuotation(response.data.data)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al agregar item')
    }
  }

  async changeStatus(id: number, estado: string, observacion?: string): Promise<QuotationResponse> {
    try {
      const response = await apiClient.patch(`/quotations/${id}/change-status`, {
        estado,
        observacion
      })
      return normalizeQuotation(response.data.data)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al cambiar estado de cotización')
    }
  }

  async sendByEmail(id: number): Promise<{ quotation: QuotationResponse; sentTo: string; message: string }> {
    try {
      const response = await apiClient.post(`/quotations/${id}/send-email`)
      return {
        quotation: normalizeQuotation(response.data.data),
        sentTo: response.data.sentTo,
        message: response.data.message
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al enviar cotización por correo')
    }
  }
}

export const quotationsService = new QuotationsService()
