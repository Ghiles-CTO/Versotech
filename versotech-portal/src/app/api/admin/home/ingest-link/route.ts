import { NextRequest, NextResponse } from 'next/server'

import { requireStaffActor } from '@/lib/home/api'
import { fetchHomeLinkMetadata } from '@/lib/home/metadata'
import { homeIngestLinkSchema } from '@/lib/home/validation'

export async function POST(request: NextRequest) {
  const access = await requireStaffActor()

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const parsed = homeIngestLinkSchema.safeParse(await request.json().catch(() => ({})))

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const metadata = await fetchHomeLinkMetadata(parsed.data.url)
    return NextResponse.json({ metadata })
  } catch (error) {
    console.error('[admin/home/ingest-link] Failed to ingest link:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metadata for URL' },
      { status: 422 }
    )
  }
}
