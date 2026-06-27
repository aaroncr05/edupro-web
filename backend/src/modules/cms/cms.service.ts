import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class CMSService {
  // --- COURSES ---
  async getAllCourses(params: { activo?: boolean } = {}) {
    return await prisma.curso.findMany({
      where: params.activo !== undefined ? { activo: params.activo } : {},
      orderBy: { createdAt: 'desc' }
    })
  }

  async getCourseBySlug(slug: string) {
    return await prisma.curso.findUnique({
      where: { slug }
    })
  }

  async createCourse(data: any) {
    try {
      return await prisma.curso.create({
        data: {
          ...data,
          precio: Number(data.precio)
        }
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Ya existe un curso con este Slug (URL). Por favor usa uno diferente.')
      }
      throw error
    }
  }

  async updateCourse(id: number, data: any) {
    try {
      return await prisma.curso.update({
        where: { id },
        data: {
          ...data,
          precio: data.precio ? Number(data.precio) : undefined
        }
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Ya existe un curso con este Slug (URL).')
      }
      throw error
    }
  }

  // --- SERVICES ---
  async getAllServices(params: { activo?: boolean } = {}) {
    return await prisma.servicio.findMany({
      where: params.activo !== undefined ? { activo: params.activo } : {},
      orderBy: { createdAt: 'desc' }
    })
  }

  async getServiceBySlug(slug: string) {
    return await prisma.servicio.findUnique({
      where: { slug }
    })
  }

  async createService(data: any) {
    try {
      return await prisma.servicio.create({
        data: {
          ...data,
          precioBase: Number(data.precioBase)
        }
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Ya existe un servicio con este Slug (URL). Por favor usa uno diferente.')
      }
      throw error
    }
  }

  async updateService(id: number, data: any) {
    return await prisma.servicio.update({
      where: { id },
      data: {
        ...data,
        precioBase: data.precioBase ? Number(data.precioBase) : undefined
      }
    })
  }

  // --- SETTINGS ---
  async getAllSettings() {
    return await prisma.configuracionGlobal.findMany({
      orderBy: { grupo: 'asc' }
    })
  }

  async updateSetting(id: number, value: string) {
    return await prisma.configuracionGlobal.update({
      where: { id },
      data: { valor: value }
    })
  }

  async updateSettingsBatch(settings: { id: number; value: string }[]) {
    return await Promise.all(
      settings.map(s => 
        prisma.configuracionGlobal.update({
          where: { id: s.id },
          data: { valor: s.value }
        })
      )
    )
  }
}
