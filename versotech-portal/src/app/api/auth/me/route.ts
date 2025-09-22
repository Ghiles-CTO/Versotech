import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserById, type SessionData } from '@/lib/simple-auth'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('demo_session')

    if (!sessionCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    const session: SessionData = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      // Clear expired session
      cookieStore.delete('demo_session')
      return NextResponse.json({ 
        error: 'Session expired' 
      }, { status: 401 })
    }

    // Get fresh user data
    const user = getUserById(session.id)
    
    if (!user) {
      cookieStore.delete('demo_session')
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        avatar: user.avatar,
        department: user.department
      },
      session: {
        sessionId: session.sessionId,
        expiresAt: session.expiresAt
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ 
      error: 'Failed to get user data' 
    }, { status: 500 })
  }
}
