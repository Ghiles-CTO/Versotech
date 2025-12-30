import { createSmartClient } from '@/lib/supabase/smart-client'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSmartClient()

    // Authenticate user (works with both demo and real auth)
    const { user, error: authError } = await getAuthenticatedUser(supabase)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const vehicle_id = searchParams.get('vehicle_id')
    const entity_id = searchParams.get('entity_id')
    const deal_id = searchParams.get('deal_id')
    const arranger_entity_id = searchParams.get('arranger_entity_id')
    const introducer_id = searchParams.get('introducer_id')
    const owner_investor_id = searchParams.get('owner_investor_id')
    const lawyer_id = searchParams.get('lawyer_id')
    const partner_id = searchParams.get('partner_id')
    const commercial_partner_id = searchParams.get('commercial_partner_id')
    const from_date = searchParams.get('from_date')
    const to_date = searchParams.get('to_date')
    const search = searchParams.get('search')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build base query with RLS enforcement
    let query = supabase
      .from('documents')
      .select(`
        id,
        name,
        type,
        file_key,
        created_at,
        description,
        external_url,
        link_type,
        watermark,
        vehicle_id,
        entity_id,
        deal_id,
        arranger_entity_id,
        introducer_id,
        owner_investor_id,
        lawyer_id,
        partner_id,
        commercial_partner_id,
        folder_id,
        created_by_profile:created_by(display_name, email),
        investors:owner_investor_id(id, legal_name),
        vehicles:vehicle_id(id, name, type),
        entity:entity_id(id, name, type),
        deals:deal_id(id, name, status),
        arranger_entity:arranger_entity_id(id, legal_name),
        introducer:introducer_id(id, legal_name),
        lawyer:lawyer_id(id, firm_name),
        partner:partner_id(id, name),
        commercial_partner:commercial_partner_id(id, name)
      `, { count: 'exact' })

    // Apply filters
    if (type) query = query.eq('type', type)
    if (vehicle_id) query = query.eq('vehicle_id', vehicle_id)
    if (entity_id) query = query.eq('entity_id', entity_id)
    if (deal_id) query = query.eq('deal_id', deal_id)
    if (arranger_entity_id) query = query.eq('arranger_entity_id', arranger_entity_id)
    if (introducer_id) query = query.eq('introducer_id', introducer_id)
    if (owner_investor_id) query = query.eq('owner_investor_id', owner_investor_id)
    if (lawyer_id) query = query.eq('lawyer_id', lawyer_id)
    if (partner_id) query = query.eq('partner_id', partner_id)
    if (commercial_partner_id) query = query.eq('commercial_partner_id', commercial_partner_id)
    if (from_date) query = query.gte('created_at', from_date)
    if (to_date) query = query.lte('created_at', to_date)
    if (search) {
      const pattern = `%${search}%`
      query = query.or(`file_key.ilike.${pattern},name.ilike.${pattern}`)
    }

    // Apply ordering and pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Execute query
    const { data: documents, error: queryError, count } = await query

    if (queryError) {
      console.error('Documents query error:', queryError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    // Extract file names and calculate file sizes
    const enrichedDocuments = (documents || []).map((doc: any) => {
      const fileName = doc.file_key
        ? doc.file_key.split('/').pop()
        : doc.name || 'External Link'

      // Determine document scope
      const scope: any = {}
      if (doc.investors) scope.investor = doc.investors
      if (doc.vehicles) scope.vehicle = doc.vehicles
      if (doc.entity) scope.entity = doc.entity
      if (doc.deals) scope.deal = doc.deals
      if (doc.arranger_entity) scope.arranger_entity = doc.arranger_entity
      if (doc.introducer) scope.introducer = doc.introducer
      if (doc.lawyer) scope.lawyer = doc.lawyer
      if (doc.partner) scope.partner = doc.partner
      if (doc.commercial_partner) scope.commercial_partner = doc.commercial_partner

      return {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        description: doc.description,
        file_name: fileName,
        file_key: doc.file_key,
        external_url: doc.external_url,
        link_type: doc.link_type,
        created_at: doc.created_at,
        created_by: doc.created_by_profile,
        scope,
        folder_id: doc.folder_id,
        watermark: doc.watermark
      }
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / limit)
    const hasMore = offset + limit < (count || 0)

    return NextResponse.json({
      documents: enrichedDocuments,
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: hasMore,
        current_page: Math.floor(offset / limit) + 1,
        total_pages: totalPages
      },
      filters_applied: {
        type: type || undefined,
        vehicle_id: vehicle_id || undefined,
        entity_id: entity_id || undefined,
        deal_id: deal_id || undefined,
        arranger_entity_id: arranger_entity_id || undefined,
        introducer_id: introducer_id || undefined,
        owner_investor_id: owner_investor_id || undefined,
        lawyer_id: lawyer_id || undefined,
        partner_id: partner_id || undefined,
        commercial_partner_id: commercial_partner_id || undefined,
        date_range: from_date || to_date ? {
          from: from_date || undefined,
          to: to_date || undefined
        } : undefined,
        search: search || undefined
      }
    })

  } catch (error) {
    console.error('Documents API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
