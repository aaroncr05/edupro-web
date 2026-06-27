import { Request, Response, NextFunction } from 'express'
import { authService } from '../auth.service'

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number
    email: string
  }
}

export const jwtGuard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    const token = req.cookies?.jwt_token || bearerToken

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
        message: 'Inicia sesión nuevamente'
      })
    }

    const decoded = await authService.verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado'
      })
    }

    req.user = decoded
    next()
  } catch {
    res.status(401).json({
      success: false,
      error: 'Error al validar token'
    })
  }
}
