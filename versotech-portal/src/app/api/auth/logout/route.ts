import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Clear demo auth cookie
    cookieStore.delete('demo_auth_user')
    
    // Also clear any Supabase auth cookies
    const allCookies = cookieStore.getAll()
    allCookies.forEach(cookie => {
      if (cookie.name.startsWith('sb-')) {
        cookieStore.delete(cookie.name)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}

