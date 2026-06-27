import { z } from 'zod'
import { FormFieldSchema } from './create-form.dto'

export const UpdateFormDTOSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  descripcion: z.string().optional(),
  campos: z.array(FormFieldSchema).min(1, 'Debe haber al menos un campo').optional(),
  activo: z.boolean().optional()
})

export type UpdateFormDTO = z.infer<typeof UpdateFormDTOSchema>
