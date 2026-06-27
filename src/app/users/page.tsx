'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import Link from 'next/link'
import { 
  Users, Search, Filter, Plus, MoreVertical, 
  Shield, Mail, Calendar, ArrowLeft,
  CheckCircle2, XCircle, Edit2, Trash2, AlertCircle, Eye, EyeOff
} from 'lucide-react'

// Import dependencies
import { usersService, UserResponse } from '@/services/users.service'

const ROLES_PERMITIDOS = ['administrador']
const isProtectedAdmin = (u?: UserResponse | null) =>
  u?.email?.toLowerCase() === 'admin@edupro.com'

export default function UsersPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()

  const [isHydrated, setIsHydrated] = useState(false)
  
  // Proteger ruta según rol
  useEffect(() => {
    if (user && !ROLES_PERMITIDOS.includes(user.rol?.nombre || '')) {
      router.push('/dashboard')
    }
  }, [user, router])
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<UserResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)
  
  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    idRol: 2, // Default Asesor
    telefono: '',
    activo: true
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await usersService.getAllUsers()
      setUsers(response.data)
      setTotalUsers(response.pagination?.total ?? response.data.length)
    } catch (error: unknown) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Hydration check
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Auth check and fetch users
  useEffect(() => {
    if (!isHydrated) return
    
    if (!token || !user) {
      router.push('/login')
      return
    }
    fetchUsers()
  }, [isHydrated, token, user, router])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      await usersService.createUser(form)
      setShowCreateModal(false)
      setForm({ nombre: '', email: '', password: '', idRol: 2, telefono: '', activo: true })
      setSuccess('Usuario creado exitosamente')
      setTimeout(() => setSuccess(null), 3000)
      fetchUsers()
    } catch (err: unknown) {
      const errorMsg = err as { message?: string }
      setError(errorMsg.message || 'Error al crear usuario. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (u: UserResponse) => {
    setEditingUser(u)
    setForm({
      nombre: u.nombre,
      email: u.email,
      password: '',
      idRol: u.idRol,
      telefono: u.telefono || '',
      activo: u.activo ?? true
    })
    setShowEditModal(true)
    setActiveMenuId(null)
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      await usersService.updateUser(editingUser.id, {
        nombre: form.nombre,
        email: form.email,
        idRol: form.idRol,
        telefono: form.telefono || null,
        activo: form.activo
      } as UserResponse)
      setShowEditModal(false)
      setEditingUser(null)
      setForm({ nombre: '', email: '', password: '', idRol: 2, telefono: '', activo: true })
      setSuccess('Usuario actualizado exitosamente')
      setTimeout(() => setSuccess(null), 3000)
      fetchUsers()
    } catch (err: unknown) {
      const errorMsg = err as { message?: string }
      setError(errorMsg.message || 'Error al actualizar usuario. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteModal = (u: UserResponse) => {
    if (isProtectedAdmin(u)) {
      setError('El administrador principal del sistema no se puede eliminar.')
      setActiveMenuId(null)
      return
    }

    setSelectedUser(u)
    setShowDeleteModal(true)
    setActiveMenuId(null)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    if (isProtectedAdmin(selectedUser)) {
      setError('El administrador principal del sistema no se puede eliminar.')
      setShowDeleteModal(false)
      setSelectedUser(null)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      await usersService.deleteUser(selectedUser.id)
      setShowDeleteModal(false)
      setSelectedUser(null)
      setSuccess('Usuario eliminado exitosamente')
      setTimeout(() => setSuccess(null), 3000)
      fetchUsers()
    } catch (err: unknown) {
      const errorMsg = err as { message?: string }
      setError(errorMsg.message || 'Error al eliminar usuario. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  const filteredUsers = users.filter(u => 
    (u.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
              <h1 className="text-lg font-bold text-[#01103B] leading-none">Gestión de Usuarios</h1>
            </div>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#FF7101] hover:bg-[#FF7101]/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Usuario</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* KPI / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Usuarios Totales', val: totalUsers.toString(), color: '#0740E4', icon: Users },
            { label: 'Usuarios Activos', val: users.filter(u => u.activo).length.toString(), color: '#34A853', icon: CheckCircle2 },
            { label: 'Roles Diferentes', val: Array.from(new Set(users.map(u => u.idRol))).length.toString(), color: '#9333EA', icon: Shield },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: s.color + '15', color: s.color }}>
                <s.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{isLoading ? '-' : s.val}</p>
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
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
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0740E4]/20 focus:border-[#0740E4] transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-fit">
              <Filter size={16} />
              Filtrar
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 hidden md:table-cell">Fecha de Registro</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                         <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#0740E4] animate-spin mb-2" />
                         Cargando usuarios...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0740E4] to-[#00CCFF] flex items-center justify-center text-white font-bold shadow-sm uppercase">
                          {u.nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-[#0740E4] transition-colors">{u.nombre}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <Mail size={12} /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        <Shield size={12} className={(u.rol?.nombre === 'Administrador' || u.idRol === 1) ? 'text-[#FF7101]' : 'text-gray-400'} />
                        {u.rol?.nombre || `Rol ${u.idRol}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        u.activo 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {u.activo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(u.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === u.id ? null : u.id)}
                          className="p-2 text-gray-400 hover:text-[#0740E4] hover:bg-[#0740E4]/10 rounded-lg transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {activeMenuId === u.id && (
                          <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-48 overflow-hidden">
                            <button
                              onClick={() => openEditModal(u)}
                              className="w-full px-4 py-3 text-left flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                            >
                              <Edit2 size={16} className="text-[#0740E4]" />
                              Editar
                            </button>
                            {isProtectedAdmin(u) ? (
                              <div className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-gray-400 bg-gray-50">
                                <Shield size={16} />
                                Protegido
                              </div>
                            ) : (
                              <button
                                onClick={() => openDeleteModal(u)}
                                className="w-full px-4 py-3 text-left flex items-center gap-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} />
                                Eliminar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Págination */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
            <span>Mostrando {filteredUsers.length} de {totalUsers} usuarios</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50">Anterior</button>
              <button className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#01103B]">Nuevo Usuario</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">Crea un acceso para un nuevo miembro del equipo</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({...form, nombre: e.target.value})}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Corporativo</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    placeholder="usuario@edupro.com"
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Rol</label>
                    <select
                      value={form.idRol}
                      onChange={(e) => setForm({...form, idRol: Number(e.target.value)})}
                      className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all bg-white"
                    >
                      <option value={1}>Administrador</option>
                      <option value={2}>Asesor</option>
                      <option value={3}>Soporte</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <input
                      type="tel"
                      value={form.telefono}
                      onChange={(e) => setForm({...form, telefono: e.target.value})}
                      placeholder="+51..."
                      className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Contraseña Temporal</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm({...form, password: e.target.value})}
                      placeholder="????????"
                      className="w-full px-5 py-3.5 pr-12 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-100 animate-shake">
                    {error}
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-4 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 rounded-2xl bg-[#FF7101] text-white text-sm font-bold shadow-lg shadow-[#FF7101]/30 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={18} />}
                    Crear Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#01103B]">Editar Usuario</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">Actualiza los datos de {editingUser.nombre}</p>
                </div>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({...form, nombre: e.target.value})}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Corporativo</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    placeholder="usuario@edupro.com"
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Rol</label>
                    <select
                      value={form.idRol}
                      onChange={(e) => setForm({...form, idRol: Number(e.target.value)})}
                      className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all bg-white"
                    >
                      <option value={1}>Administrador</option>
                      <option value={2}>Asesor</option>
                      <option value={3}>Soporte</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <input
                      type="tel"
                      value={form.telefono}
                      onChange={(e) => setForm({...form, telefono: e.target.value})}
                      placeholder="+51..."
                      className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]/20 focus:border-[#FF7101] transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado de Cuenta</label>
                    <p className="text-sm text-gray-600 mt-1">
                      {form.activo ? 'Usuario activo' : 'Usuario inactivo'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({...form, activo: !form.activo})}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      form.activo ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        form.activo ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-100 animate-shake">
                    {error}
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-4 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 rounded-2xl bg-[#0740E4] text-white text-sm font-bold shadow-lg shadow-[#0740E4]/30 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Edit2 size={18} />}
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[#01103B] mb-2">Eliminar Usuario</h3>
                <p className="text-sm text-gray-600 mb-6">
                  ¿Estás seguro de que deseas eliminar a <strong>{selectedUser.nombre}</strong>? Esta acción no se puede deshacer.
                </p>
                
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-4 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button"
                    onClick={handleDeleteUser}
                    disabled={isSubmitting}
                    className="flex-1 py-4 rounded-2xl bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-500/30 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={18} />}
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="fixed bottom-4 right-4 z-50 bg-green-50 text-green-700 px-6 py-4 rounded-2xl shadow-lg border border-green-200 flex items-center gap-3 animate-in slide-in-from-bottom">
            <CheckCircle2 size={20} />
            {success}
          </div>
        )}
      </main>
    </div>
  )
}
