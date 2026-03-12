import { NextRequest, NextResponse } from 'next/server'

import { requireAuthenticatedProfile, verifyInvestorMembership } from '@/lib/dashboard-marketing/auth'
import { buildMarketingCardsResponse } from '@/lib/dashboard-marketing/query'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticatedProfile()
  if (auth.response) {
    return auth.response
  }
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const investorId = request.nextUrl.searchParams.get('investor_id')
  if (!investorId) {
    return NextResponse.json({ error: 'investor_id is required' }, { status: 400 })
  }

  const hasMembership = await verifyInvestorMembership(auth.user.id, investorId)
  if (!hasMembership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createServiceClient() as any
  const { data, error } = await supabase
    .from('dashboard_marketing_cards')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[dashboard-marketing] Failed to load cards:', error)
    return NextResponse.json({ error: 'Failed to load announcements' }, { status: 500 })
  }

  return NextResponse.json(buildMarketingCardsResponse(data ?? []))
}
