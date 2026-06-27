import { z } from 'zod'

export const ChangeQuotationStatusDTOSchema = z.object({
  estado: z.enum(['borrador', 'enviada', 'vista', 'aceptada', 'rechazada', 'expirada']),
  observacion: z.string().optional()
})

export type ChangeQuotationStatusDTO = z.infer<typeof ChangeQuotationStatusDTOSchema>
