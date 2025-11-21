import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSuggestedDocumentTypes, getDocumentTypeLabel } from '@/constants/kyc-document-types'

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

    // Get ALL KYC submissions (investor KYC only, not entity KYC)
    const { data: submissions, error: submissionsError } = await supabase
      .from('kyc_submissions')
      .select(`
        *,
        document:documents(id, name, file_key, file_size_bytes, mime_type, created_at),
        reviewer:reviewed_by(display_name, email)
      `)
      .in('investor_id', investorIds)
      .is('counterparty_entity_id', null) // Only investor KYC, not entity KYC
      .order('created_at', { ascending: false })

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
      return NextResponse.json(
        { error: 'Failed to fetch KYC submissions' },
        { status: 500 }
      )
    }

    // Get investor type to provide relevant suggestions
    const { data: investors } = await supabase
      .from('investors')
      .select('id, type')
      .in('id', investorIds)

    const hasIndividual = investors?.some(i => i.type === 'individual')
    const hasCorporate = investors?.some(i => i.type === 'corporate')

    // Get suggested documents based on investor type (NOT requirements, just suggestions)
    let suggestedCategory: 'individual' | 'entity' | 'both' = 'both'
    if (hasIndividual && !hasCorporate) {
      suggestedCategory = 'individual'
    } else if (hasCorporate && !hasIndividual) {
      suggestedCategory = 'entity'
    }

    const suggestedDocuments = getSuggestedDocumentTypes(suggestedCategory)

    // Group submissions by document type
    const groupedSubmissions: Record<string, any[]> = {}
    submissions?.forEach(sub => {
      const key = sub.document_type
      if (!groupedSubmissions[key]) {
        groupedSubmissions[key] = []
      }
      groupedSubmissions[key].push(sub)
    })

    // Format all submissions with proper labels
    const formattedSubmissions = (submissions || []).map(sub => ({
      ...sub,
      display_label: getDocumentTypeLabel(sub.document_type, sub.custom_label)
    }))

    return NextResponse.json({
      success: true,
      submissions: formattedSubmissions,
      grouped_submissions: groupedSubmissions,
      suggested_documents: suggestedDocuments,
      note: 'Suggested documents are recommendations. You can upload any document type with a custom label.'
    })

  } catch (error) {
    console.error('KYC submissions GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor ID
    const { data: investorUsers } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .single()

    if (!investorUsers) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const body = await request.json()
    const { document_type, custom_label, metadata, status } = body

    // Insert submission
    const { data, error } = await supabase
      .from('kyc_submissions')
      .insert({
        investor_id: investorUsers.investor_id,
        document_type,
        custom_label,
        metadata,
        status: status || 'pending',
        version: 1
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating submission:', error)
      return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
    }

    return NextResponse.json({ success: true, submission: data })

  } catch (error) {
    console.error('KYC submissions POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
