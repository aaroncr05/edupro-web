export interface AuthResponseDTO {
  token: string
  user: {
    id: number
    email: string
    nombre: string
    rol: {
      id: number
      nombre: string
    }
    activo: boolean
    createdAt: Date
  }
}

export interface RefreshTokenDTO {
  token: string
}
