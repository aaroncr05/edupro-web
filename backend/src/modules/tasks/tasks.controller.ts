import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '@/modules/auth/guards/jwt.guard'
import { tasksService } from './tasks.service'

export class TasksController {
  async getMine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ success: false, error: 'No autenticado' })
      }

      const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100)
      const tasks = await tasksService.getMyAutomaticTasks(userId, limit)

      res.status(200).json({
        success: true,
        data: tasks
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener tareas'
      })
    }
  }

  async completeMine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId
      const taskId = parseInt(req.params.id)

      if (!userId) {
        return res.status(401).json({ success: false, error: 'No autenticado' })
      }

      if (isNaN(taskId)) {
        return res.status(400).json({ success: false, error: 'ID de tarea inválido' })
      }

      const result = await tasksService.completeMyTask(userId, taskId)

      res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      res.status(error.message.includes('no encontrada') ? 404 : 500).json({
        success: false,
        error: error.message || 'Error al completar tarea'
      })
    }
  }
}

export const tasksController = new TasksController()
