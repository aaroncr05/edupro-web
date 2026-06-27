import { PrismaClient } from '@prisma/client'
import { sendEmail } from '@/common/utils/email'

const prisma = new PrismaClient()

type MarketingSegment = 'todos' | 'cliente_acepto' | 'lead_rechazo'

export class MarketingService {
  private buildWhere(segmento: MarketingSegment) {
    const where: any = {
      email: { not: '' }
    }

    if (segmento === 'lead_rechazo') {
      where.OR = [
        { estadoLead: { in: ['rechazado', 'perdido'] } },
        { cotizaciones: { some: { estadoCotizacion: 'rechazada' } } }
      ]
    } else if (segmento !== 'todos') {
      where.habilitadoMarketing = true
      where.segmentoMarketing = segmento
    } else {
      where.habilitadoMarketing = true
    }

    return where
  }

  async getAudience(segmento: MarketingSegment = 'todos') {
    if (segmento === 'lead_rechazo') {
      await prisma.clienteLead.updateMany({
        where: {
          segmentoMarketing: 'lead_rechazo',
          NOT: {
            OR: [
              { estadoLead: { in: ['rechazado', 'perdido'] } },
              { cotizaciones: { some: { estadoCotizacion: 'rechazada' } } }
            ]
          }
        },
        data: {
          segmentoMarketing: null
        }
      })

      await prisma.clienteLead.updateMany({
        where: {
          email: { not: '' },
          OR: [
            { estadoLead: { in: ['rechazado', 'perdido'] } },
            { cotizaciones: { some: { estadoCotizacion: 'rechazada' } } }
          ]
        },
        data: {
          segmentoMarketing: 'lead_rechazo',
          habilitadoMarketing: true
        }
      })
    }

    const contacts = await prisma.clienteLead.findMany({
      where: this.buildWhere(segmento),
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        empresa: true,
        estadoLead: true,
        esCliente: true,
        segmentoMarketing: true,
        fechaIngresoMarketing: true,
        ultimoEnvioMarketing: true
      },
      orderBy: [
        { fechaIngresoMarketing: 'desc' },
        { updatedAt: 'desc' }
      ]
    })

    return contacts
  }

  async sendAnnouncement(data: { segmento: MarketingSegment; asunto: string; mensaje: string; contactIds?: number[]; templateImage?: string; ctaText?: string; ctaUrl?: string }) {
    const segmento = data.segmento || 'todos'
    const asunto = data.asunto?.trim()
    const mensaje = data.mensaje?.trim()

    if (!asunto || !mensaje) {
      throw new Error('El asunto y el mensaje son obligatorios')
    }

    let contacts = await this.getAudience(segmento)
    if (data.contactIds && data.contactIds.length > 0) {
      const selectedIds = new Set(data.contactIds)
      contacts = contacts.filter((contact) => selectedIds.has(contact.id))
    }
    if (contacts.length === 0) {
      throw new Error('No hay contactos en esta audiencia')
    }

    const sentIds: number[] = []
    const failed: Array<{ id: number; email: string; error: string }> = []

    for (const contact of contacts) {
      try {
        await sendEmail({
          to: contact.email,
          subject: asunto,
          html: `
            <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827;">
              <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
                ${data.templateImage ? `<img src="${data.templateImage}" alt="EduPro" style="width:100%;height:220px;object-fit:cover;display:block;" />` : ''}
                <div style="background:#01103B;padding:24px;color:#ffffff;">
                  <div style="display:inline-block;background:#FF7101;color:#ffffff;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700;">Digitales EduPro</div>
                  <h1 style="margin:16px 0 0;font-size:26px;line-height:1.2;">${asunto}</h1>
                </div>
                <div style="padding:28px;line-height:1.7;">
                  <p style="font-size:16px;margin:0 0 16px;">Hola <strong>${contact.nombre}</strong>,</p>
                  <div style="font-size:15px;color:#374151;">${mensaje.replace(/\n/g, '<br />')}</div>
                  ${data.ctaUrl ? `<a href="${data.ctaUrl}" style="display:inline-block;margin-top:24px;background:#FF7101;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">${data.ctaText || 'Ver mas'}</a>` : ''}
                  <p style="margin-top:28px;color:#6b7280;font-size:13px;">Equipo EduPro<br/>Soluciones digitales para empresas</p>
                </div>
              </div>
            </div>
          `
        })

        await prisma.clienteLead.update({
          where: { id: contact.id },
          data: { ultimoEnvioMarketing: new Date() }
        })

        await prisma.seguimientoLead.create({
          data: {
            idLead: contact.id,
            tipoSeguimiento: 'email',
            descripcion: `Promocion/anuncio enviado: ${asunto}`
          }
        })

        sentIds.push(contact.id)
      } catch (error: any) {
        failed.push({
          id: contact.id,
          email: contact.email,
          error: error.message || 'Error al enviar correo'
        })
      }
    }

    return {
      segmento,
      total: contacts.length,
      enviados: sentIds.length,
      fallidos: failed.length,
      fallidosDetalle: failed
    }
  }

  async sendRejectedLeadWinbackCampaign(daysAfterRejection: number = 15) {
    const cutoff = new Date(Date.now() - daysAfterRejection * 24 * 60 * 60 * 1000)

    const contacts = await prisma.clienteLead.findMany({
      where: {
        estadoLead: 'rechazado',
        habilitadoMarketing: true,
        segmentoMarketing: 'lead_rechazo',
        email: { not: '' },
        fechaIngresoMarketing: { lte: cutoff },
        OR: [
          { ultimoEnvioMarketing: null },
          { ultimoEnvioMarketing: { lte: cutoff } }
        ]
      },
      select: { id: true },
      orderBy: { fechaIngresoMarketing: 'asc' },
      take: Number(process.env.MARKETING_WINBACK_BATCH_SIZE || 50)
    })

    if (contacts.length === 0) {
      return {
        segmento: 'lead_rechazo',
        total: 0,
        enviados: 0,
        fallidos: 0,
        fallidosDetalle: []
      }
    }

    return this.sendAnnouncement({
      segmento: 'lead_rechazo',
      contactIds: contacts.map((contact) => contact.id),
      asunto: process.env.MARKETING_WINBACK_SUBJECT || 'Tenemos una nueva propuesta para ti',
      mensaje: process.env.MARKETING_WINBACK_MESSAGE ||
        'Sabemos que antes no era el momento ideal. Por eso preparamos nuevas opciones y promociones para ayudarte a avanzar con tu proyecto digital.',
      ctaText: process.env.MARKETING_WINBACK_CTA_TEXT || 'Solicitar nueva propuesta',
      ctaUrl: process.env.MARKETING_WINBACK_CTA_URL || ''
    })
  }
}

export const marketingService = new MarketingService()
