import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Allowed document types for KYC submissions
const ALLOWED_DOCUMENT_TYPES = [
  'questionnaire',
  'passport',
  'national_id',
  'drivers_license',
  'utility_bill',
  'bank_statement',
  'proof_of_address',
  'tax_return',
  'w9',
  'w8ben',
  'other'
] as const

// Investors can only set draft or pending status
const ALLOWED_INVESTOR_STATUSES = ['draft', 'pending'] as const

// Schema for PATCH body validation
const updateSubmissionSchema = z.object({
  document_type: z.enum(ALLOWED_DOCUMENT_TYPES).optional(),
  custom_label: z.string()
    .max(200, 'Custom label must be less than 200 characters')
    .regex(/^[^<>]*$/, 'Custom label cannot contain HTML tags')
    .optional()
    .nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  status: z.enum(ALLOWED_INVESTOR_STATUSES).optional(),
  expected_status: z.string().optional() // For optimistic locking
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorUsers } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorUsers || investorUsers.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorIds = investorUsers.map(iu => iu.investor_id)

    // Get the submission
    const { data: submission, error: submissionError } = await supabase
      .from('kyc_submissions')
      .select(`
        *,
        document:documents(id, name, file_key, file_size_bytes, mime_type, created_at),
        reviewer:reviewed_by(display_name, email)
      `)
      .eq('id', id)
      .in('investor_id', investorIds)
      .single()

    if (submissionError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, submission })

  } catch (error) {
    console.error('KYC submission GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorUsers } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorUsers || investorUsers.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorIds = investorUsers.map(iu => iu.investor_id)

    // Verify the submission belongs to this investor
    const { data: existingSubmission } = await supabase
      .from('kyc_submissions')
      .select('id, status, investor_id')
      .eq('id', id)
      .in('investor_id', investorIds)
      .single()

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Only allow updating draft, pending, or rejected submissions
    if (!['draft', 'pending', 'rejected'].includes(existingSubmission.status)) {
      return NextResponse.json(
        { error: 'Cannot update submission in this status' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = updateSubmissionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        error: validation.error.issues[0]?.message || 'Invalid input'
      }, { status: 400 })
    }

    const { document_type, custom_label, metadata, status, expected_status } = validation.data

    // Optimistic locking - if expected_status provided, check it matches
    if (expected_status && existingSubmission.status !== expected_status) {
      return NextResponse.json({
        error: 'Submission was modified by another request. Please refresh and try again.',
        code: 'CONFLICT'
      }, { status: 409 })
    }

    // Build update object with validated data
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (document_type !== undefined) updateData.document_type = document_type
    if (custom_label !== undefined) updateData.custom_label = custom_label
    if (metadata !== undefined) updateData.metadata = metadata
    if (status !== undefined) updateData.status = status

    // Update the submission with optimistic locking check
    let query = supabase
      .from('kyc_submissions')
      .update(updateData)
      .eq('id', id)

    // Add status check for optimistic locking
    if (expected_status) {
      query = query.eq('status', expected_status)
    }

    const { data: submission, error: updateError } = await query
      .select()
      .single()

    if (updateError) {
      console.error('Error updating submission:', updateError)
      return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
    }

    return NextResponse.json({ success: true, submission })

  } catch (error) {
    console.error('KYC submission PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorUsers } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorUsers || investorUsers.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorIds = investorUsers.map(iu => iu.investor_id)

    // Verify the submission belongs to this investor and is deletable
    const { data: existingSubmission } = await supabase
      .from('kyc_submissions')
      .select('id, status, investor_id')
      .eq('id', id)
      .in('investor_id', investorIds)
      .single()

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Only allow deleting draft submissions
    if (existingSubmission.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only delete draft submissions' },
        { status: 400 }
      )
    }

    // Delete the submission
    const { error: deleteError } = await supabase
      .from('kyc_submissions')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting submission:', deleteError)
      return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('KYC submission DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
