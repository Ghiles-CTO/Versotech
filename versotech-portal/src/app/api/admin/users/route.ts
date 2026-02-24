import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/api-auth'
import { getIdExpiryWarning } from '@/lib/utils/date-helpers'

// Type definitions for the Users API response
export interface EntityAssociation {
  id: string
  name: string
  type: 'investor' | 'partner' | 'lawyer' | 'commercial_partner' | 'introducer' | 'arranger'
  role: string
  memberRole: string | null
  isPrimary: boolean
  canSign: boolean
  approvalStatus: string | null
}

// Summary KYC for list view
export interface UserKyc {
  status: 'approved' | 'pending' | 'submitted' | 'rejected' | 'expired' | null
  idType: string | null
  idExpiry: string | null
  idExpiryWarning: 'expired' | 'expiring_soon' | null
  nationality: string | null
  taxResidency: string | null
  isUsPerson: boolean
}

// Full KYC data for detail view (matches IndividualKycData interface)
export interface FullUserKyc {
  // KYC Status
  kyc_status: 'approved' | 'pending' | 'submitted' | 'rejected' | 'expired' | null

  // Personal Info
  first_name: string | null
  middle_name: string | null
  middle_initial: string | null
  last_name: string | null
  name_suffix: string | null
  date_of_birth: string | null
  country_of_birth: string | null
  nationality: string | null
  email: string | null
  phone_mobile: string | null
  phone_office: string | null

  // Residential Address
  residential_street: string | null
  residential_line_2: string | null
  residential_city: string | null
  residential_state: string | null
  residential_postal_code: string | null
  residential_country: string | null

  // Tax Information
  is_us_citizen: boolean | null
  is_us_taxpayer: boolean | null
  us_taxpayer_id: string | null
  country_of_tax_residency: string | null
  tax_id_number: string | null

  // Identification Document
  id_type: string | null
  id_number: string | null
  id_issue_date: string | null
  id_expiry_date: string | null
  id_issuing_country: string | null

  // Proof documents
  proof_of_address_date: string | null
  proof_of_address_expiry: string | null
}

export interface UserRow {
  // Core Profile
  id: string
  displayName: string
  email: string
  systemRole: string
  title: string | null
  phone: string | null
  officeLocation: string | null
  avatarUrl: string | null
  createdAt: string
  lastLoginAt: string | null
  passwordSet: boolean
  isSuperAdmin: boolean
  hasSignature: boolean
  isDeleted: boolean

  // Entity Associations (aggregated)
  entities: EntityAssociation[]
  entityCount: number

  // KYC Summary (from linked members)
  kyc: UserKyc | null
}

export interface UsersStats {
  total: number
  active: number
  staff: number
  investors: number
  partners: number
  lawyers: number
  introducers: number
  arrangers: number
  pendingKyc: number
  superAdmins: number
}

export interface UsersResponse {
  success: boolean
  data?: UserRow[]
  stats?: UsersStats
  pagination?: {
    page: number
    pageSize: number
    totalPages: number
    totalCount: number
  }
  error?: string
}

