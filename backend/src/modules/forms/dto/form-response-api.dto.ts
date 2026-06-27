import { FormField } from './create-form.dto'

export interface FormResponseAPIDTO {
  id: number
  nombre: string
  descripcion?: string
  campos: FormField[]
  activo: boolean
  createdBy: number
  createdAt: Date
  updatedAt: Date
  totalResponses: number
}
