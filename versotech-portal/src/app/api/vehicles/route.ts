import { createClient, createServiceClient } from '@/lib/supabase/server'
import { logBlacklistMatches, screenAgainstBlacklist } from '@/lib/compliance/blacklist'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/vehicles
 * Creates a new vehicle with all associated fields including
 * arranger, lawyer, and managing partner assignments.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Vehicle name is required' }, { status: 400 })
    }
    if (!body.domicile?.trim()) {
      return NextResponse.json({ error: 'Domicile is required' }, { status: 400 })
    }

    // Prepare the vehicle data
    const vehicleData = {
      name: body.name.trim(),
      entity_code: body.entity_code || null,
      platform: body.platform || null,
      investment_name: body.investment_name || null,
      former_entity: body.former_entity || null,
      type: body.type || 'fund',
      status: body.status || 'LIVE',
      domicile: body.domicile.trim(),
      currency: body.currency || 'USD',
      formation_date: body.formation_date || null,
      legal_jurisdiction: body.legal_jurisdiction || null,
      registration_number: body.registration_number || null,
      reporting_type: body.reporting_type || 'Not Required',
      requires_reporting: body.requires_reporting || false,
      notes: body.notes || null,
      logo_url: body.logo_url || null,
      website_url: body.website_url || null,
      address: body.address || null,
      arranger_entity_id: body.arranger_entity_id || null,
      lawyer_id: body.lawyer_id || null,
      managing_partner_id: body.managing_partner_id || null
    }

    // Insert the vehicle
    const serviceSupabase = createServiceClient()
    const { data: vehicle, error: insertError } = await serviceSupabase
      .from('vehicles')
      .insert(vehicleData)
      .select()
      .single()

    if (insertError) {
      console.error('[POST /api/vehicles] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create vehicle', details: insertError.message },
        { status: 500 }
      )
    }

    // Screen entity against blacklist (alert only, do not block)
    try {
      const matches = await screenAgainstBlacklist(serviceSupabase, {
        entityName: vehicle.name,
        taxId: vehicle.registration_number
      })

      await logBlacklistMatches({
        supabase: serviceSupabase,
        matches,
        context: 'entity_create',
        input: {
          entityName: vehicle.name,
          taxId: vehicle.registration_number
        },
        subjectLabel: vehicle.name,
        matchedUserId: user.id,
        actorId: user.id,
        actionLabel: 'alerted_on_entity_create'
      })
    } catch (error) {
      console.error('[entity blacklist] Screening failed:', error)
    }

    return NextResponse.json({ vehicle }, { status: 201 })

  } catch (error) {
    console.error('[POST /api/vehicles] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const includeRelated = searchParams.get('related') === 'true'

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // If not requesting related data, return simple list
    if (!includeRelated) {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('id, name, type, currency, status')
        .order('name', { ascending: true })

      if (error) {
        console.error('Vehicles fetch error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch vehicles' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        vehicles: vehicles || []
      })
    }

    // Get investor IDs for this user
    const serviceSupabase = createServiceClient()
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({
        vehicles: []
      })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Fetch vehicles with related positions, subscriptions, and valuations
    // We use LEFT JOIN to get all related data, then filter in JavaScript
    // This is more efficient than complex database filtering for this use case
    const { data: vehicles, error } = await serviceSupabase
      .from('vehicles')
      .select(`
        id,
        name,
        type,
        domicile,
        currency,
        created_at,
        status,
        logo_url,
        website_url,
        investment_name,
        positions!left (
          id,
          investor_id,
          units,
          cost_basis,
          last_nav,
          as_of_date
        ),
        subscriptions!left (
          id,
          investor_id,
          commitment,
          currency,
          status,
          effective_date,
          funding_due_at,
          units,
          funded_amount,
          current_nav
        ),
        valuations!left (
          id,
          nav_total,
          nav_per_unit,
          as_of_date
        )
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Vehicles with related data fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vehicles with related data', details: error.message },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transformedVehicles = (vehicles || []).map((vehicle: any) => {
      // Filter positions and subscriptions for this investor
      const investorPositions = (vehicle.positions || []).filter((p: any) =>
        investorIds.includes(p.investor_id)
      )
      const investorSubscriptions = (vehicle.subscriptions || []).filter((s: any) =>
        investorIds.includes(s.investor_id)
      )

      // Get the most recent valuation
      const sortedValuations = (vehicle.valuations || []).sort((a: any, b: any) =>
        new Date(b.as_of_date).getTime() - new Date(a.as_of_date).getTime()
      )
      const latestValuation = sortedValuations[0] || null

      // Get primary position and subscription
      const position = investorPositions[0] || null
      const subscription = investorSubscriptions[0] || null

      // Calculate derived values
      let positionData = null
      if (position) {
        const units = parseFloat(position.units || 0)
        const costBasis = parseFloat(position.cost_basis || 0)

        // PRIORITY: position.last_nav FIRST (even if 0), then valuations
        const posLastNav = position.last_nav !== null && position.last_nav !== undefined
          ? parseFloat(position.last_nav) : null
        const valNav = latestValuation?.nav_per_unit ? parseFloat(latestValuation.nav_per_unit) : null
        const navPerUnit = posLastNav !== null ? posLastNav : (valNav ?? 0)

        // Calculate - use NAV if available, else cost basis
        const hasNav = posLastNav !== null || valNav !== null
        const currentValue = hasNav ? units * navPerUnit : costBasis
        const unrealizedGain = currentValue - costBasis
        const unrealizedGainPct = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0

        positionData = {
          units,
          costBasis,
          currentValue,
          unrealizedGain,
          unrealizedGainPct,
          lastUpdated: position.as_of_date || latestValuation?.as_of_date || null
        }
      }

      let subscriptionData = null
      if (subscription) {
        subscriptionData = {
          id: subscription.id,  // Include subscription ID for sell requests
          commitment: subscription.commitment ? parseFloat(subscription.commitment) : null,
          currency: subscription.currency || vehicle.currency,
          status: subscription.status || 'pending',
          effective_date: subscription.effective_date || null,
          funding_due_at: subscription.funding_due_at || null,
          units: subscription.units ? parseFloat(subscription.units) : null,
          funded_amount: subscription.funded_amount ? parseFloat(subscription.funded_amount) : null,
          current_nav: subscription.current_nav ? parseFloat(subscription.current_nav) : null
        }
      }

      let valuationData = null
      if (latestValuation) {
        valuationData = {
          navTotal: latestValuation.nav_total ? parseFloat(latestValuation.nav_total) : 0,
          navPerUnit: latestValuation.nav_per_unit ? parseFloat(latestValuation.nav_per_unit) : 0,
          asOfDate: latestValuation.as_of_date
        }
      }

      return {
        id: vehicle.id,
        name: vehicle.name,
        type: vehicle.type,
        domicile: vehicle.domicile,
        currency: vehicle.currency,
        created_at: vehicle.created_at,
        status: vehicle.status,
        logo_url: vehicle.logo_url,
        website_url: vehicle.website_url,
        investment_name: vehicle.investment_name,
        position: positionData,
        subscription: subscriptionData,
        valuation: valuationData,
        performance: positionData ? {
          unrealizedGainPct: positionData.unrealizedGainPct
        } : null
      }
    })

    // Filter out vehicles with no position or subscription
    const filteredVehicles = transformedVehicles.filter((v: any) =>
      v.position !== null || v.subscription !== null
    )

    // Fetch documents for each holding (NDA, Subscription Pack, Certificate)
    // Documents are linked via subscription_id OR (owner_investor_id + vehicle_id)
    const vehicleIds = filteredVehicles.map((v: any) => v.id)
    const subscriptionIds = filteredVehicles
      .filter((v: any) => v.subscription)
      .map((v: any) => {
        // Get the subscription ID from the original vehicle data
        const vehicle = vehicles?.find((veh: any) => veh.id === v.id)
        const investorSubs = (vehicle?.subscriptions || []).filter((s: any) =>
          investorIds.includes(s.investor_id)
        )
        return investorSubs[0]?.id
      })
      .filter(Boolean)

    // Fetch documents
    const { data: documents } = await serviceSupabase
      .from('documents')
      .select('id, name, type, file_key, subscription_id, owner_investor_id, vehicle_id, created_at')
      .or(`subscription_id.in.(${subscriptionIds.join(',')}),and(owner_investor_id.in.(${investorIds.join(',')}),vehicle_id.in.(${vehicleIds.join(',')}))`)
      .in('type', ['nda', 'subscription_pack', 'subscription_draft', 'certificate'])
      .order('created_at', { ascending: false })

    // Map documents to vehicles
    const vehiclesWithDocs = filteredVehicles.map((v: any) => {
      // Find documents for this vehicle
      const vehicleDocs = (documents || []).filter((doc: any) => {
        // Match by subscription_id
        if (doc.subscription_id && subscriptionIds.includes(doc.subscription_id)) {
          const vehicle = vehicles?.find((veh: any) => veh.id === v.id)
          const investorSubs = (vehicle?.subscriptions || []).filter((s: any) =>
            investorIds.includes(s.investor_id)
          )
          return investorSubs.some((s: any) => s.id === doc.subscription_id)
        }
        // Match by owner_investor_id + vehicle_id (for NDAs)
        if (doc.owner_investor_id && doc.vehicle_id === v.id) {
          return investorIds.includes(doc.owner_investor_id)
        }
        return false
      })

      // Group documents by type (take most recent of each type)
      const docsByType: Record<string, any> = {}
      vehicleDocs.forEach((doc: any) => {
        const docType = doc.type === 'subscription_draft' ? 'subscription_pack' : doc.type
        if (!docsByType[docType]) {
          docsByType[docType] = {
            id: doc.id,
            name: doc.name,
            type: docType,
            file_key: doc.file_key,
            created_at: doc.created_at
          }
        }
      })

      return {
        ...v,
        documents: {
          nda: docsByType['nda'] || null,
          subscription_pack: docsByType['subscription_pack'] || null,
          certificate: docsByType['certificate'] || null
        }
      }
    })

    return NextResponse.json({
      vehicles: vehiclesWithDocs
    })

  } catch (error) {
    console.error('API /vehicles error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
