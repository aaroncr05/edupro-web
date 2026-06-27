import { z } from 'zod'

export const RegisterDTOSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es muy largo'),
  rol: z.enum(['administrador', 'asesor_ventas', 'atencion_cliente', 'gerente_comercial', 'cliente'])
    .default('cliente')
})

export type RegisterDTO = z.infer<typeof RegisterDTOSchema>
