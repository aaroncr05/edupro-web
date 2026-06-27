import { z } from 'zod'

export const AddQuotationItemDTOSchema = z.object({
  descripcion: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  cantidad: z.number().positive('La cantidad debe ser un número positivo'),
  precioUnitario: z.number().positive('El precio unitario debe ser un número positivo')
})

export type AddQuotationItemDTO = z.infer<typeof AddQuotationItemDTOSchema>
