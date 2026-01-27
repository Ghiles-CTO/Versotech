(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/versotech-portal/src/components/kibo-ui/calendar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarBody",
    ()=>CalendarBody,
    "CalendarDate",
    ()=>CalendarDate,
    "CalendarDatePagination",
    ()=>CalendarDatePagination,
    "CalendarDatePicker",
    ()=>CalendarDatePicker,
    "CalendarHeader",
    ()=>CalendarHeader,
    "CalendarItem",
    ()=>CalendarItem,
    "CalendarMonthPicker",
    ()=>CalendarMonthPicker,
    "CalendarProvider",
    ()=>CalendarProvider,
    "CalendarYearPicker",
    ()=>CalendarYearPicker,
    "useCalendar",
    ()=>useCalendar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature();
'use client';
;
const CalendarContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
// Date utility functions
function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}
function addMonths(date, amount) {
    const copy = new Date(date);
    copy.setMonth(copy.getMonth() + amount);
    return copy;
}
function addDays(date, amount) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + amount);
    return copy;
}
function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}
function endOfDay(date) {
    const copy = new Date(date);
    copy.setHours(23, 59, 59, 999);
    return copy;
}
function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function generateMonthMatrix(date) {
    const matrix = [];
    const start = startOfMonth(date);
    const startWeekday = start.getDay();
    const firstVisibleDay = addDays(start, -startWeekday);
    for(let i = 0; i < 42; i += 1){
        const current = addDays(firstVisibleDay, i);
        matrix.push({
            date: current,
            isCurrentMonth: current.getMonth() === date.getMonth()
        });
    }
    return matrix;
}
function CalendarProvider({ children, defaultDate = new Date(), defaultSelectedDate }) {
    _s();
    const [currentDate, setCurrentDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(startOfMonth(defaultDate));
    const [selectedDate, setSelectedDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(startOfDay(defaultSelectedDate ?? defaultDate));
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CalendarProvider.useMemo[value]": ()=>{
            return {
                currentDate,
                selectedDate,
                goToNextMonth: ({
                    "CalendarProvider.useMemo[value]": ()=>{
                        setCurrentDate({
                            "CalendarProvider.useMemo[value]": (prev)=>startOfMonth(addMonths(prev, 1))
                        }["CalendarProvider.useMemo[value]"]);
                    }
                })["CalendarProvider.useMemo[value]"],
                goToPreviousMonth: ({
                    "CalendarProvider.useMemo[value]": ()=>{
                        setCurrentDate({
                            "CalendarProvider.useMemo[value]": (prev)=>startOfMonth(addMonths(prev, -1))
                        }["CalendarProvider.useMemo[value]"]);
                    }
                })["CalendarProvider.useMemo[value]"],
                goToToday: ({
                    "CalendarProvider.useMemo[value]": ()=>{
                        const today = startOfMonth(new Date());
                        setCurrentDate(today);
                        setSelectedDate(startOfDay(new Date()));
                    }
                })["CalendarProvider.useMemo[value]"],
                setMonth: ({
                    "CalendarProvider.useMemo[value]": (monthIndex)=>setCurrentDate({
                            "CalendarProvider.useMemo[value]": (prev)=>startOfMonth(new Date(prev.getFullYear(), monthIndex, 1))
                        }["CalendarProvider.useMemo[value]"])
                })["CalendarProvider.useMemo[value]"],
                setYear: ({
                    "CalendarProvider.useMemo[value]": (year)=>setCurrentDate({
                            "CalendarProvider.useMemo[value]": (prev)=>startOfMonth(new Date(year, prev.getMonth(), 1))
                        }["CalendarProvider.useMemo[value]"])
                })["CalendarProvider.useMemo[value]"],
                selectDate: ({
                    "CalendarProvider.useMemo[value]": (date)=>setSelectedDate(startOfDay(date))
                })["CalendarProvider.useMemo[value]"]
            };
        }
    }["CalendarProvider.useMemo[value]"], [
        currentDate,
        selectedDate
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CalendarContext.Provider, {
        value: value,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-4",
            children: children
        }, void 0, false, {
            fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
            lineNumber: 119,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
        lineNumber: 118,
        columnNumber: 5
    }, this);
}
_s(CalendarProvider, "gCS9x6fZ2pZOB8Qqp1Gs57SuAx8=");
_c = CalendarProvider;
function useCalendar() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CalendarContext);
    if (!context) {
        throw new Error('Calendar components must be used within CalendarProvider');
    }
    return context;
}
_s1(useCalendar, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
function CalendarDate({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
        children: children
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
        lineNumber: 134,
        columnNumber: 10
    }, this);
}
_c1 = CalendarDate;
function CalendarDatePicker({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: children
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
        lineNumber: 138,
        columnNumber: 10
    }, this);
}
_c2 = CalendarDatePicker;
function CalendarMonthPicker({ brand = 'versotech' }) {
    _s2();
    const { currentDate, setMonth } = useCalendar();
    const isLight = brand === 'versoholdings';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
        className: `rounded-md border px-3 py-2 text-sm font-medium shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isLight ? 'border-gray-300 bg-white text-gray-900' : 'border-border bg-card text-foreground'}`,
        value: currentDate.getMonth(),
        onChange: (event)=>setMonth(Number(event.target.value)),
        children: Array.from({
            length: 12
        }).map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                value: index,
                children: new Date(2000, index).toLocaleString('default', {
                    month: 'long'
                })
            }, index, false, {
                fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                lineNumber: 151,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
        lineNumber: 145,
        columnNumber: 5
    }, this);
}
_s2(CalendarMonthPicker, "+6oS8OC+MEcvdBMzPFRrrnF+dSw=", false, function() {
    return [
        useCalendar
    ];
});
_c3 = CalendarMonthPicker;
function CalendarYearPicker({ start, end, brand = 'versotech' }) {
    _s3();
    const { currentDate, setYear } = useCalendar();
    const isLight = brand === 'versoholdings';
    const years = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CalendarYearPicker.useMemo[years]": ()=>{
            const list = [];
            const min = Math.min(start, end);
            const max = Math.max(start, end);
            for(let year = min; year <= max; year += 1){
                list.push(year);
            }
            return list;
        }
    }["CalendarYearPicker.useMemo[years]"], [
        start,
        end
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
        className: `rounded-md border px-3 py-2 text-sm font-medium shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isLight ? 'border-gray-300 bg-white text-gray-900' : 'border-border bg-card text-foreground'}`,
        value: currentDate.getFullYear(),
        onChange: (event)=>setYear(Number(event.target.value)),
        children: years.map((year)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                value: year,
                children: year
            }, year, false, {
                fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                lineNumber: 179,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
        lineNumber: 173,
        columnNumber: 5
    }, this);
}
_s3(CalendarYearPicker, "gAjLuyWg/Jbp9wqpCsqchhStP+A=", false, function() {
    return [
        useCalendar
    ];
});
_c4 = CalendarYearPicker;
function CalendarDatePagination({ brand = 'versotech' }) {
    _s4();
    const { goToNextMonth, goToPreviousMonth, goToToday } = useCalendar();
    const isLight = brand === 'versoholdings';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: `rounded-md border px-3 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary/10 hover:text-primary ${isLight ? 'border-gray-300 text-gray-700' : 'border-border text-foreground'}`,
                onClick: goToPreviousMonth,
                children: "Previous"
            }, void 0, false, {
                fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                lineNumber: 192,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: `rounded-md border px-3 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary/10 hover:text-primary ${isLight ? 'border-gray-300 text-gray-700' : 'border-border text-foreground'}`,
                onClick: goToToday,
                children: "Today"
            }, void 0, false, {
                fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                lineNumber: 199,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: `rounded-md border px-3 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary/10 hover:text-primary ${isLight ? 'border-gray-300 text-gray-700' : 'border-border text-foreground'}`,
                onClick: goToNextMonth,
                children: "Next"
            }, void 0, false, {
                fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                lineNumber: 206,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
        lineNumber: 191,
        columnNumber: 5
    }, this);
}
_s4(CalendarDatePagination, "EAmt4vLnVImoGaRDgM8if9GT3nU=", false, function() {
    return [
        useCalendar
    ];
});
_c5 = CalendarDatePagination;
function CalendarHeader({ brand = 'versotech' }) {
    _s5();
    const { currentDate } = useCalendar();
    const isLight = brand === 'versoholdings';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-foreground'}`,
                children: currentDate.toLocaleString('default', {
                    month: 'long',
                    year: 'numeric'
                })
            }, void 0, false, {
                fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                lineNumber: 223,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `grid grid-cols-7 gap-2 text-[11px] font-semibold uppercase tracking-wide ${isLight ? 'text-gray-600' : 'text-muted-foreground'}`,
                children: [
                    'Sun',
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat'
                ].map((weekday)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-2 text-center",
                        children: weekday
                    }, weekday, false, {
                        fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                        lineNumber: 228,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                lineNumber: 226,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
        lineNumber: 222,
        columnNumber: 5
    }, this);
}
_s5(CalendarHeader, "OusQ3bpVEZGGpHNySM/1YZ2huZ4=", false, function() {
    return [
        useCalendar
    ];
});
_c6 = CalendarHeader;
function CalendarBody({ features, children, brand = 'versotech', onDayClick }) {
    _s6();
    const { currentDate, selectedDate, selectDate } = useCalendar();
    const today = startOfDay(new Date());
    const isLight = brand === 'versoholdings';
    const normalizedFeatures = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CalendarBody.useMemo[normalizedFeatures]": ()=>{
            return features.map({
                "CalendarBody.useMemo[normalizedFeatures]": (feature)=>({
                        ...feature,
                        startAt: feature.startAt instanceof Date ? feature.startAt : new Date(feature.startAt),
                        endAt: feature.endAt instanceof Date ? feature.endAt : new Date(feature.endAt)
                    })
            }["CalendarBody.useMemo[normalizedFeatures]"]);
        }
    }["CalendarBody.useMemo[normalizedFeatures]"], [
        features
    ]);
    const matrix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CalendarBody.useMemo[matrix]": ()=>generateMonthMatrix(currentDate)
    }["CalendarBody.useMemo[matrix]"], [
        currentDate
    ]);
    const handleDayClick = (date)=>{
        selectDate(date);
        onDayClick?.(date);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `grid grid-cols-7 gap-2 rounded-2xl border p-2 md:gap-3 md:p-4 ${isLight ? 'border-slate-200/80 bg-white/90' : 'border-border/80 bg-muted/20'}`,
        children: matrix.map(({ date, isCurrentMonth })=>{
            const dayEvents = normalizedFeatures.filter((feature)=>{
                const start = startOfDay(feature.startAt);
                const end = endOfDay(feature.endAt);
                return date >= start && date <= end;
            });
            const isToday = isSameDay(date, today);
            const isSelected = isSameDay(date, selectedDate);
            const baseClasses = [
                'flex min-h-[92px] flex-col rounded-xl border px-2 py-2 text-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
            ];
            if (isLight) {
                if (isCurrentMonth) {
                    baseClasses.push('border-slate-200 bg-white text-slate-900 hover:border-primary/40 hover:bg-primary/5');
                } else {
                    baseClasses.push('border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200');
                }
            } else {
                if (isCurrentMonth) {
                    baseClasses.push('border-border/70 bg-muted/40 text-foreground hover:border-primary/30 hover:bg-muted/60');
                } else {
                    baseClasses.push('border-border/40 bg-muted/10 text-muted-foreground hover:border-border/60');
                }
            }
            if (isSelected) {
                baseClasses.push('border-primary/60 bg-primary/10 ring-2 ring-primary/40');
            } else if (isToday) {
                baseClasses.push('border-primary/40 bg-primary/5');
            } else {
                baseClasses.push('border-transparent');
            }
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>handleDayClick(date),
                className: baseClasses.join(' '),
                "aria-pressed": isSelected,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-1 flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-sm font-semibold leading-none ${isToday ? 'text-primary' : ''}`,
                                children: date.getDate()
                            }, void 0, false, {
                                fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                                lineNumber: 318,
                                columnNumber: 15
                            }, this),
                            dayEvents.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-white",
                                children: dayEvents.length
                            }, void 0, false, {
                                fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                                lineNumber: 322,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                        lineNumber: 317,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1",
                        children: [
                            dayEvents.slice(0, 2).map((feature)=>children ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                    children: children({
                                        feature,
                                        brand
                                    })
                                }, feature.id, false, {
                                    fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                                    lineNumber: 331,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CalendarItem, {
                                    feature: feature,
                                    brand: brand
                                }, feature.id, false, {
                                    fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                                    lineNumber: 333,
                                    columnNumber: 19
                                }, this)),
                            dayEvents.length > 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded px-1.5 py-0.5 text-[10px] font-medium bg-primary/20 text-primary text-center",
                                children: [
                                    "+",
                                    dayEvents.length - 2,
                                    " more"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                                lineNumber: 337,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                        lineNumber: 328,
                        columnNumber: 13
                    }, this)
                ]
            }, date.toISOString(), true, {
                fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
                lineNumber: 310,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
        lineNumber: 268,
        columnNumber: 5
    }, this);
}
_s6(CalendarBody, "UjwFBzsClIuvxVET51CXsTd9ZAo=", false, function() {
    return [
        useCalendar
    ];
});
_c7 = CalendarBody;
function CalendarItem({ feature, brand = 'versotech' }) {
    const color = feature.status?.color || '#3b82f6';
    const styles = getEventStyle(color, brand);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded px-1.5 py-1 text-[10px] font-semibold truncate",
        style: styles,
        title: feature.name,
        children: feature.name
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/kibo-ui/calendar.tsx",
        lineNumber: 354,
        columnNumber: 5
    }, this);
}
_c8 = CalendarItem;
function getEventStyle(colorHex, brand = 'versotech') {
    const isLight = brand === 'versoholdings';
    // Convert hex to RGB
    const hex = colorHex.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    if (isLight) {
        // For light backgrounds - use more saturated, visible colors
        return {
            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.25)`,
            border: `1.5px solid rgba(${r}, ${g}, ${b}, 0.6)`,
            color: `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`
        };
    } else {
        // For dark backgrounds - use lighter, brighter colors
        return {
            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.35)`,
            border: `1.5px solid rgba(${r}, ${g}, ${b}, 0.7)`,
            color: `rgb(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)})`
        };
    }
}
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "CalendarProvider");
__turbopack_context__.k.register(_c1, "CalendarDate");
__turbopack_context__.k.register(_c2, "CalendarDatePicker");
__turbopack_context__.k.register(_c3, "CalendarMonthPicker");
__turbopack_context__.k.register(_c4, "CalendarYearPicker");
__turbopack_context__.k.register(_c5, "CalendarDatePagination");
__turbopack_context__.k.register(_c6, "CalendarHeader");
__turbopack_context__.k.register(_c7, "CalendarBody");
__turbopack_context__.k.register(_c8, "CalendarItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/versotech-portal/src/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardAction",
    ()=>CardAction,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/lib/utils.ts [app-client] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Card;
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c1 = CardHeader;
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("leading-none font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c2 = CardTitle;
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_c3 = CardDescription;
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_c4 = CardAction;
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_c5 = CardContent;
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center px-6 [.border-t]:pt-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_c6 = CardFooter;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "CardHeader");
__turbopack_context__.k.register(_c2, "CardTitle");
__turbopack_context__.k.register(_c3, "CardDescription");
__turbopack_context__.k.register(_c4, "CardAction");
__turbopack_context__.k.register(_c5, "CardContent");
__turbopack_context__.k.register(_c6, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/versotech-portal/src/components/ui/scroll-area.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScrollArea",
    ()=>ScrollArea,
    "ScrollBar",
    ()=>ScrollBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-scroll-area/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const ScrollArea = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative overflow-hidden", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"], {
                className: "h-full w-full rounded-[inherit]",
                children: children
            }, void 0, false, {
                fileName: "[project]/versotech-portal/src/components/ui/scroll-area.tsx",
                lineNumber: 17,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScrollBar, {}, void 0, false, {
                fileName: "[project]/versotech-portal/src/components/ui/scroll-area.tsx",
                lineNumber: 20,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Corner"], {}, void 0, false, {
                fileName: "[project]/versotech-portal/src/components/ui/scroll-area.tsx",
                lineNumber: 21,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/versotech-portal/src/components/ui/scroll-area.tsx",
        lineNumber: 12,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = ScrollArea;
ScrollArea.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
const ScrollBar = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](({ className, orientation = "vertical", ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollAreaScrollbar"], {
        ref: ref,
        orientation: orientation,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollAreaThumb"], {
            className: "relative flex-1 rounded-full bg-border"
        }, void 0, false, {
            fileName: "[project]/versotech-portal/src/components/ui/scroll-area.tsx",
            lineNumber: 43,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/ui/scroll-area.tsx",
        lineNumber: 30,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c2 = ScrollBar;
ScrollBar.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollAreaScrollbar"].displayName;
;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ScrollArea$React.forwardRef");
__turbopack_context__.k.register(_c1, "ScrollArea");
__turbopack_context__.k.register(_c2, "ScrollBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarDayModal",
    ()=>CalendarDayModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/components/ui/scroll-area.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/date-fns/format.js [app-client] (ecmascript) <locals>");
'use client';
;
;
;
;
function CalendarDayModal({ open, onOpenChange, date, events, brand = 'versotech' }) {
    const isLight = brand === 'versoholdings';
    if (!date) return null;
    const isToday = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(), 'yyyy-MM-dd') === (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(date, 'yyyy-MM-dd');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
        open: open,
        onOpenChange: onOpenChange,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
            className: `max-w-2xl ${isLight ? 'bg-white text-gray-900' : 'bg-card text-foreground'}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                        className: `text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-foreground'}`,
                        children: [
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(date, 'EEEE, MMMM d, yyyy'),
                            isToday && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-2 text-sm font-normal text-primary",
                                children: "(Today)"
                            }, void 0, false, {
                                fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                lineNumber: 37,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                        lineNumber: 35,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollArea"], {
                    className: "max-h-[60vh]",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4 pr-4",
                        children: events.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `rounded-lg border border-dashed p-8 text-center ${isLight ? 'border-gray-300 bg-gray-50' : 'border-border bg-muted/30'}`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: `text-sm ${isLight ? 'text-gray-600' : 'text-muted-foreground'}`,
                                children: "No events scheduled for this day"
                            }, void 0, false, {
                                fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                lineNumber: 45,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                            lineNumber: 44,
                            columnNumber: 15
                        }, this) : events.map((event)=>{
                            const color = event.status?.color || '#3b82f6';
                            const rgb = hexToRgb(color);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `rounded-lg border p-4 shadow-sm ${isLight ? 'border-gray-200 bg-white' : 'border-border bg-card'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-1 h-3 w-3 flex-shrink-0 rounded-full",
                                            style: {
                                                backgroundColor: color
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                            lineNumber: 60,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: `font-semibold ${isLight ? 'text-gray-900' : 'text-foreground'}`,
                                                            children: event.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                                            lineNumber: 66,
                                                            columnNumber: 27
                                                        }, this),
                                                        event.status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium",
                                                            style: {
                                                                backgroundColor: isLight ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)` : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
                                                                color: isLight ? color : `rgb(${Math.min(255, rgb.r + 80)}, ${Math.min(255, rgb.g + 80)}, ${Math.min(255, rgb.b + 80)})`
                                                            },
                                                            children: event.status.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                                            lineNumber: 70,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                                    lineNumber: 65,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `text-sm ${isLight ? 'text-gray-600' : 'text-muted-foreground'}`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "📅"
                                                            }, void 0, false, {
                                                                fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                                                lineNumber: 84,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(event.startAt, 'MMM d'),
                                                                    " - ",
                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(event.endAt, 'MMM d, yyyy')
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                                                lineNumber: 85,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                                        lineNumber: 83,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                                    lineNumber: 82,
                                                    columnNumber: 25
                                                }, this),
                                                event.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: `text-sm ${isLight ? 'text-gray-700' : 'text-foreground/80'}`,
                                                    children: event.description
                                                }, void 0, false, {
                                                    fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                                    lineNumber: 92,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                            lineNumber: 64,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                    lineNumber: 59,
                                    columnNumber: 21
                                }, this)
                            }, event.id, false, {
                                fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                                lineNumber: 55,
                                columnNumber: 19
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
                    lineNumber: 41,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_c = CalendarDayModal;
function hexToRgb(hex) {
    const normalized = hex.replace('#', '');
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return {
        r,
        g,
        b
    };
}
var _c;
__turbopack_context__.k.register(_c, "CalendarDayModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/versotech-portal/src/components/calendar/calendar-view.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarView",
    ()=>CalendarView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$kibo$2d$ui$2f$calendar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/components/kibo-ui/calendar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$calendar$2f$calendar$2d$day$2d$modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/components/calendar/calendar-day-modal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function CalendarView({ title, description, events, emptyMessage, brand = 'versotech' }) {
    _s();
    const parsedEvents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CalendarView.useMemo[parsedEvents]": ()=>{
            return events.map({
                "CalendarView.useMemo[parsedEvents]": (event)=>({
                        ...event,
                        startAt: new Date(event.startAt),
                        endAt: new Date(event.endAt)
                    })
            }["CalendarView.useMemo[parsedEvents]"]).sort({
                "CalendarView.useMemo[parsedEvents]": (a, b)=>a.startAt.getTime() - b.startAt.getTime()
            }["CalendarView.useMemo[parsedEvents]"]);
        }
    }["CalendarView.useMemo[parsedEvents]"], [
        events
    ]);
    const [startYear, endYear] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CalendarView.useMemo": ()=>{
            if (parsedEvents.length === 0) {
                const currentYear = new Date().getFullYear();
                return [
                    currentYear,
                    currentYear
                ];
            }
            const minYear = parsedEvents.reduce({
                "CalendarView.useMemo.minYear": (min, event)=>Math.min(min, event.startAt.getFullYear())
            }["CalendarView.useMemo.minYear"], parsedEvents[0].startAt.getFullYear());
            const maxYear = parsedEvents.reduce({
                "CalendarView.useMemo.maxYear": (max, event)=>Math.max(max, event.endAt.getFullYear())
            }["CalendarView.useMemo.maxYear"], parsedEvents[0].endAt.getFullYear());
            return [
                minYear,
                maxYear
            ];
        }
    }["CalendarView.useMemo"], [
        parsedEvents
    ]);
    const legend = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CalendarView.useMemo[legend]": ()=>{
            const map = new Map();
            parsedEvents.forEach({
                "CalendarView.useMemo[legend]": (event)=>{
                    if (!map.has(event.status.id)) {
                        map.set(event.status.id, event.status);
                    }
                }
            }["CalendarView.useMemo[legend]"]);
            return Array.from(map.values());
        }
    }["CalendarView.useMemo[legend]"], [
        parsedEvents
    ]);
    const isLight = brand === 'versoholdings';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        className: `overflow-hidden rounded-2xl border shadow-sm ${isLight ? 'border-slate-200/80 bg-white' : 'border-border/80 bg-card text-card-foreground'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                className: `space-y-1.5 border-b p-6 ${isLight ? 'border-slate-200/80 bg-slate-50/40' : 'border-border/80 bg-muted/30'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                        className: `text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-foreground'}`,
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                        className: `max-w-2xl text-sm ${isLight ? 'text-slate-600' : 'text-muted-foreground'}`,
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                        lineNumber: 94,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "space-y-6 p-6",
                children: parsedEvents.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `rounded-2xl border border-dashed p-6 text-center text-sm ${isLight ? 'border-slate-200/90 bg-slate-50/80 text-slate-500' : 'border-border/80 bg-muted/30 text-muted-foreground'}`,
                    children: emptyMessage || 'No scheduled activity yet. Upcoming items will appear here automatically.'
                }, void 0, false, {
                    fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                    lineNumber: 98,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$kibo$2d$ui$2f$calendar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CalendarProvider"], {
                    defaultDate: new Date(),
                    defaultSelectedDate: new Date(),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CalendarSurface, {
                        startYear: startYear,
                        endYear: endYear,
                        legend: legend,
                        events: parsedEvents,
                        emptyMessage: emptyMessage,
                        brand: brand
                    }, void 0, false, {
                        fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                        lineNumber: 107,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                    lineNumber: 106,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
_s(CalendarView, "lDpK9qP+zpOkspYwtZyMxLWddAo=");
_c = CalendarView;
function CalendarSurface({ startYear, endYear, legend, events, emptyMessage, brand = 'versotech' }) {
    _s1();
    const { selectedDate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$kibo$2d$ui$2f$calendar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCalendar"])();
    const [modalOpen, setModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [clickedDate, setClickedDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const dayEvents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CalendarSurface.useMemo[dayEvents]": ()=>{
            const date = clickedDate || selectedDate;
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);
            return events.filter({
                "CalendarSurface.useMemo[dayEvents]": (event)=>event.startAt <= dayEnd && event.endAt >= dayStart
            }["CalendarSurface.useMemo[dayEvents]"]);
        }
    }["CalendarSurface.useMemo[dayEvents]"], [
        events,
        selectedDate,
        clickedDate
    ]);
    const handleDayClick = (date)=>{
        setClickedDate(date);
        setModalOpen(true);
    };
    const isLight = brand === 'versoholdings';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `rounded-2xl border p-5 shadow-sm ${isLight ? 'border-slate-200/80 bg-white/90' : 'border-border/80 bg-muted/40'}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$kibo$2d$ui$2f$calendar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CalendarDate"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$kibo$2d$ui$2f$calendar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CalendarDatePicker"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$kibo$2d$ui$2f$calendar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CalendarMonthPicker"], {
                                    brand: brand
                                }, void 0, false, {
                                    fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                                    lineNumber: 166,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$kibo$2d$ui$2f$calendar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CalendarYearPicker"], {
                                    start: startYear,
                                    end: endYear,
                                    brand: brand
                                }, void 0, false, {
                                    fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                                    lineNumber: 167,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                            lineNumber: 165,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$kibo$2d$ui$2f$calendar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CalendarDatePagination"], {
                            brand: brand
                        }, void 0, false, {
                            fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                            lineNumber: 169,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                    lineNumber: 164,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this),
            legend.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-2",
                children: legend.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "outline",
                        className: `gap-2 rounded-full px-3 py-1 text-xs ${isLight ? 'border-slate-200/80 bg-slate-50 text-slate-600' : 'border-border bg-muted/60 text-foreground'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "h-2 w-2 rounded-full",
                                style: {
                                    backgroundColor: entry.color || '#4f46e5'
                                }
                            }, void 0, false, {
                                fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                                lineNumber: 183,
                                columnNumber: 15
                            }, this),
                            entry.name
                        ]
                    }, entry.id, true, {
                        fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                        lineNumber: 176,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                lineNumber: 174,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `space-y-5 rounded-2xl border p-5 shadow-sm ${isLight ? 'border-slate-200/80 bg-white' : 'border-border/80 bg-card'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$kibo$2d$ui$2f$calendar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CalendarHeader"], {
                        brand: brand
                    }, void 0, false, {
                        fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                        lineNumber: 198,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$kibo$2d$ui$2f$calendar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CalendarBody"], {
                        features: events,
                        brand: brand,
                        onDayClick: handleDayClick
                    }, void 0, false, {
                        fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                lineNumber: 193,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$calendar$2f$calendar$2d$day$2d$modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CalendarDayModal"], {
                open: modalOpen,
                onOpenChange: setModalOpen,
                date: clickedDate,
                events: dayEvents,
                brand: brand
            }, void 0, false, {
                fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
                lineNumber: 202,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/versotech-portal/src/components/calendar/calendar-view.tsx",
        lineNumber: 158,
        columnNumber: 5
    }, this);
}
_s1(CalendarSurface, "RMcXlfrWhlInaP7T/xOzZhMDhKQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$kibo$2d$ui$2f$calendar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCalendar"]
    ];
});
_c1 = CalendarSurface;
var _c, _c1;
__turbopack_context__.k.register(_c, "CalendarView");
__turbopack_context__.k.register(_c1, "CalendarSurface");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/versotech-portal/src/components/calendar/calendar-split-view.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarSplitView",
    ()=>CalendarSplitView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$calendar$2f$calendar$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/components/calendar/calendar-view.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function CalendarSplitViewInner({ calendarEvents, emptyCalendarMessage, brand = 'versotech' }) {
    _s();
    const calendarData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CalendarSplitViewInner.useMemo[calendarData]": ()=>calendarEvents
    }["CalendarSplitViewInner.useMemo[calendarData]"], [
        calendarEvents
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$components$2f$calendar$2f$calendar$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CalendarView"], {
            title: "Schedule",
            description: "Upcoming deadlines, deliverables, and deal activity.",
            events: calendarData,
            emptyMessage: emptyCalendarMessage,
            brand: brand
        }, void 0, false, {
            fileName: "[project]/versotech-portal/src/components/calendar/calendar-split-view.tsx",
            lineNumber: 22,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/calendar/calendar-split-view.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_s(CalendarSplitViewInner, "KWuRo9SM0aXyX2GegErjEuzqD0g=");
_c = CalendarSplitViewInner;
function CalendarSplitView(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CalendarSplitViewFallback, {
            brand: props.brand
        }, void 0, false, {
            fileName: "[project]/versotech-portal/src/components/calendar/calendar-split-view.tsx",
            lineNumber: 35,
            columnNumber: 25
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CalendarSplitViewInner, {
            ...props
        }, void 0, false, {
            fileName: "[project]/versotech-portal/src/components/calendar/calendar-split-view.tsx",
            lineNumber: 36,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/calendar/calendar-split-view.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_c1 = CalendarSplitView;
function CalendarSplitViewFallback({ brand = 'versotech' }) {
    const isLight = brand === 'versoholdings';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `h-96 w-full animate-pulse rounded-2xl border ${isLight ? 'border-slate-200/80 bg-slate-100/60' : 'border-border bg-muted/30'}`
    }, void 0, false, {
        fileName: "[project]/versotech-portal/src/components/calendar/calendar-split-view.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
_c2 = CalendarSplitViewFallback;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "CalendarSplitViewInner");
__turbopack_context__.k.register(_c1, "CalendarSplitView");
__turbopack_context__.k.register(_c2, "CalendarSplitViewFallback");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=versotech-portal_src_components_b5f59fed._.js.map