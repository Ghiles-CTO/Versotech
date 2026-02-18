import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isStaffUser } from '@/lib/api-auth'

/**
 * Expiring Documents API
 *
 * Returns documents that are:
 * - Expiring within a configurable number of days (default 30)
 * - Already expired
 * - Stale (proof of address > 3 months old based on document_date)
 *
 * Supports filtering by:
 * - Entity type
 * - Document type
 * - Expiry window (30, 60, 90 days)
 */

// Proof of address document types
const PROOF_OF_ADDRESS_TYPES = [
  'proof_of_address',
  'signatory_proof_of_address',
  'member_proof_of_address',
  'utility_bill',
  'bank_statement',
  'tax_bill',
  'council_tax',
  'rental_agreement',
  'mortgage_statement',
]

interface ExpiringDocument {
  id: string
  name: string
  type: string
  document_expiry_date: string | null
  document_date: string | null
  validation_status: string | null
  days_until_expiry: number | null
  days_since_document_date: number | null
  entity_type: string
  entity_id: string
  entity_name: string
  member_id: string | null
  member_name: string | null
  is_stale: boolean
}

type EntityInfo = { type: string; id: string; name: string; memberId: string | null; memberName: string | null }

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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const daysWindow = parseInt(searchParams.get('days') || '30', 10)
    const includeExpired = searchParams.get('include_expired') !== 'false'
    const includeStale = searchParams.get('include_stale') !== 'false'
    const entityType = searchParams.get('entity_type')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500)

    const serviceClient = createServiceClient()
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const futureDate = getDateInDays(daysWindow)
    const staleDate = getDateInDays(-90) // 90 days ago

    // Query 1: Documents with expiry dates (expired + expiring soon)
    let expiryQuery = serviceClient
      .from('documents')
      .select(`
        id,
        name,
        type,
        document_expiry_date,
        document_date,
        validation_status,
        owner_investor_id,
        arranger_entity_id,
        partner_id,
        introducer_id,
        lawyer_id,
        commercial_partner_id,
        investor_member_id,
        arranger_member_id,
        partner_member_id,
        introducer_member_id,
        lawyer_member_id,
        commercial_partner_member_id,
        created_at
      `)
      .not('document_expiry_date', 'is', null)
      .order('document_expiry_date', { ascending: true })
      .limit(limit)

    // Filter by expiry window
    if (includeExpired) {
      expiryQuery = expiryQuery.lte('document_expiry_date', futureDate)
    } else {
      expiryQuery = expiryQuery
        .gte('document_expiry_date', todayStr)
        .lte('document_expiry_date', futureDate)
    }

    // Query 2: Stale proof of address documents (document_date > 90 days old)
    const staleQuery = serviceClient
      .from('documents')
      .select(`
        id,
        name,
        type,
        document_expiry_date,
        document_date,
        validation_status,
        owner_investor_id,
        arranger_entity_id,
        partner_id,
        introducer_id,
        lawyer_id,
        commercial_partner_id,
        investor_member_id,
        arranger_member_id,
        partner_member_id,
        introducer_member_id,
        lawyer_member_id,
        commercial_partner_member_id,
        created_at
      `)
      .in('type', PROOF_OF_ADDRESS_TYPES)
      .not('document_date', 'is', null)
      .lt('document_date', staleDate)
      .order('document_date', { ascending: true })
      .limit(limit)

    // Execute both queries in parallel
    const [expiryResult, staleResult] = await Promise.all([
      expiryQuery,
      includeStale ? staleQuery : Promise.resolve({ data: [], error: null }),
    ])

    if (expiryResult.error) {
      console.error('Expiry documents query error:', expiryResult.error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    // Batch-fetch all entity and member names for both result sets
    const allDocs = [...(expiryResult.data || []), ...(staleResult.data || [])]
    const entityMap = await batchFetchEntityInfo(serviceClient, allDocs)

    // Enrich expiry documents
    const enrichedExpiryDocs: ExpiringDocument[] = (expiryResult.data || []).map((doc) => {
      const entityInfo = entityMap.get(doc.id) || { type: 'unknown', id: '', name: 'Unknown Entity', memberId: null, memberName: null }
      const daysUntilExpiry = doc.document_expiry_date
        ? Math.floor((new Date(doc.document_expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null
      const daysSinceDocDate = doc.document_date
        ? Math.floor((today.getTime() - new Date(doc.document_date).getTime()) / (1000 * 60 * 60 * 24))
        : null

      return {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        document_expiry_date: doc.document_expiry_date,
        document_date: doc.document_date,
        validation_status: doc.validation_status,
        days_until_expiry: daysUntilExpiry,
        days_since_document_date: daysSinceDocDate,
        entity_type: entityInfo.type,
        entity_id: entityInfo.id,
        entity_name: entityInfo.name,
        member_id: entityInfo.memberId,
        member_name: entityInfo.memberName,
        is_stale: false,
      }
    })

    // Enrich stale documents
    const enrichedStaleDocs: ExpiringDocument[] = (staleResult.data || []).map((doc) => {
      const entityInfo = entityMap.get(doc.id) || { type: 'unknown', id: '', name: 'Unknown Entity', memberId: null, memberName: null }
      const daysSinceDocDate = doc.document_date
        ? Math.floor((today.getTime() - new Date(doc.document_date).getTime()) / (1000 * 60 * 60 * 24))
        : null

      return {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        document_expiry_date: doc.document_expiry_date,
        document_date: doc.document_date,
        validation_status: doc.validation_status,
        days_until_expiry: null,
        days_since_document_date: daysSinceDocDate,
        entity_type: entityInfo.type,
        entity_id: entityInfo.id,
        entity_name: entityInfo.name,
        member_id: entityInfo.memberId,
        member_name: entityInfo.memberName,
        is_stale: true,
      }
    })

    // Filter by entity type if specified
    const filteredExpiryDocs = entityType
      ? enrichedExpiryDocs.filter(d => d.entity_type === entityType)
      : enrichedExpiryDocs

    const filteredStaleDocs = entityType
      ? enrichedStaleDocs.filter(d => d.entity_type === entityType)
      : enrichedStaleDocs

    // Group expiry docs by status
    const expired = filteredExpiryDocs.filter(d => (d.days_until_expiry ?? 0) < 0)
    const expiringSoon = filteredExpiryDocs.filter(d => (d.days_until_expiry ?? 0) >= 0)

    // Remove duplicates from stale list (documents that are already in expired/expiring)
    const expiryDocIds = new Set(filteredExpiryDocs.map(d => d.id))
    const uniqueStaleDocs = filteredStaleDocs.filter(d => !expiryDocIds.has(d.id))

    return NextResponse.json({
      expired,
      expiring_soon: expiringSoon,
      stale: uniqueStaleDocs,
      summary: {
        total: filteredExpiryDocs.length + uniqueStaleDocs.length,
        expired_count: expired.length,
        expiring_soon_count: expiringSoon.length,
        stale_count: uniqueStaleDocs.length,
        days_window: daysWindow,
      },
    })
  } catch (error) {
    console.error('Expiring documents error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function collectIds(docs: any[], field: string): string[] {
  const ids = new Set<string>()
  for (const doc of docs) {
    if (doc[field]) ids.add(doc[field])
  }
  return Array.from(ids)
}

function resolveMemberName(member: { full_name?: string; first_name?: string; last_name?: string } | null): string | null {
  if (!member) return null
  return member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || null
}

// Batch-fetch entity and member names, returning a Map keyed by document ID
async function batchFetchEntityInfo(
  supabase: ReturnType<typeof createServiceClient>,
  docs: any[]
): Promise<Map<string, EntityInfo>> {
  // Collect unique IDs per entity/member type
  const investorIds = collectIds(docs, 'owner_investor_id')
  const arrangerIds = collectIds(docs, 'arranger_entity_id')
  const partnerIds = collectIds(docs, 'partner_id')
  const introducerIds = collectIds(docs, 'introducer_id')
  const lawyerIds = collectIds(docs, 'lawyer_id')
  const cpIds = collectIds(docs, 'commercial_partner_id')

  const investorMemberIds = collectIds(docs, 'investor_member_id')
  const arrangerMemberIds = collectIds(docs, 'arranger_member_id')
  const partnerMemberIds = collectIds(docs, 'partner_member_id')
  const introducerMemberIds = collectIds(docs, 'introducer_member_id')
  const lawyerMemberIds = collectIds(docs, 'lawyer_member_id')
  const cpMemberIds = collectIds(docs, 'commercial_partner_member_id')

  // Fire all batch queries in parallel (only for non-empty ID sets)
  const [
    investors, arrangers, partners, introducers, lawyers, cps,
    investorMembers, arrangerMembers, partnerMembers, introducerMembers, lawyerMembers, cpMembers,
  ] = await Promise.all([
    investorIds.length ? supabase.from('investors').select('id, legal_name').in('id', investorIds) : { data: [] },
    arrangerIds.length ? supabase.from('arranger_entities').select('id, legal_name').in('id', arrangerIds) : { data: [] },
    partnerIds.length ? supabase.from('partners').select('id, name').in('id', partnerIds) : { data: [] },
    introducerIds.length ? supabase.from('introducers').select('id, legal_name').in('id', introducerIds) : { data: [] },
    lawyerIds.length ? supabase.from('lawyers').select('id, firm_name').in('id', lawyerIds) : { data: [] },
    cpIds.length ? supabase.from('commercial_partners').select('id, name').in('id', cpIds) : { data: [] },
    investorMemberIds.length ? supabase.from('investor_members').select('id, full_name, first_name, last_name').in('id', investorMemberIds) : { data: [] },
    arrangerMemberIds.length ? supabase.from('arranger_members').select('id, full_name, first_name, last_name').in('id', arrangerMemberIds) : { data: [] },
    partnerMemberIds.length ? supabase.from('partner_members').select('id, full_name, first_name, last_name').in('id', partnerMemberIds) : { data: [] },
    introducerMemberIds.length ? supabase.from('introducer_members').select('id, full_name, first_name, last_name').in('id', introducerMemberIds) : { data: [] },
    lawyerMemberIds.length ? supabase.from('lawyer_members').select('id, full_name, first_name, last_name').in('id', lawyerMemberIds) : { data: [] },
    cpMemberIds.length ? supabase.from('commercial_partner_members').select('id, full_name, first_name, last_name').in('id', cpMemberIds) : { data: [] },
  ])

  // Build lookup maps: id → name
  const toMap = <T extends { id: string }>(rows: T[] | null, nameKey: keyof T): Map<string, string> => {
    const m = new Map<string, string>()
    for (const row of rows || []) m.set(row.id, String(row[nameKey] || ''))
    return m
  }

  const investorNames = toMap(investors.data as any[], 'legal_name')
  const arrangerNames = toMap(arrangers.data as any[], 'legal_name')
  const partnerNames = toMap(partners.data as any[], 'name')
  const introducerNames = toMap(introducers.data as any[], 'legal_name')
  const lawyerNames = toMap(lawyers.data as any[], 'firm_name')
  const cpNames = toMap(cps.data as any[], 'name')

  const memberNameMap = new Map<string, string | null>()
  for (const rows of [investorMembers, arrangerMembers, partnerMembers, introducerMembers, lawyerMembers, cpMembers]) {
    for (const m of (rows.data as any[]) || []) {
      memberNameMap.set(m.id, resolveMemberName(m))
    }
  }

  // Map each document to its entity info
  const result = new Map<string, EntityInfo>()
  for (const doc of docs) {
    if (result.has(doc.id)) continue // dedup for docs appearing in both result sets

    let info: EntityInfo
    if (doc.owner_investor_id) {
      info = { type: 'investor', id: doc.owner_investor_id, name: investorNames.get(doc.owner_investor_id) || 'Unknown Investor', memberId: doc.investor_member_id, memberName: memberNameMap.get(doc.investor_member_id) ?? null }
    } else if (doc.arranger_entity_id) {
      info = { type: 'arranger', id: doc.arranger_entity_id, name: arrangerNames.get(doc.arranger_entity_id) || 'Unknown Arranger', memberId: doc.arranger_member_id, memberName: memberNameMap.get(doc.arranger_member_id) ?? null }
    } else if (doc.partner_id) {
      info = { type: 'partner', id: doc.partner_id, name: partnerNames.get(doc.partner_id) || 'Unknown Partner', memberId: doc.partner_member_id, memberName: memberNameMap.get(doc.partner_member_id) ?? null }
    } else if (doc.introducer_id) {
      info = { type: 'introducer', id: doc.introducer_id, name: introducerNames.get(doc.introducer_id) || 'Unknown Introducer', memberId: doc.introducer_member_id, memberName: memberNameMap.get(doc.introducer_member_id) ?? null }
    } else if (doc.lawyer_id) {
      info = { type: 'lawyer', id: doc.lawyer_id, name: lawyerNames.get(doc.lawyer_id) || 'Unknown Lawyer', memberId: doc.lawyer_member_id, memberName: memberNameMap.get(doc.lawyer_member_id) ?? null }
    } else if (doc.commercial_partner_id) {
      info = { type: 'commercial_partner', id: doc.commercial_partner_id, name: cpNames.get(doc.commercial_partner_id) || 'Unknown Commercial Partner', memberId: doc.commercial_partner_member_id, memberName: memberNameMap.get(doc.commercial_partner_member_id) ?? null }
    } else {
      info = { type: 'unknown', id: '', name: 'Unknown Entity', memberId: null, memberName: null }
    }
    result.set(doc.id, info)
  }

  return result
}

// Helper to get date X days from now (negative for past)
function getDateInDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}
