import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { extractDomain } from '@/lib/messaging/url-utils'
import type { LinkPreview } from '@/lib/messaging/url-utils'
import { NextRequest, NextResponse } from 'next/server'
import ogs from 'open-graph-scraper'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message_id, url } = await request.json()

    if (!message_id || !url) {
      return NextResponse.json({ error: 'message_id and url are required' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()

    // Fetch the message and verify caller is a participant
    const { data: message, error: msgError } = await serviceSupabase
      .from('messages')
      .select('id, conversation_id, metadata')
      .eq('id', message_id)
      .single()

    if (msgError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Verify caller is a participant in the conversation
    const { data: participant } = await serviceSupabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', message.conversation_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!participant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
    }

    // Skip if link_preview already exists (idempotent)
    const existingMetadata = (message.metadata || {}) as Record<string, unknown>
    if (existingMetadata.link_preview) {
      return NextResponse.json({ success: true, skipped: true })
    }

    // Fetch OG data
    let preview: LinkPreview
    try {
      const { result } = await ogs({
        url,
        timeout: 5000,
        fetchOptions: {
          headers: {
            'User-Agent': 'VersoBot/1.0 (Link Preview)',
          },
        },
      })

      const ogTitle = result.ogTitle || null
      const ogDescription = result.ogDescription || null
      const ogImage = result.ogImage?.[0]?.url || null
      const favicon = result.favicon || null

      // If we got nothing useful, skip
      if (!ogTitle && !ogDescription && !ogImage) {
        return NextResponse.json({ success: true, skipped: true })
      }

      preview = {
        url,
        title: ogTitle,
        description: ogDescription,
        image: ogImage,
        favicon: favicon ? (favicon.startsWith('http') ? favicon : new URL(favicon, url).href) : null,
        domain: extractDomain(url),
        fetched_at: new Date().toISOString(),
      }
    } catch {
      // OG fetch failed — message already sent, just skip the preview
      return NextResponse.json({ success: true, skipped: true })
    }

    // Merge link_preview into existing metadata
    const updatedMetadata = { ...existingMetadata, link_preview: preview }
    const { error: updateError } = await serviceSupabase
      .from('messages')
      .update({ metadata: updatedMetadata })
      .eq('id', message_id)

    if (updateError) {
      console.error('[link-preview] Failed to update message metadata:', updateError)
      return NextResponse.json({ error: 'Failed to save preview' }, { status: 500 })
    }

    return NextResponse.json({ success: true, preview })
  } catch (error) {
    console.error('[link-preview] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
