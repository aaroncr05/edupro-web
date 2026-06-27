import winston from 'winston'
import path from 'path'

// Definir niveles de log personalizados para seguridad
const securityLevels = {
  levels: {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
    debug: 5
  },
  colors: {
    critical: 'red',
    high: 'magenta',
    medium: 'yellow',
    low: 'cyan',
    info: 'green',
    debug: 'white'
  }
}

// Formatear logs para producción
const productionFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Formatear logs para desarrollo
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    return `${timestamp} [${level}]: ${message} ${metaStr}`
  })
)

// Registrar colores para que el colorizer de Winston los reconozca
winston.addColors(securityLevels.colors)

const isProduction = process.env.NODE_ENV === 'production'

// Crear logger de seguridad
export const securityLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: securityLevels.levels,
  transports: [
    // Archivo para todos los logs de seguridad
    new winston.transports.File({
      filename: path.join('logs', 'security.log'),
      level: 'info',
      format: productionFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    
    // Archivo separado para eventos críticos
    new winston.transports.File({
      filename: path.join('logs', 'security-critical.log'),
      level: 'critical',
      format: productionFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10
    }),
    
    // Consola para desarrollo
    ...(isProduction ? [] : [
      new winston.transports.Console({
        format: developmentFormat
      })
    ])
  ]
})

// Funciones helper para logs de seguridad
export const securityLog = {
  // Eventos de autenticación
  loginSuccess: (email: string, ip: string, userAgent: string) => {
    securityLogger.info('Login exitoso', {
      event: 'LOGIN_SUCCESS',
      email,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    })
  },
  
  loginFailure: (email: string, ip: string, reason: string, userAgent: string) => {
    securityLogger.warn('Login fallido', {
      event: 'LOGIN_FAILURE',
      email,
      ip,
      reason,
      userAgent,
      timestamp: new Date().toISOString()
    })
  },
  
  // Eventos de registro
  registrationSuccess: (email: string, ip: string) => {
    securityLogger.info('Registro exitoso', {
      event: 'REGISTRATION_SUCCESS',
      email,
      ip,
      timestamp: new Date().toISOString()
    })
  },
  
  // Recuperación de contraseña
  passwordResetRequested: (email: string, ip: string) => {
    securityLogger.warn('Solicitud de recuperación de contraseña', {
      event: 'PASSWORD_RESET_REQUESTED',
      email,
      ip,
      timestamp: new Date().toISOString()
    })
  },
  
  passwordResetSuccess: (email: string, ip: string) => {
    securityLogger.info('Contraseña restablecida', {
      event: 'PASSWORD_RESET_SUCCESS',
      email,
      ip,
      timestamp: new Date().toISOString()
    })
  },
  
  // Eventos de autorización
  accessDenied: (userId: number | undefined, route: string, role: string, ip: string) => {
    securityLogger.warn('Acceso denegado', {
      event: 'ACCESS_DENIED',
      userId,
      route,
      role,
      ip,
      timestamp: new Date().toISOString()
    })
  },
  
  // Eventos críticos
  bruteForceDetected: (ip: string, attempts: number) => {
    securityLogger.warn('Posible ataque de fuerza bruta detectado', {
      event: 'BRUTE_FORCE_DETECTED',
      ip,
      attempts,
      timestamp: new Date().toISOString()
    })
  },
  
  sqlInjectionAttempt: (ip: string, payload: string) => {
    securityLogger.error('Intento de SQL injection detectado', {
      event: 'SQL_INJECTION_ATTEMPT',
      ip,
      payload,
      timestamp: new Date().toISOString()
    })
  },
  
  xssAttempt: (ip: string, payload: string) => {
    securityLogger.error('Intento de XSS detectado', {
      event: 'XSS_ATTEMPT',
      ip,
      payload,
      timestamp: new Date().toISOString()
    })
  },
  
  // Errores del sistema
  systemError: (error: Error, context: string) => {
    securityLogger.error('Error crítico del sistema', {
      event: 'SYSTEM_ERROR',
      context,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
  },
  
  // Auditoría de datos sensibles
  sensitiveDataAccess: (userId: number, dataType: string, recordId?: number) => {
    securityLogger.info('Acceso a datos sensibles', {
      event: 'SENSITIVE_DATA_ACCESS',
      userId,
      dataType,
      recordId,
      timestamp: new Date().toISOString()
    })
  }
}