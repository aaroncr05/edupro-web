'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Headphones,
  LogOut,
  Search,
  Target,
  TrendingUp,
  Users,
  XCircle
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'
import { leadsService, LeadResponse } from '@/services/leads.service'
import { quotationsService, QuotationResponse } from '@/services/quotations.service'
import { casesService, CaseResponse } from '@/services/cases.service'
import { notificationsService, NotificationResponse } from '@/services/notifications.service'
import { tasksService, AutomaticTaskResponse } from '@/services/tasks.service'

const ROL_COLORS: Record<string, string> = {
  administrador: '#FF7101',
  asesor_ventas: '#0740E4',
  atencion_cliente: '#34A853',
  gerente_comercial: '#9333EA',
  cliente: '#808080',
}

const PIPELINE = [
  { key: 'nuevo', label: 'Nuevo', color: '#0740E4' },
  { key: 'contactado', label: 'Contactado', color: '#0F766E' },
  { key: 'interesado', label: 'Interesado', color: '#FF7101' },
  { key: 'propuesta_enviada', label: 'Cotizacion', color: '#9333EA' },
  { key: 'convertido', label: 'Aceptado', color: '#34A853' },
  { key: 'rechazado', label: 'No aceptado', color: '#DC2626' },
]

const money = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const caseStatus = (item: CaseResponse) => {
  const record = item as CaseResponse & { estado?: string }
  return item.estadoCaso || record.estado || 'abierto'
}

