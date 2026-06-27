'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { formsService, FormResponse } from '@/services/forms.service'
import { ChevronLeft, Download } from 'lucide-react'
import Link from 'next/link'

export default function FormResponsesPage() {
  const router = useRouter()
  const params = useParams()
  const { user, token } = useAuthStore()
  const formId = params.id as string

  const [form, setForm] = useState<FormResponse | null>(null)
  const [responses, setResponses] = useState<Array<{ id: number; respuestas: Record<string, string | number | boolean>; createdAt: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    const hasToken = token || localStorage.getItem('jwt_token')
    const hasUser = user || localStorage.getItem('user_data')

    if (!hasToken || !hasUser) {
      router.push('/login')
      return
    }

    if (user && user.rol?.nombre !== 'administrador') {
      router.push('/dashboard')
      return
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, user, token, router])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [formData, responsesData] = await Promise.all([
        formsService.getFormById(parseInt(formId)),
        formsService.getFormResponses(parseInt(formId), 1, 100)
      ])

      setForm(formData)
      setResponses(responsesData.data)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Error al cargar datos')
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCSV = () => {
    if (!form || responses.length === 0) return

    const headers = form.campos.map(c => c.label)
    const rows = responses.map(r =>
      form.campos.map(c => r.respuestas[c.id] || '').join(',')
    )

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.nombre}-respuestas.csv`
    a.click()
  }

  if (!isHydrated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-[#0740E4] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/forms" className="text-gray-500 hover:text-gray-700">
                <ChevronLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {form?.nombre || 'Respuestas del Formulario'}
                </h1>
                <p className="text-sm text-gray-500">
                  {responses.length} respuesta{responses.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {responses.length > 0 && (
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-[#0740E4] text-white rounded-lg hover:bg-[#0530b0] transition"
              >
                <Download size={20} />
                Descargar CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-[#0740E4] animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Cargando respuestas...</p>
            </div>
          </div>
        ) : responses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No hay respuestas para este formulario</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">#</th>
                  {form?.campos.map(campo => (
                    <th key={campo.id} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      {campo.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response, idx) => (
                  <tr key={response.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                    {form?.campos.map(campo => (
                      <td key={campo.id} className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {response.respuestas[campo.id] || '-'}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(response.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
