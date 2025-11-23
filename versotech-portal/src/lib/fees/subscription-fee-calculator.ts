/**
 * Subscription Fee Calculator
 * Calculates fee events from subscription data
 *
 * Source of Truth: Subscription table (amounts)
 * Frequency Source: Fee plan (if linked)
 */

import { SupabaseClient } from '@supabase/supabase-js';

interface SubscriptionFees {
  subscription_fee_percent?: number | null;
  subscription_fee_amount?: number | null;
  spread_fee_amount?: number | null;
  bd_fee_percent?: number | null;
  bd_fee_amount?: number | null;
  finra_fee_amount?: number | null;
  management_fee_percent?: number | null;
  management_fee_amount?: number | null;
  management_fee_frequency?: string | null;
  performance_fee_tier1_percent?: number | null;
  performance_fee_tier1_threshold?: number | null;
  performance_fee_tier2_percent?: number | null;
  performance_fee_tier2_threshold?: number | null;
}

interface FeeEvent {
  fee_type: 'subscription' | 'management' | 'performance' | 'spread_markup' | 'bd_fee' | 'finra_fee' | 'flat' | 'other';
  base_amount: number;
  computed_amount: number;
  rate_bps?: number | null;
  frequency: 'one_time' | 'quarterly' | 'annual' | 'monthly' | 'on_exit';
  payment_schedule: 'upfront' | 'recurring' | 'on_demand';
  description: string;
}

/**
 * Calculate fee events for a subscription
 * @param supabase - Supabase client
 * @param subscriptionId - Subscription ID
 * @returns Array of fee events to be created
 */
