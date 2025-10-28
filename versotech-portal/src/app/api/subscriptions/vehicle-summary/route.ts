import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireStaffAuth()
    const supabase = await createClient()

    // Fetch all subscriptions with vehicle data
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        vehicle:vehicles (
          id,
          name,
          type,
          entity_code,
          status
        ),
        investor:investors (
          id,
          legal_name
        )
      `)

    if (error) {
      console.error('Failed to fetch subscriptions for vehicle summary:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscription data', details: error.message },
        { status: 500 }
      )
    }

    // Group by vehicle and aggregate
    const vehicleMap = new Map<string, any>()

    subscriptions?.forEach((sub: any) => {
      if (!sub.vehicle_id || !sub.vehicle) return

      const vehicleId = sub.vehicle_id

      if (!vehicleMap.has(vehicleId)) {
        vehicleMap.set(vehicleId, {
          vehicle_id: vehicleId,
          vehicle_name: sub.vehicle.name,
          vehicle_type: sub.vehicle.type,
          vehicle_code: sub.vehicle.entity_code,
          vehicle_status: sub.vehicle.status,

          // Aggregated financial data
          total_commitment: 0,
          total_funded: 0,
          total_outstanding: 0,
          total_nav: 0,
          total_units: 0,
          total_shares: 0,
          total_capital_calls: 0,
          total_distributions: 0,

          // Fee totals
          total_spread_fees: 0,
          total_subscription_fees: 0,
          total_bd_fees: 0,
          total_finra_fees: 0,

          // Counts
          subscription_count: 0,
          investor_count: 0,
          unique_investors: new Set(),

          // Status breakdown
          status_pending: 0,
          status_committed: 0,
          status_active: 0,
          status_closed: 0,
          status_cancelled: 0,

          // Currency breakdown
          currencies: {} as Record<string, number>,

          // Date tracking
          earliest_subscription: null as string | null,
          latest_subscription: null as string | null,

          // Performance tracking
          has_performance_fees: false,
          avg_commitment: 0,
          moic: 0,
        })
      }

      const vehicle = vehicleMap.get(vehicleId)!

      // Aggregate financials
      vehicle.total_commitment += Number(sub.commitment) || 0
      vehicle.total_funded += Number(sub.funded_amount) || 0
      vehicle.total_outstanding += Number(sub.outstanding_amount) || 0
      vehicle.total_nav += Number(sub.current_nav) || 0
      vehicle.total_units += Number(sub.units) || 0
      vehicle.total_shares += Number(sub.num_shares) || 0
      vehicle.total_capital_calls += Number(sub.capital_calls_total) || 0
      vehicle.total_distributions += Number(sub.distributions_total) || 0

      // Aggregate fees
      vehicle.total_spread_fees += Number(sub.spread_fee_amount) || 0
      vehicle.total_subscription_fees += Number(sub.subscription_fee_amount) || 0
      vehicle.total_bd_fees += Number(sub.bd_fee_amount) || 0
      vehicle.total_finra_fees += Number(sub.finra_fee_amount) || 0

      // Count subscriptions and investors
      vehicle.subscription_count++
      if (sub.investor_id) {
        vehicle.unique_investors.add(sub.investor_id)
      }

      // Status breakdown
      if (sub.status === 'pending') vehicle.status_pending++
      else if (sub.status === 'committed') vehicle.status_committed++
      else if (sub.status === 'active') vehicle.status_active++
      else if (sub.status === 'closed') vehicle.status_closed++
      else if (sub.status === 'cancelled') vehicle.status_cancelled++

      // Currency tracking
      if (sub.currency) {
        vehicle.currencies[sub.currency] = (vehicle.currencies[sub.currency] || 0) + (Number(sub.commitment) || 0)
      }

      // Date tracking
      if (sub.committed_at) {
        if (!vehicle.earliest_subscription || sub.committed_at < vehicle.earliest_subscription) {
          vehicle.earliest_subscription = sub.committed_at
        }
        if (!vehicle.latest_subscription || sub.committed_at > vehicle.latest_subscription) {
          vehicle.latest_subscription = sub.committed_at
        }
      }

      // Performance fees tracking
      if (sub.performance_fee_tier1_percent || sub.performance_fee_tier2_percent) {
        vehicle.has_performance_fees = true
      }
    })

    // Calculate derived metrics and convert Set to count
    const vehicleSummaries = Array.from(vehicleMap.values()).map(vehicle => {
      vehicle.investor_count = vehicle.unique_investors.size
      delete vehicle.unique_investors // Remove Set from response

      vehicle.avg_commitment = vehicle.subscription_count > 0
        ? vehicle.total_commitment / vehicle.subscription_count
        : 0

      vehicle.moic = vehicle.total_commitment > 0
        ? (vehicle.total_nav + vehicle.total_distributions) / vehicle.total_commitment
        : 0

      vehicle.funding_rate = vehicle.total_commitment > 0
        ? (vehicle.total_funded / vehicle.total_commitment) * 100
        : 0

      return vehicle
    })

    // Sort by total commitment descending
    vehicleSummaries.sort((a, b) => b.total_commitment - a.total_commitment)

    return NextResponse.json({
      summaries: vehicleSummaries,
      total_vehicles: vehicleSummaries.length,
      grand_totals: {
        total_commitment: vehicleSummaries.reduce((sum, v) => sum + v.total_commitment, 0),
        total_funded: vehicleSummaries.reduce((sum, v) => sum + v.total_funded, 0),
        total_outstanding: vehicleSummaries.reduce((sum, v) => sum + v.total_outstanding, 0),
        total_nav: vehicleSummaries.reduce((sum, v) => sum + v.total_nav, 0),
        total_subscriptions: vehicleSummaries.reduce((sum, v) => sum + v.subscription_count, 0),
      }
    })
  } catch (error) {
    console.error('Vehicle summary API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate vehicle summary' },
      { status: 500 }
    )
  }
}
