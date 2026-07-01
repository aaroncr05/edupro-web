import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

// Rate Limiting
import { loginLimiter, registerLimiter, forgotPasswordLimiter, verifyCodeLimiter, apiLimiter } from '@/common/middleware/rate-limiter'

// CSRF Protection
import { generateCSRFTokenMiddleware, csrfProtection } from '@/common/middleware/csrf'

// Routes
import authRoutes from '@/modules/auth/auth.routes'
import usersRoutes from '@/modules/users/users.routes'
import leadsRoutes from '@/modules/leads/leads.routes'
import quotationsRoutes from '@/modules/quotations/quotations.routes'
import casesRoutes from '@/modules/cases/cases.routes'
import cmsRoutes from '@/modules/cms/cms.routes'
import formsRoutes from '@/modules/forms/forms.routes'
import notificationsRoutes from '@/modules/notifications/notifications.routes'
import tasksRoutes from '@/modules/tasks/tasks.routes'
import marketingRoutes from '@/modules/marketing/marketing.routes'
import { automationsService } from '@/modules/automations/automations.service'

dotenv.config()

// Validar variables de entorno ANTES de iniciar
import { validateEnv } from '@/config/env'
validateEnv()

const app: Express = express()

// Confiar en el proxy de Railway (necesario para req.ip correcto y rate limiting)
app.set('trust proxy', 1)

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet({
  // Content Security Policy - Configurar según necesidades
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Ajustar en producción
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", process.env.API_URL || ''].filter(Boolean),
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  },
  // Prevenir MIME sniffing
  noSniff: true,
  // Prevenir clickjacking
  frameguard: {
    action: 'deny'
  },
  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: true,
  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: true,
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: 'same-site' },
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  // IE No Open
  ieNoOpen: true,
  // X-XSS-Protection (legacy, pero útil)
  xssFilter: true
}))

// Cookie Parser
app.use(cookieParser())

// CORS - debe ir ANTES del CSRF para que errores incluyan los headers correctos
const isProduction = process.env.NODE_ENV === 'production'

const allowedOrigins = isProduction
  ? [] // Se configuran via CORS_ORIGIN en variables de entorno
  : [
      'http://localhost:3000',
      'http://localhost:4004',
      'http://localhost:4005',
      'http://localhost:3001'
    ]

if (process.env.CORS_ORIGIN) {
  // Soporta múltiples orígenes separados por coma: "https://a.com,https://b.com"
  const origins = process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  allowedOrigins.push(...origins)
}

app.use(cors({
  origin: (origin, callback) => {
    // En producción, solo permitir orígenes específicos
    if (!origin) {
      // Permitir requests sin origen (mobile apps, curl, etc.)
      callback(null, true)
      return
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    
    // Log de intentos de acceso no autorizado
    console.warn(`🚫 CORS blocked: ${origin}`)
    callback(new Error(`Origin not allowed: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400 // 24 horas
}))

// CSRF Protection - solo en producción (igual que rate limiting)
app.use(generateCSRFTokenMiddleware)

app.use((req: Request, res: Response, next: NextFunction) => {
  if (!isProduction || req.path.startsWith('/api/auth/')) {
    return next()
  }
  // Requests desde orígenes CORS permitidos (SPA cross-origin) ya están
  // protegidas por CORS — el navegador valida el Origin y los atacantes
  // no pueden forjarlo en XHR/fetch. CSRF es redundante en ese caso.
  const origin = req.headers.origin || ''
  if (origin && allowedOrigins.includes(origin)) {
    return next()
  }
  csrfProtection(req, res, next)
})

// Body Parser
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ limit: '1mb', extended: true }))

// Logger
app.use(morgan('combined'))

// Rate Limiting - Aplicar ANTES de las rutas
app.use(apiLimiter) // Rate limiter general para toda la API

// ============================================
// RUTAS
// ============================================

// Auth Routes (con rate limiting específico)
app.use('/api/auth/login', loginLimiter)
app.use('/api/auth/register', registerLimiter)
app.use('/api/auth/forgot-password', forgotPasswordLimiter)
app.use('/api/auth/verify-code', verifyCodeLimiter)
app.use('/api/auth', authRoutes)

// Users Routes
app.use('/api/users', usersRoutes)

// Leads Routes
app.use('/api/leads', leadsRoutes)

// Quotations Routes
app.use('/api/quotations', quotationsRoutes)

// Cases Routes
app.use('/api/cases', casesRoutes)

// Forms Routes
app.use('/api/forms', formsRoutes)

// Notifications Routes
app.use('/api/notifications', notificationsRoutes)

// Tasks Routes
app.use('/api/tasks', tasksRoutes)

// Marketing Routes
app.use('/api/marketing', marketingRoutes)

// CMS Routes (Courses, Services, Settings)
app.use('/api', cmsRoutes)

// Health Check
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    await prisma.$queryRaw`SELECT 1`
    await prisma.$disconnect()
    res.status(200).json({ status: 'healthy' })
  } catch {
    res.status(503).json({ status: 'unhealthy' })
  }
})

// Root
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'EduPro CRM API' })
})

// ============================================
// ERROR HANDLING
// ============================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `La ruta ${req.method} ${req.path} no existe`,
    statusCode: 404
  })
})

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err)

  // Sanitizar errores de Prisma para no filtrar nombres de constraints ni detalles internos
  let message = err.message || 'Un error inesperado ocurrió'
  const isPrismaError = err.code?.startsWith?.('P') || err.constructor?.name?.includes('Prisma') || err.name?.includes('Prisma')
  if (isPrismaError && process.env.NODE_ENV === 'production') {
    message = 'Error interno del servidor'
  }

  res.status(err.statusCode || 500).json({
    error: err.name || 'Internal Server Error',
    message,
    statusCode: err.statusCode || 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// ============================================
// SERVIDOR
// ============================================

const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => {
  automationsService.start()

  console.log(`
╔════════════════════════════════════════════════════════╗
║   🚀 Backend Server Running                            ║
║   Port: ${PORT}                                          ║
║   Environment: ${process.env.NODE_ENV}                     ║
║   API Health: http://localhost:${PORT}/api/health       ║
║   API Root: http://localhost:${PORT}                    ║
╚════════════════════════════════════════════════════════╝
  `)
})

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  automationsService.stop()
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

export default app
