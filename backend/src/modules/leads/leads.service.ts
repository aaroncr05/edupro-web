import { PrismaClient, LeadStatus } from '@prisma/client'
import { CreateLeadDTO } from './dto/create-lead.dto'
import { UpdateLeadDTO } from './dto/update-lead.dto'
import { CreateFollowupDTO } from './dto/create-followup.dto'
import { LeadResponseDTO } from './dto/lead-response.dto'
import { quotationsService } from '@/modules/quotations/quotations.service'

const prisma = new PrismaClient()

const LEAD_PROBABILITY_BY_STATUS: Partial<Record<LeadStatus, number>> = {
  nuevo: 10,
  contactado: 25,
  interesado: 45,
  calificado: 55,
  propuesta_enviada: 60,
  negociacion: 75,
  convertido: 100,
  rechazado: 0,
  perdido: 0
}

export class LeadsService {
  private shouldAutoSendQuotation() {
    return String(process.env.AUTO_SEND_QUOTATION_ON_LEAD_CREATE || '').toLowerCase() === 'true'
  }

  private generateQuotationNumber(leadId: number) {
    const stamp = Date.now().toString().slice(-8)
    return `COT-AUTO-${leadId}-${stamp}`
  }

  private async createAndSendInitialQuotation(lead: any) {
    if (!this.shouldAutoSendQuotation()) return

    const defaultAmount = Number(process.env.AUTO_QUOTATION_DEFAULT_AMOUNT || lead.presupuesto || 0)
    const itemDescription = process.env.AUTO_QUOTATION_ITEM_DESCRIPTION || 'Propuesta inicial EduPro según solicitud registrada'

    if (!Number.isFinite(defaultAmount) || defaultAmount <= 0) {
      await prisma.seguimientoLead.create({
        data: {
          idLead: lead.id,
          tipoSeguimiento: 'email',
          descripcion: 'Cotización automática pendiente: el lead no tiene presupuesto o monto base configurado.'
        }
      })
      return
    }

    try {
      const quotation = await quotationsService.createQuotation({
        idLead: lead.id,
        numeroCotizacion: this.generateQuotationNumber(lead.id),
        montoTotal: defaultAmount,
        moneda: process.env.AUTO_QUOTATION_CURRENCY || 'PEN',
        notas: 'Cotización generada automáticamente al registrar el lead.'
      })

      await quotationsService.addQuotationItem(quotation.id, {
        descripcion: itemDescription,
        cantidad: 1,
        precioUnitario: defaultAmount
      })

      await quotationsService.sendQuotationByEmail(quotation.id)
    } catch (error) {
      console.error('Error generando/enviando cotización automática del lead:', error)
      await prisma.seguimientoLead.create({
        data: {
          idLead: lead.id,
          tipoSeguimiento: 'email',
          descripcion: 'No se pudo generar o enviar la cotización automática. Revisar configuración de correo.'
        }
      }).catch(() => undefined)
    }
  }

  private async scheduleFollowupAutomation(lead: any, userId: number | undefined, data: CreateFollowupDTO) {
    if (!data.fechaProximaAccion) return

    const nextRun = new Date(data.fechaProximaAccion)
    if (Number.isNaN(nextRun.getTime())) return

    await prisma.tareaAutomatizada.create({
      data: {
        nombre: `Seguimiento automático - ${lead.nombre}`,
        descripcion: data.proximaAccion || data.descripcion,
        workflowId: 'internal-lead-followup-reminder',
        tipoTrigger: 'lead_followup_due',
        createdBy: userId,
        proximaEjecucion: nextRun
      }
    })
  }

