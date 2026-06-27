import { z } from 'zod'

export const CreateFollowupDTOSchema = z.object({
  tipoSeguimiento: z.enum([
    'llamada_telefonica',
    'email',
    'reunion',
    'visita_sitio',
    'propuesta_enviada',
    'negociacion'
  ]).default('llamada_telefonica'),
  descripcion: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
  resultado: z.string().optional(),
  proximaAccion: z.string().optional(),
  fechaProximaAccion: z.string().optional()
})

export type CreateFollowupDTO = z.infer<typeof CreateFollowupDTOSchema>
