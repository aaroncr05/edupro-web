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
    if (typeof window !== 'undefined') {
      // Primero intentar leer de cookie (mismo dominio / local)
      const fromCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1]
      // Luego intentar localStorage (producción cross-origin)
      const csrfToken = fromCookie || localStorage.getItem('csrf_token') || ''
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
      if (typeof window !== 'undefined') {
        // Solo redirigir a login desde rutas protegidas del CRM
        const crmRoutes = ['/dashboard', '/leads', '/quotations', '/cases', '/users', '/profile', '/reports', '/forms', '/marketing']
        const isOnCrmRoute = crmRoutes.some(route => window.location.pathname.startsWith(route))
        if (isOnCrmRoute) {
          localStorage.removeItem('user_data')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
