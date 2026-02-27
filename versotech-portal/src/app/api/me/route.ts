import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's profile with role and title information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Load investor links based on actual memberships (not only profile.role).
    // This keeps multi-persona users consistent.
    let investorLinks = null
    const { data: links, error: linksError } = await supabase
      .from('investor_users')
      .select(`
        investor_id,
        investors:investor_id (
          id,
          legal_name,
          kyc_status,
          country
        )
      `)
      .eq('user_id', user.id)

    if (!linksError) {
      investorLinks = links
    }

    // Log profile access for audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.READ,
      entity: AuditEntities.PROFILES,
      entity_id: profile.id,
      metadata: {
        endpoint: '/api/me',
        role: profile.role,
        has_investor_links: !!(investorLinks && investorLinks.length > 0)
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
      },
      profile,
      investorLinks
    })

  } catch (error) {
    console.error('API /me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
