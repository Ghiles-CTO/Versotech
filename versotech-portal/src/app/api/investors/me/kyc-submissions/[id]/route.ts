import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Only allow updating draft or pending submissions
    if (!['draft', 'pending', 'rejected'].includes(existingSubmission.status)) {
      return NextResponse.json(
        { error: 'Cannot update submission in this status' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { document_type, custom_label, metadata, status } = body

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (document_type !== undefined) updateData.document_type = document_type
    if (custom_label !== undefined) updateData.custom_label = custom_label
    if (metadata !== undefined) updateData.metadata = metadata
    if (status !== undefined) {
      // Investors can only set draft or pending status
      if (['draft', 'pending'].includes(status)) {
        updateData.status = status
      }
    }

    // Update the submission
    const { data: submission, error: updateError } = await supabase
      .from('kyc_submissions')
      .update(updateData)
      .eq('id', id)
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
