import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import apiClient from '@/lib/api-client'

export interface UserPermissions {
  userId: number
  nombre: string
  email: string
  rol: {
    id: number
    nombre: string
    descripcion: string
  }
  permissions: string[]
  canCreate: {
    users: boolean
    leads: boolean
    quotations: boolean
    cases: boolean
  }
  canEdit: {
    users: boolean
    leads: boolean
    quotations: boolean
    cases: boolean
  }
  canDelete: {
    users: boolean
    leads: boolean
    quotations: boolean
  }
  canView: {
    users: boolean
    leads: boolean
    quotations: boolean
    cases: boolean
    reports: boolean
    analytics: boolean
    activityLog: boolean
  }
  canExport: {
    leads: boolean
    quotations: boolean
    reports: boolean
  }
}

export const usePermissions = () => {
  const { token } = useAuthStore()
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    const fetchPermissions = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/auth/permissions')
        setPermissions(response.data.data)
        setError(null)
      } catch (err: unknown) {
        const error = err as { message?: string }
        setError(error.message || 'Error al cargar permisos')
        setPermissions(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [token])

  return { permissions, loading, error }
}
