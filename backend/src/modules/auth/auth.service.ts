import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { LoginDTO } from './dto/login.dto'
import { RegisterDTO } from './dto/register.dto'
import { AuthResponseDTO } from './dto/auth-response.dto'
import { ResetPasswordDTO } from './dto/forgot-password.dto'
import { sendEmail } from '@/common/utils/email'
import { generateJWT, verifyJWT } from '@/common/utils/jwt'

const prisma = new PrismaClient()

export class AuthService {
  private readonly jwtExpiration = process.env.JWT_EXPIRATION || '7d'

  private async generateToken(userId: number, email: string, rolNombre?: string): Promise<string> {
    return generateJWT(userId, email, rolNombre, this.jwtExpiration)
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const usuario = await prisma.usuario.findUnique({
      where: { email: data.email }
    })

    if (!usuario) {
      throw new Error('Email o contraseña inválidos')
    }

    const passwordValid = await bcrypt.compare(data.password, usuario.passwordHash)

    if (!passwordValid) {
      throw new Error('Email o contraseña inválidos')
    }

    if (!usuario.activo) {
      throw new Error('El usuario ha sido desactivado')
    }

    const rol = await prisma.rol.findUnique({
      where: { id: usuario.rolId }
    })

    const token = await this.generateToken(usuario.id, usuario.email, rol?.nombre)

    return {
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: {
          id: rol?.id || 1,
          nombre: rol?.nombre || 'cliente'
        },
        activo: usuario.activo,
        createdAt: usuario.createdAt
      }
    }
  }

  async register(data: RegisterDTO): Promise<AuthResponseDTO> {
    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new Error('El email ya está registrado')
    }

    const rol = await prisma.rol.findFirst({
      where: { nombre: data.rol }
    })

    if (!rol) {
      throw new Error('Rol no válido')
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    const usuario = await prisma.usuario.create({
      data: {
        email: data.email,
        nombre: data.nombre,
        passwordHash: passwordHash,
        rolId: rol.id,
        activo: true
      }
    })

    const token = await this.generateToken(usuario.id, usuario.email, rol.nombre)

    return {
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: {
          id: rol.id,
          nombre: rol.nombre
        },
        activo: usuario.activo,
        createdAt: usuario.createdAt
      }
    }
  }

  async refreshToken(userId: number): Promise<{ token: string }> {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: { rol: true }
    })

    if (!usuario || !usuario.activo) {
      throw new Error('Usuario no encontrado o inactivo')
    }

    const token = await this.generateToken(usuario.id, usuario.email, usuario.rol?.nombre)

    return { token }
  }

  async getCurrentUser(userId: number): Promise<AuthResponseDTO['user']> {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    })

    if (!usuario) {
      throw new Error('Usuario no encontrado')
    }

    const rol = await prisma.rol.findUnique({
      where: { id: usuario.rolId }
    })

    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: {
        id: rol?.id || 1,
        nombre: rol?.nombre || 'cliente'
      },
      activo: usuario.activo,
      createdAt: usuario.createdAt
    }
  }

  async verifyToken(token: string): Promise<{ userId: number; email: string } | null> {
    const decoded = await verifyJWT(token)
    
    if (!decoded || !decoded.userId || !decoded.email) {
      return null
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email
    }
  }

  private generateVerificationCode(): string {
    const { randomInt } = require('crypto')
    return randomInt(100000, 1000000).toString()
  }

  private async sendVerificationEmail(email: string, code: string): Promise<void> {
    await sendEmail({
      to: email,
      subject: 'Código de verificación - Recuperación de contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #01103B 0%, #0740E4 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">EduPro Digitales</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #01103B; margin-top: 0;">Recuperación de Contraseña</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Has solicitado recuperar tu contraseña. Usa el siguiente código de verificación:
            </p>
            <div style="background: #0740E4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px;">
              <span style="color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 5px;">${code}</span>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Este código expirará en 15 minutos. Si no solicitaste este cambio, puedes ignorar este correo.
            </p>
          </div>
          <div style="background: #01103B; padding: 20px; text-align: center; color: #ffffff;">
            <p style="margin: 0; font-size: 12px;">© 2026 EduPro Digitales. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    })
  }

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    // Siempre devolver éxito para no revelar si el email existe
    if (!usuario) {
      return { success: true }
    }

    const code = this.generateVerificationCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.passwordResetToken.upsert({
      where: { email },
      update: { code, expiresAt, verified: false },
      create: { email, code, expiresAt }
    })

    await this.sendVerificationEmail(email, code)

    return { success: true }
  }

  async verifyCode(email: string, code: string): Promise<{ success: boolean; token: string }> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { email }
    })

    if (!resetToken) {
      throw new Error('No hay un código de verificación pendiente para este email')
    }

    if (resetToken.code !== code) {
      throw new Error('Código inválido')
    }

    if (new Date() > resetToken.expiresAt) {
      await prisma.passwordResetToken.delete({ where: { email } })
      throw new Error('Código expirado. Solicita uno nuevo')
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario) {
      throw new Error('Usuario no encontrado')
    }

    const rol = await prisma.rol.findUnique({
      where: { id: usuario.rolId }
    })

    const token = await this.generateToken(usuario.id, usuario.email, rol?.nombre)

    await prisma.passwordResetToken.update({
      where: { email },
      data: { verified: true }
    })

    return { success: true, token }
  }

  async resetPassword(data: ResetPasswordDTO): Promise<{ success: boolean }> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { email: data.email }
    })

    if (!resetToken) {
      throw new Error('No hay un código de verificación pendiente para este email')
    }

    if (resetToken.code !== data.code) {
      throw new Error('Código inválido')
    }

    if (new Date() > resetToken.expiresAt) {
      await prisma.passwordResetToken.delete({ where: { email: data.email } })
      throw new Error('Código expirado. Solicita uno nuevo')
    }

    if (!resetToken.verified) {
      throw new Error('El código no ha sido verificado')
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 12)

    await prisma.usuario.update({
      where: { email: data.email },
      data: { passwordHash }
    })

    await prisma.passwordResetToken.delete({
      where: { email: data.email }
    })

    return { success: true }
  }
}

export const authService = new AuthService()
