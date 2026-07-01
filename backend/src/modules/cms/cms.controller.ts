import { Request, Response } from 'express'
import { z } from 'zod'
import { CMSService } from './cms.service'

const cmsService = new CMSService()

// Normaliza el body del frontend: mapea descripción (con tilde) → descripcion
// y convierte linkInscripcion vacío a null
function normalizeBody(body: Record<string, unknown>) {
  return {
    ...body,
    descripcion: body['descripcion'] ?? body['descripción'],
    linkInscripcion: body['linkInscripcion'] || null
  }
}

const CreateCourseSchema = z.object({
  titulo: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones'),
  descripcion: z.string().min(1),
  imagen: z.string().min(1),
  objetivos: z.array(z.string()),
  dirigidoA: z.string(),
  contenido: z.array(z.string()),
  precio: z.coerce.number().nonnegative(),
  activo: z.boolean().optional(),
  linkInscripcion: z.string().nullable().optional()
})

const UpdateCourseSchema = CreateCourseSchema.partial()

const CreateServiceSchema = z.object({
  titulo: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones'),
  descripcion: z.string().min(1),
  icono: z.string().optional(),
  imagen: z.string().min(1),
  caracteristicas: z.array(z.string()),
  precioBase: z.coerce.number().nonnegative(),
  activo: z.boolean().optional(),
  beneficio1Titulo: z.string().nullable().optional(),
  beneficio1Desc: z.string().nullable().optional(),
  beneficio2Titulo: z.string().nullable().optional(),
  beneficio2Desc: z.string().nullable().optional()
})

const UpdateServiceSchema = CreateServiceSchema.partial()

const SettingsBatchSchema = z.object({
  settings: z.array(z.object({
    id: z.number().int().positive(),
    value: z.string()
  })).min(1)
})

// Renombra descripcion → descripción en la respuesta para que coincida con el tipo del frontend
function mapCourse(c: any) {
  const { descripcion, ...rest } = c
  return { ...rest, 'descripción': descripcion }
}

function mapService(s: any) {
  const { descripcion, ...rest } = s
  return { ...rest, 'descripción': descripcion }
}

export class CMSController {
  // --- COURSES ---
  async getCourses(req: Request, res: Response) {
    try {
      const activo = req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined
      const courses = await cmsService.getAllCourses({ activo })
      res.json({ success: true, data: courses.map(mapCourse), pagination: { total: courses.length } })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async getCourseBySlug(req: Request, res: Response) {
    try {
      const course = await cmsService.getCourseBySlug(req.params.slug)
      if (!course) return res.status(404).json({ success: false, error: 'Curso no encontrado' })
      res.json({ success: true, data: mapCourse(course) })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async createCourse(req: Request, res: Response) {
    try {
      const data = CreateCourseSchema.parse(normalizeBody(req.body))
      const course = await cmsService.createCourse(data)
      res.status(201).json({ success: true, data: mapCourse(course) })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: 'Validación fallida', details: error.errors })
      }
      res.status(400).json({ success: false, error: error.message })
    }
  }

  async updateCourse(req: Request, res: Response) {
    try {
      const data = UpdateCourseSchema.parse(normalizeBody(req.body))
      const course = await cmsService.updateCourse(Number(req.params.id), data)
      res.json({ success: true, data: mapCourse(course) })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: 'Validación fallida', details: error.errors })
      }
      res.status(400).json({ success: false, error: error.message })
    }
  }

  // --- SERVICES ---
  async getServices(req: Request, res: Response) {
    try {
      const activo = req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined
      const services = await cmsService.getAllServices({ activo })
      res.json({ success: true, data: services.map(mapService), pagination: { total: services.length } })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async getServiceBySlug(req: Request, res: Response) {
    try {
      const service = await cmsService.getServiceBySlug(req.params.slug)
      if (!service) return res.status(404).json({ success: false, error: 'Servicio no encontrado' })
      res.json({ success: true, data: mapService(service) })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async createService(req: Request, res: Response) {
    try {
      const data = CreateServiceSchema.parse(normalizeBody(req.body))
      const service = await cmsService.createService(data)
      res.status(201).json({ success: true, data: mapService(service) })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: 'Validación fallida', details: error.errors })
      }
      res.status(400).json({ success: false, error: error.message })
    }
  }

  async updateService(req: Request, res: Response) {
    try {
      const data = UpdateServiceSchema.parse(normalizeBody(req.body))
      const service = await cmsService.updateService(Number(req.params.id), data)
      res.json({ success: true, data: mapService(service) })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: 'Validación fallida', details: error.errors })
      }
      res.status(400).json({ success: false, error: error.message })
    }
  }

  // --- SETTINGS ---
  async getSettings(_req: Request, res: Response) {
    try {
      const settings = await cmsService.getAllSettings()
      const mapped = settings.map((s: any) => ({
        id: s.id,
        key: s.clave,
        value: s.valor,
        description: s.descripcion,
        group: s.grupo,
        type: s.tipo
      }))
      res.json({ success: true, data: mapped })
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message })
    }
  }

  async updateSettingsBatch(req: Request, res: Response) {
    try {
      const { settings } = SettingsBatchSchema.parse(req.body)
      await cmsService.updateSettingsBatch(settings)
      res.json({ success: true })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: 'Validación fallida', details: error.errors })
      }
      res.status(400).json({ success: false, error: error.message })
    }
  }
}
