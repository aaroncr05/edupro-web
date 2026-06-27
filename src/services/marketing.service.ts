import apiClient from '@/lib/api-client'

export type MarketingSegment = 'todos' | 'cliente_acepto' | 'lead_rechazo'

export interface MarketingContact {
  id: number
  nombre: string
  email: string
  telefono?: string
  empresa?: string
  estadoLead: string
  esCliente: boolean
  segmentoMarketing?: string
  fechaIngresoMarketing?: string
  ultimoEnvioMarketing?: string
}

export interface MarketingAudienceResponse {
  success: boolean
  data: MarketingContact[]
  total: number
}

export interface SendAnnouncementResponse {
  success: boolean
  message: string
  data: {
    segmento: MarketingSegment
    total: number
    enviados: number
    fallidos: number
    fallidosDetalle: Array<{ id: number; email: string; error: string }>
  }
}

class MarketingService {
  async getAudience(segmento: MarketingSegment): Promise<MarketingAudienceResponse> {
    try {
      const response = await apiClient.get('/marketing/audience', { params: { segmento } })
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener audiencia')
    }
  }

  async sendAnnouncement(data: {
    segmento: MarketingSegment
    asunto: string
    mensaje: string
    contactIds?: number[]
    templateImage?: string
    ctaText?: string
    ctaUrl?: string
  }): Promise<SendAnnouncementResponse> {
    try {
      const response = await apiClient.post('/marketing/send-announcement', data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al enviar anuncio')
    }
  }
}

export const marketingService = new MarketingService()
