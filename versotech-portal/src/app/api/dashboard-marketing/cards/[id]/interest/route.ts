import { NextRequest, NextResponse } from 'next/server'

import { requireAuthenticatedProfile, verifyInvestorMembership } from '@/lib/dashboard-marketing/auth'
import { notifyMarketingLeadRecipients } from '@/lib/dashboard-marketing/notifications'
import { marketingInterestSchema } from '@/lib/dashboard-marketing/validation'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthenticatedProfile()
  if (auth.response) {
    return auth.response
  }
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = marketingInterestSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { id } = await params
  const { investorId } = parsed.data
  const hasMembership = await verifyInvestorMembership(auth.user.id, investorId)
  if (!hasMembership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createServiceClient() as any
  const { data: card, error: cardError } = await supabase
    .from('dashboard_marketing_cards')
    .select('id, card_type, title, status')
    .eq('id', id)
    .maybeSingle()

  if (cardError || !card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  if (card.status !== 'published') {
    return NextResponse.json({ error: 'Card is not available' }, { status: 400 })
  }

  if (!['opportunity', 'event'].includes(card.card_type)) {
    return NextResponse.json({ error: 'Interest capture is not enabled for this card' }, { status: 400 })
  }

  const { data: existingLead } = await supabase
    .from('dashboard_marketing_leads')
    .select('id')
    .eq('card_id', id)
    .eq('user_id', auth.user.id)
    .maybeSingle()

  const alreadyExists = Boolean(existingLead)

  if (!alreadyExists) {
    const { error: insertError } = await supabase
      .from('dashboard_marketing_leads')
      .insert({
        card_id: id,
        user_id: auth.user.id,
        investor_id: investorId,
      })

    if (insertError) {
      console.error('[dashboard-marketing] Failed to capture interest:', insertError)
      return NextResponse.json({ error: 'Failed to capture interest' }, { status: 500 })
    }

    const [{ data: investor }, { data: profile }] = await Promise.all([
      supabase
        .from('investors')
        .select('display_name, legal_name')
        .eq('id', investorId)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', auth.user.id)
        .maybeSingle(),
    ])

    const investorName =
      investor?.display_name ||
      investor?.legal_name ||
      profile?.display_name ||
      profile?.email ||
      'Investor'

    await notifyMarketingLeadRecipients({
      actorUserId: auth.user.id,
      investorId,
      investorName,
      cardId: card.id,
      cardType: card.card_type,
      cardTitle: card.title,
    })
  }

  return NextResponse.json({
    success: true,
    created: !alreadyExists,
  })
}
