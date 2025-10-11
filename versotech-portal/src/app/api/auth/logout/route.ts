import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient()

    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      console.error('[auth] Supabase signOut error during /api/auth/logout:', signOutError)
    }

    const allCookies = cookieStore.getAll()
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith('sb-')) {
        cookieStore.delete(cookie.name)
      }
    })

    return NextResponse.json({
      success: !signOutError,
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