export async function calculateSubscriptionFeeEvents(
  supabase: SupabaseClient,
  subscriptionId: string
): Promise<{ success: boolean; feeEvents?: FeeEvent[]; error?: string }> {
  try {
    // Fetch subscription with fee plan and vehicle
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        vehicle:vehicles (
          id,
          name
        ),
        fee_plan:fee_plans (
          id,
          components:fee_components (
            kind,
            frequency,
            payment_schedule
          )
        )
      `)
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      return { success: false, error: subError?.message || 'Subscription not found' };
    }

    const feeEvents: FeeEvent[] = [];
    const fees = subscription as SubscriptionFees;
    const feePlan = (subscription as any).fee_plan;

    // Helper to get frequency/payment_schedule from fee plan
    const getFrequencyInfo = (kind: string) => {
      if (!feePlan || !feePlan.components) {
        // No fee plan: default to one_time/upfront
        return { frequency: 'one_time' as const, payment_schedule: 'upfront' as const };
      }

      const component = feePlan.components.find((c: any) => c.kind === kind);
      return {
        frequency: component?.frequency || 'one_time' as const,
        payment_schedule: component?.payment_schedule || 'upfront' as const,
      };
    };

    // 0. COMMITMENT AMOUNT (the investment itself)
    // This is the primary payment - the investor's actual commitment to the vehicle
    const commitmentAmount = subscription.commitment || 0;
    if (commitmentAmount > 0) {
      feeEvents.push({
        fee_type: 'flat',
        base_amount: commitmentAmount,
        computed_amount: commitmentAmount,
        rate_bps: null,
        frequency: 'one_time',
        payment_schedule: 'upfront',
        description: `Investment commitment - ${(subscription as any).vehicle?.name || 'vehicle'}`,
      });
    }

    // 1. Subscription Fee
    if (fees.subscription_fee_percent || fees.subscription_fee_amount) {
      const baseAmount = subscription.commitment || 0;
      const { frequency, payment_schedule } = getFrequencyInfo('subscription');

      feeEvents.push({
        fee_type: 'subscription',
        base_amount: baseAmount,
        computed_amount: fees.subscription_fee_amount || (baseAmount * (fees.subscription_fee_percent || 0) / 100),
        rate_bps: fees.subscription_fee_percent ? Math.round(fees.subscription_fee_percent * 100) : null,
        frequency,
        payment_schedule,
        description: `Subscription fee for ${subscription.commitment || 0} commitment`,
      });
    }

    // 2. Management Fee
    if (fees.management_fee_percent || fees.management_fee_amount) {
      const baseAmount = subscription.commitment || 0;
      const { frequency, payment_schedule } = getFrequencyInfo('management');

      // Use subscription's frequency if specified, otherwise use fee plan
      const finalFrequency = fees.management_fee_frequency || frequency;

      feeEvents.push({
        fee_type: 'management',
        base_amount: baseAmount,
        computed_amount: fees.management_fee_amount || (baseAmount * (fees.management_fee_percent || 0) / 100),
        rate_bps: fees.management_fee_percent ? Math.round(fees.management_fee_percent * 100) : null,
        frequency: finalFrequency as any,
        payment_schedule,
        description: `Management fee for ${subscription.commitment || 0} commitment`,
      });
    }

    // 3. BD Fee (Broker-Dealer)
    if (fees.bd_fee_percent || fees.bd_fee_amount) {
      const baseAmount = subscription.commitment || 0;
      const { frequency, payment_schedule } = getFrequencyInfo('bd_fee');

      feeEvents.push({
        fee_type: 'bd_fee',
        base_amount: baseAmount,
        computed_amount: fees.bd_fee_amount || (baseAmount * (fees.bd_fee_percent || 0) / 100),
        rate_bps: fees.bd_fee_percent ? Math.round(fees.bd_fee_percent * 100) : null,
        frequency,
        payment_schedule,
        description: `Broker-dealer fee for ${subscription.commitment || 0} commitment`,
      });
    }

    // 4. FINRA Fee
    if (fees.finra_fee_amount) {
      const { frequency, payment_schedule } = getFrequencyInfo('finra_fee');

      feeEvents.push({
        fee_type: 'finra_fee',
        base_amount: fees.finra_fee_amount,
        computed_amount: fees.finra_fee_amount,
        rate_bps: null,
        frequency,
        payment_schedule,
        description: 'FINRA regulatory fee',
      });
    }

    // 5. Spread Fee
    if (fees.spread_fee_amount) {
      const { frequency, payment_schedule } = getFrequencyInfo('spread_markup');

      feeEvents.push({
        fee_type: 'spread_markup',
        base_amount: fees.spread_fee_amount,
        computed_amount: fees.spread_fee_amount,
        rate_bps: null,
        frequency,
        payment_schedule,
        description: 'Spread markup fee',
      });
    }

    // 6. Performance Fee (Tier 1 and Tier 2)
    if (fees.performance_fee_tier1_percent || fees.performance_fee_tier2_percent) {
      const { frequency, payment_schedule } = getFrequencyInfo('performance');

      // Calculate actual performance fee if NAV exists
      const commitment = subscription.commitment || 0;
      const nav = (subscription as any).current_nav || 0;
      let performanceFee = 0;
      const tier1Threshold = fees.performance_fee_tier1_threshold || 0;
      const tier2Threshold = fees.performance_fee_tier2_threshold || 0;
      const tier1Percent = fees.performance_fee_tier1_percent || 0;
      const tier2Percent = fees.performance_fee_tier2_percent || 0;

      // Calculate returns-based performance fee (same logic as overview page)
      if (nav > 0 && commitment > 0) {
        const returns = nav - commitment;
        if (returns > 0) {
          if (tier2Percent > 0 && returns > tier2Threshold) {
            performanceFee = returns * (tier2Percent / 100);
          } else if (tier1Percent > 0 && returns > tier1Threshold) {
            performanceFee = returns * (tier1Percent / 100);
          }
        }
      }

      // Create description based on which tier applies
      let description = 'Performance fee';
      if (tier2Percent > 0 && tier2Threshold > 0) {
        description = `Performance fee (Tier 2: ${tier2Percent}% above ${tier2Threshold} returns)`;
      } else if (tier1Percent > 0) {
        description = `Performance fee (Tier 1: ${tier1Percent}% above ${tier1Threshold || 0} returns)`;
      }

      feeEvents.push({
        fee_type: 'performance',
        base_amount: nav > 0 ? nav - commitment : 0,
        computed_amount: performanceFee,
        rate_bps: tier2Percent > 0 ? Math.round(tier2Percent * 100) : Math.round(tier1Percent * 100),
        frequency,
        payment_schedule,
        description,
      });
    }

    return { success: true, feeEvents };
  } catch (error) {
    console.error('Error calculating subscription fee events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create fee event records in database
 * @param supabase - Supabase client
 * @param subscriptionId - Subscription ID
 * @param feeEvents - Calculated fee events
 * @returns Created fee event IDs
 */
export async function createFeeEvents(
  supabase: SupabaseClient,
  subscriptionId: string,
  investorId: string,
  dealId: string | null,
  feePlanId: string | null,
  feeEvents: FeeEvent[]
): Promise<{ success: boolean; feeEventIds?: string[]; error?: string }> {
  try {
    // Fetch subscription to get currency
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('currency')
      .eq('id', subscriptionId)
      .single();

    const currency = subscription?.currency || 'USD';

    // If we have a fee plan, fetch its components to link properly
    const componentMap: Record<string, string> = {};
    if (feePlanId) {
      const { data: components } = await supabase
        .from('fee_components')
        .select('id, kind')
        .eq('fee_plan_id', feePlanId);

      if (components) {
        // Map fee_type to component_id
        components.forEach((comp: any) => {
          componentMap[comp.kind] = comp.id;
        });
      }
    }

    const inserts = feeEvents.map((fe) => {
      // Match fee_type to fee_component_id
      // fee_type 'flat' (commitment) doesn't get a component_id
      const feeComponentId = fe.fee_type === 'flat' ? null : componentMap[fe.fee_type] || null;

      // Warn if fee type expected a component but none found
      if (fe.fee_type !== 'flat' && !feeComponentId && feePlanId) {
        console.warn(
          `⚠️ [FEE EVENTS] No component found for fee_type '${fe.fee_type}' in fee plan ${feePlanId}. ` +
          `Fee event will be created without component link.`
        );
      }

      return {
        investor_id: investorId,
        deal_id: dealId,
        allocation_id: subscriptionId, // Link to subscription
        fee_component_id: feeComponentId, // NOW PROPERLY LINKED!
        fee_type: fe.fee_type,
        event_date: new Date().toISOString(),
        base_amount: fe.base_amount,
        computed_amount: fe.computed_amount,
        rate_bps: fe.rate_bps,
        currency: currency, // Use subscription currency
        status: 'accrued', // Ready to be invoiced
        notes: fe.description,
      };
    });

    const { data, error } = await supabase
      .from('fee_events')
      .insert(inserts)
      .select('id');

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      feeEventIds: data?.map((d) => d.id) || [],
    };
  } catch (error) {
    console.error('Error creating fee events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
