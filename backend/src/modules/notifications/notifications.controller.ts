import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '@/modules/auth/guards/jwt.guard'
import { notificationsService } from './notifications.service'

export class NotificationsController {
  async getMine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ success: false, error: 'No autenticado' })
      }

      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const result = await notificationsService.getUserNotifications(userId, page, limit)

      res.status(200).json({
        success: true,
        data: result.data,
        unread: result.unread,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages
        }
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener notificaciones'
      })
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId
      const notificationId = parseInt(req.params.id)

      if (!userId) {
        return res.status(401).json({ success: false, error: 'No autenticado' })
      }

      if (isNaN(notificationId)) {
        return res.status(400).json({ success: false, error: 'ID de notificación inválido' })
      }

      await notificationsService.markAsRead(userId, notificationId)

      res.status(200).json({
        success: true,
        message: 'Notificación marcada como leída'
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al actualizar notificación'
      })
    }
  }
}

export const notificationsController = new NotificationsController()
