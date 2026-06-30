import rateLimit, { RateLimitRequestHandler, ipKeyGenerator } from 'express-rate-limit'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Rate limiter para login - Previene brute force attacks
 * 5 intentos cada 15 minutos por IP
 */
export const loginLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    success: false,
    error: 'Demasiados intentos de login. Por favor intenta de nuevo en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return ipKeyGenerator(req.ip || 'unknown')
  },
  skip: () => !isProduction
})

/**
 * Rate limiter para registro - Previene spam de registros
 * 3 registros cada hora por IP
 */
export const registerLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 intentos
  message: {
    success: false,
    error: 'Demasiados registros. Por favor intenta de nuevo en 1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return ipKeyGenerator(req.ip || 'unknown')
  },
  skip: () => !isProduction
})

/**
 * Rate limiter para forgot-password - Previene spam de emails
 * 3 solicitudes cada hora por IP
 */
export const forgotPasswordLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 solicitudes
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor intenta de nuevo en 1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return ipKeyGenerator(req.ip || 'unknown')
  },
  skip: () => !isProduction
})

/**
 * Rate limiter para verify-code - Previene brute force del código
 * 5 intentos cada 15 minutos por email
 */
export const verifyCodeLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    success: false,
    error: 'Demasiados intentos de verificación. Por favor solicita un nuevo código'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body?.email || ipKeyGenerator(req.ip || 'unknown')
  },
  skip: () => !isProduction
})

/**
 * Rate limiter general para API - Previene abuso general
 * 500 requests cada 15 minutos por IP
 */
export const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // 500 requests
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor intenta de nuevo en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return ipKeyGenerator(req.ip || 'unknown')
  },
  skip: () => !isProduction
})