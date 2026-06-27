'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft, MailCheck } from 'lucide-react'
import { authService } from '@/services/auth.service'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await authService.forgotPassword(email)
      setSuccess(true)
    } catch (err: unknown) {
      const error = err as { message: string }
      setError(error?.message || 'Error al enviar código')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #01103B 0%, #0740E4 40%, #01103B 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, #FF7101, transparent)' }} />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-15 animate-pulse" style={{ background: 'radial-gradient(circle, #00CCFF, transparent)', animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
          <div className="mb-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
              <ArrowLeft size={16} />
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
                <MailCheck size={40} className="text-[#FF7101]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">¡Correo enviado!</h1>
              <p className="text-white/60 text-sm">
                Hemos enviado un código de verificación a
              </p>
              <p className="text-[#FF7101] font-semibold mt-1">{email}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-white/70 text-sm text-center">
                Revisa tu bandeja de entrada y usa el código de 6 dígitos para restablecer tu contraseña.
              </p>
            </div>

            <button
              onClick={() => router.push(`/verify-code?email=${encodeURIComponent(email)}`)}
              className="w-full py-4 rounded-xl font-semibold text-white text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #FF7101, #FF9D50)' }}
            >
              Ir a verificar código
            </button>

            <button
              onClick={() => { setSuccess(false); setError(null); }}
              className="w-full mt-3 py-3 rounded-xl font-semibold text-white/70 hover:text-white text-sm transition-all"
            >
              Volver a intentar con otro email
            </button>
          </div>
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
            <ArrowLeft size={16} />
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
              <Mail size={40} className="text-[#FF7101]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Recuperar Contraseña</h1>
            <p className="text-white/60 text-sm">Ingresa tu correo y te enviaremos un código</p>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-white/30 text-sm transition-all outline-none border"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderColor: email ? 'rgba(255,113,1,0.6)' : 'rgba(255,255,255,0.12)',
                  }}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-semibold text-white text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #FF7101, #FF9D50)' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </>
              ) : (
                'Enviar Código'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}