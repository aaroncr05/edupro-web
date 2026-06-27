export interface UserResponseDTO {
  id: number
  email: string
  nombre: string
  rol: {
    id: number
    nombre: string
  }
  telefono?: string
  fotoPerfil?: string
  activo: boolean
  ultimoAcceso?: Date
  createdAt: Date
  updatedAt: Date
}
