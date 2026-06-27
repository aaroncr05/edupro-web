'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import Link from 'next/link'
import { 
  BarChart3, Search, Plus, MoreVertical, 
  ArrowLeft, Edit, Trash2, Eye, CheckCircle2, XCircle
} from 'lucide-react'
import { ImageInput } from '@/components/shared/ImageInput'

// Import services
import { coursesService, CourseResponse } from '@/services/courses.service'

export default function CoursesPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCourses, setTotalCourses] = useState(0)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    titulo: '',
    slug: '',
    descripción: '',
    imagen: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?q=80&w=2071&auto=format&fit=crop',
    objetivos: [] as string[],
    dirigidoA: '',
    contenido: [] as string[],
    precio: 0,
    activo: true,
    linkInscripcion: ''
  })

  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      const response = await coursesService.getAllCourses()
      setCourses(response.data)
      setTotalCourses(response.pagination?.total ?? response.data.length)
    } catch (error: unknown) {
      console.error('Error fetching courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!token || !user) {
      router.push('/login')
      return
    }
    fetchCourses()
  }, [token, user, router])

  const handleOpenModal = (course: CourseResponse | null = null) => {
    if (course) {
      setEditingCourse(course)
      setForm({
        titulo: course.titulo,
        slug: course.slug,
        descripción: course.descripción,
        imagen: course.imagen,
        objetivos: course.objetivos,
        dirigidoA: course.dirigidoA,
        contenido: course.contenido,
        precio: course.precio,
        activo: course.activo,
        linkInscripcion: course.linkInscripcion || ''
      })
    } else {
      setEditingCourse(null)
      setForm({
        titulo: '',
        slug: '',
        descripción: '',
        imagen: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?q=80&w=2071&auto=format&fit=crop',
        objetivos: [],
        dirigidoA: '',
        contenido: [],
        precio: 0,
        activo: true,
        linkInscripcion: ''
      })
    }
    setShowModal(true)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (editingCourse) {
        await coursesService.updateCourse(editingCourse.id, form)
      } else {
        await coursesService.createCourse(form)
      }
      setShowModal(false)
      fetchCourses()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido')
      setError(error.message || 'Error al guardar el curso')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  const filteredCourses = courses.filter(c => 
    (c.titulo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (c.slug?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#01103B] leading-none">Gestión de Cursos</h1>
            </div>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#FF7101] hover:bg-[#FF7101]/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Curso</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* KPI / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Cursos Activos', val: courses.filter(c => c.activo).length.toString(), change: 'Publicados', color: '#34A853', icon: CheckCircle2 },
            { label: 'En Borrador', val: courses.filter(c => !c.activo).length.toString(), change: 'No visibles', color: '#FF7101', icon: XCircle },
            { label: 'Total Cursos', val: totalCourses.toString(), change: 'En catálogo', color: '#0740E4', icon: BarChart3 },
            { label: 'Visitas Promedio', val: '1.2k', change: 'Este mes', color: '#9333EA', icon: Eye },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + '15', color: s.color }}>
                  <s.icon size={20} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-2xl font-black text-[#01103B]">{isLoading ? '-' : s.val}</p>
              <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{s.change}</p>
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
                placeholder="Buscar por título o slug..."
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
                  <th className="px-6 py-4">Imagen & Título</th>
                  <th className="px-6 py-4">Slug / URL</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Cargando cursos...
                    </td>
                  </tr>
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron cursos.
                    </td>
                  </tr>
                ) : filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          <img src={course.imagen} alt={course.titulo} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-[#01103B]">{course.titulo}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{course.descripción}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">/cursos/{course.slug}</code>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#FF7101]">S/ {(Number(course.precio) || 0).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                        course.activo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {course.activo ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleOpenModal(course)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200 max-h-[90vh]">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF7101]/10 flex items-center justify-center text-[#FF7101]">
                    <Plus size={24} className={editingCourse ? 'rotate-45' : ''} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#01103B]">{editingCourse ? 'Editar Curso' : 'Nuevo Curso Académico'}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">EduPro Education CMS</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-12 h-12 rounded-2xl hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2">
                    <XCircle size={16} /> {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Título del Curso</label>
                    <input 
                      required
                      value={form.titulo}
                      onChange={(e) => {
                        const val = e.target.value;
                        const slug = val.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
                        setForm({...form, titulo: val, slug: editingCourse ? form.slug : slug});
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all"
                      placeholder="Ej: Canva Kids"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Slug (URL)</label>
                    <input 
                      required
                      value={form.slug}
                      onChange={(e) => setForm({...form, slug: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all"
                      placeholder="ej: canva-kids"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descripción Corta</label>
                  <textarea 
                    required
                    rows={3}
                    value={form.descripción}
                    onChange={(e) => setForm({...form, descripción: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all resize-none"
                    placeholder="Descripción atractiva para el catálogo..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Precio (S/)</label>
                    <input 
                      type="number"
                      required
                      value={form.precio}
                      onChange={(e) => setForm({...form, precio: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all"
                    />
                  </div>
                  <div>
                    <ImageInput
                      value={form.imagen}
                      onChange={(newValue) => setForm({...form, imagen: newValue})}
                      label="Imagen del Curso"
                      placeholder="Sube una imagen o pega una URL"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Dirigido A</label>
                  <input 
                    value={form.dirigidoA}
                    onChange={(e) => setForm({...form, dirigidoA: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all"
                    placeholder="Ej: Niños de 7 a 12 años"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                   <input 
                     type="checkbox"
                     id="activo"
                     checked={form.activo}
                     onChange={(e) => setForm({...form, activo: e.target.checked})}
                     className="w-5 h-5 accent-[#FF7101] cursor-pointer"
                   />
                   <label htmlFor="activo" className="text-sm font-bold text-[#01103B] cursor-pointer">Publicar curso inmediatamente</label>
                </div>

                {/* Objetivos Section */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Objetivos del Curso</label>
                  <div className="flex gap-2">
                    <input 
                      id="new-objetivo"
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20"
                      placeholder="Escribe un objetivo y presiona Añadir..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            setForm({...form, objetivos: [...form.objetivos, input.value.trim()]});
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('new-objetivo') as HTMLInputElement;
                        if (input.value.trim()) {
                          setForm({...form, objetivos: [...form.objetivos, input.value.trim()]});
                          input.value = '';
                        }
                      }}
                      className="px-4 bg-[#FF7101] text-white rounded-2xl text-xs font-bold"
                    >Añadir</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.objetivos.map((obj, i) => (
                      <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600">
                        {obj}
                        <button 
                          type="button"
                          onClick={() => setForm({...form, objetivos: form.objetivos.filter((_, idx) => idx !== i)})}
                          className="text-red-400 hover:text-red-600"
                        ><XCircle size={14} /></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contenido Section */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Contenido Académico (Temario)</label>
                  <div className="flex gap-2">
                    <input 
                      id="new-contenido"
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20"
                      placeholder="Escribe un tema y presiona Añadir..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            setForm({...form, contenido: [...form.contenido, input.value.trim()]});
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('new-contenido') as HTMLInputElement;
                        if (input.value.trim()) {
                          setForm({...form, contenido: [...form.contenido, input.value.trim()]});
                          input.value = '';
                        }
                      }}
                      className="px-4 bg-[#FF7101] text-white rounded-2xl text-xs font-bold"
                    >Añadir</button>
                  </div>
                  <div className="space-y-2">
                    {form.contenido.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-2xl">
                        <span className="text-xs font-bold text-gray-600">{i + 1}. {item}</span>
                        <button 
                          type="button"
                          onClick={() => setForm({...form, contenido: form.contenido.filter((_, idx) => idx !== i)})}
                          className="text-red-400 hover:text-red-600"
                        ><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-white transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl bg-[#01103B] text-white text-sm font-bold hover:opacity-90 shadow-lg shadow-black/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {editingCourse ? 'Guardar Cambios' : 'Crear Curso'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

