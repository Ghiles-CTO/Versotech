import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'investor') {
      return NextResponse.json(
        { error: 'Investor access required' },
        { status: 403 }
      )
    }

    // Get investor IDs for this user
    const { data: investorUsers } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorUsers || investorUsers.length === 0) {
      return NextResponse.json(
        { error: 'No investor profile found' },
        { status: 404 }
      )
    }

    const investorIds = investorUsers.map(iu => iu.investor_id)

    // Get KYC submissions with document details
    const { data: submissions, error: submissionsError } = await supabase
      .from('kyc_submissions')
      .select(`
        *,
        document:documents(id, name, file_key, file_size_bytes, mime_type, created_at),
        reviewer:reviewed_by(display_name, email)
      `)
      .in('investor_id', investorIds)
      .order('created_at', { ascending: false })

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
      return NextResponse.json(
        { error: 'Failed to fetch KYC submissions' },
        { status: 500 }
      )
    }

    // Get required documents based on investor type
    const { data: investors } = await supabase
      .from('investors')
      .select('id, type')
      .in('id', investorIds)

    const hasIndividual = investors?.some(i => i.type === 'individual')
    const hasCorporate = investors?.some(i => i.type === 'corporate')

    // Determine required documents based on investor types
    const documentRequirements = []

    // Individual investor documents (required for individual investors)
    if (hasIndividual) {
      documentRequirements.push(
        { type: 'government_id', label: 'Government-Issued ID', description: 'Passport or driver\'s license (required for individual investors)', required: true },
        { type: 'proof_of_address', label: 'Proof of Address', description: 'Utility bill or bank statement within 3 months (required for individual investors)', required: true },
        { type: 'accreditation_letter', label: 'Accreditation Letter', description: 'CPA letter or tax returns (required for individual investors)', required: true }
      )
    }

    // Corporate investor documents (required for corporate investors)
    if (hasCorporate) {
      documentRequirements.push(
        { type: 'entity_formation_docs', label: 'Entity Formation Documents', description: 'Certificate of incorporation (required for corporate investors)', required: true },
        { type: 'beneficial_ownership', label: 'Beneficial Ownership', description: 'Information on owners with >25% stake (required for corporate investors)', required: true }
      )
    }

    // If they have BOTH types, show all docs but mark appropriately
    if (hasIndividual && hasCorporate) {
      // All docs are shown, update descriptions to clarify
      documentRequirements.forEach(doc => {
        if (['government_id', 'proof_of_address', 'accreditation_letter'].includes(doc.type)) {
          doc.description = doc.description.replace('required for individual investors', 'required for individual investor profiles')
          doc.required = true
        } else {
          doc.description = doc.description.replace('required for corporate investors', 'required for corporate investor profiles')
          doc.required = true
        }
      })
    }

    // Map submissions to required documents
    const documentsWithStatus = documentRequirements.map(req => {
      const submission = submissions?.find(s => s.document_type === req.type)
      return {
        ...req,
        submission: submission || null
      }
    })

    return NextResponse.json({
      success: true,
      documents: documentsWithStatus,
      submissions: submissions || []
    })

  } catch (error) {
    console.error('KYC submissions GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
