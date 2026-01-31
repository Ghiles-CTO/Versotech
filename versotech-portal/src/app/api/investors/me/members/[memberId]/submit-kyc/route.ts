import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/investors/me/members/[memberId]/submit-kyc
 *
 * Submits a member's personal KYC for review.
 * Creates a kyc_submissions record and updates member kyc_status to 'submitted'.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params

  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const serviceSupabase = createServiceClient()

    // Verify the member belongs to this user via linked_user_id
    const { data: member, error: memberError } = await serviceSupabase
      .from('investor_members')
      .select('id, investor_id, linked_user_id, full_name, kyc_status, first_name, last_name, date_of_birth, nationality, residential_street, residential_country, id_type, id_number')
      .eq('id', memberId)
      .eq('linked_user_id', user.id)
      .eq('is_active', true)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found or access denied' },
        { status: 404 }
      )
    }

    // Check if already submitted or approved
    if (member.kyc_status === 'submitted') {
      return NextResponse.json(
        { error: 'Personal KYC already submitted for review' },
        { status: 400 }
      )
    }

    if (member.kyc_status === 'approved') {
      return NextResponse.json(
        { error: 'Personal KYC already approved' },
        { status: 400 }
      )
    }

    // Validate required fields are complete
    const requiredFields = [
      { field: 'first_name', label: 'First Name' },
      { field: 'last_name', label: 'Last Name' },
      { field: 'date_of_birth', label: 'Date of Birth' },
      { field: 'nationality', label: 'Nationality' },
      { field: 'residential_street', label: 'Residential Address' },
      { field: 'residential_country', label: 'Country of Residence' },
      { field: 'id_type', label: 'ID Document Type' },
      { field: 'id_number', label: 'ID Document Number' },
    ]

    const missingFields = requiredFields.filter(
      ({ field }) => !member[field as keyof typeof member]
    )

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Please complete all required fields before submitting',
          missing: missingFields.map(f => f.label)
        },
        { status: 400 }
      )
    }

    // Create KYC submission record
    const { data: submission, error: submissionError } = await serviceSupabase
      .from('kyc_submissions')
      .insert({
        investor_id: member.investor_id,
        investor_member_id: member.id,
        document_type: 'personal_info',
        status: 'pending',
        submitted_at: new Date().toISOString(),
        metadata: {
          submission_type: 'personal_kyc',
          member_name: member.full_name || `${member.first_name} ${member.last_name}`,
          submitted_by_user_id: user.id,
        }
      })
      .select('id')
      .single()

    if (submissionError) {
      console.error('Error creating KYC submission:', submissionError)
      return NextResponse.json(
        { error: 'Failed to create KYC submission' },
        { status: 500 }
      )
    }

    // Update member kyc_status to 'submitted'
    const { error: updateError } = await serviceSupabase
      .from('investor_members')
      .update({
        kyc_status: 'submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)

    if (updateError) {
      console.error('Error updating member KYC status:', updateError)
      // Don't fail the request - submission was created
    }

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      message: 'Personal KYC submitted for review'
    })

  } catch (error) {
    console.error('Error in submit-kyc:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
