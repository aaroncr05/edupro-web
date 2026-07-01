import { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service'
import { LoginDTOSchema } from './dto/login.dto'
import { RegisterDTOSchema } from './dto/register.dto'
import { ForgotPasswordDTOSchema, VerifyCodeDTOSchema, ResetPasswordDTOSchema } from './dto/forgot-password.dto'
import { securityLog } from '@/common/utils/security-logger'

export class AuthController {
  private getCookieOptions(maxAge: number) {
    const isProduction = process.env.NODE_ENV === 'production'

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' as const : 'lax' as const,
      maxAge,
      path: '/',
      domain: isProduction && process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN : undefined
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = LoginDTOSchema.parse(req.body)
      const result = await authService.login(validatedData)

      res.cookie('jwt_token', result.token, this.getCookieOptions(7 * 24 * 60 * 60 * 1000))

      securityLog.loginSuccess(validatedData.email, req.ip || 'unknown', String(req.headers['user-agent'] || 'unknown'))

      res.status(200).json({
        success: true,
        data: { token: result.token, user: result.user },
        message: 'Login exitoso'
      })
    } catch (error: any) {
      const email = req.body?.email || 'unknown'
      securityLog.loginFailure(email, req.ip || 'unknown', error.message, String(req.headers['user-agent'] || 'unknown'))

      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(401).json({
        success: false,
        error: error.message || 'Error en login'
      })
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = RegisterDTOSchema.parse(req.body)
      const result = await authService.register(validatedData)

      res.cookie('jwt_token', result.token, this.getCookieOptions(7 * 24 * 60 * 60 * 1000))
      securityLog.registrationSuccess(validatedData.email, req.ip || 'unknown')

      res.status(201).json({
        success: true,
        data: { user: result.user },
        message: 'Usuario registrado exitosamente'
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(400).json({
        success: false,
        error: error.message || 'Error en registro'
      })
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = ForgotPasswordDTOSchema.parse(req.body)
      const result = await authService.forgotPassword(validatedData.email)
      securityLog.passwordResetRequested(validatedData.email, req.ip || 'unknown')

      res.status(200).json({
        success: true,
        data: result,
        message: 'Código de verificación enviado'
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(400).json({
        success: false,
        error: error.message || 'Error al solicitar código'
      })
    }
  }

  async verifyCode(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = VerifyCodeDTOSchema.parse(req.body)
      const result = await authService.verifyCode(validatedData.email, validatedData.code)

      res.cookie('jwt_token', result.token, this.getCookieOptions(15 * 60 * 1000))

      res.status(200).json({
        success: true,
        data: { verified: true },
        message: 'Código verificado correctamente'
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(400).json({
        success: false,
        error: error.message || 'Código inválido o expirado'
      })
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const email = (req as any).user?.email
      if (!email) {
        return res.status(401).json({ success: false, error: 'Token de reset inválido o expirado' })
      }

      const validatedData = ResetPasswordDTOSchema.parse(req.body)
      const result = await authService.resetPassword(email, validatedData.newPassword)
      securityLog.passwordResetSuccess(email, req.ip || 'unknown')

      // Limpiar el cookie de reset después de usarlo
      res.clearCookie('jwt_token', { path: '/' })

      res.status(200).json({
        success: true,
        data: result,
        message: 'Contraseña actualizada exitosamente'
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validación fallida',
          details: error.errors
        })
      }

      res.status(400).json({
        success: false,
        error: error.message || 'Error al resetear contraseña'
      })
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Token no válido o no proporcionado'
        })
      }

      const result = await authService.refreshToken(userId)
      res.cookie('jwt_token', result.token, this.getCookieOptions(7 * 24 * 60 * 60 * 1000))

      res.status(200).json({
        success: true,
        data: { refreshed: true },
        message: 'Token renovado'
      })
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message || 'Error al renovar token'
      })
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Token no válido o no proporcionado'
        })
      }

      const user = await authService.getCurrentUser(userId)

      res.status(200).json({
        success: true,
        data: user
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Error al obtener usuario'
      })
    }
  }

  async csrfToken(req: Request, res: Response, next: NextFunction) {
    const isProduction = process.env.NODE_ENV === 'production'
    let token = req.cookies?.csrf_token
    if (!token) {
      const { generateCSRFToken } = await import('@/common/middleware/csrf')
      token = generateCSRFToken()
      res.cookie('csrf_token', token, {
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? 'none' as const : 'strict' as const,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
      })
    }
    res.status(200).json({
      success: true,
      csrfToken: token,
      message: 'CSRF token disponible'
    })
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    res.clearCookie('jwt_token', {
      path: '/',
      domain: process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN : undefined
    })

    res.status(200).json({
      success: true,
      message: 'Sesión cerrada'
    })
  }
}

export const authController = new AuthController()
