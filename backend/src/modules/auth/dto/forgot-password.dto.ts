import { z } from 'zod'

export const ForgotPasswordDTOSchema = z.object({
  email: z.string().email('Email inválido')
})

export const VerifyCodeDTOSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().min(6, 'El código debe tener 6 dígitos')
})

export const ResetPasswordDTOSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().min(6, 'El código debe tener 6 dígitos'),
  newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
})

export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordDTOSchema>
export type VerifyCodeDTO = z.infer<typeof VerifyCodeDTOSchema>
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTOSchema>