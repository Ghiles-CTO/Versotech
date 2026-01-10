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

    // Enrich expiry documents with entity info
    const enrichedExpiryDocs: ExpiringDocument[] = await Promise.all(
      (expiryResult.data || []).map(async (doc) => {
        const entityInfo = await getEntityInfo(serviceClient, doc)
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
    )

    // Enrich stale documents with entity info
    const enrichedStaleDocs: ExpiringDocument[] = await Promise.all(
      (staleResult.data || []).map(async (doc) => {
        const entityInfo = await getEntityInfo(serviceClient, doc)
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
    )

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

// Helper to get entity info from document
async function getEntityInfo(
  supabase: ReturnType<typeof createServiceClient>,
  doc: any
): Promise<{ type: string; id: string; name: string; memberId: string | null; memberName: string | null }> {
  // Determine entity type and ID
  if (doc.owner_investor_id) {
    const { data: investor } = await supabase
      .from('investors')
      .select('legal_name')
      .eq('id', doc.owner_investor_id)
      .single()

    let memberName = null
    if (doc.investor_member_id) {
      const { data: member } = await supabase
        .from('investor_members')
        .select('full_name, first_name, last_name')
        .eq('id', doc.investor_member_id)
        .single()
      memberName = member?.full_name || `${member?.first_name || ''} ${member?.last_name || ''}`.trim()
    }

    return {
      type: 'investor',
      id: doc.owner_investor_id,
      name: investor?.legal_name || 'Unknown Investor',
      memberId: doc.investor_member_id,
      memberName,
    }
  }

  if (doc.arranger_entity_id) {
    const { data: arranger } = await supabase
      .from('arranger_entities')
      .select('legal_name')
      .eq('id', doc.arranger_entity_id)
      .single()

    let memberName = null
    if (doc.arranger_member_id) {
      const { data: member } = await supabase
        .from('arranger_members')
        .select('full_name, first_name, last_name')
        .eq('id', doc.arranger_member_id)
        .single()
      memberName = member?.full_name || `${member?.first_name || ''} ${member?.last_name || ''}`.trim()
    }

    return {
      type: 'arranger',
      id: doc.arranger_entity_id,
      name: arranger?.legal_name || 'Unknown Arranger',
      memberId: doc.arranger_member_id,
      memberName,
    }
  }

  if (doc.partner_id) {
    const { data: partner } = await supabase
      .from('partners')
      .select('name')
      .eq('id', doc.partner_id)
      .single()

    let memberName = null
    if (doc.partner_member_id) {
      const { data: member } = await supabase
        .from('partner_members')
        .select('full_name, first_name, last_name')
        .eq('id', doc.partner_member_id)
        .single()
      memberName = member?.full_name || `${member?.first_name || ''} ${member?.last_name || ''}`.trim()
    }

    return {
      type: 'partner',
      id: doc.partner_id,
      name: partner?.name || 'Unknown Partner',
      memberId: doc.partner_member_id,
      memberName,
    }
  }

  if (doc.introducer_id) {
    const { data: introducer } = await supabase
      .from('introducers')
      .select('legal_name')
      .eq('id', doc.introducer_id)
      .single()

    let memberName = null
    if (doc.introducer_member_id) {
      const { data: member } = await supabase
        .from('introducer_members')
        .select('full_name, first_name, last_name')
        .eq('id', doc.introducer_member_id)
        .single()
      memberName = member?.full_name || `${member?.first_name || ''} ${member?.last_name || ''}`.trim()
    }

    return {
      type: 'introducer',
      id: doc.introducer_id,
      name: introducer?.legal_name || 'Unknown Introducer',
      memberId: doc.introducer_member_id,
      memberName,
    }
  }

  if (doc.lawyer_id) {
    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('firm_name')
      .eq('id', doc.lawyer_id)
      .single()

    let memberName = null
    if (doc.lawyer_member_id) {
      const { data: member } = await supabase
        .from('lawyer_members')
        .select('full_name, first_name, last_name')
        .eq('id', doc.lawyer_member_id)
        .single()
      memberName = member?.full_name || `${member?.first_name || ''} ${member?.last_name || ''}`.trim()
    }

    return {
      type: 'lawyer',
      id: doc.lawyer_id,
      name: lawyer?.firm_name || 'Unknown Lawyer',
      memberId: doc.lawyer_member_id,
      memberName,
    }
  }

  if (doc.commercial_partner_id) {
    const { data: cp } = await supabase
      .from('commercial_partners')
      .select('name')
      .eq('id', doc.commercial_partner_id)
      .single()

    let memberName = null
    if (doc.commercial_partner_member_id) {
      const { data: member } = await supabase
        .from('commercial_partner_members')
        .select('full_name, first_name, last_name')
        .eq('id', doc.commercial_partner_member_id)
        .single()
      memberName = member?.full_name || `${member?.first_name || ''} ${member?.last_name || ''}`.trim()
    }

    return {
      type: 'commercial_partner',
      id: doc.commercial_partner_id,
      name: cp?.name || 'Unknown Commercial Partner',
      memberId: doc.commercial_partner_member_id,
      memberName,
    }
  }

  return {
    type: 'unknown',
    id: '',
    name: 'Unknown Entity',
    memberId: null,
    memberName: null,
  }
}

// Helper to get date X days from now (negative for past)
function getDateInDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}
