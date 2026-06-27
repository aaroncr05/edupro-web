import { Request, Response } from 'express'
import { CMSService } from './cms.service'

const cmsService = new CMSService()

export class CMSController {
  // --- COURSES ---
  async getCourses(req: Request, res: Response) {
    try {
      const activo = req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined
      const courses = await cmsService.getAllCourses({ activo })
      res.json({ success: true, data: courses, pagination: { total: courses.length } })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async getCourseBySlug(req: Request, res: Response) {
    try {
      const course = await cmsService.getCourseBySlug(req.params.slug)
      if (!course) return res.status(404).json({ success: false, error: 'Curso no encontrado' })
      res.json({ success: true, data: course })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async createCourse(req: Request, res: Response) {
    try {
      const course = await cmsService.createCourse(req.body)
      res.status(201).json({ success: true, data: course })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

  async updateCourse(req: Request, res: Response) {
    try {
      const course = await cmsService.updateCourse(Number(req.params.id), req.body)
      res.json({ success: true, data: course })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

  // --- SERVICES ---
  async getServices(req: Request, res: Response) {
    try {
      const activo = req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined
      const services = await cmsService.getAllServices({ activo })
      res.json({ success: true, data: services, pagination: { total: services.length } })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async getServiceBySlug(req: Request, res: Response) {
    try {
      const service = await cmsService.getServiceBySlug(req.params.slug)
      if (!service) return res.status(404).json({ success: false, error: 'Servicio no encontrado' })
      res.json({ success: true, data: service })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async createService(req: Request, res: Response) {
    try {
      const service = await cmsService.createService(req.body)
      res.status(201).json({ success: true, data: service })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

  async updateService(req: Request, res: Response) {
    try {
      const service = await cmsService.updateService(Number(req.params.id), req.body)
      res.json({ success: true, data: service })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }

  // --- SETTINGS ---
  async getSettings(req: Request, res: Response) {
    try {
      const settings = await cmsService.getAllSettings()
      // Mapear campos de DB a campos esperados por el frontend
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
      await cmsService.updateSettingsBatch(req.body.settings)
      res.json({ success: true })
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message })
    }
  }
}
