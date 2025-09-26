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

    // If user was created successfully
    if (data.user) {
      // For development, provide immediate signup without email verification
      if (process.env.NODE_ENV === 'development') {
        console.log('[auth] Development mode: Auto-confirming user', email)
        
        // In development, manually confirm the email
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          data.user.id,
          { email_confirm: true }
        )
        
        if (confirmError) {
          console.warn('[auth] Email confirmation failed:', confirmError)
        }
        
        // Create profile immediately in development
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            display_name: displayName,
            role: role,
            created_at: new Date().toISOString()
          }, { onConflict: 'id' })

        if (profileError) {
          console.warn('[auth] Profile creation failed:', profileError)
        }

        return NextResponse.json({
          success: true,
          message: 'Account created successfully! You can now sign in.',
          user: {
            id: data.user.id,
            email: data.user.email,
            role: role,
            displayName: displayName
          }
        })
      }
    }

    // In production, send verification email
    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      requiresVerification: true,
      redirectUrl: portalContext === 'staff' ? '/versotech/login' : '/versoholdings/login'
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
