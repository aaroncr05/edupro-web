import { jwtVerify, SignJWT } from 'jose'
import dotenv from 'dotenv'

dotenv.config()

const getSecretKey = () => {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET no configurado o demasiado corto')
  }

  return new TextEncoder().encode(jwtSecret)
}

interface JWTPayload {
  [key: string]: unknown
  userId: number
  email: string
  rol?: {
    nombre: string
  }
  iat?: number
  exp?: number
}

/**
 * Genera un token JWT firmado criptográficamente
 */
export async function generateJWT(
  userId: number,
  email: string,
  rolNombre?: string,
  expiresIn: string = '7d'
): Promise<string> {
  return new SignJWT({
    userId,
    email,
    rol: rolNombre ? { nombre: rolNombre } : undefined
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setSubject(userId.toString())
    .sign(getSecretKey())
}

/**
 * Verifica y decodifica un JWT token de forma segura
 * Retorna null si el token es inválido o expiró
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256']
    })
    
    return payload as unknown as JWTPayload
  } catch (error) {
    // Token inválido o expirado
    return null
  }
}