  /**
   * Obtener todos los leads con paginación
   */
  async getAllLeads(
    page: number = 1,
    limit: number = 10,
    filters?: {
      estado?: LeadStatus
      probabilidad?: number
      idAsesor?: number
    }
  ): Promise<{
    data: LeadResponseDTO[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }> {
    const skip = (page - 1) * limit

    const where: any = {}
    if (filters?.estado) where.estadoLead = filters.estado
    if (filters?.idAsesor) where.idAsesor = filters.idAsesor
    if (filters?.probabilidad !== undefined) where.probabilidad = { gte: filters.probabilidad }

    const [leads, total] = await Promise.all([
      prisma.clienteLead.findMany({
        where,
        skip,
        take: limit,
        include: {
          asesor: {
            select: { id: true, nombre: true, email: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.clienteLead.count({ where })
    ])

    return {
      data: leads.map(l => this.mapLeadToResponse(l)),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Obtener lead por ID
   */
  async getLeadById(leadId: number): Promise<LeadResponseDTO> {
    const lead = await prisma.clienteLead.findUnique({
      where: { id: leadId },
      include: {
        asesor: {
          select: { id: true, nombre: true, email: true }
        },
        cotizaciones: true,
        seguimientos: true,
        casosPostVenta: true
      }
    })

    if (!lead) {
      throw new Error('Lead no encontrado')
    }

    return this.mapLeadToResponse(lead)
  }

  /**
   * Obtener lead por email
   */
  async getLeadByEmail(email: string): Promise<LeadResponseDTO | null> {
    const lead = await prisma.clienteLead.findUnique({
      where: { email },
      include: {
        asesor: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    return lead ? this.mapLeadToResponse(lead) : null
  }

  /**
   * Crear nuevo lead
   */
  async createLead(data: CreateLeadDTO): Promise<LeadResponseDTO> {
    // Verificar si el email ya existe
    const existingLead = await prisma.clienteLead.findUnique({
      where: { email: data.email }
    })

    if (existingLead) {
      throw new Error('El email del lead ya está registrado')
    }

    // Verificar que el asesor existe si se proporciona
    if (data.idAsesor) {
      const asesor = await prisma.usuario.findUnique({
        where: { id: data.idAsesor }
      })

      if (!asesor) {
        throw new Error('El asesor no existe')
      }
    }

    // Crear lead
    const lead = await prisma.clienteLead.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        empresa: data.empresa,
        cargo: data.cargo,
        presupuesto: data.presupuesto ? new Prisma.Decimal(data.presupuesto) : undefined,
        estadoLead: 'nuevo',
        probabilidad: data.probabilidad ?? LEAD_PROBABILITY_BY_STATUS.nuevo ?? 10,
        idAsesor: data.idAsesor,
        notas: data.notas
      },
      include: {
        asesor: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    this.createAndSendInitialQuotation(lead).catch((error) => {
      console.error('Error en automatizacion de cotizacion inicial:', error)
    })

    return this.mapLeadToResponse(lead)
  }

  /**
   * Actualizar lead
   */
  async updateLead(leadId: number, data: UpdateLeadDTO): Promise<LeadResponseDTO> {
    // Verificar que el lead existe
    const lead = await prisma.clienteLead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      throw new Error('Lead no encontrado')
    }

    // Verificar que el asesor existe si se proporciona
    if (data.idAsesor) {
      const asesor = await prisma.usuario.findUnique({
        where: { id: data.idAsesor }
      })

      if (!asesor) {
        throw new Error('El asesor no existe')
      }
    }

    // Verificar email único si se actualiza
    if (data.email && data.email !== lead.email) {
      const existingLead = await prisma.clienteLead.findUnique({
        where: { email: data.email }
      })

      if (existingLead) {
        throw new Error('El email ya está en uso')
      }
    }
    // Actualizar lead
    const leadActualizado = await prisma.clienteLead.update({
      where: { id: leadId },
      data: {
        nombre: data.nombre ?? lead.nombre,
        email: data.email ?? lead.email,
        telefono: data.telefono ?? lead.telefono,
        empresa: data.empresa ?? lead.empresa,
        cargo: data.cargo ?? lead.cargo,
        presupuesto: data.presupuesto
          ? new Prisma.Decimal(data.presupuesto)
          : lead.presupuesto,
        probabilidad: data.probabilidad ?? lead.probabilidad,
        idAsesor: data.idAsesor ?? lead.idAsesor,
        notas: data.notas ?? lead.notas
      },
      include: {
        asesor: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    return this.mapLeadToResponse(leadActualizado)
  }

  /**
   * Cambiar estado del lead
   */
  async changeLeadStatus(
    leadId: number,
    newStatus: LeadStatus,
    observation?: string
  ): Promise<LeadResponseDTO> {
    // Verificar que el lead existe
    const lead = await prisma.clienteLead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      throw new Error('Lead no encontrado')
    }

    const updateData: any = {
      estadoLead: newStatus,
      probabilidad: LEAD_PROBABILITY_BY_STATUS[newStatus] ?? lead.probabilidad
    }

    if (newStatus === 'convertido' && !lead.esCliente) {
      updateData.esCliente = true
      updateData.convertidoClienteEn = new Date()
      updateData.habilitadoMarketing = true
      updateData.segmentoMarketing = 'cliente_acepto'
      updateData.fechaIngresoMarketing = new Date()
    } else if (newStatus === 'rechazado') {
      updateData.habilitadoMarketing = true
      updateData.segmentoMarketing = 'lead_rechazo'
      updateData.fechaIngresoMarketing = lead.fechaIngresoMarketing || new Date()
    }

    // Actualizar estado
    const leadActualizado = await prisma.clienteLead.update({
      where: { id: leadId },
      data: updateData,
      include: {
        asesor: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    // Crear seguimiento si hay observación
    if (observation) {
      await prisma.seguimientoLead.create({
        data: {
          idLead: leadId,
          tipoSeguimiento: 'email',
          descripcion: `Cambio de estado a ${newStatus}: ${observation}`
        }
      })
    }

    return this.mapLeadToResponse(leadActualizado)
  }

  async getLeadFollowups(leadId: number) {
    const lead = await prisma.clienteLead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      throw new Error('Lead no encontrado')
    }

    return await prisma.seguimientoLead.findMany({
      where: { idLead: leadId },
      include: {
        usuario: {
          select: { id: true, nombre: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async createLeadFollowup(leadId: number, userId: number | undefined, data: CreateFollowupDTO) {
    const lead = await prisma.clienteLead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      throw new Error('Lead no encontrado')
    }

    const followup = await prisma.seguimientoLead.create({
      data: {
        idLead: leadId,
        idUsuario: userId,
        tipoSeguimiento: data.tipoSeguimiento,
        descripcion: data.descripcion,
        resultado: data.resultado,
        proximaAccion: data.proximaAccion,
        fechaProximaAccion: data.fechaProximaAccion ? new Date(data.fechaProximaAccion) : undefined
      },
      include: {
        usuario: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    await this.scheduleFollowupAutomation(lead, userId, data)

    return followup
  }

  /**
   * Obtener leads por asesor
   */
  async getLeadsByAdvisor(advisorId: number): Promise<LeadResponseDTO[]> {
    const leads = await prisma.clienteLead.findMany({
      where: { idAsesor: advisorId },
      include: {
        asesor: {
          select: { id: true, nombre: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return leads.map(l => this.mapLeadToResponse(l))
  }

  /**
   * Obtener leads por estado
   */
  async getLeadsByStatus(status: LeadStatus): Promise<LeadResponseDTO[]> {
    const leads = await prisma.clienteLead.findMany({
      where: { estadoLead: status },
      include: {
        asesor: {
          select: { id: true, nombre: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return leads.map(l => this.mapLeadToResponse(l))
  }

  /**
   * Obtener leads por probabilidad mínima
   */
  async getLeadsByProbability(minProbability: number): Promise<LeadResponseDTO[]> {
    const leads = await prisma.clienteLead.findMany({
      where: { probabilidad: { gte: minProbability } },
      include: {
        asesor: {
          select: { id: true, nombre: true, email: true }
        }
      },
      orderBy: { probabilidad: 'desc' }
    })

    return leads.map(l => this.mapLeadToResponse(l))
  }

  /**
   * Eliminar lead
   */
  async deleteLead(leadId: number): Promise<{ message: string }> {
    const lead = await prisma.clienteLead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      throw new Error('Lead no encontrado')
    }

    await prisma.clienteLead.delete({
      where: { id: leadId }
    })

    return { message: 'Lead eliminado exitosamente' }
  }

  /**
   * Asignar lead a asesor
   */
  async assignLeadToAdvisor(leadId: number, advisorId: number): Promise<LeadResponseDTO> {
    // Verificar que el lead existe
    const lead = await prisma.clienteLead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      throw new Error('Lead no encontrado')
    }

    // Verificar que el asesor existe
    const asesor = await prisma.usuario.findUnique({
      where: { id: advisorId }
    })

    if (!asesor) {
      throw new Error('El asesor no existe')
    }

    // Asignar lead
    const leadActualizado = await prisma.clienteLead.update({
      where: { id: leadId },
      data: { idAsesor: advisorId },
      include: {
        asesor: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    return this.mapLeadToResponse(leadActualizado)
  }

  /**
   * Mapear lead a DTO de respuesta
   */
  private mapLeadToResponse(lead: any): LeadResponseDTO {
    return {
      id: lead.id,
      nombre: lead.nombre,
      email: lead.email,
      telefono: lead.telefono,
      empresa: lead.empresa,
      cargo: lead.cargo,
      presupuesto: lead.presupuesto ? Number(lead.presupuesto) : undefined,
      estadoLead: lead.estadoLead,
      probabilidad: lead.probabilidad,
      esCliente: lead.esCliente,
      convertidoClienteEn: lead.convertidoClienteEn,
      habilitadoMarketing: lead.habilitadoMarketing,
      segmentoMarketing: lead.segmentoMarketing,
      fechaIngresoMarketing: lead.fechaIngresoMarketing,
      ultimoEnvioMarketing: lead.ultimoEnvioMarketing,
      asesor: lead.asesor
        ? {
            id: lead.asesor.id,
            nombre: lead.asesor.nombre,
            email: lead.asesor.email
          }
        : undefined,
      notas: lead.notas,
      fechaContacto: lead.fechaContacto,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt
    }
  }
}

// Import Prisma para usar Decimal
import { Prisma } from '@prisma/client'

export const leadsService = new LeadsService()

