import { z } from 'zod'

export const CreateLeadDTOSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  empresa: z.string().optional(),
  cargo: z.string().optional(),
  presupuesto: z.number().positive('El presupuesto debe ser un número positivo').optional(),
  probabilidad: z.number().min(0).max(100).default(30),
  idAsesor: z.number().positive('El ID del asesor debe ser válido').optional(),
  notas: z.string().optional()
})

export type CreateLeadDTO = z.infer<typeof CreateLeadDTOSchema>