const normalizeRole = (role?: string) =>
  (role || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace('atencion_cliente', 'atencion_cliente')

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, hasHydrated, setUser, setToken } = useAuthStore()
  const [greeting, setGreeting] = useState('Buenos dias')
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [leads, setLeads] = useState<LeadResponse[]>([])
  const [quotations, setQuotations] = useState<QuotationResponse[]>([])
  const [cases, setCases] = useState<CaseResponse[]>([])
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [automaticTasks, setAutomaticTasks] = useState<AutomaticTaskResponse[]>([])

  const fetchDashboardData = async () => {
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
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await notificationsService.getMine(1, 8)
      setNotifications(response.data)
      setUnreadNotifications(response.unread)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const fetchAutomaticTasks = async () => {
    try {
      const tasks = await tasksService.getMine(8)
      setAutomaticTasks(tasks)
    } catch (error) {
      console.error('Error fetching automatic tasks:', error)
    }
  }

  const completeTask = async (taskId: number) => {
    try {
      await tasksService.complete(taskId)
      setAutomaticTasks((tasks) => tasks.filter((task) => task.id !== taskId))
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const handleNotificationClick = async (notification: NotificationResponse) => {
    try {
      setShowNotifications(false)

      if (!notification.leida) {
        await notificationsService.markAsRead(notification.id)
        setNotifications((items) =>
          items.map((item) => item.id === notification.id ? { ...item, leida: true } : item)
        )
        setUnreadNotifications((count) => Math.max(0, count - 1))
      }

      if (notification.enlace) router.push(notification.enlace)
    } catch (error) {
      console.error('Error updating notification:', error)
    }
  }

  useEffect(() => {
    if (!hasHydrated) return
    let isMounted = true

    const validateSession = async () => {
      // Si no hay usuario en el store, verificar con el backend via cookie HttpOnly
      if (!user) {
        try {
          const response = await authService.getCurrentUser()
          if (!isMounted) return
          setUser(response.data)
          setToken('session')
        } catch {
          if (!isMounted) return
          logout()
          setIsCheckingSession(false)
          router.replace('/login')
          return
        }
      }

      if (!isMounted) return
      setIsCheckingSession(false)
      fetchDashboardData()
      fetchNotifications()
      fetchAutomaticTasks()

      const hour = new Date().getHours()
      if (hour >= 12 && hour < 18) setGreeting('Buenas tardes')
      else if (hour >= 18) setGreeting('Buenas noches')
    }

    validateSession()

    return () => {
      isMounted = false
    }
  }, [hasHydrated, user, router, logout, setUser, setToken])

  const metrics = useMemo(() => {
    const accepted = quotations.filter((quote) => quote.estadoCotizacion === 'aceptada')
    const rejected = quotations.filter((quote) => quote.estadoCotizacion === 'rechazada')
    const sent = quotations.filter((quote) => ['enviada', 'vista', 'aceptada', 'rechazada'].includes(quote.estadoCotizacion))
    const openCases = cases.filter((item) => ['abierto', 'en_progreso'].includes(caseStatus(item))).length
    const acceptedAmount = accepted.reduce((acc, quote) => acc + Number(quote.total || quote.montoTotal || 0), 0)
    const openAmount = quotations
      .filter((quote) => ['enviada', 'vista'].includes(quote.estadoCotizacion))
      .reduce((acc, quote) => acc + Number(quote.total || quote.montoTotal || 0), 0)

    return {
      activeLeads: leads.filter((lead) => ['nuevo', 'contactado', 'interesado', 'propuesta_enviada'].includes(lead.estadoLead)).length,
      accepted: accepted.length,
      rejected: rejected.length,
      conversionRate: sent.length ? Math.round((accepted.length / sent.length) * 100) : 0,
      openCases,
      acceptedAmount,
      openAmount,
    }
  }, [leads, quotations, cases])

  if (!hasHydrated || isCheckingSession || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#01103B]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-[#FF7101]" />
          <p className="text-sm text-white/60">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  const userRole = normalizeRole(user.rol?.nombre) || 'administrador'
  const roleColor = ROL_COLORS[userRole] || '#FF7101'
  const maxPipeline = Math.max(1, ...PIPELINE.map((stage) => leads.filter((lead) => lead.estadoLead === stage.key).length))
  const isSalesRole = ['asesor_ventas', 'administrador', 'gerente_comercial'].includes(userRole)
  const isSupportRole = userRole === 'atencion_cliente'
  const isClientRole = userRole === 'cliente'
  const dashboardCopy: Record<string, { title: string; desc: string; primaryHref: string; primaryLabel: string; secondaryHref: string; secondaryLabel: string }> = {
    administrador: {
      title: `${user.nombre}, tienes una vision completa del CRM.`,
      desc: 'Supervisa ventas, marketing, post-venta, usuarios y contenido desde un panel ejecutivo.',
      primaryHref: '/reports',
      primaryLabel: 'Ver reportes',
      secondaryHref: '/users',
      secondaryLabel: 'Gestiónar usuarios',
    },
    gerente_comercial: {
      title: `${user.nombre}, revisa el rendimiento comercial del equipo.`,
      desc: 'Monitorea pipeline, conversion, cotizaciones aceptadas y oportunidades pendientes.',
      primaryHref: '/reports',
      primaryLabel: 'Ver metricas',
      secondaryHref: '/leads',
      secondaryLabel: 'Revisar leads',
    },
    asesor_ventas: {
      title: `${user.nombre}, enfocate en tus oportunidades de venta.`,
      desc: 'Prioriza leads, cotizaciones enviadas, tareas de seguimiento y cierres pendientes.',
      primaryHref: '/leads',
      primaryLabel: 'Gestiónar leads',
      secondaryHref: '/quotations',
      secondaryLabel: 'Ver cotizaciones',
    },
    atencion_cliente: {
      title: `${user.nombre}, gestiona la atención post-venta.`,
      desc: 'Revisa casos abiertos, prioridades, responsables y solicitudes que requieren respuesta.',
      primaryHref: '/cases',
      primaryLabel: 'Atender casos',
      secondaryHref: '/reports',
      secondaryLabel: 'Ver reportes',
    },
    cliente: {
      title: `${user.nombre}, consulta tu informacion y solicitudes.`,
      desc: 'Accede a tus cotizaciones y casos de soporte registrados en el sistema.',
      primaryHref: '/quotations',
      primaryLabel: 'Mis cotizaciones',
      secondaryHref: '/cases',
      secondaryLabel: 'Mis casos',
    },
  }
  const activeCopy = dashboardCopy[userRole] || dashboardCopy.administrador

  const kpisByRole = {
    sales: [
      { label: 'Leads activos', value: isLoading ? '...' : String(metrics.activeLeads), detail: `${leads.length} registrados`, icon: Users, color: '#0740E4' },
      { label: 'Pipeline abierto', value: isLoading ? '...' : money(metrics.openAmount), detail: 'Cotizaciones enviadas/vistas', icon: Target, color: '#FF7101' },
      { label: 'Ventas aceptadas', value: isLoading ? '...' : money(metrics.acceptedAmount), detail: `${metrics.accepted} cotizaciones ganadas`, icon: CheckCircle2, color: '#34A853' },
      { label: 'Conversion', value: isLoading ? '...' : `${metrics.conversionRate}%`, detail: `${metrics.rejected} no aceptadas`, icon: TrendingUp, color: '#9333EA' },
    ],
    support: [
      { label: 'Casos abiertos', value: isLoading ? '...' : String(metrics.openCases), detail: 'Requieren atención', icon: Headphones, color: '#0740E4' },
      { label: 'Casos totales', value: isLoading ? '...' : String(cases.length), detail: 'Historial post-venta', icon: ClipboardList, color: '#FF7101' },
      { label: 'Resueltos', value: isLoading ? '...' : String(cases.filter((item) => ['resuelto', 'cerrado'].includes(caseStatus(item))).length), detail: 'Atenciones cerradas', icon: CheckCircle2, color: '#34A853' },
      { label: 'Prioridad alta', value: isLoading ? '...' : String(cases.filter((item) => ['alta', 'critica'].includes(item.prioridad)).length), detail: 'Casos urgentes', icon: AlertCircle, color: '#DC2626' },
    ],
    client: [
      { label: 'Cotizaciones', value: isLoading ? '...' : String(quotations.length), detail: 'Registradas en el sistema', icon: FileText, color: '#FF7101' },
      { label: 'Aceptadas', value: isLoading ? '...' : String(metrics.accepted), detail: 'Propuestas aprobadas', icon: CheckCircle2, color: '#34A853' },
      { label: 'Casos abiertos', value: isLoading ? '...' : String(metrics.openCases), detail: 'Soporte en proceso', icon: Headphones, color: '#0740E4' },
      { label: 'Notificaciones', value: isLoading ? '...' : String(unreadNotifications), detail: 'Pendientes de lectura', icon: Bell, color: '#9333EA' },
    ],
  }
  const kpis = isSupportRole ? kpisByRole.support : isClientRole ? kpisByRole.client : kpisByRole.sales

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-2 py-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#01103B] font-black text-white">
              CRM
            </div>
            <div>
              <h1 className="text-sm font-black leading-none text-[#01103B]">EduPro CRM</h1>
              <p className="mt-1 text-xs text-gray-400">Ventas, leads y seguimiento</p>
            </div>
          </div>

          <div className="hidden flex-1 items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 md:flex md:max-w-md">
            <Search size={15} className="text-gray-400" />
            <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" placeholder="Buscar leads, cotizaciones o clientes..." />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <Bell size={17} />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF7101] px-1 text-[10px] font-bold text-white">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-black text-[#01103B]">Notificaciones</p>
                    <span className="text-xs text-gray-400">{unreadNotifications} nuevas</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">No tienes notificaciones.</p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50 ${notification.leida ? 'bg-white' : 'bg-[#FF7101]/5'}`}
                        >
                          <p className="text-sm font-bold text-gray-800">{notification.titulo}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{notification.mensaje}</p>
                          {notification.enlace && (
                            <p className="mt-2 text-[11px] font-bold text-[#0740E4]">Abrir acción</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: roleColor }}>
                {user.nombre?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold leading-none text-gray-800">{user.nombre}</p>
                <p className="mt-1 text-xs capitalize text-gray-400">{user.rol?.nombre}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="w-full">
        <main className="min-w-0 flex-1 space-y-6">
        <section className="overflow-hidden rounded-2xl bg-[#01103B] text-white shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div>
              <p className="text-sm font-semibold text-[#FFB072]">{greeting}</p>
              <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
                {activeCopy.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                {activeCopy.desc}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={activeCopy.primaryHref} className="inline-flex items-center gap-2 rounded-xl bg-[#FF7101] px-4 py-3 text-sm font-bold text-white hover:bg-[#e86600]">
                  {activeCopy.primaryLabel}
                  <ArrowRight size={16} />
                </Link>
                <Link href={activeCopy.secondaryHref} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/20">
                  {activeCopy.secondaryLabel}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs text-white/55">{isSupportRole ? 'Casos abiertos' : isClientRole ? 'Cotizaciones' : 'Aceptadas'}</p>
                <p className="mt-2 text-3xl font-black">{isSupportRole ? metrics.openCases : isClientRole ? quotations.length : metrics.accepted}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs text-white/55">{isSupportRole ? 'Resueltos' : 'Casos abiertos'}</p>
                <p className="mt-2 text-3xl font-black">{isSupportRole ? cases.filter((item) => ['resuelto', 'cerrado'].includes(caseStatus(item))).length : metrics.openCases}</p>
              </div>
              <div className="col-span-2 rounded-xl border border-[#FF7101]/30 bg-[#FF7101]/15 p-4">
                <p className="text-xs text-white/60">{isSupportRole ? 'Total de atenciones' : isClientRole ? 'Notificaciones pendientes' : 'Ingreso aceptado'}</p>
                <p className="mt-2 text-3xl font-black text-[#FFB072]">{isSupportRole ? cases.length : isClientRole ? unreadNotifications : money(metrics.acceptedAmount)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${item.color}15`, color: item.color }}>
                    <Icon size={21} />
                  </div>
                  {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[#FF7101]" />}
                </div>
                <p className="text-2xl font-black text-[#01103B]">{item.value}</p>
                <p className="mt-1 text-sm font-bold text-gray-700">{item.label}</p>
                <p className="mt-2 text-xs text-gray-400">{item.detail}</p>
              </div>
            )
          })}
        </section>

        {isSupportRole ? (
          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-[#01103B]">Atenciones post-venta</h3>
                  <p className="text-sm text-gray-500">Casos por estado de atención</p>
                </div>
                <Link href="/cases" className="text-sm font-bold text-[#FF7101]">Ver casos</Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Abiertos', value: cases.filter((item) => caseStatus(item) === 'abierto').length, color: '#DC2626' },
                  { label: 'En progreso', value: cases.filter((item) => caseStatus(item) === 'en_progreso').length, color: '#FF7101' },
                  { label: 'Resueltos', value: cases.filter((item) => caseStatus(item) === 'resuelto').length, color: '#34A853' },
                  { label: 'Cerrados', value: cases.filter((item) => caseStatus(item) === 'cerrado').length, color: '#0740E4' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-gray-50 p-4">
                    <p className="text-3xl font-black" style={{ color: item.color }}>{item.value}</p>
                    <p className="mt-1 text-sm font-bold text-gray-600">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h3 className="font-black text-[#01103B]">Prioridad de soporte</h3>
                <p className="text-sm text-gray-500">Carga actual por urgencia</p>
              </div>
              <div className="space-y-3">
                {['critica', 'alta', 'media', 'baja'].map((priority) => {
                  const count = cases.filter((item) => item.prioridad === priority).length
                  const percent = Math.min(100, Math.round((count / Math.max(1, cases.length)) * 100))
                  return (
                    <div key={priority}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-bold capitalize text-gray-700">{priority}</span>
                        <span className="font-black text-[#01103B]">{count}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-[#FF7101]" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            {!isClientRole && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-[#01103B]">Pipeline de ventas</h3>
                    <p className="text-sm text-gray-500">Leads por etapa del proceso comercial</p>
                  </div>
                  <Link href="/leads" className="text-sm font-bold text-[#FF7101]">Ver leads</Link>
                </div>
                <div className="grid gap-3 md:grid-cols-6">
                  {PIPELINE.map((stage) => {
                    const count = leads.filter((lead) => lead.estadoLead === stage.key).length
                    const height = Math.max(12, Math.round((count / maxPipeline) * 100))
                    return (
                      <div key={stage.key} className="rounded-xl bg-gray-50 p-3">
                        <div className="flex h-36 items-end rounded-lg bg-white p-2">
                          <div className="w-full rounded-md" style={{ height: `${height}%`, background: stage.color }} />
                        </div>
                        <p className="mt-3 text-xl font-black text-[#01103B]">{count}</p>
                        <p className="text-xs font-semibold text-gray-500">{stage.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${isClientRole ? 'lg:col-span-2' : ''}`}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-[#01103B]">Cotizaciones</h3>
                <p className="text-sm text-gray-500">Aceptadas vs no aceptadas</p>
              </div>
              <FileText size={20} className="text-[#FF7101]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-50 p-4">
                <CheckCircle2 className="mb-3 text-emerald-600" size={22} />
                <p className="text-3xl font-black text-emerald-700">{metrics.accepted}</p>
                <p className="text-sm font-bold text-emerald-800">Aceptadas</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4">
                <XCircle className="mb-3 text-red-600" size={22} />
                <p className="text-3xl font-black text-red-700">{metrics.rejected}</p>
                <p className="text-sm font-bold text-red-800">No aceptadas</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs font-bold text-gray-500">
                <span>Tasa de conversion</span>
                <span>{metrics.conversionRate}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#34A853]" style={{ width: `${Math.min(100, metrics.conversionRate)}%` }} />
              </div>
            </div>
          </div>
        </section>
        )}

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-[#01103B]">Tareas automaticas</h3>
                <p className="text-sm text-gray-500">{automaticTasks.length} pendientes para seguimiento</p>
              </div>
              <ClipboardList size={20} className="text-[#0740E4]" />
            </div>
            {automaticTasks.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">No tienes tareas automaticas pendientes.</div>
            ) : (
              <div className="space-y-3">
                {automaticTasks.map((task) => (
                  <div key={task.id} className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#01103B]">{task.nombre}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{task.descripción || 'Seguimiento comercial pendiente'}</p>
                      {task.proximaEjecucion && (
                        <p className="mt-2 text-[11px] font-bold text-[#FF7101]">{new Date(task.proximaEjecucion).toLocaleString('es-PE')}</p>
                      )}
                    </div>
                    <button onClick={() => completeTask(task.id)} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:text-emerald-600">
                      Completar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-[#01103B]">{isSalesRole ? 'Leads recientes' : 'Casos recientes'}</h3>
                <p className="text-sm text-gray-500">{isSalesRole ? 'Últimos contactos registrados' : 'Últimas atenciones registradas'}</p>
              </div>
              <Link href={isSalesRole ? '/leads' : '/cases'} className="text-sm font-bold text-[#FF7101]">Gestiónar</Link>
            </div>
            <div className="space-y-3">
              {isSalesRole ? (
                recentLeads.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">Aún no hay leads registrados.</div>
                ) : recentLeads.map((lead) => (
                  <div key={lead.id} className="grid gap-3 rounded-xl border border-gray-100 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="font-black text-[#01103B]">{lead.nombre}</p>
                      <p className="mt-1 text-sm text-gray-500">{lead.email}</p>
                    </div>
                    <span className="w-fit rounded-full bg-[#0740E4]/10 px-3 py-1 text-xs font-bold text-[#0740E4]">
                      {lead.estadoLead.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                cases.slice(0, 5).length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">Aún no hay casos registrados.</div>
                ) : cases.slice(0, 5).map((item) => (
                  <div key={item.id} className="grid gap-3 rounded-xl border border-gray-100 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="font-black text-[#01103B]">{item.asunto || item.codigo || `Caso #${item.id}`}</p>
                      <p className="mt-1 text-sm text-gray-500">{item.descripción}</p>
                    </div>
                    <span className="w-fit rounded-full bg-[#34A853]/10 px-3 py-1 text-xs font-bold text-[#34A853]">
                      {caseStatus(item).replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'API Backend', value: 'Conectado', icon: CheckCircle2, color: '#34A853' },
            { label: 'Automatizaciones', value: 'Seguimientos activos', icon: Clock, color: '#0740E4' },
            { label: 'Alertas CRM', value: `${unreadNotifications} sin leer`, icon: AlertCircle, color: '#FF7101' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${item.color}15`, color: item.color }}>
                  <Icon size={19} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#01103B]">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.value}</p>
                </div>
              </div>
            )
          })}
        </section>
        </main>
      </div>
    </div>
  )
}

