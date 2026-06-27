import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class TasksService {
  async getMyAutomaticTasks(userId: number, limit: number = 10) {
    return await prisma.tareaAutomatizada.findMany({
      where: {
        createdBy: userId,
        tipoTrigger: 'lead_followup_due',
        estado: true
      },
      orderBy: [
        { proximaEjecucion: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })
  }

  async completeMyTask(userId: number, taskId: number) {
    const result = await prisma.tareaAutomatizada.updateMany({
      where: {
        id: taskId,
        createdBy: userId
      },
      data: {
        estado: false,
        ultimaEjecucion: new Date()
      }
    })

    if (result.count === 0) {
      throw new Error('Tarea no encontrada')
    }

    return { message: 'Tarea marcada como completada' }
  }
}

export const tasksService = new TasksService()
