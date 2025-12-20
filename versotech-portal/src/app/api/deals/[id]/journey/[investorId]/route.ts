import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface JourneyStage {
  stage_number: number
  stage_name: string
  completed_at: string | null
  is_current: boolean
}

/**
 * GET /api/deals/[id]/journey/[investorId]
 * Get the 10-stage investor journey status for a deal
 * Returns all stages with completion timestamps and current stage indicator
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; investorId: string }> }
) {
  const { id: dealId, investorId } = await params

  const clientSupabase = await createClient()
  const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check access: staff or investor linked to this investor entity
  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'

  // If not staff, verify the user is linked to this investor
  if (!isStaff) {
    const serviceSupabase = createServiceClient()
    const { data: investorLink } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .eq('investor_id', investorId)
      .single()

    if (!investorLink) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
  }

  const serviceSupabase = createServiceClient()

  // Call the RPC function to get journey stages
  const { data: journeyStages, error: rpcError } = await serviceSupabase
    .rpc('get_investor_journey_stage', {
      p_deal_id: dealId,
      p_investor_id: investorId
    })

  if (rpcError) {
    console.error('Error fetching journey stages:', rpcError)
    return NextResponse.json({ error: 'Failed to fetch journey status' }, { status: 500 })
  }

  // Calculate summary statistics
  const stages = (journeyStages as JourneyStage[]) || []
  const completedStages = stages.filter(s => s.completed_at !== null)
  const currentStage = stages.find(s => s.is_current)
  const progressPercentage = Math.round((completedStages.length / stages.length) * 100)

  return NextResponse.json({
    deal_id: dealId,
    investor_id: investorId,
    stages,
    summary: {
      total_stages: stages.length,
      completed_stages: completedStages.length,
      current_stage: currentStage?.stage_name || null,
      current_stage_number: currentStage?.stage_number || 0,
      progress_percentage: progressPercentage,
      is_complete: completedStages.length === stages.length
    }
  })
}
