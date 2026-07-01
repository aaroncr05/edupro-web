'use client'

import { FormEvent, Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import Link from 'next/link'
import { 
  Headphones, Search, Plus, MoreVertical, 
  ArrowLeft, MessageSquare, AlertTriangle, AlertCircle, CheckCircle2, Clock, Eye, Loader2
} from 'lucide-react'

// Import dependencies
import { casesService, CaseResponse } from '@/services/cases.service'
import { leadsService, LeadResponse } from '@/services/leads.service'

const normalizeRole = (role?: string) =>
  (role || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace('atencion_cliente', 'atencion_cliente')

const ROLES_PERMITIDOS = ['administrador', 'atencion_cliente', 'gerente_comercial', 'cliente']

const parseCaseHistory = (description: string) => {
  const text = description || ''
  const matches = [...text.matchAll(/Seguimiento \(([^)]+)\):/g)]

  if (matches.length === 0) {
    return {
      base: text.trim(),
      entries: [] as Array<{ date: string; text: string }>
    }
  }

  const base = text.slice(0, matches[0].index).trim()
  const entries = matches.map((match, index) => {
    const start = (match.index || 0) + match[0].length
    const end = index + 1 < matches.length ? matches[index + 1].index || text.length : text.length

    return {
      date: match[1],
      text: text.slice(start, end).trim()
    }
  })

  return { base, entries }
}

const normalizeWhatsappPhone = (phone?: string | null) => {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.length === 9 ? `51${digits}` : digits
}

const buildWhatsappUrl = (phone: string | undefined | null, message: string) => {
  const normalizedPhone = normalizeWhatsappPhone(phone)
  if (!normalizedPhone) return ''

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
}

const buildTicketWhatsappMessage = (caso: CaseResponse) => {
  const clientName = caso.lead?.nombre || 'cliente'
  const email = caso.lead?.email || 'tu correo registrado'
  const code = caso.codigo || caso.numeroCaso

  return [
    `Hola ${clientName}, hemos creado tu ticket de soporte ${code}.`,
    `Asunto: ${caso.asunto || caso.titulo}.`,
    'Nuestro equipo revisara tu solicitud y te mantendra informado por este medio.',
    `También enviamos la constancia del ticket al correo ${email}.`
  ].join('\n\n')
}

const buildResolutionWhatsappMessage = (caso: CaseResponse) => {
  const clientName = caso.lead?.nombre || 'cliente'
  const email = caso.lead?.email || 'tu correo registrado'
  const code = caso.codigo || caso.numeroCaso
  const resolution = caso.resolucion || 'La resolucion fue registrada en nuestro sistema.'

  return [
    `Hola ${clientName}, te compartimos la documentación de resolucion del caso ${code}.`,
    `Asunto: ${caso.asunto || caso.titulo}.`,
    `Resolucion: ${resolution}`,
    `También enviamos esta documentación al correo ${email}.`
  ].join('\n\n')
}

const openWhatsappMessage = (caso: CaseResponse, message: string) => {
  const url = buildWhatsappUrl(caso.lead?.telefono, message)
  if (!url) return false

  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}

function CasesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, token } = useAuthStore()
  const userRole = normalizeRole(user?.rol?.nombre)
  const canCreateCases = ['administrador', 'atencion_cliente', 'cliente'].includes(userRole)
  const canEditCases = ['administrador', 'atencion_cliente'].includes(userRole)
  
  // Proteger ruta según rol
  useEffect(() => {
    if (user && !ROLES_PERMITIDOS.includes(normalizeRole(user.rol?.nombre))) {
      router.push('/dashboard')
    }
  }, [user, router])

  const [searchTerm, setSearchTerm] = useState('')
  const [cases, setCases] = useState<CaseResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCases, setTotalCases] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 20
  const [leads, setLeads] = useState<LeadResponse[]>([])
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [createdTicketCase, setCreatedTicketCase] = useState<CaseResponse | null>(null)
  const [pendingDocumentationCase, setPendingDocumentationCase] = useState<CaseResponse | null>(null)
  const [isSendingDocumentation, setIsSendingDocumentation] = useState(false)
  
  // Modal State
  const [viewingCase, setViewingCase] = useState<CaseResponse | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isEditingCase, setIsEditingCase] = useState(false)
  const [editError, setEditError] = useState('')
  const [editCase, setEditCase] = useState({
    titulo: '',
    descripción: '',
    estadoCaso: 'abierto',
    prioridad: 'medio',
    fechaVencimiento: '',
    observacion: '',
    resolucion: ''
  })
  const [newCase, setNewCase] = useState({
    idCliente: '',
    titulo: '',
    descripción: '',
    prioridad: 'medio',
    fechaVencimiento: ''
  })

  const fetchCases = async (page: number = 1) => {
    try {
      setIsLoading(true)
      const response = await casesService.getAllCases({ page, limit: PAGE_SIZE })
      setCases(response.data)
      setTotalCases(response.pagination?.total ?? response.data.length)
    } catch (error: unknown) {
      console.error('Error fetching cases:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFormData = async () => {
    try {
      const leadsResponse = await leadsService.getAllLeads(1, 100)
      setLeads(leadsResponse.data.filter((lead) => lead.esCliente))
    } catch (error) {
      console.error('Error fetching case form data:', error)
    }
  }

  useEffect(() => {
    if (!token || !user) {
      router.push('/login')
      return
    }
    fetchCases()
    fetchFormData()
  }, [token, user, router])

  useEffect(() => {
    const caseId = Number(searchParams.get('case'))
    if (!caseId || cases.length === 0) return

    const caso = cases.find((item) => item.id === caseId)
    if (caso) {
      handleOpenDetail(caso)
    }
  }, [searchParams, cases])

  const handleOpenDetail = (caso: CaseResponse) => {
    setViewingCase(caso)
    setIsEditingCase(false)
    setEditError('')
    setEditCase({
      titulo: caso.asunto || caso.titulo || '',
      descripción: caso.descripción || '',
      estadoCaso: caso.estadoCaso || 'abierto',
      prioridad: caso.prioridad || 'medio',
      fechaVencimiento: caso.fechaVencimiento ? new Date(caso.fechaVencimiento).toISOString().slice(0, 16) : '',
      observacion: '',
      resolucion: caso.resolucion || ''
    })
    setShowDetailModal(true)
  }

  const handleOpenEditFollowup = (caso: CaseResponse) => {
    setViewingCase(caso)
    setIsEditingCase(false)
    setEditError('')
    setSuccessMessage('')
    setEditCase({
      titulo: caso.asunto || caso.titulo || '',
      descripción: caso.descripción || '',
      estadoCaso: caso.estadoCaso || 'abierto',
      prioridad: caso.prioridad || 'medio',
      fechaVencimiento: caso.fechaVencimiento ? new Date(caso.fechaVencimiento).toISOString().slice(0, 16) : '',
      observacion: '',
      resolucion: caso.resolucion || ''
    })
    setShowDetailModal(false)
    setShowEditModal(true)
  }

  const handleSaveCaseFollowup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!viewingCase) return

    setEditError('')
    setSuccessMessage('')

    if (!editCase.titulo.trim()) {
      setEditError('Completa el asunto del caso.')
      return
    }

    if (['resuelto', 'cerrado'].includes(editCase.estadoCaso) && !editCase.resolucion.trim()) {
      setEditError('Escribe la resolucion aplicada antes de resolver o cerrar el caso.')
      return
    }

    try {
      setIsSaving(true)
      const statusChanged = viewingCase.estadoCaso !== editCase.estadoCaso
      const observation = editCase.observacion.trim() || (statusChanged ? `Estado cambiado a ${editCase.estadoCaso.replace('_', ' ')}` : '')
      const description = observation
        ? `${editCase.descripción.trim()}\n\nSeguimiento (${new Date().toLocaleString('es-PE')}): ${observation}`
        : editCase.descripción.trim()

      const updatedCase = await casesService.updateCase(viewingCase.id, {
        titulo: editCase.titulo.trim(),
        descripción: description,
        resolucion: editCase.resolucion.trim() || undefined,
        prioridad: editCase.prioridad as 'bajo' | 'medio' | 'alto' | 'critico',
        fechaVencimiento: editCase.fechaVencimiento ? new Date(editCase.fechaVencimiento).toISOString() : undefined
      })

      const finalCase = updatedCase.estadoCaso === editCase.estadoCaso && !observation
        ? updatedCase
        : await casesService.changeCaseStatus(viewingCase.id, {
            estado: editCase.estadoCaso as 'abierto' | 'en_progreso' | 'en_espera' | 'resuelto' | 'cerrado' | 'reabierto',
            observacion: observation || undefined,
            resolucion: editCase.resolucion.trim() || undefined
          })

      setCases((current) => current.map((item) => item.id === finalCase.id ? finalCase : item))
      await fetchCases()
      setViewingCase({
        ...finalCase,
        descripción: description,
        asunto: editCase.titulo.trim(),
        titulo: editCase.titulo.trim(),
        prioridad: editCase.prioridad,
        estadoCaso: editCase.estadoCaso,
        estado: editCase.estadoCaso,
        resolucion: editCase.estadoCaso === 'reabierto' ? null : editCase.resolucion.trim() || finalCase.resolucion
      })
      setIsEditingCase(false)
      setShowEditModal(false)
      setShowDetailModal(true)
      setSuccessMessage('Seguimiento actualizado correctamente.')

      if (['resuelto', 'cerrado'].includes(editCase.estadoCaso)) {
        setPendingDocumentationCase({
          ...finalCase,
          descripción: description,
          asunto: editCase.titulo.trim(),
          titulo: editCase.titulo.trim(),
          prioridad: editCase.prioridad,
          estadoCaso: editCase.estadoCaso,
          estado: editCase.estadoCaso,
          resolucion: editCase.resolucion.trim() || finalCase.resolucion
        })
      }
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Error al actualizar seguimiento')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendDocumentation = async () => {
    if (!pendingDocumentationCase) return

    try {
      setIsSendingDocumentation(true)
      const response = await casesService.sendResolutionDocumentation(pendingDocumentationCase.id)
      const opened = openWhatsappMessage(pendingDocumentationCase, buildResolutionWhatsappMessage(pendingDocumentationCase))
      setSuccessMessage(
        opened
          ? 'Documentacion enviada al correo. Se abrio WhatsApp con el mensaje listo para enviar.'
          : `${response.message || 'Documentacion enviada al correo.'} El cliente no tiene telefono para WhatsApp.`
      )
      setPendingDocumentationCase(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo enviar la documentación del caso')
    } finally {
      setIsSendingDocumentation(false)
    }
  }

  const handleCreateCase = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')

    if (!newCase.idCliente) {
      setFormError('Selecciona un cliente.')
      return
    }

    if (!newCase.titulo.trim()) {
      setFormError('El asunto es obligatorio.')
      return
    }

    if (!newCase.descripción.trim()) {
      setFormError('La descripción es obligatoria.')
      return
    }

    if (!user) {
      setFormError('Tu sesion no esta activa. Vuelve a iniciar sesion.')
      return
    }

    try {
      setIsSaving(true)
      const created = await casesService.createCase({
        numeroCaso: `CPV-${Date.now().toString().slice(-8)}`,
        idCliente: Number(newCase.idCliente),
        titulo: newCase.titulo.trim(),
        descripción: newCase.descripción.trim(),
        prioridad: newCase.prioridad as 'bajo' | 'medio' | 'alto' | 'critico',
        fechaVencimiento: newCase.fechaVencimiento ? new Date(newCase.fechaVencimiento).toISOString() : undefined
      })

      setCases((current) => [created, ...current])
      setTotalCases((current) => current + 1)
      setShowCreateModal(false)
      setViewingCase(created)
      setCreatedTicketCase(created)
      setSuccessMessage(`Ticket ${created.codigo || created.numeroCaso} creado. La constancia fue enviada al correo del cliente.`)
      setShowDetailModal(true)
      setNewCase({
        idCliente: '',
        titulo: '',
        descripción: '',
        prioridad: 'medio',
        fechaVencimiento: ''
      })
      setClientSearchTerm('')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Error al crear caso')
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  const filteredCases = cases.filter(c => 
    (c.codigo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (c.asunto?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.lead?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const filteredClients = leads.filter((lead) => {
    const term = clientSearchTerm.toLowerCase().trim()
    if (!term) return true

    return (
      lead.nombre.toLowerCase().includes(term) ||
      (lead.empresa?.toLowerCase() || '').includes(term) ||
      lead.email.toLowerCase().includes(term) ||
      (lead.telefono || '').includes(term)
    )
  })
  const selectedClient = leads.find((lead) => lead.id === Number(newCase.idCliente))
  const viewingHistory = viewingCase ? parseCaseHistory(viewingCase.descripción || '') : { base: '', entries: [] }
  const editHistory = parseCaseHistory(editCase.descripción || '')

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#01103B] leading-none">Casos Post-Venta</h1>
            </div>
          </div>
          
          {canCreateCases && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-[#34A853] hover:bg-[#34A853]/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nuevo Caso</span>
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-2 py-8 sm:px-4 lg:px-6 xl:px-8">
        
        {/* KPI / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Casos Abiertos', val: cases.filter(c => c.estadoCaso === 'abierto').length.toString(), change: 'En revisión', color: '#EF4444', icon: AlertCircle },
            { label: 'En Progreso', val: cases.filter(c => c.estadoCaso === 'en_progreso').length.toString(), change: 'Atención activa', color: '#F59E0B', icon: Clock },
            { label: 'Resueltos', val: cases.filter(c => c.estadoCaso === 'resuelto').length.toString(), change: 'Solucionados', color: '#34A853', icon: CheckCircle2 },
            { label: 'Total Casos', val: totalCases.toString(), change: 'En sistema', color: '#0740E4', icon: Headphones },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + '15', color: s.color }}>
                  <s.icon size={20} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{isLoading ? '-' : s.val}</p>
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                <p className="text-xs text-gray-400 mt-2">{s.change}</p>
              </div>
            </div>
          ))}
        </div>

        {/* List Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Buscar por ID o asunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#34A853]/20 focus:border-[#34A853] transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-6 py-4">ID & Asunto</th>
                  <th className="px-6 py-4">Cliente / Info</th>
                  <th className="px-6 py-4">Prioridad</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                         <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#34A853] animate-spin mb-2" />
                         Cargando casos...
                      </div>
                    </td>
                  </tr>
                ) : filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron casos.
                    </td>
                  </tr>
                ) : filteredCases.map((caso) => {
                  
                  let priorColor = 'text-gray-500 bg-gray-100'
                  let PriorIcon = AlertCircle
                  if (caso.prioridad === 'alto' || caso.prioridad === 'critico') { priorColor = 'text-red-700 bg-red-50 border-red-200'; PriorIcon = AlertTriangle }
                  if (caso.prioridad === 'medio') { priorColor = 'text-orange-700 bg-orange-50 border-orange-200' }
                  if (caso.prioridad === 'bajo') { priorColor = 'text-blue-700 bg-blue-50 border-blue-200' }

                  let estColor = 'text-gray-600 bg-gray-50 border-gray-200'
                  if (caso.estadoCaso === 'abierto') estColor = 'text-red-700 bg-red-50 border-red-200'
                  if (caso.estadoCaso === 'en_progreso') estColor = 'text-orange-700 bg-orange-50 border-orange-200'
                  if (caso.estadoCaso === 'resuelto' || caso.estadoCaso === 'cerrado') estColor = 'text-green-700 bg-green-50 border-green-200'
                  
                  return (
                    <tr key={caso.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono font-bold text-[#01103B] text-xs">{caso.codigo}</span>
                          <span className="font-semibold text-gray-900 line-clamp-1">{caso.asunto}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{caso.lead?.empresa || caso.lead?.nombre}</p>
                        <p className="text-xs text-gray-500 mt-1">Resp: {caso.asesor ? caso.asesor.nombre : 'Sin asignar'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${priorColor}`}>
                          <PriorIcon size={12} />
                          {caso.prioridad}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${estColor}`}>
                          {caso.estadoCaso.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleOpenDetail(caso)}
                            className="p-2 text-gray-400 hover:text-[#34A853] hover:bg-[#34A853]/10 rounded-lg transition-colors" 
                            title="Ver Detalle"
                          >
                            <Eye size={18} />
                          </button>
                          {canEditCases && (
                            <button
                              onClick={() => handleOpenEditFollowup(caso)}
                              className="p-2 text-gray-400 hover:text-[#01103B] hover:bg-gray-100 rounded-lg transition-colors"
                              title="Editar seguimiento"
                            >
                              <MoreVertical size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Págination */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
            <span>Pág. {currentPage} de {Math.ceil(totalCases / PAGE_SIZE) || 1} — {totalCases} casos</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { const p = currentPage - 1; setCurrentPage(p); fetchCases(p) }}
                disabled={currentPage <= 1 || isLoading}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >Anterior</button>
              <button
                onClick={() => { const p = currentPage + 1; setCurrentPage(p); fetchCases(p) }}
                disabled={currentPage >= Math.ceil(totalCases / PAGE_SIZE) || isLoading}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >Siguiente</button>
            </div>
          </div>
        </div>

        {/* Create Case Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
              <div className="shrink-0 p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#34A853]/10 flex items-center justify-center text-[#34A853]">
                    <Headphones size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#01103B]">Nuevo caso post-venta</h3>
                    <p className="text-xs text-gray-500">Registra una atención para un cliente del CRM. Se asignara a tu usuario.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-10 h-10 rounded-xl hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors"
                >
                  <Plus size={22} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreateCase} className="min-h-0 flex flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-5">
                  {formError && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400">Cliente</span>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          value={clientSearchTerm}
                          onChange={(event) => {
                            setClientSearchTerm(event.target.value)
                            setNewCase((current) => ({ ...current, idCliente: '' }))
                          }}
                          placeholder="Buscar cliente por nombre, empresa, correo o telefono"
                          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                        {filteredClients.length === 0 ? (
                          <div className="px-4 py-3 text-sm font-semibold text-gray-400">
                            No se encontraron clientes.
                          </div>
                        ) : (
                          filteredClients.map((lead) => {
                            const isSelected = Number(newCase.idCliente) === lead.id

                            return (
                              <button
                                key={lead.id}
                                type="button"
                                onClick={() => {
                                  setNewCase((current) => ({ ...current, idCliente: String(lead.id) }))
                                  setClientSearchTerm(`${lead.nombre}${lead.empresa ? ` - ${lead.empresa}` : ''}`)
                                }}
                                className={`w-full px-4 py-3 text-left transition-colors ${
                                  isSelected ? 'bg-[#34A853]/10' : 'hover:bg-gray-50'
                                }`}
                              >
                                <p className="text-sm font-black text-[#01103B]">{lead.nombre}</p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {lead.empresa ? `${lead.empresa} - ` : ''}{lead.email}{lead.telefono ? ` - ${lead.telefono}` : ''}
                                </p>
                              </button>
                            )
                          })
                        )}
                      </div>
                      {selectedClient && (
                        <div className="rounded-2xl border border-[#34A853]/20 bg-[#34A853]/5 px-4 py-3 text-sm">
                          <span className="text-xs font-black uppercase tracking-widest text-[#34A853]">Cliente elegido</span>
                          <p className="mt-1 font-bold text-[#01103B]">{selectedClient.nombre}</p>
                        </div>
                      )}
                      {leads.length === 0 && (
                        <p className="text-xs font-semibold text-amber-600">
                          Aún no hay leads marcados como clientes. Acepta una cotizacion para convertir un lead en cliente.
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 content-start">
                      <label className="space-y-2">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Prioridad</span>
                        <select
                          value={newCase.prioridad}
                          onChange={(event) => setNewCase((current) => ({ ...current, prioridad: event.target.value }))}
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                        >
                          <option value="bajo">Baja</option>
                          <option value="medio">Media</option>
                          <option value="alto">Alta</option>
                          <option value="critico">Critica</option>
                        </select>
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Fecha limite</span>
                        <input
                          type="datetime-local"
                          value={newCase.fechaVencimiento}
                          onChange={(event) => setNewCase((current) => ({ ...current, fechaVencimiento: event.target.value }))}
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                        />
                      </label>
                    </div>
                  </div>

                  <label className="space-y-2 block">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Asunto</span>
                    <input
                      value={newCase.titulo}
                      onChange={(event) => setNewCase((current) => ({ ...current, titulo: event.target.value }))}
                      placeholder="Ej. Soporte posterior a cotizacion aceptada"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                    />
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Descripción del caso</span>
                    <textarea
                      value={newCase.descripción}
                      onChange={(event) => setNewCase((current) => ({ ...current, descripción: event.target.value }))}
                      rows={4}
                      placeholder="Describe la solicitud, problema, compromiso o seguimiento post-venta."
                      className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                    />
                  </label>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row gap-3 border-t border-gray-100 bg-white p-5">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 rounded-2xl bg-[#34A853] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#34A853]/20 hover:bg-[#2f984b] disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Crear caso
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Case Detail Modal */}
        {showDetailModal && viewingCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#34A853]/10 flex items-center justify-center text-[#34A853]">
                    <Headphones size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#01103B]">{viewingCase.codigo}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Detalle del Caso de Soporte</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="w-12 h-12 rounded-2xl hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                {successMessage && (
                  <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                    {successMessage}
                  </div>
                )}
                {isEditingCase ? (
                  <form id="case-followup-form" onSubmit={handleSaveCaseFollowup} className="space-y-5">
                    {editError && (
                      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                        {editError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="space-y-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</span>
                        <select
                          value={editCase.estadoCaso}
                          onChange={(event) => setEditCase((current) => ({ ...current, estadoCaso: event.target.value }))}
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                        >
                          <option value="abierto">Abierto</option>
                          <option value="en_progreso">En progreso</option>
                          <option value="en_espera">En espera</option>
                          <option value="resuelto">Resuelto</option>
                          <option value="cerrado">Cerrado</option>
                          <option value="reabierto">Reabierto</option>
                        </select>
                      </label>

                      <label className="space-y-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prioridad</span>
                        <select
                          value={editCase.prioridad}
                          onChange={(event) => setEditCase((current) => ({ ...current, prioridad: event.target.value }))}
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                        >
                          <option value="bajo">Baja</option>
                          <option value="medio">Media</option>
                          <option value="alto">Alta</option>
                          <option value="critico">Critica</option>
                        </select>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="space-y-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha limite</span>
                        <input
                          type="datetime-local"
                          value={editCase.fechaVencimiento}
                          onChange={(event) => setEditCase((current) => ({ ...current, fechaVencimiento: event.target.value }))}
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Observacion del cambio</span>
                        <input
                          value={editCase.observacion}
                          onChange={(event) => setEditCase((current) => ({ ...current, observacion: event.target.value }))}
                          placeholder="Ej. Cliente respondio por WhatsApp"
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                        />
                      </label>
                    </div>

                    <label className="space-y-2 block">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asunto</span>
                      <input
                        value={editCase.titulo}
                        onChange={(event) => setEditCase((current) => ({ ...current, titulo: event.target.value }))}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                      />
                    </label>

                    <label className="space-y-2 block">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seguimiento / descripción</span>
                      <textarea
                        value={editCase.descripción}
                        onChange={(event) => setEditCase((current) => ({ ...current, descripción: event.target.value }))}
                        rows={5}
                        className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                      />
                    </label>
                  </form>
                ) : (
                  <>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Asunto del Caso</p>
                    <p className="text-lg font-bold text-gray-900">{viewingCase.asunto}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Estado Actual</p>
                    <span className="inline-flex px-3 py-1.5 rounded-full bg-[#34A853]/10 text-[#34A853] text-xs font-black uppercase">
                      {viewingCase.estadoCaso.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descripción / Problema</p>
                  <div className="hidden">
                    {viewingCase.descripción || 'Sin descripción detallada proporcionada.'}
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {viewingHistory.base || 'Sin descripción detallada proporcionada.'}
                    </div>
                    {viewingHistory.entries.map((entry, index) => (
                      <div key={`${entry.date}-${index}`} className="rounded-2xl border border-[#34A853]/20 bg-[#34A853]/5 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#34A853]">Seguimiento {index + 1}</p>
                        <p className="mt-1 text-xs font-bold text-gray-400">{entry.date}</p>
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">{entry.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Información del Cliente</p>
                    <p className="font-bold text-[#01103B] mb-1">{viewingCase.lead?.nombre}</p>
                    <p className="text-xs text-gray-500">{viewingCase.lead?.empresa || 'Cliente Directo'}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-[#34A853] font-bold">
                       <MessageSquare size={14} /> Contactar vía WhatsApp
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Asignación y Tiempo</p>
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Responsable:</span>
                          <span className="font-bold text-gray-900">{viewingCase.asesor?.nombre || 'Pendiente'}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Prioridad:</span>
                          <span className="font-bold text-red-600 uppercase">{viewingCase.prioridad}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Creado el:</span>
                          <span className="font-medium text-gray-900">{new Date(viewingCase.createdAt).toLocaleDateString('es-ES')}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Historial de Resolución</p>
                   {viewingCase.resolucion ? (
                     <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-800">
                        <p className="font-bold mb-1">Solución aplicada:</p>
                        {viewingCase.resolucion}
                     </div>
                   ) : (
                     <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center">
                        <p className="text-xs text-gray-400 italic">No hay una resolución registrada todavía para este caso.</p>
                     </div>
                   )}
                </div>
                  </>
                )}
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
                 <button 
                  onClick={() => isEditingCase ? setIsEditingCase(false) : setShowDetailModal(false)}
                  className="flex-1 py-4 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-white transition-all"
                 >
                   {isEditingCase ? 'Cancelar' : 'Cerrar Vista'}
                 </button>
                 {canEditCases && (
                   <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleOpenEditFollowup(viewingCase)}
                    className="flex-1 py-4 rounded-2xl bg-[#01103B] text-white text-sm font-bold hover:opacity-90 shadow-lg shadow-black/20 transition-all disabled:opacity-60"
                   >
                     Editar Seguimiento
                   </button>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Followup Modal */}
        {showEditModal && viewingCase && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
              <div className="p-7 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#34A853]/10 flex items-center justify-center text-[#34A853]">
                    <Headphones size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#01103B]">Editar seguimiento</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{viewingCase.codigo}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-11 h-11 rounded-2xl hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSaveCaseFollowup} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-7 pb-5">
                  {editError && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                      {editError}
                    </div>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</span>
                    <select
                      value={editCase.estadoCaso}
                      onChange={(event) => setEditCase((current) => ({ ...current, estadoCaso: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                    >
                      <option value="abierto">Abierto</option>
                      <option value="en_progreso">En progreso</option>
                      <option value="en_espera">En espera</option>
                      <option value="resuelto">Resuelto</option>
                      <option value="cerrado">Cerrado</option>
                      <option value="reabierto">Reabierto</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prioridad</span>
                    <select
                      value={editCase.prioridad}
                      onChange={(event) => setEditCase((current) => ({ ...current, prioridad: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                    >
                      <option value="bajo">Baja</option>
                      <option value="medio">Media</option>
                      <option value="alto">Alta</option>
                      <option value="critico">Critica</option>
                    </select>
                  </label>
                </div>

                <label className="space-y-2 block">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Observacion del seguimiento</span>
                  <input
                    value={editCase.observacion}
                    onChange={(event) => setEditCase((current) => ({ ...current, observacion: event.target.value }))}
                    placeholder="Ej. Se llamo al cliente y se resolvio el problema"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                  />
                </label>

                {['resuelto', 'cerrado'].includes(editCase.estadoCaso) && (
                  <label className="space-y-2 block">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resolucion aplicada</span>
                    <textarea
                      value={editCase.resolucion}
                      onChange={(event) => setEditCase((current) => ({ ...current, resolucion: event.target.value }))}
                      rows={3}
                      placeholder="Ej. Se restablecio la contrasena y el cliente confirmo acceso."
                      className="w-full resize-none rounded-2xl border border-[#34A853]/30 bg-[#34A853]/5 px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                    />
                  </label>
                )}

                <label className="space-y-2 block">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asunto</span>
                  <input
                    value={editCase.titulo}
                    onChange={(event) => setEditCase((current) => ({ ...current, titulo: event.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10"
                  />
                </label>

                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción / historial</span>
                  <div className="max-h-64 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="rounded-xl bg-white px-4 py-3 text-sm font-medium leading-6 text-gray-700 whitespace-pre-line">
                      {editHistory.base || 'Sin descripción inicial.'}
                    </div>
                    <div className="mt-3 space-y-3">
                      {editHistory.entries.length === 0 ? (
                        <p className="text-xs font-semibold text-gray-400">Aún no hay seguimientos registrados.</p>
                      ) : editHistory.entries.map((entry, index) => (
                        <div key={`${entry.date}-${index}`} className="rounded-xl border border-[#34A853]/20 bg-white px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#34A853]">Seguimiento {index + 1}</p>
                          <p className="mt-1 text-xs font-bold text-gray-400">{entry.date}</p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">{entry.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-100 bg-white p-5 shadow-[0_-10px_30px_rgba(15,23,42,0.06)]">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 rounded-2xl border border-gray-200 px-5 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 rounded-2xl bg-[#01103B] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-black/20 hover:opacity-90 disabled:opacity-60"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar seguimiento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {createdTicketCase && (
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-3 bg-slate-900/25 backdrop-blur-sm">
            <div className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
              <div className="shrink-0 bg-[#01103B] px-5 py-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#34A853]/20 text-[#8EF0AA]">
                      <CheckCircle2 size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#FFB072]">Ticket registrado</p>
                      <h3 className="mt-0.5 truncate text-xl font-black">{createdTicketCase.codigo}</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreatedTicketCase(null)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Cerrar confirmacion"
                  >
                    <Plus size={20} className="rotate-45" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
                <div>
                  <h4 className="text-base font-black text-[#01103B]">Caso creado correctamente</h4>
                  <p className="mt-1 text-sm leading-5 text-gray-600">
                    La constancia fue enviada al correo. Puedes avisar al cliente por WhatsApp con el mensaje listo.
                  </p>
                </div>

                <div className="grid gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cliente</p>
                    <p className="mt-1 truncate text-sm font-black text-gray-900">{createdTicketCase.lead?.nombre || 'Sin cliente'}</p>
                    <p className="mt-1 text-xs text-gray-500">{createdTicketCase.lead?.email || 'Sin correo'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Asunto</p>
                    <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-gray-800">{createdTicketCase.asunto}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#34A853]/20 bg-[#34A853]/5 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#34A853]">Mensaje preparado</p>
                  <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-line pr-1 text-sm leading-5 text-gray-700">
                    {buildTicketWhatsappMessage(createdTicketCase)}
                  </p>
                </div>
              </div>

              <div className="shrink-0 border-t border-gray-100 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setCreatedTicketCase(null)}
                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-black text-gray-500 transition-colors hover:bg-gray-50"
                >
                  Ver caso
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const opened = openWhatsappMessage(createdTicketCase, buildTicketWhatsappMessage(createdTicketCase))
                    if (!opened) {
                      setSuccessMessage('El ticket fue enviado al correo. El cliente no tiene telefono registrado para WhatsApp.')
                    }
                    setCreatedTicketCase(null)
                  }}
                  className="flex-1 rounded-2xl bg-[#34A853] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#34A853]/20 transition-colors hover:bg-[#2f984b]"
                >
                  Enviar por WhatsApp
                </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {pendingDocumentationCase && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
              <div className="bg-[#01103B] px-7 py-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#34A853]/20 text-[#8EF0AA]">
                    <CheckCircle2 size={25} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-[#FFB072]">Caso resuelto</p>
                    <h3 className="mt-1 text-xl font-black">Enviar documentación</h3>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-7 py-6">
                <p className="text-sm leading-6 text-gray-600">
                  Deseas enviar al cliente la documentación de la resolucion del caso por correo y dejar WhatsApp listo para envio manual?
                </p>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Caso</p>
                  <p className="mt-1 font-black text-[#01103B]">{pendingDocumentationCase.codigo}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-600">{pendingDocumentationCase.asunto}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Cliente: {pendingDocumentationCase.lead?.nombre || 'Sin cliente'}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setPendingDocumentationCase(null)}
                    disabled={isSendingDocumentation}
                    className="flex-1 rounded-2xl border border-gray-200 px-5 py-4 text-sm font-black text-gray-500 hover:bg-gray-50 disabled:opacity-60"
                  >
                    No enviar
                  </button>
                  <button
                    type="button"
                    onClick={handleSendDocumentation}
                    disabled={isSendingDocumentation}
                    className="flex-1 rounded-2xl bg-[#FF7101] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#FF7101]/20 hover:bg-[#e86600] disabled:opacity-60"
                  >
                    {isSendingDocumentation ? 'Enviando...' : 'Si, enviar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function CasesPage() {
  return (
    <Suspense fallback={null}>
      <CasesPageContent />
    </Suspense>
  )
}
