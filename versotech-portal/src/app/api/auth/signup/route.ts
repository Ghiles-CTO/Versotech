import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const displayName = typeof body.displayName === 'string' ? body.displayName : ''
    const portalContext = typeof body.portal === 'string' ? body.portal : 'investor'

    if (!email || !password || !displayName) {
      return NextResponse.json({
        error: 'Email, password, and display name are required'
      }, { status: 400 })
    }

    // Determine role based on portal and email domain
    let role = 'investor'
    const emailDomain = email.toLowerCase().split('@')[1]
    
    if (portalContext === 'staff') {
      // For staff portal, require versotech domain or assign staff_ops role
      if (emailDomain === 'versotech.com' || emailDomain === 'verso.com') {
        role = 'staff_admin'
      } else {
        // Allow other domains but assign staff_ops role
        role = 'staff_ops'
      }
    }

    const supabase = await createClient()

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return NextResponse.json({
        error: 'An account with this email already exists. Please sign in instead.'
      }, { status: 409 })
    }

    // Create the user
    console.log('[signup] Creating user with metadata:', {
      email,
      displayName,
      role,
      portal: portalContext
    })
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: role
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?portal=${portalContext}&next=${portalContext === 'staff' ? '/versotech/staff' : '/versoholdings/dashboard'}`
      }
    })

    if (error) {
      console.error('Signup error:', error)
      return NextResponse.json({
        error: error.message
      }, { status: 400 })
    }

    // User created successfully - email verification required
    if (data.user) {
      console.log('[auth] User signed up successfully, email verification required:', email)
      
      return NextResponse.json({
        success: true,
        message: 'Account created! Please check your email to verify your account before signing in.',
        requiresVerification: true,
        user: {
          id: data.user.id,
          email: data.user.email
        }
      })
    }

    // Fallback response
    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      requiresVerification: true
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
