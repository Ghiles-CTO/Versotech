import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isStaffUser } from '@/lib/api-auth'

/**
 * KYC Compliance Overview API
 *
 * Aggregates KYC status across all 6 entity types:
 * - Investors, Arrangers, Partners, Introducers, Lawyers, Commercial Partners
 *
 * Returns:
 * - Summary statistics (complete, pending, expiring, expired)
 * - Breakdown by entity type
 * - Members with incomplete KYC (across all member tables)
 * - Stale proof of address documents (>90 days old)
 */

interface EntityStats {
  total: number
  complete: number
  pending: number
  expiring_soon: number
  expired: number
}

interface MemberComplianceStats {
  total_members: number
  incomplete_kyc: number
  expired_ids: number
  missing_documents: number
}

interface ComplianceOverview {
  summary: {
    total_entities: number
    kyc_complete: number
    kyc_pending: number
    kyc_expiring_soon: number
    kyc_expired: number
    completion_percentage: number
  }
  by_entity_type: {
    investor: EntityStats
    arranger: EntityStats
    partner: EntityStats
    introducer: EntityStats
    lawyer: EntityStats
    commercial_partner: EntityStats
  }
  members_needing_attention: number
  member_compliance: MemberComplianceStats
  documents_expiring_30_days: number
  documents_expired: number
  stale_proof_of_address: number
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff
    const staffCheck = await isStaffUser(supabase, user.id)
    if (!staffCheck) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Use service client for cross-entity queries
    const serviceClient = createServiceClient()
    const today = new Date().toISOString().split('T')[0]
    const staleDate = getDateInDays(-90) // 90 days ago

    // Get stats for each entity type in parallel
    const [
      investorStats,
      arrangerStats,
      partnerStats,
      introducerStats,
      lawyerStats,
      commercialPartnerStats,
      expiringDocsCount,
      expiredDocsCount,
      staleProofOfAddressCount,
      memberComplianceStats,
    ] = await Promise.all([
      // Investors
      serviceClient
        .from('investors')
        .select('id, kyc_status', { count: 'exact' })
        .then(({ data, count }) => aggregateStats(data || [], count || 0)),

      // Arrangers
      serviceClient
        .from('arranger_entities')
        .select('id, kyc_status', { count: 'exact' })
        .then(({ data, count }) => aggregateStats(data || [], count || 0)),

      // Partners
      serviceClient
        .from('partners')
        .select('id, kyc_status', { count: 'exact' })
        .then(({ data, count }) => aggregateStats(data || [], count || 0)),

      // Introducers
      serviceClient
        .from('introducers')
        .select('id, kyc_status', { count: 'exact' })
        .then(({ data, count }) => aggregateStats(data || [], count || 0)),

      // Lawyers
      serviceClient
        .from('lawyers')
        .select('id, kyc_status', { count: 'exact' })
        .then(({ data, count }) => aggregateStats(data || [], count || 0)),

      // Commercial Partners
      serviceClient
        .from('commercial_partners')
        .select('id, kyc_status', { count: 'exact' })
        .then(({ data, count }) => aggregateStats(data || [], count || 0)),

      // Documents expiring in 30 days
      serviceClient
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .gte('document_expiry_date', today)
        .lte('document_expiry_date', getDateInDays(30))
        .then(({ count }) => count || 0),

      // Expired documents (by expiry date)
      serviceClient
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .lt('document_expiry_date', today)
        .then(({ count }) => count || 0),

      // Stale proof of address documents (document_date > 90 days old)
      serviceClient
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .in('type', [
          'proof_of_address',
          'signatory_proof_of_address',
          'member_proof_of_address',
          'utility_bill',
          'bank_statement',
          'tax_bill',
          'council_tax',
        ])
        .lt('document_date', staleDate)
        .then(({ count }) => count || 0),

      // Member compliance stats across all 6 member tables
      getMemberComplianceStats(serviceClient, today),
    ])

    // Calculate totals
    const allStats = [
      investorStats,
      arrangerStats,
      partnerStats,
      introducerStats,
      lawyerStats,
      commercialPartnerStats,
    ]

