import { NextResponse } from 'next/server'

import { requireMarketingAdmin } from '@/lib/dashboard-marketing/auth'
import { mapMarketingLead } from '@/lib/dashboard-marketing/query'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireMarketingAdmin()
  if (auth.response) {
    return auth.response
  }
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient() as any
  const { data, error } = await supabase
    .from('dashboard_marketing_leads')
    .select(`
      id,
      card_id,
      user_id,
      investor_id,
      created_at,
      dashboard_marketing_cards (
        title,
        card_type
      ),
      profiles (
        display_name,
        email
      ),
      investors (
        display_name,
        legal_name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/marketing/leads] Failed to load leads:', error)
    return NextResponse.json({ error: 'Failed to load leads' }, { status: 500 })
  }

  return NextResponse.json({
    items: (data ?? []).map(mapMarketingLead),
  })
}
