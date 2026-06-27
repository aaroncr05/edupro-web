import { PrismaClient, QuotationStatus, Prisma } from '@prisma/client'
import { sendEmail } from '@/common/utils/email'
import PDFDocument from 'pdfkit'
import { CreateQuotationDTO } from './dto/create-quotation.dto'
import { UpdateQuotationDTO } from './dto/update-quotation.dto'
import { QuotationResponseDTO } from './dto/quotation-response.dto'
import { AddQuotationItemDTO } from './dto/add-quotation-item.dto'

const prisma = new PrismaClient()

const formatMoney = (value: number, currency: string) =>
  `${currency} ${Number(value || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export class QuotationsService {
  private isSyntheticWhatsappEmail(email?: string) {
    return !email || email.toLowerCase().endsWith('@whatsapp.local')
  }

  private getQuotationReminderDate() {
    const minutes = Number(process.env.QUOTATION_REMINDER_DELAY_MINUTES || 0)
    if (minutes > 0) {
      return new Date(Date.now() + minutes * 60 * 1000)
    }

    const days = Number(process.env.QUOTATION_REMINDER_DELAY_DAYS || 2)
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  }

  private async scheduleQuotationReminder(quotation: QuotationResponseDTO) {
    if (!quotation.lead.email) return

    const reminderAt = this.getQuotationReminderDate()
    await prisma.tareaAutomatizada.create({
      data: {
        nombre: `Recordatorio de cotizacion - ${quotation.numeroCotizacion}`,
        descripcion: `Recordar al cliente ${quotation.lead.nombre} responder la cotizacion ${quotation.numeroCotizacion}`,
        workflowId: 'internal-quotation-response-reminder',
        tipoTrigger: 'quotation_response_reminder',
        proximaEjecucion: reminderAt
      }
    })
  }

  private assertEmailConfigured() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Correo no configurado. Agrega RESEND_API_KEY en las variables de entorno.')
    }
  }

  private generateQuotationPdfBuffer(quotation: QuotationResponseDTO): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 48 })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      doc
        .fontSize(22)
        .fillColor('#01103B')
        .text('EduPro', { continued: true })
        .fontSize(12)
        .fillColor('#FF7101')
        .text('  Cotizacion Profesional', { align: 'right' })

      doc.moveDown(1)
      doc
        .fontSize(18)
        .fillColor('#01103B')
        .text(`Cotizacion ${quotation.numeroCotizacion}`)

      doc
        .fontSize(10)
        .fillColor('#555555')
        .text(`Fecha: ${new Date(quotation.createdAt).toLocaleDateString('es-PE')}`)
        .text(`Estado: ${quotation.estado}`)

      doc.moveDown(1)
      doc
        .fontSize(12)
        .fillColor('#01103B')
        .text('Cliente', { underline: true })
        .moveDown(0.5)
        .fontSize(10)
        .fillColor('#333333')
        .text(`Nombre: ${quotation.lead.nombre}`)
        .text(`Empresa: ${quotation.lead.empresa || 'Cliente individual'}`)
        .text(`Email: ${quotation.lead.email}`)
        .text(`Telefono: ${quotation.lead.telefono || 'No especificado'}`)

      doc.moveDown(1.5)
      doc
        .fontSize(12)
        .fillColor('#01103B')
        .text('Detalle de servicios', { underline: true })
        .moveDown(0.75)

      if (quotation.items.length === 0) {
        doc.fontSize(10).fillColor('#555555').text('Sin items registrados.')
      } else {
        quotation.items.forEach((item, index) => {
          doc
            .fontSize(10)
            .fillColor('#01103B')
            .text(`${index + 1}. ${item.descripcion}`)
            .fillColor('#555555')
            .text(`Cantidad: ${item.cantidad}  |  Precio unitario: ${formatMoney(item.precioUnitario, quotation.moneda)}  |  Subtotal: ${formatMoney(item.subtotal, quotation.moneda)}`)
            .moveDown(0.5)
        })
      }

      doc.moveDown(1)
      doc
        .fontSize(14)
        .fillColor('#FF7101')
        .text(`Total: ${formatMoney(quotation.montoTotal, quotation.moneda)}`, { align: 'right' })

      if (quotation.notas) {
        doc.moveDown(1.5)
        doc
          .fontSize(12)
          .fillColor('#01103B')
          .text('Notas', { underline: true })
          .moveDown(0.5)
          .fontSize(10)
          .fillColor('#555555')
          .text(quotation.notas)
      }

      doc.moveDown(2)
      doc
        .fontSize(9)
        .fillColor('#777777')
        .text('Gracias por confiar en EduPro. Quedamos atentos para acompañarte en el siguiente paso.', {
          align: 'center'
        })

      doc.end()
    })
  }

  /**
   * Obtener todas las cotizaciones con paginación
   */
  async getAllQuotations(
    page: number = 1,
    limit: number = 10,
    filters?: {
      estado?: QuotationStatus
      idLead?: number
    }
  ): Promise<{
    data: QuotationResponseDTO[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }> {
    const skip = (page - 1) * limit

    const where: any = {}
    if (filters?.estado) where.estadoCotizacion = filters.estado
    if (filters?.idLead) where.idLead = filters.idLead

    const [cotizaciones, total] = await Promise.all([
      prisma.cotizacion.findMany({
        where,
        skip,
        take: limit,
        include: {
          lead: {
            select: { id: true, nombre: true, email: true, empresa: true, telefono: true }
          },
          items: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.cotizacion.count({ where })
    ])

    return {
      data: cotizaciones.map(c => this.mapQuotationToResponse(c)),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Obtener cotización por ID
   */
  async getQuotationById(quotationId: number): Promise<QuotationResponseDTO> {
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: quotationId },
      include: {
        lead: {
          select: { id: true, nombre: true, email: true, empresa: true, telefono: true }
        },
        items: true
      }
    })

    if (!cotizacion) {
      throw new Error('Cotización no encontrada')
    }

    return this.mapQuotationToResponse(cotizacion)
  }

  async sendQuotationByEmail(quotationId: number) {
    return this.sendQuotationByEmailDirect(quotationId)
  }

  async sendQuotationByEmailDirect(quotationId: number) {
    const quotation = await this.getQuotationById(quotationId)

    if (this.isSyntheticWhatsappEmail(quotation.lead.email)) {
      throw new Error('Este lead no tiene un correo real registrado. Actualiza el correo del cliente antes de enviar la cotizacion.')
    }

    this.assertEmailConfigured()
    const pdfBuffer = await this.generateQuotationPdfBuffer(quotation)

    await sendEmail({
      to: quotation.lead.email!,
      subject: `Cotizacion ${quotation.numeroCotizacion} - EduPro`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
          <h2 style="color: #01103B;">Hola ${quotation.lead.nombre},</h2>
          <p>Te compartimos la cotizacion <strong>${quotation.numeroCotizacion}</strong> preparada por EduPro.</p>
          <p><strong>Total:</strong> ${formatMoney(quotation.montoTotal, quotation.moneda)}</p>
          <p>Adjuntamos el PDF con el detalle de la propuesta para tu revision.</p>
          <p>Quedamos atentos a tus comentarios para avanzar con el siguiente paso.</p>
          <p style="margin-top: 24px;">Saludos,<br/><strong>Equipo Comercial EduPro</strong></p>
        </div>
      `,
      attachments: [{ filename: `Cotizacion_${quotation.numeroCotizacion}.pdf`, content: pdfBuffer }]
    })

    const updated = await this.changeQuotationStatus(
      quotationId,
      'enviada',
      `Cotizacion ${quotation.numeroCotizacion} enviada por correo a ${quotation.lead.email}.`
    )

    return {
      quotation: updated,
      sentTo: quotation.lead.email
    }
  }

  /**
   * Obtener cotización por número
   */
  async getQuotationByNumber(numeroCotizacion: string): Promise<QuotationResponseDTO | null> {
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { numeroCotizacion },
      include: {
        lead: {
          select: { id: true, nombre: true, email: true, empresa: true, telefono: true }
        },
        items: true
      }
    })

    return cotizacion ? this.mapQuotationToResponse(cotizacion) : null
  }

  /**
   * Crear nueva cotización
   */
  async createQuotation(data: CreateQuotationDTO): Promise<QuotationResponseDTO> {
    // Verificar que el lead existe
    const lead = await prisma.clienteLead.findUnique({
      where: { id: data.idLead }
    })

    if (!lead) {
      throw new Error('El lead no existe')
    }

    // Verificar que el número de cotización es único
    const existingQuotation = await prisma.cotizacion.findUnique({
      where: { numeroCotizacion: data.numeroCotizacion }
    })

    if (existingQuotation) {
      throw new Error('El número de cotización ya está en uso')
    }

    // Crear cotización
    const cotizacion = await prisma.cotizacion.create({
      data: {
        numeroCotizacion: data.numeroCotizacion,
        idLead: data.idLead,
        montoTotal: new Prisma.Decimal(data.montoTotal),
        moneda: data.moneda || 'COP',
        estadoCotizacion: 'borrador',
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : undefined,
        notas: data.notas
      },
      include: {
        lead: {
          select: { id: true, nombre: true, email: true, empresa: true, telefono: true }
        },
        items: true
      }
    })

    return this.mapQuotationToResponse(cotizacion)
  }

  /**
   * Actualizar cotización
   */
  async updateQuotation(quotationId: number, data: UpdateQuotationDTO): Promise<QuotationResponseDTO> {
    // Verificar que la cotización existe
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: quotationId }
    })

    if (!cotizacion) {
      throw new Error('Cotización no encontrada')
    }

    // Actualizar cotización
    const cotizacionActualizada = await prisma.cotizacion.update({
      where: { id: quotationId },
      data: {
        montoTotal: data.montoTotal ? new Prisma.Decimal(data.montoTotal) : cotizacion.montoTotal,
        moneda: data.moneda ?? cotizacion.moneda,
        notas: data.notas ?? cotizacion.notas,
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : cotizacion.fechaVencimiento
      },
      include: {
        lead: {
          select: { id: true, nombre: true, email: true, empresa: true, telefono: true }
        },
        items: true
      }
    })

    return this.mapQuotationToResponse(cotizacionActualizada)
  }

  /**
   * Cambiar estado de la cotización
   */
  async changeQuotationStatus(
    quotationId: number,
    newStatus: QuotationStatus,
    observation?: string
  ): Promise<QuotationResponseDTO> {
    // Verificar que la cotización existe
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: quotationId }
    })

    if (!cotizacion) {
      throw new Error('Cotización no encontrada')
    }

    // Actualizar timestamps según el estado
    const updateData: any = {
      estadoCotizacion: newStatus
    }

    if (newStatus === 'enviada' && !cotizacion.enviadoEn) {
      updateData.enviadoEn = new Date()
    } else if (newStatus === 'aceptada' && !cotizacion.aceptadoEn) {
      updateData.aceptadoEn = new Date()
    } else if (newStatus === 'rechazada' && !cotizacion.rechazadoEn) {
      updateData.rechazadoEn = new Date()
    }

    const cotizacionActualizada = await prisma.cotizacion.update({
      where: { id: quotationId },
      data: updateData,
      include: {
        lead: {
          select: { id: true, nombre: true, email: true, empresa: true, telefono: true }
        },
        items: true
      }
    })

    if (newStatus === 'enviada' && cotizacion.estadoCotizacion !== 'enviada') {
      await prisma.clienteLead.update({
        where: { id: cotizacion.idLead },
        data: {
          estadoLead: 'propuesta_enviada',
          probabilidad: 60
        }
      })
      await this.scheduleQuotationReminder(this.mapQuotationToResponse(cotizacionActualizada))
    } else if (newStatus === 'aceptada' && cotizacion.estadoCotizacion !== 'aceptada') {
      await prisma.clienteLead.update({
        where: { id: cotizacion.idLead },
        data: {
          estadoLead: 'convertido',
          probabilidad: 100,
          esCliente: true,
          convertidoClienteEn: new Date(),
          habilitadoMarketing: true,
          segmentoMarketing: 'cliente_acepto',
          fechaIngresoMarketing: new Date()
        }
      })
    } else if (newStatus === 'rechazada' && cotizacion.estadoCotizacion !== 'rechazada') {
      await prisma.clienteLead.update({
        where: { id: cotizacion.idLead },
        data: {
          estadoLead: 'rechazado',
          probabilidad: 0,
          habilitadoMarketing: true,
          segmentoMarketing: 'lead_rechazo',
          fechaIngresoMarketing: new Date()
        }
      })
    }

    // Registrar el cambio como seguimiento si hay observación
    if (observation) {
      await prisma.seguimientoLead.create({
        data: {
          idLead: cotizacion.idLead,
          tipoSeguimiento: 'email',
          descripcion: `Cotización ${cotizacion.numeroCotizacion} cambió a estado ${newStatus}: ${observation}`
        }
      })
    }

    return this.mapQuotationToResponse(cotizacionActualizada)
  }

  /**
   * Agregar item a la cotización
   */
  async addQuotationItem(
    quotationId: number,
    data: AddQuotationItemDTO
  ): Promise<QuotationResponseDTO> {
    // Verificar que la cotización existe
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: quotationId },
      include: { items: true }
    })

    if (!cotizacion) {
      throw new Error('Cotización no encontrada')
    }

    // Crear item
    const subtotal = new Prisma.Decimal(data.cantidad).times(new Prisma.Decimal(data.precioUnitario))

    await prisma.cotizacionItem.create({
      data: {
        idCotizacion: quotationId,
        descripcion: data.descripcion,
        cantidad: new Prisma.Decimal(data.cantidad),
        precioUnitario: new Prisma.Decimal(data.precioUnitario),
        subtotal: subtotal
      }
    })

    // Actualizar monto total de la cotización
    const nuevoMontoTotal = cotizacion.items.reduce((sum, item) => {
      return sum + new Prisma.Decimal(item.subtotal).toNumber()
    }, 0) + subtotal.toNumber()

    const cotizacionActualizada = await prisma.cotizacion.update({
      where: { id: quotationId },
      data: {
        montoTotal: new Prisma.Decimal(nuevoMontoTotal)
      },
      include: {
        lead: {
          select: { id: true, nombre: true, email: true, empresa: true, telefono: true }
        },
        items: true
      }
    })

    return this.mapQuotationToResponse(cotizacionActualizada)
  }

  /**
   * Eliminar item de la cotización
   */
  async removeQuotationItem(itemId: number): Promise<{ message: string }> {
    // Verificar que el item existe
    const item = await prisma.cotizacionItem.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      throw new Error('Item no encontrado')
    }

    // Obtener la cotización
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: item.idCotizacion },
      include: { items: true }
    })

    if (!cotizacion) {
      throw new Error('Cotización no encontrada')
    }

    // Eliminar item
    await prisma.cotizacionItem.delete({
      where: { id: itemId }
    })

    // Actualizar monto total
    const nuevoMontoTotal = cotizacion.items
      .filter(i => i.id !== itemId)
      .reduce((sum, i) => sum + new Prisma.Decimal(i.subtotal).toNumber(), 0)

    await prisma.cotizacion.update({
      where: { id: item.idCotizacion },
      data: {
        montoTotal: new Prisma.Decimal(nuevoMontoTotal)
      }
    })

    return { message: 'Item eliminado exitosamente' }
  }

  /**
   * Obtener cotizaciones por lead
   */
  async getQuotationsByLead(leadId: number): Promise<QuotationResponseDTO[]> {
    const cotizaciones = await prisma.cotizacion.findMany({
      where: { idLead: leadId },
      include: {
        lead: {
          select: { id: true, nombre: true, email: true, empresa: true, telefono: true }
        },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return cotizaciones.map(c => this.mapQuotationToResponse(c))
  }

  /**
   * Obtener cotizaciones por estado
   */
  async getQuotationsByStatus(status: QuotationStatus): Promise<QuotationResponseDTO[]> {
    const cotizaciones = await prisma.cotizacion.findMany({
      where: { estadoCotizacion: status },
      include: {
        lead: {
          select: { id: true, nombre: true, email: true, empresa: true, telefono: true }
        },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return cotizaciones.map(c => this.mapQuotationToResponse(c))
  }

  /**
   * Eliminar cotización
   */
  async deleteQuotation(quotationId: number): Promise<{ message: string }> {
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: quotationId }
    })

    if (!cotizacion) {
      throw new Error('Cotización no encontrada')
    }

    await prisma.cotizacion.delete({
      where: { id: quotationId }
    })

    return { message: 'Cotización eliminada exitosamente' }
  }

  /**
   * Mapear cotización a DTO de respuesta
   */
  private mapQuotationToResponse(cotizacion: any): QuotationResponseDTO {
    return {
      id: cotizacion.id,
      numeroCotizacion: cotizacion.numeroCotizacion,
      lead: {
        id: cotizacion.lead.id,
        nombre: cotizacion.lead.nombre,
        email: cotizacion.lead.email,
        empresa: cotizacion.lead.empresa,
        telefono: cotizacion.lead.telefono
      },
      montoTotal: cotizacion.montoTotal ? Number(cotizacion.montoTotal) : 0,
      moneda: cotizacion.moneda,
      estado: cotizacion.estadoCotizacion,
      items: cotizacion.items.map((item: any) => ({
        id: item.id,
        descripcion: item.descripcion,
        cantidad: Number(item.cantidad),
        precioUnitario: Number(item.precioUnitario),
        subtotal: Number(item.subtotal)
      })),
      pdfUrl: cotizacion.pdfUrl,
      notas: cotizacion.notas,
      fechaVencimiento: cotizacion.fechaVencimiento,
      enviadoEn: cotizacion.enviadoEn,
      aceptadoEn: cotizacion.aceptadoEn,
      rechazadoEn: cotizacion.rechazadoEn,
      createdAt: cotizacion.createdAt,
      updatedAt: cotizacion.updatedAt
    }
  }
}

export const quotationsService = new QuotationsService()
