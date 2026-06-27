import { PrismaClient } from '@prisma/client'
import cron, { ScheduledTask } from 'node-cron'
import nodemailer from 'nodemailer'
import { marketingService } from '@/modules/marketing/marketing.service'

const prisma = new PrismaClient()

const formatMoney = (value: number, currency: string) =>
  `${currency} ${Number(value || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

class AutomationsService {
  private task?: ScheduledTask
  private running = false

  start() {
    if (this.task) return

    this.task = cron.schedule('* * * * *', () => {
      this.runDueJobs().catch((error) => {
        console.error('Error ejecutando automatizaciones internas:', error)
      })
    })

    this.runDueJobs().catch((error) => {
      console.error('Error ejecutando automatizaciones internas:', error)
    })
  }

  stop() {
    this.task?.stop()
    this.task = undefined
  }

  private createTransporter() {
    const user = process.env.EMAIL_USER
    const password = process.env.EMAIL_PASSWORD

    if (!user || !password) {
      throw new Error('Correo empresarial no configurado')
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT || 587),
      secure: Number(process.env.EMAIL_PORT || 587) === 465,
      auth: { user, pass: password }
    })
  }

  private getFromAddress() {
    return process.env.EMAIL_FROM || process.env.EMAIL_USER
  }

  private async runDueJobs() {
    if (this.running) return
    this.running = true

    try {
      await this.processDueTasks()
      await this.processRejectedLeadWinback()
      await this.scheduleRejectedLeadFollowups()
    } finally {
      this.running = false
    }
  }

  private async processDueTasks() {
    const tasks = await prisma.tareaAutomatizada.findMany({
      where: {
        estado: true,
        proximaEjecucion: { lte: new Date() }
      },
      orderBy: { proximaEjecucion: 'asc' },
      take: 50
    })

    for (const task of tasks) {
      try {
        if (task.tipoTrigger === 'quotation_response_reminder') {
          await this.sendQuotationReminder(task.id, task.nombre)
        } else if (task.tipoTrigger === 'lead_followup_due' || task.tipoTrigger === 'lead_recovery_followup') {
          await this.notifyFollowupTask(task.id)
        } else {
          await prisma.tareaAutomatizada.update({
            where: { id: task.id },
            data: { ultimaEjecucion: new Date(), estado: false }
          })
        }
      } catch (error) {
        console.error(`Error procesando tarea automática ${task.id}:`, error)
      }
    }
  }

  private extractQuotationNumber(taskName: string) {
    return taskName.replace(/^Recordatorio de cotizacion -\s*/i, '').trim()
  }

  private async sendQuotationReminder(taskId: number, taskName: string) {
    const numeroCotizacion = this.extractQuotationNumber(taskName)
    const quotation = await prisma.cotizacion.findUnique({
      where: { numeroCotizacion },
      include: { lead: { select: { id: true, nombre: true, email: true } } }
    })

    if (!quotation || !['enviada', 'vista'].includes(quotation.estadoCotizacion)) {
      await prisma.tareaAutomatizada.update({
        where: { id: taskId },
        data: { ultimaEjecucion: new Date(), estado: false }
      })
      return
    }

    if (!quotation.lead.email) {
      await prisma.tareaAutomatizada.update({
        where: { id: taskId },
        data: { ultimaEjecucion: new Date(), estado: false }
      })
      return
    }

    const transporter = this.createTransporter()
    await transporter.sendMail({
      from: this.getFromAddress(),
      to: quotation.lead.email,
      subject: `Recordatorio: Cotización ${quotation.numeroCotizacion} - EduPro`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
          <h2 style="color: #01103B;">Hola ${quotation.lead.nombre},</h2>
          <p>Queremos recordarte que tienes pendiente revisar la cotización <strong>${quotation.numeroCotizacion}</strong>.</p>
          <p><strong>Total:</strong> ${formatMoney(Number(quotation.montoTotal), quotation.moneda)}</p>
          <p>Si tienes dudas o deseas ajustar la propuesta, responde este correo y nuestro equipo comercial te ayudará.</p>
          <p style="margin-top: 24px;">Saludos,<br/><strong>Equipo Comercial EduPro</strong></p>
        </div>
      `
    })

    await prisma.seguimientoLead.create({
      data: {
        idLead: quotation.idLead,
        tipoSeguimiento: 'email',
        descripcion: `Recordatorio automático enviado al cliente por la cotización ${quotation.numeroCotizacion}.`
      }
    })

    await prisma.tareaAutomatizada.update({
      where: { id: taskId },
      data: { ultimaEjecucion: new Date(), estado: false }
    })
  }

  private async notifyFollowupTask(taskId: number) {
    const task = await prisma.tareaAutomatizada.findUnique({ where: { id: taskId } })
    if (!task) return

    const recipients = task.createdBy
      ? [{ id: task.createdBy }]
      : await prisma.usuario.findMany({
          where: {
            activo: true,
            rol: { nombre: { in: ['asesor_ventas', 'gerente_comercial', 'administrador'] } }
          },
          select: { id: true }
        })

    if (recipients.length > 0) {
      await prisma.notificacion.createMany({
        data: recipients.map((recipient) => ({
          idUsuario: recipient.id,
          tipo: 'seguimiento_pendiente',
          titulo: 'Seguimiento pendiente',
          mensaje: task.descripcion || task.nombre,
          enlace: '/leads'
        }))
      })
    }

    await prisma.tareaAutomatizada.update({
      where: { id: taskId },
      data: { ultimaEjecucion: new Date(), estado: false }
    })
  }

  private async processRejectedLeadWinback() {
    const hour = new Date().getHours()
    const minute = new Date().getMinutes()
    if (hour !== 8 || minute > 2) return

    await marketingService.sendRejectedLeadWinbackCampaign(
      Number(process.env.MARKETING_WINBACK_DELAY_DAYS || 15)
    ).catch((error) => {
      console.error('Error en campaña automática de recuperación:', error)
    })
  }

  private async scheduleRejectedLeadFollowups() {
    const days = Number(process.env.MARKETING_WINBACK_DELAY_DAYS || 15)
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const leads = await prisma.clienteLead.findMany({
      where: {
        estadoLead: { in: ['rechazado', 'perdido'] },
        updatedAt: { lte: cutoff }
      },
      take: Number(process.env.FOLLOWUP_RECOVERY_BATCH_SIZE || 50),
      orderBy: { updatedAt: 'asc' }
    })

    for (const lead of leads) {
      const taskName = `Recuperar oportunidad - ${lead.nombre}`
      const existingTask = await prisma.tareaAutomatizada.findFirst({
        where: {
          nombre: taskName,
          workflowId: 'internal-rejected-lead-followup',
          estado: true
        }
      })

      if (existingTask) continue

      const followupAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await prisma.tareaAutomatizada.create({
        data: {
          nombre: taskName,
          descripcion: `Contactar a ${lead.nombre} para recuperar oportunidad no concretada.`,
          workflowId: 'internal-rejected-lead-followup',
          tipoTrigger: 'lead_recovery_followup',
          createdBy: lead.idAsesor,
          proximaEjecucion: followupAt
        }
      })
    }
  }
}

export const automationsService = new AutomationsService()
