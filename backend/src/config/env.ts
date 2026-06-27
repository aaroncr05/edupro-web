import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRATION: z.string().optional().default('7d'),
  
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  PORT: z.string().regex(/^\d+$/, 'PORT debe ser un número').optional().default('3001'),
  API_URL: z.string().url('API_URL debe ser una URL válida').optional(),
  
  // CORS
  CORS_ORIGIN: z.string().url('CORS_ORIGIN debe ser una URL válida').optional(),
  
  // Email (requeridos en producción)
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().regex(/^\d+$/, 'EMAIL_PORT debe ser un número').optional(),
  EMAIL_USER: z.string().email('EMAIL_USER debe ser un email válido').optional(),
  EMAIL_PASSWORD: z.string().min(1, 'EMAIL_PASSWORD es requerido').optional(),
  EMAIL_FROM: z.string().email('EMAIL_FROM debe ser un email válido').optional(),
  
  // Logging
  LOG_LEVEL: z.string().optional().default('info')
})

export type Env = z.infer<typeof envSchema>

let validatedEnv: Env | null = null

export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv
  }

  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const errors = result.error.errors.map(err => 
      `  ❌ ${err.path.join('.')}: ${err.message}`
    ).join('\n')
    
    console.error('\n🚨 ERRORES DE VALIDACIÓN DE VARIABLES DE ENTORNO:\n')
    console.error(errors)
    console.error('\n⚠️  El servidor no puede iniciar con variables de entorno inválidas\n')
    
    // En producción, lanzar error y detener la aplicación
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Variables de entorno inválidas')
    }
    
    // En desarrollo, solo advertir y usar valores por defecto
    console.warn('⚠️  Continuando en modo desarrollo con valores por defecto...\n')
  }

  validatedEnv = result.data || (process.env as unknown as Env)
  return validatedEnv
}

export function isProduction(): boolean {
  return validateEnv().NODE_ENV === 'production'
}

export function isDevelopment(): boolean {
  return validateEnv().NODE_ENV === 'development'
}

export function isTest(): boolean {
  return validateEnv().NODE_ENV === 'test'
}