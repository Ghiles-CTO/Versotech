import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSuggestedDocumentTypes, getDocumentTypeLabel } from '@/constants/kyc-document-types'
import { z } from 'zod'

// Allowed document types for KYC submissions
const ALLOWED_DOCUMENT_TYPES = [
  // Entity documents
  'nda_ndnc',
  'incorporation_certificate',
  'memo_articles',
  'register_members',
  'register_directors',
  'bank_confirmation',
  // Individual / member documents
  'passport_id',
  'utility_bill',
  // Other
  'other'
] as const

// Investors can only set draft or pending status - not approved/rejected
const ALLOWED_INVESTOR_STATUSES = ['draft', 'pending'] as const

// Schema for POST body validation
const createSubmissionSchema = z.object({
  document_type: z.enum(ALLOWED_DOCUMENT_TYPES, { message: 'Invalid document type' }),
  custom_label: z.string()
    .max(200, 'Custom label must be less than 200 characters')
    .regex(/^[^<>]*$/, 'Custom label cannot contain HTML tags')
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(ALLOWED_INVESTOR_STATUSES).optional().default('pending'),
  investor_member_id: z.string().uuid().optional()
})

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
        reviewer:reviewed_by(display_name, email),
        investor_member:investor_member_id(id, full_name, role)
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
    const hasCorporate = investors?.some(i => i.type === 'corporate' || i.type === 'entity' || i.type === 'institution')
    const investorType = investors?.[0]?.type || 'individual'
    const isEntityInvestor = ['corporate', 'entity', 'institution'].includes(investorType)

    // Get investor members if entity-type investor
    let investorMembers: any[] = []
    if (isEntityInvestor && investorIds.length > 0) {
      const { data: members } = await supabase
        .from('investor_members')
        .select('id, full_name, role')
        .eq('investor_id', investorIds[0])
        .eq('is_active', true)
        .order('full_name')

      investorMembers = members || []
    }

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
      investor_type: investorType,
      is_entity_investor: isEntityInvestor,
      investor_members: investorMembers,
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

    // Validate input to prevent security issues
    const validation = createSubmissionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        error: validation.error.issues[0]?.message || 'Invalid input'
      }, { status: 400 })
    }

    const { document_type, custom_label, metadata, status, investor_member_id } = validation.data

    // Insert submission with validated data
    const { data, error } = await supabase
      .from('kyc_submissions')
      .insert({
        investor_id: investorUsers.investor_id,
        document_type,
        custom_label: custom_label || null,
        metadata: metadata || null,
        status,
        investor_member_id: investor_member_id || null,
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
