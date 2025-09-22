import { createClient } from '@/lib/supabase/server'
import { validateDemoCredentials } from '@/lib/demo-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password, portal } = await request.json()

    if (!email || !password || !portal) {
      return NextResponse.json({ 
        error: 'Email, password, and portal are required' 
      }, { status: 400 })
    }

    // Validate demo credentials
    const demoUser = validateDemoCredentials(email, password)
    if (!demoUser) {
      return NextResponse.json({ 
        error: 'Invalid demo credentials' 
      }, { status: 401 })
    }

    // Check if user is accessing correct portal
    const isInvestorPortal = portal === 'versoholdings'
    const isStaffPortal = portal === 'versotech'
    
    if (isInvestorPortal && demoUser.role !== 'investor') {
      return NextResponse.json({ 
        error: 'Staff accounts cannot access investor portal' 
      }, { status: 403 })
    }
    
    if (isStaffPortal && demoUser.role === 'investor') {
      return NextResponse.json({ 
        error: 'Investor accounts cannot access staff portal' 
      }, { status: 403 })
    }

    const supabase = await createClient()

    // Create or update the user profile in Supabase
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', demoUser.email)
      .single()

    let profile = existingProfile

    if (!existingProfile) {
      // Create new profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: demoUser.id,
          email: demoUser.email,
          role: demoUser.role,
          display_name: demoUser.display_name,
          title: demoUser.title
        })
        .select('*')
        .single()

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return NextResponse.json({ 
          error: 'Failed to create user profile' 
        }, { status: 500 })
      }

      profile = newProfile

      // If investor, create investor profile and link
      if (demoUser.role === 'investor' && demoUser.investor_profile) {
        const { data: investor } = await supabase
          .from('investors')
          .insert({
            id: `investor-${demoUser.id}`,
            legal_name: demoUser.investor_profile.legal_name,
            type: demoUser.investor_profile.type,
            kyc_status: demoUser.investor_profile.kyc_status,
            country: demoUser.investor_profile.country
          })
          .select()
          .single()

        if (investor) {
          // Link user to investor
          await supabase
            .from('investor_users')
            .insert({
              investor_id: investor.id,
              user_id: demoUser.id
            })
        }
      }
    }

    // Set auth cookie to simulate authentication
    const cookieStore = await cookies()
    cookieStore.set('demo_auth_user', demoUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    // Log authentication
    await auditLogger.log({
      actor_user_id: demoUser.id,
      action: AuditActions.LOGIN,
      entity: AuditEntities.USERS,
      entity_id: demoUser.id,
      metadata: {
        email: demoUser.email,
        role: demoUser.role,
        portal,
        auth_method: 'demo_credentials'
      }
    })

    // Determine redirect URL
    const redirectUrl = isInvestorPortal 
      ? '/versoholdings/dashboard'
      : '/versotech/staff'

    return NextResponse.json({
      success: true,
      user: {
        id: demoUser.id,
        email: demoUser.email,
        role: demoUser.role,
        display_name: demoUser.display_name
      },
      profile,
      redirect: redirectUrl
    })

  } catch (error) {
    console.error('Demo login error:', error)
    return NextResponse.json({ 
      error: 'Authentication failed' 
    }, { status: 500 })
  }
}

