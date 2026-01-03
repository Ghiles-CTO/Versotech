import { NextResponse } from 'next/server'

/**
 * Emergency session clearer - clears stale Supabase auth cookies
 * Visit: http://localhost:3000/api/auth/clear-session
 */
export async function GET() {
  const response = NextResponse.json({
    success: true,
    message: 'Session cleared successfully. Redirecting to login...'
  })

  // Clear Supabase auth cookies (project-specific)
  const cookiesToClear = [
    'sb-ipguxdssecfexudnvtia-auth-token',
    'sb-ipguxdssecfexudnvtia-auth-token-code-verifier',
    'verso_personas',
  ]

  for (const cookieName of cookiesToClear) {
    // Delete the cookie
    response.cookies.delete(cookieName)
    // Also set to empty as fallback
    response.cookies.set(cookieName, '', {
      maxAge: 0,
      path: '/',
      expires: new Date(0),
    })
  }

  // Redirect to login after clearing
  return NextResponse.redirect(new URL('/versotech_main/login', 'http://localhost:3000'), {
    headers: response.headers,
  })
}
