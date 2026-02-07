import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { UserDetailClient } from './user-detail-client'
import { AlertCircle } from 'lucide-react'
import { checkStaffAccess } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/api-auth'
import type { UserRow, EntityAssociation, UserKyc, FullUserKyc } from '@/app/api/admin/users/route'
import type { IndividualKycData } from '@/components/shared/individual-kyc-display'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Helper to check if ID is expiring soon (within 30 days)
function getIdExpiryWarning(expiryDate: string | null): 'expired' | 'expiring_soon' | null {
  if (!expiryDate) return null
  const expiry = new Date(expiryDate)
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  if (expiry < now) return 'expired'
  if (expiry < thirtyDaysFromNow) return 'expiring_soon'
  return null
}

/**
 * User Detail Page for Unified Portal (versotech_main)
 *
 * Persona-aware access:
 * - Staff/CEO personas with super admin: Full access to user details
 * - Other personas: Access denied
 */
export default async function UserDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    redirect('/versotech_main/login')
  }

  // Check if user has staff persona for access
  const hasStaffAccess = await checkStaffAccess(user.id)
  const serviceSupabase = createServiceClient()

  if (!hasStaffAccess) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            User details are only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  // Check if user is super admin OR CEO
  const hasAdminAccess = await isSuperAdmin(serviceSupabase, user.id)
  if (!hasAdminAccess) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Admin Access Required
          </h3>
          <p className="text-muted-foreground">
            You need admin permissions to view user details.
          </p>
        </div>
      </div>
    )
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await serviceSupabase
    .from('profiles')
    .select('id, display_name, email, role, title, phone, office_location, avatar_url, created_at, last_login_at, password_set, is_super_admin, signature_specimen_url, deleted_at, bio')
    .eq('id', id)
    .single()

  if (profileError || !profile) {
    console.error('[User Detail] Profile error:', profileError)
    notFound()
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
    serviceSupabase.from('investor_users').select('user_id, investor_id, role, is_primary, can_sign, ceo_approval_status, investors:investors!investor_users_investor_id_fkey(id, legal_name)').eq('user_id', id),
    serviceSupabase.from('partner_users').select('user_id, partner_id, role, is_primary, can_sign, ceo_approval_status, partners:partners!partner_users_partner_fk(id, name, legal_name)').eq('user_id', id),
    serviceSupabase.from('lawyer_users').select('user_id, lawyer_id, role, is_primary, can_sign, ceo_approval_status, lawyers:lawyers!lawyer_users_lawyer_fk(id, firm_name, display_name)').eq('user_id', id),
    serviceSupabase.from('commercial_partner_users').select('user_id, commercial_partner_id, role, is_primary, can_sign, ceo_approval_status, commercial_partners:commercial_partners!commercial_partner_users_cp_fk(id, name, legal_name)').eq('user_id', id),
    serviceSupabase.from('introducer_users').select('user_id, introducer_id, role, is_primary, can_sign, ceo_approval_status, introducers:introducers!introducer_users_introducer_fk(id, legal_name)').eq('user_id', id),
    serviceSupabase.from('arranger_users').select('user_id, arranger_id, role, is_primary, can_sign, ceo_approval_status, arranger_entities:arranger_entities!arranger_users_arranger_fk(id, legal_name)').eq('user_id', id)
  ])

  // Build entity associations
  const entities: EntityAssociation[] = []

  // Helper to safely get entity data
  const getEntity = (data: unknown) => Array.isArray(data) ? data[0] : data

  // Process investor associations
  if (investorUsersResult.data) {
    for (const iu of investorUsersResult.data) {
      const entity = getEntity(iu.investors) as { id: string; legal_name: string | null } | null
      if (!entity) continue
      entities.push({
        id: entity.id,
        name: entity.legal_name || 'Unnamed Investor',
        type: 'investor',
        role: iu.role || 'member',
        isPrimary: iu.is_primary || false,
        canSign: iu.can_sign || false,
        approvalStatus: iu.ceo_approval_status
      })
    }
  }

  // Process partner associations
  if (partnerUsersResult.data) {
    for (const pu of partnerUsersResult.data) {
      const entity = getEntity(pu.partners) as { id: string; name: string | null; legal_name: string | null } | null
      if (!entity) continue
      entities.push({
        id: entity.id,
        name: entity.name || entity.legal_name || 'Unnamed Partner',
        type: 'partner',
        role: pu.role || 'member',
        isPrimary: pu.is_primary || false,
        canSign: pu.can_sign || false,
        approvalStatus: pu.ceo_approval_status
      })
    }
  }

  // Process lawyer associations
  if (lawyerUsersResult.data) {
    for (const lu of lawyerUsersResult.data) {
      const entity = getEntity(lu.lawyers) as { id: string; firm_name: string | null; display_name: string | null } | null
      if (!entity) continue
      entities.push({
        id: entity.id,
        name: entity.firm_name || entity.display_name || 'Unnamed Law Firm',
        type: 'lawyer',
        role: lu.role || 'member',
        isPrimary: lu.is_primary || false,
        canSign: lu.can_sign || false,
        approvalStatus: lu.ceo_approval_status
      })
    }
  }

  // Process commercial partner associations
  if (commercialPartnerUsersResult.data) {
    for (const cpu of commercialPartnerUsersResult.data) {
      const entity = getEntity(cpu.commercial_partners) as { id: string; name: string | null; legal_name: string | null } | null
      if (!entity) continue
      entities.push({
        id: entity.id,
        name: entity.name || entity.legal_name || 'Unnamed Commercial Partner',
        type: 'commercial_partner',
        role: cpu.role || 'member',
        isPrimary: cpu.is_primary || false,
        canSign: cpu.can_sign || false,
        approvalStatus: cpu.ceo_approval_status
      })
    }
  }

  // Process introducer associations
  if (introducerUsersResult.data) {
    for (const iu of introducerUsersResult.data) {
      const entity = getEntity(iu.introducers) as { id: string; legal_name: string | null } | null
      if (!entity) continue
      entities.push({
        id: entity.id,
        name: entity.legal_name || 'Unnamed Introducer',
        type: 'introducer',
        role: iu.role || 'member',
        isPrimary: iu.is_primary || false,
        canSign: iu.can_sign || false,
        approvalStatus: iu.ceo_approval_status
      })
    }
  }

  // Process arranger associations
  if (arrangerUsersResult.data) {
    for (const au of arrangerUsersResult.data) {
      const entity = getEntity(au.arranger_entities) as { id: string; legal_name: string | null } | null
      if (!entity) continue
      entities.push({
        id: entity.id,
        name: entity.legal_name || 'Unnamed Arranger',
        type: 'arranger',
        role: au.role || 'member',
        isPrimary: au.is_primary || false,
        canSign: au.can_sign || false,
        approvalStatus: au.ceo_approval_status
      })
    }
  }

  // Fetch full KYC data from ALL member tables (linked by email)
  // Users can have KYC in any member table depending on their entity type
  let kyc: UserKyc | null = null
  let fullKycData: IndividualKycData | null = null

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

    // Query DIRECT member tables in parallel for KYC data (6 tables)
    // NOTE: counterparty_entity_members is EXCLUDED - it stores members of third-party
    // structures (trusts, LLCs) that investors invest THROUGH, not the user's personal KYC
    const [
      investorMemberResult,
      partnerMemberResult,
      lawyerMemberResult,
      introducerMemberResult,
      arrangerMemberResult,
      commercialPartnerMemberResult
    ] = await Promise.all([
      serviceSupabase.from('investor_members').select(kycSelectFields).eq('email', profile.email).limit(1).maybeSingle(),
      serviceSupabase.from('partner_members').select(kycSelectFields).eq('email', profile.email).limit(1).maybeSingle(),
      serviceSupabase.from('lawyer_members').select(kycSelectFields).eq('email', profile.email).limit(1).maybeSingle(),
      serviceSupabase.from('introducer_members').select(kycSelectFields).eq('email', profile.email).limit(1).maybeSingle(),
      serviceSupabase.from('arranger_members').select(kycSelectFields).eq('email', profile.email).limit(1).maybeSingle(),
      serviceSupabase.from('commercial_partner_members').select(kycSelectFields).eq('email', profile.email).limit(1).maybeSingle()
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
      fullKycData = {
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

  // Build user data
  const userData: UserRow = {
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

  return <UserDetailClient user={userData} fullKycData={fullKycData} />
}
