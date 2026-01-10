import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/subscription-submissions/summary
 *
 * Returns the total confirmed interest amount from deal_subscription_submissions.
 * This represents investors who clicked "Subscribe Now" and submitted a subscription request.
 */
export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check staff access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'
  if (!isStaff) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Sum all amounts from deal_subscription_submissions payload_json
  // The amount is stored as payload_json->>'amount' or payload_json->>'subscription_amount'
  const { data, error } = await serviceSupabase.rpc('get_subscription_submissions_total')

  if (error) {
    // Fallback: query directly if RPC doesn't exist
    console.warn('[subscription-submissions/summary] RPC failed, using fallback query:', error.message)

    const { data: submissions, error: queryError } = await serviceSupabase
      .from('deal_subscription_submissions')
      .select('payload_json')

    if (queryError) {
      console.error('[subscription-submissions/summary] Query failed:', queryError)
      return NextResponse.json({ totalAmount: 0 })
    }

    // Calculate total from payload_json.amount
    const totalAmount = (submissions ?? []).reduce((sum, sub) => {
      const payload = sub.payload_json as Record<string, any> | null
      const amount = Number(payload?.amount ?? payload?.subscription_amount ?? 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

    return NextResponse.json({ totalAmount })
  }

  return NextResponse.json({ totalAmount: data ?? 0 })
}
