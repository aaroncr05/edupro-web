import apiClient from '@/lib/api-client'

export interface LoginDTO {
  email: string
  password: string
}

export interface RegisterDTO {
  nombre: string
  email: string
  password: string
  telefono?: string
}

export interface UserResponse {
  id: number
  nombre: string
  email: string
  telefono?: string
  fotoPerfil?: string
  rol: {
    id: number
    nombre: string
  }
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  data: {
    token?: string  // Token opcional - ahora se usa HttpOnly cookies
    user: UserResponse
  }
  message?: string
}

export interface AuthService {
  login(data: LoginDTO): Promise<AuthResponse>
  register(data: RegisterDTO): Promise<AuthResponse>
  refreshToken(): Promise<
  AuthResponse>
  getCurrentUser(): Promise<{ success: boolean; data: UserResponse }>
  logout(): void
  forgotPassword(email: string): Promise<{ success: boolean; message: string }>
  verifyCode(email: string, code: string): Promise<{ success: boolean; token: string }>
  resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean }>
}

class AuthServiceImpl implements AuthService {
  async login(data: LoginDTO): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data)
      // El token está en la cookie HttpOnly, no necesitamos almacenarlo en localStorage
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error en el login')
    }
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data)
      // El token ahora está en la cookie HttpOnly
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error en el registro')
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh', {})
      // El token está en la cookie HttpOnly, no necesitamos almacenarlo en localStorage
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al renovar token')
    }
  }

  async getCurrentUser(): Promise<{ success: boolean; data: UserResponse }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: UserResponse }>(
        '/auth/me'
      )
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener usuario')
    }
  }

  logout(): void {
    apiClient.post('/auth/logout', {}).catch(() => {})
    localStorage.removeItem('user_data')
    localStorage.removeItem('reset_code')
    sessionStorage.removeItem('reset_code')
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/forgot-password', { email })
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al enviar código de verificación')
    }
  }

  async verifyCode(email: string, code: string): Promise<{ success: boolean; token: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; token: string }>('/auth/verify-code', { email, code })
      // El token ahora está en la cookie HttpOnly
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Código inválido o expirado')
    }
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean }>('/auth/reset-password', {
        email,
        code,
        newPassword
      })
      
      // Limpiar código temporal (ahora en desuso con cookies)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('reset_code')
      }
      
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al resetear contraseña')
    }
  }
}

export const authService = new AuthServiceImpl()
