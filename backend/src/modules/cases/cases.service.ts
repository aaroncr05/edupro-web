import { PrismaClient, CaseStatus, CasePriority } from '@prisma/client'
import { sendEmail } from '@/common/utils/email'
import { CreateCaseDTO } from './dto/create-case.dto'
import { UpdateCaseDTO } from './dto/update-case.dto'
import { CaseResponseDTO } from './dto/case-response.dto'

const prisma = new PrismaClient()

export class CasesService {
  private async notifySupportTeamAboutCase(caso: any) {
    const recipients = await prisma.usuario.findMany({
      where: {
        activo: true,
        rol: { nombre: { in: ['atencion_cliente', 'administrador'] } }
      },
      select: { id: true }
    })

    if (recipients.length === 0) return

    await prisma.notificacion.createMany({
      data: recipients.map((recipient) => ({
        idUsuario: recipient.id,
        tipo: 'nuevo_caso_postventa',
        titulo: 'Nuevo caso post-venta',
        mensaje: `${caso.cliente?.nombre || 'Cliente'} registro el caso ${caso.numeroCaso}: ${caso.titulo}`,
        enlace: `/cases?case=${caso.id}`
      }))
    })
  }

  /**
   * Obtener todos los casos con paginación y filtros
   */
  async getAllCases(
    page: number = 1,
    limit: number = 10,
    filters?: {
      estado?: CaseStatus
      prioridad?: CasePriority
      idResponsable?: number
      idCliente?: number
    }
  ): Promise<{
    data: CaseResponseDTO[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }> {
    const skip = (page - 1) * limit

    const where: any = {}
    if (filters?.estado) where.estadoCaso = filters.estado
    if (filters?.prioridad) where.prioridad = filters.prioridad
    if (filters?.idResponsable) where.idResponsable = filters.idResponsable
    if (filters?.idCliente) where.idCliente = filters.idCliente

    const [casos, total] = await Promise.all([
      prisma.casoPostVenta.findMany({
        where,
        skip,
        take: limit,
        include: {
          cliente: {
            select: { id: true, nombre: true, email: true, telefono: true, empresa: true }
          },
          cotizacion: {
            select: { id: true, numeroCotizacion: true }
          },
          responsable: {
            select: { id: true, nombre: true, email: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.casoPostVenta.count({ where })
    ])

    return {
      data: casos.map(c => this.mapCaseToResponse(c)),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Obtener caso por ID
   */
  async getCaseById(caseId: number): Promise<CaseResponseDTO> {
    const caso = await prisma.casoPostVenta.findUnique({
      where: { id: caseId },
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true, empresa: true }
        },
        cotizacion: {
          select: { id: true, numeroCotizacion: true }
        },
        responsable: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    if (!caso) {
      throw new Error('Caso no encontrado')
    }

    return this.mapCaseToResponse(caso)
  }

  /**
   * Obtener caso por número
   */
  async getCaseByNumber(numeroCaso: string): Promise<CaseResponseDTO | null> {
    const caso = await prisma.casoPostVenta.findUnique({
      where: { numeroCaso },
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true, empresa: true }
        },
        cotizacion: {
          select: { id: true, numeroCotizacion: true }
        },
        responsable: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    return caso ? this.mapCaseToResponse(caso) : null
  }

  /**
   * Crear nuevo caso
   */
  async createCase(data: CreateCaseDTO): Promise<CaseResponseDTO> {
    // Verificar que el cliente existe
    const cliente = await prisma.clienteLead.findUnique({
      where: { id: data.idCliente }
    })

    if (!cliente) {
      throw new Error('El cliente no existe')
    }

    // Verificar que la cotización existe si se proporciona
    if (data.idCotizacion) {
      const cotizacion = await prisma.cotizacion.findUnique({
        where: { id: data.idCotizacion }
      })

      if (!cotizacion) {
        throw new Error('La cotización no existe')
      }
    }

    // Verificar que el responsable existe si se proporciona
    if (data.idResponsable) {
      const responsable = await prisma.usuario.findUnique({
        where: { id: data.idResponsable }
      })

      if (!responsable) {
        throw new Error('El responsable no existe')
      }
    }

    // Verificar que el número de caso es único
    const existingCase = await prisma.casoPostVenta.findUnique({
      where: { numeroCaso: data.numeroCaso }
    })

    if (existingCase) {
      throw new Error('El número de caso ya está en uso')
    }

    // Crear caso
    const caso = await prisma.casoPostVenta.create({
      data: {
        numeroCaso: data.numeroCaso,
        idCliente: data.idCliente,
        idCotizacion: data.idCotizacion,
        titulo: data.titulo,
        descripcion: data.descripcion,
        prioridad: data.prioridad || 'medio',
        idResponsable: data.idResponsable,
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : undefined,
        estadoCaso: 'abierto'
      },
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true, empresa: true }
        },
        cotizacion: {
          select: { id: true, numeroCotizacion: true }
        },
        responsable: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    this.sendCaseTicketNotification(caso).catch((error) => {
      console.error('Error enviando ticket de soporte por correo:', error)
    })

    this.notifySupportTeamAboutCase(caso).catch((error) => {
      console.error('Error notificando nuevo caso post-venta:', error)
    })

    return this.mapCaseToResponse(caso)
  }

  /**
   * Actualizar caso
   */
  async updateCase(caseId: number, data: UpdateCaseDTO): Promise<CaseResponseDTO> {
    // Verificar que el caso existe
    const caso = await prisma.casoPostVenta.findUnique({
      where: { id: caseId }
    })

    if (!caso) {
      throw new Error('Caso no encontrado')
    }

    // Verificar que el responsable existe si se proporciona
    if (data.idResponsable) {
      const responsable = await prisma.usuario.findUnique({
        where: { id: data.idResponsable }
      })

      if (!responsable) {
        throw new Error('El responsable no existe')
      }
    }

    // Actualizar caso
    const casoActualizado = await prisma.casoPostVenta.update({
      where: { id: caseId },
      data: {
        titulo: data.titulo ?? caso.titulo,
        descripcion: data.descripcion ?? caso.descripcion,
        resolucion: data.resolucion ?? caso.resolucion,
        prioridad: data.prioridad ?? caso.prioridad,
        idResponsable: data.idResponsable ?? caso.idResponsable,
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : caso.fechaVencimiento
      },
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true, empresa: true }
        },
        cotizacion: {
          select: { id: true, numeroCotizacion: true }
        },
        responsable: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    return this.mapCaseToResponse(casoActualizado)
  }

  /**
   * Cambiar estado del caso
   */
  async changeCaseStatus(
    caseId: number,
    newStatus: CaseStatus,
    observation?: string,
    resolution?: string
  ): Promise<CaseResponseDTO> {
    // Verificar que el caso existe
    const caso = await prisma.casoPostVenta.findUnique({
      where: { id: caseId }
    })

    if (!caso) {
      throw new Error('Caso no encontrado')
    }

    // Actualizar estado
    const updateData: any = {
      estadoCaso: newStatus
    }

    if (newStatus === 'cerrado' && !caso.cerradoEn) {
      updateData.cerradoEn = new Date()
    }

    if (['resuelto', 'cerrado'].includes(newStatus) && resolution) {
      updateData.resolucion = resolution
    }

    if (newStatus === 'reabierto') {
      updateData.resolucion = null
      updateData.cerradoEn = null
    }

    const casoActualizado = await prisma.casoPostVenta.update({
      where: { id: caseId },
      data: updateData,
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true, empresa: true }
        },
        cotizacion: {
          select: { id: true, numeroCotizacion: true }
        },
        responsable: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    return this.mapCaseToResponse(casoActualizado)
  }

  /**
   * Asignar caso a responsable
   */
  async assignCaseToResponsible(caseId: number, responsibleId: number): Promise<CaseResponseDTO> {
    // Verificar que el caso existe
    const caso = await prisma.casoPostVenta.findUnique({
      where: { id: caseId }
    })

    if (!caso) {
      throw new Error('Caso no encontrado')
    }

    // Verificar que el responsable existe
    const responsable = await prisma.usuario.findUnique({
      where: { id: responsibleId }
    })

    if (!responsable) {
      throw new Error('El responsable no existe')
    }

    // Asignar caso
    const casoActualizado = await prisma.casoPostVenta.update({
      where: { id: caseId },
      data: { idResponsable: responsibleId },
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true, empresa: true }
        },
        cotizacion: {
          select: { id: true, numeroCotizacion: true }
        },
        responsable: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    return this.mapCaseToResponse(casoActualizado)
  }

  /**
   * Obtener casos por estado
   */
  async getCasesByStatus(status: CaseStatus): Promise<CaseResponseDTO[]> {
    const casos = await prisma.casoPostVenta.findMany({
      where: { estadoCaso: status },
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true, empresa: true }
        },
        cotizacion: {
          select: { id: true, numeroCotizacion: true }
        },
        responsable: {
          select: { id: true, nombre: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return casos.map(c => this.mapCaseToResponse(c))
  }

  /**
   * Obtener casos por prioridad
   */
  async getCasesByPriority(priority: CasePriority): Promise<CaseResponseDTO[]> {
    const casos = await prisma.casoPostVenta.findMany({
      where: { prioridad: priority },
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true, empresa: true }
        },
        cotizacion: {
          select: { id: true, numeroCotizacion: true }
        },
        responsable: {
          select: { id: true, nombre: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return casos.map(c => this.mapCaseToResponse(c))
  }

  /**
   * Obtener casos de un cliente
   */
  async getCasesByClient(clientId: number): Promise<CaseResponseDTO[]> {
    const casos = await prisma.casoPostVenta.findMany({
      where: { idCliente: clientId },
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true, empresa: true }
        },
        cotizacion: {
          select: { id: true, numeroCotizacion: true }
        },
        responsable: {
          select: { id: true, nombre: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return casos.map(c => this.mapCaseToResponse(c))
  }

  /**
   * Obtener casos de un responsable
   */
  async getCasesByResponsible(responsibleId: number): Promise<CaseResponseDTO[]> {
    const casos = await prisma.casoPostVenta.findMany({
      where: { idResponsable: responsibleId },
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true, empresa: true }
        },
        cotizacion: {
          select: { id: true, numeroCotizacion: true }
        },
        responsable: {
          select: { id: true, nombre: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return casos.map(c => this.mapCaseToResponse(c))
  }

  /**
   * Eliminar caso
   */
  async deleteCase(caseId: number): Promise<{ message: string }> {
    const caso = await prisma.casoPostVenta.findUnique({
      where: { id: caseId }
    })

    if (!caso) {
      throw new Error('Caso no encontrado')
    }

    await prisma.casoPostVenta.delete({
      where: { id: caseId }
    })

    return { message: 'Caso eliminado exitosamente' }
  }

  async sendResolutionDocumentation(caseId: number): Promise<{
    sent: boolean
    message: string
    caseId: number
  }> {
    const caso = await prisma.casoPostVenta.findUnique({
      where: { id: caseId },
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true, telefono: true, empresa: true }
        },
        responsable: {
          select: { id: true, nombre: true, email: true }
        },
        cotizacion: {
          select: { id: true, numeroCotizacion: true }
        }
      }
    })

    if (!caso) {
      throw new Error('Caso no encontrado')
    }

    if (!['resuelto', 'cerrado'].includes(caso.estadoCaso)) {
      throw new Error('Solo se puede enviar documentacion de casos resueltos o cerrados')
    }

    if (!caso.resolucion) {
      throw new Error('Registra la resolucion aplicada antes de enviar la documentacion')
    }

    if (!caso.cliente.email) {
      throw new Error('El cliente no tiene correo registrado')
    }

    await sendEmail({
      to: caso.cliente.email,
      subject: `Documentacion de resolucion - Caso ${caso.numeroCaso}`,
      html: `
          <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
            <h2 style="color: #01103B;">Documentacion de resolucion</h2>
            <p>Hola <strong>${caso.cliente.nombre}</strong>,</p>
            <p>Te compartimos el resumen del caso <strong>${caso.numeroCaso}</strong>.</p>
            <p><strong>Asunto:</strong> ${caso.titulo}</p>
            <p><strong>Estado:</strong> ${caso.estadoCaso}</p>
            <p><strong>Resolucion aplicada:</strong></p>
            <div style="padding: 16px; border-radius: 12px; background: #f0fdf4; border: 1px solid #bbf7d0;">
              ${caso.resolucion}
            </div>
            <p style="margin-top: 20px;">Si necesitas soporte adicional, responde este correo o comunicate con nuestro equipo.</p>
            <p>Saludos,<br/><strong>Equipo EduPro</strong></p>
          </div>
        `
    })

    return {
      sent: true,
      message: 'Documentacion enviada al correo. WhatsApp queda listo para envio manual desde el CRM.',
      caseId
    }
  }

  private async sendCaseTicketNotification(caso: any) {
    if (!caso?.cliente?.email) return

    await sendEmail({
      to: caso.cliente.email,
      subject: `Ticket de soporte creado - Caso ${caso.numeroCaso}`,
      html: `
          <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
            <div style="background: #01103B; color: white; padding: 22px; border-radius: 18px 18px 0 0;">
              <p style="margin: 0; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; opacity: .8;">Ticket de soporte</p>
              <h2 style="margin: 6px 0 0; font-size: 26px;">${caso.numeroCaso}</h2>
            </div>
            <div style="border: 1px solid #dfe6f2; border-top: 0; border-radius: 0 0 18px 18px; padding: 22px;">
              <p>Hola <strong>${caso.cliente.nombre}</strong>,</p>
              <p>Hemos registrado tu caso de soporte correctamente. Este es tu numero de ticket para seguimiento:</p>
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 16px; margin: 18px 0;">
                <p style="margin: 0 0 8px;"><strong>Ticket:</strong> ${caso.numeroCaso}</p>
                <p style="margin: 0 0 8px;"><strong>Asunto:</strong> ${caso.titulo}</p>
                <p style="margin: 0 0 8px;"><strong>Prioridad:</strong> ${caso.prioridad}</p>
                <p style="margin: 0;"><strong>Estado:</strong> abierto</p>
              </div>
              <p><strong>Descripcion registrada:</strong></p>
              <p style="background: #f8fafc; border-radius: 12px; padding: 14px;">${caso.descripcion}</p>
              <p>Nuestro equipo revisara tu solicitud y te notificara cuando el caso sea actualizado o resuelto.</p>
              <p>Saludos,<br/><strong>Equipo EduPro</strong></p>
            </div>
          </div>
        `
    })
  }

  /**
   * Mapear caso a DTO de respuesta
   */
  private mapCaseToResponse(caso: any): CaseResponseDTO {
    return {
      id: caso.id,
      numeroCaso: caso.numeroCaso,
      cliente: {
        id: caso.cliente.id,
        nombre: caso.cliente.nombre,
        email: caso.cliente.email,
        telefono: caso.cliente.telefono,
        empresa: caso.cliente.empresa
      },
      cotizacion: caso.cotizacion
        ? {
            id: caso.cotizacion.id,
            numeroCotizacion: caso.cotizacion.numeroCotizacion
          }
        : undefined,
      titulo: caso.titulo,
      descripcion: caso.descripcion,
      resolucion: caso.resolucion,
      estado: caso.estadoCaso,
      prioridad: caso.prioridad,
      responsable: caso.responsable
        ? {
            id: caso.responsable.id,
            nombre: caso.responsable.nombre,
            email: caso.responsable.email
          }
        : undefined,
      fechaVencimiento: caso.fechaVencimiento,
      cerradoEn: caso.cerradoEn,
      createdAt: caso.createdAt,
      updatedAt: caso.updatedAt
    }
  }
}

export const casesService = new CasesService()
