import { NextRequest, NextResponse } from 'next/server'

import {
  hasMarketingAdminAccess,
  requireAuthenticatedProfile,
  verifyInvestorMembership,
} from '@/lib/dashboard-marketing/auth'
import { buildMarketingDocumentPreviewResponse } from '@/lib/dashboard-marketing/documents'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
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

  const mode =
    request.nextUrl.searchParams.get('mode') === 'download'
      ? 'download'
      : 'preview'
  const investorId = request.nextUrl.searchParams.get('investor_id')
  const isAdmin = await hasMarketingAdminAccess(auth.supabase, auth.user.id)
  const { id } = await params

  if (!isAdmin) {
    if (!investorId) {
      return NextResponse.json(
        { error: 'investor_id is required' },
        { status: 400 }
      )
    }

    const hasMembership = await verifyInvestorMembership(auth.user.id, investorId)
    if (!hasMembership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const supabase = createServiceClient() as any
  const { data: card, error } = await supabase
    .from('dashboard_marketing_cards')
    .select(
      'id, card_type, status, document_storage_path, document_file_name, document_mime_type'
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  if (card.card_type !== 'document') {
    return NextResponse.json(
      { error: 'Preview is only available for document cards' },
      { status: 400 }
    )
  }

  if (!isAdmin && card.status !== 'published') {
    return NextResponse.json({ error: 'Card is not available' }, { status: 400 })
  }

  try {
    return NextResponse.json(
      await buildMarketingDocumentPreviewResponse({
        supabase,
        card,
        mode,
      })
    )
  } catch (previewError) {
    console.error(
      '[dashboard-marketing/document] Failed to build document preview:',
      previewError
    )
    return NextResponse.json(
      { error: 'Failed to load document preview' },
      { status: 500 }
    )
  }
}
