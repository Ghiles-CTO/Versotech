import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Clear session cookie
    cookieStore.delete('demo_session')
    
    return NextResponse.json({ 
      success: true,
      message: 'Signed out successfully' 
    })

  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json({ 
      error: 'Sign out failed' 
    }, { status: 500 })
  }
}
