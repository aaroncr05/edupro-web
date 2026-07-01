'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  Headphones,
  Printer,
  TrendingUp,
  Users,
  XCircle
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { leadsService, LeadResponse } from '@/services/leads.service'
import { quotationsService, QuotationResponse } from '@/services/quotations.service'
import { casesService, CaseResponse } from '@/services/cases.service'

const ROLES_PERMITIDOS = ['administrador', 'asesor_ventas', 'gerente_comercial', 'atencion_cliente', 'cliente']

const leadLabels: Record<string, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  interesado: 'Interesado',
  propuesta_enviada: 'Cotización enviada',
  convertido: 'Aceptado',
  rechazado: 'No aceptado',
  perdido: 'Perdido'
}

const quoteLabels: Record<string, string> = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  vista: 'Vista',
  aceptada: 'Aceptada',
  rechazada: 'No aceptada',
  expirada: 'Expirada'
}

const caseLabels: Record<string, string> = {
  abierto: 'Abierto',
  en_progreso: 'En progreso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado'
}

const formatMoney = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const getCaseStatus = (item: CaseResponse) => {
  const record = item as CaseResponse & { estado?: string }
  return item.estadoCaso || record.estado || 'abierto'
}

const normalizeRole = (role?: string) =>
  (role || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace('atencion_cliente', 'atencion_cliente')

const countBy = <T,>(items: T[], getter: (item: T) => string) =>
  items.reduce<Record<string, number>>((acc, item) => {
    const key = getter(item) || 'sin_estado'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

const getMonthKey = (dateValue?: string) => {
  const date = dateValue ? new Date(dateValue) : new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const lastSixMonths = () => {
  const now = new Date()
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    return {
      key: getMonthKey(date.toISOString()),
      label: date.toLocaleDateString('es-PE', { month: 'short' })
    }
  })
}

export default function ReportsPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [leads, setLeads] = useState<LeadResponse[]>([])
  const [quotations, setQuotations] = useState<QuotationResponse[]>([])
  const [cases, setCases] = useState<CaseResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reportRange, setReportRange] = useState<'month' | 'six_months' | 'all'>('all')

  useEffect(() => {
    if (user && !ROLES_PERMITIDOS.includes(normalizeRole(user.rol?.nombre))) {
      router.push('/dashboard')
    }
  }, [user, router])

  const fetchReportsData = async () => {
    try {
      setIsLoading(true)
      const [leadsRes, quotRes, casesRes] = await Promise.all([
        leadsService.getAllLeads(1, 1000),
        quotationsService.getAllQuotations({ page: 1, limit: 1000 }),
        casesService.getAllCases({ page: 1, limit: 1000 })
      ])

      setLeads(leadsRes.data)
      setQuotations(quotRes.data)
      setCases(casesRes.data)
    } catch (error) {
      console.error('Error fetching reports data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!token || !user) {
      router.push('/login')
      return
    }

    fetchReportsData()
  }, [token, user, router])

  const rangeStart = useMemo(() => {
    const now = new Date()
    if (reportRange === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
    if (reportRange === 'six_months') return new Date(now.getFullYear(), now.getMonth() - 5, 1)
    return null
  }, [reportRange])

  const isInRange = (dateValue?: string) => {
    if (!rangeStart) return true
    const date = dateValue ? new Date(dateValue) : new Date()
    return date >= rangeStart
  }

  const scopedLeads = useMemo(() => leads.filter((lead) => isInRange(lead.createdAt)), [leads, rangeStart])
  const scopedQuotations = useMemo(() => quotations.filter((quote) => isInRange(quote.createdAt)), [quotations, rangeStart])
  const scopedCases = useMemo(() => cases.filter((item) => isInRange(item.createdAt)), [cases, rangeStart])

  const report = useMemo(() => {
    const leadsByStatus = countBy(scopedLeads, (lead) => lead.estadoLead)
    const quotesByStatus = countBy(scopedQuotations, (quote) => quote.estadoCotizacion)
    const casesByStatus = countBy(scopedCases, getCaseStatus)
    const casesByPriority = countBy(scopedCases, (item) => item.prioridad || 'media')
    const months = lastSixMonths()

    const acceptedQuotes = scopedQuotations.filter((quote) => quote.estadoCotizacion === 'aceptada')
    const rejectedQuotes = scopedQuotations.filter((quote) => quote.estadoCotizacion === 'rechazada')
    const sentQuotes = scopedQuotations.filter((quote) => ['enviada', 'vista', 'aceptada', 'rechazada'].includes(quote.estadoCotizacion))
    const acceptedAmount = acceptedQuotes.reduce((acc, quote) => acc + Number(quote.total || quote.montoTotal || 0), 0)
    const totalQuotedAmount = scopedQuotations.reduce((acc, quote) => acc + Number(quote.total || quote.montoTotal || 0), 0)
    const openCases = scopedCases.filter((item) => ['abierto', 'en_progreso'].includes(getCaseStatus(item))).length
    const closedCases = scopedCases.filter((item) => ['resuelto', 'cerrado'].includes(getCaseStatus(item))).length

    const monthly = months.map((month) => {
      const monthLeads = scopedLeads.filter((lead) => getMonthKey(lead.createdAt) === month.key).length
      const monthAccepted = scopedQuotations.filter((quote) => quote.estadoCotizacion === 'aceptada' && getMonthKey(quote.aceptadoEn || quote.updatedAt) === month.key).length
      const monthCases = scopedCases.filter((item) => getMonthKey(item.createdAt) === month.key).length
      return { ...month, leads: monthLeads, accepted: monthAccepted, cases: monthCases }
    })

    return {
      leadsByStatus,
      quotesByStatus,
      casesByStatus,
      casesByPriority,
      acceptedQuotes: acceptedQuotes.length,
      rejectedQuotes: rejectedQuotes.length,
      sentQuotes: sentQuotes.length,
      acceptedAmount,
      totalQuotedAmount,
      openCases,
      closedCases,
      conversionRate: sentQuotes.length ? Math.round((acceptedQuotes.length / sentQuotes.length) * 100) : 0,
      monthly
    }
  }, [scopedLeads, scopedQuotations, scopedCases])

  if (!user) return null

  const userRole = normalizeRole(user.rol?.nombre) || 'administrador'
  const isSupportRole = userRole === 'atencion_cliente'
  const isClientRole = userRole === 'cliente'
  const reportTitle = isSupportRole
    ? 'Reporte de atención post-venta'
    : isClientRole
      ? 'Mis reportes'
      : 'Reporte comercial'
  const reportDescription = isSupportRole
    ? 'Estado de casos, prioridades y atenciones registradas.'
    : isClientRole
      ? 'Resumen de tus cotizaciones y solicitudes de soporte.'
      : 'Estado de leads, cotizaciones, conversion y ventas aceptadas.'

  const maxMonthly = Math.max(1, ...report.monthly.flatMap((item) => [item.leads, item.accepted, item.cases]))
  const maxLeadStatus = Math.max(1, ...Object.values(report.leadsByStatus))
  const maxCasePriority = Math.max(1, ...Object.values(report.casesByPriority))

  const commercialKpis = [
    { label: 'Leads totales', value: String(scopedLeads.length), detail: `${report.leadsByStatus.nuevo || 0} nuevos`, icon: Users, color: '#0740E4' },
    { label: 'Conversion', value: `${report.conversionRate}%`, detail: `${report.acceptedQuotes} aceptadas de ${report.sentQuotes}`, icon: TrendingUp, color: '#34A853' },
    { label: 'No aceptadas', value: String(report.rejectedQuotes), detail: 'Cotizaciones rechazadas', icon: XCircle, color: '#DC2626' },
    { label: 'Post-venta activos', value: String(report.openCases), detail: `${report.closedCases} cerrados/resueltos`, icon: Headphones, color: '#9333EA' }
  ]
  const supportKpis = [
    { label: 'Casos abiertos', value: String(report.openCases), detail: 'Requieren seguimiento', icon: Headphones, color: '#0740E4' },
    { label: 'Casos cerrados', value: String(report.closedCases), detail: 'Resueltos o cerrados', icon: CheckCircle2, color: '#34A853' },
    { label: 'Prioridad alta', value: String((report.casesByPriority.alta || 0) + (report.casesByPriority.critica || 0)), detail: 'Atenciones urgentes', icon: AlertCircle, color: '#DC2626' },
    { label: 'Total atenciones', value: String(scopedCases.length), detail: 'Historial post-venta', icon: BarChart3, color: '#9333EA' }
  ]
  const clientKpis = [
    { label: 'Cotizaciones', value: String(scopedQuotations.length), detail: 'Registradas en el sistema', icon: FileText, color: '#FF7101' },
    { label: 'Aceptadas', value: String(report.acceptedQuotes), detail: 'Propuestas aprobadas', icon: CheckCircle2, color: '#34A853' },
    { label: 'No aceptadas', value: String(report.rejectedQuotes), detail: 'Propuestas rechazadas', icon: XCircle, color: '#DC2626' },
    { label: 'Casos soporte', value: String(scopedCases.length), detail: `${report.openCases} abiertos`, icon: Headphones, color: '#0740E4' }
  ]
  const kpis = isSupportRole ? supportKpis : isClientRole ? clientKpis : commercialKpis

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 print:hidden">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#01103B] leading-none">{reportTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 sm:flex">
              {[
                { id: 'month', label: 'Este mes' },
                { id: 'six_months', label: '6 meses' },
                { id: 'all', label: 'Histórico CRM' }
              ].map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setReportRange(range.id as 'month' | 'six_months' | 'all')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    reportRange === range.id
                      ? 'bg-white text-[#0740E4] shadow-sm'
                      : 'text-gray-500 hover:bg-white/70'
                  }`}
                >
                  {range.id === 'all' && <Calendar size={15} />}
                  <span>{range.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-[#9333EA] hover:bg-[#9333EA]/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-2 py-8 sm:px-4 lg:px-6 xl:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#01103B]">{reportTitle}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {reportDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15`, color: item.color }}>
                  <item.icon size={20} />
                </div>
                {isLoading && <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-[#FF7101] animate-spin" />}
              </div>
              <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{isLoading ? '...' : item.value}</p>
              <p className="text-sm font-semibold text-gray-600">{item.label}</p>
              <p className="text-xs text-gray-400 mt-2">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <section className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-[#01103B]">Tendencia mensual</h3>
                <p className="text-sm text-gray-500">{isSupportRole ? 'Casos post-venta registrados' : isClientRole ? 'Cotizaciones y casos registrados' : 'Leads, cotizaciones aceptadas y casos post-venta'}</p>
              </div>
              <BarChart3 size={20} className="text-[#0740E4]" />
            </div>
            <div className="h-72 flex items-end gap-4 border-b border-gray-100 pb-4">
              {report.monthly.map((month) => (
                <div key={month.key} className="flex-1 min-w-0 flex flex-col items-center gap-3">
                  <div className="h-56 w-full flex items-end justify-center gap-1.5">
                    {!isSupportRole && <div className="w-4 rounded-t bg-[#0740E4]" title={`Leads: ${month.leads}`} style={{ height: `${Math.max(6, (month.leads / maxMonthly) * 100)}%` }} />}
                    {!isSupportRole && <div className="w-4 rounded-t bg-[#34A853]" title={`Aceptadas: ${month.accepted}`} style={{ height: `${Math.max(6, (month.accepted / maxMonthly) * 100)}%` }} />}
                    <div className="w-4 rounded-t bg-[#9333EA]" title={`Casos: ${month.cases}`} style={{ height: `${Math.max(6, (month.cases / maxMonthly) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 capitalize">{month.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-xs font-semibold text-gray-600">
              {!isSupportRole && <span className="flex items-center gap-2"><i className="w-3 h-3 rounded bg-[#0740E4]" /> Leads</span>}
              {!isSupportRole && <span className="flex items-center gap-2"><i className="w-3 h-3 rounded bg-[#34A853]" /> Aceptadas</span>}
              <span className="flex items-center gap-2"><i className="w-3 h-3 rounded bg-[#9333EA]" /> Post-venta</span>
            </div>
          </section>

          {!isSupportRole && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-[#01103B]">Resumen financiero</h3>
                <p className="text-sm text-gray-500">Cotizaciones del CRM</p>
              </div>
              <DollarSign size={20} className="text-[#34A853]" />
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-500">Monto cotizado</p>
                <p className="text-3xl font-bold text-[#01103B]">{formatMoney(report.totalQuotedAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">Monto aceptado</p>
                <p className="text-2xl font-bold text-[#34A853]">{formatMoney(report.acceptedAmount)}</p>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                  <span>Efectividad</span>
                  <span>{report.conversionRate}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#34A853]" style={{ width: `${Math.min(100, report.conversionRate)}%` }} />
                </div>
              </div>
            </div>
          </section>
          )}
        </div>

        {!isSupportRole && !isClientRole && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-[#01103B]">Indicadores de estado de leads</h3>
                <p className="text-sm text-gray-500">Pipeline comercial completo</p>
              </div>
              <Users size={20} className="text-[#0740E4]" />
            </div>
            <div className="space-y-4">
              {Object.entries(leadLabels).map(([status, label]) => {
                const value = report.leadsByStatus[status] || 0
                const percent = Math.round((value / maxLeadStatus) * 100)
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-gray-700">{label}</span>
                      <span className="font-bold text-[#01103B]">{value}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0740E4] rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-[#01103B]">Cotizaciones aceptadas y no aceptadas</h3>
                <p className="text-sm text-gray-500">Estado actual de propuestas enviadas</p>
              </div>
              <FileText size={20} className="text-[#FF7101]" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <CheckCircle2 size={22} className="text-emerald-600 mb-3" />
                <p className="text-3xl font-bold text-emerald-700">{report.acceptedQuotes}</p>
                <p className="text-sm font-semibold text-emerald-800">Aceptadas</p>
              </div>
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <XCircle size={22} className="text-red-600 mb-3" />
                <p className="text-3xl font-bold text-red-700">{report.rejectedQuotes}</p>
                <p className="text-sm font-semibold text-red-800">No aceptadas</p>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(quoteLabels).map(([status, label]) => {
                const value = report.quotesByStatus[status] || 0
                const total = Math.max(1, scopedQuotations.length)
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-28 text-xs font-semibold text-gray-600">{label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF7101]" style={{ width: `${(value / total) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs font-bold text-gray-700">{value}</span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
        )}

        {isClientRole && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-[#01103B]">Mis cotizaciones</h3>
                <p className="text-sm text-gray-500">Resumen de propuestas registradas</p>
              </div>
              <FileText size={20} className="text-[#FF7101]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <CheckCircle2 size={22} className="text-emerald-600 mb-3" />
                <p className="text-3xl font-bold text-emerald-700">{report.acceptedQuotes}</p>
                <p className="text-sm font-semibold text-emerald-800">Aceptadas</p>
              </div>
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <XCircle size={22} className="text-red-600 mb-3" />
                <p className="text-3xl font-bold text-red-700">{report.rejectedQuotes}</p>
                <p className="text-sm font-semibold text-red-800">No aceptadas</p>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-[#01103B]">Reporte de atenciones post-venta</h3>
              <p className="text-sm text-gray-500">Casos por estado y prioridad</p>
            </div>
            <Headphones size={20} className="text-[#9333EA]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(caseLabels).map(([status, label]) => {
                const value = report.casesByStatus[status] || 0
                return (
                  <div key={status} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-2xl font-bold text-[#01103B]">{value}</p>
                    <p className="text-sm font-semibold text-gray-600">{label}</p>
                  </div>
                )
              })}
            </div>
            <div className="space-y-4">
              {Object.entries(report.casesByPriority).map(([priority, value]) => (
                <div key={priority}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700 capitalize">Prioridad {priority}</span>
                    <span className="font-bold text-[#01103B]">{value}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#9333EA]" style={{ width: `${Math.round((value / maxCasePriority) * 100)}%` }} />
                  </div>
                </div>
              ))}
              {scopedCases.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                  Aún no hay casos post-venta registrados.
                </div>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
