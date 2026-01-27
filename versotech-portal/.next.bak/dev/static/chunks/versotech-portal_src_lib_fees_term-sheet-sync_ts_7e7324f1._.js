(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/versotech-portal/src/lib/fees/term-sheet-sync.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
 */ __turbopack_context__.s([
    "bpsToPercent",
    ()=>bpsToPercent,
    "percentToBps",
    ()=>percentToBps,
    "syncFeePlanToTermSheet",
    ()=>syncFeePlanToTermSheet,
    "syncTermSheetToFeePlan",
    ()=>syncTermSheetToFeePlan,
    "validateFeeComponentsAgainstTermSheet",
    ()=>validateFeeComponentsAgainstTermSheet
]);
function percentToBps(percent) {
    if (percent === null || percent === undefined) return null;
    return Math.round(percent * 100);
}
function bpsToPercent(bps) {
    if (bps === null || bps === undefined) return null;
    return bps / 100;
}
function validateFeeComponentsAgainstTermSheet(feeComponents, termSheet) {
    const errors = [];
    for (const comp of feeComponents){
        if (!comp.rate_bps) continue;
        const compPercent = bpsToPercent(comp.rate_bps);
        if (compPercent === null) continue;
        switch(comp.kind){
            case 'subscription':
                if (termSheet.subscription_fee_percent !== null && termSheet.subscription_fee_percent !== undefined && compPercent > termSheet.subscription_fee_percent) {
                    errors.push(`Subscription fee (${compPercent}%) exceeds term sheet limit (${termSheet.subscription_fee_percent}%)`);
                }
                break;
            case 'management':
                if (termSheet.management_fee_percent !== null && termSheet.management_fee_percent !== undefined && compPercent > termSheet.management_fee_percent) {
                    errors.push(`Management fee (${compPercent}%) exceeds term sheet limit (${termSheet.management_fee_percent}%)`);
                }
                break;
            case 'performance':
                if (termSheet.carried_interest_percent !== null && termSheet.carried_interest_percent !== undefined && compPercent > termSheet.carried_interest_percent) {
                    errors.push(`Performance fee (${compPercent}%) exceeds term sheet limit (${termSheet.carried_interest_percent}%)`);
                }
                break;
        }
    }
    return errors;
}
async function syncTermSheetToFeePlan(supabase, termSheet, dealId, userId) {
    console.warn('[DEPRECATED] syncTermSheetToFeePlan() called but auto-sync is disabled. ' + 'Fee models must be manually created by staff and linked to term sheets. ' + `Term sheet: ${termSheet.id}, Deal: ${dealId}`);
    // No-op - return success without creating anything
    return {
        success: true
    };
}
async function syncFeePlanToTermSheet(supabase, feePlanId, dealId) {
    console.warn('[DEPRECATED] syncFeePlanToTermSheet() called but sync is disabled. ' + 'Term sheets (investor-facing) and fee models (partner/introducer agreements) ' + 'serve different purposes and should not sync. ' + `Fee plan: ${feePlanId}, Deal: ${dealId}`);
    // No-op - return success without doing anything
    return {
        success: true
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=versotech-portal_src_lib_fees_term-sheet-sync_ts_7e7324f1._.js.map