export async function GET(request: NextRequest): Promise<NextResponse<UsersResponse>> {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const search = searchParams.get('search') || ''
    // Support multiple values (comma-separated) for filters
    const roleFilter = searchParams.get('role') || ''
    const roleFilters = roleFilter ? roleFilter.split(',').filter(Boolean) : []
    const entityTypeFilter = searchParams.get('entityType') || ''
    const entityTypeFilters = entityTypeFilter ? entityTypeFilter.split(',').filter(Boolean) : []
    const statusFilter = searchParams.get('status') || ''
    const statusFilters = statusFilter ? statusFilter.split(',').filter(Boolean) : []
    const kycStatusFilter = searchParams.get('kycStatus') || ''
    const kycStatusFilters = kycStatusFilter ? kycStatusFilter.split(',').filter(Boolean) : []
    const hasEntitiesFilter = searchParams.get('hasEntities') || ''
    const hasEntitiesFilters = hasEntitiesFilter ? hasEntitiesFilter.split(',').filter(Boolean) : []
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const includeDeleted = searchParams.get('includeDeleted') === 'true'

    // 1. Fetch all profiles
    let profilesQuery = supabase
      .from('profiles')
      .select('id, display_name, email, role, title, phone, office_location, avatar_url, created_at, last_login_at, password_set, is_super_admin, signature_specimen_url, deleted_at')

    if (!includeDeleted) {
      profilesQuery = profilesQuery.is('deleted_at', null)
    }

    const { data: profiles, error: profilesError } = await profilesQuery

    if (profilesError) {
      console.error('[admin/users] Profiles error:', profilesError)
      return NextResponse.json({ success: false, error: 'Failed to fetch profiles' }, { status: 500 })
    }

    // 2. Fetch all entity associations in parallel
    const [
      investorUsersResult,
      partnerUsersResult,
      lawyerUsersResult,
      commercialPartnerUsersResult,
      introducerUsersResult,
      arrangerUsersResult
    ] = await Promise.all([
      supabase.from('investor_users').select('user_id, investor_id, role, is_primary, can_sign, investors:investors!investor_users_investor_id_fkey(id, legal_name, account_approval_status)'),
      supabase.from('partner_users').select('user_id, partner_id, role, is_primary, can_sign, partners:partners!partner_users_partner_fk(id, name, legal_name, account_approval_status)'),
      supabase.from('lawyer_users').select('user_id, lawyer_id, role, is_primary, can_sign, lawyers:lawyers!lawyer_users_lawyer_fk(id, firm_name, display_name, account_approval_status)'),
      supabase.from('commercial_partner_users').select('user_id, commercial_partner_id, role, is_primary, can_sign, commercial_partners:commercial_partners!commercial_partner_users_cp_fk(id, name, legal_name, account_approval_status)'),
      supabase.from('introducer_users').select('user_id, introducer_id, role, is_primary, can_sign, introducers:introducers!introducer_users_introducer_fk(id, legal_name, account_approval_status)'),
      supabase.from('arranger_users').select('user_id, arranger_id, role, is_primary, can_sign, arranger_entities:arranger_entities!arranger_users_arranger_fk(id, legal_name, account_approval_status)')
    ])

    // Build entity association maps by user_id
    const entityMap = new Map<string, EntityAssociation[]>()

    // Helper to safely get entity data
    const getEntity = (data: unknown) => Array.isArray(data) ? data[0] : data

    // Process investor associations
    if (investorUsersResult.data) {
      for (const iu of investorUsersResult.data) {
        const entity = getEntity(iu.investors) as { id: string; legal_name: string | null; account_approval_status: string | null } | null
        if (!entity) continue
        const associations = entityMap.get(iu.user_id) || []
        associations.push({
          id: entity.id,
          name: entity.legal_name || 'Unnamed Investor',
          type: 'investor',
          role: iu.role || 'member',
          isPrimary: iu.is_primary || false,
          canSign: iu.can_sign || false,
          memberRole: null,
          approvalStatus: entity.account_approval_status
        })
        entityMap.set(iu.user_id, associations)
      }
    }

    // Process partner associations
    if (partnerUsersResult.data) {
      for (const pu of partnerUsersResult.data) {
        const entity = getEntity(pu.partners) as { id: string; name: string | null; legal_name: string | null; account_approval_status: string | null } | null
        if (!entity) continue
        const associations = entityMap.get(pu.user_id) || []
        associations.push({
          id: entity.id,
          name: entity.name || entity.legal_name || 'Unnamed Partner',
          type: 'partner',
          role: pu.role || 'member',
          isPrimary: pu.is_primary || false,
          canSign: pu.can_sign || false,
          memberRole: null,
          approvalStatus: entity.account_approval_status
        })
        entityMap.set(pu.user_id, associations)
      }
    }

    // Process lawyer associations
    if (lawyerUsersResult.data) {
      for (const lu of lawyerUsersResult.data) {
        const entity = getEntity(lu.lawyers) as { id: string; firm_name: string | null; display_name: string | null; account_approval_status: string | null } | null
        if (!entity) continue
        const associations = entityMap.get(lu.user_id) || []
        associations.push({
          id: entity.id,
          name: entity.firm_name || entity.display_name || 'Unnamed Law Firm',
          type: 'lawyer',
          role: lu.role || 'member',
          isPrimary: lu.is_primary || false,
          canSign: lu.can_sign || false,
          memberRole: null,
          approvalStatus: entity.account_approval_status
        })
        entityMap.set(lu.user_id, associations)
      }
    }

    // Process commercial partner associations
    if (commercialPartnerUsersResult.data) {
      for (const cpu of commercialPartnerUsersResult.data) {
        const entity = getEntity(cpu.commercial_partners) as { id: string; name: string | null; legal_name: string | null; account_approval_status: string | null } | null
        if (!entity) continue
        const associations = entityMap.get(cpu.user_id) || []
        associations.push({
          id: entity.id,
          name: entity.name || entity.legal_name || 'Unnamed Commercial Partner',
          type: 'commercial_partner',
          role: cpu.role || 'member',
          isPrimary: cpu.is_primary || false,
          canSign: cpu.can_sign || false,
          memberRole: null,
          approvalStatus: entity.account_approval_status
        })
        entityMap.set(cpu.user_id, associations)
      }
    }

    // Process introducer associations
    if (introducerUsersResult.data) {
      for (const iu of introducerUsersResult.data) {
        const entity = getEntity(iu.introducers) as { id: string; legal_name: string | null; account_approval_status: string | null } | null
        if (!entity) continue
        const associations = entityMap.get(iu.user_id) || []
        associations.push({
          id: entity.id,
          name: entity.legal_name || 'Unnamed Introducer',
          type: 'introducer',
          role: iu.role || 'member',
          isPrimary: iu.is_primary || false,
          canSign: iu.can_sign || false,
          memberRole: null,
          approvalStatus: entity.account_approval_status
        })
        entityMap.set(iu.user_id, associations)
      }
    }

    // Process arranger associations
    if (arrangerUsersResult.data) {
      for (const au of arrangerUsersResult.data) {
        const entity = getEntity(au.arranger_entities) as { id: string; legal_name: string | null; account_approval_status: string | null } | null
        if (!entity) continue
        const associations = entityMap.get(au.user_id) || []
        associations.push({
          id: entity.id,
          name: entity.legal_name || 'Unnamed Arranger',
          type: 'arranger',
          role: au.role || 'member',
          isPrimary: au.is_primary || false,
          canSign: au.can_sign || false,
          memberRole: null,
          approvalStatus: entity.account_approval_status
        })
        entityMap.set(au.user_id, associations)
      }
    }

    // 3. Fetch KYC data from DIRECT member tables (linked by email)
    // Users can be members in any entity type, so we check all 6 direct member tables
    // NOTE: counterparty_entity_members is EXCLUDED - it stores members of third-party
    // structures (trusts, LLCs) that investors invest THROUGH, not the user's personal KYC
    const profileEmails = profiles?.map(p => p.email).filter(Boolean) || []

    // Fetch KYC data from all direct member tables in parallel (6 tables)
    const kycFields = 'email, kyc_status, id_type, id_expiry_date, nationality, country_of_tax_residency, is_us_citizen'
    const [
      investorMembersResult,
      partnerMembersResult,
      lawyerMembersResult,
      commercialPartnerMembersResult,
      introducerMembersResult,
      arrangerMembersResult
    ] = profileEmails.length > 0
      ? await Promise.all([
          supabase.from('investor_members').select(kycFields).in('email', profileEmails),
          supabase.from('partner_members').select(kycFields).in('email', profileEmails),
          supabase.from('lawyer_members').select(kycFields).in('email', profileEmails),
          supabase.from('commercial_partner_members').select(kycFields).in('email', profileEmails),
          supabase.from('introducer_members').select(kycFields).in('email', profileEmails),
          supabase.from('arranger_members').select(kycFields).in('email', profileEmails)
        ])
      : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }]

    // Combine all KYC data from direct member tables
    const allKycMembers = [
      ...(investorMembersResult.data || []),
      ...(partnerMembersResult.data || []),
      ...(lawyerMembersResult.data || []),
      ...(commercialPartnerMembersResult.data || []),
      ...(introducerMembersResult.data || []),
      ...(arrangerMembersResult.data || [])
    ]

    // Build KYC map by email
    // Priority: approved > submitted > pending > rejected > expired > null
    const kycStatusPriority: Record<string, number> = {
      'approved': 5,
      'submitted': 4,
      'pending': 3,
      'rejected': 2,
      'expired': 1
    }

    const kycMap = new Map<string, UserKyc>()
    for (const member of allKycMembers) {
      if (!member.email) continue

      const existing = kycMap.get(member.email)
      const existingPriority = existing?.status ? (kycStatusPriority[existing.status] || 0) : 0
      const newPriority = member.kyc_status ? (kycStatusPriority[member.kyc_status] || 0) : 0

      // Store if we don't have data for this email yet, or if this one has higher priority status
      if (!existing || newPriority > existingPriority) {
        kycMap.set(member.email, {
          status: member.kyc_status as UserKyc['status'],
          idType: member.id_type,
          idExpiry: member.id_expiry_date,
          idExpiryWarning: getIdExpiryWarning(member.id_expiry_date),
          nationality: member.nationality,
          taxResidency: member.country_of_tax_residency,
          isUsPerson: member.is_us_citizen || false
        })
      }
    }

    // 4. Build user rows
    let userRows: UserRow[] = (profiles || []).map(p => ({
      id: p.id,
      displayName: p.display_name || 'Unknown',
      email: p.email || '',
      systemRole: p.role || 'investor',
      title: p.title,
      phone: p.phone,
      officeLocation: p.office_location,
      avatarUrl: p.avatar_url,
      createdAt: p.created_at,
      lastLoginAt: p.last_login_at,
      passwordSet: p.password_set || false,
      isSuperAdmin: p.is_super_admin || false,
      hasSignature: !!p.signature_specimen_url,
      isDeleted: !!p.deleted_at,
      entities: entityMap.get(p.id) || [],
      entityCount: (entityMap.get(p.id) || []).length,
      kyc: p.email ? kycMap.get(p.email) || null : null
    }))

    // 5. Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      userRows = userRows.filter(u =>
        u.displayName.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.title?.toLowerCase().includes(searchLower)
      )
    }

    // Multi-select role filter
    if (roleFilters.length > 0) {
      userRows = userRows.filter(u => roleFilters.includes(u.systemRole))
    }

    // Multi-select entity type filter
    if (entityTypeFilters.length > 0) {
      userRows = userRows.filter(u =>
        u.entities.some(e => entityTypeFilters.includes(e.type))
      )
    }

    // Status filter (derived from user data)
    // Status: active, pending, inactive, deactivated
    if (statusFilters.length > 0) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      userRows = userRows.filter(u => {
        let status: string
        if (u.isDeleted) {
          status = 'deactivated'
        } else if (!u.lastLoginAt) {
          status = 'pending'
        } else if (new Date(u.lastLoginAt) > thirtyDaysAgo) {
          status = 'active'
        } else {
          status = 'inactive'
        }
        return statusFilters.includes(status)
      })
    }

    if (kycStatusFilters.length > 0 && !kycStatusFilters.includes('all')) {
      userRows = userRows.filter(u => {
        const status = u.kyc?.status
        return status ? kycStatusFilters.includes(status) : false
      })
    }

    if (hasEntitiesFilters.length > 0) {
      const includeWithEntities = hasEntitiesFilters.includes('yes') || hasEntitiesFilters.includes('true')
      const includeWithoutEntities = hasEntitiesFilters.includes('no') || hasEntitiesFilters.includes('false')
      if (includeWithEntities && !includeWithoutEntities) {
        userRows = userRows.filter(u => u.entityCount > 0)
      } else if (includeWithoutEntities && !includeWithEntities) {
        userRows = userRows.filter(u => u.entityCount === 0)
      }
    }

    // 6. Calculate stats (before pagination)
    const stats: UsersStats = {
      total: userRows.length,
      active: userRows.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
      staff: userRows.filter(u => u.systemRole.startsWith('staff_') || u.systemRole === 'ceo').length,
      investors: userRows.filter(u => u.entities.some(e => e.type === 'investor')).length,
      partners: userRows.filter(u => u.entities.some(e => e.type === 'partner')).length,
      lawyers: userRows.filter(u => u.entities.some(e => e.type === 'lawyer')).length,
      introducers: userRows.filter(u => u.entities.some(e => e.type === 'introducer')).length,
      arrangers: userRows.filter(u => u.entities.some(e => e.type === 'arranger')).length,
      pendingKyc: userRows.filter(u => u.kyc?.status === 'pending' || u.kyc?.status === 'submitted').length,
      superAdmins: userRows.filter(u => u.isSuperAdmin).length
    }

    // 7. Apply sorting
    userRows.sort((a, b) => {
      let aVal: string | number, bVal: string | number

      switch (sortBy) {
        case 'displayName':
          aVal = a.displayName.toLowerCase()
          bVal = b.displayName.toLowerCase()
          break
        case 'email':
          aVal = a.email.toLowerCase()
          bVal = b.email.toLowerCase()
          break
        case 'systemRole':
          aVal = a.systemRole
          bVal = b.systemRole
          break
        case 'entityCount':
          aVal = a.entityCount
          bVal = b.entityCount
          break
        case 'lastLoginAt':
          aVal = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0
          bVal = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0
          break
        case 'createdAt':
        default:
          aVal = new Date(a.createdAt).getTime()
          bVal = new Date(b.createdAt).getTime()
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

    // 8. Apply pagination
    const totalCount = userRows.length
    const totalPages = Math.ceil(totalCount / pageSize)
    const offset = (page - 1) * pageSize
    const paginatedUsers = userRows.slice(offset, offset + pageSize)

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      stats,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalCount
      }
    })

  } catch (error: unknown) {
    console.error('[admin/users] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
