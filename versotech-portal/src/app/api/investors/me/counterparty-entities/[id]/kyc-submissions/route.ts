import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/investors/me/counterparty-entities/[id]/kyc-submissions
 * Fetch KYC submissions for a specific counterparty entity
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: entityId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify entity belongs to user's investor
    const { data: entity, error: entityError } = await serviceSupabase
      .from('investor_counterparty')
      .select('investor_id')
      .eq('id', entityId)
      .single()

    if (entityError || !entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }

    // Check user has access to this investor
    const { data: link, error: linkError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .eq('investor_id', entity.investor_id)
      .single()

    if (linkError || !link) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch KYC submissions for this entity with document and member details
    const { data: submissions, error: submissionsError } = await serviceSupabase
      .from('kyc_submissions')
      .select(`
        *,
        document:documents(
          id,
          name,
          file_key,
          mime_type,
          file_size_bytes,
          created_at
        ),
        counterparty_member:counterparty_member_id(id, full_name, role)
      `)
      .eq('counterparty_entity_id', entityId)
      .order('submitted_at', { ascending: false })

    if (submissionsError) {
      console.error('Error fetching KYC submissions:', submissionsError)
      return NextResponse.json(
        { error: 'Failed to fetch KYC submissions' },
        { status: 500 }
      )
    }

    // Fetch entity members for the upload dialog
    const { data: members } = await serviceSupabase
      .from('counterparty_entity_members')
      .select('id, full_name, role')
      .eq('counterparty_entity_id', entityId)
      .eq('is_active', true)
      .order('full_name')

    return NextResponse.json({
      submissions: submissions || [],
      members: members || []
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/investors/me/counterparty-entities/[id]/kyc-submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
