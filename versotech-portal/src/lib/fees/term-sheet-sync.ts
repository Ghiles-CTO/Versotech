/**
 * Term Sheet & Fee Plan Utilities
 *
 * IMPORTANT ARCHITECTURAL NOTE:
 * Term sheets and fee plans/models serve DIFFERENT purposes:
 * - Term sheets: Investor-facing fee disclosures
 * - Fee models: Introducer/Partner commission agreements
 *
 * Fee models must be MANUALLY created and linked to term sheets.
 * Auto-sync between term sheets and fee plans has been DEPRECATED.
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Convert percent to basis points
 * @param percent - Percentage value (e.g., 2.5 for 2.5%)
 * @returns Basis points (e.g., 250 for 2.5%)
 */
export function percentToBps(percent: number | null | undefined): number | null {
  if (percent === null || percent === undefined) return null;
  return Math.round(percent * 100);
}

/**
 * Convert basis points to percent
 * @param bps - Basis points (e.g., 250 for 2.5%)
 * @returns Percentage value (e.g., 2.5 for 2.5%)
 */
export function bpsToPercent(bps: number | null | undefined): number | null {
  if (bps === null || bps === undefined) return null;
  return bps / 100;
}

/**
 * Validate that fee model values do not exceed term sheet limits
 * @param feeComponents - Array of fee components to validate
 * @param termSheet - The term sheet to validate against
 * @returns Array of validation error messages (empty if valid)
 */
export function validateFeeComponentsAgainstTermSheet(
  feeComponents: Array<{ kind: string; rate_bps?: number | null }>,
  termSheet: {
    subscription_fee_percent?: number | null;
    management_fee_percent?: number | null;
    carried_interest_percent?: number | null;
  }
): string[] {
  const errors: string[] = [];

  for (const comp of feeComponents) {
    if (!comp.rate_bps) continue;

    const compPercent = bpsToPercent(comp.rate_bps);
    if (compPercent === null) continue;

    switch (comp.kind) {
      case 'subscription':
        if (termSheet.subscription_fee_percent !== null &&
            termSheet.subscription_fee_percent !== undefined &&
            compPercent > termSheet.subscription_fee_percent) {
          errors.push(
            `Subscription fee (${compPercent}%) exceeds term sheet limit (${termSheet.subscription_fee_percent}%)`
          );
        }
        break;
      case 'management':
        if (termSheet.management_fee_percent !== null &&
            termSheet.management_fee_percent !== undefined &&
            compPercent > termSheet.management_fee_percent) {
          errors.push(
            `Management fee (${compPercent}%) exceeds term sheet limit (${termSheet.management_fee_percent}%)`
          );
        }
        break;
      case 'performance':
        if (termSheet.carried_interest_percent !== null &&
            termSheet.carried_interest_percent !== undefined &&
            compPercent > termSheet.carried_interest_percent) {
          errors.push(
            `Performance fee (${compPercent}%) exceeds term sheet limit (${termSheet.carried_interest_percent}%)`
          );
        }
        break;
    }
  }

  return errors;
}

/**
 * @deprecated Fee models must be manually created. Auto-sync is disabled.
 *
 * This function previously auto-generated fee plans from published term sheets.
 * Per business requirements (Fred), fee models are commercial agreements with
 * introducers/partners and must be manually created, not auto-generated.
 *
 * The function is kept for backward compatibility but does nothing.
 * All callers should be removed.
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
  console.warn(
    '[DEPRECATED] syncTermSheetToFeePlan() called but auto-sync is disabled. ' +
    'Fee models must be manually created by staff and linked to term sheets. ' +
    `Term sheet: ${termSheet.id}, Deal: ${dealId}`
  );

  // No-op - return success without creating anything
  return { success: true };
}

/**
 * @deprecated Fee models and term sheets serve different purposes - no sync.
 *
 * This function previously synced fee plan values back to term sheets.
 * Per business requirements (Fred):
 * - Term sheets are investor-facing fee disclosures
 * - Fee models are introducer/partner commission agreements
 *
 * They should NOT sync as they have different values for different audiences.
 * The function is kept for backward compatibility but does nothing.
 */
export async function syncFeePlanToTermSheet(
  supabase: SupabaseClient,
  feePlanId: string,
  dealId: string
): Promise<{ success: boolean; error?: string }> {
  console.warn(
    '[DEPRECATED] syncFeePlanToTermSheet() called but sync is disabled. ' +
    'Term sheets (investor-facing) and fee models (partner/introducer agreements) ' +
    'serve different purposes and should not sync. ' +
    `Fee plan: ${feePlanId}, Deal: ${dealId}`
  );

  // No-op - return success without doing anything
  return { success: true };
}
