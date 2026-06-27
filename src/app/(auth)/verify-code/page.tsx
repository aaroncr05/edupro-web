'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Shield, CheckCircle } from 'lucide-react'
import { authService } from '@/services/auth.service'

export default function VerifyCodePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!email) {
      router.push('/forgot-password')
    }
  }, [email, router])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const verificationCode = code.join('')

    if (verificationCode.length !== 6) {
      setError('Ingresa los 6 dígitos del código')
      setIsLoading(false)
      return
    }

    try {
      await authService.verifyCode(email!, verificationCode)
      setVerified(true)
      // Guardar código en sessionStorage para usarlo en reset-password
      sessionStorage.setItem('reset_code', verificationCode)
      // El token ahora está en la cookie HttpOnly
      
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email!)}`)
      }, 1000)
    } catch (err: unknown) {
      const error = err as { message: string }
      setError(error?.message || 'Código inválido')
      setCode(['', '', '', '', '', ''])
      document.getElementById('code-0')?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  if (verified) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #01103B 0%, #0740E4 40%, #01103B 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, #FF7101, transparent)' }} />
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/10">
            <CheckCircle size={48} className="text-[#00CCFF]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">¡Código Verificado!</h1>
          <p className="text-white/60">Redirigiendo...</p>
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
            <Shield size={16} />
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
              <Shield size={40} className="text-[#FF7101]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Verificar Código</h1>
            <p className="text-white/60 text-sm">Ingresa el código de 6 dígitos enviado a:</p>
            <p className="text-[#FF7101] font-semibold mt-1 text-sm break-all">{email}</p>
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
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold rounded-xl text-white bg-white/10 border border-white/20 focus:border-[#FF7101] focus:bg-white/20 outline-none transition-all"
                  disabled={isLoading}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.some(d => !d)}
              className="w-full py-4 rounded-xl font-semibold text-white text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #FF7101, #FF9D50)' }}
            >
              {isLoading ? (
                <svg className="animate-spin w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                'Verificar Código'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={async () => {
                setError(null)
                setIsLoading(true)
                try {
                  await authService.forgotPassword(email!)
                  setError(null)
                } catch (err: unknown) {
                  const error = err as { message: string }
                  setError(error?.message || 'Error al reenviar código')
                } finally {
                  setIsLoading(false)
                }
              }}
              className="text-xs text-white/50 hover:text-[#FF7101] transition-colors"
            >
              ¿No recibiste el código? Reenviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}