import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// Entity type configurations
const ENTITY_CONFIGS = {
  investor: {
    entityTable: 'investors',
    userTable: 'investor_users',
    entityIdColumn: 'investor_id',
    requiredFields: [
      { field: 'legal_name', label: 'Legal Name' },
      { field: 'country_of_incorporation', label: 'Country of Incorporation' },
      { field: 'registered_address_line_1', label: 'Registered Address' },
      { field: 'registered_country', label: 'Registered Country' },
    ],
  },
  partner: {
    entityTable: 'partners',
    userTable: 'partner_users',
    entityIdColumn: 'partner_id',
    requiredFields: [
      { field: 'legal_name', label: 'Legal Name' },
      { field: 'country', label: 'Country' },
    ],
  },
  introducer: {
    entityTable: 'introducers',
    userTable: 'introducer_users',
    entityIdColumn: 'introducer_id',
    requiredFields: [
      { field: 'legal_name', label: 'Legal Name' },
      { field: 'country', label: 'Country' },
    ],
  },
  lawyer: {
    entityTable: 'lawyers',
    userTable: 'lawyer_users',
    entityIdColumn: 'lawyer_id',
    requiredFields: [
      { field: 'legal_name', label: 'Legal Name' },
      { field: 'jurisdiction', label: 'Jurisdiction' },
    ],
  },
  commercial_partner: {
    entityTable: 'commercial_partners',
    userTable: 'commercial_partner_users',
    entityIdColumn: 'commercial_partner_id',
    requiredFields: [
      { field: 'name', label: 'Name' },
      { field: 'jurisdiction', label: 'Jurisdiction' },
    ],
  },
  arranger: {
    entityTable: 'arranger_entities',
    userTable: 'arranger_users',
    entityIdColumn: 'arranger_id',
    requiredFields: [
      { field: 'legal_name', label: 'Legal Name' },
    ],
  },
} as const

type EntityType = keyof typeof ENTITY_CONFIGS

/**
 * POST /api/me/entity-kyc/submit
 *
 * Generic endpoint to submit entity KYC for any entity type.
 * Creates a kyc_submissions record and updates entity kyc_status to 'submitted'.
 */
export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json()
    const { entityType, entityId } = body

    // Validate entity type
    if (!entityType || !Object.keys(ENTITY_CONFIGS).includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entity type. Must be one of: ' + Object.keys(ENTITY_CONFIGS).join(', ') },
        { status: 400 }
      )
    }

    if (!entityId) {
      return NextResponse.json(
        { error: 'Entity ID is required' },
        { status: 400 }
      )
    }

    const config = ENTITY_CONFIGS[entityType as EntityType]
    const serviceSupabase = createServiceClient()

    // Verify user has access to this entity and check permissions
    const { data: entityUser, error: entityUserError } = await serviceSupabase
      .from(config.userTable)
      .select('is_primary, role')
      .eq('user_id', user.id)
      .eq(config.entityIdColumn, entityId)
      .maybeSingle()

    if (entityUserError || !entityUser) {
      return NextResponse.json(
        { error: 'Access denied or entity not found' },
        { status: 403 }
      )
    }

    // Only admins or primary contacts can submit entity KYC
    if (!entityUser.is_primary && entityUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only primary contacts or admins can submit entity KYC' },
        { status: 403 }
      )
    }

    // Fetch entity details
    const { data: entity, error: entityError } = await serviceSupabase
      .from(config.entityTable)
      .select('*')
      .eq('id', entityId)
      .single()

    if (entityError || !entity) {
      return NextResponse.json(
        { error: 'Entity not found' },
        { status: 404 }
      )
    }

    // Only allow for entity-type (not individual)
    if (entity.type === 'individual') {
      return NextResponse.json(
        { error: 'Entity KYC submission is not applicable for individual entities' },
        { status: 400 }
      )
    }

    // Check if already submitted or approved
    if (entity.kyc_status === 'submitted') {
      return NextResponse.json(
        { error: 'Entity KYC already submitted for review' },
        { status: 400 }
      )
    }

    if (entity.kyc_status === 'approved') {
      return NextResponse.json(
        { error: 'Entity KYC already approved' },
        { status: 400 }
      )
    }

    // Validate required fields
    const missingFields = config.requiredFields.filter(
      ({ field }) => !entity[field as keyof typeof entity]
    )

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Please complete all required entity fields before submitting',
          missing: missingFields.map(f => f.label)
        },
        { status: 400 }
      )
    }

    // Build submission data
    const submissionData: Record<string, unknown> = {
      document_type: 'entity_info',
      status: 'pending',
      submitted_at: new Date().toISOString(),
      metadata: {
        submission_type: 'entity_kyc',
        entity_type: entityType,
        entity_name: entity.legal_name || entity.name,
        submitted_by_user_id: user.id,
      }
    }

    // Add entity-specific foreign key
    submissionData[config.entityIdColumn] = entityId

    // Create KYC submission record
    const { data: submission, error: submissionError } = await serviceSupabase
      .from('kyc_submissions')
      .insert(submissionData)
      .select('id')
      .single()

    if (submissionError) {
      console.error('Error creating KYC submission:', submissionError)
      return NextResponse.json(
        { error: 'Failed to create KYC submission' },
        { status: 500 }
      )
    }

    // Update entity kyc_status to 'submitted'
    const { error: updateError } = await serviceSupabase
      .from(config.entityTable)
      .update({
        kyc_status: 'submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', entityId)

    if (updateError) {
      console.error('Error updating entity KYC status:', updateError)
      // Don't fail the request - submission was created
    }

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      message: 'Entity KYC submitted for review'
    })

  } catch (error) {
    console.error('Error in entity-kyc submit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
