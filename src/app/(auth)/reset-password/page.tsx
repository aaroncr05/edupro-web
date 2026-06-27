'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { authService } from '@/services/auth.service'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!email) {
      router.push('/forgot-password')
    }
  }, [email, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    // Obtenemos el código del backend (ya fue verificado y está en la sesión)
    // En realidad, necesitamos pasar el código aquí porque el backend lo requiere
    // El código lo ingresó el usuario en la página anterior
    // Solución: guardar el código en sessionStorage temporalmente
    const code = sessionStorage.getItem('reset_code')
    if (!code) {
      setError('No hay un código de verificación válido. Inicia el proceso nuevamente')
      router.push('/forgot-password')
      return
    }

    setIsLoading(true)

    try {
      await authService.resetPassword(email!, code, formData.password)
      sessionStorage.removeItem('reset_code')  // Limpiar código
      setSuccess(true)
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: unknown) {
      const error = err as { message: string }
      setError(error?.message || 'Error al resetear contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #01103B 0%, #0740E4 40%, #01103B 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, #FF7101, transparent)' }} />
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/10">
            <CheckCircle size={48} className="text-[#00CCFF]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">¡Contraseña Actualizada!</h1>
          <p className="text-white/60">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #01103B 0%, #0740E4 40%, #01103B 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, #FF7101, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-15 animate-pulse" style={{ background: 'radial-gradient(circle, #00CCFF, transparent)', animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
            <Lock size={16} />
            Volver al login
          </Link>
        </div>

        <div className="rounded-3xl p-8 shadow-2xl border border-white/10" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Lock size={40} className="text-[#FF7101]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Nueva Contraseña</h1>
            <p className="text-white/60 text-sm">Crea una contraseña segura para tu cuenta</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-white/80">
                Nueva Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-white placeholder-white/30 text-sm transition-all outline-none border"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderColor: formData.password ? 'rgba(255,113,1,0.6)' : 'rgba(255,255,255,0.12)',
                  }}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <Lock size={16} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-white placeholder-white/30 text-sm transition-all outline-none border"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderColor: formData.confirmPassword ? 'rgba(255,113,1,0.6)' : 'rgba(255,255,255,0.12)',
                  }}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.password || !formData.confirmPassword}
              className="w-full py-4 rounded-xl font-semibold text-white text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #FF7101, #FF9D50)' }}
            >
              {isLoading ? (
                <svg className="animate-spin w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                'Actualizar Contraseña'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}