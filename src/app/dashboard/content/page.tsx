'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import Link from 'next/link'
import { 
  Type, Image as ImageIcon, Save, ArrowLeft, 
  Layout, Info, Share2, BarChart, CheckCircle2
} from 'lucide-react'
import { ImageInput } from '@/components/shared/ImageInput'

// Import services
import { settingsService, SiteSettings } from '@/services/settings.service'

export default function ContentAdminPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()

  const [settings, setSettings] = useState<SiteSettings[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await settingsService.getAllSettings()
      setSettings(response.data)
    } catch (error: unknown) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!token || !user) {
      router.push('/login')
      return
    }
    fetchSettings()
  }, [token, user, router])

  const handleUpdateSetting = (id: number, newValue: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value: newValue } : s))
    setSaveSuccess(false)
  }

  const handleSaveAll = async () => {
    try {
      setIsSaving(true)
      await settingsService.updateBatch(settings.map(s => ({ id: s.id, value: s.value })))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error al guardar los cambios')
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  const groups = ['hero', 'stats', 'about', 'contact', 'social'] as const
  const groupIcons = {
    hero: Layout,
    stats: BarChart,
    about: Info,
    contact: ImageIcon,
    social: Share2
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#01103B] leading-none">Contenido Global</h1>
            </div>
          </div>
          
          <button 
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#01103B] hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-black/20 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 size={18} className="text-green-400" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? 'Guardando...' : saveSuccess ? '¡Guardado!' : 'Guardar Cambios'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-[#FF7101] rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Sincronizando contenidos...</p>
          </div>
        ) : settings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm text-center px-8">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
              <Layout size={40} />
            </div>
            <h2 className="text-2xl font-black text-[#01103B] mb-2">No se encontraron contenidos</h2>
            <p className="text-gray-500 max-w-sm mb-8">
              Parece que la configuración global del sitio no ha sido inicializada. Ejecuta el seed del sistema o contacta a soporte.
            </p>
            <button 
              onClick={fetchSettings}
              className="px-8 py-4 bg-[#01103B] text-white rounded-2xl font-bold text-sm hover:bg-[#FF7101] transition-all"
            >
              Reintentar Conexión
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {groups.map(group => {
              const groupSettings = settings.filter(s => s.group === group)
              if (groupSettings.length === 0) return null
              const Icon = groupIcons[group]

              return (
                <section key={group} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#01103B] text-white flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h2 className="font-black text-[#01103B] uppercase tracking-widest text-xs">Sección: {group}</h2>
                      <p className="text-[10px] text-gray-400 font-bold">Configuraciones de la página principal</p>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {groupSettings.map(s => (
                      <div key={s.id}>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          {s.type === 'image' ? <ImageIcon size={12} /> : <Type size={12} />}
                          {s.key.replace(/_/g, ' ')}
                        </label>
                        
                        {s.type === 'image' ? (
                          <ImageInput
                            value={s.value}
                            onChange={(newValue) => handleUpdateSetting(s.id, newValue)}
                            label={s.key.replace(/_/g, ' ')}
                            placeholder="https://..."
                          />
                        ) : (
                          <div>
                            {s.value.length > 100 ? (
                              <textarea 
                                rows={4}
                                value={s.value}
                                onChange={(e) => handleUpdateSetting(s.id, e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all resize-none"
                              />
                            ) : (
                              <input 
                                type="text"
                                value={s.value}
                                onChange={(e) => handleUpdateSetting(s.id, e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all"
                              />
                            )}
                            <p className="text-[10px] text-gray-400 font-medium mt-2">{s.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}

      </main>
    </div>
  )
}
