import { z } from 'zod'

export const SubmitFormResponseDTOSchema = z.object({
  idFormulario: z.number().int().positive('ID de formulario requerido'),
  respuestas: z.record(z.string().max(1000)).refine(
    (obj) => Object.keys(obj).length <= 50,
    { message: 'Máximo 50 campos permitidos' }
  ),
  email: z.string().email().optional() // Para crear lead asociado
})

export type SubmitFormResponseDTO = z.infer<typeof SubmitFormResponseDTOSchema>

export interface FormResponseDTO {
  id: number
  idFormulario: number
  respuestas: Record<string, any>
  idLead?: number
  createdAt: Date
}
