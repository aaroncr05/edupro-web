import { z } from 'zod'

export const UpdateCaseDTOSchema = z.object({
  titulo: z.string().trim().min(1).optional(),
  descripcion: z.string().trim().min(1).optional(),
  resolucion: z.string().trim().optional(),
  prioridad: z.enum(['bajo', 'medio', 'alto', 'critico']).optional(),
  idResponsable: z.number().positive().optional(),
  fechaVencimiento: z.string().datetime().optional()
})

export type UpdateCaseDTO = z.infer<typeof UpdateCaseDTOSchema>
