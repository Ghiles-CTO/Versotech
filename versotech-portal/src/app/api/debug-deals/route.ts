import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (!user || userError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('🔍 DEBUG: User ID:', user.id)

    // Get investor IDs linked to this user
    const { data: investorLinks, error: investorError } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    console.log('🔍 DEBUG: Investor links:', { investorLinks, investorError })

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorIds = investorLinks.map(link => link.investor_id)
    console.log('🔍 DEBUG: Investor IDs:', investorIds)

    // First, get deal IDs where user is a member
    const { data: membershipDeals, error: membershipError } = await supabase
      .from('deal_memberships')
      .select('deal_id')
      .or(`user_id.eq.${user.id},investor_id.in.(${investorIds.join(',')})`)

    console.log('🔍 DEBUG: Membership deals:', { membershipDeals, membershipError })

    const dealIds = membershipDeals?.map(m => m.deal_id) || []
    console.log('🔍 DEBUG: Deal IDs:', dealIds)

    if (dealIds.length === 0) {
      return NextResponse.json({ 
        message: 'No deals found',
        debug: {
          userId: user.id,
          investorIds,
          membershipDeals,
          membershipError
        }
      })
    }

    // Fetch deals where user is a member
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select(`
        *,
        vehicles (
          id,
          name,
          type
        ),
        deal_memberships (
          role,
          accepted_at
        ),
        fee_plans (
          id,
          name,
          description,
          is_default
        )
      `)
      .in('id', dealIds)
      .order('created_at', { ascending: false })

    console.log('🔍 DEBUG: Deals query result:', { deals, dealsError, dealCount: deals?.length || 0 })

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        investorIds,
        dealIds,
        deals,
        dealCount: deals?.length || 0,
        errors: {
          investorError,
          membershipError,
          dealsError
        }
      }
    })

  } catch (error) {
    console.error('🔍 DEBUG: API Error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}
