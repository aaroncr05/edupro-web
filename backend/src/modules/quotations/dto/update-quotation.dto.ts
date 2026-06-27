import { z } from 'zod'

export const UpdateQuotationDTOSchema = z.object({
  montoTotal: z.number().positive().optional(),
  moneda: z.string().optional(),
  notas: z.string().optional(),
  fechaVencimiento: z.string().datetime().optional()
})

export type UpdateQuotationDTO = z.infer<typeof UpdateQuotationDTOSchema>
