import apiClient from '@/lib/api-client'

export interface SiteSettings {
  id: number
  key: string
  value: string
  description?: string
  group: 'hero' | 'about' | 'contact' | 'social' | 'stats'
  type: 'text' | 'image' | 'number'
}

class SettingsService {
  async getAllSettings(): Promise<{ success: boolean; data: SiteSettings[] }> {
    try {
      const response = await apiClient.get('/settings')
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al obtener configuraciones')
    }
  }

  async updateSetting(id: number, value: string): Promise<{ success: boolean; data: SiteSettings }> {
    try {
      const response = await apiClient.put(`/settings/${id}`, { value })
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al actualizar configuración')
    }
  }

  async updateBatch(settings: { id: number; value: string }[]): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post('/settings/batch', { settings })
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error: string } } }
      throw new Error(err.response?.data?.error || 'Error al actualizar lote')
    }
  }
}

export const settingsService = new SettingsService()
