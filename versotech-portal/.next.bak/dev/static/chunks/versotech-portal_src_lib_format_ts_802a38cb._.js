(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/versotech-portal/src/lib/format.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatBps",
    ()=>formatBps,
    "formatCurrency",
    ()=>formatCurrency,
    "formatDate",
    ()=>formatDate,
    "formatPercentage",
    ()=>formatPercentage
]);
const formatCurrency = (value, currency = 'USD')=>{
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(value);
};
const formatBps = (bps)=>{
    if (bps === null || bps === undefined) return '—';
    return `${bps} bps`;
};
const formatPercentage = (value)=>{
    if (!value) return '0%';
    return `${(value * 100).toFixed(1)}%`;
};
const formatDate = (value)=>{
    if (!value) return '—';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date?.getTime?.())) return '—';
    // Use explicit locale to prevent hydration mismatch between server/client
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=versotech-portal_src_lib_format_ts_802a38cb._.js.map