    const totalEntities = allStats.reduce((sum, s) => sum + s.total, 0)
    const totalComplete = allStats.reduce((sum, s) => sum + s.complete, 0)
    const totalPending = allStats.reduce((sum, s) => sum + s.pending, 0)
    const totalExpiringSoon = allStats.reduce((sum, s) => sum + s.expiring_soon, 0)
    const totalExpired = allStats.reduce((sum, s) => sum + s.expired, 0)

    // Calculate members needing attention (incomplete + expired IDs)
    const membersNeedingAttention = memberComplianceStats.incomplete_kyc + memberComplianceStats.expired_ids

    const overview: ComplianceOverview = {
      summary: {
        total_entities: totalEntities,
        kyc_complete: totalComplete,
        kyc_pending: totalPending,
        kyc_expiring_soon: totalExpiringSoon,
        kyc_expired: totalExpired,
        completion_percentage: totalEntities > 0
          ? Math.round((totalComplete / totalEntities) * 100)
          : 0,
      },
      by_entity_type: {
        investor: investorStats,
        arranger: arrangerStats,
        partner: partnerStats,
        introducer: introducerStats,
        lawyer: lawyerStats,
        commercial_partner: commercialPartnerStats,
      },
      members_needing_attention: membersNeedingAttention,
      member_compliance: memberComplianceStats,
      documents_expiring_30_days: expiringDocsCount,
      documents_expired: expiredDocsCount,
      stale_proof_of_address: staleProofOfAddressCount,
    }

    return NextResponse.json(overview)
  } catch (error) {
    console.error('Compliance overview error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Get member compliance stats across all 6 member tables
 * Checks for:
 * - Members with incomplete KYC (no kyc_status or draft/pending)
 * - Members with expired ID documents (id_expiry_date < today)
 * - UBOs missing required fields
 */
async function getMemberComplianceStats(
  serviceClient: ReturnType<typeof createServiceClient>,
  today: string
): Promise<MemberComplianceStats> {
  const memberTables = [
    'investor_members',
    'arranger_members',
    'partner_members',
    'introducer_members',
    'lawyer_members',
    'commercial_partner_members',
  ]

  let totalMembers = 0
  let incompleteKyc = 0
  let expiredIds = 0
  let missingDocuments = 0

  // Query each member table
  for (const table of memberTables) {
    try {
      // Get all members with relevant fields
      const { data: members, count } = await serviceClient
        .from(table)
        .select('id, kyc_status, id_expiry_date, is_beneficial_owner, ownership_percentage', { count: 'exact' })

      if (members) {
        totalMembers += count || 0

        // Check for incomplete KYC
        const incomplete = members.filter(m =>
          !m.kyc_status ||
          m.kyc_status === 'draft' ||
          m.kyc_status === 'pending' ||
          m.kyc_status === 'submitted'
        )
        incompleteKyc += incomplete.length

        // Check for expired IDs
        const expired = members.filter(m =>
          m.id_expiry_date && m.id_expiry_date < today
        )
        expiredIds += expired.length

        // Check for UBOs missing ownership percentage
        const ubosWithMissingData = members.filter(m =>
          m.is_beneficial_owner === true &&
          (m.ownership_percentage === null || m.ownership_percentage === undefined)
        )
        missingDocuments += ubosWithMissingData.length
      }
    } catch (error) {
      console.error(`Error querying ${table}:`, error)
      // Continue with other tables
    }
  }

  return {
    total_members: totalMembers,
    incomplete_kyc: incompleteKyc,
    expired_ids: expiredIds,
    missing_documents: missingDocuments,
  }
}

// Helper to aggregate entity stats
function aggregateStats(
  entities: Array<{ id: string; kyc_status: string | null }>,
  total: number
): EntityStats {
  const complete = entities.filter(e =>
    e.kyc_status === 'approved' || e.kyc_status === 'completed'
  ).length

  const pending = entities.filter(e =>
    !e.kyc_status ||
    e.kyc_status === 'draft' ||
    e.kyc_status === 'pending' ||
    e.kyc_status === 'submitted'
  ).length

  const expired = entities.filter(e =>
    e.kyc_status === 'expired'
  ).length

  const expiringSoon = entities.filter(e =>
    e.kyc_status === 'expiring_soon'
  ).length

  return {
    total,
    complete,
    pending,
    expiring_soon: expiringSoon,
    expired,
  }
}

// Helper to get date X days from now (negative for past)
function getDateInDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}
