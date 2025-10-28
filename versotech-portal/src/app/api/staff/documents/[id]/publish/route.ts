import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateStaffForDocuments } from '@/lib/document-auth'
import { z } from 'zod'

// Validation schema
const publishSchema = z.object({
  schedule: z.object({
    publish_at: z.string().datetime().optional(),
    unpublish_at: z.string().datetime().optional()
  }).optional(),
  immediate: z.boolean().default(false)
})

// POST /api/staff/documents/:id/publish - Publish document (immediately or scheduled)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error
    
    const { serviceSupabase, userId } = auth

    // Validate userId is a UUID (for demo accounts compatibility)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const createdBy = uuidRegex.test(userId) ? userId : null

    // Parse and validate request body
    const body = await request.json()
    const validation = publishSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (validation.error as any).errors },
        { status: 400 }
      )
    }

    const { schedule, immediate } = validation.data

    // Get document
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .select('name, status, is_published')
      .eq('id', id)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if document is already published
    if (document.is_published) {
      return NextResponse.json(
        { error: 'Document is already published' },
        { status: 400 }
      )
    }

    // Check if document is approved (required for publishing)
    if (document.status !== 'approved' && !immediate) {
      return NextResponse.json(
        { error: 'Only approved documents can be published' },
        { status: 400 }
      )
    }

    let publishResponse: any = {}

    if (immediate || !schedule?.publish_at) {
      // Publish immediately
      const { error: updateError } = await serviceSupabase
        .from('documents')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
          status: 'published'
        })
        .eq('id', id)

      if (updateError) {
        console.error('Document publish error:', updateError)
        return NextResponse.json(
          { error: 'Failed to publish document' },
          { status: 500 }
        )
      }

      publishResponse = {
        published: true,
        published_at: new Date().toISOString()
      }

      // Audit log
      await auditLogger.log({
        actor_user_id: userId,
        action: AuditActions.UPDATE,
        entity: AuditEntities.DOCUMENTS,
        entity_id: id,
        metadata: {
          action_type: 'publish_immediate',
          document_name: document.name
        }
      })

    } else {
      // Schedule publishing
      const publishAt = new Date(schedule.publish_at)
      const unpublishAt = schedule.unpublish_at ? new Date(schedule.unpublish_at) : null

      // Validate dates
      if (publishAt <= new Date()) {
        return NextResponse.json(
          { error: 'Publish date must be in the future' },
          { status: 400 }
        )
      }

      if (unpublishAt && unpublishAt <= publishAt) {
        return NextResponse.json(
          { error: 'Unpublish date must be after publish date' },
          { status: 400 }
        )
      }

      // Create schedule record
      const { data: scheduleRecord, error: scheduleError } = await serviceSupabase
        .from('document_publishing_schedule')
        .insert({
          document_id: id,
          publish_at: publishAt.toISOString(),
          unpublish_at: unpublishAt?.toISOString() || null,
          created_by: createdBy
        })
        .select()
        .single()

      if (scheduleError) {
        console.error('Schedule creation error:', scheduleError)
        return NextResponse.json(
          { error: 'Failed to schedule publishing' },
          { status: 500 }
        )
      }

      publishResponse = {
        scheduled: true,
        schedule: scheduleRecord
      }

      // Audit log
      await auditLogger.log({
        actor_user_id: userId,
        action: AuditActions.UPDATE,
        entity: AuditEntities.DOCUMENTS,
        entity_id: id,
        metadata: {
          action_type: 'publish_scheduled',
          document_name: document.name,
          publish_at: publishAt.toISOString(),
          unpublish_at: unpublishAt?.toISOString()
        }
      })
    }

    return NextResponse.json(publishResponse)

  } catch (error) {
    console.error('Publish POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/staff/documents/:id/publish - Unpublish document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Authenticate
    const auth = await authenticateStaffForDocuments()
    if (auth.error) return auth.error
    
    const { serviceSupabase, userId } = auth

    // Get document
    const { data: document, error: docError } = await serviceSupabase
      .from('documents')
      .select('name, is_published')
      .eq('id', id)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if document is published
    if (!document.is_published) {
      return NextResponse.json(
        { error: 'Document is not published' },
        { status: 400 }
      )
    }

    // Unpublish document
    const { error: updateError } = await serviceSupabase
      .from('documents')
      .update({
        is_published: false,
        status: 'archived'
      })
      .eq('id', id)

    if (updateError) {
      console.error('Document unpublish error:', updateError)
      return NextResponse.json(
        { error: 'Failed to unpublish document' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLogger.log({
      actor_user_id: userId,
      action: AuditActions.UPDATE,
      entity: AuditEntities.DOCUMENTS,
      entity_id: id,
      metadata: {
        action_type: 'unpublish',
        document_name: document.name
      }
    })

    return NextResponse.json({ unpublished: true })

  } catch (error) {
    console.error('Unpublish DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

