module.exports = [
"[project]/versotech-portal/src/lib/fees/calculations.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Fee Calculation Utilities
 * Handles calculations for subscription, management, performance, and spread fees
 */ __turbopack_context__.s([
    "bpsToPercent",
    ()=>bpsToPercent,
    "calculateDaysBetween",
    ()=>calculateDaysBetween,
    "calculateIntroducerCommission",
    ()=>calculateIntroducerCommission,
    "calculateManagementFee",
    ()=>calculateManagementFee,
    "calculateManagementFeePeriod",
    ()=>calculateManagementFeePeriod,
    "calculateNetFeeRetained",
    ()=>calculateNetFeeRetained,
    "calculatePerformanceFeeWithHurdle",
    ()=>calculatePerformanceFeeWithHurdle,
    "calculatePeriodEndDate",
    ()=>calculatePeriodEndDate,
    "calculateSimplePerformanceFee",
    ()=>calculateSimplePerformanceFee,
    "calculateSpread",
    ()=>calculateSpread,
    "calculateSubscriptionFee",
    ()=>calculateSubscriptionFee,
    "calculateTieredPerformanceFee",
    ()=>calculateTieredPerformanceFee,
    "calculateTieredPerformanceFeeWithHurdle",
    ()=>calculateTieredPerformanceFeeWithHurdle,
    "calculateTotalWireAmount",
    ()=>calculateTotalWireAmount,
    "formatBps",
    ()=>formatBps,
    "formatCurrency",
    ()=>formatCurrency,
    "percentToBps",
    ()=>percentToBps,
    "validateInvoiceTotal",
    ()=>validateInvoiceTotal
]);
function bpsToPercent(bps) {
    return bps / 10000;
}
function percentToBps(percent) {
    return Math.round(percent * 10000);
}
function calculateSubscriptionFee(input) {
    if (input.flatAmount) {
        return input.flatAmount;
    }
    if (!input.rateBps) {
        return 0;
    }
    const feePercent = bpsToPercent(input.rateBps);
    return input.investmentAmount * feePercent;
}
function calculateManagementFee(input, isUpfront = false) {
    if (!input.rateBps) {
        return 0;
    }
    const feePercent = bpsToPercent(input.rateBps);
    const baseFee = input.investmentAmount * feePercent;
    if (isUpfront && input.durationPeriods) {
        return baseFee * input.durationPeriods;
    }
    return baseFee;
}
function calculateManagementFeePeriod(input) {
    if (!input.rateBps || input.rateBps <= 0) {
        return 0;
    }
    if (!input.baseAmount || input.baseAmount <= 0) {
        return 0;
    }
    const periodDays = calculateDaysBetween(input.periodStartDate, input.periodEndDate);
    if (periodDays <= 0) {
        return 0;
    }
    const feePercent = bpsToPercent(input.rateBps);
    const annualizedFraction = periodDays / 365;
    return input.baseAmount * feePercent * annualizedFraction;
}
function calculateDaysBetween(startDate, endDate) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffMs = endDate.getTime() - startDate.getTime();
    // Add 1 to include the end date in the count (both start and end are inclusive)
    return Math.floor(diffMs / msPerDay) + 1;
}
function calculatePeriodEndDate(startDate, frequency) {
    const endDate = new Date(startDate);
    switch(frequency){
        case 'annual':
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
        case 'quarterly':
            endDate.setMonth(endDate.getMonth() + 3);
            break;
        case 'monthly':
            endDate.setMonth(endDate.getMonth() + 1);
            break;
    }
    // Subtract 1 day to get the last day of the current period
    endDate.setDate(endDate.getDate() - 1);
    return endDate;
}
function calculateSimplePerformanceFee(input) {
    if (!input.rateBps || !input.numShares || !input.entryPricePerShare || !input.exitPricePerShare) {
        return 0;
    }
    const gainPerShare = input.exitPricePerShare - input.entryPricePerShare;
    // No performance fee if there's no gain
    if (gainPerShare <= 0) {
        return 0;
    }
    const feePercent = bpsToPercent(input.rateBps);
    return gainPerShare * input.numShares * feePercent;
}
function calculateTieredPerformanceFee(input, tiers) {
    if (!input.numShares || !input.entryPricePerShare || !input.exitPricePerShare) {
        return 0;
    }
    const gainPerShare = input.exitPricePerShare - input.entryPricePerShare;
    // No performance fee if there's no gain
    if (gainPerShare <= 0) {
        return 0;
    }
    const returnMultiplier = input.exitPricePerShare / input.entryPricePerShare;
    let totalFee = 0;
    // Sort tiers by threshold (ascending)
    const sortedTiers = [
        ...tiers
    ].sort((a, b)=>{
        const aThreshold = a.thresholdMultiplier || Infinity;
        const bThreshold = b.thresholdMultiplier || Infinity;
        return aThreshold - bThreshold;
    });
    let previousThreshold = 1; // Start at 1x (entry price)
    for (const tier of sortedTiers){
        const currentThreshold = tier.thresholdMultiplier || Infinity;
        if (returnMultiplier <= previousThreshold) {
            break; // Return is below this tier
        }
        const applicableMultiplier = Math.min(returnMultiplier, currentThreshold);
        const tierGainPerShare = input.entryPricePerShare * (applicableMultiplier - previousThreshold);
        const tierFeePercent = bpsToPercent(tier.rateBps);
        const tierFee = tierGainPerShare * input.numShares * tierFeePercent;
        totalFee += tierFee;
        previousThreshold = currentThreshold;
        if (returnMultiplier <= currentThreshold) {
            break; // Return doesn't reach next tier
        }
    }
    return totalFee;
}
function calculatePerformanceFeeWithHurdle(input) {
    const { contributedCapital, exitProceeds, carryRateBps, hurdleRateBps, yearsHeld } = input;
    // Calculate profit
    const profit = exitProceeds - contributedCapital;
    // No performance fee if there's no profit
    if (profit <= 0) {
        return 0;
    }
    // Calculate hurdle return (minimum return threshold)
    const hurdleReturn = contributedCapital * bpsToPercent(hurdleRateBps) * yearsHeld;
    // Calculate profit above the hurdle
    const profitAboveHurdle = profit - hurdleReturn;
    // No performance fee if profit doesn't exceed hurdle
    if (profitAboveHurdle <= 0) {
        return 0;
    }
    // Calculate and return the performance fee
    const carryRate = bpsToPercent(carryRateBps);
    return Math.round(profitAboveHurdle * carryRate * 100) / 100;
}
function calculateTieredPerformanceFeeWithHurdle(input) {
    const { contributedCapital, exitProceeds, yearsHeld, hurdleRateBps, tier1RateBps, tier1ThresholdMultiplier, tier2RateBps, tier2ThresholdMultiplier } = input;
    // Calculate profit
    const profit = exitProceeds - contributedCapital;
    // No performance fee if there's no profit
    if (profit <= 0) {
        return 0;
    }
    // Calculate hurdle return
    const hurdleReturn = contributedCapital * bpsToPercent(hurdleRateBps) * yearsHeld;
    // Calculate profit above hurdle
    const profitAboveHurdle = profit - hurdleReturn;
    // No performance fee if profit doesn't exceed hurdle
    if (profitAboveHurdle <= 0) {
        return 0;
    }
    // Calculate return multiple: exitProceeds / contributedCapital
    const returnMultiple = exitProceeds / contributedCapital;
    // If no tier structure, apply single rate
    if (!tier1ThresholdMultiplier || !tier2RateBps) {
        const carryRate = bpsToPercent(tier1RateBps);
        return Math.round(profitAboveHurdle * carryRate * 100) / 100;
    }
    let totalFee = 0;
    // Tier 1: Profit from hurdle to tier1 threshold (or actual return if lower)
    // tier1 threshold is expressed as a multiple (e.g., 2.0 = 2x return)
    const tier1MaxProfit = contributedCapital * (tier1ThresholdMultiplier - 1); // Profit at tier 1 threshold
    const tier1Profit = Math.min(profitAboveHurdle, Math.max(0, tier1MaxProfit - hurdleReturn));
    if (tier1Profit > 0) {
        totalFee += tier1Profit * bpsToPercent(tier1RateBps);
    }
    // Tier 2: Profit from tier1 threshold to tier2 threshold (or actual return if lower)
    if (returnMultiple > tier1ThresholdMultiplier) {
        const tier2Start = contributedCapital * (tier1ThresholdMultiplier - 1);
        const tier2End = tier2ThresholdMultiplier ? contributedCapital * (tier2ThresholdMultiplier - 1) : profit;
        const tier2Profit = Math.min(profit, tier2End) - tier2Start;
        if (tier2Profit > 0) {
            totalFee += tier2Profit * bpsToPercent(tier2RateBps);
        }
    }
    return Math.round(totalFee * 100) / 100;
}
function calculateSpread(input) {
    if (!input.numShares || !input.entryPricePerShare || !input.costPerShare) {
        return 0;
    }
    const spreadPerShare = input.entryPricePerShare - input.costPerShare;
    // No spread if investor price is at or below cost
    if (spreadPerShare <= 0) {
        return 0;
    }
    return spreadPerShare * input.numShares;
}
function calculateIntroducerCommission(baseFeeAmount, commissionRateBps) {
    const commissionPercent = bpsToPercent(commissionRateBps);
    return baseFeeAmount * commissionPercent;
}
function calculateTotalWireAmount(investmentAmount, subscriptionFeeBps) {
    const subscriptionFee = calculateSubscriptionFee({
        investmentAmount,
        rateBps: subscriptionFeeBps
    });
    return investmentAmount + subscriptionFee;
}
function calculateNetFeeRetained(grossFee, introducerCommissionBps) {
    const commission = calculateIntroducerCommission(grossFee, introducerCommissionBps);
    return grossFee - commission;
}
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}
function formatBps(bps) {
    const percent = bpsToPercent(bps) * 100;
    return `${percent.toFixed(2)}%`;
}
function validateInvoiceTotal(input) {
    const { invoiceTotal, invoiceSubtotal, lines } = input;
    const details = [];
    // Calculate totals from line items
    let feeEventsTotal = 0;
    let customItemsTotal = 0;
    let lineItemsTotal = 0;
    for (const line of lines){
        const lineAmount = Number(line.amount) || 0;
        lineItemsTotal += lineAmount;
        if (line.fee_event_id && line.fee_event) {
            // Fee event line - check if line amount matches fee event computed_amount
            const eventAmount = Number(line.fee_event.computed_amount) || 0;
            feeEventsTotal += eventAmount;
            // Check for line-level discrepancy
            if (Math.abs(lineAmount - eventAmount) > 0.01) {
                details.push(`Line for fee event ${line.fee_event_id}: line amount ${formatCurrency(lineAmount)} differs from fee event computed_amount ${formatCurrency(eventAmount)}`);
            }
        } else {
            // Custom line item
            customItemsTotal += lineAmount;
        }
    }
    // Expected total = sum of all line items
    const expectedTotal = lineItemsTotal;
    const discrepancyAmount = Math.abs(invoiceTotal - expectedTotal);
    const discrepancyPercent = expectedTotal > 0 ? discrepancyAmount / expectedTotal * 100 : invoiceTotal > 0 ? 100 : 0;
    // Allow for small rounding differences (within 1 cent)
    const hasDiscrepancy = discrepancyAmount > 0.01;
    const isValid = !hasDiscrepancy;
    // Add summary details
    if (hasDiscrepancy) {
        details.unshift(`Invoice total (${formatCurrency(invoiceTotal)}) does not match sum of line items (${formatCurrency(expectedTotal)}). Discrepancy: ${formatCurrency(discrepancyAmount)} (${discrepancyPercent.toFixed(2)}%)`);
    }
    // Check subtotal vs total (in case tax is applied later)
    if (Math.abs(invoiceTotal - invoiceSubtotal) > 0.01) {
        details.push(`Invoice total (${formatCurrency(invoiceTotal)}) differs from subtotal (${formatCurrency(invoiceSubtotal)}) - verify tax calculation if applicable`);
    }
    return {
        isValid,
        hasDiscrepancy,
        expectedTotal,
        actualTotal: invoiceTotal,
        discrepancyAmount,
        discrepancyPercent,
        feeEventsTotal,
        customItemsTotal,
        lineItemsTotal,
        details
    };
}
}),
"[project]/versotech-portal/src/lib/fees/term-sheet-sync.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FeesPageClient",
    ()=>FeesPageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Fees Management Page Client Component
 * Tabbed navigation for fee management
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/components/ui/tabs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-ssr] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$receipt$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Receipt$3e$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/receipt.js [app-ssr] (ecmascript) <export default as Receipt>");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/calendar.js [app-ssr] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
// Direct imports for instant tab switching
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$fees$2f$OverviewTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/components/fees/OverviewTab.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$fees$2f$FeePlansTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/components/fees/FeePlansTab.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$fees$2f$InvoicesTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/components/fees/InvoicesTab.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$fees$2f$ScheduleTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/components/fees/ScheduleTab.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$fees$2f$CommissionsTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/components/fees/CommissionsTab.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
function FeesPageClient() {
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('overview');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container mx-auto py-6 space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-3xl font-bold tracking-tight text-foreground",
                            children: "Fees Management"
                        }, void 0, false, {
                            fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                            lineNumber: 32,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-muted-foreground",
                            children: "Manage fee structures, invoices, and revenue tracking"
                        }, void 0, false, {
                            fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                            lineNumber: 33,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tabs"], {
                value: activeTab,
                onValueChange: setActiveTab,
                className: "space-y-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsList"], {
                        className: "grid w-full grid-cols-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                value: "overview",
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                                        lineNumber: 42,
                                        columnNumber: 13
                                    }, this),
                                    "Overview"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                value: "plans",
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                                        lineNumber: 46,
                                        columnNumber: 13
                                    }, this),
                                    "Fee Plans"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                value: "invoices",
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$receipt$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Receipt$3e$__["Receipt"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                                        lineNumber: 50,
                                        columnNumber: 13
                                    }, this),
                                    "Fee Billing"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                value: "schedule",
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                                        lineNumber: 54,
                                        columnNumber: 13
                                    }, this),
                                    "Schedule"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                value: "commissions",
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                                        lineNumber: 58,
                                        columnNumber: 13
                                    }, this),
                                    "Commissions"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsContent"], {
                        value: "overview",
                        className: "space-y-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$fees$2f$OverviewTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsContent"], {
                        value: "plans",
                        className: "space-y-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$fees$2f$FeePlansTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                            lineNumber: 68,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsContent"], {
                        value: "invoices",
                        className: "space-y-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$fees$2f$InvoicesTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                            lineNumber: 72,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsContent"], {
                        value: "schedule",
                        className: "space-y-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$fees$2f$ScheduleTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                            lineNumber: 76,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TabsContent"], {
                        value: "commissions",
                        className: "space-y-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$fees$2f$CommissionsTab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                            lineNumber: 80,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/versotech-portal/src/app/(main)/versotech_main/fees/fees-page-client.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=versotech-portal_src_94c64554._.js.map