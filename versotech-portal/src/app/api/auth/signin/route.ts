import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authenticateUser, createSession } from '@/lib/simple-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, portal } = await request.json()

    if (!email || !password || !portal) {
      return NextResponse.json({ 
        error: 'Email, password, and portal are required' 
      }, { status: 400 })
    }

    // Authenticate user
    const user = authenticateUser(email, password)
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }

    // Check portal access
    const isInvestorPortal = portal === 'investor'
    const isStaffPortal = portal === 'staff'

    if (isInvestorPortal && user.role !== 'investor') {
      return NextResponse.json({ 
        error: 'This account cannot access the investor portal' 
      }, { status: 403 })
    }

    if (isStaffPortal && user.role !== 'staff') {
      return NextResponse.json({ 
        error: 'This account cannot access the staff portal' 
      }, { status: 403 })
    }

    // Create session
    const session = createSession(user)

    // Set secure cookie
    const cookieStore = await cookies()
    cookieStore.set('demo_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    // Determine redirect URL
    const redirectUrl = user.role === 'investor' 
      ? '/versoholdings/dashboard' 
      : '/versotech/staff'

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        avatar: user.avatar,
        department: user.department
      },
      redirect: redirectUrl
    })

  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json({ 
      error: 'Authentication failed' 
    }, { status: 500 })
  }
}
