import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { triggerWorkflow } from '@/lib/trigger-workflow'
import { NextResponse } from 'next/server'

/**
 * POST /api/test/trigger-nda
 * Manually trigger NDA workflow for a deal interest
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
    const { interest_id } = body

    if (!interest_id) {
      return NextResponse.json({ error: 'interest_id required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Fetch deal interest with all needed data
    const { data: interest, error: interestError } = await supabase
      .from('investor_deal_interest')
      .select(`
        *,
        deals (
          id, name, company_name,
          vehicles (id, name, series_number)
        ),
        investors (
          id, legal_name, display_name
        )
      `)
      .eq('id', interest_id)
      .single()

    if (interestError || !interest) {
      return NextResponse.json({ error: 'Interest not found', details: interestError?.message }, { status: 404 })
    }

    // Fetch signatories separately
    const { data: investorUsers, error: iuError } = await supabase
      .from('investor_users')
      .select('user_id, can_sign')
      .eq('investor_id', interest.investor_id)
      .eq('can_sign', true)

    console.log('Debug - investor_users query:', { investor_id: interest.investor_id, investorUsers, error: iuError })

    const userIds = investorUsers?.map(u => u.user_id) || []

    // Try auth.admin.listUsers to get user info (service client has admin access)
    const signatories = []
    for (const userId of userIds) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId)
      if (userData?.user) {
        signatories.push({
          id: userData.user.id,
          email: userData.user.email,
          full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0]
        })
      }
    }

    console.log('Debug - signatories from auth:', signatories)

    if (interest.status !== 'approved') {
      return NextResponse.json({ error: 'Interest must be approved first', status: interest.status }, { status: 400 })
    }

    if (signatories.length === 0) {
      return NextResponse.json({
        error: 'No signatories found for investor',
        investor_id: interest.investor_id,
        debug: { investorUsers, userIds, profiles }
      }, { status: 400 })
    }

    const deal = interest.deals
    const investor = interest.investors
    const vehicle = deal?.vehicles

    const results = []

    for (const profile of signatories) {
      const ndaPayload = {
        series_number: vehicle?.series_number || 'VC201',
        project_description: vehicle?.name || deal?.name || 'Investment Opportunity',
        investment_description: `${deal?.company_name || 'Company'} - ${deal?.name || 'Deal'}`,
        party_a_name: investor?.legal_name || investor?.display_name || 'Investor',
        party_a_signatory_name: profile?.full_name || 'Signatory',
        deal_id: deal?.id,
        investor_id: investor?.id,
        interest_id: interest.id,
        dataroom_email: profile?.email,
        execution_date: new Date().toISOString().split('T')[0]
      }

      console.log('🚀 Triggering NDA workflow with payload:', ndaPayload)

      const result = await triggerWorkflow({
        workflowKey: 'process-nda',
        payload: ndaPayload,
        entityType: 'deal_interest_nda',
        entityId: interest.id,
        user: {
          id: user.id,
          email: user.email || '',
          displayName: user.user_metadata?.full_name,
          role: 'staff',
          title: 'Staff'
        }
      })

      results.push({
        signatory: profile?.full_name,
        email: profile?.email,
        success: result.success,
        workflow_run_id: result.workflow_run_id,
        error: result.error,
        n8n_response: result.n8n_response
      })
    }

    return NextResponse.json({
      message: 'NDA workflow triggered',
      interest_id,
      results
    })
  } catch (error) {
    console.error('Test trigger-nda error:', error)
    return NextResponse.json({ error: 'Internal error', details: String(error) }, { status: 500 })
  }
}
