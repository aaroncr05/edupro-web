import { z } from 'zod'

export const CreateCaseDTOSchema = z.object({
  numeroCaso: z.string().min(3, 'El numero de caso debe tener al menos 3 caracteres'),
  idCliente: z.number().positive('El ID del cliente debe ser valido'),
  idCotizacion: z.number().positive().optional(),
  titulo: z.string().trim().min(1, 'El asunto es obligatorio'),
  descripcion: z.string().trim().min(1, 'La descripcion es obligatoria'),
  prioridad: z.enum(['bajo', 'medio', 'alto', 'critico']).default('medio'),
  idResponsable: z.number().positive().optional(),
  fechaVencimiento: z.string().datetime().optional()
})

export type CreateCaseDTO = z.infer<typeof CreateCaseDTOSchema>
