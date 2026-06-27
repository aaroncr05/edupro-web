import { z } from 'zod'

export const UpdateLeadDTOSchema = z.object({
  nombre: z.string().min(2).optional(),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
  empresa: z.string().optional(),
  cargo: z.string().optional(),
  presupuesto: z.number().positive().optional(),
  probabilidad: z.number().min(0).max(100).optional(),
  idAsesor: z.number().positive().optional(),
  notas: z.string().optional()
})

export type UpdateLeadDTO = z.infer<typeof UpdateLeadDTOSchema>
