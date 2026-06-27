export interface CaseResponseDTO {
  id: number
  numeroCaso: string
  cliente: {
    id: number
    nombre: string
    email: string
    telefono?: string | null
    empresa?: string | null
  }
  cotizacion?: {
    id: number
    numeroCotizacion: string
  }
  titulo: string
  descripcion: string
  resolucion?: string | null
  estado: string
  prioridad: string
  responsable?: {
    id: number
    nombre: string
    email: string
  }
  fechaVencimiento?: Date
  cerradoEn?: Date
  createdAt: Date
  updatedAt: Date
}
