import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '@/modules/auth/guards/jwt.guard'
import { marketingService } from './marketing.service'

const validSegments = ['todos', 'cliente_acepto', 'lead_rechazo'] as const

export class MarketingController {
  async getAudience(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const segmento = (req.query.segmento as string) || 'todos'
      if (!validSegments.includes(segmento as any)) {
        return res.status(400).json({ success: false, error: 'Segmento invalido' })
      }

      const audience = await marketingService.getAudience(segmento as any)
      res.status(200).json({
        success: true,
        data: audience,
        total: audience.length
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener audiencia'
      })
    }
  }

  async sendAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { segmento = 'todos', asunto, mensaje, contactIds, templateImage, ctaText, ctaUrl } = req.body
      if (!validSegments.includes(segmento)) {
        return res.status(400).json({ success: false, error: 'Segmento invalido' })
      }

      const result = await marketingService.sendAnnouncement({ segmento, asunto, mensaje, contactIds, templateImage, ctaText, ctaUrl })
      res.status(200).json({
        success: true,
        message: `Anuncio enviado a ${result.enviados} contacto(s)`,
        data: result
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Error al enviar anuncio'
      })
    }
  }
}

export const marketingController = new MarketingController()
