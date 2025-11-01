/**
 * Term Sheet ↔ Fee Plan Sync Utilities
 * Handles bidirectional sync between term sheets and fee plans
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Convert percent to basis points
 * @param percent - Percentage value (e.g., 2.5 for 2.5%)
 * @returns Basis points (e.g., 250 for 2.5%)
 */
function percentToBps(percent: number | null | undefined): number | null {
  if (percent === null || percent === undefined) return null;
  return Math.round(percent * 100);
}

/**
 * Convert basis points to percent
 * @param bps - Basis points (e.g., 250 for 2.5%)
 * @returns Percentage value (e.g., 2.5 for 2.5%)
 */
function bpsToPercent(bps: number | null | undefined): number | null {
  if (bps === null || bps === undefined) return null;
  return bps / 100;
}

/**
 * Sync term sheet fees to fee plan
 * Creates or updates a default fee plan for the deal based on term sheet values
 *
 * @param supabase - Supabase client
 * @param termSheet - Term sheet data with fee percentages
 * @param dealId - Deal ID
 * @param userId - User ID for audit trail
 */
export async function syncTermSheetToFeePlan(
  supabase: SupabaseClient,
  termSheet: {
    id: string;
    subscription_fee_percent?: number | null;
    management_fee_percent?: number | null;
    carried_interest_percent?: number | null;
  },
  dealId: string,
  userId: string
): Promise<{ success: boolean; error?: string; feePlanId?: string }> {
  try {
    // Check if a default fee plan exists for this deal
    const { data: existingPlan, error: fetchError } = await supabase
      .from('fee_plans')
      .select('id, components:fee_components(*)')
      .eq('deal_id', dealId)
      .eq('is_default', true)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching existing fee plan:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Prepare component data
    const components: Array<{
      kind: string;
      calc_method: string;
      frequency: string;
      payment_schedule: string;
      rate_bps?: number;
      description?: string;
    }> = [];

    if (termSheet.subscription_fee_percent !== null && termSheet.subscription_fee_percent !== undefined) {
      components.push({
        kind: 'subscription',
        calc_method: 'percent_of_investment',
        frequency: 'one_time',
        payment_schedule: 'upfront',
        rate_bps: percentToBps(termSheet.subscription_fee_percent)!,
        description: `${termSheet.subscription_fee_percent}% subscription fee from term sheet`,
      });
    }

    if (termSheet.management_fee_percent !== null && termSheet.management_fee_percent !== undefined) {
      components.push({
        kind: 'management',
        calc_method: 'percent_per_annum',
        frequency: 'quarterly',
        payment_schedule: 'recurring',
        rate_bps: percentToBps(termSheet.management_fee_percent)!,
        description: `${termSheet.management_fee_percent}% annual management fee from term sheet`,
      });
    }

    if (termSheet.carried_interest_percent !== null && termSheet.carried_interest_percent !== undefined) {
      components.push({
        kind: 'performance',
        calc_method: 'percent_of_profit',
        frequency: 'on_exit',
        payment_schedule: 'on_demand',
        rate_bps: percentToBps(termSheet.carried_interest_percent)!,
        description: `${termSheet.carried_interest_percent}% carried interest from term sheet`,
      });
    }

    if (existingPlan) {
      // Update existing fee plan components
      // Delete old components for subscription, management, and performance
      const { error: deleteError } = await supabase
        .from('fee_components')
        .delete()
        .eq('fee_plan_id', existingPlan.id)
        .in('kind', ['subscription', 'management', 'performance']);

      if (deleteError) {
        console.error('Error deleting old fee components:', deleteError);
        return { success: false, error: deleteError.message };
      }

      // Insert new components
      if (components.length > 0) {
        const componentInserts = components.map((comp) => ({
          ...comp,
          fee_plan_id: existingPlan.id,
        }));

        const { error: insertError } = await supabase
          .from('fee_components')
          .insert(componentInserts);

        if (insertError) {
          console.error('Error inserting fee components:', insertError);
          return { success: false, error: insertError.message };
        }
      }

      return { success: true, feePlanId: existingPlan.id };
    } else {
      // Create new fee plan
      const { data: newPlan, error: planError } = await supabase
        .from('fee_plans')
        .insert({
          deal_id: dealId,
          name: 'Standard Fee Plan (from Term Sheet)',
          description: 'Auto-generated from published term sheet',
          is_default: true,
          is_active: true,
          created_by: userId,
        })
        .select()
        .single();

      if (planError) {
        console.error('Error creating fee plan:', planError);
        return { success: false, error: planError.message };
      }

      // Create components
      if (components.length > 0) {
        const componentInserts = components.map((comp) => ({
          ...comp,
          fee_plan_id: newPlan.id,
        }));

        const { error: insertError } = await supabase
          .from('fee_components')
          .insert(componentInserts);

        if (insertError) {
          console.error('Error inserting fee components:', insertError);
          // Rollback: delete the created fee plan
          await supabase.from('fee_plans').delete().eq('id', newPlan.id);
          return { success: false, error: insertError.message };
        }
      }

      return { success: true, feePlanId: newPlan.id };
    }
  } catch (error) {
    console.error('Unexpected error in syncTermSheetToFeePlan:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync fee plan basic fees back to term sheet
 * Updates the published term sheet with fee values from the fee plan
 * Only syncs subscription, management, and performance fees
 *
 * @param supabase - Supabase client
 * @param feePlanId - Fee plan ID
 * @param dealId - Deal ID
 */
export async function syncFeePlanToTermSheet(
  supabase: SupabaseClient,
  feePlanId: string,
  dealId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch fee plan with components
    const { data: feePlan, error: planError } = await supabase
      .from('fee_plans')
      .select('*, components:fee_components(*)')
      .eq('id', feePlanId)
      .single();

    if (planError || !feePlan) {
      console.error('Error fetching fee plan:', planError);
      return { success: false, error: planError?.message || 'Fee plan not found' };
    }

    // Extract basic fee components
    const subscriptionComp = feePlan.components?.find((c: any) => c.kind === 'subscription');
    const managementComp = feePlan.components?.find((c: any) => c.kind === 'management');
    const performanceComp = feePlan.components?.find((c: any) => c.kind === 'performance');

    // Find the published term sheet for this deal
    const { data: termSheet, error: termSheetError } = await supabase
      .from('deal_fee_structures')
      .select('id')
      .eq('deal_id', dealId)
      .eq('status', 'published')
      .maybeSingle();

    if (termSheetError) {
      console.error('Error fetching term sheet:', termSheetError);
      return { success: false, error: termSheetError.message };
    }

    // Prepare fee values for term sheet
    const feeValues: Record<string, number | null> = {};

    if (subscriptionComp) {
      feeValues.subscription_fee_percent = bpsToPercent(subscriptionComp.rate_bps);
    }

    if (managementComp) {
      feeValues.management_fee_percent = bpsToPercent(managementComp.rate_bps);
    }

    if (performanceComp) {
      feeValues.carried_interest_percent = bpsToPercent(performanceComp.rate_bps);
    }

    if (!termSheet) {
      // No published term sheet exists - create one from the fee plan
      if (Object.keys(feeValues).length === 0) {
        // No basic fees to sync, skip creation
        return { success: true };
      }

      const { error: createError } = await supabase
        .from('deal_fee_structures')
        .insert({
          deal_id: dealId,
          status: 'published',
          version: 1,
          term_sheet_date: new Date().toISOString().split('T')[0],
          published_at: new Date().toISOString(),
          ...feeValues,
        });

      if (createError) {
        console.error('Error creating term sheet from fee plan:', createError);
        return { success: false, error: createError.message };
      }

      return { success: true };
    }

    // Update existing term sheet with fee values
    if (Object.keys(feeValues).length > 0) {
      const { error: updateError } = await supabase
        .from('deal_fee_structures')
        .update(feeValues)
        .eq('id', termSheet.id);

      if (updateError) {
        console.error('Error updating term sheet:', updateError);
        return { success: false, error: updateError.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in syncFeePlanToTermSheet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
