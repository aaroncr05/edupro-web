import { Response, NextFunction } from 'express'
import { z } from 'zod'
import { AuthenticatedRequest } from '@/modules/auth/guards/jwt.guard'
import { marketingService } from './marketing.service'

const SegmentEnum = z.enum(['todos', 'cliente_acepto', 'lead_rechazo'])

const SendAnnouncementSchema = z.object({
  segmento: SegmentEnum.default('todos'),
  asunto: z.string().min(1, 'El asunto es obligatorio').max(200),
  mensaje: z.string().min(1, 'El mensaje es obligatorio').max(5000),
  contactIds: z.array(z.number().int().positive()).optional(),
  templateImage: z.string().url().optional(),
  ctaText: z.string().max(100).optional(),
  ctaUrl: z.string().url('ctaUrl debe ser una URL válida').optional()
})

export class MarketingController {
  async getAudience(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const segmento = (req.query.segmento as string) || 'todos'
      const parsed = SegmentEnum.safeParse(segmento)
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: 'Segmento invalido' })
      }

      const audience = await marketingService.getAudience(parsed.data)
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
      const data = SendAnnouncementSchema.parse(req.body)
      const result = await marketingService.sendAnnouncement(data)
      res.status(200).json({
        success: true,
        message: `Anuncio enviado a ${result.enviados} contacto(s)`,
        data: result
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: 'Validación fallida', details: error.errors })
      }
      res.status(400).json({
        success: false,
        error: error.message || 'Error al enviar anuncio'
      })
    }
  }
}

export const marketingController = new MarketingController()
