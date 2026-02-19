import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
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

type SubmitEntityKycResult = {
  status: number
  payload: Record<string, unknown>
}

export async function submitEntityKycForUser(params: {
  serviceSupabase: SupabaseClient
  userId: string
  entityType: string
  entityId: string
}): Promise<SubmitEntityKycResult> {
  const { serviceSupabase, userId, entityType, entityId } = params

  try {
    if (!entityType || !Object.keys(ENTITY_CONFIGS).includes(entityType)) {
      return {
        status: 400,
        payload: { error: `Invalid entity type. Must be one of: ${Object.keys(ENTITY_CONFIGS).join(', ')}` },
      }
    }

    if (!entityId) {
      return { status: 400, payload: { error: 'Entity ID is required' } }
    }

    const config = ENTITY_CONFIGS[entityType as EntityType]

    // Verify user has access to this entity and check permissions
    const { data: entityUser, error: entityUserError } = await serviceSupabase
      .from(config.userTable)
      .select('is_primary, role')
      .eq('user_id', userId)
      .eq(config.userEntityIdColumn, entityId)
      .maybeSingle()

    if (entityUserError || !entityUser) {
      return { status: 403, payload: { error: 'Access denied or entity not found' } }
    }

    // Only admins or primary contacts can submit entity KYC
    if (!entityUser.is_primary && entityUser.role !== 'admin') {
      return {
        status: 403,
        payload: { error: 'Only primary contacts or admins can submit entity KYC' },
      }
    }

    // Fetch entity details
    const { data: entity, error: entityError } = await serviceSupabase
      .from(config.entityTable)
      .select('*')
      .eq('id', entityId)
      .single()

    if (entityError || !entity) {
      return { status: 404, payload: { error: 'Entity not found' } }
    }

    // Only allow for entity-type (not individual)
    if (entity.type === 'individual') {
      return {
        status: 400,
        payload: { error: 'Entity KYC submission is not applicable for individual entities' },
      }
    }

    // Check if already submitted or approved
    if (entity.kyc_status === 'submitted') {
      return { status: 400, payload: { error: 'Entity KYC already submitted for review' } }
    }

    if (entity.kyc_status === 'approved') {
      return { status: 400, payload: { error: 'Entity KYC already approved' } }
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
      return {
        status: 500,
        payload: { error: 'Failed to validate existing KYC submission status' },
      }
    }

    if (existingPendingSubmission) {
      return { status: 400, payload: { error: 'Entity KYC already submitted for review' } }
    }

    // Validate required fields before status transition.
    const missingFields = config.requiredFields.filter(
      ({ field }) => !entity[field as keyof typeof entity]
    )

    if (missingFields.length > 0) {
      return {
        status: 400,
        payload: {
          error: 'Please complete all required entity fields before submitting',
          missing: missingFields.map(f => f.label),
        },
      }
    }

    // Idempotency gate: only one request can transition this entity to submitted.
    const previousEntityKycStatus = entity.kyc_status
    const reserveUpdateData: Record<string, unknown> = {
      kyc_status: 'submitted',
      updated_at: new Date().toISOString(),
    }

    if (entityType === 'arranger') {
      reserveUpdateData.kyc_submitted_at = new Date().toISOString()
      reserveUpdateData.kyc_submitted_by = userId
    }

    const { data: reserveTransition, error: reserveTransitionError } = await serviceSupabase
      .from(config.entityTable)
      .update(reserveUpdateData)
      .eq('id', entityId)
      .neq('kyc_status', 'submitted')
      .select('id')
      .maybeSingle()

    if (reserveTransitionError) {
      console.error('Error transitioning entity to submitted:', reserveTransitionError)
      return {
        status: 500,
        payload: { error: 'Failed to reserve entity KYC submission' },
      }
    }

    if (!reserveTransition) {
      return { status: 400, payload: { error: 'Entity KYC already submitted for review' } }
    }

    const submissionData: Record<string, unknown> = {
      document_type: 'entity_info',
      status: 'pending',
      submitted_at: new Date().toISOString(),
      metadata: {
        submission_type: 'entity_kyc',
        entity_type: entityType,
        entity_name: entity.legal_name || entity.name || entity.firm_name || entity.display_name,
        submitted_by_user_id: userId,
        review_snapshot: {
          ...Object.fromEntries(
            config.requiredFields.map(({ field }) => [field, entity[field as keyof typeof entity]])
          ),
          legal_name: entity.legal_name || entity.name || entity.firm_name || entity.display_name || null,
          country: entity.country || entity.registered_country || entity.jurisdiction || null,
        },
      },
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
      const isUniqueViolation = (submissionError as { code?: string }).code === '23505'
      if (isUniqueViolation) {
        return {
          status: 400,
          payload: { error: 'Entity KYC already submitted for review' },
        }
      }

      console.error('Error creating KYC submission:', submissionError)

      // Best-effort rollback for non-idempotent failures.
      const rollbackData: Record<string, unknown> = {
        kyc_status: previousEntityKycStatus || 'pending',
        updated_at: new Date().toISOString(),
      }

      if (entityType === 'arranger') {
        rollbackData.kyc_submitted_at = entity.kyc_submitted_at || null
        rollbackData.kyc_submitted_by = entity.kyc_submitted_by || null
      }

      await serviceSupabase
        .from(config.entityTable)
        .update(rollbackData)
        .eq('id', entityId)
        .eq('kyc_status', 'submitted')

      return { status: 500, payload: { error: 'Failed to create KYC submission' } }
    }

    const { data: entityStatus } = await serviceSupabase
      .from(config.entityTable)
      .select('account_approval_status')
      .eq('id', entityId)
      .maybeSingle()

    const existingAccountStatus = entityStatus?.account_approval_status?.toLowerCase() ?? null
    const shouldUpdateAccountStatus =
      !existingAccountStatus || ['pending_onboarding', 'new', 'incomplete'].includes(existingAccountStatus)

    if (shouldUpdateAccountStatus) {
      await serviceSupabase
        .from(config.entityTable)
        .update({
          account_approval_status: 'incomplete',
          updated_at: new Date().toISOString(),
        })
        .eq('id', entityId)
    }

    return {
      status: 200,
      payload: {
        success: true,
        submission_id: submission.id,
        message: 'Entity KYC submitted for review',
      },
    }
  } catch (error) {
    console.error('Error in entity-kyc submit:', error)
    return { status: 500, payload: { error: 'Internal server error' } }
  }
}

/**
 * POST /api/me/entity-kyc/submit
 *
 * Generic endpoint to submit entity KYC for any entity type.
 */
export async function POST(request: Request) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { entityType, entityId } = body

    const serviceSupabase = createServiceClient()
    const result = await submitEntityKycForUser({
      serviceSupabase,
      userId: user.id,
      entityType,
      entityId,
    })

    return NextResponse.json(result.payload, { status: result.status })
  } catch (error) {
    console.error('Error in entity-kyc submit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
