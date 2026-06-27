import { z } from 'zod'

export const ChangeCaseStatusDTOSchema = z.object({
  estado: z.enum(['abierto', 'en_progreso', 'en_espera', 'resuelto', 'cerrado', 'reabierto']),
  observacion: z.string().optional(),
  resolucion: z.string().trim().optional()
})

export type ChangeCaseStatusDTO = z.infer<typeof ChangeCaseStatusDTOSchema>
