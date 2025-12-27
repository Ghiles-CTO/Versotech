/**
 * GDPR Deletion Request API
 * POST /api/gdpr/deletion-request - Submit deletion request (creates approval)
 * GET /api/gdpr/deletion-request - Get user's pending requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger } from '@/lib/audit'
import { z } from 'zod'

const deletionRequestSchema = z.object({
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)'),
  confirm_understood: z.boolean().refine(v => v === true, 'You must confirm you understand the consequences')
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, email, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const validation = deletionRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 })
    }

    // Check for existing pending GDPR deletion request
    const { data: existingApproval } = await supabase
      .from('approvals')
      .select('id, status, created_at')
      .eq('entity_type', 'gdpr_deletion_request')
      .eq('entity_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existingApproval) {
      return NextResponse.json({
        error: 'You already have a pending deletion request',
        existing_request: {
          id: existingApproval.id,
          submitted_at: existingApproval.created_at
        }
      }, { status: 400 })
    }

    // Calculate SLA breach time (GDPR requires 30 day response)
    const slaBreachAt = new Date()
    slaBreachAt.setDate(slaBreachAt.getDate() + 30)

    // Create approval record for CEO review
    const { data: approval, error: approvalError } = await serviceSupabase
      .from('approvals')
      .insert({
        entity_type: 'gdpr_deletion_request',
        entity_id: user.id, // The user requesting deletion
        entity_metadata: {
          user_email: user.email,
          user_name: profile.display_name,
          user_role: profile.role,
          reason: validation.data.reason,
          submitted_at: new Date().toISOString(),
          gdpr_compliance: true
        },
        action: 'approve', // Requested action
        status: 'pending',
        priority: 'high', // GDPR requests are high priority
        requested_by: user.id,
        request_reason: validation.data.reason,
        sla_breach_at: slaBreachAt.toISOString(),
        notes: `GDPR Article 17 - Right to Erasure request from ${profile.display_name} (${user.email})`
      })
      .select()
      .single()

    if (approvalError) {
      console.error('Failed to create GDPR deletion approval:', approvalError)
      return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
    }

    // Create audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: 'gdpr_deletion_request_submitted',
      entity: 'gdpr_request',
      entity_id: approval.id,
      metadata: {
        reason: validation.data.reason,
        approval_id: approval.id
      }
    })

    // Create notification for admin/CEO
    await serviceSupabase
      .from('investor_notifications')
      .insert({
        user_id: user.id, // Notify the user of their request
        title: 'Deletion Request Submitted',
        message: 'Your account deletion request has been submitted and will be reviewed within 30 days.',
        type: 'gdpr_request',
        metadata: {
          approval_id: approval.id,
          request_type: 'deletion'
        }
      })

    return NextResponse.json({
      success: true,
      data: {
        request_id: approval.id,
        status: 'pending',
        sla_deadline: slaBreachAt.toISOString(),
        message: 'Your deletion request has been submitted and will be reviewed within 30 days as required by GDPR.'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('GDPR deletion request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all GDPR-related approvals for this user
    const { data: requests, error } = await supabase
      .from('approvals')
      .select('id, status, request_reason, rejection_reason, notes, created_at, resolved_at, sla_breach_at')
      .eq('entity_type', 'gdpr_deletion_request')
      .eq('entity_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching GDPR requests:', error)
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
    }

    return NextResponse.json({
      data: requests || [],
      has_pending: requests?.some(r => r.status === 'pending') || false
    })

  } catch (error) {
    console.error('Get GDPR requests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
