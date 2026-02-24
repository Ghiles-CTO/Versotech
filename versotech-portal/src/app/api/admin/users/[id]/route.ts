import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/api-auth'
import { auditLogger, AuditEntities } from '@/lib/audit'
import { getIdExpiryWarning } from '@/lib/utils/date-helpers'
import { z } from 'zod'
import type { EntityAssociation, UserKyc, UserRow, FullUserKyc } from '../route'

export interface SingleUserResponse {
  success: boolean
  data?: UserRow
  fullKyc?: FullUserKyc | null
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SingleUserResponse>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check if user is super admin OR CEO
    const hasAccess = await isSuperAdmin(supabase, user.id)
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id: userId } = await params

    // Fetch the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, email, role, title, phone, office_location, avatar_url, created_at, last_login_at, password_set, is_super_admin, signature_specimen_url, deleted_at, bio')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('[admin/users/[id]] Profile error:', profileError)
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Fetch entity associations in parallel
    const [
      investorUsersResult,
      partnerUsersResult,
      lawyerUsersResult,
      commercialPartnerUsersResult,
      introducerUsersResult,
      arrangerUsersResult
    ] = await Promise.all([
      supabase.from('investor_users').select('user_id, investor_id, role, is_primary, can_sign, investors:investors!investor_users_investor_id_fkey(id, legal_name, account_approval_status)').eq('user_id', userId),
      supabase.from('partner_users').select('user_id, partner_id, role, is_primary, can_sign, partners:partners!partner_users_partner_fk(id, name, legal_name, account_approval_status)').eq('user_id', userId),
      supabase.from('lawyer_users').select('user_id, lawyer_id, role, is_primary, can_sign, lawyers:lawyers!lawyer_users_lawyer_fk(id, firm_name, display_name, account_approval_status)').eq('user_id', userId),
      supabase.from('commercial_partner_users').select('user_id, commercial_partner_id, role, is_primary, can_sign, commercial_partners:commercial_partners!commercial_partner_users_cp_fk(id, name, legal_name, account_approval_status)').eq('user_id', userId),
      supabase.from('introducer_users').select('user_id, introducer_id, role, is_primary, can_sign, introducers:introducers!introducer_users_introducer_fk(id, legal_name, account_approval_status)').eq('user_id', userId),
      supabase.from('arranger_users').select('user_id, arranger_id, role, is_primary, can_sign, arranger_entities:arranger_entities!arranger_users_arranger_fk(id, legal_name, account_approval_status)').eq('user_id', userId)
    ])

    // Build entity associations
    const entities: EntityAssociation[] = []

    // Helper to safely get entity data
    const getEntity = (data: unknown) => Array.isArray(data) ? data[0] : data

    // Process investor associations
    if (investorUsersResult.data) {
      for (const iu of investorUsersResult.data) {
        const entity = getEntity(iu.investors) as { id: string; legal_name: string | null; account_approval_status: string | null } | null
        if (!entity) continue
        entities.push({
          id: entity.id,
          name: entity.legal_name || 'Unnamed Investor',
          type: 'investor',
          role: iu.role || 'member',
          isPrimary: iu.is_primary || false,
          canSign: iu.can_sign || false,
          memberRole: null,
          approvalStatus: entity.account_approval_status
        })
      }
    }

    // Process partner associations
    if (partnerUsersResult.data) {
      for (const pu of partnerUsersResult.data) {
        const entity = getEntity(pu.partners) as { id: string; name: string | null; legal_name: string | null; account_approval_status: string | null } | null
        if (!entity) continue
        entities.push({
          id: entity.id,
          name: entity.name || entity.legal_name || 'Unnamed Partner',
          type: 'partner',
          role: pu.role || 'member',
          isPrimary: pu.is_primary || false,
          canSign: pu.can_sign || false,
          memberRole: null,
          approvalStatus: entity.account_approval_status
        })
      }
    }

    // Process lawyer associations
    if (lawyerUsersResult.data) {
      for (const lu of lawyerUsersResult.data) {
        const entity = getEntity(lu.lawyers) as { id: string; firm_name: string | null; display_name: string | null; account_approval_status: string | null } | null
        if (!entity) continue
        entities.push({
          id: entity.id,
          name: entity.firm_name || entity.display_name || 'Unnamed Law Firm',
          type: 'lawyer',
          role: lu.role || 'member',
          isPrimary: lu.is_primary || false,
          canSign: lu.can_sign || false,
          memberRole: null,
          approvalStatus: entity.account_approval_status
        })
      }
    }

    // Process commercial partner associations
    if (commercialPartnerUsersResult.data) {
      for (const cpu of commercialPartnerUsersResult.data) {
        const entity = getEntity(cpu.commercial_partners) as { id: string; name: string | null; legal_name: string | null; account_approval_status: string | null } | null
        if (!entity) continue
        entities.push({
          id: entity.id,
          name: entity.name || entity.legal_name || 'Unnamed Commercial Partner',
          type: 'commercial_partner',
          role: cpu.role || 'member',
          isPrimary: cpu.is_primary || false,
          canSign: cpu.can_sign || false,
          memberRole: null,
          approvalStatus: entity.account_approval_status
        })
      }
    }

    // Process introducer associations
    if (introducerUsersResult.data) {
      for (const iu of introducerUsersResult.data) {
        const entity = getEntity(iu.introducers) as { id: string; legal_name: string | null; account_approval_status: string | null } | null
        if (!entity) continue
        entities.push({
          id: entity.id,
          name: entity.legal_name || 'Unnamed Introducer',
          type: 'introducer',
          role: iu.role || 'member',
          isPrimary: iu.is_primary || false,
          canSign: iu.can_sign || false,
          memberRole: null,
          approvalStatus: entity.account_approval_status
        })
      }
    }

    // Process arranger associations
    if (arrangerUsersResult.data) {
      for (const au of arrangerUsersResult.data) {
        const entity = getEntity(au.arranger_entities) as { id: string; legal_name: string | null; account_approval_status: string | null } | null
        if (!entity) continue
        entities.push({
          id: entity.id,
          name: entity.legal_name || 'Unnamed Arranger',
          type: 'arranger',
          role: au.role || 'member',
          isPrimary: au.is_primary || false,
          canSign: au.can_sign || false,
          memberRole: null,
          approvalStatus: entity.account_approval_status
        })
      }
    }

    // Fetch full KYC data from ALL member tables (linked by email)
    // Users can have KYC in any member table depending on their entity type
    let kyc: UserKyc | null = null
    let fullKyc: FullUserKyc | null = null

    if (profile.email) {
      const kycSelectFields = `
        email,
        kyc_status,
        first_name,
        middle_name,
        middle_initial,
        last_name,
        name_suffix,
        date_of_birth,
        country_of_birth,
        nationality,
        phone_mobile,
        phone_office,
        residential_street,
        residential_line_2,
        residential_city,
        residential_state,
        residential_postal_code,
        residential_country,
        is_us_citizen,
        is_us_taxpayer,
        us_taxpayer_id,
        country_of_tax_residency,
        tax_id_number,
        id_type,
        id_number,
        id_issue_date,
        id_expiry_date,
        id_issuing_country,
        proof_of_address_date,
        proof_of_address_expiry
      `

      // Query all member tables in parallel for KYC data
      const [
        investorMemberResult,
        partnerMemberResult,
        lawyerMemberResult,
        introducerMemberResult,
        arrangerMemberResult,
        commercialPartnerMemberResult
      ] = await Promise.all([
        supabase.from('investor_members').select(kycSelectFields).eq('email', profile.email).limit(1).maybeSingle(),
        supabase.from('partner_members').select(kycSelectFields).eq('email', profile.email).limit(1).maybeSingle(),
        supabase.from('lawyer_members').select(kycSelectFields).eq('email', profile.email).limit(1).maybeSingle(),
        supabase.from('introducer_members').select(kycSelectFields).eq('email', profile.email).limit(1).maybeSingle(),
        supabase.from('arranger_members').select(kycSelectFields).eq('email', profile.email).limit(1).maybeSingle(),
        supabase.from('commercial_partner_members').select(kycSelectFields).eq('email', profile.email).limit(1).maybeSingle()
      ])

      // Collect all KYC records and pick the best one (prefer approved status)
      const allKycRecords = [
        investorMemberResult.data,
        partnerMemberResult.data,
        lawyerMemberResult.data,
        introducerMemberResult.data,
        arrangerMemberResult.data,
        commercialPartnerMemberResult.data
      ].filter(Boolean)

      // Sort by KYC status priority: approved > submitted > pending > rejected > expired > null
      const statusPriority: Record<string, number> = {
        'approved': 5,
        'submitted': 4,
        'pending': 3,
        'rejected': 2,
        'expired': 1
      }

      allKycRecords.sort((a, b) => {
        const aPriority = statusPriority[a?.kyc_status || ''] || 0
        const bPriority = statusPriority[b?.kyc_status || ''] || 0
        return bPriority - aPriority
      })

      const kycMember = allKycRecords[0]

      if (kycMember) {
        // Summary KYC for backward compatibility
        kyc = {
          status: kycMember.kyc_status as UserKyc['status'],
          idType: kycMember.id_type,
          idExpiry: kycMember.id_expiry_date,
          idExpiryWarning: getIdExpiryWarning(kycMember.id_expiry_date),
          nationality: kycMember.nationality,
          taxResidency: kycMember.country_of_tax_residency,
          isUsPerson: kycMember.is_us_citizen || false
        }

        // Full KYC data for IndividualKycDisplay component
        fullKyc = {
          kyc_status: kycMember.kyc_status as FullUserKyc['kyc_status'],
          first_name: kycMember.first_name,
          middle_name: kycMember.middle_name,
          middle_initial: kycMember.middle_initial,
          last_name: kycMember.last_name,
          name_suffix: kycMember.name_suffix,
          date_of_birth: kycMember.date_of_birth,
          country_of_birth: kycMember.country_of_birth,
          nationality: kycMember.nationality,
          email: kycMember.email,
          phone_mobile: kycMember.phone_mobile,
          phone_office: kycMember.phone_office,
          residential_street: kycMember.residential_street,
          residential_line_2: kycMember.residential_line_2,
          residential_city: kycMember.residential_city,
          residential_state: kycMember.residential_state,
          residential_postal_code: kycMember.residential_postal_code,
          residential_country: kycMember.residential_country,
          is_us_citizen: kycMember.is_us_citizen,
          is_us_taxpayer: kycMember.is_us_taxpayer,
          us_taxpayer_id: kycMember.us_taxpayer_id,
          country_of_tax_residency: kycMember.country_of_tax_residency,
          tax_id_number: kycMember.tax_id_number,
          id_type: kycMember.id_type,
          id_number: kycMember.id_number,
          id_issue_date: kycMember.id_issue_date,
          id_expiry_date: kycMember.id_expiry_date,
          id_issuing_country: kycMember.id_issuing_country,
          proof_of_address_date: kycMember.proof_of_address_date,
          proof_of_address_expiry: kycMember.proof_of_address_expiry
        }
      }
    }

    // Build user row
    const userRow: UserRow = {
      id: profile.id,
      displayName: profile.display_name || 'Unknown',
      email: profile.email || '',
      systemRole: profile.role || 'investor',
      title: profile.title,
      phone: profile.phone,
      officeLocation: profile.office_location,
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      lastLoginAt: profile.last_login_at,
      passwordSet: profile.password_set || false,
      isSuperAdmin: profile.is_super_admin || false,
      hasSignature: !!profile.signature_specimen_url,
      isDeleted: !!profile.deleted_at,
      entities,
      entityCount: entities.length,
      kyc
    }

    return NextResponse.json({
      success: true,
      data: userRow,
      fullKyc
    })

  } catch (error: unknown) {
    console.error('[admin/users/[id]] GET Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// Schema for validating user profile updates
const updateUserSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  title: z.string().max(100).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  office_location: z.string().max(100).nullable().optional(),
})

