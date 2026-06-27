import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/leads', '/quotations', '/cases', '/users', '/profile', '/reports', '/forms']
const publicRoutes = ['/login', '/register']

// Función para validar la existencia del token (sin decodificar)
// La validación real del JWT se hace en el backend
function hasValidToken(token: string | undefined): boolean {
  if (!token || token.trim() === '') return false
  
  // Validación básica de formato JWT (debe tener 3 partes separadas por punto)
  const parts = token.split('.')
  if (parts.length !== 3) return false
  
  // Validar que cada parte tenga contenido
  if (parts.some(part => !part || part.length === 0)) return false
  
  // Validar que sea un JWT válido (header debe ser base64 válido)
  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf-8'))
    if (!header.alg) return false
  } catch {
    return false
  }
  
  return true
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('jwt_token')?.value

  // Solo verificamos que el token exista y tenga formato válido
  // La validación criptográfica se hace en el backend
  const isTokenValid = hasValidToken(token)

  // Si no hay token válido y intenta acceder a ruta protegida
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isTokenValid) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    return response
  }

  // Si hay token válido y intenta acceder a login/register
  if (publicRoutes.some((route) => pathname.startsWith(route)) && isTokenValid) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Nota: La validación de roles se hace en el backend
  // El middleware solo verifica autenticación básica
  // Si necesitas validar roles, hacerlo en cada página del dashboard

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
