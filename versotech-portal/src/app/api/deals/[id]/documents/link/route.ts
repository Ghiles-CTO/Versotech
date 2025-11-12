import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export const dynamic = 'force-dynamic'

// POST - Add external link as document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params

  try {
    const clientSupabase = await createClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff access
    const { data: profile } = await clientSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role?.startsWith('staff_')
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const { external_link, file_name, folder, visible_to_investors } = body

    // Validate required fields
    if (!external_link || !file_name) {
      return NextResponse.json(
        { error: 'external_link and file_name are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(external_link)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Insert document record with external link
    const serviceSupabase = createServiceClient()
    const { data: document, error: insertError } = await serviceSupabase
      .from('deal_data_room_documents')
      .insert({
        deal_id: dealId,
        external_link: external_link,
        file_name: file_name,
        folder: folder || 'Misc',
        visible_to_investors: visible_to_investors || false,
        file_key: null, // No file uploaded for external links
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to add document link', details: insertError },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.DEALS,
      entity_id: dealId,
      metadata: {
        type: 'data_room_link_added',
        document_id: document.id,
        file_name: file_name,
        external_link: external_link,
        folder: folder
      }
    })

    return NextResponse.json({
      success: true,
      document
    })

  } catch (error) {
    console.error('Link add error:', error)
    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
