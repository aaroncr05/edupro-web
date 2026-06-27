'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, ChevronDown, ImageIcon, Mail, Megaphone, Plus, Save, Search, Send, Users, XCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { marketingService, MarketingContact, MarketingSegment } from '@/services/marketing.service'

const ROLES_PERMITIDOS = ['administrador', 'asesor_ventas', 'gerente_comercial']

const SEGMENTS: Array<{ id: MarketingSegment; label: string; icon: typeof Users }> = [
  { id: 'todos', label: 'Todos', icon: Users },
  { id: 'cliente_acepto', label: 'Clientes', icon: CheckCircle2 },
  { id: 'lead_rechazo', label: 'Rechazaron', icon: XCircle }
]

type MarketingTemplate = {
  id: string
  name: string
  badge: string
  image: string
  subject: string
  message: string
  ctaText: string
  ctaUrl: string
}

const DEFAULT_TEMPLATES: MarketingTemplate[] = [
  {
    id: 'promo-web',
    name: 'Promocion Web',
    badge: 'Oferta',
    image: '/img/servicios/pagina_web.png',
    subject: 'Impulsa tu negocio con una página web profesional',
    message: 'Tenemos una promocion especial para crear o renovar tu presencia digital. Podemos ayudarte con una página moderna, rápida y preparada para captar clientes.\n\nResponde este correo y te enviaremos una propuesta personalizada.',
    ctaText: 'Solicitar propuesta',
    ctaUrl: 'http://localhost:4004/contacto'
  },
  {
    id: 'marketing',
    name: 'Anuncio Marketing',
    badge: 'Campana',
    image: '/img/servicios/redes.png',
    subject: 'Haz que más clientes conozcan tu marca',
    message: 'Podemos ayudarte a mejorar tus redes sociales, crear contenido profesional y lanzar anuncios para llegar a más clientes potenciales.\n\nAgenda una consulta y revisamos la mejor estrategia para tu negocio.',
    ctaText: 'Agendar consulta',
    ctaUrl: 'http://localhost:4004/contacto'
  },
  {
    id: 'recuperacion',
    name: 'Recuperar oportunidad',
    badge: 'Seguimiento',
    image: '/img/servicios/sistemas_a_medida.png',
    subject: 'Aun podemos ayudarte con tu proyecto digital',
    message: 'Sabemos que a veces las decisiones toman tiempo. Queremos mostrarte alternativas mas flexibles para avanzar con tu proyecto digital sin perder calidad.\n\nSi aun te interesa, podemos revisar una nueva propuesta para ti.',
    ctaText: 'Revisar opciones',
    ctaUrl: 'http://localhost:4004/contacto'
  },
  {
    id: 'cursos',
    name: 'Cursos y capacitacion',
    badge: 'Capacitacion',
    image: '/img/servicios/cursos.png',
    subject: 'Capacita a tu equipo con herramientas digitales',
    message: 'Preparamos cursos y talleres prácticos para mejorar las habilidades digitales de tu equipo. Podemos adaptar el contenido según las necesidades de tu empresa.\n\nCuéntanos que tema necesitas reforzar.',
    ctaText: 'Ver cursos',
    ctaUrl: 'http://localhost:4004/cursos'
  }
]

