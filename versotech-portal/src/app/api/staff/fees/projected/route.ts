/**
 * Projected Fees API Route
 * GET /api/staff/fees/projected - Calculate projected annual fees from active subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch ALL subscriptions with ALL fee fields
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(
        `
        id,
        commitment,
        current_nav,
        status,
        vehicle_id,
        subscription_fee_percent,
        subscription_fee_amount,
        spread_fee_amount,
        bd_fee_percent,
        bd_fee_amount,
        finra_fee_amount,
        performance_fee_tier1_percent,
        performance_fee_tier1_threshold,
        performance_fee_tier2_percent,
        performance_fee_tier2_threshold,
        price_per_share,
        cost_per_share,
        num_shares,
        spread_per_share,
        investor:investors(id, display_name)
      `
      );

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    // Fetch active fee schedules with their components
    const { data: feeSchedules, error: schedError } = await supabase
      .from('fee_schedules')
      .select(
        `
        id,
        investor_id,
        fee_component_id,
        start_date,
        end_date,
        status,
        fee_components(
          id,
          kind,
          rate_bps,
          flat_amount,
          frequency
        )
      `
      )
      .eq('status', 'active');

    if (schedError) {
      console.error('Error fetching fee schedules:', schedError);
    }

    // Fetch vehicles
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id, name');

    const vehiclesMap = new Map(vehicles?.map((v) => [v.id, v]) || []);

    // Fee totals by type
    let totalSubscriptionFees = 0;
    let totalSpreadFees = 0;
    let totalBDFees = 0;
    let totalFINRAFees = 0;
    let totalPerformanceFees = 0;
    let totalAllFees = 0;
    let totalCommittedCapital = 0;
    let totalCurrentNAV = 0;
    const totalSubscriptions = subscriptions?.length || 0;
    let totalUnrealizedGains = 0;

    // Fee breakdown by type
    interface FeeBreakdown {
      subscription_fees: number;
      spread_fees: number;
      bd_fees: number;
      finra_fees: number;
      performance_fees: number;
      total_fees: number;
      unrealized_gains: number;
    }

    // Group by status
    const statusGroups = new Map<string, FeeBreakdown & {
      committed_capital: number;
      current_nav: number;
      subscription_count: number;
    }>();

    // Group by vehicle
    interface VehicleGroup {
      vehicle_id: string;
      vehicle_name: string;
      fees: FeeBreakdown;
      committed_capital: number;
      current_nav: number;
      subscription_count: number;
      by_status: Map<string, FeeBreakdown & {
        committed_capital: number;
        current_nav: number;
        subscription_count: number;
      }>;
    }

    const vehicleGroups = new Map<string, VehicleGroup>();

    // Process each subscription
    for (const sub of subscriptions || []) {
      const commitment = sub.commitment || 0;
      const nav = sub.current_nav || 0;
      const status = sub.status || 'unknown';
      const vehicleId = sub.vehicle_id;

      // Calculate all fee types

      // 1. Subscription Fee (can be percent or fixed amount)
      let subscriptionFee = 0;
      if (sub.subscription_fee_amount) {
        subscriptionFee = sub.subscription_fee_amount;
      } else if (sub.subscription_fee_percent) {
        subscriptionFee = commitment * (sub.subscription_fee_percent / 100);
      }

      // 2. Spread Fee (fixed amount)
      const spreadFee = sub.spread_fee_amount || 0;

      // 3. BD Fee (can be percent or fixed amount)
      let bdFee = 0;
      if (sub.bd_fee_amount) {
        bdFee = sub.bd_fee_amount;
      } else if (sub.bd_fee_percent) {
        bdFee = commitment * (sub.bd_fee_percent / 100);
      }

      // 4. FINRA Fee (fixed amount)
      const finraFee = sub.finra_fee_amount || 0;

      // 5. Performance Fee (tiered based on returns)
      let performanceFee = 0;
      if (nav > 0 && commitment > 0) {
        const returns = nav - commitment;
        if (returns > 0) {
          const tier1Threshold = sub.performance_fee_tier1_threshold || 0;
          const tier2Threshold = sub.performance_fee_tier2_threshold || 0;
          const tier1Percent = sub.performance_fee_tier1_percent || 0;
          const tier2Percent = sub.performance_fee_tier2_percent || 0;

          if (tier2Percent > 0 && returns > tier2Threshold) {
            performanceFee = returns * (tier2Percent / 100);
          } else if (tier1Percent > 0 && returns > tier1Threshold) {
            performanceFee = returns * (tier1Percent / 100);
          }
        }
      }

      // 6. Unrealized Gains (price_per_share - cost_per_share) × num_shares
      let unrealizedGain = 0;
      const pricePerShare = sub.price_per_share || 0;
      const costPerShare = sub.cost_per_share || 0;
      const numShares = sub.num_shares || 0;

      if (numShares > 0 && (pricePerShare > 0 || costPerShare > 0)) {
        unrealizedGain = (pricePerShare - costPerShare) * numShares;
      }

      const totalFees = subscriptionFee + spreadFee + bdFee + finraFee + performanceFee;

      // Update grand totals
      totalSubscriptionFees += subscriptionFee;
      totalSpreadFees += spreadFee;
      totalBDFees += bdFee;
      totalFINRAFees += finraFee;
      totalPerformanceFees += performanceFee;
      totalAllFees += totalFees;
      totalCommittedCapital += commitment;
      totalCurrentNAV += nav;
      totalUnrealizedGains += unrealizedGain;

      // Update status groups
      if (!statusGroups.has(status)) {
        statusGroups.set(status, {
          subscription_fees: 0,
          spread_fees: 0,
          bd_fees: 0,
          finra_fees: 0,
          performance_fees: 0,
          total_fees: 0,
          unrealized_gains: 0,
          committed_capital: 0,
          current_nav: 0,
          subscription_count: 0,
        });
      }
      const statusGroup = statusGroups.get(status)!;
      statusGroup.subscription_fees += subscriptionFee;
      statusGroup.spread_fees += spreadFee;
      statusGroup.bd_fees += bdFee;
      statusGroup.finra_fees += finraFee;
      statusGroup.performance_fees += performanceFee;
      statusGroup.total_fees += totalFees;
      statusGroup.unrealized_gains += unrealizedGain;
      statusGroup.committed_capital += commitment;
      statusGroup.current_nav += nav;
      statusGroup.subscription_count += 1;

      // Update vehicle groups
      const vehicle = vehiclesMap.get(vehicleId);
      const vehicleName = vehicle?.name || 'Unknown Vehicle';

      if (!vehicleGroups.has(vehicleId)) {
        vehicleGroups.set(vehicleId, {
          vehicle_id: vehicleId,
          vehicle_name: vehicleName,
          fees: {
            subscription_fees: 0,
            spread_fees: 0,
            bd_fees: 0,
            finra_fees: 0,
            performance_fees: 0,
            total_fees: 0,
            unrealized_gains: 0,
          },
          committed_capital: 0,
          current_nav: 0,
          subscription_count: 0,
          by_status: new Map(),
        });
      }

      const vehicleGroup = vehicleGroups.get(vehicleId)!;
      vehicleGroup.fees.subscription_fees += subscriptionFee;
      vehicleGroup.fees.spread_fees += spreadFee;
      vehicleGroup.fees.bd_fees += bdFee;
      vehicleGroup.fees.finra_fees += finraFee;
      vehicleGroup.fees.performance_fees += performanceFee;
      vehicleGroup.fees.total_fees += totalFees;
      vehicleGroup.fees.unrealized_gains += unrealizedGain;
      vehicleGroup.committed_capital += commitment;
      vehicleGroup.current_nav += nav;
      vehicleGroup.subscription_count += 1;

      // Update status within vehicle
      if (!vehicleGroup.by_status.has(status)) {
        vehicleGroup.by_status.set(status, {
          subscription_fees: 0,
          spread_fees: 0,
          bd_fees: 0,
          finra_fees: 0,
          performance_fees: 0,
          total_fees: 0,
          unrealized_gains: 0,
          committed_capital: 0,
          current_nav: 0,
          subscription_count: 0,
        });
      }
      const vehicleStatus = vehicleGroup.by_status.get(status)!;
      vehicleStatus.subscription_fees += subscriptionFee;
      vehicleStatus.spread_fees += spreadFee;
      vehicleStatus.bd_fees += bdFee;
      vehicleStatus.finra_fees += finraFee;
      vehicleStatus.performance_fees += performanceFee;
      vehicleStatus.total_fees += totalFees;
      vehicleStatus.unrealized_gains += unrealizedGain;
      vehicleStatus.committed_capital += commitment;
      vehicleStatus.current_nav += nav;
      vehicleStatus.subscription_count += 1;
    }

    // Convert to arrays
    const byStatus = Array.from(statusGroups.entries())
      .map(([status, data]) => ({
        status,
        ...data,
      }))
      .sort((a, b) => b.total_fees - a.total_fees);

    const byVehicle = Array.from(vehicleGroups.values())
      .map((vehicle) => ({
        vehicle_id: vehicle.vehicle_id,
        vehicle_name: vehicle.vehicle_name,
        fees: vehicle.fees,
        committed_capital: vehicle.committed_capital,
        current_nav: vehicle.current_nav,
        subscription_count: vehicle.subscription_count,
        by_status: Array.from(vehicle.by_status.entries()).map(([status, data]) => ({
          status,
          ...data,
        })),
      }))
      .sort((a, b) => b.fees.total_fees - a.fees.total_fees);

    return NextResponse.json({
      data: {
        totals: {
          subscription_fees: totalSubscriptionFees,
          spread_fees: totalSpreadFees,
          bd_fees: totalBDFees,
          finra_fees: totalFINRAFees,
          performance_fees: totalPerformanceFees,
          total_all_fees: totalAllFees,
          unrealized_gains: totalUnrealizedGains,
          committed_capital: totalCommittedCapital,
          current_nav: totalCurrentNAV,
          total_subscriptions: totalSubscriptions,
        },
        by_status: byStatus,
        by_vehicle: byVehicle,
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/staff/fees/projected:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
