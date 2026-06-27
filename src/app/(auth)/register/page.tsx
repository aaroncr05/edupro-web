'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Shield } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuthStore()

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    clearError()
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.nombre || !formData.email || !formData.password) {
      setFormError('Por favor completa los campos requeridos')
      return
    }

    if (formData.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      await register(formData)
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as { message: string }
      setFormError(error?.message || 'Error al registrarse')
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #01103B 0%, #0740E4 40%, #01103B 100%)' }}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, #FF7101, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-15 animate-pulse" style={{ background: 'radial-gradient(circle, #00CCFF, transparent)', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full opacity-10 animate-pulse" style={{ background: 'radial-gradient(circle, #FF7101, transparent)', animationDelay: '2s' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
        {/* Back to home */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Volver al inicio
          </Link>
        </div>

        {/* Card with glassmorphism */}
        <div className="rounded-3xl p-8 shadow-2xl border border-white/10" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #0740E4, #00CCFF)' }}>
              <User className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Crear nueva cuenta</h1>
            <p className="text-white/60 text-sm">Únete a la plataforma EduPro CRM</p>
          </div>

          {/* Alerts */}
          {(formError || error) && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-red-300 text-sm">{formError || error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div className="space-y-1.5">
              <label htmlFor="nombre" className="block text-sm font-medium text-white/80">
                Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Juan Pérez"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-white/30 text-sm transition-all outline-none border"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderColor: formData.nombre ? 'rgba(0,204,255,0.6)' : 'rgba(255,255,255,0.12)',
                  }}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-white/80">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-white/30 text-sm transition-all outline-none border"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderColor: formData.email ? 'rgba(0,204,255,0.6)' : 'rgba(255,255,255,0.12)',
                  }}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <label htmlFor="telefono" className="block text-sm font-medium text-white/80">
                Teléfono <span className="text-white/40 font-normal">(Opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <Phone size={16} />
                </div>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+51 900 000 000"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-white/30 text-sm transition-all outline-none border"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderColor: formData.telefono ? 'rgba(0,204,255,0.6)' : 'rgba(255,255,255,0.12)',
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-white/80">
                Contraseña
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
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-11 pr-12 py-3 rounded-xl text-white placeholder-white/30 text-sm transition-all outline-none border"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderColor: formData.password ? 'rgba(0,204,255,0.6)' : 'rgba(255,255,255,0.12)',
                  }}
                  disabled={isLoading}
                  required
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #0740E4, #00CCFF)' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <span>Registrarse</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-white/60">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-[#00CCFF] hover:text-white font-semibold transition-colors">
              Inicia sesión aquí
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-white/30 text-xs">
          <Shield size={12} />
          <span>Tus datos están protegidos y encriptados</span>
        </div>
      </div>
    </div>
  )
}
