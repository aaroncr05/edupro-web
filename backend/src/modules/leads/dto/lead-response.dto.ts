export interface LeadResponseDTO {
  id: number
  nombre: string
  email: string
  telefono?: string
  empresa?: string
  cargo?: string
  presupuesto?: number
  estadoLead: string
  probabilidad: number
  esCliente: boolean
  convertidoClienteEn?: Date
  habilitadoMarketing: boolean
  segmentoMarketing?: string
  fechaIngresoMarketing?: Date
  ultimoEnvioMarketing?: Date
  asesor?: {
    id: number
    nombre: string
    email: string
  }
  notas?: string
  fechaContacto?: Date
  createdAt: Date
  updatedAt: Date
}
