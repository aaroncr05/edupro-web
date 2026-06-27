import { z } from 'zod'

export const CreateUserDTOSchema = z.object({
  email: z.string().email('Email inválido'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  idRol: z.number().positive('El rol debe ser válido'),
  rolId: z.number().positive('El rol debe ser válido').optional(),
  telefono: z.string().optional().nullable(),
  fotoPerfil: z.string().url().optional().nullable()
}).transform((data) => ({
  email: data.email,
  nombre: data.nombre,
  password: data.password,
  rolId: data.idRol,
  telefono: data.telefono,
  fotoPerfil: data.fotoPerfil
}))

export type CreateUserDTO = z.infer<typeof CreateUserDTOSchema>
