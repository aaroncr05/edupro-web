import { z } from 'zod'

const LeadStatusSchema = z.enum([
  'nuevo',
  'contactado',
  'interesado',
  'calificado',
  'propuesta_enviada',
  'cotizacion_enviada',
  'negociacion',
  'convertido',
  'aceptado',
  'rechazado',
  'perdido',
  'no_aceptado'
])

export const ChangeLeadStatusDTOSchema = z.object({
  estado: LeadStatusSchema.optional(),
  estadoLead: LeadStatusSchema.optional(),
  observacion: z.string().optional()
}).refine((data) => data.estado || data.estadoLead, {
  message: 'El estado es requerido',
  path: ['estado']
})

export type ChangeLeadStatusDTO = z.infer<typeof ChangeLeadStatusDTOSchema>
