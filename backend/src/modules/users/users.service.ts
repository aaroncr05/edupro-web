import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { CreateUserDTO } from './dto/create-user.dto'
import { UpdateUserDTO } from './dto/update-user.dto'
import { UserResponseDTO } from './dto/user-response.dto'

const prisma = new PrismaClient()

export class UserService {
  /**
   * Obtener todos los usuarios con paginación
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: UserResponseDTO[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }> {
    const skip = (page - 1) * limit

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        skip,
        take: limit,
        include: {
          rol: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.usuario.count()
    ])

    return {
      data: usuarios.map(u => this.mapUserToResponse(u)),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(userId: number): Promise<UserResponseDTO> {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: { rol: true }
    })

    if (!usuario) {
      throw new Error('Usuario no encontrado')
    }

    return this.mapUserToResponse(usuario)
  }

  /**
   * Obtener usuario por email
   */
  async getUserByEmail(email: string): Promise<UserResponseDTO | null> {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true }
    })

    return usuario ? this.mapUserToResponse(usuario) : null
  }

  /**
   * Crear nuevo usuario
   */
  async createUser(data: CreateUserDTO): Promise<UserResponseDTO> {
    // Verificar si el email ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new Error('El email ya está registrado')
    }

    // Verificar que el rol existe
    const rol = await prisma.rol.findUnique({
      where: { id: data.rolId }
    })

    if (!rol) {
      throw new Error('El rol no existe')
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        email: data.email,
        nombre: data.nombre,
        passwordHash,
        rolId: rol.id,
        telefono: data.telefono,
        fotoPerfil: data.fotoPerfil,
        activo: true
      },
      include: {
        rol: true
      }
    })

    return this.mapUserToResponse(usuario)
  }

  /**
   * Actualizar usuario
   */
  async updateUser(userId: number, data: UpdateUserDTO): Promise<UserResponseDTO> {
    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    })

    if (!usuario) {
      throw new Error('Usuario no encontrado')
    }

    // Verificar que el rol existe si se intenta actualizar
    if (data.idRol) {
      const rol = await prisma.rol.findUnique({
        where: { id: data.idRol }
      })
      if (!rol) {
        throw new Error('El rol no existe')
      }
    }

    // Verificar que el email no este duplicado si se intenta actualizar
    if (data.email && data.email !== usuario.email) {
      const existingUser = await prisma.usuario.findUnique({
        where: { email: data.email }
      })
      if (existingUser) {
        throw new Error('El email ya esta registrado')
      }
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: userId },
      data: {
        nombre: data.nombre ?? usuario.nombre,
        telefono: data.telefono ?? usuario.telefono,
        fotoPerfil: data.fotoPerfil ?? usuario.fotoPerfil,
        activo: data.activo ?? usuario.activo,
        rolId: data.idRol ?? usuario.rolId,
        email: data.email ?? usuario.email
      },
      include: {
        rol: true
      }
    })

    return this.mapUserToResponse(usuarioActualizado)
  }

  /**
   * Cambiar contraseña del usuario
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    })

    if (!usuario) {
      throw new Error('Usuario no encontrado')
    }

    // Verificar contraseña actual
    const passwordValid = await bcrypt.compare(currentPassword, usuario.passwordHash)

    if (!passwordValid) {
      throw new Error('Contraseña actual incorrecta')
    }

    // Hash de la nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    })

    return { message: 'Contraseña actualizada exitosamente' }
  }

  /**
   * Desactivar usuario (soft delete)
   */
  async deactivateUser(userId: number): Promise<{ message: string }> {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    })

    if (!usuario) {
      throw new Error('Usuario no encontrado')
    }

    await prisma.usuario.update({
      where: { id: userId },
      data: { activo: false }
    })

    return { message: 'Usuario desactivado exitosamente' }
  }

  /**
   * Activar usuario
   */
  async activateUser(userId: number): Promise<{ message: string }> {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    })

    if (!usuario) {
      throw new Error('Usuario no encontrado')
    }

    await prisma.usuario.update({
      where: { id: userId },
      data: { activo: true }
    })

    return { message: 'Usuario activado exitosamente' }
  }

  /**
   * Eliminar usuario (hard delete)
   */
  async deleteUser(userId: number): Promise<{ message: string }> {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    })

    if (!usuario) {
      throw new Error('Usuario no encontrado')
    }

    if (usuario.email.toLowerCase() === 'admin@edupro.com') {
      throw new Error('El administrador principal del sistema no se puede eliminar')
    }

    // Eliminar todas las relaciones primero (si es necesario)
    // Por ahora, solo eliminamos el usuario
    await prisma.usuario.delete({
      where: { id: userId }
    })

    return { message: 'Usuario eliminado exitosamente' }
  }

  /**
   * Obtener usuarios por rol
   */
  async getUsersByRole(roleId: number): Promise<UserResponseDTO[]> {
    const usuarios = await prisma.usuario.findMany({
      where: { rolId: roleId },
      include: { rol: true },
      orderBy: { createdAt: 'desc' }
    })

    return usuarios.map(u => this.mapUserToResponse(u))
  }

  /**
   * Mapear usuario a DTO de respuesta
   */
  private mapUserToResponse(usuario: any): UserResponseDTO {
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: {
        id: usuario.rol.id,
        nombre: usuario.rol.nombre
      },
      telefono: usuario.telefono,
      fotoPerfil: usuario.fotoPerfil,
      activo: usuario.activo,
      ultimoAcceso: usuario.ultimoAcceso,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt
    }
  }
}

export const userService = new UserService()
