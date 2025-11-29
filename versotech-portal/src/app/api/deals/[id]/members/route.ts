import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { createInvestorNotification } from '@/lib/notifications'

const addMemberSchema = z.object({
  user_id: z.string().uuid().optional(),
  investor_id: z.string().uuid().optional(),
  email: z.string().email().optional(),
  role: z.enum([
    'investor',
    'co_investor',
    'spouse',
    'advisor',
    'lawyer',
    'banker',
    'introducer',
    'viewer',
    'verso_staff'
  ]),
  send_notification: z.boolean().default(true)
}).refine(
  (data) => data.user_id || data.investor_id || data.email,
  { message: 'Must provide user_id, investor_id, or email' }
)

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

    const { id: dealId } = await params

    // Fetch members
    const { data: members, error } = await supabase
      .from('deal_memberships')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          email
        ),
        investors:investor_id (
          id,
          legal_name,
          type
        ),
        invited_by_profile:invited_by (
          display_name,
          email
        )
      `)
      .eq('deal_id', dealId)
      .order('invited_at', { ascending: false })

    if (error) {
      console.error('Fetch members error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      )
    }

    return NextResponse.json({ members: members || [] })

  } catch (error) {
    console.error('API /deals/[id]/members GET error:', error)
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
    const validatedData = addMemberSchema.parse(body)

    // Resolve user_id from email or investor_id if not provided directly
    let resolvedUserId = validatedData.user_id
    let resolvedInvestorId = validatedData.investor_id

    if (!resolvedUserId) {
      if (validatedData.email) {
        // Find user by email
        const { data: userByEmail } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', validatedData.email)
          .single()

        if (!userByEmail) {
          return NextResponse.json(
            { error: 'User not found with provided email' },
            { status: 404 }
          )
        }

        resolvedUserId = userByEmail.id
      } else if (validatedData.investor_id) {
        // Find primary user for investor
        const { data: investorUser } = await supabase
          .from('investor_users')
          .select('user_id')
          .eq('investor_id', validatedData.investor_id)
          .limit(1)
          .single()

        if (!investorUser) {
          return NextResponse.json(
            { error: 'No user found for provided investor' },
            { status: 404 }
          )
        }

        resolvedUserId = investorUser.user_id
        resolvedInvestorId = validatedData.investor_id
      }
    }

    if (!resolvedUserId) {
      return NextResponse.json(
        { error: 'Could not resolve user' },
        { status: 400 }
      )
    }

    // Check if membership already exists
    const { data: existingMember } = await supabase
      .from('deal_memberships')
      .select('deal_id, user_id')
      .eq('deal_id', dealId)
      .eq('user_id', resolvedUserId)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this deal' },
        { status: 409 }
      )
    }

    // Create membership
    // Auto-accept when staff explicitly adds existing users
    const { data: membership, error } = await supabase
      .from('deal_memberships')
      .insert({
        deal_id: dealId,
        user_id: resolvedUserId,
        investor_id: resolvedInvestorId,
        role: validatedData.role,
        invited_by: user.id,
        accepted_at: new Date().toISOString() // Auto-accept for staff-added members
      })
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          email
        ),
        investors:investor_id (
          id,
          legal_name
        )
      `)
      .single()

    if (error) {
      console.error('Create membership error:', error)
      return NextResponse.json(
        { error: 'Failed to add member' },
        { status: 500 }
      )
    }

    // Send notification if requested
    if (validatedData.send_notification && resolvedUserId) {
      try {
        // Get deal name for notification
        const { data: deal } = await supabase
          .from('deals')
          .select('name')
          .eq('id', dealId)
          .single()

        const dealName = deal?.name || 'a deal'

        await createInvestorNotification({
          userId: resolvedUserId,
          investorId: resolvedInvestorId ?? undefined,
          title: 'Deal Invitation',
          message: `You've been invited to view ${dealName}. Review the deal details and data room.`,
          link: `/versoholdings/deals/${dealId}`,
          type: 'deal_invite',
          extraMetadata: {
            deal_id: dealId,
            role: validatedData.role,
            invited_by: user.id
          }
        })
      } catch (notificationError) {
        console.error('[deal-members] Failed to send notification:', notificationError)
      }
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'deal_memberships',
      entity_id: dealId,
      metadata: {
        added_user_id: resolvedUserId,
        role: validatedData.role,
        investor_id: resolvedInvestorId
      }
    })

    return NextResponse.json({ membership }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error('API /deals/[id]/members POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
