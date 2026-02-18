import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// Entity type configurations
const ENTITY_CONFIGS = {
  investor: {
    entityTable: 'investors',
    userTable: 'investor_users',
    userEntityIdColumn: 'investor_id',
    submissionEntityIdColumn: 'investor_id',
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
    userEntityIdColumn: 'partner_id',
    submissionEntityIdColumn: 'partner_id',
    requiredFields: [
      { field: 'legal_name', label: 'Legal Name' },
      { field: 'country', label: 'Country' },
    ],
  },
  introducer: {
    entityTable: 'introducers',
    userTable: 'introducer_users',
    userEntityIdColumn: 'introducer_id',
    submissionEntityIdColumn: 'introducer_id',
    requiredFields: [
      { field: 'legal_name', label: 'Legal Name' },
      { field: 'country', label: 'Country' },
    ],
  },
  lawyer: {
    entityTable: 'lawyers',
    userTable: 'lawyer_users',
    userEntityIdColumn: 'lawyer_id',
    submissionEntityIdColumn: 'lawyer_id',
    requiredFields: [
      { field: 'firm_name', label: 'Firm Name' },
      { field: 'country', label: 'Country' },
    ],
  },
  commercial_partner: {
    entityTable: 'commercial_partners',
    userTable: 'commercial_partner_users',
    userEntityIdColumn: 'commercial_partner_id',
    submissionEntityIdColumn: 'commercial_partner_id',
    requiredFields: [
      { field: 'name', label: 'Name' },
      { field: 'jurisdiction', label: 'Jurisdiction' },
    ],
  },
  arranger: {
    entityTable: 'arranger_entities',
    userTable: 'arranger_users',
    userEntityIdColumn: 'arranger_id',
    submissionEntityIdColumn: 'arranger_entity_id',
    requiredFields: [
      { field: 'legal_name', label: 'Legal Name' },
      { field: 'registration_number', label: 'Registration Number' },
      { field: 'regulator', label: 'Regulator' },
      { field: 'license_number', label: 'License Number' },
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
      .eq(config.userEntityIdColumn, entityId)
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

    // Prevent duplicate queue entries when an existing submission is still in review
    const { data: existingPendingSubmission, error: existingPendingError } = await serviceSupabase
      .from('kyc_submissions')
      .select('id')
      .eq(config.submissionEntityIdColumn, entityId)
      .eq('document_type', 'entity_info')
      .in('status', ['pending', 'under_review'])
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingPendingError) {
      console.error('Error checking existing pending entity KYC submission:', existingPendingError)
      return NextResponse.json(
        { error: 'Failed to validate existing KYC submission status' },
        { status: 500 }
      )
    }

    if (existingPendingSubmission) {
      return NextResponse.json(
        { error: 'Entity KYC already submitted for review' },
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
        entity_name: entity.legal_name || entity.name || entity.firm_name || entity.display_name,
        submitted_by_user_id: user.id,
        review_snapshot: {
          ...Object.fromEntries(
            config.requiredFields.map(({ field }) => [field, entity[field as keyof typeof entity]])
          ),
          legal_name: entity.legal_name || entity.name || entity.firm_name || entity.display_name || null,
          country: entity.country || entity.registered_country || entity.jurisdiction || null,
        }
      }
    }

    // Add entity-specific foreign key
    submissionData[config.submissionEntityIdColumn] = entityId

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
    const entityUpdateData: Record<string, unknown> = {
      kyc_status: 'submitted',
      updated_at: new Date().toISOString(),
    }

    if (entityType === 'arranger') {
      entityUpdateData.kyc_submitted_at = new Date().toISOString()
      entityUpdateData.kyc_submitted_by = user.id
    }

    const { error: updateError } = await serviceSupabase
      .from(config.entityTable)
      .update(entityUpdateData)
      .eq('id', entityId)

    if (updateError) {
      console.error('Error updating entity KYC status:', updateError)
      // Don't fail the request - submission was created
    }

    const { data: entityStatus } = await serviceSupabase
      .from(config.entityTable)
      .select('account_approval_status')
      .eq('id', entityId)
      .maybeSingle()

    const existingAccountStatus = entityStatus?.account_approval_status?.toLowerCase() ?? null
    const shouldUpdateAccountStatus = !existingAccountStatus ||
      ['pending_onboarding', 'new', 'incomplete'].includes(existingAccountStatus)

    if (shouldUpdateAccountStatus) {
      await serviceSupabase
        .from(config.entityTable)
        .update({
          account_approval_status: 'incomplete',
          updated_at: new Date().toISOString()
        })
        .eq('id', entityId)
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
