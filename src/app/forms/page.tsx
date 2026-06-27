'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { formsService, FormResponse, FormField, CreateFormDTO } from '@/services/forms.service'
import { Plus, Edit2, Trash2, Eye, EyeOff, MoreVertical, Search, ChevronLeft, Globe2 } from 'lucide-react'
import Link from 'next/link'

const ROLES_PERMITIDOS = ['administrador']

export default function FormsPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  
  // Estados principales
  const [forms, setForms] = useState<FormResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingForm, setEditingForm] = useState<FormResponse | null>(null)
  const [deletingFormId, setDeletingFormId] = useState<number | null>(null)

  // Form data
  const [formData, setFormData] = useState<CreateFormDTO>({
    nombre: '',
    descripción: '',
    campos: [],
    activo: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    // Validar rol
    if (user && !ROLES_PERMITIDOS.includes(user.rol?.nombre || '')) {
      router.push('/dashboard')
      return
    }

    const hasToken = token || localStorage.getItem('jwt_token')
    const hasUser = user || localStorage.getItem('user_data')

    if (!hasToken || !hasUser) {
      router.push('/login')
      return
    }

    fetchForms()
  }, [isHydrated, user, token, router])

  const fetchForms = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await formsService.getAllForms(1, 50)
      setForms(response.data)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Error al cargar formularios')
      console.error('Error fetching forms:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      alert('El nombre del formulario es requerido')
      return
    }
    if (formData.campos.length === 0) {
      alert('Debe agregar al menos un campo')
      return
    }

    try {
      setIsSubmitting(true)
      const newForm = await formsService.createForm(formData)
      setForms([newForm, ...forms])
      setFormData({ nombre: '', descripción: '', campos: [], activo: false })
      setShowCreateModal(false)
      alert('Formulario creado correctamente')
    } catch (err: unknown) {
      const error = err as { message?: string }
      alert(`Error: ${error.message || 'Error al crear formulario'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingForm) return

    try {
      setIsSubmitting(true)
      const updated = await formsService.updateForm(editingForm.id, formData)
      setForms(forms.map(f => f.id === editingForm.id ? updated : f))
      setFormData({ nombre: '', descripción: '', campos: [], activo: false })
      setEditingForm(null)
      setShowEditModal(false)
      alert('Formulario actualizado correctamente')
    } catch (err: unknown) {
      const error = err as { message?: string }
      alert(`Error: ${error.message || 'Error al actualizar formulario'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteForm = async () => {
    if (!deletingFormId) return

    try {
      setIsSubmitting(true)
      await formsService.deleteForm(deletingFormId)
      setForms(forms.filter(f => f.id !== deletingFormId))
      setDeletingFormId(null)
      setShowDeleteModal(false)
      alert('Formulario eliminado correctamente')
    } catch (err: unknown) {
      const error = err as { message?: string }
      alert(`Error: ${error.message || 'Error al eliminar formulario'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      required: false,
      order: formData.campos.length
    }
    setFormData({
      ...formData,
      campos: [...formData.campos, newField]
    })
  }

  const handleRemoveField = (index: number) => {
    setFormData({
      ...formData,
      campos: formData.campos.filter((_, i) => i !== index)
    })
  }

  const handleEditForm = (form: FormResponse) => {
    setEditingForm(form)
    setFormData({
      nombre: form.nombre,
      descripción: form.descripción,
      campos: form.campos,
      activo: form.activo
    })
    setShowEditModal(true)
    setActiveMenuId(null)
  }

  const handleDeleteClick = (id: number) => {
    setDeletingFormId(id)
    setShowDeleteModal(true)
    setActiveMenuId(null)
  }

  const handleTogglePublish = async (form: FormResponse) => {
    try {
      const updated = await formsService.updateForm(form.id, { activo: !form.activo })
      setForms(forms.map(f => f.id === form.id ? { ...f, ...updated } : f))
      setActiveMenuId(null)
    } catch (err: unknown) {
      const error = err as { message?: string }
      alert(`Error: ${error.message || 'Error al cambiar publicación'}`)
    }
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

  const filteredForms = forms.filter(f =>
    f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.descripción?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                <ChevronLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Formularios</h1>
              </div>
            </div>
            <button
              onClick={() => {
                setFormData({ nombre: '', descripción: '', campos: [], activo: false })
                setEditingForm(null)
                setShowCreateModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0740E4] text-white rounded-lg hover:bg-[#0530b0] transition"
            >
              <Plus size={20} />
              Nuevo Formulario
            </button>
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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar formularios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0740E4]"
            />
          </div>
        </div>

        {/* Forms List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-[#0740E4] animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Cargando formularios...</p>
            </div>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">No hay formularios creados</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-[#0740E4] hover:underline"
            >
              Crear el primer formulario
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredForms.map(form => (
              <div key={form.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{form.nombre}</h3>
                    <p className="text-sm text-gray-500 mt-1">{form.descripción}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {form.campos.length} campos
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        form.activo 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {form.activo ? 'Publicado' : 'Borrador'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {form.totalResponses || 0} respuestas
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === form.id ? null : form.id)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {activeMenuId === form.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <button
                          onClick={() => handleEditForm(form)}
                          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 text-left text-sm"
                        >
                          <Edit2 size={16} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleTogglePublish(form)}
                          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 text-left text-sm"
                        >
                          {form.activo ? <EyeOff size={16} /> : <Globe2 size={16} />}
                          {form.activo ? 'Quitar publicación' : 'Publicar'}
                        </button>
                        <button
                          onClick={() => router.push(`/forms/${form.id}/responses`)}
                          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 text-left text-sm"
                        >
                          <Eye size={16} />
                          Ver Respuestas
                        </button>
                        <button
                          onClick={() => handleDeleteClick(form.id)}
                          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-left text-sm text-red-600"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {editingForm ? 'Editar Formulario' : 'Nuevo Formulario'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                  setEditingForm(null)
                  setFormData({ nombre: '', descripción: '', campos: [], activo: false })
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ?
              </button>
            </div>

            <form onSubmit={editingForm ? handleUpdateForm : handleCreateForm} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Formulario
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0740E4]"
                  placeholder="Ej: Formulario de Contacto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripción || ''}
                  onChange={(e) => setFormData({...formData, descripción: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0740E4]"
                  placeholder="Descripción opcional"
                  rows={2}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Campos del Formulario
                  </label>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="text-sm text-[#0740E4] hover:underline flex items-center gap-1"
                  >
                    <Plus size={16} /> Agregar Campo
                  </button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {formData.campos.map((campo, index) => (
                    <div key={campo.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-600">Campo {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ?
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Nombre técnico"
                          value={campo.name}
                          onChange={(e) => {
                            const newCampos = [...formData.campos]
                            newCampos[index].name = e.target.value
                            setFormData({...formData, campos: newCampos})
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Etiqueta visible"
                          value={campo.label}
                          onChange={(e) => {
                            const newCampos = [...formData.campos]
                            newCampos[index].label = e.target.value
                            setFormData({...formData, campos: newCampos})
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <select
                          value={campo.type}
                          onChange={(e) => {
                            const newCampos = [...formData.campos]
                            newCampos[index].type = e.target.value as 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'date'
                            setFormData({...formData, campos: newCampos})
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="text">Texto</option>
                          <option value="email">Email</option>
                          <option value="phone">Teléfono</option>
                          <option value="textarea">Área de texto</option>
                          <option value="date">Fecha</option>
                        </select>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={campo.required}
                            onChange={(e) => {
                              const newCampos = [...formData.campos]
                              newCampos[index].required = e.target.checked
                              setFormData({...formData, campos: newCampos})
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">Requerido</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <label className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                formData.activo ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
              }`}>
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Globe2 size={16} className={formData.activo ? 'text-green-600' : 'text-amber-600'} />
                  Publicado en página web
                </span>
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  className="h-4 w-4"
                />
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setEditingForm(null)
                    setFormData({ nombre: '', descripción: '', campos: [], activo: false })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0740E4] text-white rounded-lg hover:bg-[#0530b0] disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : editingForm ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Eliminar Formulario</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este formulario? Se eliminarán todas sus respuestas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteForm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

