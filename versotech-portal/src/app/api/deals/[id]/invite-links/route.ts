import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { getAppUrl } from '@/lib/signature/token'

const createInviteLinkSchema = z.object({
  role: z.enum([
    'investor',
    'co_investor',
    'spouse',
    'advisor',
    'lawyer',
    'banker',
    'introducer',
    'viewer'
  ]),
  expires_in_hours: z.number().positive().default(168), // 7 days default
  max_uses: z.number().positive().default(1)
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff
    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { id: dealId } = await params

    // Fetch invite links
    const { data: inviteLinks, error } = await supabase
      .from('invite_links')
      .select(`
        id,
        role,
        expires_at,
        max_uses,
        used_count,
        created_at,
        created_by_profile:created_by (
          display_name,
          email
        )
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch invite links error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invite links' },
        { status: 500 }
      )
    }

    return NextResponse.json({ inviteLinks: inviteLinks || [] })

  } catch (error) {
    console.error('API /deals/[id]/invite-links GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const regularSupabase = await createClient()
    
    const { user, error: authError } = await getAuthenticatedUser(regularSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff
    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const { id: dealId } = await params
    const body = await request.json()
    const validatedData = createInviteLinkSchema.parse(body)

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex')

    // Calculate expiry
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + validatedData.expires_in_hours)

    // Create invite link
    const { data: inviteLink, error } = await supabase
      .from('invite_links')
      .insert({
        deal_id: dealId,
        role: validatedData.role,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        max_uses: validatedData.max_uses,
        used_count: 0,
        created_by: user.id
      })
      .select(`
        id,
        role,
        expires_at,
        max_uses,
        used_count,
        created_at
      `)
      .single()

    if (error) {
      console.error('Create invite link error:', error)
      return NextResponse.json(
        { error: 'Failed to create invite link' },
        { status: 500 }
      )
    }

    // Get deal info for the invite URL
    const { data: deal } = await supabase
      .from('deals')
      .select('name')
      .eq('id', dealId)
      .single()

    // Construct invite URL (raw token only returned once)
    const inviteUrl = `${getAppUrl()}/invite/${rawToken}`

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'invite_links',
      entity_id: inviteLink.id,
      metadata: {
        deal_id: dealId,
        role: validatedData.role,
        expires_at: expiresAt.toISOString()
      }
    })

    return NextResponse.json({
      inviteLink: {
        ...inviteLink,
        invite_url: inviteUrl, // Only returned on creation
        deal_name: deal?.name
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error('API /deals/[id]/invite-links POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
