import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { DEMO_COOKIE_NAME } from '@/lib/demo-session'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Create response
    const response = NextResponse.json({ success: true })
    
    // Clear all auth-related cookies
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    response.cookies.delete(DEMO_COOKIE_NAME)
    
    // Set them to empty with immediate expiry to ensure they're cleared
    response.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' })
    response.cookies.set('sb-refresh-token', '', { maxAge: 0, path: '/' })
    response.cookies.set(DEMO_COOKIE_NAME, '', { maxAge: 0, path: '/' })
    
    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to sign out' 
    }, { status: 500 })
  }
}