import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

/**
 * Middleware CSRF con Double Submit Cookie Pattern
 * 
 * Funcionamiento:
 * 1. El servidor genera un token CSRF y lo envía en una cookie
 * 2. El cliente debe enviar el mismo token en el header X-CSRF-Token
 * 3. El servidor valida que ambos tokens coincidan
 * 
 * Esto previene ataques CSRF porque un atacante no puede leer cookies
 * de otros dominios debido a la misma política de origen.
 */

// Generar token CSRF seguro
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Middleware para validar CSRF en requests que modifican datos
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Solo aplicar a métodos que modifican datos
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  // Obtener token de la cookie
  const csrfCookie = req.cookies.csrf_token
  
  // Obtener token del header
  const csrfHeader = req.headers['x-csrf-token']

  // Validar que ambos existan y coincidan
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    console.warn(`🚫 CSRF validation failed: ${req.method} ${req.path}`)
    return res.status(403).json({
      success: false,
      error: 'CSRF token inválido o faltante',
      message: 'Por favor recarga la página e intenta nuevamente'
    })
  }

  next()
}

// Middleware para generar y enviar token CSRF
export const generateCSRFTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Generar nuevo token si no existe
  if (!req.cookies.csrf_token) {
    const token = generateCSRFToken()
    res.cookie('csrf_token', token, {
      httpOnly: false, // Necesario para que JS lo lea
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      path: '/'
    })
  }
  
  next()
}