export default function MarketingPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [segmento, setSegmento] = useState<MarketingSegment>('todos')
  const [contacts, setContacts] = useState<MarketingContact[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [sendMode, setSendMode] = useState<'audience' | 'selected'>('audience')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [templates, setTemplates] = useState<MarketingTemplate[]>(DEFAULT_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATES[0].id)
  const activeTemplate = templates.find((template) => template.id === selectedTemplate) || templates[0] || DEFAULT_TEMPLATES[0]
  const [asunto, setAsunto] = useState(activeTemplate.subject)
  const [mensaje, setMensaje] = useState(activeTemplate.message)
  const [ctaText, setCtaText] = useState(activeTemplate.ctaText)
  const [ctaUrl, setCtaUrl] = useState(activeTemplate.ctaUrl)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    badge: 'Promocion',
    image: '',
    subject: '',
    message: '',
    ctaText: '',
    ctaUrl: ''
  })

  useEffect(() => {
    if (!token || !user) {
      router.push('/login')
      return
    }

    if (!ROLES_PERMITIDOS.includes(user.rol?.nombre || '')) {
      router.push('/dashboard')
    }
  }, [token, user, router])

  useEffect(() => {
    const storedTemplates = window.localStorage.getItem('marketing-custom-templates')
    if (!storedTemplates) return

    try {
      const parsed = JSON.parse(storedTemplates) as MarketingTemplate[]
      setTemplates([...DEFAULT_TEMPLATES, ...parsed])
    } catch {
      window.localStorage.removeItem('marketing-custom-templates')
    }
  }, [])

  const fetchAudience = async () => {
    try {
      setIsLoading(true)
      const response = await marketingService.getAudience(segmento)
      setContacts(response.data)
      setSelectedIds([])
    } catch (error: unknown) {
      const err = error as { message?: string }
      alert(err.message || 'Error al cargar audiencia')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token && user) fetchAudience()
  }, [segmento, token, user])

  const filteredContacts = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return contacts.filter((contact) =>
      contact.nombre.toLowerCase().includes(term) ||
      contact.email.toLowerCase().includes(term) ||
      (contact.empresa || '').toLowerCase().includes(term)
    )
  }, [contacts, searchTerm])

  const applyTemplate = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId) || templates[0] || DEFAULT_TEMPLATES[0]
    setSelectedTemplate(template.id)
    setAsunto(template.subject)
    setMensaje(template.message)
    setCtaText(template.ctaText)
    setCtaUrl(template.ctaUrl)
  }

  const saveTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.subject.trim() || !newTemplate.message.trim()) {
      alert('Completa nombre, asunto y mensaje de la plantilla')
      return
    }

    const createdTemplate: MarketingTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name.trim(),
      badge: newTemplate.badge.trim() || 'Promocion',
      image: newTemplate.image.trim() || '/img/servicios/pagina_web.png',
      subject: newTemplate.subject.trim(),
      message: newTemplate.message.trim(),
      ctaText: newTemplate.ctaText.trim() || 'Solicitar informacion',
      ctaUrl: newTemplate.ctaUrl.trim() || 'http://localhost:4004/contacto'
    }

    const customTemplates = [...templates.filter((template) => template.id.startsWith('custom-')), createdTemplate]
    window.localStorage.setItem('marketing-custom-templates', JSON.stringify(customTemplates))
    setTemplates([...DEFAULT_TEMPLATES, ...customTemplates])
    setShowTemplateForm(false)
    setNewTemplate({
      name: '',
      badge: 'Promocion',
      image: '',
      subject: '',
      message: '',
      ctaText: '',
      ctaUrl: ''
    })
    setSelectedTemplate(createdTemplate.id)
    setAsunto(createdTemplate.subject)
    setMensaje(createdTemplate.message)
    setCtaText(createdTemplate.ctaText)
    setCtaUrl(createdTemplate.ctaUrl)
  }

  const toggleContact = (id: number) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const toggleAllFiltered = () => {
    const filteredIds = filteredContacts.map((contact) => contact.id)
    const allSelected = filteredIds.every((id) => selectedIds.includes(id))
    setSelectedIds((current) => allSelected ? current.filter((id) => !filteredIds.includes(id)) : Array.from(new Set([...current, ...filteredIds])))
  }

  const targetCount = sendMode === 'selected' ? selectedIds.length : contacts.length

  const sendAnnouncement = async () => {
    if (!asunto.trim() || !mensaje.trim()) {
      alert('Completa el asunto y el mensaje')
      return
    }

    if (sendMode === 'selected' && selectedIds.length === 0) {
      alert('Selecciona al menos un contacto')
      return
    }

    const confirmed = window.confirm(`Se enviara este anuncio a ${targetCount} contacto(s). Continuar?`)
    if (!confirmed) return

    try {
      setIsSending(true)
      const response = await marketingService.sendAnnouncement({
        segmento,
        asunto,
        mensaje,
        contactIds: sendMode === 'selected' ? selectedIds : undefined,
        templateImage: activeTemplate.image,
        ctaText,
        ctaUrl
      })
      alert(`${response.message}. Fallidos: ${response.data.fallidos}`)
      await fetchAudience()
    } catch (error: unknown) {
      const err = error as { message?: string }
      alert(err.message || 'Error al enviar anuncio')
    } finally {
      setIsSending(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <main className="mx-auto w-full max-w-[1600px] px-2 sm:px-4 lg:px-6 xl:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-sm text-[#FF7101] font-black mb-1">
                <Megaphone size={16} />
                CRM Marketing
              </div>
              <h1 className="text-2xl font-black text-[#01103B]">Campanas, promociones y anuncios</h1>
              <p className="text-sm text-gray-500">Selecciona clientes, elige una plantilla visual y envia correos profesionales.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(340px,390px)] gap-5">
          <section className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {SEGMENTS.map((item) => {
                    const Icon = item.icon
                    const active = segmento === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSegmento(item.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-bold border flex items-center gap-2 ${active ? 'bg-[#01103B] text-white border-[#01103B]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        <Icon size={15} />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar contacto..."
                    className="pl-9 pr-3 py-2 w-full md:w-64 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex gap-2">
                  <button onClick={() => setSendMode('audience')} className={`px-3 py-2 rounded-lg text-sm font-bold ${sendMode === 'audience' ? 'bg-[#FF7101] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Enviar a audiencia</button>
                  <button onClick={() => setSendMode('selected')} className={`px-3 py-2 rounded-lg text-sm font-bold ${sendMode === 'selected' ? 'bg-[#FF7101] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Enviar seleccionados</button>
                </div>
                <button onClick={toggleAllFiltered} className="text-sm font-bold text-[#0740E4]">
                  {filteredContacts.every((contact) => selectedIds.includes(contact.id)) && filteredContacts.length > 0 ? 'Quitar seleccion' : 'Seleccionar visibles'}
                </button>
              </div>

              <div className="min-h-[420px] overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-white text-xs uppercase text-gray-500">
                    <tr>
                      <th className="w-14 px-3 py-3 text-left">Sel.</th>
                      <th className="px-3 py-3 text-left">Contacto</th>
                      <th className="w-32 px-3 py-3 text-left">Segmento</th>
                      <th className="w-32 px-3 py-3 text-left">Último envío</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-500">Cargando audiencia...</td></tr>
                    ) : filteredContacts.length === 0 ? (
                      <tr><td colSpan={4} className="h-72 px-5 py-10 text-center text-gray-500">No hay contactos en esta audiencia.</td></tr>
                    ) : filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4">
                          <input type="checkbox" checked={selectedIds.includes(contact.id)} onChange={() => toggleContact(contact.id)} className="h-4 w-4 rounded border-gray-300" />
                        </td>
                        <td className="px-3 py-4">
                          <p className="font-bold text-gray-900">{contact.nombre}</p>
                          <p className="flex min-w-0 items-center gap-1 break-all text-sm text-gray-500"><Mail size={13} className="shrink-0" /> {contact.email}</p>
                          {contact.empresa && <p className="text-xs text-gray-400 mt-1">{contact.empresa}</p>}
                        </td>
                        <td className="px-3 py-4">
                          <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${contact.segmentoMarketing === 'cliente_acepto' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {contact.segmentoMarketing === 'cliente_acepto' ? 'Cliente' : 'Rechazó'}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {contact.ultimoEnvioMarketing ? new Date(contact.ultimoEnvioMarketing).toLocaleString('es-PE') : 'Sin envios'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="bg-white border border-gray-200 rounded-2xl p-5 h-fit shadow-sm xl:sticky xl:top-6">
            <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-black text-[#01103B]">Plantillas profesionales</h2>
                  <p className="text-sm text-gray-500">Selecciona una plantilla o crea una nueva con imagen.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTemplateForm((current) => !current)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#01103B] text-white hover:bg-[#0740E4]"
                  title="Crear plantilla"
                >
                  <Plus size={17} />
                </button>
              </div>

              <div className="relative mb-4">
                <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF7101]" />
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedTemplate}
                  onChange={(event) => applyTemplate(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-9 text-sm font-bold text-[#01103B] outline-none focus:border-[#FF7101] focus:ring-2 focus:ring-[#FF7101]/20"
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.badge}
                    </option>
                  ))}
                </select>
              </div>

              {showTemplateForm && (
                <div className="mb-4 space-y-3 rounded-xl border border-dashed border-[#FF7101]/40 bg-white p-3">
                  <input
                    value={newTemplate.name}
                    onChange={(event) => setNewTemplate((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Nombre de plantilla"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF7101]/20"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={newTemplate.badge}
                      onChange={(event) => setNewTemplate((current) => ({ ...current, badge: event.target.value }))}
                      placeholder="Etiqueta"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF7101]/20"
                    />
                    <input
                      value={newTemplate.ctaText}
                      onChange={(event) => setNewTemplate((current) => ({ ...current, ctaText: event.target.value }))}
                      placeholder="Texto boton"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF7101]/20"
                    />
                  </div>
                  <input
                    value={newTemplate.image}
                    onChange={(event) => setNewTemplate((current) => ({ ...current, image: event.target.value }))}
                    placeholder="URL de imagen"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF7101]/20"
                  />
                  <input
                    value={newTemplate.ctaUrl}
                    onChange={(event) => setNewTemplate((current) => ({ ...current, ctaUrl: event.target.value }))}
                    placeholder="Link del boton"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF7101]/20"
                  />
                  <input
                    value={newTemplate.subject}
                    onChange={(event) => setNewTemplate((current) => ({ ...current, subject: event.target.value }))}
                    placeholder="Asunto"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF7101]/20"
                  />
                  <textarea
                    value={newTemplate.message}
                    onChange={(event) => setNewTemplate((current) => ({ ...current, message: event.target.value }))}
                    placeholder="Mensaje"
                    rows={4}
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF7101]/20"
                  />
                  <button
                    type="button"
                    onClick={saveTemplate}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#34A853] px-3 py-2 text-sm font-black text-white hover:bg-[#2f984b]"
                  >
                    <Save size={15} />
                    Guardar plantilla
                  </button>
                </div>
              )}

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="h-32 bg-gray-100 bg-cover bg-center" style={{ backgroundImage: `url(${activeTemplate.image})` }} />
                <div className="p-4">
                  <span className="rounded-full bg-[#01103B]/10 px-2.5 py-1 text-xs font-bold text-[#01103B]">{activeTemplate.badge}</span>
                  <h3 className="mt-3 font-black text-[#01103B]">{activeTemplate.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold text-gray-600">{activeTemplate.subject}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Send size={18} className="text-[#FF7101]" />
              <h2 className="font-black text-[#01103B]">Enviar campana</h2>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 mb-5">
              <div className="h-36 bg-gray-100 bg-cover bg-center" style={{ backgroundImage: `url(${activeTemplate.image})` }} />
              <div className="p-4 bg-[#01103B] text-white">
                <p className="text-xs text-[#FFB072] font-bold">{activeTemplate.badge}</p>
                <p className="mt-1 font-black">{activeTemplate.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-[#FF7101]/10 p-3">
                <p className="text-sm font-bold text-[#01103B]">Destino</p>
                <p className="text-sm text-gray-600">{targetCount} contacto(s) - {sendMode === 'selected' ? 'seleccionados' : 'audiencia completa'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Asunto</label>
                <input value={asunto} onChange={(event) => setAsunto(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mensaje</label>
                <textarea value={mensaje} onChange={(event) => setMensaje(event.target.value)} rows={7} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Texto del boton</label>
                  <input value={ctaText} onChange={(event) => setCtaText(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Link del boton</label>
                  <input value={ctaUrl} onChange={(event) => setCtaUrl(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
              </div>
              <button
                onClick={sendAnnouncement}
                disabled={isSending || targetCount === 0}
                className="w-full px-4 py-3 rounded-lg bg-[#FF7101] text-white font-black hover:bg-[#e86600] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send size={17} />
                {isSending ? 'Enviando...' : 'Enviar correo profesional'}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
