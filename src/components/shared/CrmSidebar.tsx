'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  ChevronDown,
  ClipboardList,
  FileText,
  Headphones,
  Layout,
  Megaphone,
  Settings,
  Users
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { leadsService } from '@/services/leads.service'
import { quotationsService } from '@/services/quotations.service'
import { casesService } from '@/services/cases.service'
import { usersService } from '@/services/users.service'

const ROLE_COLORS: Record<string, string> = {
  administrador: '#FF7101',
  asesor_ventas: '#0740E4',
  atencion_cliente: '#34A853',
  gerente_comercial: '#9333EA',
  cliente: '#808080'
}

const MODULES_BY_ROLE: Record<string, string[]> = {
  administrador: ['leads', 'quotations', 'marketing', 'cases', 'reports', 'users', 'forms', 'services', 'courses', 'content'],
  asesor_ventas: ['leads', 'quotations', 'marketing', 'reports'],
  atencion_cliente: ['cases', 'reports'],
  gerente_comercial: ['leads', 'quotations', 'marketing', 'cases', 'reports'],
  cliente: ['quotations', 'cases']
}

const normalizeRole = (role?: string) =>
  (role || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace('atenciÃ³n_cliente', 'atencion_cliente')

type SidebarModule = {
  id: string
  title: string
  href: string
  icon: typeof Users
  stat: string
  color: string
}

type CrmSidebarProps = {
  mobile?: boolean
  onNavigate?: () => void
}

export function CrmSidebar({ mobile = false, onNavigate }: CrmSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [activeLeads, setActiveLeads] = useState(0)
  const [quotationsTotal, setQuotationsTotal] = useState(0)
  const [openCases, setOpenCases] = useState(0)
  const [usersTotal, setUsersTotal] = useState(0)
  const [showWebManagement, setShowWebManagement] = useState(false)

  const role = normalizeRole(user?.rol?.nombre) || 'administrador'
  const roleColor = ROLE_COLORS[role] || '#FF7101'
  const allowedModules = MODULES_BY_ROLE[role] || MODULES_BY_ROLE.administrador

  useEffect(() => {
    setShowWebManagement(
      pathname.startsWith('/forms') ||
      pathname.startsWith('/dashboard/services') ||
      pathname.startsWith('/dashboard/courses') ||
      pathname.startsWith('/dashboard/content')
    )
  }, [pathname])

  useEffect(() => {
    if (!user) return

    const loadStats = async () => {
      try {
        const [leadsRes, quotationsRes, casesRes, usersRes] = await Promise.allSettled([
          leadsService.getAllLeads(1, 1000),
          quotationsService.getAllQuotations({ page: 1, limit: 1000 }),
          casesService.getAllCases({ page: 1, limit: 1000 }),
          usersService.getAllUsers()
        ])

        if (leadsRes.status === 'fulfilled') {
          setActiveLeads(leadsRes.value.data.filter((lead) => !['convertido', 'rechazado', 'perdido'].includes(lead.estadoLead)).length)
        }
        if (quotationsRes.status === 'fulfilled') {
          setQuotationsTotal(quotationsRes.value.pagination?.total ?? quotationsRes.value.data.length)
        }
        if (casesRes.status === 'fulfilled') {
          setOpenCases(casesRes.value.data.filter((item) => ['abierto', 'en_progreso', 'en_espera'].includes(item.estadoCaso || item.estado)).length)
        }
        if (usersRes.status === 'fulfilled') {
          setUsersTotal(usersRes.value.pagination?.total ?? usersRes.value.data.length)
        }
      } catch (error) {
        console.error('Error cargando menu CRM:', error)
      }
    }

    loadStats()
  }, [user])

  const modules = useMemo<SidebarModule[]>(() => [
    { id: 'leads', title: 'Leads', href: '/leads', icon: Users, stat: `${activeLeads} activos`, color: '#0740E4' },
    { id: 'quotations', title: 'Cotizaciones', href: '/quotations', icon: FileText, stat: `${quotationsTotal} total`, color: '#FF7101' },
    { id: 'marketing', title: 'Marketing', href: '/marketing', icon: Megaphone, stat: 'Audiencias', color: '#0F766E' },
    { id: 'cases', title: 'Post-venta', href: '/cases', icon: Headphones, stat: `${openCases} abiertos`, color: '#34A853' },
    { id: 'reports', title: 'Reportes', href: '/reports', icon: BarChart3, stat: 'Métricas', color: '#9333EA' },
    { id: 'users', title: 'Usuarios', href: '/users', icon: Settings, stat: `${usersTotal} usuarios`, color: '#01103B' }
  ].filter((module) => allowedModules.includes(module.id)), [activeLeads, allowedModules, openCases, quotationsTotal, usersTotal])

  const webManagementModules = useMemo<SidebarModule[]>(() => [
    { id: 'forms', title: 'Formularios', href: '/forms', icon: ClipboardList, stat: 'Captura web', color: '#8B5CF6' },
    { id: 'services', title: 'Servicios', href: '/dashboard/services', icon: Briefcase, stat: 'Catálogo', color: '#0740E4' },
    { id: 'courses', title: 'Cursos', href: '/dashboard/courses', icon: BookOpen, stat: 'Catálogo', color: '#01103B' },
    { id: 'content', title: 'Contenido', href: '/dashboard/content', icon: Layout, stat: 'Web pública', color: '#FF7101' }
  ].filter((module) => allowedModules.includes(module.id)), [allowedModules])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  if (!user) return null

  return (
    <aside className={mobile ? 'flex min-h-0 flex-1 flex-col' : 'hidden shrink-0 lg:sticky lg:top-6 lg:block lg:h-[calc(100vh-3rem)] lg:w-80'}>
      <div className={mobile ? 'min-h-0 flex-1 overflow-y-auto bg-white p-4' : 'h-full overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-sm'}>
        <div className={`mb-4 items-center justify-between ${mobile ? 'hidden' : 'flex'}`}>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-gray-400">Menú del sistema</p>
            <h2 className="mt-1 font-black text-[#01103B]">Módulos CRM</h2>
          </div>
          {user?.rol?.nombre && (
            <span className="rounded-full px-3 py-1 text-xs font-bold capitalize" style={{ background: `${roleColor}15`, color: roleColor }}>
              {user.rol.nombre}
            </span>
          )}
        </div>

        <nav className="grid gap-2">
          {modules.map((module) => {
            const Icon = module.icon
            const active = isActive(module.href)

            return (
              <Link
                key={module.id}
                href={module.href}
                onClick={onNavigate}
                className={`group flex items-center gap-3 rounded-xl border px-3 py-3 transition-all ${
                  active
                    ? 'border-[#FF7101]/40 bg-[#FF7101]/10'
                    : 'border-transparent hover:border-[#FF7101]/30 hover:bg-[#FF7101]/5'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `${module.color}15`, color: module.color }}>
                  <Icon size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-black ${active ? 'text-[#FF7101]' : 'text-[#01103B] group-hover:text-[#FF7101]'}`}>{module.title}</p>
                  <p className="truncate text-xs text-gray-400">{module.stat}</p>
                </div>
                <ArrowRight size={14} className={`text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-[#FF7101] ${active ? 'text-[#FF7101]' : ''}`} />
              </Link>
            )
          })}

          {webManagementModules.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
              <button
                type="button"
                onClick={() => setShowWebManagement((current) => !current)}
                className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-white"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#01103B]/10 text-[#01103B]">
                  <Layout size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-[#01103B]">Autogestión web</p>
                  <p className="truncate text-xs text-gray-400">Contenido público</p>
                </div>
                <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${showWebManagement ? 'rotate-180 text-[#FF7101]' : ''}`} />
              </button>

              {showWebManagement && (
                <div className="mt-2 space-y-1.5">
                  {webManagementModules.map((module) => {
                    const Icon = module.icon
                    const active = isActive(module.href)

                    return (
                      <Link
                        key={module.id}
                        href={module.href}
                        onClick={onNavigate}
                        className={`group flex items-center gap-2 rounded-lg px-2 py-2 transition-all ${
                          active ? 'bg-white shadow-sm' : 'hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${module.color}15`, color: module.color }}>
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-xs font-black ${active ? 'text-[#FF7101]' : 'text-[#01103B] group-hover:text-[#FF7101]'}`}>{module.title}</p>
                          <p className="truncate text-[11px] text-gray-400">{module.stat}</p>
                        </div>
                        <ArrowRight size={12} className={`text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-[#FF7101] ${active ? 'text-[#FF7101]' : ''}`} />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </aside>
  )
}
