import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Crear instancia de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Enviar cookies automáticamente (HttpOnly cookies del backend)
  withCredentials: true
})

// Interceptor de solicitud
apiClient.interceptors.request.use(
  (config) => {
    if (typeof document !== 'undefined') {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1]
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        // Limpiar datos locales (excepto el token que está en HttpOnly cookie)
        localStorage.removeItem('user_data')
        
        // Redirigir a login (el backend limpiará la cookie)
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
