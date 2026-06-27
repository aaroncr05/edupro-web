export interface QuotationItemResponseDTO {
  id: number
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface QuotationResponseDTO {
  id: number
  numeroCotizacion: string
  lead: {
    id: number
    nombre: string
    email: string
    empresa?: string
    telefono?: string
  }
  montoTotal: number
  moneda: string
  estado: string
  items: QuotationItemResponseDTO[]
  pdfUrl?: string
  notas?: string
  fechaVencimiento?: Date
  enviadoEn?: Date
  aceptadoEn?: Date
  rechazadoEn?: Date
  createdAt: Date
  updatedAt: Date
}