/**
 * PATCH /api/admin/users/[id]
 *
 * Updates a user's profile information (display_name, title, phone, office_location).
 *
 * Authorization: Requires super_admin permission OR CEO role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check if user is super admin OR CEO (using centralized auth helper)
    const hasAccess = await isSuperAdmin(supabase, user.id)
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id: userId } = await params
    const body = await request.json()

    // Validate input
    const result = updateUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input',
        details: result.error.flatten()
      }, { status: 400 })
    }

    // Only proceed if there are fields to update
    if (Object.keys(result.data).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields provided for update'
      }, { status: 400 })
    }

    // Get current profile for audit logging
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('display_name, title, phone, office_location, email')
      .eq('id', userId)
      .single()

    if (fetchError || !currentProfile) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Update the profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update(result.data)
      .eq('id', userId)

    if (updateError) {
      console.error('[admin/users/[id]] PATCH Update error:', updateError)
      return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 })
    }

    // Log the action using standardized audit logger
    await auditLogger.log({
      actor_user_id: user.id,
      action: 'profile_updated',
      entity: AuditEntities.PROFILES,
      entity_id: userId,
      metadata: {
        target_email: currentProfile.email,
        before: {
          display_name: currentProfile.display_name,
          title: currentProfile.title,
          phone: currentProfile.phone,
          office_location: currentProfile.office_location
        },
        after: result.data
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    })
  } catch (error: unknown) {
    console.error('[admin/users/[id]] PATCH Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
