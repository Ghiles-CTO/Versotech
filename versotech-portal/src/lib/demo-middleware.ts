import { NextRequest, NextResponse } from 'next/server'
import { getDemoUserByEmail } from '@/lib/demo-auth'

export async function demoAuthMiddleware(request: NextRequest): Promise<{ user: any, profile: any } | null> {
  try {
    // Check for demo auth cookie
    const demoUserId = request.cookies.get('demo_auth_user')?.value
    
    if (!demoUserId) {
      return null
    }

    // Find the demo user
    const demoUsers = await import('@/lib/demo-auth').then(m => m.DEMO_USERS)
    const demoUser = Object.values(demoUsers).find(u => u.id === demoUserId)
    
    if (!demoUser) {
      return null
    }

    // Return user and profile in expected format
    return {
      user: {
        id: demoUser.id,
        email: demoUser.email
      },
      profile: {
        id: demoUser.id,
        role: demoUser.role,
        display_name: demoUser.display_name,
        email: demoUser.email,
        title: demoUser.title
      }
    }
  } catch (error) {
    console.error('Demo auth middleware error:', error)
    return null
  }
}

