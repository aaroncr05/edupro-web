import { z } from 'zod'

export const UpdateUserDTOSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  telefono: z.string().nullable().optional(),
  fotoPerfil: z.string().url().nullable().optional(),
  activo: z.boolean().optional(),
  idRol: z.number().optional(),
  email: z.string().email().optional()
})

export type UpdateUserDTO = z.infer<typeof UpdateUserDTOSchema>
