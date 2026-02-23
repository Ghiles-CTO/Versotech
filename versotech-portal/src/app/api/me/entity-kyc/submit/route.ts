import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { fetchMemberWithAutoLink } from '@/lib/kyc/member-linking'
import { checkAndUpdateEntityKYCStatus } from '@/lib/kyc/check-entity-kyc-status'
import { resolveKycSubmissionAssignee } from '@/lib/kyc/reviewer-assignment'

type FieldSpec = {
  key: string
  label: string
  candidates?: readonly string[]
}

const DEFAULT_ENTITY_SNAPSHOT_FIELDS: FieldSpec[] = [
  { key: 'display_name', label: 'Display Name' },
  { key: 'legal_name', label: 'Legal Name', candidates: ['legal_name', 'name', 'firm_name', 'display_name'] },
  { key: 'name', label: 'Name' },
  { key: 'firm_name', label: 'Firm Name' },
  { key: 'entity_type', label: 'Entity Type', candidates: ['type'] },
  { key: 'country_of_incorporation', label: 'Country of Incorporation' },
  { key: 'registration_number', label: 'Registration Number' },
  { key: 'tax_id', label: 'Tax ID' },
  { key: 'partner_type', label: 'Partner Type' },
  { key: 'cp_type', label: 'Commercial Partner Type' },
  { key: 'jurisdiction', label: 'Jurisdiction' },
  { key: 'regulator', label: 'Regulator' },
  { key: 'license_number', label: 'License Number' },
  { key: 'license_type', label: 'License Type' },
  { key: 'regulatory_status', label: 'Regulatory Status' },
  { key: 'regulatory_number', label: 'Regulatory Number' },
  { key: 'representative_name', label: 'Representative Name' },
  { key: 'representative_title', label: 'Representative Title' },
  { key: 'address_line_1', label: 'Address Line 1', candidates: ['address_line_1', 'street_address', 'registered_address_line_1', 'registered_address'] },
  { key: 'address_line_2', label: 'Address Line 2', candidates: ['address_line_2', 'registered_address_line_2'] },
  { key: 'city', label: 'City', candidates: ['city', 'registered_city'] },
  { key: 'state_province', label: 'State / Province', candidates: ['state_province', 'registered_state'] },
  { key: 'postal_code', label: 'Postal Code', candidates: ['postal_code', 'registered_postal_code'] },
  { key: 'country', label: 'Country', candidates: ['country', 'registered_country'] },
  { key: 'registered_address_line_1', label: 'Registered Address Line 1', candidates: ['registered_address_line_1', 'registered_address', 'address_line_1', 'street_address'] },
  { key: 'registered_address_line_2', label: 'Registered Address Line 2', candidates: ['registered_address_line_2', 'address_line_2'] },
  { key: 'registered_city', label: 'Registered City', candidates: ['registered_city', 'city'] },
  { key: 'registered_state', label: 'Registered State', candidates: ['registered_state', 'state_province'] },
  { key: 'registered_postal_code', label: 'Registered Postal Code', candidates: ['registered_postal_code', 'postal_code'] },
  { key: 'registered_country', label: 'Registered Country', candidates: ['registered_country', 'country'] },
  { key: 'email', label: 'Email', candidates: ['email', 'contact_email', 'primary_contact_email'] },
  { key: 'contact_email', label: 'Contact Email', candidates: ['contact_email', 'email', 'primary_contact_email'] },
  { key: 'phone', label: 'Phone', candidates: ['phone', 'contact_phone', 'primary_contact_phone'] },
  { key: 'contact_phone', label: 'Contact Phone', candidates: ['contact_phone', 'phone', 'primary_contact_phone'] },
  { key: 'phone_mobile', label: 'Mobile Phone' },
  { key: 'phone_office', label: 'Office Phone' },
  { key: 'website', label: 'Website' },
  { key: 'contact_name', label: 'Contact Name', candidates: ['contact_name', 'primary_contact_name'] },
  { key: 'primary_contact_name', label: 'Primary Contact Name', candidates: ['primary_contact_name', 'contact_name'] },
  { key: 'primary_contact_email', label: 'Primary Contact Email', candidates: ['primary_contact_email', 'contact_email', 'email'] },
  { key: 'primary_contact_phone', label: 'Primary Contact Phone', candidates: ['primary_contact_phone', 'contact_phone', 'phone'] },
]

const hasMeaningfulValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

const resolveFieldValue = (
  entity: Record<string, unknown>,
  field: FieldSpec
): unknown => {
  const candidates = field.candidates && field.candidates.length > 0 ? field.candidates : [field.key]
  for (const candidate of candidates) {
    const value = entity[candidate]
    if (hasMeaningfulValue(value)) {
      return typeof value === 'string' ? value.trim() : value
    }
  }
  return null
}

const normalizeComparableSnapshotValue = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? JSON.stringify(value) : null
  }
  return JSON.stringify(value)
}

const extractReviewSnapshot = (metadata: unknown): Record<string, unknown> | null => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const reviewSnapshot = (metadata as Record<string, unknown>).review_snapshot
  if (!reviewSnapshot || typeof reviewSnapshot !== 'object' || Array.isArray(reviewSnapshot)) return null
  return reviewSnapshot as Record<string, unknown>
}

const snapshotsMatch = (
  nextSnapshot: Record<string, unknown>,
  previousSnapshot: Record<string, unknown>
): boolean =>
  Object.keys(nextSnapshot).every(
    (key) =>
      normalizeComparableSnapshotValue(nextSnapshot[key]) ===
      normalizeComparableSnapshotValue(previousSnapshot[key])
  )

// Entity type configurations
const ENTITY_CONFIGS = {
  investor: {
    entityTable: 'investors',
    userTable: 'investor_users',
    memberTable: 'investor_members',
    memberEntityIdColumn: 'investor_id',
    userEntityIdColumn: 'investor_id',
    submissionEntityIdColumn: 'investor_id',
    requiredFields: [
      { key: 'legal_name', label: 'Legal Name', candidates: ['legal_name', 'display_name'] },
      { key: 'country_of_incorporation', label: 'Country of Incorporation', candidates: ['country_of_incorporation', 'country'] },
      { key: 'registered_address_line_1', label: 'Registered Address', candidates: ['registered_address_line_1', 'registered_address', 'address_line_1', 'street_address'] },
      { key: 'registered_country', label: 'Registered Country', candidates: ['registered_country', 'country'] },
    ],
  },
  partner: {
    entityTable: 'partners',
    userTable: 'partner_users',
    memberTable: 'partner_members',
    memberEntityIdColumn: 'partner_id',
    userEntityIdColumn: 'partner_id',
    submissionEntityIdColumn: 'partner_id',
    requiredFields: [
      { key: 'legal_name', label: 'Legal Name', candidates: ['legal_name', 'name'] },
      { key: 'country', label: 'Country' },
    ],
  },
  introducer: {
    entityTable: 'introducers',
    userTable: 'introducer_users',
    memberTable: 'introducer_members',
    memberEntityIdColumn: 'introducer_id',
    userEntityIdColumn: 'introducer_id',
    submissionEntityIdColumn: 'introducer_id',
    requiredFields: [
      { key: 'legal_name', label: 'Legal Name', candidates: ['legal_name', 'display_name', 'contact_name'] },
      { key: 'country', label: 'Country', candidates: ['country', 'country_of_incorporation'] },
    ],
  },
  lawyer: {
    entityTable: 'lawyers',
    userTable: 'lawyer_users',
    memberTable: 'lawyer_members',
    memberEntityIdColumn: 'lawyer_id',
    userEntityIdColumn: 'lawyer_id',
    submissionEntityIdColumn: 'lawyer_id',
    requiredFields: [
      { key: 'firm_name', label: 'Firm Name', candidates: ['firm_name', 'display_name'] },
      { key: 'country', label: 'Country', candidates: ['country', 'country_of_incorporation'] },
    ],
  },
  commercial_partner: {
    entityTable: 'commercial_partners',
    userTable: 'commercial_partner_users',
    memberTable: 'commercial_partner_members',
    memberEntityIdColumn: 'commercial_partner_id',
    userEntityIdColumn: 'commercial_partner_id',
    submissionEntityIdColumn: 'commercial_partner_id',
    requiredFields: [
      { key: 'name', label: 'Name', candidates: ['name', 'legal_name'] },
      { key: 'jurisdiction', label: 'Jurisdiction', candidates: ['jurisdiction', 'country'] },
    ],
  },
  arranger: {
    entityTable: 'arranger_entities',
    userTable: 'arranger_users',
    memberTable: 'arranger_members',
    memberEntityIdColumn: 'arranger_id',
    userEntityIdColumn: 'arranger_id',
    submissionEntityIdColumn: 'arranger_entity_id',
    requiredFields: [
      { key: 'legal_name', label: 'Legal Name' },
      { key: 'registration_number', label: 'Registration Number' },
      { key: 'regulator', label: 'Regulator' },
      { key: 'license_number', label: 'License Number' },
    ],
  },
} as const

