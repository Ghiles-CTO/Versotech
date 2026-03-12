import { NextRequest, NextResponse } from 'next/server'

import { requireMarketingAdmin } from '@/lib/dashboard-marketing/auth'
import { fetchMarketingLinkMetadata } from '@/lib/dashboard-marketing/metadata'
import { marketingIngestLinkSchema } from '@/lib/dashboard-marketing/validation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const auth = await requireMarketingAdmin()
  if (auth.response) {
    return auth.response
  }
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = marketingIngestLinkSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const metadata = await fetchMarketingLinkMetadata(parsed.data.url)
    return NextResponse.json(metadata)
  } catch (error) {
    console.error('[admin/marketing/ingest-link] Failed to fetch metadata:', error)
    return NextResponse.json({ error: 'Failed to fetch link metadata' }, { status: 500 })
  }
}
