'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import Link from 'next/link'
import { 
  FileText, Search, Plus, MoreVertical, 
  ArrowLeft, Download, Eye, Send, CheckCircle2, Clock, XCircle
} from 'lucide-react'

// PDF Generation
import jsPDF from 'jspdf'

// Import dependencies
import { leadsService, LeadResponse } from '@/services/leads.service'
import { quotationsService, QuotationResponse } from '@/services/quotations.service'

const ROLES_PERMITIDOS = ['administrador', 'asesor_ventas', 'gerente_comercial', 'cliente']

const isSyntheticWhatsappEmail = (email?: string) =>
  !email || email.toLowerCase().endsWith('@whatsapp.local')

export default function QuotationsPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  
  // Proteger ruta según rol
  useEffect(() => {
    if (user && !ROLES_PERMITIDOS.includes(user.rol?.nombre || '')) {
      router.push('/dashboard')
    }
  }, [user, router])

  const [searchTerm, setSearchTerm] = useState('')
  const [quotations, setQuotations] = useState<QuotationResponse[]>([])
  const [leads, setLeads] = useState<LeadResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalQuotations, setTotalQuotations] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreatingQuotation, setIsCreatingQuotation] = useState(false)
  const [createForm, setCreateForm] = useState({
    idLead: '',
    descripción: '',
    cantidad: '1',
    precioUnitario: '',
    moneda: 'PEN',
    notas: '',
    fechaVencimiento: ''
  })
  const [leadSearchTerm, setLeadSearchTerm] = useState('')
  const [showLeadResults, setShowLeadResults] = useState(false)
  
  // PDF Ref & State
  const pdfRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [viewingQuotation, setViewingQuotation] = useState<QuotationResponse | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [sendingQuotation, setSendingQuotation] = useState<QuotationResponse | null>(null)
  const [showSendModal, setShowSendModal] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailResult, setEmailResult] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
    sentTo?: string
    quotationCode?: string
  } | null>(null)

  const fetchQuotations = async (page = currentPage) => {
    try {
      setIsLoading(true)
      const response = await quotationsService.getAllQuotations({ page, limit: pageSize })
      setQuotations(response.data)
      setTotalQuotations(response.pagination?.total ?? response.data.length)
      setCurrentPage(response.pagination?.page ?? page)
      setTotalPages(response.pagination?.totalPages ?? 1)
    } catch (error: unknown) {
      console.error('Error fetching quotations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLeads = async () => {
    try {
      const response = await leadsService.getAllLeads(1, 1000)
      setLeads(response.data)
    } catch (error) {
      console.error('Error fetching leads for quotation:', error)
    }
  }

  useEffect(() => {
    if (!token || !user) {
      router.push('/login')
      return
    }
    fetchQuotations(1)
    fetchLeads()
  }, [token, user, router])

  if (!user) return null

  const filteredQuotations = quotations.filter(q => 
    (q.codigo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (q.lead?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (q.lead?.empresa?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const pageStart = totalQuotations === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const pageEnd = Math.min(currentPage * pageSize, totalQuotations)
  const canGoPrevious = currentPage > 1 && !isLoading
  const canGoNext = currentPage < totalPages && !isLoading

  const goToPreviousPage = () => {
    if (!canGoPrevious) return
    fetchQuotations(currentPage - 1)
  }

  const goToNextPage = () => {
    if (!canGoNext) return
    fetchQuotations(currentPage + 1)
  }

  const selectedCreateLead = leads.find((lead) => lead.id === Number(createForm.idLead))
  const filteredCreateLeads = leads
    .filter((lead) => {
      const term = leadSearchTerm.toLowerCase().trim()
      if (!term) return true
      return (
        lead.nombre.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        (lead.empresa || '').toLowerCase().includes(term)
      )
    })
    .slice(0, 8)

  const handleOpenPreview = (quot: QuotationResponse) => {
    setViewingQuotation(quot)
    setShowPreviewModal(true)
  }

  const openCreateModal = () => {
    setCreateForm({
      idLead: '',
      descripción: '',
      cantidad: '1',
      precioUnitario: '',
      moneda: 'PEN',
      notas: '',
      fechaVencimiento: ''
    })
    setLeadSearchTerm('')
    setShowLeadResults(false)
    setShowCreateModal(true)
  }

  const handleCreateQuotation = async (event: React.FormEvent) => {
    event.preventDefault()

    const idLead = Number(createForm.idLead)
    const cantidad = Number(createForm.cantidad)
    const precioUnitario = Number(createForm.precioUnitario)

    if (!idLead) {
      alert('Selecciona un cliente o lead')
      return
    }

    if (!createForm.descripción.trim()) {
      alert('Ingresa la descripción del servicio')
      return
    }

    if (cantidad <= 0 || precioUnitario <= 0) {
      alert('La cantidad y el precio deben ser mayores a cero')
      return
    }

    try {
      setIsCreatingQuotation(true)
      const subtotal = cantidad * precioUnitario
      const numeroCotizacion = `COT-${Date.now()}-${idLead}`
      const quotation = await quotationsService.createQuotation({
        numeroCotizacion,
        idLead,
        montoTotal: subtotal,
        moneda: createForm.moneda,
        notas: createForm.notas.trim() || undefined,
        fechaVencimiento: createForm.fechaVencimiento
          ? new Date(`${createForm.fechaVencimiento}T23:59:59`).toISOString()
          : undefined
      })

      await quotationsService.addQuotationItem(quotation.id, {
        descripción: createForm.descripción.trim(),
        cantidad,
        precioUnitario
      })

      setShowCreateModal(false)
      await fetchQuotations(1)
      alert('Cotización creada correctamente')
    } catch (error: unknown) {
      const err = error as { message?: string }
      alert(`Error al crear cotizacion: ${err.message || 'Error desconocido'}`)
    } finally {
      setIsCreatingQuotation(false)
    }
  }

  const handleDownloadPDF = async (quot?: QuotationResponse) => {
    const quotation = quot || viewingQuotation
    if (!quotation) {
      alert('No se encontró la cotización para descargar.')
      return
    }

    if (quot) {
      setViewingQuotation(quot)
      setShowPreviewModal(true)
    }

    await executeDownload(quotation)
  }

  const executeDownload = async (quotation: QuotationResponse) => {
    const customerName = quotation.lead?.nombre || 'Cliente'
    const customerCompany = quotation.lead?.empresa || 'Cliente individual'
    const customerEmail = quotation.lead?.email || 'Sin correo'
    const customerPhone = quotation.lead?.telefono || 'No especificado'
    const total = Number(quotation.total || quotation.montoTotal || 0)
    const subtotal = Number(quotation.subtotal || total)
    const taxes = Number(quotation.impuestos || Math.max(total - subtotal, 0))
    const items = quotation.items && quotation.items.length > 0
      ? quotation.items
      : [{
          descripción: quotation.notasAdicionales || quotation.notas || 'Servicio profesional EduPro',
          cantidad: 1,
          precioUnitario: total,
          subtotal: total
        }]
    
    try {
      setIsGeneratingPDF(true)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const margin = 16
      let y = 18

      pdf.setFillColor(1, 16, 59)
      pdf.rect(0, 0, pageWidth, 42, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(22)
      pdf.text('EduPro Digitales', margin, y)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Soluciones digitales, ventas y automatizacion', margin, y + 7)

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.text('COTIZACION', pageWidth - margin, y, { align: 'right' })
      pdf.setFontSize(10)
      pdf.text(`#${quotation.codigo}`, pageWidth - margin, y + 8, { align: 'right' })

      y = 56
      pdf.setTextColor(1, 16, 59)
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Cliente', margin, y)
      pdf.text('Datos de la cotizacion', pageWidth / 2 + 8, y)

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(70, 80, 100)
      y += 8
      pdf.text(customerName, margin, y)
      pdf.text(`Fecha: ${new Date(quotation.fechaEmision || quotation.createdAt).toLocaleDateString('es-PE')}`, pageWidth / 2 + 8, y)
      y += 6
      pdf.text(customerCompany, margin, y)
      pdf.text(`Estado: ${quotation.estadoCotizacion || quotation.estado || 'borrador'}`, pageWidth / 2 + 8, y)
      y += 6
      pdf.text(customerEmail, margin, y)
      pdf.text(`Moneda: ${quotation.moneda || 'PEN'}`, pageWidth / 2 + 8, y)
      y += 6
      pdf.text(customerPhone, margin, y)

      y += 16
      pdf.setFillColor(255, 113, 1)
      pdf.rect(margin, y, pageWidth - margin * 2, 10, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.text('DESCRIPCION', margin + 3, y + 6.5)
      pdf.text('CANT.', 128, y + 6.5, { align: 'right' })
      pdf.text('PRECIO', 160, y + 6.5, { align: 'right' })
      pdf.text('SUBTOTAL', pageWidth - margin - 3, y + 6.5, { align: 'right' })

      y += 16
      pdf.setTextColor(1, 16, 59)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      items.forEach((item) => {
        const itemData = item as typeof item & { descripcion?: string; ['descripcion']?: string }
        const description = itemData.descripción || itemData.descripcion || itemData['descripcion'] || 'Servicio EduPro'
        const quantity = Number(item.cantidad || 1)
        const unitPrice = Number(item.precioUnitario || item.subtotal || total)
        const lineSubtotal = Number(item.subtotal || quantity * unitPrice)
        const lines = pdf.splitTextToSize(description, 92)

        pdf.text(lines, margin + 3, y)
        pdf.text(String(quantity), 128, y, { align: 'right' })
        pdf.text(`${quotation.moneda || 'PEN'} ${unitPrice.toFixed(2)}`, 160, y, { align: 'right' })
        pdf.text(`${quotation.moneda || 'PEN'} ${lineSubtotal.toFixed(2)}`, pageWidth - margin - 3, y, { align: 'right' })
        y += Math.max(12, lines.length * 5 + 6)
      })

      y += 8
      pdf.setDrawColor(230, 232, 240)
      pdf.line(margin, y, pageWidth - margin, y)
      y += 10
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(70, 80, 100)
      pdf.text('Subtotal', 145, y, { align: 'right' })
      pdf.text(`${quotation.moneda || 'PEN'} ${subtotal.toFixed(2)}`, pageWidth - margin, y, { align: 'right' })
      y += 7
      pdf.text('Impuestos', 145, y, { align: 'right' })
      pdf.text(`${quotation.moneda || 'PEN'} ${taxes.toFixed(2)}`, pageWidth - margin, y, { align: 'right' })
      y += 9
      pdf.setFontSize(14)
      pdf.setTextColor(255, 113, 1)
      pdf.text('TOTAL', 145, y, { align: 'right' })
      pdf.text(`${quotation.moneda || 'PEN'} ${total.toFixed(2)}`, pageWidth - margin, y, { align: 'right' })

      y += 18
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(90, 100, 120)
      const notes = quotation.notasAdicionales || quotation.notas
      if (notes) {
        pdf.setFont('helvetica', 'bold')
        pdf.text('Notas', margin, y)
        y += 6
        pdf.setFont('helvetica', 'normal')
        pdf.text(pdf.splitTextToSize(notes, pageWidth - margin * 2), margin, y)
      }

      pdf.setFontSize(8)
      pdf.setTextColor(140, 148, 165)
      pdf.text('EduPro Digitales - Documento generado desde EduPro CRM', margin, 286)

      const safeName = customerName.replace(/[^\w-]+/g, '_')
      pdf.save(`Cotizacion_${quotation.codigo}_${safeName}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('No se pudo generar el PDF. Revisa la cotización e inténtalo nuevamente.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const getEmailSubject = (quotation: QuotationResponse) =>
    `Cotización ${quotation.codigo} - EduPro`

  const getEmailBody = (quotation: QuotationResponse) =>
    [
      `Hola ${quotation.lead?.nombre || 'cliente'},`,
      '',
      `Te compartimos la cotización ${quotation.codigo} preparada por EduPro.`,
      `Monto total: ${quotation.moneda || 'PEN'} ${Number(quotation.total).toFixed(2)}.`,
      '',
      'Adjuntamos/compartimos el PDF de la propuesta para tu revisión.',
      'Quedamos atentos a tus comentarios para avanzar con el siguiente paso.',
      '',
      'Saludos,',
      'Equipo Comercial EduPro'
    ].join('\n')

  const openSendModal = (quotation: QuotationResponse) => {
    setSendingQuotation(quotation)
    setViewingQuotation(quotation)
    setShowSendModal(true)
  }

  const openEmailDraft = async () => {
    if (!sendingQuotation?.lead?.email) return
    const mailto = `mailto:${sendingQuotation.lead.email}?subject=${encodeURIComponent(getEmailSubject(sendingQuotation))}&body=${encodeURIComponent(getEmailBody(sendingQuotation))}`
    window.location.href = mailto
  }

  const openWhatsappDraft = () => {
    if (!sendingQuotation?.lead?.telefono) return
    const phone = sendingQuotation.lead.telefono.replace(/\D/g, '')
    const text = [
      `Hola ${sendingQuotation.lead.nombre}, te comparto la cotización ${sendingQuotation.codigo} de EduPro.`,
      `Monto total: ${sendingQuotation.moneda || 'PEN'} ${Number(sendingQuotation.total).toFixed(2)}.`,
      'Ya tienes el PDF para revisarlo. Quedo atento a tus comentarios.'
    ].join('\n')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  const markAsSent = async () => {
    if (!sendingQuotation) return
    try {
      const updated = await quotationsService.changeStatus(
        sendingQuotation.id,
        'enviada',
        'Cotización enviada al cliente desde el panel de cotizaciones.'
      )
      setQuotations(quotations.map(q => q.id === updated.id ? updated : q))
      setSendingQuotation(updated)
      alert('Cotización marcada como enviada')
    } catch (error: unknown) {
      const err = error as { message?: string }
      alert(`Error al marcar como enviada: ${err.message || 'Error desconocido'}`)
    }
  }

  const markAsAccepted = async (quotation: QuotationResponse) => {
    try {
      const updated = await quotationsService.changeStatus(
        quotation.id,
        'aceptada',
        'Cotización aceptada por el cliente. Lead actualizado a aceptado.'
      )
      setQuotations(quotations.map(q => q.id === updated.id ? updated : q))
      if (sendingQuotation?.id === updated.id) {
        setSendingQuotation(updated)
      }
      alert('Cotización marcada como aceptada y lead actualizado')
    } catch (error: unknown) {
      const err = error as { message?: string }
      alert(`Error al marcar como aceptada: ${err.message || 'Error desconocido'}`)
    }
  }

  const markAsRejected = async (quotation: QuotationResponse) => {
    try {
      const updated = await quotationsService.changeStatus(
        quotation.id,
        'rechazada',
        'Cotización rechazada por el cliente. Lead guardado para futuras promociones.'
      )
      setQuotations(quotations.map(q => q.id === updated.id ? updated : q))
      alert('Cotizacion marcada como rechazada y guardada para promociones')
    } catch (error: unknown) {
      const err = error as { message?: string }
      alert(`Error al marcar como rechazada: ${err.message || 'Error desconocido'}`)
    }
  }

  const sendEmailDirectly = async () => {
    if (!sendingQuotation) return
    if (isSyntheticWhatsappEmail(sendingQuotation.lead?.email)) {
      setEmailResult({
        type: 'error',
        title: 'Correo real pendiente',
        message: 'Este lead no tiene un correo real registrado. Actualiza el correo del cliente antes de enviar la cotización.',
        quotationCode: sendingQuotation.codigo
      })
      return
    }

    try {
      setIsSendingEmail(true)
      const result = await quotationsService.sendByEmail(sendingQuotation.id)
      setQuotations(quotations.map(q => q.id === result.quotation.id ? result.quotation : q))
      setSendingQuotation(result.quotation)
      setShowSendModal(false)
      setEmailResult({
        type: 'success',
        title: 'Correo enviado al cliente',
        message: 'La cotización fue enviada con su PDF adjunto desde el correo empresarial configurado. El registro quedó actualizado en el CRM.',
        sentTo: result.sentTo,
        quotationCode: result.quotation.codigo
      })
    } catch (error: unknown) {
      const err = error as { message?: string }
      setEmailResult({
        type: 'error',
        title: 'No se pudo enviar la cotización',
        message: err.message || 'Ocurrió un error desconocido al enviar el correo.',
        sentTo: sendingQuotation.lead?.email,
        quotationCode: sendingQuotation.codigo
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const formatDateTime = (value?: string) => {
    if (!value) return null
    return new Date(value).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
              <h1 className="text-lg font-bold text-[#01103B] leading-none">Gestión de Cotizaciones</h1>
            </div>
          </div>
          
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#FF7101] hover:bg-[#FF7101]/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nueva Cotización</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-2 py-8 sm:px-4 lg:px-6 xl:px-8">
        
        {/* KPI / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Cotizaciones Enviadas', val: quotations.filter(q => q.estadoCotizacion === 'enviada').length.toString(), change: 'Este mes', color: '#0740E4', icon: Send },
            { label: 'Total Registros', val: totalQuotations.toString(), change: 'En sistema', color: '#34A853', icon: CheckCircle2 },
            { label: 'En Borrador', val: quotations.filter(q => q.estadoCotizacion === 'borrador').length.toString(), change: 'Pendientes de envío', color: '#FF7101', icon: FileText },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: s.color + '15', color: s.color }}>
                <s.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{isLoading ? '-' : s.val}</p>
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                <p className="text-xs text-gray-400 mt-1">{s.change}</p>
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
                placeholder="Buscar por cliente o N° cotización..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-6 py-4">N° Cotización</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Detalles</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                         <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#FF7101] animate-spin mb-2" />
                         Cargando cotizaciones...
                      </div>
                    </td>
                  </tr>
                ) : filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron cotizaciones.
                    </td>
                  </tr>
                ) : filteredQuotations.map((quot) => {
                  
                  let badgeColor = 'bg-gray-100 text-gray-700 border-gray-200'
                  let StatusIcon = Clock
                  
                  if (quot.estadoCotizacion === 'borrador') { badgeColor = 'bg-gray-50 text-gray-600 border-gray-200'; StatusIcon = FileText }
                  if (quot.estadoCotizacion === 'enviada') { badgeColor = 'bg-blue-50 text-blue-700 border-blue-200'; StatusIcon = Send }
                  if (quot.estadoCotizacion === 'aceptada') { badgeColor = 'bg-green-50 text-green-700 border-green-200'; StatusIcon = CheckCircle2 }
                  if (quot.estadoCotizacion === 'rechazada') { badgeColor = 'bg-red-50 text-red-700 border-red-200'; StatusIcon = XCircle }
                  
                  return (
                    <tr key={quot.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-gray-400" />
                          <span className="font-mono font-bold text-[#01103B]">{quot.codigo}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Emitida: {new Date(quot.fechaEmision).toLocaleDateString('es-ES')}</p>
                        {quot.enviadoEn && (
                          <p className="text-xs text-blue-600 mt-1">Enviada: {formatDateTime(quot.enviadoEn)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{quot.lead?.empresa || quot.lead?.nombre}</p>
                        {quot.lead?.empresa && <p className="text-xs text-gray-500">{quot.lead?.nombre}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[#FF7101]">S/ {Number(quot.total).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">{quot.items?.length || 0} items en paquete</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${badgeColor}`}>
                          <StatusIcon size={12} />
                          {quot.estadoCotizacion}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleOpenPreview(quot)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Vista Previa PDF"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleDownloadPDF(quot)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                            title="Descargar PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button 
                            onClick={() => openSendModal(quot)}
                            className="p-2 text-gray-400 hover:text-[#FF7101] hover:bg-orange-50 rounded-lg transition-colors" 
                            title="Enviar al cliente"
                          >
                            <Send size={16} />
                          </button>
                          {quot.estadoCotizacion !== 'aceptada' && (
                            <button 
                              onClick={() => markAsAccepted(quot)}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                              title="Marcar como aceptada"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          {quot.estadoCotizacion !== 'rechazada' && (
                            <button 
                              onClick={() => markAsRejected(quot)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                              title="Marcar como rechazada"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                          <button className="p-2 text-gray-400 hover:text-[#01103B] hover:bg-gray-100 rounded-lg transition-colors" title="Opciones">
                            <MoreVertical size={16} />
                          </button>
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
            <span>
              Mostrando {pageStart}-{pageEnd} de {totalQuotations} cotizaciones
              {searchTerm.trim() && ` (${filteredQuotations.length} visibles por busqueda)`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={!canGoPrevious}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-2 text-xs font-semibold text-gray-400">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={goToNextPage}
                disabled={!canGoNext}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>

        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-[#01103B]">Nueva Cotización</h2>
                  <p className="text-sm text-gray-500">Selecciona un lead y registra el servicio a cotizar.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreatingQuotation}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                >
                  <Plus size={22} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreateQuotation} className="max-h-[calc(92vh-73px)] overflow-y-auto p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Cliente / lead *</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                      <input
                        value={leadSearchTerm}
                        onFocus={() => setShowLeadResults(true)}
                        onChange={(event) => {
                          setLeadSearchTerm(event.target.value)
                          setShowLeadResults(true)
                        }}
                        placeholder="Buscar por nombre, empresa o correo..."
                        className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#FF7101] focus:ring-2 focus:ring-[#FF7101]/20"
                        disabled={isCreatingQuotation}
                      />

                      {showLeadResults && leadSearchTerm.trim() && (
                        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                          {filteredCreateLeads.length === 0 ? (
                            <div className="px-3 py-4 text-center text-sm text-gray-500">No se encontraron leads.</div>
                          ) : (
                            filteredCreateLeads.map((lead) => {
                              const active = createForm.idLead === String(lead.id)

                              return (
                                <button
                                  key={lead.id}
                                  type="button"
                                  onClick={() => {
                                    setCreateForm((current) => ({ ...current, idLead: String(lead.id) }))
                                    setLeadSearchTerm(`${lead.empresa || lead.nombre} - ${lead.email}`)
                                    setShowLeadResults(false)
                                  }}
                                  disabled={isCreatingQuotation}
                                  className={`mb-1 flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors last:mb-0 ${
                                    active ? 'bg-[#FF7101] text-white' : 'hover:bg-orange-50'
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <p className={`truncate text-sm font-bold ${active ? 'text-white' : 'text-[#01103B]'}`}>{lead.empresa || lead.nombre}</p>
                                    <p className={`truncate text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>{lead.nombre} - {lead.email}</p>
                                  </div>
                                  {active && <CheckCircle2 size={17} className="shrink-0" />}
                                </button>
                              )
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {selectedCreateLead && (
                      <p className="mt-2 text-xs font-semibold text-[#FF7101]">
                        Seleccionado: {selectedCreateLead.empresa || selectedCreateLead.nombre}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Descripción del servicio *</label>
                    <textarea
                      value={createForm.descripción}
                      onChange={(event) => setCreateForm((current) => ({ ...current, descripción: event.target.value }))}
                      rows={3}
                      placeholder="Ej: Desarrollo de página web corporativa"
                      className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#FF7101] focus:ring-2 focus:ring-[#FF7101]/20"
                      disabled={isCreatingQuotation}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Cantidad *</label>
                    <input
                      type="number"
                      min="1"
                      value={createForm.cantidad}
                      onChange={(event) => setCreateForm((current) => ({ ...current, cantidad: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#FF7101] focus:ring-2 focus:ring-[#FF7101]/20"
                      disabled={isCreatingQuotation}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Precio unitario *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={createForm.precioUnitario}
                      onChange={(event) => setCreateForm((current) => ({ ...current, precioUnitario: event.target.value }))}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#FF7101] focus:ring-2 focus:ring-[#FF7101]/20"
                      disabled={isCreatingQuotation}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Moneda</label>
                    <select
                      value={createForm.moneda}
                      onChange={(event) => setCreateForm((current) => ({ ...current, moneda: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#FF7101] focus:ring-2 focus:ring-[#FF7101]/20"
                      disabled={isCreatingQuotation}
                    >
                      <option value="PEN">PEN</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Fecha de vencimiento</label>
                    <input
                      type="date"
                      value={createForm.fechaVencimiento}
                      onChange={(event) => setCreateForm((current) => ({ ...current, fechaVencimiento: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#FF7101] focus:ring-2 focus:ring-[#FF7101]/20"
                      disabled={isCreatingQuotation}
                    />
                  </div>

                  <div className="sm:col-span-2 rounded-xl border border-orange-100 bg-orange-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#FF7101]">Total estimado</p>
                    <p className="mt-1 text-2xl font-black text-[#01103B]">
                      {createForm.moneda} {(Number(createForm.cantidad || 0) * Number(createForm.precioUnitario || 0)).toFixed(2)}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Notas</label>
                    <textarea
                      value={createForm.notas}
                      onChange={(event) => setCreateForm((current) => ({ ...current, notas: event.target.value }))}
                      rows={3}
                      placeholder="Condiciones, alcance o comentarios"
                      className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#FF7101] focus:ring-2 focus:ring-[#FF7101]/20"
                      disabled={isCreatingQuotation}
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isCreatingQuotation}
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingQuotation}
                    className="flex-1 rounded-xl bg-[#FF7101] px-4 py-3 font-semibold text-white hover:bg-[#FF7101]/90 disabled:opacity-50"
                  >
                    {isCreatingQuotation ? 'Creando...' : 'Crear Cotización'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PDF Preview Modal */}
        {showPreviewModal && viewingQuotation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-gray-100 w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-white px-8 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0740E4]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#01103B]">Vista Previa: {viewingQuotation.codigo}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                      {viewingQuotation.enviadoEn ? `Enviada: ${formatDateTime(viewingQuotation.enviadoEn)}` : 'Documento generado por EduPro CRM'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDownloadPDF()}
                    disabled={isGeneratingPDF}
                    className="px-4 py-2 rounded-xl bg-[#01103B] text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingPDF ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
                  </button>
                  <button 
                    onClick={() => setShowPreviewModal(false)}
                    className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
                  >
                    <Plus size={20} className="rotate-45" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-gray-200/50">
                {/* PDF Page to Capture */}
                <div ref={pdfRef} className="bg-white w-full max-w-[210mm] shadow-lg p-16 min-h-[297mm] flex flex-col font-sans">
                  {/* PDF Header */}
                  <div className="flex justify-between items-start mb-16">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF7101] to-[#FF9D50] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[#FF7101]/30">E</div>
                        <div>
                          <h2 className="text-2xl font-black text-[#01103B] leading-none mb-1">EduPro</h2>
                          <p className="text-[10px] font-bold text-[#FF7101] tracking-[0.2em] uppercase">Digital Excellence</p>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 leading-relaxed font-medium">
                        <p>EduPro Digitales S.A.C.</p>
                        <p>RUC: 20601234567</p>
                        <p>Av. Principal 123, Piura - Perú</p>
                        <p>digitalesedupro.com</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h1 className="text-4xl font-black text-[#01103B] mb-2 uppercase tracking-tighter">COTIZACIÓN</h1>
                      <div className="inline-block px-4 py-1.5 bg-gray-100 rounded-xl text-sm font-mono font-bold text-gray-600 mb-2 border border-gray-200">
                        #{viewingQuotation.codigo}
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Fecha de Emisión</p>
                      <p className="text-xs text-[#01103B] font-bold">{new Date(viewingQuotation.fechaEmision).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      {viewingQuotation.enviadoEn && (
                        <>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3">Fecha de Envío</p>
                          <p className="text-xs text-[#0740E4] font-bold">{formatDateTime(viewingQuotation.enviadoEn)}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="bg-gray-50 rounded-[24px] p-6 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Información del Cliente</p>
                      <p className="text-lg font-black text-[#01103B] mb-1">{viewingQuotation.lead?.nombre}</p>
                      <p className="text-sm font-bold text-[#FF7101] mb-2">{viewingQuotation.lead?.empresa || 'Cliente Individual'}</p>
                      <div className="h-px bg-gray-200 w-12 mb-3" />
                      <p className="text-[11px] text-gray-500 flex items-center gap-2 mb-1">
                        <span className="w-1 h-1 rounded-full bg-gray-300" /> {viewingQuotation.lead?.email}
                      </p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-300" /> {viewingQuotation.lead?.telefono || 'No especificado'}
                      </p>
                    </div>
                    <div className="bg-[#01103B] rounded-[24px] p-6 text-white relative overflow-hidden">
                       <div className="absolute right-[-20px] bottom-[-20px] w-24 h-24 bg-white/5 rounded-full" />
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Consultor a Cargo</p>
                       <p className="text-lg font-bold mb-1">Equipo Comercial EduPro</p>
                       <p className="text-sm text-[#FF7101] mb-4">Especialistas en Ventas</p>
                       <p className="text-[10px] text-white/60">ventas@digitalesedupro.com</p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="flex-1">
                    <table className="w-full text-left mb-12">
                      <thead>
                        <tr className="border-b-2 border-[#01103B] text-[10px] font-black text-[#01103B] uppercase tracking-widest">
                          <th className="py-5 px-3">Descripción del Servicio / Paquete</th>
                          <th className="py-5 px-3 text-center">Cantidad</th>
                          <th className="py-5 px-3 text-right">Precio Unit.</th>
                          <th className="py-5 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {viewingQuotation.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-8 px-3">
                              <p className="font-black text-[#01103B] text-base mb-1.5">{item.descripción}</p>
                              <div className="flex gap-4">
                                <p className="text-[10px] text-gray-400 leading-relaxed max-w-sm">
                                  Incluye diseño responsivo, optimización SEO, integración con CRM EduPro y 1 año de hosting premium.
                                </p>
                              </div>
                            </td>
                            <td className="py-8 px-3 text-center text-sm font-black text-gray-600">{item.cantidad}</td>
                            <td className="py-8 px-3 text-right text-sm font-bold text-gray-500">S/ {Number(item.precioUnitario).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="py-8 px-3 text-right text-base font-black text-[#01103B]">S/ {(item.cantidad * Number(item.precioUnitario)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Section */}
                  <div className="flex justify-between items-end mb-16 gap-8">
                    <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Notas Adicionales</p>
                       <p className="text-[10px] text-gray-500 leading-relaxed">
                         Esta cotización es una propuesta preliminar sujeta a cambios tras la reunión de diagnóstico final. 
                         Los precios no incluyen impuestos de ley salvo indicación expresa.
                       </p>
                    </div>
                    <div className="w-72 space-y-3">
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span>Base Imponible</span>
                        <span className="text-gray-900">S/ {(Number(viewingQuotation.total) * 0.82).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span>IGV (18%)</span>
                        <span className="text-gray-900">S/ {(Number(viewingQuotation.total) * 0.18).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="pt-5 border-t-4 border-[#01103B] flex justify-between items-center">
                        <span className="font-black text-[#01103B] uppercase text-sm tracking-tighter">Total Inversión</span>
                        <span className="text-3xl font-black text-[#FF7101]">S/ {Number(viewingQuotation.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer / Branding */}
                  <div className="pt-12 border-t-2 border-gray-100 mt-auto">
                    <div className="flex justify-between items-center">
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        <p>© 2026 EduPro Digitales - Impulsando tu Crecimiento</p>
                      </div>
                      <div className="flex gap-4 grayscale opacity-30">
                        <div className="w-6 h-6 bg-gray-400 rounded-full" />
                        <div className="w-6 h-6 bg-gray-400 rounded-full" />
                        <div className="w-6 h-6 bg-gray-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSendModal && sendingQuotation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#01103B]">Enviar cotización</h3>
                  <p className="text-xs text-gray-500">{sendingQuotation.codigo} · {sendingQuotation.lead?.nombre}</p>
                  {sendingQuotation.enviadoEn && (
                    <p className="text-xs text-blue-600 mt-1">Enviada: {formatDateTime(sendingQuotation.enviadoEn)}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                  <p className="text-sm font-semibold text-[#01103B] mb-1">Envío directo por correo empresarial</p>
                  <p className="text-xs text-gray-600">
                    El sistema generará el PDF y lo enviará al correo real del cliente usando el Gmail configurado de la empresa.
                  </p>
                </div>

                {isSyntheticWhatsappEmail(sendingQuotation.lead?.email) && (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm font-bold text-red-700">Correo real pendiente</p>
                    <p className="mt-1 text-xs leading-5 text-red-600">
                      Este lead fue creado desde WhatsApp y tiene un correo temporal. Actualiza el correo real del cliente para poder enviar la cotizacion.
                    </p>
                  </div>
                )}

                <div className="grid gap-3">
                  <button
                    onClick={sendEmailDirectly}
                    disabled={isSendingEmail || isSyntheticWhatsappEmail(sendingQuotation.lead?.email)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FF7101] text-white hover:bg-[#FF7101]/90 text-left flex items-center gap-3 disabled:opacity-50"
                  >
                    <Send size={18} />
                    <div>
                      <p className="text-sm font-semibold">{isSendingEmail ? 'Enviando correo...' : 'Enviar ahora al correo del cliente'}</p>
                      <p className="text-xs text-white/80">
                        {isSyntheticWhatsappEmail(sendingQuotation.lead?.email)
                          ? 'Registra un correo real del cliente.'
                          : sendingQuotation.lead?.email}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(sendingQuotation)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-left flex items-center gap-3"
                  >
                    <Download size={18} className="text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Generar y descargar PDF</p>
                      <p className="text-xs text-gray-500">Crea el documento profesional de la cotización.</p>
                    </div>
                  </button>

                  <button
                    onClick={openEmailDraft}
                    disabled={!sendingQuotation.lead?.email}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-left flex items-center gap-3 disabled:opacity-50"
                  >
                    <Send size={18} className="text-[#0740E4]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Abrir correo redactado</p>
                      <p className="text-xs text-gray-500">{sendingQuotation.lead?.email || 'El lead no tiene correo registrado.'}</p>
                    </div>
                  </button>

                  <button
                    onClick={openWhatsappDraft}
                    disabled={!sendingQuotation.lead?.telefono}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-left flex items-center gap-3 disabled:opacity-50"
                  >
                    <Send size={18} className="text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Abrir WhatsApp redactado</p>
                      <p className="text-xs text-gray-500">{sendingQuotation.lead?.telefono || 'El lead no tiene teléfono registrado.'}</p>
                    </div>
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={markAsSent}
                    className="px-4 py-2.5 rounded-xl bg-[#FF7101] text-white font-semibold hover:bg-[#FF7101]/90"
                  >
                    Marcar enviada
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {emailResult && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className={`${emailResult.type === 'success' ? 'bg-[#01103B]' : 'bg-red-700'} px-6 py-5 text-white`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${emailResult.type === 'success' ? 'bg-[#34A853]/20 text-[#8EF0AA]' : 'bg-white/15 text-white'}`}>
                      {emailResult.type === 'success' ? <CheckCircle2 size={25} /> : <XCircle size={25} />}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-white/60">
                        {emailResult.quotationCode || 'Cotización'}
                      </p>
                      <h3 className="mt-1 text-lg font-black">{emailResult.title}</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailResult(null)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Cerrar confirmación"
                  >
                    <Plus size={22} className="rotate-45" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 px-6 py-5">
                <p className="text-sm leading-6 text-gray-600">{emailResult.message}</p>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Destino</p>
                  <p className="mt-1 break-all text-sm font-black text-[#01103B]">
                    {emailResult.sentTo || 'Correo no disponible'}
                  </p>
                  {emailResult.type === 'success' && (
                    <p className="mt-2 text-xs font-semibold text-[#34A853]">
                      PDF adjunto enviado correctamente.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setEmailResult(null)}
                    className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-500 transition-colors hover:bg-gray-50"
                  >
                    Aceptar
                  </button>
                  {emailResult.type === 'success' && sendingQuotation ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEmailResult(null)
                        handleOpenPreview(sendingQuotation)
                      }}
                      className="rounded-2xl bg-[#FF7101] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#FF7101]/20 transition-colors hover:bg-[#e86600]"
                    >
                      Ver cotización
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEmailResult(null)
                        setShowSendModal(true)
                      }}
                      className="rounded-2xl bg-[#01103B] px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/20 transition-colors hover:opacity-90"
                    >
                      Revisar envío
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
