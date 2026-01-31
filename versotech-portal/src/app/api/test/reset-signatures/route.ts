import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextResponse } from 'next/server'

/**
 * POST /api/test/reset-signatures
 * Delete signature requests for a subscription document to allow retry
 * Test-only endpoint for E2E testing
 */
export async function POST(request: Request) {
  try {
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const { subscription_id, document_type } = body

    if (!subscription_id) {
      return NextResponse.json({ error: 'subscription_id required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Find and delete signature requests for this subscription
    const query = supabase
      .from('signature_requests')
      .delete()
      .eq('subscription_id', subscription_id)

    if (document_type) {
      query.eq('document_type', document_type)
    }

    const { data, error, count } = await query.select()

    if (error) {
      return NextResponse.json({
        error: 'Failed to delete signature requests',
        details: error.message
      }, { status: 500 })
    }

    // Also reset the subscription document status if needed
    const { data: docs } = await supabase
      .from('subscription_documents')
      .select('id, status')
      .eq('subscription_id', subscription_id)
      .in('status', ['pending_signature', 'partially_signed'])

    if (docs && docs.length > 0) {
      await supabase
        .from('subscription_documents')
        .update({ status: 'final' })
        .eq('subscription_id', subscription_id)
        .in('status', ['pending_signature', 'partially_signed'])
    }

    return NextResponse.json({
      message: 'Signature requests deleted',
      subscription_id,
      deleted_count: data?.length || 0,
      deleted_requests: data,
      documents_reset: docs?.length || 0
    })
  } catch (error) {
    console.error('Test reset-signatures error:', error)
    return NextResponse.json({ error: 'Internal error', details: String(error) }, { status: 500 })
  }
}