type EntityType = keyof typeof ENTITY_CONFIGS

type SubmitEntityKycResult = {
  status: number
  payload: Record<string, unknown>
}

type ProfileRow = {
  email?: string | null
  full_name?: string | null
  display_name?: string | null
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
      .order('created_at', { ascending: true })
      .limit(1)
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
    const entityRecord = entity as Record<string, unknown>

    // Only allow for entity-type (not individual)
    if (entity.type === 'individual') {
      return {
        status: 400,
        payload: { error: 'Entity KYC submission is not applicable for individual entities' },
      }
    }

    // Ensure at least one active member exists so entity KYC cannot become silently stuck.
    const { data: existingActiveMember, error: activeMemberQueryError } = await serviceSupabase
      .from(config.memberTable)
      .select('id')
      .eq(config.memberEntityIdColumn, entityId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (activeMemberQueryError) {
      console.error('Error checking active members before entity KYC submit:', activeMemberQueryError)
      return {
        status: 500,
        payload: { error: 'Failed to validate entity members before KYC submission' },
      }
    }

    if (!existingActiveMember) {
      const { data: rawProfile } = await serviceSupabase
        .from('profiles')
        .select('email, full_name, display_name')
        .eq('id', userId)
        .maybeSingle()
      const profile = (rawProfile || null) as ProfileRow | null

      const defaultFullName =
        profile?.full_name ||
        profile?.display_name ||
        null

      const { error: autoMemberError } = await fetchMemberWithAutoLink({
        supabase: serviceSupabase,
        memberTable: config.memberTable,
        entityIdColumn: config.memberEntityIdColumn,
        entityId,
        userId,
        userEmail: profile?.email || null,
        defaultFullName,
        createIfMissing: true,
        select: 'id',
        context: `submitEntityKycForUser:${entityType}`,
      })

      if (autoMemberError) {
        console.error('Error auto-linking/creating member before entity KYC submit:', autoMemberError)
        return {
          status: 500,
          payload: { error: 'Failed to set up an active member for entity KYC' },
        }
      }

      const { data: activeMemberAfterSetup, error: activeMemberRecheckError } = await serviceSupabase
        .from(config.memberTable)
        .select('id')
        .eq(config.memberEntityIdColumn, entityId)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()

      if (activeMemberRecheckError) {
        console.error('Error rechecking active members before entity KYC submit:', activeMemberRecheckError)
        return {
          status: 500,
          payload: { error: 'Failed to validate entity members before KYC submission' },
        }
      }

      if (!activeMemberAfterSetup) {
        return {
          status: 400,
          payload: {
            error: 'At least one active member is required before submitting entity KYC',
          },
        }
      }
    }

    // Prevent duplicate submissions while an entity_info record already exists in-flight or approved.
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
      return { status: 400, payload: { error: 'Entity KYC information already submitted' } }
    }

    // Validate required fields before status transition.
    const missingFields = config.requiredFields.filter(
      (field) => !hasMeaningfulValue(resolveFieldValue(entityRecord, field))
    )

    if (missingFields.length > 0) {
      return {
        status: 400,
        payload: {
          error: 'Please complete all required entity fields before submitting',
          missing: missingFields.map((f) => f.label),
        },
      }
    }

    const requiredSnapshot = Object.fromEntries(
      config.requiredFields.map((field) => [field.key, resolveFieldValue(entityRecord, field)])
    )

    const detailedSnapshot = Object.fromEntries(
      DEFAULT_ENTITY_SNAPSHOT_FIELDS
        .map((field) => [field.key, resolveFieldValue(entityRecord, field)])
        .filter(([, value]) => value !== null)
    )

    const normalizedLegalName = resolveFieldValue(entityRecord, {
      key: 'legal_name',
      label: 'Legal Name',
      candidates: ['legal_name', 'name', 'firm_name', 'display_name'],
    })
    const normalizedCountry = resolveFieldValue(entityRecord, {
      key: 'country',
      label: 'Country',
      candidates: ['country', 'registered_country', 'country_of_incorporation', 'jurisdiction'],
    })

    const nextReviewSnapshot: Record<string, unknown> = {
      ...detailedSnapshot,
      ...requiredSnapshot,
      legal_name: normalizedLegalName,
      country: normalizedCountry,
    }

    const { data: latestEntityInfoSubmission, error: latestEntityInfoError } = await serviceSupabase
      .from('kyc_submissions')
      .select('metadata')
      .eq(config.submissionEntityIdColumn, entityId)
      .eq('document_type', 'entity_info')
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestEntityInfoError) {
      console.error('Error checking latest entity KYC submission snapshot:', latestEntityInfoError)
      return {
        status: 500,
        payload: { error: 'Failed to validate latest submitted entity information' },
      }
    }

    const latestReviewSnapshot = extractReviewSnapshot(latestEntityInfoSubmission?.metadata)
    if (latestReviewSnapshot && snapshotsMatch(nextReviewSnapshot, latestReviewSnapshot)) {
      return {
        status: 400,
        payload: { error: 'No entity information changes to submit' },
      }
    }

    // Idempotency gate: transition to submitted once; if already submitted we still allow
    // creating a fresh auto-approved entity_info snapshot (resubmission after edits).
    const previousEntityKycStatus = entity.kyc_status
    const shouldReserveTransition = entity.kyc_status !== 'submitted'
    const reserveUpdateData: Record<string, unknown> = {
      kyc_status: 'submitted',
      updated_at: new Date().toISOString(),
    }

    if (entityType === 'arranger') {
      reserveUpdateData.kyc_submitted_at = new Date().toISOString()
      reserveUpdateData.kyc_submitted_by = userId
    }

    if (shouldReserveTransition) {
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
        return { status: 400, payload: { error: 'Entity KYC information already submitted' } }
      }
    }

    const assignedTo = await resolveKycSubmissionAssignee(serviceSupabase)
    const nowIso = new Date().toISOString()

    const submissionData: Record<string, unknown> = {
      document_type: 'entity_info',
      status: 'approved',
      submitted_at: nowIso,
      reviewed_at: nowIso,
      reviewed_by: assignedTo,
      metadata: {
        submission_type: 'entity_kyc',
        auto_approved: true,
        entity_type: entityType,
        entity_name: entity.legal_name || entity.name || entity.firm_name || entity.display_name,
        submitted_by_user_id: userId,
        review_snapshot: nextReviewSnapshot,
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
          payload: { error: 'Entity KYC information already submitted' },
        }
      }

      console.error('Error creating KYC submission:', submissionError)

      // Best-effort rollback only when this request performed the submitted transition.
      if (shouldReserveTransition) {
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
      }

      return { status: 500, payload: { error: 'Failed to create KYC submission' } }
    }

    const { data: entityStatus } = await serviceSupabase
      .from(config.entityTable)
      .select('account_approval_status')
      .eq('id', entityId)
      .maybeSingle()

    const existingAccountStatus = entityStatus?.account_approval_status?.toLowerCase() ?? null
    const shouldUpdateAccountStatus =
      !existingAccountStatus || ['pending_onboarding', 'new', 'incomplete', 'rejected'].includes(existingAccountStatus)

    if (shouldUpdateAccountStatus) {
      await serviceSupabase
        .from(config.entityTable)
        .update({
          account_approval_status: 'incomplete',
          updated_at: new Date().toISOString(),
        })
        .eq('id', entityId)
    }

    await checkAndUpdateEntityKYCStatus(
      serviceSupabase as any,
      entityType as any,
      entityId
    )

    return {
      status: 200,
      payload: {
        success: true,
        submission_id: submission.id,
        message: 'Entity KYC submitted',
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
