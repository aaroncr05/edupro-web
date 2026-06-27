import { z } from 'zod'

// Esquema para campos del formulario
export const FormFieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre del campo es requerido'),
  label: z.string().min(1, 'La etiqueta del campo es requerida'),
  type: z.enum(['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'date']),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(), // Para selects
  order: z.number().default(0)
})

export const CreateFormDTOSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  campos: z.array(FormFieldSchema).min(1, 'Debe haber al menos un campo'),
  activo: z.boolean().default(true)
})

export type CreateFormDTO = z.infer<typeof CreateFormDTOSchema>
export type FormField = z.infer<typeof FormFieldSchema>
