import { NextResponse, type NextRequest } from 'next/server'
import { getUserById, type SessionData } from '@/lib/simple-auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  try {
    // Skip middleware for static files
    if (
      pathname.startsWith('/_next/static') ||
      pathname.startsWith('/_next/image') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/webhooks') ||
      pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
    ) {
      return NextResponse.next()
    }

    // Public routes that don't require authentication
    const publicRoutes = [
      '/', 
      '/versoholdings/login', 
      '/versotech/login',
      '/test'
    ]
    
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // Check for authentication session
    const sessionCookie = request.cookies.get('demo_session')
    
    if (!sessionCookie) {
      // Not authenticated - redirect to appropriate login
      if (pathname.startsWith('/versoholdings')) {
        return NextResponse.redirect(new URL('/versoholdings/login', request.url))
      }
      if (pathname.startsWith('/versotech')) {
        return NextResponse.redirect(new URL('/versotech/login', request.url))
      }
      // Default to home
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Parse session
    let session: SessionData
    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      // Invalid session cookie - clear it and redirect
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('demo_session')
      return response
    }

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('demo_session')
      return response
    }

    // Get user data
    const user = getUserById(session.id)
    if (!user) {
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('demo_session')
      return response
    }

    // Role-based access control
    if (pathname.startsWith('/versoholdings') && user.role !== 'investor') {
      return NextResponse.redirect(new URL('/versotech/staff', request.url))
    }

    if (pathname.startsWith('/versotech') && user.role !== 'staff') {
      return NextResponse.redirect(new URL('/versoholdings/dashboard', request.url))
    }

    console.log(`✅ Access granted: ${user.email} (${user.role}) → ${pathname}`)
    return NextResponse.next()

  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}