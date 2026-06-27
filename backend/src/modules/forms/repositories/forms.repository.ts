import { PrismaClient } from '@prisma/client'
import { CreateFormDTO } from '../dto/create-form.dto'
import { UpdateFormDTO } from '../dto/update-form.dto'

const prisma = new PrismaClient()

export class FormsRepository {
  /**
   * Crear nuevo formulario
   */
  async create(data: CreateFormDTO & { createdBy: number }) {
    return await prisma.formulario.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        campos: data.campos,
        activo: data.activo,
        createdBy: data.createdBy
      }
    })
  }

  /**
   * Obtener todos los formularios con paginación
   */
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [formularios, total] = await Promise.all([
      prisma.formulario.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: { respuestas: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.formulario.count()
    ])

    return {
      data: formularios,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Obtener formulario por ID
   */
  async findById(id: number) {
    return await prisma.formulario.findUnique({
      where: { id },
      include: {
        _count: {
          select: { respuestas: true }
        }
      }
    })
  }

  /**
   * Actualizar formulario
   */
  async update(id: number, data: UpdateFormDTO) {
    return await prisma.formulario.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        campos: data.campos,
        activo: data.activo
      }
    })
  }

  /**
   * Eliminar formulario
   */
  async delete(id: number) {
    // Primero eliminar respuestas asociadas
    await prisma.respuestaFormulario.deleteMany({
      where: { idFormulario: id }
    })

    // Luego eliminar el formulario
    return await prisma.formulario.delete({
      where: { id }
    })
  }

  /**
   * Obtener formularios activos (para formularios públicos)
   */
  async findActive(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [formularios, total] = await Promise.all([
      prisma.formulario.findMany({
        where: { activo: true },
        skip,
        take: limit,
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          campos: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.formulario.count({
        where: { activo: true }
      })
    ])

    return {
      data: formularios,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Crear respuesta de formulario
   */
  async createResponse(idFormulario: number, respuestas: Record<string, any>, idLead?: number) {
    return await prisma.respuestaFormulario.create({
      data: {
        idFormulario,
        respuestas,
        idLead: idLead || null
      }
    })
  }

  async findLeadByEmail(email: string) {
    return await prisma.clienteLead.findUnique({
      where: { email }
    })
  }

  async createLeadFromForm(data: {
    nombre: string
    email: string
    telefono?: string
    empresa?: string
    notas?: string
  }) {
    return await prisma.clienteLead.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        empresa: data.empresa,
        notas: data.notas,
        estadoLead: 'nuevo',
        probabilidad: 30
      }
    })
  }

  /**
   * Obtener respuestas de un formulario
   */
  async findResponses(idFormulario: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [respuestas, total] = await Promise.all([
      prisma.respuestaFormulario.findMany({
        where: { idFormulario },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.respuestaFormulario.count({
        where: { idFormulario }
      })
    ])

    return {
      data: respuestas,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export const formsRepository = new FormsRepository()
