import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { deal_id, reason } = body

    if (!deal_id) {
      return NextResponse.json(
        { error: 'Deal ID is required' },
        { status: 400 }
      )
    }

    const serviceSupabase = createServiceClient()

    // Get investor ID from user
    const { data: investorLink } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .single()

    if (!investorLink) {
      return NextResponse.json(
        { error: 'Investor profile not found' },
        { status: 404 }
      )
    }

    // Get current access record
    const { data: access } = await serviceSupabase
      .from('deal_data_room_access')
      .select('id, expires_at, deal_id')
      .eq('deal_id', deal_id)
      .eq('investor_id', investorLink.investor_id)
      .is('revoked_at', null)
      .single()

    if (!access) {
      return NextResponse.json(
        { error: 'No active access found' },
        { status: 404 }
      )
    }

    // Get deal info
    const { data: deal } = await serviceSupabase
      .from('deals')
      .select('id, name')
      .eq('id', deal_id)
      .single()

    // Check if there's already a pending extension request
    const { data: existingApproval } = await serviceSupabase
      .from('approvals')
      .select('id, status')
      .eq('entity_type', 'data_room_access_extension')
      .eq('entity_id', access.id)
      .eq('status', 'pending')
      .single()

    if (existingApproval) {
      return NextResponse.json(
        { error: 'Extension request already pending approval' },
        { status: 400 }
      )
    }

    // Create approval for extension request
    const { data: approval, error: approvalError } = await serviceSupabase
      .from('approvals')
      .insert({
        entity_type: 'data_room_access_extension',
        entity_id: access.id,
        action: 'approve',
        requested_by: user.id,
        related_investor_id: investorLink.investor_id,
        related_deal_id: deal_id,
        status: 'pending',
        priority: 'medium',
        request_reason: `Investor requesting 7-day extension for ${deal?.name || 'deal'} data room access`,
        entity_metadata: {
          deal_name: deal?.name,
          current_expires_at: access.expires_at,
          requested_reason: reason || 'No reason provided',
          access_id: access.id
        }
      })
      .select()
      .single()

    if (approvalError) {
      console.error('Failed to create extension approval:', approvalError)
      return NextResponse.json(
        { error: 'Failed to create extension request' },
        { status: 500 }
      )
    }

    console.log('✅ Data room extension request created:', {
      approval_id: approval.id,
      access_id: access.id,
      deal_id: deal_id,
      investor_id: investorLink.investor_id
    })

    return NextResponse.json({
      success: true,
      message: 'Extension request submitted successfully',
      approval_id: approval.id
    })

  } catch (error) {
    console.error('Extension request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
