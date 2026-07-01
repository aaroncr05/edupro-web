'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import Link from 'next/link'
import { 
  Users, Search, Filter, Plus, MoreVertical, 
  ArrowLeft, Phone, Mail, Calendar,
  TrendingUp, BarChart2, Star, Clock, AlertCircle,
  X, CheckCircle, MessageSquare, FileText, Building2,
  Briefcase, DollarSign, UserCheck, Edit3, Send, Trash2
} from 'lucide-react'

// Import dependencies
import { leadsService, LeadResponse, CreateLeadDTO, FollowupResponse, CreateFollowupDTO } from '@/services/leads.service'
import { quotationsService } from '@/services/quotations.service'
import { usersService } from '@/services/users.service'

const ROLES_PERMITIDOS = ['administrador', 'asesor_ventas', 'gerente_comercial']

const LEAD_STAGES = [
  { value: 'nuevo', label: 'Nuevo', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'contactado', label: 'Contactado', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { value: 'interesado', label: 'Interesado', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'propuesta_enviada', label: 'Cotización enviada', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'convertido', label: 'Aceptado', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'rechazado', label: 'No aceptado', color: 'bg-red-50 text-red-700 border-red-200' },
]

const getLeadStage = (status: string) =>
  LEAD_STAGES.find((stage) => stage.value === status) ||
  { value: status, label: status.replace('_', ' '), color: 'bg-gray-100 text-gray-700 border-gray-200' }

const getFutureDateTimeValue = (daysFromNow: number) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

function LeadsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, token } = useAuthStore()
  
  // Proteger ruta según rol
  useEffect(() => {
    if (user && !ROLES_PERMITIDOS.includes(user.rol?.nombre || '')) {
      router.push('/dashboard')
    }
  }, [user, router])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showStageFilters, setShowStageFilters] = useState(false)
  const [activeStageFilter, setActiveStageFilter] = useState<string>('todos')
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table')
  const [leads, setLeads] = useState<LeadResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalLeads, setTotalLeads] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 20
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Estados para el modal de creación
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateLeadDTO>({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    cargo: '',
    presupuesto: undefined,
    notas: ''
  })

  // Estados para editar lead
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLead, setEditingLead] = useState<LeadResponse | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<CreateLeadDTO>>({})
  const [editSuccess, setEditSuccess] = useState(false)

  // Estados para asignar asesor
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigningLead, setAssigningLead] = useState<LeadResponse | null>(null)
  const [selectedAsesor, setSelectedAsesor] = useState<number | null>(null)

  // Estados para cambiar estado
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusLead, setStatusLead] = useState<LeadResponse | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  // Estados para historial de seguimiento
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyLead, setHistoryLead] = useState<LeadResponse | null>(null)
  const [historyMode, setHistoryMode] = useState<'historial' | 'programar'>('historial')
  const [followups, setFollowups] = useState<FollowupResponse[]>([])
  const [isLoadingFollowups, setIsLoadingFollowups] = useState(false)
  const [followupForm, setFollowupForm] = useState<CreateFollowupDTO>({
    tipoSeguimiento: 'llamada_telefonica',
    descripción: '',
    resultado: '',
    proximaAccion: '',
    fechaProximaAccion: ''
  })

  // Estados para generar cotización desde lead
  const [showQuotationModal, setShowQuotationModal] = useState(false)
  const [quotationLead, setQuotationLead] = useState<LeadResponse | null>(null)
  const [quotationForm, setQuotationForm] = useState<{
    descripción: string
    cantidad: number
    precioUnitario: string | number
    moneda: string
    notas: string
    fechaVencimiento: string
  }>({
    descripción: '',
    cantidad: 1,
    precioUnitario: '',
    moneda: 'PEN',
    notas: '',
    fechaVencimiento: ''
  })

  // Menú de acciones
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadResponse | null>(null)

  // Estados para cargar asesores
  const [asesores, setAsesores] = useState<Array<{ id: number; nombre: string; email: string }>>([])
  const [loadingAsesores, setLoadingAsesores] = useState(false)

  const fetchAsesores = async () => {
    try {
      setLoadingAsesores(true)
      const response = await usersService.getAllUsers()
      const asesorRoles = ['asesor_ventas', 'administrador', 'gerente_comercial']
      const asesoresFiltrados = response.data?.filter((u: { rol?: { nombre: string } }) => u.rol?.nombre && asesorRoles.includes(u.rol.nombre)) || []
      setAsesores(asesoresFiltrados)
    } catch (error) {
      console.error('Error fetching asesores:', error)
      setAsesores([])
    } finally {
      setLoadingAsesores(false)
    }
  }

  const fetchLeads = async (page: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await leadsService.getAllLeads(page, PAGE_SIZE)
      setLeads(response.data)
      setTotalLeads(response.pagination?.total ?? response.data.length)
    } catch (error: unknown) {
      console.error('Error fetching leads:', error)
      const err = error as { message?: string }
      setError(err.message || 'Error al cargar los leads')
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar autenticación y permitir que el store se hidrate
  useEffect(() => {
    // Marcar como hidratado después de montar
    setIsHydrated(true)
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Esperar a que el store est? hidratado o verificar localStorage
    if (!isHydrated) return

    const hasToken = token || localStorage.getItem('jwt_token')
    const hasUser = user || localStorage.getItem('user_data')

    if (!hasToken || !hasUser) {
      router.push('/login')
      return
    }

    fetchLeads()
    fetchAsesores()
  }, [isHydrated, token, user, router])

  useEffect(() => {
    const leadId = Number(searchParams.get('lead'))
    if (!leadId || leads.length === 0) return

    const lead = leads.find((item) => item.id === leadId)
    if (lead) {
      setSelectedLead(lead)
      setActiveMenuId(null)
    }
  }, [searchParams, leads])

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.nombre.trim()) {
      setCreateError('El nombre es requerido')
      return
    }
    if (!formData.email.trim()) {
      setCreateError('El email es requerido')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setCreateError('El email no es válido')
      return
    }

    try {
      setIsSubmitting(true)
      setCreateError(null)
      
      // Preparar datos
      const dataToSend: CreateLeadDTO = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono?.trim() || undefined,
        empresa: formData.empresa?.trim() || undefined,
        cargo: formData.cargo?.trim() || undefined,
        presupuesto: formData.presupuesto ? Number(formData.presupuesto) : undefined,
        notas: formData.notas?.trim() || undefined
      }
      
      // Crear lead
      const newLead = await leadsService.createLead(dataToSend)
      
      // Agregar a la lista
      setLeads([newLead, ...leads])
      setTotalLeads(totalLeads + 1)
      
      // Mostrar ?xito
      setCreateSuccess(true)
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        empresa: '',
        cargo: '',
        presupuesto: undefined,
        notas: ''
      })
      
      // Cerrar modal después de 2 segúndos
      setTimeout(() => {
        setShowCreateModal(false)
        setCreateSuccess(false)
      }, 2000)
      
    } catch (err: unknown) {
      console.error('Error creating lead:', err)
      const error = err as { message?: string }
      setCreateError(error.message || 'Error al crear el lead')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const closeModal = () => {
    if (!isSubmitting) {
      setShowCreateModal(false)
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        empresa: '',
        cargo: '',
        presupuesto: undefined,
        notas: ''
      })
      setCreateError(null)
      setCreateSuccess(false)
    }
  }

  // Funciones para Edición
  const openEditModal = (lead: LeadResponse) => {
    setEditingLead(lead)
    setEditFormData({
      nombre: lead.nombre,
      email: lead.email,
      telefono: lead.telefono || '',
      empresa: lead.empresa || '',
      cargo: lead.cargo || '',
      presupuesto: lead.presupuesto || undefined,
      notas: lead.notas || ''
    })
    setShowEditModal(true)
    setActiveMenuId(null)
  }

  const handleEditLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLead) return

    try {
      setIsSubmitting(true)
      await leadsService.updateLead(editingLead.id, editFormData)
      setEditSuccess(true)
      
      // Actualizar lista
      setLeads(leads.map(l => l.id === editingLead.id ? { ...l, ...editFormData } : l))
      if (selectedLead?.id === editingLead.id) {
        setSelectedLead({ ...selectedLead, ...editFormData })
      }
      
      setTimeout(() => {
        setShowEditModal(false)
        setEditSuccess(false)
        setEditingLead(null)
      }, 2000)
    } catch (err: unknown) {
      console.error('Error updating lead:', err)
      const error = err as { message?: string }
      alert(`Error al actualizar: ${error.message || 'Error desconocido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Funciones para Asignación e Impersonalización
  const handleAssignAsesor = async () => {
    if (!assigningLead || !selectedAsesor) {
      alert('Por favor selecciona un asesor')
      return
    }
    try {
      setIsSubmitting(true)
      await leadsService.assignLeadToAdvisor(assigningLead.id, { advisorId: selectedAsesor })
      setShowAssignModal(false)
      setSelectedAsesor(null)
      setAssigningLead(null)
      await fetchLeads()
      alert('Lead asignado correctamente')
    } catch (err: unknown) {
      console.error('Error assigning lead:', err)
      const error = err as { message?: string }
      alert(`Error al asignar: ${error.message || 'Error desconocido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangeStatus = async () => {
    if (!statusLead || !selectedStatus) {
      alert('Por favor selecciona un estado')
      return
    }
    try {
      setIsSubmitting(true)
      const updatedLead = await leadsService.changeLeadStatus(statusLead.id, { estado: selectedStatus })
      setLeads((current) => current.map((lead) => lead.id === updatedLead.id ? updatedLead : lead))
      if (selectedLead?.id === statusLead.id) {
        setSelectedLead(updatedLead)
      }
      setShowStatusModal(false)
      setSelectedStatus('')
      setStatusLead(null)
      alert('Estado actualizado correctamente')
    } catch (err: unknown) {
      console.error('Error changing status:', err)
      const error = err as { message?: string }
      alert(`Error al cambiar estado: ${error.message || 'Error desconocido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openHistoryModal = async (lead: LeadResponse, presetFutureFollowup: boolean = false) => {
    setHistoryLead(lead)
    setHistoryMode(presetFutureFollowup ? 'programar' : 'historial')
    setShowHistoryModal(true)
    setActiveMenuId(null)
    setFollowupForm({
      tipoSeguimiento: 'llamada_telefonica',
      descripción: presetFutureFollowup
        ? `Lead no concretado. Programar recuperacion comercial para ${lead.nombre}.`
        : '',
      resultado: presetFutureFollowup ? 'Pendiente de recuperar oportunidad' : '',
      proximaAccion: presetFutureFollowup ? 'Retomar contacto y validar si aun esta interesado' : '',
      fechaProximaAccion: presetFutureFollowup ? getFutureDateTimeValue(7) : ''
    })

    try {
      setIsLoadingFollowups(true)
      const data = await leadsService.getLeadFollowups(lead.id)
      setFollowups(data)
    } catch (err: unknown) {
      const error = err as { message?: string }
      alert(`Error al cargar historial: ${error.message || 'Error desconocido'}`)
    } finally {
      setIsLoadingFollowups(false)
    }
  }

  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!historyLead) return
    if (!followupForm.descripción.trim()) {
      alert('La descripción del seguimiento es requerida')
      return
    }

    try {
      setIsSubmitting(true)
      const created = await leadsService.createLeadFollowup(historyLead.id, {
        ...followupForm,
        descripción: followupForm.descripción.trim(),
        resultado: followupForm.resultado?.trim() || undefined,
        proximaAccion: followupForm.proximaAccion?.trim() || undefined,
        fechaProximaAccion: followupForm.fechaProximaAccion || undefined
      })
      setFollowups([created, ...followups])
      setFollowupForm({
        tipoSeguimiento: 'llamada_telefonica',
        descripción: '',
        resultado: '',
        proximaAccion: '',
        fechaProximaAccion: ''
      })
    } catch (err: unknown) {
      const error = err as { message?: string }
      alert(`Error al registrar seguimiento: ${error.message || 'Error desconocido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openQuotationModal = (lead: LeadResponse) => {
    setQuotationLead(lead)
    setQuotationForm({
      descripción: lead.empresa ? `Servicio para ${lead.empresa}` : `Servicio para ${lead.nombre}`,
      cantidad: 1,
      precioUnitario: lead.presupuesto ? Number(lead.presupuesto) : '',
      moneda: 'PEN',
      notas: lead.notas || '',
      fechaVencimiento: ''
    })
    setShowQuotationModal(true)
    setActiveMenuId(null)
  }

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quotationLead) return
    if (!quotationForm.descripción.trim()) {
      alert('La descripción del servicio es requerida')
      return
    }
    if (Number(quotationForm.cantidad) <= 0 || Number(quotationForm.precioUnitario) <= 0) {
      alert('La cantidad y el precio deben ser mayores a cero')
      return
    }

    try {
      setIsSubmitting(true)
      const subtotal = Number(quotationForm.cantidad) * Number(quotationForm.precioUnitario)
      const numeroCotizacion = `COT-${Date.now()}-${quotationLead.id}`
      const quotation = await quotationsService.createQuotation({
        numeroCotizacion,
        idLead: quotationLead.id,
        montoTotal: subtotal,
        moneda: quotationForm.moneda,
        notas: quotationForm.notas || undefined,
        fechaVencimiento: quotationForm.fechaVencimiento
          ? new Date(`${quotationForm.fechaVencimiento}T23:59:59`).toISOString()
          : undefined
      })

      await quotationsService.addQuotationItem(quotation.id, {
        descripción: quotationForm.descripción.trim(),
        cantidad: Number(quotationForm.cantidad),
        precioUnitario: Number(quotationForm.precioUnitario)
      })

      await leadsService.changeLeadStatus(quotationLead.id, {
        estado: 'propuesta_enviada',
        observacion: `Cotización ${numeroCotizacion} generada desde la información del lead.`
      })

      setShowQuotationModal(false)
      setQuotationLead(null)
      await fetchLeads()
      alert('Cotización generada correctamente')
      router.push('/quotations')
    } catch (err: unknown) {
      const error = err as { message?: string }
      alert(`Error al generar cotización: ${error.message || 'Error desconocido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLead = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este prospecto?')) return
    try {
      setIsSubmitting(true)
      await leadsService.deleteLead(id)
      setLeads(leads.filter(l => l.id !== id))
      if (selectedLead?.id === id) {
        setSelectedLead(null)
      }
      setTotalLeads(totalLeads - 1)
      alert('Prospecto eliminado correctamente')
    } catch (err: unknown) {
      console.error('Error deleting lead:', err)
      const error = err as { message?: string }
      alert(`Error al eliminar: ${error.message || 'Error desconocido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.empresa && l.empresa.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStage = activeStageFilter === 'todos' || l.estadoLead === activeStageFilter

    return matchesSearch && matchesStage
  })

  const openStatusModalFromLead = (lead: LeadResponse) => {
    setStatusLead(lead)
    setSelectedStatus(lead.estadoLead)
    setShowStatusModal(true)
    setActiveMenuId(null)
  }

  const getWhatsAppUrl = (phone?: string) => {
    const cleanPhone = (phone || '').replace(/\D/g, '')
    if (!cleanPhone) return ''
    const formattedPhone = cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone
    return `https://wa.me/${formattedPhone}`
  }

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
              <h1 className="text-lg font-bold text-[#01103B] leading-none">Prospectos (Leads)</h1>
            </div>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#0740E4] hover:bg-[#0740E4]/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow">
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Prospecto</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-2 py-5 sm:px-4 lg:px-6 xl:px-8">
        
        {/* KPI / Stats */}
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          {[
            { label: 'Total Prospectos', val: totalLeads.toString(), change: 'En el sistema', color: '#0740E4', icon: Users },
            { label: 'Nuevos', val: leads.filter(l => l.estadoLead === 'nuevo').length.toString(), change: 'Sin contactar', color: '#FF7101', icon: Star },
            { label: 'Cotización enviada', val: leads.filter(l => l.estadoLead === 'propuesta_enviada').length.toString(), change: 'En seguimiento', color: '#9333EA', icon: Clock },
            { label: 'Aceptados', val: leads.filter(l => l.estadoLead === 'convertido').length.toString(), change: 'Cerrados', color: '#34A853', icon: TrendingUp },
          ].map((s, i) => (
            <div key={i} className="flex flex-col rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
              <div className="mb-1 flex items-start justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: s.color + '15', color: s.color }}>
                  <s.icon size={17} />
                </div>
              </div>
              <div>
                <p className="mb-0.5 text-lg font-bold leading-none text-gray-900">{isLoading ? '-' : s.val}</p>
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                <p className="mt-1 text-xs text-gray-400">{s.change}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={16} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Error al cargar los prospectos</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
              <button 
                onClick={() => fetchLeads(currentPage)}
                className="ml-auto px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* List Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
            <div className="relative max-w-sm w-full flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Buscar prospecto por nombre o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowStageFilters((current) => !current)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${
                  showStageFilters || activeStageFilter !== 'todos'
                    ? 'bg-[#01103B] text-white border-[#01103B]'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter size={16} />
                {activeStageFilter === 'todos' ? 'Filtrar Etapas' : getLeadStage(activeStageFilter).label}
              </button>
              <button
                type="button"
                onClick={() => setViewMode((current) => current === 'table' ? 'pipeline' : 'table')}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${
                  viewMode === 'pipeline'
                    ? 'bg-[#0740E4] text-white border-[#0740E4]'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart2 size={16} />
                {viewMode === 'pipeline' ? 'Tabla Vista' : 'Pipeline Vista'}
              </button>
            </div>
          </div>

          {showStageFilters && (
            <div className="border-b border-gray-200 bg-white px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStageFilter('todos')}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                    activeStageFilter === 'todos'
                      ? 'border-[#01103B] bg-[#01103B] text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Todas
                </button>
                {LEAD_STAGES.map((stage) => (
                  <button
                    key={stage.value}
                    type="button"
                    onClick={() => setActiveStageFilter(stage.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                      activeStageFilter === stage.value
                        ? 'border-[#0740E4] bg-[#0740E4] text-white'
                        : `${stage.color} hover:opacity-80`
                    }`}
                  >
                    {stage.label} ({leads.filter((lead) => lead.estadoLead === stage.value).length})
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'pipeline' ? (
            <div className="overflow-x-auto bg-gray-50/40 p-4">
              <div className="grid min-w-[1180px] grid-cols-6 gap-3">
                {LEAD_STAGES.map((stage) => {
                  const stageLeads = filteredLeads.filter((lead) => lead.estadoLead === stage.value)

                  return (
                    <section key={stage.value} className="rounded-2xl border border-gray-200 bg-white p-3">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${stage.color}`}>
                          {stage.label}
                        </span>
                        <span className="text-xs font-bold text-gray-400">{stageLeads.length}</span>
                      </div>

                      <div className="space-y-2">
                        {isLoading ? (
                          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-400">Cargando...</div>
                        ) : stageLeads.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-400">Sin prospectos</div>
                        ) : stageLeads.map((lead) => (
                          <button
                            key={lead.id}
                            type="button"
                            onClick={() => {
                              setSelectedLead(lead)
                              setActiveMenuId(null)
                            }}
                            className="w-full rounded-xl border border-gray-100 bg-white p-3 text-left shadow-sm transition-all hover:border-[#0740E4]/30 hover:shadow-md"
                          >
                            <p className="line-clamp-2 text-sm font-black text-[#01103B]">{lead.empresa || lead.nombre}</p>
                            <p className="mt-1 truncate text-xs text-gray-500">{lead.nombre}</p>
                            <p className="mt-2 truncate text-xs text-gray-400">{lead.email}</p>
                            <div className="mt-3 flex items-center justify-between text-[11px]">
                              <span className="rounded-md bg-blue-50 px-2 py-1 font-bold text-blue-700">{lead.probabilidad}%</span>
                              <span className="text-gray-400">{new Date(lead.createdAt).toLocaleDateString('es-ES')}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-6 py-4">Empresa / Contacto</th>
                  <th className="px-6 py-4">Información</th>
                  <th className="px-6 py-4">Interés</th>
                  <th className="px-6 py-4">Etapa</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                         <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#0740E4] animate-spin mb-2" />
                         Cargando prospectos...
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron prospectos.
                    </td>
                  </tr>
                ) : filteredLeads.map((lead) => {
                  
                  const stage = getLeadStage(lead.estadoLead)
                  
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => {
                        setSelectedLead(lead)
                        setActiveMenuId(null)
                      }}
                      className="hover:bg-[#0740E4]/[0.03] transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#01103B]/5 border border-[#01103B]/10 flex items-center justify-center text-[#01103B] font-bold shadow-sm uppercase">
                            {lead.nombre.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-[#0740E4] transition-colors">{lead.empresa || lead.nombre}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Users size={12} /> {lead.empresa ? lead.nombre : 'Sin empresa'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <Mail size={14} className="text-gray-400" /> {lead.email}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone size={14} className="text-gray-400" /> {lead.telefono || 'No especificado'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {lead.probabilidad}% de probabilidad
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1.5 font-medium">
                          <Calendar size={10} /> Ingreso: {new Date(lead.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${stage.color}`}>
                          {stage.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={(event) => {
                            event.stopPropagation()
                            setActiveMenuId(activeMenuId === lead.id ? null : lead.id)
                          }}
                          className="p-2 text-gray-400 hover:text-[#0740E4] hover:bg-[#0740E4]/10 rounded-lg transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === lead.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={(event) => {
                                event.stopPropagation()
                                setActiveMenuId(null)
                              }}
                            />
                            <div className="absolute right-6 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
                              <button 
                                onClick={(event) => {
                                  event.stopPropagation()
                                  openEditModal(lead)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                              >
                                <Users size={14} className="text-gray-400" /> Editar Prospecto
                              </button>
                              {(user?.rol?.nombre === 'administrador' || user?.rol?.nombre === 'gerente_comercial') && (
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    setAssigningLead(lead)
                                    setShowAssignModal(true)
                                    setActiveMenuId(null)
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                >
                                  <Star size={14} className="text-gray-400" /> Asignar Asesor
                                </button>
                              )}
                              <button 
                                onClick={(event) => {
                                  event.stopPropagation()
                                  openStatusModalFromLead(lead)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                              >
                                <Clock size={14} className="text-gray-400" /> Cambiar Etapa
                              </button>
                              <button 
                                onClick={(event) => {
                                  event.stopPropagation()
                                  openHistoryModal(lead)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                              >
                                <MessageSquare size={14} className="text-gray-400" /> Historial
                              </button>
                              <button 
                                onClick={(event) => {
                                  event.stopPropagation()
                                  openHistoryModal(lead, true)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                              >
                                <Calendar size={14} className="text-gray-400" /> Programar seguimiento
                              </button>
                              <button 
                                onClick={(event) => {
                                  event.stopPropagation()
                                  openQuotationModal(lead)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                              >
                                <FileText size={14} className="text-gray-400" /> Generar Cotización
                              </button>
                              <div className="h-px bg-gray-100 my-1" />
                              <button 
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleDeleteLead(lead.id)
                                  setActiveMenuId(null)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                              >
                                <X size={14} /> Eliminar Registro
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          )}
          
          {/* Págination */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
            <span>Pág. {currentPage} de {Math.ceil(totalLeads / PAGE_SIZE) || 1} — {totalLeads} prospectos</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { const p = currentPage - 1; setCurrentPage(p); fetchLeads(p) }}
                disabled={currentPage <= 1 || isLoading}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >Anterior</button>
              <button
                onClick={() => { const p = currentPage + 1; setCurrentPage(p); fetchLeads(p) }}
                disabled={currentPage >= Math.ceil(totalLeads / PAGE_SIZE) || isLoading}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >Siguiente</button>
            </div>
          </div>

        </div>
      </main>

      {selectedLead && (() => {
        const stage = getLeadStage(selectedLead.estadoLead)
        const whatsappUrl = getWhatsAppUrl(selectedLead.telefono)

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 backdrop-blur-sm p-3 sm:p-6">
            <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 sm:px-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0740E4] text-2xl font-black uppercase text-white shadow-lg shadow-blue-900/20">
                      {selectedLead.nombre.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-2xl font-black text-[#01103B]">{selectedLead.empresa || selectedLead.nombre}</h2>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${stage.color}`}>
                          {stage.label}
                        </span>
                        {selectedLead.esCliente && (
                          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                            Cliente
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-500">
                        {selectedLead.empresa ? selectedLead.nombre : 'Prospecto individual'} - {selectedLead.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="rounded-2xl p-2 text-gray-400 transition-colors hover:bg-white hover:text-[#01103B]"
                    aria-label="Cerrar detalle"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto px-5 py-5 sm:px-7">
                <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <section className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="mb-2 text-xs font-black uppercase tracking-wider text-gray-400">Contacto</p>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p className="flex items-center gap-2"><Mail size={16} className="text-[#0740E4]" /> {selectedLead.email}</p>
                          <p className="flex items-center gap-2"><Phone size={16} className="text-[#0740E4]" /> {selectedLead.telefono || 'Teléfono no registrado'}</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="mb-2 text-xs font-black uppercase tracking-wider text-gray-400">Datos comerciales</p>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p className="flex items-center gap-2"><Building2 size={16} className="text-[#FF7101]" /> {selectedLead.empresa || 'Sin empresa'}</p>
                          <p className="flex items-center gap-2"><Briefcase size={16} className="text-[#FF7101]" /> {selectedLead.cargo || 'Cargo no registrado'}</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="mb-2 text-xs font-black uppercase tracking-wider text-gray-400">Oportunidad</p>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p className="flex items-center gap-2"><TrendingUp size={16} className="text-green-600" /> {selectedLead.probabilidad}% de probabilidad</p>
                          <p className="flex items-center gap-2"><DollarSign size={16} className="text-green-600" /> {selectedLead.presupuesto ? `S/ ${Number(selectedLead.presupuesto).toLocaleString('es-PE')}` : 'Presupuesto no definido'}</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="mb-2 text-xs font-black uppercase tracking-wider text-gray-400">Gestión</p>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p className="flex items-center gap-2"><UserCheck size={16} className="text-purple-600" /> {selectedLead.asesor?.nombre || 'Sin asesor asignado'}</p>
                          <p className="flex items-center gap-2"><Calendar size={16} className="text-purple-600" /> Ingreso: {new Date(selectedLead.createdAt).toLocaleDateString('es-PE')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <p className="mb-2 text-xs font-black uppercase tracking-wider text-gray-400">Notas y contexto</p>
                      <p className="min-h-16 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                        {selectedLead.notas || 'Este prospecto aun no tiene notas registradas.'}
                      </p>
                    </div>
                  </section>

                  <aside className="rounded-2xl border border-gray-100 bg-[#01103B] p-5 text-white shadow-sm">
                    <p className="text-xs font-black uppercase tracking-wider text-white/50">Acciones del cliente</p>
                    <h3 className="mt-1 text-xl font-black">Que puedes hacer ahora</h3>
                    <div className="mt-5 grid gap-3">
                      <button onClick={() => openEditModal(selectedLead)} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-left text-sm font-bold text-[#01103B] transition-transform hover:-translate-y-0.5">
                        <span className="flex items-center gap-2"><Edit3 size={17} /> Editar informacion</span>
                      </button>
                      <button onClick={() => openStatusModalFromLead(selectedLead)} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-bold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15">
                        <span className="flex items-center gap-2"><Clock size={17} /> Cambiar etapa</span>
                      </button>
                      <button onClick={() => openHistoryModal(selectedLead)} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-bold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15">
                        <span className="flex items-center gap-2"><MessageSquare size={17} /> Ver historial</span>
                      </button>
                      <button onClick={() => openHistoryModal(selectedLead, true)} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-bold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15">
                        <span className="flex items-center gap-2"><Calendar size={17} /> Programar seguimiento</span>
                      </button>
                      <button onClick={() => openQuotationModal(selectedLead)} className="flex items-center justify-between rounded-2xl bg-[#FF7101] px-4 py-3 text-left text-sm font-black text-white shadow-lg shadow-orange-950/20 transition-transform hover:-translate-y-0.5">
                        <span className="flex items-center gap-2"><FileText size={17} /> Generar cotizacion</span>
                      </button>
                    </div>

                    <div className="my-5 h-px bg-white/10" />

                    <div className="grid gap-3">
                      <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15">
                        <Mail size={17} /> Enviar correo
                      </a>
                      {selectedLead.telefono && (
                        <a href={`tel:${selectedLead.telefono}`} className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15">
                          <Phone size={17} /> Llamar cliente
                        </a>
                      )}
                      {whatsappUrl && (
                        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-2xl bg-green-500 px-4 py-3 text-sm font-black text-white transition-transform hover:-translate-y-0.5">
                          <Send size={17} /> Abrir WhatsApp
                        </a>
                      )}
                      <button onClick={() => handleDeleteLead(selectedLead.id)} className="flex items-center gap-2 rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100 ring-1 ring-red-300/20 transition-colors hover:bg-red-500/25">
                        <Trash2 size={17} /> Eliminar registro
                      </button>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Modal de Creación de Leads */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#01103B]">Nuevo Prospecto</h2>
              <button 
                onClick={closeModal}
                disabled={isSubmitting}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              
              {/* Success Message */}
              {createSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Lead creado exitosamente.</p>
                    <p className="text-xs text-green-600">El prospecto ha sido agregado al sistema.</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {createError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error al crear lead</p>
                    <p className="text-xs text-red-600">{createError}</p>
                  </div>
                </div>
              )}

              {/* Información Básica */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleFormChange}
                      placeholder="Ej: Juan Pérez"
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] transition-all disabled:bg-gray-50"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="correo@empresa.com"
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] transition-all disabled:bg-gray-50"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleFormChange}
                      placeholder="(+51) 960 183 250"
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] transition-all disabled:bg-gray-50"
                    />
                  </div>

                  {/* Empresa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Empresa
                    </label>
                    <input
                      type="text"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleFormChange}
                      placeholder="Nombre de la empresa"
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] transition-all disabled:bg-gray-50"
                    />
                  </div>

                  {/* Cargo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Cargo
                    </label>
                    <input
                      type="text"
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleFormChange}
                      placeholder="Ej: Gerente General"
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] transition-all disabled:bg-gray-50"
                    />
                  </div>

                  {/* Presupuesto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Presupuesto Estimado ($)
                    </label>
                    <input
                      type="number"
                      name="presupuesto"
                      value={formData.presupuesto || ''}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] transition-all disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notas Adicionales
                </label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleFormChange}
                  placeholder="Información relevante del prospecto..."
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] transition-all disabled:bg-gray-50 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || createSuccess}
                  className="flex-1 px-4 py-2.5 bg-[#0740E4] text-white rounded-xl font-medium hover:bg-[#0740E4]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Crear Prospecto
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#01103B]">Editar Prospecto</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditLead} className="p-6 space-y-4">
              {editSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <p className="text-sm font-medium text-green-800 text-center w-full">Actualizado correctamente.</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre Completo</label>
                  <input
                    type="text"
                    value={editFormData.nombre}
                    onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                  <input
                    type="text"
                    value={editFormData.telefono}
                    onChange={(e) => setEditFormData({ ...editFormData, telefono: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Empresa</label>
                  <input
                    type="text"
                    value={editFormData.empresa}
                    onChange={(e) => setEditFormData({ ...editFormData, empresa: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas</label>
                <textarea
                  value={editFormData.notas}
                  onChange={(e) => setEditFormData({ ...editFormData, notas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl h-24 resize-none focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[#0740E4] text-white rounded-xl hover:bg-[#0740E4]/90 transition-colors">
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Asignar Asesor */}
      {showAssignModal && assigningLead && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#01103B]">Asignar Asesor</h2>
              <button onClick={() => {
                setShowAssignModal(false)
                setSelectedAsesor(null)
              }} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Seleccione el asesor responsable para <strong>{assigningLead.nombre}</strong></p>
            
            {loadingAsesores ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-[#0740E4] animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Cargando asesores...</p>
              </div>
            ) : asesores.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-red-600">No hay asesores disponibles</p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {asesores.map(as => (
                  <button 
                    key={as.id}
                    onClick={() => setSelectedAsesor(as.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all ${selectedAsesor === as.id ? 'border-[#0740E4] bg-[#0740E4]/5' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div>
                      <span className="font-semibold text-gray-900">{as.nombre}</span>
                      <p className="text-xs text-gray-500 mt-1">{as.email}</p>
                    </div>
                    {selectedAsesor === as.id && <CheckCircle size={16} className="text-[#0740E4]" />}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedAsesor(null)
                }} 
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                onClick={handleAssignAsesor}
                disabled={!selectedAsesor || isSubmitting || loadingAsesores}
                className="flex-1 px-4 py-2.5 bg-[#0740E4] text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Asignando...
                  </>
                ) : (
                  'Asignar Ahora'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Estado Pipeline */}
      {showStatusModal && statusLead && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#01103B] mb-2">Cambiar Etapa</h2>
            <p className="text-sm text-gray-500 mb-6">Actualizar progreso de venta para <strong>{statusLead.nombre}</strong></p>
            <div className="grid grid-cols-1 gap-2 mb-6 max-h-64 overflow-y-auto">
              {LEAD_STAGES.map(stage => (
                <button 
                  key={stage.value}
                  onClick={() => setSelectedStatus(stage.value)}
                  className={`px-4 py-3 rounded-xl border text-left text-sm font-semibold transition-all ${selectedStatus === stage.value ? 'bg-[#0740E4] border-[#0740E4] text-white shadow-md' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowStatusModal(false)
                  setSelectedStatus('')
                }} 
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl"
                disabled={isSubmitting}
              >
                Cerrar
              </button>
              <button 
                onClick={handleChangeStatus}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-[#0740E4] text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historial de Seguimiento */}
      {showHistoryModal && historyLead && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#01103B]">{historyMode === 'programar' ? 'Programar seguimiento' : 'Historial de seguimiento'}</h2>
                <p className="text-sm text-gray-500">{historyLead.nombre} - {historyLead.email}</p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className={`grid gap-6 p-6 ${historyMode === 'programar' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
              {historyMode === 'programar' && (
              <form onSubmit={handleCreateFollowup} className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Registrar nuevo seguimiento</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
                  <select
                    value={followupForm.tipoSeguimiento}
                    onChange={(e) => setFollowupForm({ ...followupForm, tipoSeguimiento: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20"
                  >
                    <option value="llamada_telefonica">Llamada telefónica</option>
                    <option value="email">Email</option>
                    <option value="reunion">Reunión</option>
                    <option value="visita_sitio">Visita sitio</option>
                    <option value="propuesta_enviada">Propuesta enviada</option>
                    <option value="negociacion">Negociación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción *</label>
                  <textarea
                    value={followupForm.descripción}
                    onChange={(e) => setFollowupForm({ ...followupForm, descripción: e.target.value })}
                    rows={4}
                    placeholder="Ej: Se llam? al lead y solicit? una propuesta..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Resultado</label>
                  <input
                    value={followupForm.resultado}
                    onChange={(e) => setFollowupForm({ ...followupForm, resultado: e.target.value })}
                    placeholder="Ej: Interesado, pendiente de decisión"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Próxima acción</label>
                    <input
                      value={followupForm.proximaAccion}
                      onChange={(e) => setFollowupForm({ ...followupForm, proximaAccion: e.target.value })}
                      placeholder="Ej: Enviar cotización"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha próxima acción</label>
                    <input
                      type="datetime-local"
                      value={followupForm.fechaProximaAccion}
                      onChange={(e) => setFollowupForm({ ...followupForm, fechaProximaAccion: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-[#0740E4] text-white rounded-xl font-medium hover:bg-[#0740E4]/90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Registrar seguimiento'}
                </button>
              </form>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Actividad registrada</h3>
                {isLoadingFollowups ? (
                  <div className="py-10 text-center text-gray-500">Cargando historial...</div>
                ) : followups.length === 0 ? (
                  <div className="py-10 text-center text-gray-500 bg-gray-50 rounded-xl">
                    Este lead aún no tiene seguimientos.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {followups.map((item) => (
                      <div key={item.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/60">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#0740E4]/10 text-[#0740E4] capitalize">
                            {item.tipoSeguimiento.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleString('es-ES')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{item.descripción}</p>
                        {item.resultado && <p className="text-xs text-gray-500 mt-2"><strong>Resultado:</strong> {item.resultado}</p>}
                        {item.proximaAccion && <p className="text-xs text-gray-500 mt-1"><strong>Próxima acción:</strong> {item.proximaAccion}</p>}
                        {item.fechaProximaAccion && <p className="text-xs text-[#FF7101] mt-1"><strong>Programado para:</strong> {new Date(item.fechaProximaAccion).toLocaleString('es-PE')}</p>}
                        {item.usuario && <p className="text-xs text-gray-400 mt-2">Registrado por {item.usuario.nombre}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Generar Cotización */}
      {showQuotationModal && quotationLead && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#01103B]">Generar cotización</h2>
                <p className="text-sm text-gray-500">Datos precargados desde el lead</p>
              </div>
              <button
                onClick={() => setShowQuotationModal(false)}
                disabled={isSubmitting}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="p-6 space-y-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-3">Información del lead</p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Contacto</p>
                    <p className="font-semibold text-gray-800">{quotationLead.nombre}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Empresa</p>
                    <p className="font-semibold text-gray-800">{quotationLead.empresa || 'Cliente individual'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="font-semibold text-gray-800">{quotationLead.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Teléfono</p>
                    <p className="font-semibold text-gray-800">{quotationLead.telefono || 'No especificado'}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción del servicio *</label>
                <textarea
                  value={quotationForm.descripción}
                  onChange={(e) => setQuotationForm({ ...quotationForm, descripción: e.target.value })}
                  rows={3}
                  placeholder="Ej: Desarrollo de página web corporativa"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20 resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={quotationForm.cantidad}
                    onChange={(e) => setQuotationForm({ ...quotationForm, cantidad: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio unitario</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={quotationForm.precioUnitario}
                    onChange={(e) => setQuotationForm({ ...quotationForm, precioUnitario: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Moneda</label>
                  <select
                    value={quotationForm.moneda}
                    onChange={(e) => setQuotationForm({ ...quotationForm, moneda: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20"
                  >
                    <option value="PEN">PEN</option>
                    <option value="USD">USD</option>
                    <option value="COP">COP</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de vencimiento</label>
                  <input
                    type="date"
                    value={quotationForm.fechaVencimiento}
                    onChange={(e) => setQuotationForm({ ...quotationForm, fechaVencimiento: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20"
                  />
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                  <p className="text-xs text-gray-400 font-medium">Total estimado</p>
                  <p className="text-2xl font-bold text-[#01103B]">
                    {quotationForm.moneda} {(Number(quotationForm.cantidad) * Number(quotationForm.precioUnitario || 0)).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas</label>
                <textarea
                  value={quotationForm.notas}
                  onChange={(e) => setQuotationForm({ ...quotationForm, notas: e.target.value })}
                  rows={3}
                  placeholder="Condiciones, alcance o comentarios para la cotización"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowQuotationModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-[#FF7101] text-white rounded-xl font-medium hover:bg-[#FF7101]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Generando...' : 'Generar cotización'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LeadsPage() {
  return (
    <Suspense fallback={null}>
      <LeadsPageContent />
    </Suspense>
  )
}
