import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class NotificationsService {
  async notifySalesAdvisorsAboutFormResponse(data: {
    formName: string
    responseId: number
    leadId?: number
    leadName?: string
    leadEmail?: string
  }) {
    const advisors = await prisma.usuario.findMany({
      where: {
        activo: true,
        rol: { nombre: 'asesor_ventas' }
      },
      select: { id: true }
    })

    if (advisors.length === 0) return { count: 0 }

    const leadLabel = data.leadName || data.leadEmail || 'un nuevo lead'

    await prisma.notificacion.createMany({
      data: advisors.map((advisor) => ({
        idUsuario: advisor.id,
        tipo: 'nuevo_formulario',
        titulo: 'Nuevo formulario recibido',
        mensaje: `${leadLabel} envió el formulario "${data.formName}".`,
        enlace: data.leadId ? `/leads?lead=${data.leadId}` : '/leads'
      }))
    })

    return { count: advisors.length }
  }

  async getUserNotifications(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [notifications, total, unread] = await Promise.all([
      prisma.notificacion.findMany({
        where: { idUsuario: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notificacion.count({ where: { idUsuario: userId } }),
      prisma.notificacion.count({ where: { idUsuario: userId, leida: false } })
    ])

    return {
      data: notifications,
      unread,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async markAsRead(userId: number, notificationId: number) {
    return await prisma.notificacion.updateMany({
      where: {
        id: notificationId,
        idUsuario: userId
      },
      data: { leida: true }
    })
  }
}

export const notificationsService = new NotificationsService()
