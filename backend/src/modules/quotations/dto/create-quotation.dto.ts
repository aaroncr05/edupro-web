import { z } from 'zod'

export const CreateQuotationDTOSchema = z.object({
  numeroCotizacion: z.string().min(3, 'El número de cotización debe tener al menos 3 caracteres'),
  idLead: z.number().positive('El ID del lead debe ser válido'),
  montoTotal: z.number().positive('El monto debe ser un número positivo'),
  moneda: z.string().default('COP'),
  notas: z.string().optional(),
  fechaVencimiento: z.string().datetime().optional()
})

export type CreateQuotationDTO = z.infer<typeof CreateQuotationDTOSchema>
