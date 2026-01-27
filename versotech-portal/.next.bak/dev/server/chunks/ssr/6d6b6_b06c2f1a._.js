module.exports = [
"[project]/versotech-portal/node_modules/@radix-ui/react-tabs/dist/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Content",
    ()=>Content,
    "List",
    ()=>List,
    "Root",
    ()=>Root2,
    "Tabs",
    ()=>Tabs,
    "TabsContent",
    ()=>TabsContent,
    "TabsList",
    ()=>TabsList,
    "TabsTrigger",
    ()=>TabsTrigger,
    "Trigger",
    ()=>Trigger,
    "createTabsScope",
    ()=>createTabsScope
]);
// src/tabs.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/primitive/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$context$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-context/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$roving$2d$focus$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-roving-focus/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$presence$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-presence/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-primitive/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$direction$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-direction/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$controllable$2d$state$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$id$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-id/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
var TABS_NAME = "Tabs";
var [createTabsContext, createTabsScope] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$context$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContextScope"])(TABS_NAME, [
    __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$roving$2d$focus$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createRovingFocusGroupScope"]
]);
var useRovingFocusGroupScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$roving$2d$focus$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createRovingFocusGroupScope"])();
var [TabsProvider, useTabsContext] = createTabsContext(TABS_NAME);
var Tabs = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeTabs, value: valueProp, onValueChange, defaultValue, orientation = "horizontal", dir, activationMode = "automatic", ...tabsProps } = props;
    const direction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$direction$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDirection"])(dir);
    const [value, setValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$controllable$2d$state$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useControllableState"])({
        prop: valueProp,
        onChange: onValueChange,
        defaultProp: defaultValue ?? "",
        caller: TABS_NAME
    });
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(TabsProvider, {
        scope: __scopeTabs,
        baseId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$id$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])(),
        value,
        onValueChange: setValue,
        orientation,
        dir: direction,
        activationMode,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Primitive"].div, {
            dir: direction,
            "data-orientation": orientation,
            ...tabsProps,
            ref: forwardedRef
        })
    });
});
Tabs.displayName = TABS_NAME;
var TAB_LIST_NAME = "TabsList";
var TabsList = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeTabs, loop = true, ...listProps } = props;
    const context = useTabsContext(TAB_LIST_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$roving$2d$focus$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation: context.orientation,
        dir: context.dir,
        loop,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Primitive"].div, {
            role: "tablist",
            "aria-orientation": context.orientation,
            ...listProps,
            ref: forwardedRef
        })
    });
});
TabsList.displayName = TAB_LIST_NAME;
var TRIGGER_NAME = "TabsTrigger";
var TabsTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeTabs, value, disabled = false, ...triggerProps } = props;
    const context = useTabsContext(TRIGGER_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$roving$2d$focus$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Item"], {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: isSelected,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Primitive"].button, {
            type: "button",
            role: "tab",
            "aria-selected": isSelected,
            "aria-controls": contentId,
            "data-state": isSelected ? "active" : "inactive",
            "data-disabled": disabled ? "" : void 0,
            disabled,
            id: triggerId,
            ...triggerProps,
            ref: forwardedRef,
            onMouseDown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["composeEventHandlers"])(props.onMouseDown, (event)=>{
                if (!disabled && event.button === 0 && event.ctrlKey === false) {
                    context.onValueChange(value);
                } else {
                    event.preventDefault();
                }
            }),
            onKeyDown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["composeEventHandlers"])(props.onKeyDown, (event)=>{
                if ([
                    " ",
                    "Enter"
                ].includes(event.key)) context.onValueChange(value);
            }),
            onFocus: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["composeEventHandlers"])(props.onFocus, ()=>{
                const isAutomaticActivation = context.activationMode !== "manual";
                if (!isSelected && !disabled && isAutomaticActivation) {
                    context.onValueChange(value);
                }
            })
        })
    });
});
TabsTrigger.displayName = TRIGGER_NAME;
var CONTENT_NAME = "TabsContent";
var TabsContent = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeTabs, value, forceMount, children, ...contentProps } = props;
    const context = useTabsContext(CONTENT_NAME, __scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    const isMountAnimationPreventedRef = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](isSelected);
    __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        const rAF = requestAnimationFrame(()=>isMountAnimationPreventedRef.current = false);
        return ()=>cancelAnimationFrame(rAF);
    }, []);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$presence$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Presence"], {
        present: forceMount || isSelected,
        children: ({ present })=>/* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Primitive"].div, {
                "data-state": isSelected ? "active" : "inactive",
                "data-orientation": context.orientation,
                role: "tabpanel",
                "aria-labelledby": triggerId,
                hidden: !present,
                id: contentId,
                tabIndex: 0,
                ...contentProps,
                ref: forwardedRef,
                style: {
                    ...props.style,
                    animationDuration: isMountAnimationPreventedRef.current ? "0s" : void 0
                },
                children: present && children
            })
    });
});
TabsContent.displayName = CONTENT_NAME;
function makeTriggerId(baseId, value) {
    return `${baseId}-trigger-${value}`;
}
function makeContentId(baseId, value) {
    return `${baseId}-content-${value}`;
}
var Root2 = Tabs;
var List = TabsList;
var Trigger = TabsTrigger;
var Content = TabsContent;
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/versotech-portal/node_modules/@radix-ui/react-checkbox/dist/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Checkbox",
    ()=>Checkbox,
    "CheckboxIndicator",
    ()=>CheckboxIndicator,
    "Indicator",
    ()=>CheckboxIndicator,
    "Root",
    ()=>Checkbox,
    "createCheckboxScope",
    ()=>createCheckboxScope,
    "unstable_BubbleInput",
    ()=>CheckboxBubbleInput,
    "unstable_CheckboxBubbleInput",
    ()=>CheckboxBubbleInput,
    "unstable_CheckboxProvider",
    ()=>CheckboxProvider,
    "unstable_CheckboxTrigger",
    ()=>CheckboxTrigger,
    "unstable_Provider",
    ()=>CheckboxProvider,
    "unstable_Trigger",
    ()=>CheckboxTrigger
]);
// src/checkbox.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$compose$2d$refs$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-compose-refs/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$context$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-context/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/primitive/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$controllable$2d$state$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$previous$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-use-previous/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$size$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-use-size/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$presence$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-presence/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-primitive/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
var CHECKBOX_NAME = "Checkbox";
var [createCheckboxContext, createCheckboxScope] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$context$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContextScope"])(CHECKBOX_NAME);
var [CheckboxProviderImpl, useCheckboxContext] = createCheckboxContext(CHECKBOX_NAME);
function CheckboxProvider(props) {
    const { __scopeCheckbox, checked: checkedProp, children, defaultChecked, disabled, form, name, onCheckedChange, required, value = "on", // @ts-expect-error
    internal_do_not_use_render } = props;
    const [checked, setChecked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$controllable$2d$state$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useControllableState"])({
        prop: checkedProp,
        defaultProp: defaultChecked ?? false,
        onChange: onCheckedChange,
        caller: CHECKBOX_NAME
    });
    const [control, setControl] = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](null);
    const [bubbleInput, setBubbleInput] = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](null);
    const hasConsumerStoppedPropagationRef = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](false);
    const isFormControl = control ? !!form || !!control.closest("form") : // We set this to true by default so that events bubble to forms without JS (SSR)
    true;
    const context = {
        checked,
        disabled,
        setChecked,
        control,
        setControl,
        name,
        form,
        value,
        hasConsumerStoppedPropagationRef,
        required,
        defaultChecked: isIndeterminate(defaultChecked) ? false : defaultChecked,
        isFormControl,
        bubbleInput,
        setBubbleInput
    };
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(CheckboxProviderImpl, {
        scope: __scopeCheckbox,
        ...context,
        children: isFunction(internal_do_not_use_render) ? internal_do_not_use_render(context) : children
    });
}
var TRIGGER_NAME = "CheckboxTrigger";
var CheckboxTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ __scopeCheckbox, onKeyDown, onClick, ...checkboxProps }, forwardedRef)=>{
    const { control, value, disabled, checked, required, setControl, setChecked, hasConsumerStoppedPropagationRef, isFormControl, bubbleInput } = useCheckboxContext(TRIGGER_NAME, __scopeCheckbox);
    const composedRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$compose$2d$refs$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useComposedRefs"])(forwardedRef, setControl);
    const initialCheckedStateRef = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](checked);
    __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        const form = control?.form;
        if (form) {
            const reset = ()=>setChecked(initialCheckedStateRef.current);
            form.addEventListener("reset", reset);
            return ()=>form.removeEventListener("reset", reset);
        }
    }, [
        control,
        setChecked
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Primitive"].button, {
        type: "button",
        role: "checkbox",
        "aria-checked": isIndeterminate(checked) ? "mixed" : checked,
        "aria-required": required,
        "data-state": getState(checked),
        "data-disabled": disabled ? "" : void 0,
        disabled,
        value,
        ...checkboxProps,
        ref: composedRefs,
        onKeyDown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["composeEventHandlers"])(onKeyDown, (event)=>{
            if (event.key === "Enter") event.preventDefault();
        }),
        onClick: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["composeEventHandlers"])(onClick, (event)=>{
            setChecked((prevChecked)=>isIndeterminate(prevChecked) ? true : !prevChecked);
            if (bubbleInput && isFormControl) {
                hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
                if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
        })
    });
});
CheckboxTrigger.displayName = TRIGGER_NAME;
var Checkbox = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeCheckbox, name, checked, defaultChecked, required, disabled, value, onCheckedChange, form, ...checkboxProps } = props;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(CheckboxProvider, {
        __scopeCheckbox,
        checked,
        defaultChecked,
        disabled,
        required,
        onCheckedChange,
        name,
        form,
        value,
        internal_do_not_use_render: ({ isFormControl })=>/* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(CheckboxTrigger, {
                        ...checkboxProps,
                        ref: forwardedRef,
                        __scopeCheckbox
                    }),
                    isFormControl && /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(CheckboxBubbleInput, {
                        __scopeCheckbox
                    })
                ]
            })
    });
});
Checkbox.displayName = CHECKBOX_NAME;
var INDICATOR_NAME = "CheckboxIndicator";
var CheckboxIndicator = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeCheckbox, forceMount, ...indicatorProps } = props;
    const context = useCheckboxContext(INDICATOR_NAME, __scopeCheckbox);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$presence$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Presence"], {
        present: forceMount || isIndeterminate(context.checked) || context.checked === true,
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Primitive"].span, {
            "data-state": getState(context.checked),
            "data-disabled": context.disabled ? "" : void 0,
            ...indicatorProps,
            ref: forwardedRef,
            style: {
                pointerEvents: "none",
                ...props.style
            }
        })
    });
});
CheckboxIndicator.displayName = INDICATOR_NAME;
var BUBBLE_INPUT_NAME = "CheckboxBubbleInput";
var CheckboxBubbleInput = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ __scopeCheckbox, ...props }, forwardedRef)=>{
    const { control, hasConsumerStoppedPropagationRef, checked, defaultChecked, required, disabled, name, value, form, bubbleInput, setBubbleInput } = useCheckboxContext(BUBBLE_INPUT_NAME, __scopeCheckbox);
    const composedRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$compose$2d$refs$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useComposedRefs"])(forwardedRef, setBubbleInput);
    const prevChecked = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$previous$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePrevious"])(checked);
    const controlSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$size$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSize"])(control);
    __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        const input = bubbleInput;
        if (!input) return;
        const inputProto = window.HTMLInputElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(inputProto, "checked");
        const setChecked = descriptor.set;
        const bubbles = !hasConsumerStoppedPropagationRef.current;
        if (prevChecked !== checked && setChecked) {
            const event = new Event("click", {
                bubbles
            });
            input.indeterminate = isIndeterminate(checked);
            setChecked.call(input, isIndeterminate(checked) ? false : checked);
            input.dispatchEvent(event);
        }
    }, [
        bubbleInput,
        prevChecked,
        checked,
        hasConsumerStoppedPropagationRef
    ]);
    const defaultCheckedRef = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](isIndeterminate(checked) ? false : checked);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Primitive"].input, {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: defaultChecked ?? defaultCheckedRef.current,
        required,
        disabled,
        name,
        value,
        form,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
            ...props.style,
            ...controlSize,
            position: "absolute",
            pointerEvents: "none",
            opacity: 0,
            margin: 0,
            // We transform because the input is absolutely positioned but we have
            // rendered it **after** the button. This pulls it back to sit on top
            // of the button.
            transform: "translateX(-100%)"
        }
    });
});
CheckboxBubbleInput.displayName = BUBBLE_INPUT_NAME;
function isFunction(value) {
    return typeof value === "function";
}
function isIndeterminate(checked) {
    return checked === "indeterminate";
}
function getState(checked) {
    return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/flag-triangle-right.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>FlagTriangleRight
]);
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M6 22V2.8a.8.8 0 0 1 1.17-.71l11.38 5.69a.8.8 0 0 1 0 1.44L6 15.5",
            key: "kfjsu0"
        }
    ]
];
const FlagTriangleRight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("flag-triangle-right", __iconNode);
;
 //# sourceMappingURL=flag-triangle-right.js.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/flag-triangle-right.js [app-ssr] (ecmascript) <export default as FlagTriangleRight>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FlagTriangleRight",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2d$triangle$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2d$triangle$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/flag-triangle-right.js [app-ssr] (ecmascript)");
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>LayoutGrid
]);
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "rect",
        {
            width: "7",
            height: "7",
            x: "3",
            y: "3",
            rx: "1",
            key: "1g98yp"
        }
    ],
    [
        "rect",
        {
            width: "7",
            height: "7",
            x: "14",
            y: "3",
            rx: "1",
            key: "6d4xhi"
        }
    ],
    [
        "rect",
        {
            width: "7",
            height: "7",
            x: "14",
            y: "14",
            rx: "1",
            key: "nxv5o0"
        }
    ],
    [
        "rect",
        {
            width: "7",
            height: "7",
            x: "3",
            y: "14",
            rx: "1",
            key: "1bb6yr"
        }
    ]
];
const LayoutGrid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("layout-grid", __iconNode);
;
 //# sourceMappingURL=layout-grid.js.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-ssr] (ecmascript) <export default as LayoutGrid>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LayoutGrid",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-ssr] (ecmascript)");
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/list.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>List
]);
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M3 5h.01",
            key: "18ugdj"
        }
    ],
    [
        "path",
        {
            d: "M3 12h.01",
            key: "nlz23k"
        }
    ],
    [
        "path",
        {
            d: "M3 19h.01",
            key: "noohij"
        }
    ],
    [
        "path",
        {
            d: "M8 5h13",
            key: "1pao27"
        }
    ],
    [
        "path",
        {
            d: "M8 12h13",
            key: "1za7za"
        }
    ],
    [
        "path",
        {
            d: "M8 19h13",
            key: "m83p4d"
        }
    ]
];
const List = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("list", __iconNode);
;
 //# sourceMappingURL=list.js.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/list.js [app-ssr] (ecmascript) <export default as List>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "List",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/list.js [app-ssr] (ecmascript)");
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/table.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Table
]);
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 3v18",
            key: "108xh3"
        }
    ],
    [
        "rect",
        {
            width: "18",
            height: "18",
            x: "3",
            y: "3",
            rx: "2",
            key: "afitv7"
        }
    ],
    [
        "path",
        {
            d: "M3 9h18",
            key: "1pudct"
        }
    ],
    [
        "path",
        {
            d: "M3 15h18",
            key: "5xshup"
        }
    ]
];
const Table = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("table", __iconNode);
;
 //# sourceMappingURL=table.js.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/table.js [app-ssr] (ecmascript) <export default as Table>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Table",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$table$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$table$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/table.js [app-ssr] (ecmascript)");
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Eye
]);
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
            key: "1nclc0"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "3",
            key: "1v7zrd"
        }
    ]
];
const Eye = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("eye", __iconNode);
;
 //# sourceMappingURL=eye.js.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as Eye>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Eye",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript)");
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/pencil.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Pencil
]);
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
            key: "1a8usu"
        }
    ],
    [
        "path",
        {
            d: "m15 5 4 4",
            key: "1mk7zo"
        }
    ]
];
const Pencil = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("pencil", __iconNode);
;
 //# sourceMappingURL=pencil.js.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/pencil.js [app-ssr] (ecmascript) <export default as Pencil>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Pencil",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/pencil.js [app-ssr] (ecmascript)");
}),
"[project]/versotech-portal/node_modules/@dnd-kit/utilities/dist/utilities.esm.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CSS",
    ()=>CSS,
    "add",
    ()=>add,
    "canUseDOM",
    ()=>canUseDOM,
    "findFirstFocusableNode",
    ()=>findFirstFocusableNode,
    "getEventCoordinates",
    ()=>getEventCoordinates,
    "getOwnerDocument",
    ()=>getOwnerDocument,
    "getWindow",
    ()=>getWindow,
    "hasViewportRelativeCoordinates",
    ()=>hasViewportRelativeCoordinates,
    "isDocument",
    ()=>isDocument,
    "isHTMLElement",
    ()=>isHTMLElement,
    "isKeyboardEvent",
    ()=>isKeyboardEvent,
    "isNode",
    ()=>isNode,
    "isSVGElement",
    ()=>isSVGElement,
    "isTouchEvent",
    ()=>isTouchEvent,
    "isWindow",
    ()=>isWindow,
    "subtract",
    ()=>subtract,
    "useCombinedRefs",
    ()=>useCombinedRefs,
    "useEvent",
    ()=>useEvent,
    "useInterval",
    ()=>useInterval,
    "useIsomorphicLayoutEffect",
    ()=>useIsomorphicLayoutEffect,
    "useLatestValue",
    ()=>useLatestValue,
    "useLazyMemo",
    ()=>useLazyMemo,
    "useNodeRef",
    ()=>useNodeRef,
    "usePrevious",
    ()=>usePrevious,
    "useUniqueId",
    ()=>useUniqueId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
function useCombinedRefs() {
    for(var _len = arguments.length, refs = new Array(_len), _key = 0; _key < _len; _key++){
        refs[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(node)=>{
            refs.forEach((ref)=>ref(node));
        }, refs);
}
// https://github.com/facebook/react/blob/master/packages/shared/ExecutionEnvironment.js
const canUseDOM = ("TURBOPACK compile-time value", "undefined") !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined';
function isWindow(element) {
    const elementString = Object.prototype.toString.call(element);
    return elementString === '[object Window]' || // In Electron context the Window object serializes to [object global]
    elementString === '[object global]';
}
function isNode(node) {
    return 'nodeType' in node;
}
function getWindow(target) {
    var _target$ownerDocument, _target$ownerDocument2;
    if (!target) {
        return window;
    }
    if (isWindow(target)) {
        return target;
    }
    if (!isNode(target)) {
        return window;
    }
    return (_target$ownerDocument = (_target$ownerDocument2 = target.ownerDocument) == null ? void 0 : _target$ownerDocument2.defaultView) != null ? _target$ownerDocument : window;
}
function isDocument(node) {
    const { Document } = getWindow(node);
    return node instanceof Document;
}
function isHTMLElement(node) {
    if (isWindow(node)) {
        return false;
    }
    return node instanceof getWindow(node).HTMLElement;
}
function isSVGElement(node) {
    return node instanceof getWindow(node).SVGElement;
}
function getOwnerDocument(target) {
    if (!target) {
        return document;
    }
    if (isWindow(target)) {
        return target.document;
    }
    if (!isNode(target)) {
        return document;
    }
    if (isDocument(target)) {
        return target;
    }
    if (isHTMLElement(target) || isSVGElement(target)) {
        return target.ownerDocument;
    }
    return document;
}
/**
 * A hook that resolves to useEffect on the server and useLayoutEffect on the client
 * @param callback {function} Callback function that is invoked when the dependencies of the hook change
 */ const useIsomorphicLayoutEffect = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"];
function useEvent(handler) {
    const handlerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(handler);
    useIsomorphicLayoutEffect(()=>{
        handlerRef.current = handler;
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(function() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        return handlerRef.current == null ? void 0 : handlerRef.current(...args);
    }, []);
}
function useInterval() {
    const intervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const set = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((listener, duration)=>{
        intervalRef.current = setInterval(listener, duration);
    }, []);
    const clear = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);
    return [
        set,
        clear
    ];
}
function useLatestValue(value, dependencies) {
    if (dependencies === void 0) {
        dependencies = [
            value
        ];
    }
    const valueRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(value);
    useIsomorphicLayoutEffect(()=>{
        if (valueRef.current !== value) {
            valueRef.current = value;
        }
    }, dependencies);
    return valueRef;
}
function useLazyMemo(callback, dependencies) {
    const valueRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const newValue = callback(valueRef.current);
        valueRef.current = newValue;
        return newValue;
    }, [
        ...dependencies
    ]);
}
function useNodeRef(onChange) {
    const onChangeHandler = useEvent(onChange);
    const node = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const setNodeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((element)=>{
        if (element !== node.current) {
            onChangeHandler == null ? void 0 : onChangeHandler(element, node.current);
        }
        node.current = element;
    }, []);
    return [
        node,
        setNodeRef
    ];
}
function usePrevious(value) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        ref.current = value;
    }, [
        value
    ]);
    return ref.current;
}
let ids = {};
function useUniqueId(prefix, value) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (value) {
            return value;
        }
        const id = ids[prefix] == null ? 0 : ids[prefix] + 1;
        ids[prefix] = id;
        return prefix + "-" + id;
    }, [
        prefix,
        value
    ]);
}
function createAdjustmentFn(modifier) {
    return function(object) {
        for(var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
            adjustments[_key - 1] = arguments[_key];
        }
        return adjustments.reduce((accumulator, adjustment)=>{
            const entries = Object.entries(adjustment);
            for (const [key, valueAdjustment] of entries){
                const value = accumulator[key];
                if (value != null) {
                    accumulator[key] = value + modifier * valueAdjustment;
                }
            }
            return accumulator;
        }, {
            ...object
        });
    };
}
const add = /*#__PURE__*/ createAdjustmentFn(1);
const subtract = /*#__PURE__*/ createAdjustmentFn(-1);
function hasViewportRelativeCoordinates(event) {
    return 'clientX' in event && 'clientY' in event;
}
function isKeyboardEvent(event) {
    if (!event) {
        return false;
    }
    const { KeyboardEvent } = getWindow(event.target);
    return KeyboardEvent && event instanceof KeyboardEvent;
}
function isTouchEvent(event) {
    if (!event) {
        return false;
    }
    const { TouchEvent } = getWindow(event.target);
    return TouchEvent && event instanceof TouchEvent;
}
/**
 * Returns the normalized x and y coordinates for mouse and touch events.
 */ function getEventCoordinates(event) {
    if (isTouchEvent(event)) {
        if (event.touches && event.touches.length) {
            const { clientX: x, clientY: y } = event.touches[0];
            return {
                x,
                y
            };
        } else if (event.changedTouches && event.changedTouches.length) {
            const { clientX: x, clientY: y } = event.changedTouches[0];
            return {
                x,
                y
            };
        }
    }
    if (hasViewportRelativeCoordinates(event)) {
        return {
            x: event.clientX,
            y: event.clientY
        };
    }
    return null;
}
const CSS = /*#__PURE__*/ Object.freeze({
    Translate: {
        toString (transform) {
            if (!transform) {
                return;
            }
            const { x, y } = transform;
            return "translate3d(" + (x ? Math.round(x) : 0) + "px, " + (y ? Math.round(y) : 0) + "px, 0)";
        }
    },
    Scale: {
        toString (transform) {
            if (!transform) {
                return;
            }
            const { scaleX, scaleY } = transform;
            return "scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
        }
    },
    Transform: {
        toString (transform) {
            if (!transform) {
                return;
            }
            return [
                CSS.Translate.toString(transform),
                CSS.Scale.toString(transform)
            ].join(' ');
        }
    },
    Transition: {
        toString (_ref) {
            let { property, duration, easing } = _ref;
            return property + " " + duration + "ms " + easing;
        }
    }
});
const SELECTOR = 'a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]';
function findFirstFocusableNode(element) {
    if (element.matches(SELECTOR)) {
        return element;
    }
    return element.querySelector(SELECTOR);
}
;
 //# sourceMappingURL=utilities.esm.js.map
}),
"[project]/versotech-portal/node_modules/@dnd-kit/accessibility/dist/accessibility.esm.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HiddenText",
    ()=>HiddenText,
    "LiveRegion",
    ()=>LiveRegion,
    "useAnnouncement",
    ()=>useAnnouncement
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
const hiddenStyles = {
    display: 'none'
};
function HiddenText(_ref) {
    let { id, value } = _ref;
    return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
        id: id,
        style: hiddenStyles
    }, value);
}
function LiveRegion(_ref) {
    let { id, announcement, ariaLiveType = "assertive" } = _ref;
    // Hide element visually but keep it readable by screen readers
    const visuallyHidden = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        margin: -1,
        border: 0,
        padding: 0,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(100%)',
        whiteSpace: 'nowrap'
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement("div", {
        id: id,
        style: visuallyHidden,
        role: "status",
        "aria-live": ariaLiveType,
        "aria-atomic": true
    }, announcement);
}
function useAnnouncement() {
    const [announcement, setAnnouncement] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const announce = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((value)=>{
        if (value != null) {
            setAnnouncement(value);
        }
    }, []);
    return {
        announce,
        announcement
    };
}
;
 //# sourceMappingURL=accessibility.esm.js.map
}),
"[project]/versotech-portal/node_modules/@dnd-kit/core/dist/core.esm.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AutoScrollActivator",
    ()=>AutoScrollActivator,
    "DndContext",
    ()=>DndContext,
    "DragOverlay",
    ()=>DragOverlay,
    "KeyboardCode",
    ()=>KeyboardCode,
    "KeyboardSensor",
    ()=>KeyboardSensor,
    "MeasuringFrequency",
    ()=>MeasuringFrequency,
    "MeasuringStrategy",
    ()=>MeasuringStrategy,
    "MouseSensor",
    ()=>MouseSensor,
    "PointerSensor",
    ()=>PointerSensor,
    "TouchSensor",
    ()=>TouchSensor,
    "TraversalOrder",
    ()=>TraversalOrder,
    "applyModifiers",
    ()=>applyModifiers,
    "closestCenter",
    ()=>closestCenter,
    "closestCorners",
    ()=>closestCorners,
    "defaultAnnouncements",
    ()=>defaultAnnouncements,
    "defaultCoordinates",
    ()=>defaultCoordinates,
    "defaultDropAnimation",
    ()=>defaultDropAnimationConfiguration,
    "defaultDropAnimationSideEffects",
    ()=>defaultDropAnimationSideEffects,
    "defaultKeyboardCoordinateGetter",
    ()=>defaultKeyboardCoordinateGetter,
    "defaultScreenReaderInstructions",
    ()=>defaultScreenReaderInstructions,
    "getClientRect",
    ()=>getClientRect,
    "getFirstCollision",
    ()=>getFirstCollision,
    "getScrollableAncestors",
    ()=>getScrollableAncestors,
    "pointerWithin",
    ()=>pointerWithin,
    "rectIntersection",
    ()=>rectIntersection,
    "useDndContext",
    ()=>useDndContext,
    "useDndMonitor",
    ()=>useDndMonitor,
    "useDraggable",
    ()=>useDraggable,
    "useDroppable",
    ()=>useDroppable,
    "useSensor",
    ()=>useSensor,
    "useSensors",
    ()=>useSensors
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@dnd-kit/utilities/dist/utilities.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$accessibility$2f$dist$2f$accessibility$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@dnd-kit/accessibility/dist/accessibility.esm.js [app-ssr] (ecmascript)");
;
;
;
;
const DndMonitorContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function useDndMonitor(listener) {
    const registerListener = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(DndMonitorContext);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!registerListener) {
            throw new Error('useDndMonitor must be used within a children of <DndContext>');
        }
        const unsubscribe = registerListener(listener);
        return unsubscribe;
    }, [
        listener,
        registerListener
    ]);
}
function useDndMonitorProvider() {
    const [listeners] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new Set());
    const registerListener = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((listener)=>{
        listeners.add(listener);
        return ()=>listeners.delete(listener);
    }, [
        listeners
    ]);
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((_ref)=>{
        let { type, event } = _ref;
        listeners.forEach((listener)=>{
            var _listener$type;
            return (_listener$type = listener[type]) == null ? void 0 : _listener$type.call(listener, event);
        });
    }, [
        listeners
    ]);
    return [
        dispatch,
        registerListener
    ];
}
const defaultScreenReaderInstructions = {
    draggable: "\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  "
};
const defaultAnnouncements = {
    onDragStart (_ref) {
        let { active } = _ref;
        return "Picked up draggable item " + active.id + ".";
    },
    onDragOver (_ref2) {
        let { active, over } = _ref2;
        if (over) {
            return "Draggable item " + active.id + " was moved over droppable area " + over.id + ".";
        }
        return "Draggable item " + active.id + " is no longer over a droppable area.";
    },
    onDragEnd (_ref3) {
        let { active, over } = _ref3;
        if (over) {
            return "Draggable item " + active.id + " was dropped over droppable area " + over.id;
        }
        return "Draggable item " + active.id + " was dropped.";
    },
    onDragCancel (_ref4) {
        let { active } = _ref4;
        return "Dragging was cancelled. Draggable item " + active.id + " was dropped.";
    }
};
function Accessibility(_ref) {
    let { announcements = defaultAnnouncements, container, hiddenTextDescribedById, screenReaderInstructions = defaultScreenReaderInstructions } = _ref;
    const { announce, announcement } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$accessibility$2f$dist$2f$accessibility$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAnnouncement"])();
    const liveRegionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUniqueId"])("DndLiveRegion");
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setMounted(true);
    }, []);
    useDndMonitor((0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            onDragStart (_ref2) {
                let { active } = _ref2;
                announce(announcements.onDragStart({
                    active
                }));
            },
            onDragMove (_ref3) {
                let { active, over } = _ref3;
                if (announcements.onDragMove) {
                    announce(announcements.onDragMove({
                        active,
                        over
                    }));
                }
            },
            onDragOver (_ref4) {
                let { active, over } = _ref4;
                announce(announcements.onDragOver({
                    active,
                    over
                }));
            },
            onDragEnd (_ref5) {
                let { active, over } = _ref5;
                announce(announcements.onDragEnd({
                    active,
                    over
                }));
            },
            onDragCancel (_ref6) {
                let { active, over } = _ref6;
                announce(announcements.onDragCancel({
                    active,
                    over
                }));
            }
        }), [
        announce,
        announcements
    ]));
    if (!mounted) {
        return null;
    }
    const markup = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, null, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$accessibility$2f$dist$2f$accessibility$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HiddenText"], {
        id: hiddenTextDescribedById,
        value: screenReaderInstructions.draggable
    }), __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$accessibility$2f$dist$2f$accessibility$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LiveRegion"], {
        id: liveRegionId,
        announcement: announcement
    }));
    return container ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(markup, container) : markup;
}
var Action;
(function(Action) {
    Action["DragStart"] = "dragStart";
    Action["DragMove"] = "dragMove";
    Action["DragEnd"] = "dragEnd";
    Action["DragCancel"] = "dragCancel";
    Action["DragOver"] = "dragOver";
    Action["RegisterDroppable"] = "registerDroppable";
    Action["SetDroppableDisabled"] = "setDroppableDisabled";
    Action["UnregisterDroppable"] = "unregisterDroppable";
})(Action || (Action = {}));
function noop() {}
function useSensor(sensor, options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            sensor,
            options: options != null ? options : {}
        }), [
        sensor,
        options
    ]);
}
function useSensors() {
    for(var _len = arguments.length, sensors = new Array(_len), _key = 0; _key < _len; _key++){
        sensors[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...sensors
        ].filter((sensor)=>sensor != null), [
        ...sensors
    ]);
}
const defaultCoordinates = /*#__PURE__*/ Object.freeze({
    x: 0,
    y: 0
});
/**
 * Returns the distance between two points
 */ function distanceBetween(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
function getRelativeTransformOrigin(event, rect) {
    const eventCoordinates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEventCoordinates"])(event);
    if (!eventCoordinates) {
        return '0 0';
    }
    const transformOrigin = {
        x: (eventCoordinates.x - rect.left) / rect.width * 100,
        y: (eventCoordinates.y - rect.top) / rect.height * 100
    };
    return transformOrigin.x + "% " + transformOrigin.y + "%";
}
/**
 * Sort collisions from smallest to greatest value
 */ function sortCollisionsAsc(_ref, _ref2) {
    let { data: { value: a } } = _ref;
    let { data: { value: b } } = _ref2;
    return a - b;
}
/**
 * Sort collisions from greatest to smallest value
 */ function sortCollisionsDesc(_ref3, _ref4) {
    let { data: { value: a } } = _ref3;
    let { data: { value: b } } = _ref4;
    return b - a;
}
/**
 * Returns the coordinates of the corners of a given rectangle:
 * [TopLeft {x, y}, TopRight {x, y}, BottomLeft {x, y}, BottomRight {x, y}]
 */ function cornersOfRectangle(_ref5) {
    let { left, top, height, width } = _ref5;
    return [
        {
            x: left,
            y: top
        },
        {
            x: left + width,
            y: top
        },
        {
            x: left,
            y: top + height
        },
        {
            x: left + width,
            y: top + height
        }
    ];
}
function getFirstCollision(collisions, property) {
    if (!collisions || collisions.length === 0) {
        return null;
    }
    const [firstCollision] = collisions;
    return property ? firstCollision[property] : firstCollision;
}
/**
 * Returns the coordinates of the center of a given ClientRect
 */ function centerOfRectangle(rect, left, top) {
    if (left === void 0) {
        left = rect.left;
    }
    if (top === void 0) {
        top = rect.top;
    }
    return {
        x: left + rect.width * 0.5,
        y: top + rect.height * 0.5
    };
}
/**
 * Returns the closest rectangles from an array of rectangles to the center of a given
 * rectangle.
 */ const closestCenter = (_ref)=>{
    let { collisionRect, droppableRects, droppableContainers } = _ref;
    const centerRect = centerOfRectangle(collisionRect, collisionRect.left, collisionRect.top);
    const collisions = [];
    for (const droppableContainer of droppableContainers){
        const { id } = droppableContainer;
        const rect = droppableRects.get(id);
        if (rect) {
            const distBetween = distanceBetween(centerOfRectangle(rect), centerRect);
            collisions.push({
                id,
                data: {
                    droppableContainer,
                    value: distBetween
                }
            });
        }
    }
    return collisions.sort(sortCollisionsAsc);
};
/**
 * Returns the closest rectangles from an array of rectangles to the corners of
 * another rectangle.
 */ const closestCorners = (_ref)=>{
    let { collisionRect, droppableRects, droppableContainers } = _ref;
    const corners = cornersOfRectangle(collisionRect);
    const collisions = [];
    for (const droppableContainer of droppableContainers){
        const { id } = droppableContainer;
        const rect = droppableRects.get(id);
        if (rect) {
            const rectCorners = cornersOfRectangle(rect);
            const distances = corners.reduce((accumulator, corner, index)=>{
                return accumulator + distanceBetween(rectCorners[index], corner);
            }, 0);
            const effectiveDistance = Number((distances / 4).toFixed(4));
            collisions.push({
                id,
                data: {
                    droppableContainer,
                    value: effectiveDistance
                }
            });
        }
    }
    return collisions.sort(sortCollisionsAsc);
};
/**
 * Returns the intersecting rectangle area between two rectangles
 */ function getIntersectionRatio(entry, target) {
    const top = Math.max(target.top, entry.top);
    const left = Math.max(target.left, entry.left);
    const right = Math.min(target.left + target.width, entry.left + entry.width);
    const bottom = Math.min(target.top + target.height, entry.top + entry.height);
    const width = right - left;
    const height = bottom - top;
    if (left < right && top < bottom) {
        const targetArea = target.width * target.height;
        const entryArea = entry.width * entry.height;
        const intersectionArea = width * height;
        const intersectionRatio = intersectionArea / (targetArea + entryArea - intersectionArea);
        return Number(intersectionRatio.toFixed(4));
    } // Rectangles do not overlap, or overlap has an area of zero (edge/corner overlap)
    return 0;
}
/**
 * Returns the rectangles that has the greatest intersection area with a given
 * rectangle in an array of rectangles.
 */ const rectIntersection = (_ref)=>{
    let { collisionRect, droppableRects, droppableContainers } = _ref;
    const collisions = [];
    for (const droppableContainer of droppableContainers){
        const { id } = droppableContainer;
        const rect = droppableRects.get(id);
        if (rect) {
            const intersectionRatio = getIntersectionRatio(rect, collisionRect);
            if (intersectionRatio > 0) {
                collisions.push({
                    id,
                    data: {
                        droppableContainer,
                        value: intersectionRatio
                    }
                });
            }
        }
    }
    return collisions.sort(sortCollisionsDesc);
};
/**
 * Check if a given point is contained within a bounding rectangle
 */ function isPointWithinRect(point, rect) {
    const { top, left, bottom, right } = rect;
    return top <= point.y && point.y <= bottom && left <= point.x && point.x <= right;
}
/**
 * Returns the rectangles that the pointer is hovering over
 */ const pointerWithin = (_ref)=>{
    let { droppableContainers, droppableRects, pointerCoordinates } = _ref;
    if (!pointerCoordinates) {
        return [];
    }
    const collisions = [];
    for (const droppableContainer of droppableContainers){
        const { id } = droppableContainer;
        const rect = droppableRects.get(id);
        if (rect && isPointWithinRect(pointerCoordinates, rect)) {
            /* There may be more than a single rectangle intersecting
       * with the pointer coordinates. In order to sort the
       * colliding rectangles, we measure the distance between
       * the pointer and the corners of the intersecting rectangle
       */ const corners = cornersOfRectangle(rect);
            const distances = corners.reduce((accumulator, corner)=>{
                return accumulator + distanceBetween(pointerCoordinates, corner);
            }, 0);
            const effectiveDistance = Number((distances / 4).toFixed(4));
            collisions.push({
                id,
                data: {
                    droppableContainer,
                    value: effectiveDistance
                }
            });
        }
    }
    return collisions.sort(sortCollisionsAsc);
};
function adjustScale(transform, rect1, rect2) {
    return {
        ...transform,
        scaleX: rect1 && rect2 ? rect1.width / rect2.width : 1,
        scaleY: rect1 && rect2 ? rect1.height / rect2.height : 1
    };
}
function getRectDelta(rect1, rect2) {
    return rect1 && rect2 ? {
        x: rect1.left - rect2.left,
        y: rect1.top - rect2.top
    } : defaultCoordinates;
}
function createRectAdjustmentFn(modifier) {
    return function adjustClientRect(rect) {
        for(var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
            adjustments[_key - 1] = arguments[_key];
        }
        return adjustments.reduce((acc, adjustment)=>({
                ...acc,
                top: acc.top + modifier * adjustment.y,
                bottom: acc.bottom + modifier * adjustment.y,
                left: acc.left + modifier * adjustment.x,
                right: acc.right + modifier * adjustment.x
            }), {
            ...rect
        });
    };
}
const getAdjustedRect = /*#__PURE__*/ createRectAdjustmentFn(1);
function parseTransform(transform) {
    if (transform.startsWith('matrix3d(')) {
        const transformArray = transform.slice(9, -1).split(/, /);
        return {
            x: +transformArray[12],
            y: +transformArray[13],
            scaleX: +transformArray[0],
            scaleY: +transformArray[5]
        };
    } else if (transform.startsWith('matrix(')) {
        const transformArray = transform.slice(7, -1).split(/, /);
        return {
            x: +transformArray[4],
            y: +transformArray[5],
            scaleX: +transformArray[0],
            scaleY: +transformArray[3]
        };
    }
    return null;
}
function inverseTransform(rect, transform, transformOrigin) {
    const parsedTransform = parseTransform(transform);
    if (!parsedTransform) {
        return rect;
    }
    const { scaleX, scaleY, x: translateX, y: translateY } = parsedTransform;
    const x = rect.left - translateX - (1 - scaleX) * parseFloat(transformOrigin);
    const y = rect.top - translateY - (1 - scaleY) * parseFloat(transformOrigin.slice(transformOrigin.indexOf(' ') + 1));
    const w = scaleX ? rect.width / scaleX : rect.width;
    const h = scaleY ? rect.height / scaleY : rect.height;
    return {
        width: w,
        height: h,
        top: y,
        right: x + w,
        bottom: y + h,
        left: x
    };
}
const defaultOptions = {
    ignoreTransform: false
};
/**
 * Returns the bounding client rect of an element relative to the viewport.
 */ function getClientRect(element, options) {
    if (options === void 0) {
        options = defaultOptions;
    }
    let rect = element.getBoundingClientRect();
    if (options.ignoreTransform) {
        const { transform, transformOrigin } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWindow"])(element).getComputedStyle(element);
        if (transform) {
            rect = inverseTransform(rect, transform, transformOrigin);
        }
    }
    const { top, left, width, height, bottom, right } = rect;
    return {
        top,
        left,
        width,
        height,
        bottom,
        right
    };
}
/**
 * Returns the bounding client rect of an element relative to the viewport.
 *
 * @remarks
 * The ClientRect returned by this method does not take into account transforms
 * applied to the element it measures.
 *
 */ function getTransformAgnosticClientRect(element) {
    return getClientRect(element, {
        ignoreTransform: true
    });
}
function getWindowClientRect(element) {
    const width = element.innerWidth;
    const height = element.innerHeight;
    return {
        top: 0,
        left: 0,
        right: width,
        bottom: height,
        width,
        height
    };
}
function isFixed(node, computedStyle) {
    if (computedStyle === void 0) {
        computedStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWindow"])(node).getComputedStyle(node);
    }
    return computedStyle.position === 'fixed';
}
function isScrollable(element, computedStyle) {
    if (computedStyle === void 0) {
        computedStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWindow"])(element).getComputedStyle(element);
    }
    const overflowRegex = /(auto|scroll|overlay)/;
    const properties = [
        'overflow',
        'overflowX',
        'overflowY'
    ];
    return properties.some((property)=>{
        const value = computedStyle[property];
        return typeof value === 'string' ? overflowRegex.test(value) : false;
    });
}
function getScrollableAncestors(element, limit) {
    const scrollParents = [];
    function findScrollableAncestors(node) {
        if (limit != null && scrollParents.length >= limit) {
            return scrollParents;
        }
        if (!node) {
            return scrollParents;
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDocument"])(node) && node.scrollingElement != null && !scrollParents.includes(node.scrollingElement)) {
            scrollParents.push(node.scrollingElement);
            return scrollParents;
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isHTMLElement"])(node) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSVGElement"])(node)) {
            return scrollParents;
        }
        if (scrollParents.includes(node)) {
            return scrollParents;
        }
        const computedStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWindow"])(element).getComputedStyle(node);
        if (node !== element) {
            if (isScrollable(node, computedStyle)) {
                scrollParents.push(node);
            }
        }
        if (isFixed(node, computedStyle)) {
            return scrollParents;
        }
        return findScrollableAncestors(node.parentNode);
    }
    if (!element) {
        return scrollParents;
    }
    return findScrollableAncestors(element);
}
function getFirstScrollableAncestor(node) {
    const [firstScrollableAncestor] = getScrollableAncestors(node, 1);
    return firstScrollableAncestor != null ? firstScrollableAncestor : null;
}
function getScrollableElement(element) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["canUseDOM"] || !element) {
        return null;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isWindow"])(element)) {
        return element;
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNode"])(element)) {
        return null;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDocument"])(element) || element === (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getOwnerDocument"])(element).scrollingElement) {
        return window;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isHTMLElement"])(element)) {
        return element;
    }
    return null;
}
function getScrollXCoordinate(element) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isWindow"])(element)) {
        return element.scrollX;
    }
    return element.scrollLeft;
}
function getScrollYCoordinate(element) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isWindow"])(element)) {
        return element.scrollY;
    }
    return element.scrollTop;
}
function getScrollCoordinates(element) {
    return {
        x: getScrollXCoordinate(element),
        y: getScrollYCoordinate(element)
    };
}
var Direction;
(function(Direction) {
    Direction[Direction["Forward"] = 1] = "Forward";
    Direction[Direction["Backward"] = -1] = "Backward";
})(Direction || (Direction = {}));
function isDocumentScrollingElement(element) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["canUseDOM"] || !element) {
        return false;
    }
    return element === document.scrollingElement;
}
function getScrollPosition(scrollingContainer) {
    const minScroll = {
        x: 0,
        y: 0
    };
    const dimensions = isDocumentScrollingElement(scrollingContainer) ? {
        height: window.innerHeight,
        width: window.innerWidth
    } : {
        height: scrollingContainer.clientHeight,
        width: scrollingContainer.clientWidth
    };
    const maxScroll = {
        x: scrollingContainer.scrollWidth - dimensions.width,
        y: scrollingContainer.scrollHeight - dimensions.height
    };
    const isTop = scrollingContainer.scrollTop <= minScroll.y;
    const isLeft = scrollingContainer.scrollLeft <= minScroll.x;
    const isBottom = scrollingContainer.scrollTop >= maxScroll.y;
    const isRight = scrollingContainer.scrollLeft >= maxScroll.x;
    return {
        isTop,
        isLeft,
        isBottom,
        isRight,
        maxScroll,
        minScroll
    };
}
const defaultThreshold = {
    x: 0.2,
    y: 0.2
};
function getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, _ref, acceleration, thresholdPercentage) {
    let { top, left, right, bottom } = _ref;
    if (acceleration === void 0) {
        acceleration = 10;
    }
    if (thresholdPercentage === void 0) {
        thresholdPercentage = defaultThreshold;
    }
    const { isTop, isBottom, isLeft, isRight } = getScrollPosition(scrollContainer);
    const direction = {
        x: 0,
        y: 0
    };
    const speed = {
        x: 0,
        y: 0
    };
    const threshold = {
        height: scrollContainerRect.height * thresholdPercentage.y,
        width: scrollContainerRect.width * thresholdPercentage.x
    };
    if (!isTop && top <= scrollContainerRect.top + threshold.height) {
        // Scroll Up
        direction.y = Direction.Backward;
        speed.y = acceleration * Math.abs((scrollContainerRect.top + threshold.height - top) / threshold.height);
    } else if (!isBottom && bottom >= scrollContainerRect.bottom - threshold.height) {
        // Scroll Down
        direction.y = Direction.Forward;
        speed.y = acceleration * Math.abs((scrollContainerRect.bottom - threshold.height - bottom) / threshold.height);
    }
    if (!isRight && right >= scrollContainerRect.right - threshold.width) {
        // Scroll Right
        direction.x = Direction.Forward;
        speed.x = acceleration * Math.abs((scrollContainerRect.right - threshold.width - right) / threshold.width);
    } else if (!isLeft && left <= scrollContainerRect.left + threshold.width) {
        // Scroll Left
        direction.x = Direction.Backward;
        speed.x = acceleration * Math.abs((scrollContainerRect.left + threshold.width - left) / threshold.width);
    }
    return {
        direction,
        speed
    };
}
function getScrollElementRect(element) {
    if (element === document.scrollingElement) {
        const { innerWidth, innerHeight } = window;
        return {
            top: 0,
            left: 0,
            right: innerWidth,
            bottom: innerHeight,
            width: innerWidth,
            height: innerHeight
        };
    }
    const { top, left, right, bottom } = element.getBoundingClientRect();
    return {
        top,
        left,
        right,
        bottom,
        width: element.clientWidth,
        height: element.clientHeight
    };
}
function getScrollOffsets(scrollableAncestors) {
    return scrollableAncestors.reduce((acc, node)=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["add"])(acc, getScrollCoordinates(node));
    }, defaultCoordinates);
}
function getScrollXOffset(scrollableAncestors) {
    return scrollableAncestors.reduce((acc, node)=>{
        return acc + getScrollXCoordinate(node);
    }, 0);
}
function getScrollYOffset(scrollableAncestors) {
    return scrollableAncestors.reduce((acc, node)=>{
        return acc + getScrollYCoordinate(node);
    }, 0);
}
function scrollIntoViewIfNeeded(element, measure) {
    if (measure === void 0) {
        measure = getClientRect;
    }
    if (!element) {
        return;
    }
    const { top, left, bottom, right } = measure(element);
    const firstScrollableAncestor = getFirstScrollableAncestor(element);
    if (!firstScrollableAncestor) {
        return;
    }
    if (bottom <= 0 || right <= 0 || top >= window.innerHeight || left >= window.innerWidth) {
        element.scrollIntoView({
            block: 'center',
            inline: 'center'
        });
    }
}
const properties = [
    [
        'x',
        [
            'left',
            'right'
        ],
        getScrollXOffset
    ],
    [
        'y',
        [
            'top',
            'bottom'
        ],
        getScrollYOffset
    ]
];
class Rect {
    constructor(rect, element){
        this.rect = void 0;
        this.width = void 0;
        this.height = void 0;
        this.top = void 0;
        this.bottom = void 0;
        this.right = void 0;
        this.left = void 0;
        const scrollableAncestors = getScrollableAncestors(element);
        const scrollOffsets = getScrollOffsets(scrollableAncestors);
        this.rect = {
            ...rect
        };
        this.width = rect.width;
        this.height = rect.height;
        for (const [axis, keys, getScrollOffset] of properties){
            for (const key of keys){
                Object.defineProperty(this, key, {
                    get: ()=>{
                        const currentOffsets = getScrollOffset(scrollableAncestors);
                        const scrollOffsetsDeltla = scrollOffsets[axis] - currentOffsets;
                        return this.rect[key] + scrollOffsetsDeltla;
                    },
                    enumerable: true
                });
            }
        }
        Object.defineProperty(this, 'rect', {
            enumerable: false
        });
    }
}
class Listeners {
    constructor(target){
        this.target = void 0;
        this.listeners = [];
        this.removeAll = ()=>{
            this.listeners.forEach((listener)=>{
                var _this$target;
                return (_this$target = this.target) == null ? void 0 : _this$target.removeEventListener(...listener);
            });
        };
        this.target = target;
    }
    add(eventName, handler, options) {
        var _this$target2;
        (_this$target2 = this.target) == null ? void 0 : _this$target2.addEventListener(eventName, handler, options);
        this.listeners.push([
            eventName,
            handler,
            options
        ]);
    }
}
function getEventListenerTarget(target) {
    // If the `event.target` element is removed from the document events will still be targeted
    // at it, and hence won't always bubble up to the window or document anymore.
    // If there is any risk of an element being removed while it is being dragged,
    // the best practice is to attach the event listeners directly to the target.
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
    const { EventTarget } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWindow"])(target);
    return target instanceof EventTarget ? target : (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getOwnerDocument"])(target);
}
function hasExceededDistance(delta, measurement) {
    const dx = Math.abs(delta.x);
    const dy = Math.abs(delta.y);
    if (typeof measurement === 'number') {
        return Math.sqrt(dx ** 2 + dy ** 2) > measurement;
    }
    if ('x' in measurement && 'y' in measurement) {
        return dx > measurement.x && dy > measurement.y;
    }
    if ('x' in measurement) {
        return dx > measurement.x;
    }
    if ('y' in measurement) {
        return dy > measurement.y;
    }
    return false;
}
var EventName;
(function(EventName) {
    EventName["Click"] = "click";
    EventName["DragStart"] = "dragstart";
    EventName["Keydown"] = "keydown";
    EventName["ContextMenu"] = "contextmenu";
    EventName["Resize"] = "resize";
    EventName["SelectionChange"] = "selectionchange";
    EventName["VisibilityChange"] = "visibilitychange";
})(EventName || (EventName = {}));
function preventDefault(event) {
    event.preventDefault();
}
function stopPropagation(event) {
    event.stopPropagation();
}
var KeyboardCode;
(function(KeyboardCode) {
    KeyboardCode["Space"] = "Space";
    KeyboardCode["Down"] = "ArrowDown";
    KeyboardCode["Right"] = "ArrowRight";
    KeyboardCode["Left"] = "ArrowLeft";
    KeyboardCode["Up"] = "ArrowUp";
    KeyboardCode["Esc"] = "Escape";
    KeyboardCode["Enter"] = "Enter";
    KeyboardCode["Tab"] = "Tab";
})(KeyboardCode || (KeyboardCode = {}));
const defaultKeyboardCodes = {
    start: [
        KeyboardCode.Space,
        KeyboardCode.Enter
    ],
    cancel: [
        KeyboardCode.Esc
    ],
    end: [
        KeyboardCode.Space,
        KeyboardCode.Enter,
        KeyboardCode.Tab
    ]
};
const defaultKeyboardCoordinateGetter = (event, _ref)=>{
    let { currentCoordinates } = _ref;
    switch(event.code){
        case KeyboardCode.Right:
            return {
                ...currentCoordinates,
                x: currentCoordinates.x + 25
            };
        case KeyboardCode.Left:
            return {
                ...currentCoordinates,
                x: currentCoordinates.x - 25
            };
        case KeyboardCode.Down:
            return {
                ...currentCoordinates,
                y: currentCoordinates.y + 25
            };
        case KeyboardCode.Up:
            return {
                ...currentCoordinates,
                y: currentCoordinates.y - 25
            };
    }
    return undefined;
};
class KeyboardSensor {
    constructor(props){
        this.props = void 0;
        this.autoScrollEnabled = false;
        this.referenceCoordinates = void 0;
        this.listeners = void 0;
        this.windowListeners = void 0;
        this.props = props;
        const { event: { target } } = props;
        this.props = props;
        this.listeners = new Listeners((0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getOwnerDocument"])(target));
        this.windowListeners = new Listeners((0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWindow"])(target));
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.attach();
    }
    attach() {
        this.handleStart();
        this.windowListeners.add(EventName.Resize, this.handleCancel);
        this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
        setTimeout(()=>this.listeners.add(EventName.Keydown, this.handleKeyDown));
    }
    handleStart() {
        const { activeNode, onStart } = this.props;
        const node = activeNode.node.current;
        if (node) {
            scrollIntoViewIfNeeded(node);
        }
        onStart(defaultCoordinates);
    }
    handleKeyDown(event) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isKeyboardEvent"])(event)) {
            const { active, context, options } = this.props;
            const { keyboardCodes = defaultKeyboardCodes, coordinateGetter = defaultKeyboardCoordinateGetter, scrollBehavior = 'smooth' } = options;
            const { code } = event;
            if (keyboardCodes.end.includes(code)) {
                this.handleEnd(event);
                return;
            }
            if (keyboardCodes.cancel.includes(code)) {
                this.handleCancel(event);
                return;
            }
            const { collisionRect } = context.current;
            const currentCoordinates = collisionRect ? {
                x: collisionRect.left,
                y: collisionRect.top
            } : defaultCoordinates;
            if (!this.referenceCoordinates) {
                this.referenceCoordinates = currentCoordinates;
            }
            const newCoordinates = coordinateGetter(event, {
                active,
                context: context.current,
                currentCoordinates
            });
            if (newCoordinates) {
                const coordinatesDelta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["subtract"])(newCoordinates, currentCoordinates);
                const scrollDelta = {
                    x: 0,
                    y: 0
                };
                const { scrollableAncestors } = context.current;
                for (const scrollContainer of scrollableAncestors){
                    const direction = event.code;
                    const { isTop, isRight, isLeft, isBottom, maxScroll, minScroll } = getScrollPosition(scrollContainer);
                    const scrollElementRect = getScrollElementRect(scrollContainer);
                    const clampedCoordinates = {
                        x: Math.min(direction === KeyboardCode.Right ? scrollElementRect.right - scrollElementRect.width / 2 : scrollElementRect.right, Math.max(direction === KeyboardCode.Right ? scrollElementRect.left : scrollElementRect.left + scrollElementRect.width / 2, newCoordinates.x)),
                        y: Math.min(direction === KeyboardCode.Down ? scrollElementRect.bottom - scrollElementRect.height / 2 : scrollElementRect.bottom, Math.max(direction === KeyboardCode.Down ? scrollElementRect.top : scrollElementRect.top + scrollElementRect.height / 2, newCoordinates.y))
                    };
                    const canScrollX = direction === KeyboardCode.Right && !isRight || direction === KeyboardCode.Left && !isLeft;
                    const canScrollY = direction === KeyboardCode.Down && !isBottom || direction === KeyboardCode.Up && !isTop;
                    if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
                        const newScrollCoordinates = scrollContainer.scrollLeft + coordinatesDelta.x;
                        const canScrollToNewCoordinates = direction === KeyboardCode.Right && newScrollCoordinates <= maxScroll.x || direction === KeyboardCode.Left && newScrollCoordinates >= minScroll.x;
                        if (canScrollToNewCoordinates && !coordinatesDelta.y) {
                            // We don't need to update coordinates, the scroll adjustment alone will trigger
                            // logic to auto-detect the new container we are over
                            scrollContainer.scrollTo({
                                left: newScrollCoordinates,
                                behavior: scrollBehavior
                            });
                            return;
                        }
                        if (canScrollToNewCoordinates) {
                            scrollDelta.x = scrollContainer.scrollLeft - newScrollCoordinates;
                        } else {
                            scrollDelta.x = direction === KeyboardCode.Right ? scrollContainer.scrollLeft - maxScroll.x : scrollContainer.scrollLeft - minScroll.x;
                        }
                        if (scrollDelta.x) {
                            scrollContainer.scrollBy({
                                left: -scrollDelta.x,
                                behavior: scrollBehavior
                            });
                        }
                        break;
                    } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
                        const newScrollCoordinates = scrollContainer.scrollTop + coordinatesDelta.y;
                        const canScrollToNewCoordinates = direction === KeyboardCode.Down && newScrollCoordinates <= maxScroll.y || direction === KeyboardCode.Up && newScrollCoordinates >= minScroll.y;
                        if (canScrollToNewCoordinates && !coordinatesDelta.x) {
                            // We don't need to update coordinates, the scroll adjustment alone will trigger
                            // logic to auto-detect the new container we are over
                            scrollContainer.scrollTo({
                                top: newScrollCoordinates,
                                behavior: scrollBehavior
                            });
                            return;
                        }
                        if (canScrollToNewCoordinates) {
                            scrollDelta.y = scrollContainer.scrollTop - newScrollCoordinates;
                        } else {
                            scrollDelta.y = direction === KeyboardCode.Down ? scrollContainer.scrollTop - maxScroll.y : scrollContainer.scrollTop - minScroll.y;
                        }
                        if (scrollDelta.y) {
                            scrollContainer.scrollBy({
                                top: -scrollDelta.y,
                                behavior: scrollBehavior
                            });
                        }
                        break;
                    }
                }
                this.handleMove(event, (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["add"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["subtract"])(newCoordinates, this.referenceCoordinates), scrollDelta));
            }
        }
    }
    handleMove(event, coordinates) {
        const { onMove } = this.props;
        event.preventDefault();
        onMove(coordinates);
    }
    handleEnd(event) {
        const { onEnd } = this.props;
        event.preventDefault();
        this.detach();
        onEnd();
    }
    handleCancel(event) {
        const { onCancel } = this.props;
        event.preventDefault();
        this.detach();
        onCancel();
    }
    detach() {
        this.listeners.removeAll();
        this.windowListeners.removeAll();
    }
}
KeyboardSensor.activators = [
    {
        eventName: 'onKeyDown',
        handler: (event, _ref, _ref2)=>{
            let { keyboardCodes = defaultKeyboardCodes, onActivation } = _ref;
            let { active } = _ref2;
            const { code } = event.nativeEvent;
            if (keyboardCodes.start.includes(code)) {
                const activator = active.activatorNode.current;
                if (activator && event.target !== activator) {
                    return false;
                }
                event.preventDefault();
                onActivation == null ? void 0 : onActivation({
                    event: event.nativeEvent
                });
                return true;
            }
            return false;
        }
    }
];
function isDistanceConstraint(constraint) {
    return Boolean(constraint && 'distance' in constraint);
}
function isDelayConstraint(constraint) {
    return Boolean(constraint && 'delay' in constraint);
}
class AbstractPointerSensor {
    constructor(props, events, listenerTarget){
        var _getEventCoordinates;
        if (listenerTarget === void 0) {
            listenerTarget = getEventListenerTarget(props.event.target);
        }
        this.props = void 0;
        this.events = void 0;
        this.autoScrollEnabled = true;
        this.document = void 0;
        this.activated = false;
        this.initialCoordinates = void 0;
        this.timeoutId = null;
        this.listeners = void 0;
        this.documentListeners = void 0;
        this.windowListeners = void 0;
        this.props = props;
        this.events = events;
        const { event } = props;
        const { target } = event;
        this.props = props;
        this.events = events;
        this.document = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getOwnerDocument"])(target);
        this.documentListeners = new Listeners(this.document);
        this.listeners = new Listeners(listenerTarget);
        this.windowListeners = new Listeners((0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWindow"])(target));
        this.initialCoordinates = (_getEventCoordinates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEventCoordinates"])(event)) != null ? _getEventCoordinates : defaultCoordinates;
        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.removeTextSelection = this.removeTextSelection.bind(this);
        this.attach();
    }
    attach() {
        const { events, props: { options: { activationConstraint, bypassActivationConstraint } } } = this;
        this.listeners.add(events.move.name, this.handleMove, {
            passive: false
        });
        this.listeners.add(events.end.name, this.handleEnd);
        if (events.cancel) {
            this.listeners.add(events.cancel.name, this.handleCancel);
        }
        this.windowListeners.add(EventName.Resize, this.handleCancel);
        this.windowListeners.add(EventName.DragStart, preventDefault);
        this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
        this.windowListeners.add(EventName.ContextMenu, preventDefault);
        this.documentListeners.add(EventName.Keydown, this.handleKeydown);
        if (activationConstraint) {
            if (bypassActivationConstraint != null && bypassActivationConstraint({
                event: this.props.event,
                activeNode: this.props.activeNode,
                options: this.props.options
            })) {
                return this.handleStart();
            }
            if (isDelayConstraint(activationConstraint)) {
                this.timeoutId = setTimeout(this.handleStart, activationConstraint.delay);
                this.handlePending(activationConstraint);
                return;
            }
            if (isDistanceConstraint(activationConstraint)) {
                this.handlePending(activationConstraint);
                return;
            }
        }
        this.handleStart();
    }
    detach() {
        this.listeners.removeAll();
        this.windowListeners.removeAll(); // Wait until the next event loop before removing document listeners
        // This is necessary because we listen for `click` and `selection` events on the document
        setTimeout(this.documentListeners.removeAll, 50);
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
    handlePending(constraint, offset) {
        const { active, onPending } = this.props;
        onPending(active, constraint, this.initialCoordinates, offset);
    }
    handleStart() {
        const { initialCoordinates } = this;
        const { onStart } = this.props;
        if (initialCoordinates) {
            this.activated = true; // Stop propagation of click events once activation constraints are met
            this.documentListeners.add(EventName.Click, stopPropagation, {
                capture: true
            }); // Remove any text selection from the document
            this.removeTextSelection(); // Prevent further text selection while dragging
            this.documentListeners.add(EventName.SelectionChange, this.removeTextSelection);
            onStart(initialCoordinates);
        }
    }
    handleMove(event) {
        var _getEventCoordinates2;
        const { activated, initialCoordinates, props } = this;
        const { onMove, options: { activationConstraint } } = props;
        if (!initialCoordinates) {
            return;
        }
        const coordinates = (_getEventCoordinates2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEventCoordinates"])(event)) != null ? _getEventCoordinates2 : defaultCoordinates;
        const delta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["subtract"])(initialCoordinates, coordinates); // Constraint validation
        if (!activated && activationConstraint) {
            if (isDistanceConstraint(activationConstraint)) {
                if (activationConstraint.tolerance != null && hasExceededDistance(delta, activationConstraint.tolerance)) {
                    return this.handleCancel();
                }
                if (hasExceededDistance(delta, activationConstraint.distance)) {
                    return this.handleStart();
                }
            }
            if (isDelayConstraint(activationConstraint)) {
                if (hasExceededDistance(delta, activationConstraint.tolerance)) {
                    return this.handleCancel();
                }
            }
            this.handlePending(activationConstraint, delta);
            return;
        }
        if (event.cancelable) {
            event.preventDefault();
        }
        onMove(coordinates);
    }
    handleEnd() {
        const { onAbort, onEnd } = this.props;
        this.detach();
        if (!this.activated) {
            onAbort(this.props.active);
        }
        onEnd();
    }
    handleCancel() {
        const { onAbort, onCancel } = this.props;
        this.detach();
        if (!this.activated) {
            onAbort(this.props.active);
        }
        onCancel();
    }
    handleKeydown(event) {
        if (event.code === KeyboardCode.Esc) {
            this.handleCancel();
        }
    }
    removeTextSelection() {
        var _this$document$getSel;
        (_this$document$getSel = this.document.getSelection()) == null ? void 0 : _this$document$getSel.removeAllRanges();
    }
}
const events = {
    cancel: {
        name: 'pointercancel'
    },
    move: {
        name: 'pointermove'
    },
    end: {
        name: 'pointerup'
    }
};
class PointerSensor extends AbstractPointerSensor {
    constructor(props){
        const { event } = props; // Pointer events stop firing if the target is unmounted while dragging
        // Therefore we attach listeners to the owner document instead
        const listenerTarget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getOwnerDocument"])(event.target);
        super(props, events, listenerTarget);
    }
}
PointerSensor.activators = [
    {
        eventName: 'onPointerDown',
        handler: (_ref, _ref2)=>{
            let { nativeEvent: event } = _ref;
            let { onActivation } = _ref2;
            if (!event.isPrimary || event.button !== 0) {
                return false;
            }
            onActivation == null ? void 0 : onActivation({
                event
            });
            return true;
        }
    }
];
const events$1 = {
    move: {
        name: 'mousemove'
    },
    end: {
        name: 'mouseup'
    }
};
var MouseButton;
(function(MouseButton) {
    MouseButton[MouseButton["RightClick"] = 2] = "RightClick";
})(MouseButton || (MouseButton = {}));
class MouseSensor extends AbstractPointerSensor {
    constructor(props){
        super(props, events$1, (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getOwnerDocument"])(props.event.target));
    }
}
MouseSensor.activators = [
    {
        eventName: 'onMouseDown',
        handler: (_ref, _ref2)=>{
            let { nativeEvent: event } = _ref;
            let { onActivation } = _ref2;
            if (event.button === MouseButton.RightClick) {
                return false;
            }
            onActivation == null ? void 0 : onActivation({
                event
            });
            return true;
        }
    }
];
const events$2 = {
    cancel: {
        name: 'touchcancel'
    },
    move: {
        name: 'touchmove'
    },
    end: {
        name: 'touchend'
    }
};
class TouchSensor extends AbstractPointerSensor {
    constructor(props){
        super(props, events$2);
    }
    static setup() {
        // Adding a non-capture and non-passive `touchmove` listener in order
        // to force `event.preventDefault()` calls to work in dynamically added
        // touchmove event handlers. This is required for iOS Safari.
        window.addEventListener(events$2.move.name, noop, {
            capture: false,
            passive: false
        });
        return function teardown() {
            window.removeEventListener(events$2.move.name, noop);
        }; // We create a new handler because the teardown function of another sensor
        //TURBOPACK unreachable
        ;
        // could remove our event listener if we use a referentially equal listener.
        function noop() {}
    }
}
TouchSensor.activators = [
    {
        eventName: 'onTouchStart',
        handler: (_ref, _ref2)=>{
            let { nativeEvent: event } = _ref;
            let { onActivation } = _ref2;
            const { touches } = event;
            if (touches.length > 1) {
                return false;
            }
            onActivation == null ? void 0 : onActivation({
                event
            });
            return true;
        }
    }
];
var AutoScrollActivator;
(function(AutoScrollActivator) {
    AutoScrollActivator[AutoScrollActivator["Pointer"] = 0] = "Pointer";
    AutoScrollActivator[AutoScrollActivator["DraggableRect"] = 1] = "DraggableRect";
})(AutoScrollActivator || (AutoScrollActivator = {}));
var TraversalOrder;
(function(TraversalOrder) {
    TraversalOrder[TraversalOrder["TreeOrder"] = 0] = "TreeOrder";
    TraversalOrder[TraversalOrder["ReversedTreeOrder"] = 1] = "ReversedTreeOrder";
})(TraversalOrder || (TraversalOrder = {}));
function useAutoScroller(_ref) {
    let { acceleration, activator = AutoScrollActivator.Pointer, canScroll, draggingRect, enabled, interval = 5, order = TraversalOrder.TreeOrder, pointerCoordinates, scrollableAncestors, scrollableAncestorRects, delta, threshold } = _ref;
    const scrollIntent = useScrollIntent({
        delta,
        disabled: !enabled
    });
    const [setAutoScrollInterval, clearAutoScrollInterval] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInterval"])();
    const scrollSpeed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0,
        y: 0
    });
    const scrollDirection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0,
        y: 0
    });
    const rect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        switch(activator){
            case AutoScrollActivator.Pointer:
                return pointerCoordinates ? {
                    top: pointerCoordinates.y,
                    bottom: pointerCoordinates.y,
                    left: pointerCoordinates.x,
                    right: pointerCoordinates.x
                } : null;
            case AutoScrollActivator.DraggableRect:
                return draggingRect;
        }
    }, [
        activator,
        draggingRect,
        pointerCoordinates
    ]);
    const scrollContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const autoScroll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) {
            return;
        }
        const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
        const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;
        scrollContainer.scrollBy(scrollLeft, scrollTop);
    }, []);
    const sortedScrollableAncestors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>order === TraversalOrder.TreeOrder ? [
            ...scrollableAncestors
        ].reverse() : scrollableAncestors, [
        order,
        scrollableAncestors
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!enabled || !scrollableAncestors.length || !rect) {
            clearAutoScrollInterval();
            return;
        }
        for (const scrollContainer of sortedScrollableAncestors){
            if ((canScroll == null ? void 0 : canScroll(scrollContainer)) === false) {
                continue;
            }
            const index = scrollableAncestors.indexOf(scrollContainer);
            const scrollContainerRect = scrollableAncestorRects[index];
            if (!scrollContainerRect) {
                continue;
            }
            const { direction, speed } = getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, rect, acceleration, threshold);
            for (const axis of [
                'x',
                'y'
            ]){
                if (!scrollIntent[axis][direction[axis]]) {
                    speed[axis] = 0;
                    direction[axis] = 0;
                }
            }
            if (speed.x > 0 || speed.y > 0) {
                clearAutoScrollInterval();
                scrollContainerRef.current = scrollContainer;
                setAutoScrollInterval(autoScroll, interval);
                scrollSpeed.current = speed;
                scrollDirection.current = direction;
                return;
            }
        }
        scrollSpeed.current = {
            x: 0,
            y: 0
        };
        scrollDirection.current = {
            x: 0,
            y: 0
        };
        clearAutoScrollInterval();
    }, [
        acceleration,
        autoScroll,
        canScroll,
        clearAutoScrollInterval,
        enabled,
        interval,
        JSON.stringify(rect),
        JSON.stringify(scrollIntent),
        setAutoScrollInterval,
        scrollableAncestors,
        sortedScrollableAncestors,
        scrollableAncestorRects,
        JSON.stringify(threshold)
    ]);
}
const defaultScrollIntent = {
    x: {
        [Direction.Backward]: false,
        [Direction.Forward]: false
    },
    y: {
        [Direction.Backward]: false,
        [Direction.Forward]: false
    }
};
function useScrollIntent(_ref2) {
    let { delta, disabled } = _ref2;
    const previousDelta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePrevious"])(delta);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLazyMemo"])((previousIntent)=>{
        if (disabled || !previousDelta || !previousIntent) {
            // Reset scroll intent tracking when auto-scrolling is disabled
            return defaultScrollIntent;
        }
        const direction = {
            x: Math.sign(delta.x - previousDelta.x),
            y: Math.sign(delta.y - previousDelta.y)
        }; // Keep track of the user intent to scroll in each direction for both axis
        return {
            x: {
                [Direction.Backward]: previousIntent.x[Direction.Backward] || direction.x === -1,
                [Direction.Forward]: previousIntent.x[Direction.Forward] || direction.x === 1
            },
            y: {
                [Direction.Backward]: previousIntent.y[Direction.Backward] || direction.y === -1,
                [Direction.Forward]: previousIntent.y[Direction.Forward] || direction.y === 1
            }
        };
    }, [
        disabled,
        delta,
        previousDelta
    ]);
}
function useCachedNode(draggableNodes, id) {
    const draggableNode = id != null ? draggableNodes.get(id) : undefined;
    const node = draggableNode ? draggableNode.node.current : null;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLazyMemo"])((cachedNode)=>{
        var _ref;
        if (id == null) {
            return null;
        } // In some cases, the draggable node can unmount while dragging
        // This is the case for virtualized lists. In those situations,
        // we fall back to the last known value for that node.
        return (_ref = node != null ? node : cachedNode) != null ? _ref : null;
    }, [
        node,
        id
    ]);
}
function useCombineActivators(sensors, getSyntheticHandler) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>sensors.reduce((accumulator, sensor)=>{
            const { sensor: Sensor } = sensor;
            const sensorActivators = Sensor.activators.map((activator)=>({
                    eventName: activator.eventName,
                    handler: getSyntheticHandler(activator.handler, sensor)
                }));
            return [
                ...accumulator,
                ...sensorActivators
            ];
        }, []), [
        sensors,
        getSyntheticHandler
    ]);
}
var MeasuringStrategy;
(function(MeasuringStrategy) {
    MeasuringStrategy[MeasuringStrategy["Always"] = 0] = "Always";
    MeasuringStrategy[MeasuringStrategy["BeforeDragging"] = 1] = "BeforeDragging";
    MeasuringStrategy[MeasuringStrategy["WhileDragging"] = 2] = "WhileDragging";
})(MeasuringStrategy || (MeasuringStrategy = {}));
var MeasuringFrequency;
(function(MeasuringFrequency) {
    MeasuringFrequency["Optimized"] = "optimized";
})(MeasuringFrequency || (MeasuringFrequency = {}));
const defaultValue = /*#__PURE__*/ new Map();
function useDroppableMeasuring(containers, _ref) {
    let { dragging, dependencies, config } = _ref;
    const [queue, setQueue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const { frequency, measure, strategy } = config;
    const containersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(containers);
    const disabled = isDisabled();
    const disabledRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLatestValue"])(disabled);
    const measureDroppableContainers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(function(ids) {
        if (ids === void 0) {
            ids = [];
        }
        if (disabledRef.current) {
            return;
        }
        setQueue((value)=>{
            if (value === null) {
                return ids;
            }
            return value.concat(ids.filter((id)=>!value.includes(id)));
        });
    }, [
        disabledRef
    ]);
    const timeoutId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const droppableRects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLazyMemo"])((previousValue)=>{
        if (disabled && !dragging) {
            return defaultValue;
        }
        if (!previousValue || previousValue === defaultValue || containersRef.current !== containers || queue != null) {
            const map = new Map();
            for (let container of containers){
                if (!container) {
                    continue;
                }
                if (queue && queue.length > 0 && !queue.includes(container.id) && container.rect.current) {
                    // This container does not need to be re-measured
                    map.set(container.id, container.rect.current);
                    continue;
                }
                const node = container.node.current;
                const rect = node ? new Rect(measure(node), node) : null;
                container.rect.current = rect;
                if (rect) {
                    map.set(container.id, rect);
                }
            }
            return map;
        }
        return previousValue;
    }, [
        containers,
        queue,
        dragging,
        disabled,
        measure
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        containersRef.current = containers;
    }, [
        containers
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (disabled) {
            return;
        }
        measureDroppableContainers();
    }, [
        dragging,
        disabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (queue && queue.length > 0) {
            setQueue(null);
        }
    }, [
        JSON.stringify(queue)
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (disabled || typeof frequency !== 'number' || timeoutId.current !== null) {
            return;
        }
        timeoutId.current = setTimeout(()=>{
            measureDroppableContainers();
            timeoutId.current = null;
        }, frequency);
    }, [
        frequency,
        disabled,
        measureDroppableContainers,
        ...dependencies
    ]);
    return {
        droppableRects,
        measureDroppableContainers,
        measuringScheduled: queue != null
    };
    //TURBOPACK unreachable
    ;
    function isDisabled() {
        switch(strategy){
            case MeasuringStrategy.Always:
                return false;
            case MeasuringStrategy.BeforeDragging:
                return dragging;
            default:
                return !dragging;
        }
    }
}
function useInitialValue(value, computeFn) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLazyMemo"])((previousValue)=>{
        if (!value) {
            return null;
        }
        if (previousValue) {
            return previousValue;
        }
        return typeof computeFn === 'function' ? computeFn(value) : value;
    }, [
        computeFn,
        value
    ]);
}
function useInitialRect(node, measure) {
    return useInitialValue(node, measure);
}
/**
 * Returns a new MutationObserver instance.
 * If `MutationObserver` is undefined in the execution environment, returns `undefined`.
 */ function useMutationObserver(_ref) {
    let { callback, disabled } = _ref;
    const handleMutations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEvent"])(callback);
    const mutationObserver = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) {
            return undefined;
        }
        //TURBOPACK unreachable
        ;
        const MutationObserver = undefined;
    }, [
        handleMutations,
        disabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>mutationObserver == null ? void 0 : mutationObserver.disconnect();
    }, [
        mutationObserver
    ]);
    return mutationObserver;
}
/**
 * Returns a new ResizeObserver instance bound to the `onResize` callback.
 * If `ResizeObserver` is undefined in the execution environment, returns `undefined`.
 */ function useResizeObserver(_ref) {
    let { callback, disabled } = _ref;
    const handleResize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEvent"])(callback);
    const resizeObserver = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) {
            return undefined;
        }
        //TURBOPACK unreachable
        ;
        const ResizeObserver = undefined;
    }, [
        disabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>resizeObserver == null ? void 0 : resizeObserver.disconnect();
    }, [
        resizeObserver
    ]);
    return resizeObserver;
}
function defaultMeasure(element) {
    return new Rect(getClientRect(element), element);
}
function useRect(element, measure, fallbackRect) {
    if (measure === void 0) {
        measure = defaultMeasure;
    }
    const [rect, setRect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    function measureRect() {
        setRect((currentRect)=>{
            if (!element) {
                return null;
            }
            if (element.isConnected === false) {
                var _ref;
                // Fall back to last rect we measured if the element is
                // no longer connected to the DOM.
                return (_ref = currentRect != null ? currentRect : fallbackRect) != null ? _ref : null;
            }
            const newRect = measure(element);
            if (JSON.stringify(currentRect) === JSON.stringify(newRect)) {
                return currentRect;
            }
            return newRect;
        });
    }
    const mutationObserver = useMutationObserver({
        callback (records) {
            if (!element) {
                return;
            }
            for (const record of records){
                const { type, target } = record;
                if (type === 'childList' && target instanceof HTMLElement && target.contains(element)) {
                    measureRect();
                    break;
                }
            }
        }
    });
    const resizeObserver = useResizeObserver({
        callback: measureRect
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsomorphicLayoutEffect"])(()=>{
        measureRect();
        if (element) {
            resizeObserver == null ? void 0 : resizeObserver.observe(element);
            mutationObserver == null ? void 0 : mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            resizeObserver == null ? void 0 : resizeObserver.disconnect();
            mutationObserver == null ? void 0 : mutationObserver.disconnect();
        }
    }, [
        element
    ]);
    return rect;
}
function useRectDelta(rect) {
    const initialRect = useInitialValue(rect);
    return getRectDelta(rect, initialRect);
}
const defaultValue$1 = [];
function useScrollableAncestors(node) {
    const previousNode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(node);
    const ancestors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLazyMemo"])((previousValue)=>{
        if (!node) {
            return defaultValue$1;
        }
        if (previousValue && previousValue !== defaultValue$1 && node && previousNode.current && node.parentNode === previousNode.current.parentNode) {
            return previousValue;
        }
        return getScrollableAncestors(node);
    }, [
        node
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        previousNode.current = node;
    }, [
        node
    ]);
    return ancestors;
}
function useScrollOffsets(elements) {
    const [scrollCoordinates, setScrollCoordinates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const prevElements = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(elements); // To-do: Throttle the handleScroll callback
    const handleScroll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((event)=>{
        const scrollingElement = getScrollableElement(event.target);
        if (!scrollingElement) {
            return;
        }
        setScrollCoordinates((scrollCoordinates)=>{
            if (!scrollCoordinates) {
                return null;
            }
            scrollCoordinates.set(scrollingElement, getScrollCoordinates(scrollingElement));
            return new Map(scrollCoordinates);
        });
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const previousElements = prevElements.current;
        if (elements !== previousElements) {
            cleanup(previousElements);
            const entries = elements.map((element)=>{
                const scrollableElement = getScrollableElement(element);
                if (scrollableElement) {
                    scrollableElement.addEventListener('scroll', handleScroll, {
                        passive: true
                    });
                    return [
                        scrollableElement,
                        getScrollCoordinates(scrollableElement)
                    ];
                }
                return null;
            }).filter((entry)=>entry != null);
            setScrollCoordinates(entries.length ? new Map(entries) : null);
            prevElements.current = elements;
        }
        return ()=>{
            cleanup(elements);
            cleanup(previousElements);
        };
        //TURBOPACK unreachable
        ;
        function cleanup(elements) {
            elements.forEach((element)=>{
                const scrollableElement = getScrollableElement(element);
                scrollableElement == null ? void 0 : scrollableElement.removeEventListener('scroll', handleScroll);
            });
        }
    }, [
        handleScroll,
        elements
    ]);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (elements.length) {
            return scrollCoordinates ? Array.from(scrollCoordinates.values()).reduce((acc, coordinates)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["add"])(acc, coordinates), defaultCoordinates) : getScrollOffsets(elements);
        }
        return defaultCoordinates;
    }, [
        elements,
        scrollCoordinates
    ]);
}
function useScrollOffsetsDelta(scrollOffsets, dependencies) {
    if (dependencies === void 0) {
        dependencies = [];
    }
    const initialScrollOffsets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        initialScrollOffsets.current = null;
    }, dependencies);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const hasScrollOffsets = scrollOffsets !== defaultCoordinates;
        if (hasScrollOffsets && !initialScrollOffsets.current) {
            initialScrollOffsets.current = scrollOffsets;
        }
        if (!hasScrollOffsets && initialScrollOffsets.current) {
            initialScrollOffsets.current = null;
        }
    }, [
        scrollOffsets
    ]);
    return initialScrollOffsets.current ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["subtract"])(scrollOffsets, initialScrollOffsets.current) : defaultCoordinates;
}
function useSensorSetup(sensors) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["canUseDOM"]) {
            return;
        }
        const teardownFns = sensors.map((_ref)=>{
            let { sensor } = _ref;
            return sensor.setup == null ? void 0 : sensor.setup();
        });
        return ()=>{
            for (const teardown of teardownFns){
                teardown == null ? void 0 : teardown();
            }
        };
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    sensors.map((_ref2)=>{
        let { sensor } = _ref2;
        return sensor;
    }));
}
function useSyntheticListeners(listeners, id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return listeners.reduce((acc, _ref)=>{
            let { eventName, handler } = _ref;
            acc[eventName] = (event)=>{
                handler(event, id);
            };
            return acc;
        }, {});
    }, [
        listeners,
        id
    ]);
}
function useWindowRect(element) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>element ? getWindowClientRect(element) : null, [
        element
    ]);
}
const defaultValue$2 = [];
function useRects(elements, measure) {
    if (measure === void 0) {
        measure = getClientRect;
    }
    const [firstElement] = elements;
    const windowRect = useWindowRect(firstElement ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWindow"])(firstElement) : null);
    const [rects, setRects] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultValue$2);
    function measureRects() {
        setRects(()=>{
            if (!elements.length) {
                return defaultValue$2;
            }
            return elements.map((element)=>isDocumentScrollingElement(element) ? windowRect : new Rect(measure(element), element));
        });
    }
    const resizeObserver = useResizeObserver({
        callback: measureRects
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsomorphicLayoutEffect"])(()=>{
        resizeObserver == null ? void 0 : resizeObserver.disconnect();
        measureRects();
        elements.forEach((element)=>resizeObserver == null ? void 0 : resizeObserver.observe(element));
    }, [
        elements
    ]);
    return rects;
}
function getMeasurableNode(node) {
    if (!node) {
        return null;
    }
    if (node.children.length > 1) {
        return node;
    }
    const firstChild = node.children[0];
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isHTMLElement"])(firstChild) ? firstChild : node;
}
function useDragOverlayMeasuring(_ref) {
    let { measure } = _ref;
    const [rect, setRect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleResize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((entries)=>{
        for (const { target } of entries){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isHTMLElement"])(target)) {
                setRect((rect)=>{
                    const newRect = measure(target);
                    return rect ? {
                        ...rect,
                        width: newRect.width,
                        height: newRect.height
                    } : newRect;
                });
                break;
            }
        }
    }, [
        measure
    ]);
    const resizeObserver = useResizeObserver({
        callback: handleResize
    });
    const handleNodeChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((element)=>{
        const node = getMeasurableNode(element);
        resizeObserver == null ? void 0 : resizeObserver.disconnect();
        if (node) {
            resizeObserver == null ? void 0 : resizeObserver.observe(node);
        }
        setRect(node ? measure(node) : null);
    }, [
        measure,
        resizeObserver
    ]);
    const [nodeRef, setRef] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNodeRef"])(handleNodeChange);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            nodeRef,
            rect,
            setRef
        }), [
        rect,
        nodeRef,
        setRef
    ]);
}
const defaultSensors = [
    {
        sensor: PointerSensor,
        options: {}
    },
    {
        sensor: KeyboardSensor,
        options: {}
    }
];
const defaultData = {
    current: {}
};
const defaultMeasuringConfiguration = {
    draggable: {
        measure: getTransformAgnosticClientRect
    },
    droppable: {
        measure: getTransformAgnosticClientRect,
        strategy: MeasuringStrategy.WhileDragging,
        frequency: MeasuringFrequency.Optimized
    },
    dragOverlay: {
        measure: getClientRect
    }
};
class DroppableContainersMap extends Map {
    get(id) {
        var _super$get;
        return id != null ? (_super$get = super.get(id)) != null ? _super$get : undefined : undefined;
    }
    toArray() {
        return Array.from(this.values());
    }
    getEnabled() {
        return this.toArray().filter((_ref)=>{
            let { disabled } = _ref;
            return !disabled;
        });
    }
    getNodeFor(id) {
        var _this$get$node$curren, _this$get;
        return (_this$get$node$curren = (_this$get = this.get(id)) == null ? void 0 : _this$get.node.current) != null ? _this$get$node$curren : undefined;
    }
}
const defaultPublicContext = {
    activatorEvent: null,
    active: null,
    activeNode: null,
    activeNodeRect: null,
    collisions: null,
    containerNodeRect: null,
    draggableNodes: /*#__PURE__*/ new Map(),
    droppableRects: /*#__PURE__*/ new Map(),
    droppableContainers: /*#__PURE__*/ new DroppableContainersMap(),
    over: null,
    dragOverlay: {
        nodeRef: {
            current: null
        },
        rect: null,
        setRef: noop
    },
    scrollableAncestors: [],
    scrollableAncestorRects: [],
    measuringConfiguration: defaultMeasuringConfiguration,
    measureDroppableContainers: noop,
    windowRect: null,
    measuringScheduled: false
};
const defaultInternalContext = {
    activatorEvent: null,
    activators: [],
    active: null,
    activeNodeRect: null,
    ariaDescribedById: {
        draggable: ''
    },
    dispatch: noop,
    draggableNodes: /*#__PURE__*/ new Map(),
    over: null,
    measureDroppableContainers: noop
};
const InternalContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(defaultInternalContext);
const PublicContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(defaultPublicContext);
function getInitialState() {
    return {
        draggable: {
            active: null,
            initialCoordinates: {
                x: 0,
                y: 0
            },
            nodes: new Map(),
            translate: {
                x: 0,
                y: 0
            }
        },
        droppable: {
            containers: new DroppableContainersMap()
        }
    };
}
function reducer(state, action) {
    switch(action.type){
        case Action.DragStart:
            return {
                ...state,
                draggable: {
                    ...state.draggable,
                    initialCoordinates: action.initialCoordinates,
                    active: action.active
                }
            };
        case Action.DragMove:
            if (state.draggable.active == null) {
                return state;
            }
            return {
                ...state,
                draggable: {
                    ...state.draggable,
                    translate: {
                        x: action.coordinates.x - state.draggable.initialCoordinates.x,
                        y: action.coordinates.y - state.draggable.initialCoordinates.y
                    }
                }
            };
        case Action.DragEnd:
        case Action.DragCancel:
            return {
                ...state,
                draggable: {
                    ...state.draggable,
                    active: null,
                    initialCoordinates: {
                        x: 0,
                        y: 0
                    },
                    translate: {
                        x: 0,
                        y: 0
                    }
                }
            };
        case Action.RegisterDroppable:
            {
                const { element } = action;
                const { id } = element;
                const containers = new DroppableContainersMap(state.droppable.containers);
                containers.set(id, element);
                return {
                    ...state,
                    droppable: {
                        ...state.droppable,
                        containers
                    }
                };
            }
        case Action.SetDroppableDisabled:
            {
                const { id, key, disabled } = action;
                const element = state.droppable.containers.get(id);
                if (!element || key !== element.key) {
                    return state;
                }
                const containers = new DroppableContainersMap(state.droppable.containers);
                containers.set(id, {
                    ...element,
                    disabled
                });
                return {
                    ...state,
                    droppable: {
                        ...state.droppable,
                        containers
                    }
                };
            }
        case Action.UnregisterDroppable:
            {
                const { id, key } = action;
                const element = state.droppable.containers.get(id);
                if (!element || key !== element.key) {
                    return state;
                }
                const containers = new DroppableContainersMap(state.droppable.containers);
                containers.delete(id);
                return {
                    ...state,
                    droppable: {
                        ...state.droppable,
                        containers
                    }
                };
            }
        default:
            {
                return state;
            }
    }
}
function RestoreFocus(_ref) {
    let { disabled } = _ref;
    const { active, activatorEvent, draggableNodes } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(InternalContext);
    const previousActivatorEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePrevious"])(activatorEvent);
    const previousActiveId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePrevious"])(active == null ? void 0 : active.id); // Restore keyboard focus on the activator node
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (disabled) {
            return;
        }
        if (!activatorEvent && previousActivatorEvent && previousActiveId != null) {
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isKeyboardEvent"])(previousActivatorEvent)) {
                return;
            }
            if (document.activeElement === previousActivatorEvent.target) {
                // No need to restore focus
                return;
            }
            const draggableNode = draggableNodes.get(previousActiveId);
            if (!draggableNode) {
                return;
            }
            const { activatorNode, node } = draggableNode;
            if (!activatorNode.current && !node.current) {
                return;
            }
            requestAnimationFrame(()=>{
                for (const element of [
                    activatorNode.current,
                    node.current
                ]){
                    if (!element) {
                        continue;
                    }
                    const focusableNode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findFirstFocusableNode"])(element);
                    if (focusableNode) {
                        focusableNode.focus();
                        break;
                    }
                }
            });
        }
    }, [
        activatorEvent,
        disabled,
        draggableNodes,
        previousActiveId,
        previousActivatorEvent
    ]);
    return null;
}
function applyModifiers(modifiers, _ref) {
    let { transform, ...args } = _ref;
    return modifiers != null && modifiers.length ? modifiers.reduce((accumulator, modifier)=>{
        return modifier({
            transform: accumulator,
            ...args
        });
    }, transform) : transform;
}
function useMeasuringConfiguration(config) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            draggable: {
                ...defaultMeasuringConfiguration.draggable,
                ...config == null ? void 0 : config.draggable
            },
            droppable: {
                ...defaultMeasuringConfiguration.droppable,
                ...config == null ? void 0 : config.droppable
            },
            dragOverlay: {
                ...defaultMeasuringConfiguration.dragOverlay,
                ...config == null ? void 0 : config.dragOverlay
            }
        }), [
        config == null ? void 0 : config.draggable,
        config == null ? void 0 : config.droppable,
        config == null ? void 0 : config.dragOverlay
    ]);
}
function useLayoutShiftScrollCompensation(_ref) {
    let { activeNode, measure, initialRect, config = true } = _ref;
    const initialized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const { x, y } = typeof config === 'boolean' ? {
        x: config,
        y: config
    } : config;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsomorphicLayoutEffect"])(()=>{
        const disabled = !x && !y;
        if (disabled || !activeNode) {
            initialized.current = false;
            return;
        }
        if (initialized.current || !initialRect) {
            // Return early if layout shift scroll compensation was already attempted
            // or if there is no initialRect to compare to.
            return;
        } // Get the most up to date node ref for the active draggable
        const node = activeNode == null ? void 0 : activeNode.node.current;
        if (!node || node.isConnected === false) {
            // Return early if there is no attached node ref or if the node is
            // disconnected from the document.
            return;
        }
        const rect = measure(node);
        const rectDelta = getRectDelta(rect, initialRect);
        if (!x) {
            rectDelta.x = 0;
        }
        if (!y) {
            rectDelta.y = 0;
        } // Only perform layout shift scroll compensation once
        initialized.current = true;
        if (Math.abs(rectDelta.x) > 0 || Math.abs(rectDelta.y) > 0) {
            const firstScrollableAncestor = getFirstScrollableAncestor(node);
            if (firstScrollableAncestor) {
                firstScrollableAncestor.scrollBy({
                    top: rectDelta.y,
                    left: rectDelta.x
                });
            }
        }
    }, [
        activeNode,
        x,
        y,
        initialRect,
        measure
    ]);
}
const ActiveDraggableContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    ...defaultCoordinates,
    scaleX: 1,
    scaleY: 1
});
var Status;
(function(Status) {
    Status[Status["Uninitialized"] = 0] = "Uninitialized";
    Status[Status["Initializing"] = 1] = "Initializing";
    Status[Status["Initialized"] = 2] = "Initialized";
})(Status || (Status = {}));
const DndContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["memo"])(function DndContext(_ref) {
    var _sensorContext$curren, _dragOverlay$nodeRef$, _dragOverlay$rect, _over$rect;
    let { id, accessibility, autoScroll = true, children, sensors = defaultSensors, collisionDetection = rectIntersection, measuring, modifiers, ...props } = _ref;
    const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducer"])(reducer, undefined, getInitialState);
    const [state, dispatch] = store;
    const [dispatchMonitorEvent, registerMonitorListener] = useDndMonitorProvider();
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(Status.Uninitialized);
    const isInitialized = status === Status.Initialized;
    const { draggable: { active: activeId, nodes: draggableNodes, translate }, droppable: { containers: droppableContainers } } = state;
    const node = activeId != null ? draggableNodes.get(activeId) : null;
    const activeRects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        initial: null,
        translated: null
    });
    const active = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        var _node$data;
        return activeId != null ? {
            id: activeId,
            // It's possible for the active node to unmount while dragging
            data: (_node$data = node == null ? void 0 : node.data) != null ? _node$data : defaultData,
            rect: activeRects
        } : null;
    }, [
        activeId,
        node
    ]);
    const activeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [activeSensor, setActiveSensor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activatorEvent, setActivatorEvent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const latestProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLatestValue"])(props, Object.values(props));
    const draggableDescribedById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUniqueId"])("DndDescribedBy", id);
    const enabledDroppableContainers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>droppableContainers.getEnabled(), [
        droppableContainers
    ]);
    const measuringConfiguration = useMeasuringConfiguration(measuring);
    const { droppableRects, measureDroppableContainers, measuringScheduled } = useDroppableMeasuring(enabledDroppableContainers, {
        dragging: isInitialized,
        dependencies: [
            translate.x,
            translate.y
        ],
        config: measuringConfiguration.droppable
    });
    const activeNode = useCachedNode(draggableNodes, activeId);
    const activationCoordinates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>activatorEvent ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEventCoordinates"])(activatorEvent) : null, [
        activatorEvent
    ]);
    const autoScrollOptions = getAutoScrollerOptions();
    const initialActiveNodeRect = useInitialRect(activeNode, measuringConfiguration.draggable.measure);
    useLayoutShiftScrollCompensation({
        activeNode: activeId != null ? draggableNodes.get(activeId) : null,
        config: autoScrollOptions.layoutShiftCompensation,
        initialRect: initialActiveNodeRect,
        measure: measuringConfiguration.draggable.measure
    });
    const activeNodeRect = useRect(activeNode, measuringConfiguration.draggable.measure, initialActiveNodeRect);
    const containerNodeRect = useRect(activeNode ? activeNode.parentElement : null);
    const sensorContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        activatorEvent: null,
        active: null,
        activeNode,
        collisionRect: null,
        collisions: null,
        droppableRects,
        draggableNodes,
        draggingNode: null,
        draggingNodeRect: null,
        droppableContainers,
        over: null,
        scrollableAncestors: [],
        scrollAdjustedTranslate: null
    });
    const overNode = droppableContainers.getNodeFor((_sensorContext$curren = sensorContext.current.over) == null ? void 0 : _sensorContext$curren.id);
    const dragOverlay = useDragOverlayMeasuring({
        measure: measuringConfiguration.dragOverlay.measure
    }); // Use the rect of the drag overlay if it is mounted
    const draggingNode = (_dragOverlay$nodeRef$ = dragOverlay.nodeRef.current) != null ? _dragOverlay$nodeRef$ : activeNode;
    const draggingNodeRect = isInitialized ? (_dragOverlay$rect = dragOverlay.rect) != null ? _dragOverlay$rect : activeNodeRect : null;
    const usesDragOverlay = Boolean(dragOverlay.nodeRef.current && dragOverlay.rect); // The delta between the previous and new position of the draggable node
    // is only relevant when there is no drag overlay
    const nodeRectDelta = useRectDelta(usesDragOverlay ? null : activeNodeRect); // Get the window rect of the dragging node
    const windowRect = useWindowRect(draggingNode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWindow"])(draggingNode) : null); // Get scrollable ancestors of the dragging node
    const scrollableAncestors = useScrollableAncestors(isInitialized ? overNode != null ? overNode : activeNode : null);
    const scrollableAncestorRects = useRects(scrollableAncestors); // Apply modifiers
    const modifiedTranslate = applyModifiers(modifiers, {
        transform: {
            x: translate.x - nodeRectDelta.x,
            y: translate.y - nodeRectDelta.y,
            scaleX: 1,
            scaleY: 1
        },
        activatorEvent,
        active,
        activeNodeRect,
        containerNodeRect,
        draggingNodeRect,
        over: sensorContext.current.over,
        overlayNodeRect: dragOverlay.rect,
        scrollableAncestors,
        scrollableAncestorRects,
        windowRect
    });
    const pointerCoordinates = activationCoordinates ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["add"])(activationCoordinates, translate) : null;
    const scrollOffsets = useScrollOffsets(scrollableAncestors); // Represents the scroll delta since dragging was initiated
    const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets); // Represents the scroll delta since the last time the active node rect was measured
    const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [
        activeNodeRect
    ]);
    const scrollAdjustedTranslate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["add"])(modifiedTranslate, scrollAdjustment);
    const collisionRect = draggingNodeRect ? getAdjustedRect(draggingNodeRect, modifiedTranslate) : null;
    const collisions = active && collisionRect ? collisionDetection({
        active,
        collisionRect,
        droppableRects,
        droppableContainers: enabledDroppableContainers,
        pointerCoordinates
    }) : null;
    const overId = getFirstCollision(collisions, 'id');
    const [over, setOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null); // When there is no drag overlay used, we need to account for the
    // window scroll delta
    const appliedTranslate = usesDragOverlay ? modifiedTranslate : (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["add"])(modifiedTranslate, activeNodeScrollDelta);
    const transform = adjustScale(appliedTranslate, (_over$rect = over == null ? void 0 : over.rect) != null ? _over$rect : null, activeNodeRect);
    const activeSensorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const instantiateSensor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((event, _ref2)=>{
        let { sensor: Sensor, options } = _ref2;
        if (activeRef.current == null) {
            return;
        }
        const activeNode = draggableNodes.get(activeRef.current);
        if (!activeNode) {
            return;
        }
        const activatorEvent = event.nativeEvent;
        const sensorInstance = new Sensor({
            active: activeRef.current,
            activeNode,
            event: activatorEvent,
            options,
            // Sensors need to be instantiated with refs for arguments that change over time
            // otherwise they are frozen in time with the stale arguments
            context: sensorContext,
            onAbort (id) {
                const draggableNode = draggableNodes.get(id);
                if (!draggableNode) {
                    return;
                }
                const { onDragAbort } = latestProps.current;
                const event = {
                    id
                };
                onDragAbort == null ? void 0 : onDragAbort(event);
                dispatchMonitorEvent({
                    type: 'onDragAbort',
                    event
                });
            },
            onPending (id, constraint, initialCoordinates, offset) {
                const draggableNode = draggableNodes.get(id);
                if (!draggableNode) {
                    return;
                }
                const { onDragPending } = latestProps.current;
                const event = {
                    id,
                    constraint,
                    initialCoordinates,
                    offset
                };
                onDragPending == null ? void 0 : onDragPending(event);
                dispatchMonitorEvent({
                    type: 'onDragPending',
                    event
                });
            },
            onStart (initialCoordinates) {
                const id = activeRef.current;
                if (id == null) {
                    return;
                }
                const draggableNode = draggableNodes.get(id);
                if (!draggableNode) {
                    return;
                }
                const { onDragStart } = latestProps.current;
                const event = {
                    activatorEvent,
                    active: {
                        id,
                        data: draggableNode.data,
                        rect: activeRects
                    }
                };
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["unstable_batchedUpdates"])(()=>{
                    onDragStart == null ? void 0 : onDragStart(event);
                    setStatus(Status.Initializing);
                    dispatch({
                        type: Action.DragStart,
                        initialCoordinates,
                        active: id
                    });
                    dispatchMonitorEvent({
                        type: 'onDragStart',
                        event
                    });
                    setActiveSensor(activeSensorRef.current);
                    setActivatorEvent(activatorEvent);
                });
            },
            onMove (coordinates) {
                dispatch({
                    type: Action.DragMove,
                    coordinates
                });
            },
            onEnd: createHandler(Action.DragEnd),
            onCancel: createHandler(Action.DragCancel)
        });
        activeSensorRef.current = sensorInstance;
        function createHandler(type) {
            return async function handler() {
                const { active, collisions, over, scrollAdjustedTranslate } = sensorContext.current;
                let event = null;
                if (active && scrollAdjustedTranslate) {
                    const { cancelDrop } = latestProps.current;
                    event = {
                        activatorEvent,
                        active: active,
                        collisions,
                        delta: scrollAdjustedTranslate,
                        over
                    };
                    if (type === Action.DragEnd && typeof cancelDrop === 'function') {
                        const shouldCancel = await Promise.resolve(cancelDrop(event));
                        if (shouldCancel) {
                            type = Action.DragCancel;
                        }
                    }
                }
                activeRef.current = null;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["unstable_batchedUpdates"])(()=>{
                    dispatch({
                        type
                    });
                    setStatus(Status.Uninitialized);
                    setOver(null);
                    setActiveSensor(null);
                    setActivatorEvent(null);
                    activeSensorRef.current = null;
                    const eventName = type === Action.DragEnd ? 'onDragEnd' : 'onDragCancel';
                    if (event) {
                        const handler = latestProps.current[eventName];
                        handler == null ? void 0 : handler(event);
                        dispatchMonitorEvent({
                            type: eventName,
                            event
                        });
                    }
                });
            };
        }
    }, [
        draggableNodes
    ]);
    const bindActivatorToSensorInstantiator = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((handler, sensor)=>{
        return (event, active)=>{
            const nativeEvent = event.nativeEvent;
            const activeDraggableNode = draggableNodes.get(active);
            if (activeRef.current !== null || // No active draggable
            !activeDraggableNode || // Event has already been captured
            nativeEvent.dndKit || nativeEvent.defaultPrevented) {
                return;
            }
            const activationContext = {
                active: activeDraggableNode
            };
            const shouldActivate = handler(event, sensor.options, activationContext);
            if (shouldActivate === true) {
                nativeEvent.dndKit = {
                    capturedBy: sensor.sensor
                };
                activeRef.current = active;
                instantiateSensor(event, sensor);
            }
        };
    }, [
        draggableNodes,
        instantiateSensor
    ]);
    const activators = useCombineActivators(sensors, bindActivatorToSensorInstantiator);
    useSensorSetup(sensors);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsomorphicLayoutEffect"])(()=>{
        if (activeNodeRect && status === Status.Initializing) {
            setStatus(Status.Initialized);
        }
    }, [
        activeNodeRect,
        status
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const { onDragMove } = latestProps.current;
        const { active, activatorEvent, collisions, over } = sensorContext.current;
        if (!active || !activatorEvent) {
            return;
        }
        const event = {
            active,
            activatorEvent,
            collisions,
            delta: {
                x: scrollAdjustedTranslate.x,
                y: scrollAdjustedTranslate.y
            },
            over
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["unstable_batchedUpdates"])(()=>{
            onDragMove == null ? void 0 : onDragMove(event);
            dispatchMonitorEvent({
                type: 'onDragMove',
                event
            });
        });
    }, [
        scrollAdjustedTranslate.x,
        scrollAdjustedTranslate.y
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const { active, activatorEvent, collisions, droppableContainers, scrollAdjustedTranslate } = sensorContext.current;
        if (!active || activeRef.current == null || !activatorEvent || !scrollAdjustedTranslate) {
            return;
        }
        const { onDragOver } = latestProps.current;
        const overContainer = droppableContainers.get(overId);
        const over = overContainer && overContainer.rect.current ? {
            id: overContainer.id,
            rect: overContainer.rect.current,
            data: overContainer.data,
            disabled: overContainer.disabled
        } : null;
        const event = {
            active,
            activatorEvent,
            collisions,
            delta: {
                x: scrollAdjustedTranslate.x,
                y: scrollAdjustedTranslate.y
            },
            over
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["unstable_batchedUpdates"])(()=>{
            setOver(over);
            onDragOver == null ? void 0 : onDragOver(event);
            dispatchMonitorEvent({
                type: 'onDragOver',
                event
            });
        });
    }, [
        overId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsomorphicLayoutEffect"])(()=>{
        sensorContext.current = {
            activatorEvent,
            active,
            activeNode,
            collisionRect,
            collisions,
            droppableRects,
            draggableNodes,
            draggingNode,
            draggingNodeRect,
            droppableContainers,
            over,
            scrollableAncestors,
            scrollAdjustedTranslate
        };
        activeRects.current = {
            initial: draggingNodeRect,
            translated: collisionRect
        };
    }, [
        active,
        activeNode,
        collisions,
        collisionRect,
        draggableNodes,
        draggingNode,
        draggingNodeRect,
        droppableRects,
        droppableContainers,
        over,
        scrollableAncestors,
        scrollAdjustedTranslate
    ]);
    useAutoScroller({
        ...autoScrollOptions,
        delta: translate,
        draggingRect: collisionRect,
        pointerCoordinates,
        scrollableAncestors,
        scrollableAncestorRects
    });
    const publicContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const context = {
            active,
            activeNode,
            activeNodeRect,
            activatorEvent,
            collisions,
            containerNodeRect,
            dragOverlay,
            draggableNodes,
            droppableContainers,
            droppableRects,
            over,
            measureDroppableContainers,
            scrollableAncestors,
            scrollableAncestorRects,
            measuringConfiguration,
            measuringScheduled,
            windowRect
        };
        return context;
    }, [
        active,
        activeNode,
        activeNodeRect,
        activatorEvent,
        collisions,
        containerNodeRect,
        dragOverlay,
        draggableNodes,
        droppableContainers,
        droppableRects,
        over,
        measureDroppableContainers,
        scrollableAncestors,
        scrollableAncestorRects,
        measuringConfiguration,
        measuringScheduled,
        windowRect
    ]);
    const internalContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const context = {
            activatorEvent,
            activators,
            active,
            activeNodeRect,
            ariaDescribedById: {
                draggable: draggableDescribedById
            },
            dispatch,
            draggableNodes,
            over,
            measureDroppableContainers
        };
        return context;
    }, [
        activatorEvent,
        activators,
        active,
        activeNodeRect,
        dispatch,
        draggableDescribedById,
        draggableNodes,
        over,
        measureDroppableContainers
    ]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(DndMonitorContext.Provider, {
        value: registerMonitorListener
    }, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(InternalContext.Provider, {
        value: internalContext
    }, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(PublicContext.Provider, {
        value: publicContext
    }, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(ActiveDraggableContext.Provider, {
        value: transform
    }, children)), __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(RestoreFocus, {
        disabled: (accessibility == null ? void 0 : accessibility.restoreFocus) === false
    })), __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(Accessibility, {
        ...accessibility,
        hiddenTextDescribedById: draggableDescribedById
    }));
    //TURBOPACK unreachable
    ;
    function getAutoScrollerOptions() {
        const activeSensorDisablesAutoscroll = (activeSensor == null ? void 0 : activeSensor.autoScrollEnabled) === false;
        const autoScrollGloballyDisabled = typeof autoScroll === 'object' ? autoScroll.enabled === false : autoScroll === false;
        const enabled = isInitialized && !activeSensorDisablesAutoscroll && !autoScrollGloballyDisabled;
        if (typeof autoScroll === 'object') {
            return {
                ...autoScroll,
                enabled
            };
        }
        return {
            enabled
        };
    }
});
const NullContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
const defaultRole = 'button';
const ID_PREFIX = 'Draggable';
function useDraggable(_ref) {
    let { id, data, disabled = false, attributes } = _ref;
    const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUniqueId"])(ID_PREFIX);
    const { activators, activatorEvent, active, activeNodeRect, ariaDescribedById, draggableNodes, over } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(InternalContext);
    const { role = defaultRole, roleDescription = 'draggable', tabIndex = 0 } = attributes != null ? attributes : {};
    const isDragging = (active == null ? void 0 : active.id) === id;
    const transform = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(isDragging ? ActiveDraggableContext : NullContext);
    const [node, setNodeRef] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNodeRef"])();
    const [activatorNode, setActivatorNodeRef] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNodeRef"])();
    const listeners = useSyntheticListeners(activators, id);
    const dataRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLatestValue"])(data);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsomorphicLayoutEffect"])(()=>{
        draggableNodes.set(id, {
            id,
            key,
            node,
            activatorNode,
            data: dataRef
        });
        return ()=>{
            const node = draggableNodes.get(id);
            if (node && node.key === key) {
                draggableNodes.delete(id);
            }
        };
    }, [
        draggableNodes,
        id
    ]);
    const memoizedAttributes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            role,
            tabIndex,
            'aria-disabled': disabled,
            'aria-pressed': isDragging && role === defaultRole ? true : undefined,
            'aria-roledescription': roleDescription,
            'aria-describedby': ariaDescribedById.draggable
        }), [
        disabled,
        role,
        tabIndex,
        isDragging,
        roleDescription,
        ariaDescribedById.draggable
    ]);
    return {
        active,
        activatorEvent,
        activeNodeRect,
        attributes: memoizedAttributes,
        isDragging,
        listeners: disabled ? undefined : listeners,
        node,
        over,
        setNodeRef,
        setActivatorNodeRef,
        transform
    };
}
function useDndContext() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(PublicContext);
}
const ID_PREFIX$1 = 'Droppable';
const defaultResizeObserverConfig = {
    timeout: 25
};
function useDroppable(_ref) {
    let { data, disabled = false, id, resizeObserverConfig } = _ref;
    const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUniqueId"])(ID_PREFIX$1);
    const { active, dispatch, over, measureDroppableContainers } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(InternalContext);
    const previous = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        disabled
    });
    const resizeObserverConnected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const rect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const callbackId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { disabled: resizeObserverDisabled, updateMeasurementsFor, timeout: resizeObserverTimeout } = {
        ...defaultResizeObserverConfig,
        ...resizeObserverConfig
    };
    const ids = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLatestValue"])(updateMeasurementsFor != null ? updateMeasurementsFor : id);
    const handleResize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!resizeObserverConnected.current) {
            // ResizeObserver invokes the `handleResize` callback as soon as `observe` is called,
            // assuming the element is rendered and displayed.
            resizeObserverConnected.current = true;
            return;
        }
        if (callbackId.current != null) {
            clearTimeout(callbackId.current);
        }
        callbackId.current = setTimeout(()=>{
            measureDroppableContainers(Array.isArray(ids.current) ? ids.current : [
                ids.current
            ]);
            callbackId.current = null;
        }, resizeObserverTimeout);
    }, [
        resizeObserverTimeout
    ]);
    const resizeObserver = useResizeObserver({
        callback: handleResize,
        disabled: resizeObserverDisabled || !active
    });
    const handleNodeChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((newElement, previousElement)=>{
        if (!resizeObserver) {
            return;
        }
        if (previousElement) {
            resizeObserver.unobserve(previousElement);
            resizeObserverConnected.current = false;
        }
        if (newElement) {
            resizeObserver.observe(newElement);
        }
    }, [
        resizeObserver
    ]);
    const [nodeRef, setNodeRef] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNodeRef"])(handleNodeChange);
    const dataRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLatestValue"])(data);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!resizeObserver || !nodeRef.current) {
            return;
        }
        resizeObserver.disconnect();
        resizeObserverConnected.current = false;
        resizeObserver.observe(nodeRef.current);
    }, [
        nodeRef,
        resizeObserver
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        dispatch({
            type: Action.RegisterDroppable,
            element: {
                id,
                key,
                disabled,
                node: nodeRef,
                rect,
                data: dataRef
            }
        });
        return ()=>dispatch({
                type: Action.UnregisterDroppable,
                key,
                id
            });
    }, [
        id
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (disabled !== previous.current.disabled) {
            dispatch({
                type: Action.SetDroppableDisabled,
                id,
                key,
                disabled
            });
            previous.current.disabled = disabled;
        }
    }, [
        id,
        key,
        disabled,
        dispatch
    ]);
    return {
        active,
        rect,
        isOver: (over == null ? void 0 : over.id) === id,
        node: nodeRef,
        over,
        setNodeRef
    };
}
function AnimationManager(_ref) {
    let { animation, children } = _ref;
    const [clonedChildren, setClonedChildren] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [element, setElement] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const previousChildren = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePrevious"])(children);
    if (!children && !clonedChildren && previousChildren) {
        setClonedChildren(previousChildren);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsomorphicLayoutEffect"])(()=>{
        if (!element) {
            return;
        }
        const key = clonedChildren == null ? void 0 : clonedChildren.key;
        const id = clonedChildren == null ? void 0 : clonedChildren.props.id;
        if (key == null || id == null) {
            setClonedChildren(null);
            return;
        }
        Promise.resolve(animation(id, element)).then(()=>{
            setClonedChildren(null);
        });
    }, [
        animation,
        clonedChildren,
        element
    ]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, null, children, clonedChildren ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneElement"])(clonedChildren, {
        ref: setElement
    }) : null);
}
const defaultTransform = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1
};
function NullifiedContextProvider(_ref) {
    let { children } = _ref;
    return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(InternalContext.Provider, {
        value: defaultInternalContext
    }, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(ActiveDraggableContext.Provider, {
        value: defaultTransform
    }, children));
}
const baseStyles = {
    position: 'fixed',
    touchAction: 'none'
};
const defaultTransition = (activatorEvent)=>{
    const isKeyboardActivator = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isKeyboardEvent"])(activatorEvent);
    return isKeyboardActivator ? 'transform 250ms ease' : undefined;
};
const PositionedOverlay = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])((_ref, ref)=>{
    let { as, activatorEvent, adjustScale, children, className, rect, style, transform, transition = defaultTransition } = _ref;
    if (!rect) {
        return null;
    }
    const scaleAdjustedTransform = adjustScale ? transform : {
        ...transform,
        scaleX: 1,
        scaleY: 1
    };
    const styles = {
        ...baseStyles,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        transform: __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CSS"].Transform.toString(scaleAdjustedTransform),
        transformOrigin: adjustScale && activatorEvent ? getRelativeTransformOrigin(activatorEvent, rect) : undefined,
        transition: typeof transition === 'function' ? transition(activatorEvent) : transition,
        ...style
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(as, {
        className,
        style: styles,
        ref
    }, children);
});
const defaultDropAnimationSideEffects = (options)=>(_ref)=>{
        let { active, dragOverlay } = _ref;
        const originalStyles = {};
        const { styles, className } = options;
        if (styles != null && styles.active) {
            for (const [key, value] of Object.entries(styles.active)){
                if (value === undefined) {
                    continue;
                }
                originalStyles[key] = active.node.style.getPropertyValue(key);
                active.node.style.setProperty(key, value);
            }
        }
        if (styles != null && styles.dragOverlay) {
            for (const [key, value] of Object.entries(styles.dragOverlay)){
                if (value === undefined) {
                    continue;
                }
                dragOverlay.node.style.setProperty(key, value);
            }
        }
        if (className != null && className.active) {
            active.node.classList.add(className.active);
        }
        if (className != null && className.dragOverlay) {
            dragOverlay.node.classList.add(className.dragOverlay);
        }
        return function cleanup() {
            for (const [key, value] of Object.entries(originalStyles)){
                active.node.style.setProperty(key, value);
            }
            if (className != null && className.active) {
                active.node.classList.remove(className.active);
            }
        };
    };
const defaultKeyframeResolver = (_ref2)=>{
    let { transform: { initial, final } } = _ref2;
    return [
        {
            transform: __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CSS"].Transform.toString(initial)
        },
        {
            transform: __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CSS"].Transform.toString(final)
        }
    ];
};
const defaultDropAnimationConfiguration = {
    duration: 250,
    easing: 'ease',
    keyframes: defaultKeyframeResolver,
    sideEffects: /*#__PURE__*/ defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0'
            }
        }
    })
};
function useDropAnimation(_ref3) {
    let { config, draggableNodes, droppableContainers, measuringConfiguration } = _ref3;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEvent"])((id, node)=>{
        if (config === null) {
            return;
        }
        const activeDraggable = draggableNodes.get(id);
        if (!activeDraggable) {
            return;
        }
        const activeNode = activeDraggable.node.current;
        if (!activeNode) {
            return;
        }
        const measurableNode = getMeasurableNode(node);
        if (!measurableNode) {
            return;
        }
        const { transform } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWindow"])(node).getComputedStyle(node);
        const parsedTransform = parseTransform(transform);
        if (!parsedTransform) {
            return;
        }
        const animation = typeof config === 'function' ? config : createDefaultDropAnimation(config);
        scrollIntoViewIfNeeded(activeNode, measuringConfiguration.draggable.measure);
        return animation({
            active: {
                id,
                data: activeDraggable.data,
                node: activeNode,
                rect: measuringConfiguration.draggable.measure(activeNode)
            },
            draggableNodes,
            dragOverlay: {
                node,
                rect: measuringConfiguration.dragOverlay.measure(measurableNode)
            },
            droppableContainers,
            measuringConfiguration,
            transform: parsedTransform
        });
    });
}
function createDefaultDropAnimation(options) {
    const { duration, easing, sideEffects, keyframes } = {
        ...defaultDropAnimationConfiguration,
        ...options
    };
    return (_ref4)=>{
        let { active, dragOverlay, transform, ...rest } = _ref4;
        if (!duration) {
            // Do not animate if animation duration is zero.
            return;
        }
        const delta = {
            x: dragOverlay.rect.left - active.rect.left,
            y: dragOverlay.rect.top - active.rect.top
        };
        const scale = {
            scaleX: transform.scaleX !== 1 ? active.rect.width * transform.scaleX / dragOverlay.rect.width : 1,
            scaleY: transform.scaleY !== 1 ? active.rect.height * transform.scaleY / dragOverlay.rect.height : 1
        };
        const finalTransform = {
            x: transform.x - delta.x,
            y: transform.y - delta.y,
            ...scale
        };
        const animationKeyframes = keyframes({
            ...rest,
            active,
            dragOverlay,
            transform: {
                initial: transform,
                final: finalTransform
            }
        });
        const [firstKeyframe] = animationKeyframes;
        const lastKeyframe = animationKeyframes[animationKeyframes.length - 1];
        if (JSON.stringify(firstKeyframe) === JSON.stringify(lastKeyframe)) {
            // The start and end keyframes are the same, infer that there is no animation needed.
            return;
        }
        const cleanup = sideEffects == null ? void 0 : sideEffects({
            active,
            dragOverlay,
            ...rest
        });
        const animation = dragOverlay.node.animate(animationKeyframes, {
            duration,
            easing,
            fill: 'forwards'
        });
        return new Promise((resolve)=>{
            animation.onfinish = ()=>{
                cleanup == null ? void 0 : cleanup();
                resolve();
            };
        });
    };
}
let key = 0;
function useKey(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (id == null) {
            return;
        }
        key++;
        return key;
    }, [
        id
    ]);
}
const DragOverlay = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].memo((_ref)=>{
    let { adjustScale = false, children, dropAnimation: dropAnimationConfig, style, transition, modifiers, wrapperElement = 'div', className, zIndex = 999 } = _ref;
    const { activatorEvent, active, activeNodeRect, containerNodeRect, draggableNodes, droppableContainers, dragOverlay, over, measuringConfiguration, scrollableAncestors, scrollableAncestorRects, windowRect } = useDndContext();
    const transform = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ActiveDraggableContext);
    const key = useKey(active == null ? void 0 : active.id);
    const modifiedTransform = applyModifiers(modifiers, {
        activatorEvent,
        active,
        activeNodeRect,
        containerNodeRect,
        draggingNodeRect: dragOverlay.rect,
        over,
        overlayNodeRect: dragOverlay.rect,
        scrollableAncestors,
        scrollableAncestorRects,
        transform,
        windowRect
    });
    const initialRect = useInitialValue(activeNodeRect);
    const dropAnimation = useDropAnimation({
        config: dropAnimationConfig,
        draggableNodes,
        droppableContainers,
        measuringConfiguration
    }); // We need to wait for the active node to be measured before connecting the drag overlay ref
    // otherwise collisions can be computed against a mispositioned drag overlay
    const ref = initialRect ? dragOverlay.setRef : undefined;
    return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(NullifiedContextProvider, null, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(AnimationManager, {
        animation: dropAnimation
    }, active && key ? __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(PositionedOverlay, {
        key: key,
        id: active.id,
        ref: ref,
        as: wrapperElement,
        activatorEvent: activatorEvent,
        adjustScale: adjustScale,
        className: className,
        transition: transition,
        rect: initialRect,
        style: {
            zIndex,
            ...style
        },
        transform: modifiedTransform
    }, children) : null));
});
;
 //# sourceMappingURL=core.esm.js.map
}),
"[project]/versotech-portal/node_modules/@dnd-kit/sortable/dist/sortable.esm.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SortableContext",
    ()=>SortableContext,
    "arrayMove",
    ()=>arrayMove,
    "arraySwap",
    ()=>arraySwap,
    "defaultAnimateLayoutChanges",
    ()=>defaultAnimateLayoutChanges,
    "defaultNewIndexGetter",
    ()=>defaultNewIndexGetter,
    "hasSortableData",
    ()=>hasSortableData,
    "horizontalListSortingStrategy",
    ()=>horizontalListSortingStrategy,
    "rectSortingStrategy",
    ()=>rectSortingStrategy,
    "rectSwappingStrategy",
    ()=>rectSwappingStrategy,
    "sortableKeyboardCoordinates",
    ()=>sortableKeyboardCoordinates,
    "useSortable",
    ()=>useSortable,
    "verticalListSortingStrategy",
    ()=>verticalListSortingStrategy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@dnd-kit/core/dist/core.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@dnd-kit/utilities/dist/utilities.esm.js [app-ssr] (ecmascript)");
;
;
;
/**
 * Move an array item to a different position. Returns a new array with the item moved to the new position.
 */ function arrayMove(array, from, to) {
    const newArray = array.slice();
    newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
    return newArray;
}
/**
 * Swap an array item to a different position. Returns a new array with the item swapped to the new position.
 */ function arraySwap(array, from, to) {
    const newArray = array.slice();
    newArray[from] = array[to];
    newArray[to] = array[from];
    return newArray;
}
function getSortedRects(items, rects) {
    return items.reduce((accumulator, id, index)=>{
        const rect = rects.get(id);
        if (rect) {
            accumulator[index] = rect;
        }
        return accumulator;
    }, Array(items.length));
}
function isValidIndex(index) {
    return index !== null && index >= 0;
}
function itemsEqual(a, b) {
    if (a === b) {
        return true;
    }
    if (a.length !== b.length) {
        return false;
    }
    for(let i = 0; i < a.length; i++){
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
function normalizeDisabled(disabled) {
    if (typeof disabled === 'boolean') {
        return {
            draggable: disabled,
            droppable: disabled
        };
    }
    return disabled;
}
// To-do: We should be calculating scale transformation
const defaultScale = {
    scaleX: 1,
    scaleY: 1
};
const horizontalListSortingStrategy = (_ref)=>{
    var _rects$activeIndex;
    let { rects, activeNodeRect: fallbackActiveRect, activeIndex, overIndex, index } = _ref;
    const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;
    if (!activeNodeRect) {
        return null;
    }
    const itemGap = getItemGap(rects, index, activeIndex);
    if (index === activeIndex) {
        const newIndexRect = rects[overIndex];
        if (!newIndexRect) {
            return null;
        }
        return {
            x: activeIndex < overIndex ? newIndexRect.left + newIndexRect.width - (activeNodeRect.left + activeNodeRect.width) : newIndexRect.left - activeNodeRect.left,
            y: 0,
            ...defaultScale
        };
    }
    if (index > activeIndex && index <= overIndex) {
        return {
            x: -activeNodeRect.width - itemGap,
            y: 0,
            ...defaultScale
        };
    }
    if (index < activeIndex && index >= overIndex) {
        return {
            x: activeNodeRect.width + itemGap,
            y: 0,
            ...defaultScale
        };
    }
    return {
        x: 0,
        y: 0,
        ...defaultScale
    };
};
function getItemGap(rects, index, activeIndex) {
    const currentRect = rects[index];
    const previousRect = rects[index - 1];
    const nextRect = rects[index + 1];
    if (!currentRect || !previousRect && !nextRect) {
        return 0;
    }
    if (activeIndex < index) {
        return previousRect ? currentRect.left - (previousRect.left + previousRect.width) : nextRect.left - (currentRect.left + currentRect.width);
    }
    return nextRect ? nextRect.left - (currentRect.left + currentRect.width) : currentRect.left - (previousRect.left + previousRect.width);
}
const rectSortingStrategy = (_ref)=>{
    let { rects, activeIndex, overIndex, index } = _ref;
    const newRects = arrayMove(rects, overIndex, activeIndex);
    const oldRect = rects[index];
    const newRect = newRects[index];
    if (!newRect || !oldRect) {
        return null;
    }
    return {
        x: newRect.left - oldRect.left,
        y: newRect.top - oldRect.top,
        scaleX: newRect.width / oldRect.width,
        scaleY: newRect.height / oldRect.height
    };
};
const rectSwappingStrategy = (_ref)=>{
    let { activeIndex, index, rects, overIndex } = _ref;
    let oldRect;
    let newRect;
    if (index === activeIndex) {
        oldRect = rects[index];
        newRect = rects[overIndex];
    }
    if (index === overIndex) {
        oldRect = rects[index];
        newRect = rects[activeIndex];
    }
    if (!newRect || !oldRect) {
        return null;
    }
    return {
        x: newRect.left - oldRect.left,
        y: newRect.top - oldRect.top,
        scaleX: newRect.width / oldRect.width,
        scaleY: newRect.height / oldRect.height
    };
};
// To-do: We should be calculating scale transformation
const defaultScale$1 = {
    scaleX: 1,
    scaleY: 1
};
const verticalListSortingStrategy = (_ref)=>{
    var _rects$activeIndex;
    let { activeIndex, activeNodeRect: fallbackActiveRect, index, rects, overIndex } = _ref;
    const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;
    if (!activeNodeRect) {
        return null;
    }
    if (index === activeIndex) {
        const overIndexRect = rects[overIndex];
        if (!overIndexRect) {
            return null;
        }
        return {
            x: 0,
            y: activeIndex < overIndex ? overIndexRect.top + overIndexRect.height - (activeNodeRect.top + activeNodeRect.height) : overIndexRect.top - activeNodeRect.top,
            ...defaultScale$1
        };
    }
    const itemGap = getItemGap$1(rects, index, activeIndex);
    if (index > activeIndex && index <= overIndex) {
        return {
            x: 0,
            y: -activeNodeRect.height - itemGap,
            ...defaultScale$1
        };
    }
    if (index < activeIndex && index >= overIndex) {
        return {
            x: 0,
            y: activeNodeRect.height + itemGap,
            ...defaultScale$1
        };
    }
    return {
        x: 0,
        y: 0,
        ...defaultScale$1
    };
};
function getItemGap$1(clientRects, index, activeIndex) {
    const currentRect = clientRects[index];
    const previousRect = clientRects[index - 1];
    const nextRect = clientRects[index + 1];
    if (!currentRect) {
        return 0;
    }
    if (activeIndex < index) {
        return previousRect ? currentRect.top - (previousRect.top + previousRect.height) : nextRect ? nextRect.top - (currentRect.top + currentRect.height) : 0;
    }
    return nextRect ? nextRect.top - (currentRect.top + currentRect.height) : previousRect ? currentRect.top - (previousRect.top + previousRect.height) : 0;
}
const ID_PREFIX = 'Sortable';
const Context = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createContext({
    activeIndex: -1,
    containerId: ID_PREFIX,
    disableTransforms: false,
    items: [],
    overIndex: -1,
    useDragOverlay: false,
    sortedRects: [],
    strategy: rectSortingStrategy,
    disabled: {
        draggable: false,
        droppable: false
    }
});
function SortableContext(_ref) {
    let { children, id, items: userDefinedItems, strategy = rectSortingStrategy, disabled: disabledProp = false } = _ref;
    const { active, dragOverlay, droppableRects, over, measureDroppableContainers } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDndContext"])();
    const containerId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUniqueId"])(ID_PREFIX, id);
    const useDragOverlay = Boolean(dragOverlay.rect !== null);
    const items = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>userDefinedItems.map((item)=>typeof item === 'object' && 'id' in item ? item.id : item), [
        userDefinedItems
    ]);
    const isDragging = active != null;
    const activeIndex = active ? items.indexOf(active.id) : -1;
    const overIndex = over ? items.indexOf(over.id) : -1;
    const previousItemsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(items);
    const itemsHaveChanged = !itemsEqual(items, previousItemsRef.current);
    const disableTransforms = overIndex !== -1 && activeIndex === -1 || itemsHaveChanged;
    const disabled = normalizeDisabled(disabledProp);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsomorphicLayoutEffect"])(()=>{
        if (itemsHaveChanged && isDragging) {
            measureDroppableContainers(items);
        }
    }, [
        itemsHaveChanged,
        items,
        isDragging,
        measureDroppableContainers
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        previousItemsRef.current = items;
    }, [
        items
    ]);
    const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            activeIndex,
            containerId,
            disabled,
            disableTransforms,
            items,
            overIndex,
            useDragOverlay,
            sortedRects: getSortedRects(items, droppableRects),
            strategy
        }), [
        activeIndex,
        containerId,
        disabled.draggable,
        disabled.droppable,
        disableTransforms,
        items,
        overIndex,
        droppableRects,
        useDragOverlay,
        strategy
    ]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement(Context.Provider, {
        value: contextValue
    }, children);
}
const defaultNewIndexGetter = (_ref)=>{
    let { id, items, activeIndex, overIndex } = _ref;
    return arrayMove(items, activeIndex, overIndex).indexOf(id);
};
const defaultAnimateLayoutChanges = (_ref2)=>{
    let { containerId, isSorting, wasDragging, index, items, newIndex, previousItems, previousContainerId, transition } = _ref2;
    if (!transition || !wasDragging) {
        return false;
    }
    if (previousItems !== items && index === newIndex) {
        return false;
    }
    if (isSorting) {
        return true;
    }
    return newIndex !== index && containerId === previousContainerId;
};
const defaultTransition = {
    duration: 200,
    easing: 'ease'
};
const transitionProperty = 'transform';
const disabledTransition = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CSS"].Transition.toString({
    property: transitionProperty,
    duration: 0,
    easing: 'linear'
});
const defaultAttributes = {
    roleDescription: 'sortable'
};
/*
 * When the index of an item changes while sorting,
 * we need to temporarily disable the transforms
 */ function useDerivedTransform(_ref) {
    let { disabled, index, node, rect } = _ref;
    const [derivedTransform, setDerivedtransform] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const previousIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(index);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsomorphicLayoutEffect"])(()=>{
        if (!disabled && index !== previousIndex.current && node.current) {
            const initial = rect.current;
            if (initial) {
                const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getClientRect"])(node.current, {
                    ignoreTransform: true
                });
                const delta = {
                    x: initial.left - current.left,
                    y: initial.top - current.top,
                    scaleX: initial.width / current.width,
                    scaleY: initial.height / current.height
                };
                if (delta.x || delta.y) {
                    setDerivedtransform(delta);
                }
            }
        }
        if (index !== previousIndex.current) {
            previousIndex.current = index;
        }
    }, [
        disabled,
        index,
        node,
        rect
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (derivedTransform) {
            setDerivedtransform(null);
        }
    }, [
        derivedTransform
    ]);
    return derivedTransform;
}
function useSortable(_ref) {
    let { animateLayoutChanges = defaultAnimateLayoutChanges, attributes: userDefinedAttributes, disabled: localDisabled, data: customData, getNewIndex = defaultNewIndexGetter, id, strategy: localStrategy, resizeObserverConfig, transition = defaultTransition } = _ref;
    const { items, containerId, activeIndex, disabled: globalDisabled, disableTransforms, sortedRects, overIndex, useDragOverlay, strategy: globalStrategy } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(Context);
    const disabled = normalizeLocalDisabled(localDisabled, globalDisabled);
    const index = items.indexOf(id);
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            sortable: {
                containerId,
                index,
                items
            },
            ...customData
        }), [
        containerId,
        customData,
        index,
        items
    ]);
    const itemsAfterCurrentSortable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>items.slice(items.indexOf(id)), [
        items,
        id
    ]);
    const { rect, node, isOver, setNodeRef: setDroppableNodeRef } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDroppable"])({
        id,
        data,
        disabled: disabled.droppable,
        resizeObserverConfig: {
            updateMeasurementsFor: itemsAfterCurrentSortable,
            ...resizeObserverConfig
        }
    });
    const { active, activatorEvent, activeNodeRect, attributes, setNodeRef: setDraggableNodeRef, listeners, isDragging, over, setActivatorNodeRef, transform } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDraggable"])({
        id,
        data,
        attributes: {
            ...defaultAttributes,
            ...userDefinedAttributes
        },
        disabled: disabled.draggable
    });
    const setNodeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCombinedRefs"])(setDroppableNodeRef, setDraggableNodeRef);
    const isSorting = Boolean(active);
    const displaceItem = isSorting && !disableTransforms && isValidIndex(activeIndex) && isValidIndex(overIndex);
    const shouldDisplaceDragSource = !useDragOverlay && isDragging;
    const dragSourceDisplacement = shouldDisplaceDragSource && displaceItem ? transform : null;
    const strategy = localStrategy != null ? localStrategy : globalStrategy;
    const finalTransform = displaceItem ? dragSourceDisplacement != null ? dragSourceDisplacement : strategy({
        rects: sortedRects,
        activeNodeRect,
        activeIndex,
        overIndex,
        index
    }) : null;
    const newIndex = isValidIndex(activeIndex) && isValidIndex(overIndex) ? getNewIndex({
        id,
        items,
        activeIndex,
        overIndex
    }) : index;
    const activeId = active == null ? void 0 : active.id;
    const previous = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        activeId,
        items,
        newIndex,
        containerId
    });
    const itemsHaveChanged = items !== previous.current.items;
    const shouldAnimateLayoutChanges = animateLayoutChanges({
        active,
        containerId,
        isDragging,
        isSorting,
        id,
        index,
        items,
        newIndex: previous.current.newIndex,
        previousItems: previous.current.items,
        previousContainerId: previous.current.containerId,
        transition,
        wasDragging: previous.current.activeId != null
    });
    const derivedTransform = useDerivedTransform({
        disabled: !shouldAnimateLayoutChanges,
        index,
        node,
        rect
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isSorting && previous.current.newIndex !== newIndex) {
            previous.current.newIndex = newIndex;
        }
        if (containerId !== previous.current.containerId) {
            previous.current.containerId = containerId;
        }
        if (items !== previous.current.items) {
            previous.current.items = items;
        }
    }, [
        isSorting,
        newIndex,
        containerId,
        items
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (activeId === previous.current.activeId) {
            return;
        }
        if (activeId != null && previous.current.activeId == null) {
            previous.current.activeId = activeId;
            return;
        }
        const timeoutId = setTimeout(()=>{
            previous.current.activeId = activeId;
        }, 50);
        return ()=>clearTimeout(timeoutId);
    }, [
        activeId
    ]);
    return {
        active,
        activeIndex,
        attributes,
        data,
        rect,
        index,
        newIndex,
        items,
        isOver,
        isSorting,
        isDragging,
        listeners,
        node,
        overIndex,
        over,
        setNodeRef,
        setActivatorNodeRef,
        setDroppableNodeRef,
        setDraggableNodeRef,
        transform: derivedTransform != null ? derivedTransform : finalTransform,
        transition: getTransition()
    };
    //TURBOPACK unreachable
    ;
    function getTransition() {
        if (derivedTransform || // Or to prevent items jumping to back to their "new" position when items change
        itemsHaveChanged && previous.current.newIndex === index) {
            return disabledTransition;
        }
        if (shouldDisplaceDragSource && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isKeyboardEvent"])(activatorEvent) || !transition) {
            return undefined;
        }
        if (isSorting || shouldAnimateLayoutChanges) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CSS"].Transition.toString({
                ...transition,
                property: transitionProperty
            });
        }
        return undefined;
    }
}
function normalizeLocalDisabled(localDisabled, globalDisabled) {
    var _localDisabled$dragga, _localDisabled$droppa;
    if (typeof localDisabled === 'boolean') {
        return {
            draggable: localDisabled,
            // Backwards compatibility
            droppable: false
        };
    }
    return {
        draggable: (_localDisabled$dragga = localDisabled == null ? void 0 : localDisabled.draggable) != null ? _localDisabled$dragga : globalDisabled.draggable,
        droppable: (_localDisabled$droppa = localDisabled == null ? void 0 : localDisabled.droppable) != null ? _localDisabled$droppa : globalDisabled.droppable
    };
}
function hasSortableData(entry) {
    if (!entry) {
        return false;
    }
    const data = entry.data.current;
    if (data && 'sortable' in data && typeof data.sortable === 'object' && 'containerId' in data.sortable && 'items' in data.sortable && 'index' in data.sortable) {
        return true;
    }
    return false;
}
const directions = [
    __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KeyboardCode"].Down,
    __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KeyboardCode"].Right,
    __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KeyboardCode"].Up,
    __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KeyboardCode"].Left
];
const sortableKeyboardCoordinates = (event, _ref)=>{
    let { context: { active, collisionRect, droppableRects, droppableContainers, over, scrollableAncestors } } = _ref;
    if (directions.includes(event.code)) {
        event.preventDefault();
        if (!active || !collisionRect) {
            return;
        }
        const filteredContainers = [];
        droppableContainers.getEnabled().forEach((entry)=>{
            if (!entry || entry != null && entry.disabled) {
                return;
            }
            const rect = droppableRects.get(entry.id);
            if (!rect) {
                return;
            }
            switch(event.code){
                case __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KeyboardCode"].Down:
                    if (collisionRect.top < rect.top) {
                        filteredContainers.push(entry);
                    }
                    break;
                case __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KeyboardCode"].Up:
                    if (collisionRect.top > rect.top) {
                        filteredContainers.push(entry);
                    }
                    break;
                case __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KeyboardCode"].Left:
                    if (collisionRect.left > rect.left) {
                        filteredContainers.push(entry);
                    }
                    break;
                case __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KeyboardCode"].Right:
                    if (collisionRect.left < rect.left) {
                        filteredContainers.push(entry);
                    }
                    break;
            }
        });
        const collisions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["closestCorners"])({
            active,
            collisionRect: collisionRect,
            droppableRects,
            droppableContainers: filteredContainers,
            pointerCoordinates: null
        });
        let closestId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirstCollision"])(collisions, 'id');
        if (closestId === (over == null ? void 0 : over.id) && collisions.length > 1) {
            closestId = collisions[1].id;
        }
        if (closestId != null) {
            const activeDroppable = droppableContainers.get(active.id);
            const newDroppable = droppableContainers.get(closestId);
            const newRect = newDroppable ? droppableRects.get(newDroppable.id) : null;
            const newNode = newDroppable == null ? void 0 : newDroppable.node.current;
            if (newNode && newRect && activeDroppable && newDroppable) {
                const newScrollAncestors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$core$2f$dist$2f$core$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getScrollableAncestors"])(newNode);
                const hasDifferentScrollAncestors = newScrollAncestors.some((element, index)=>scrollableAncestors[index] !== element);
                const hasSameContainer = isSameContainer(activeDroppable, newDroppable);
                const isAfterActive = isAfter(activeDroppable, newDroppable);
                const offset = hasDifferentScrollAncestors || !hasSameContainer ? {
                    x: 0,
                    y: 0
                } : {
                    x: isAfterActive ? collisionRect.width - newRect.width : 0,
                    y: isAfterActive ? collisionRect.height - newRect.height : 0
                };
                const rectCoordinates = {
                    x: newRect.left,
                    y: newRect.top
                };
                const newCoordinates = offset.x && offset.y ? rectCoordinates : (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$dnd$2d$kit$2f$utilities$2f$dist$2f$utilities$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["subtract"])(rectCoordinates, offset);
                return newCoordinates;
            }
        }
    }
    return undefined;
};
function isSameContainer(a, b) {
    if (!hasSortableData(a) || !hasSortableData(b)) {
        return false;
    }
    return a.data.current.sortable.containerId === b.data.current.sortable.containerId;
}
function isAfter(a, b) {
    if (!hasSortableData(a) || !hasSortableData(b)) {
        return false;
    }
    if (!isSameContainer(a, b)) {
        return false;
    }
    return a.data.current.sortable.index < b.data.current.sortable.index;
}
;
 //# sourceMappingURL=sortable.esm.js.map
}),
"[project]/versotech-portal/node_modules/@tanstack/table-core/build/lib/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ColumnFaceting",
    ()=>ColumnFaceting,
    "ColumnFiltering",
    ()=>ColumnFiltering,
    "ColumnGrouping",
    ()=>ColumnGrouping,
    "ColumnOrdering",
    ()=>ColumnOrdering,
    "ColumnPinning",
    ()=>ColumnPinning,
    "ColumnSizing",
    ()=>ColumnSizing,
    "ColumnVisibility",
    ()=>ColumnVisibility,
    "GlobalFaceting",
    ()=>GlobalFaceting,
    "GlobalFiltering",
    ()=>GlobalFiltering,
    "Headers",
    ()=>Headers,
    "RowExpanding",
    ()=>RowExpanding,
    "RowPagination",
    ()=>RowPagination,
    "RowPinning",
    ()=>RowPinning,
    "RowSelection",
    ()=>RowSelection,
    "RowSorting",
    ()=>RowSorting,
    "_getVisibleLeafColumns",
    ()=>_getVisibleLeafColumns,
    "aggregationFns",
    ()=>aggregationFns,
    "buildHeaderGroups",
    ()=>buildHeaderGroups,
    "createCell",
    ()=>createCell,
    "createColumn",
    ()=>createColumn,
    "createColumnHelper",
    ()=>createColumnHelper,
    "createRow",
    ()=>createRow,
    "createTable",
    ()=>createTable,
    "defaultColumnSizing",
    ()=>defaultColumnSizing,
    "expandRows",
    ()=>expandRows,
    "filterFns",
    ()=>filterFns,
    "flattenBy",
    ()=>flattenBy,
    "functionalUpdate",
    ()=>functionalUpdate,
    "getCoreRowModel",
    ()=>getCoreRowModel,
    "getExpandedRowModel",
    ()=>getExpandedRowModel,
    "getFacetedMinMaxValues",
    ()=>getFacetedMinMaxValues,
    "getFacetedRowModel",
    ()=>getFacetedRowModel,
    "getFacetedUniqueValues",
    ()=>getFacetedUniqueValues,
    "getFilteredRowModel",
    ()=>getFilteredRowModel,
    "getGroupedRowModel",
    ()=>getGroupedRowModel,
    "getMemoOptions",
    ()=>getMemoOptions,
    "getPaginationRowModel",
    ()=>getPaginationRowModel,
    "getSortedRowModel",
    ()=>getSortedRowModel,
    "isFunction",
    ()=>isFunction,
    "isNumberArray",
    ()=>isNumberArray,
    "isRowSelected",
    ()=>isRowSelected,
    "isSubRowSelected",
    ()=>isSubRowSelected,
    "makeStateUpdater",
    ()=>makeStateUpdater,
    "memo",
    ()=>memo,
    "noop",
    ()=>noop,
    "orderColumns",
    ()=>orderColumns,
    "passiveEventSupported",
    ()=>passiveEventSupported,
    "reSplitAlphaNumeric",
    ()=>reSplitAlphaNumeric,
    "selectRowsFn",
    ()=>selectRowsFn,
    "shouldAutoRemoveFilter",
    ()=>shouldAutoRemoveFilter,
    "sortingFns",
    ()=>sortingFns
]);
/**
   * table-core
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   */ // type Person = {
//   firstName: string
//   lastName: string
//   age: number
//   visits: number
//   status: string
//   progress: number
//   createdAt: Date
//   nested: {
//     foo: [
//       {
//         bar: 'bar'
//       }
//     ]
//     bar: { subBar: boolean }[]
//     baz: {
//       foo: 'foo'
//       bar: {
//         baz: 'baz'
//       }
//     }
//   }
// }
// const test: DeepKeys<Person> = 'nested.foo.0.bar'
// const test2: DeepKeys<Person> = 'nested.bar'
// const helper = createColumnHelper<Person>()
// helper.accessor('nested.foo', {
//   cell: info => info.getValue(),
// })
// helper.accessor('nested.foo.0.bar', {
//   cell: info => info.getValue(),
// })
// helper.accessor('nested.bar', {
//   cell: info => info.getValue(),
// })
function createColumnHelper() {
    return {
        accessor: (accessor, column)=>{
            return typeof accessor === 'function' ? {
                ...column,
                accessorFn: accessor
            } : {
                ...column,
                accessorKey: accessor
            };
        },
        display: (column)=>column,
        group: (column)=>column
    };
}
// Is this type a tuple?
// If this type is a tuple, what indices are allowed?
///
function functionalUpdate(updater, input) {
    return typeof updater === 'function' ? updater(input) : updater;
}
function noop() {
//
}
function makeStateUpdater(key, instance) {
    return (updater)=>{
        instance.setState((old)=>{
            return {
                ...old,
                [key]: functionalUpdate(updater, old[key])
            };
        });
    };
}
function isFunction(d) {
    return d instanceof Function;
}
function isNumberArray(d) {
    return Array.isArray(d) && d.every((val)=>typeof val === 'number');
}
function flattenBy(arr, getChildren) {
    const flat = [];
    const recurse = (subArr)=>{
        subArr.forEach((item)=>{
            flat.push(item);
            const children = getChildren(item);
            if (children != null && children.length) {
                recurse(children);
            }
        });
    };
    recurse(arr);
    return flat;
}
function memo(getDeps, fn, opts) {
    let deps = [];
    let result;
    return (depArgs)=>{
        let depTime;
        if (opts.key && opts.debug) depTime = Date.now();
        const newDeps = getDeps(depArgs);
        const depsChanged = newDeps.length !== deps.length || newDeps.some((dep, index)=>deps[index] !== dep);
        if (!depsChanged) {
            return result;
        }
        deps = newDeps;
        let resultTime;
        if (opts.key && opts.debug) resultTime = Date.now();
        result = fn(...newDeps);
        opts == null || opts.onChange == null || opts.onChange(result);
        if (opts.key && opts.debug) {
            if (opts != null && opts.debug()) {
                const depEndTime = Math.round((Date.now() - depTime) * 100) / 100;
                const resultEndTime = Math.round((Date.now() - resultTime) * 100) / 100;
                const resultFpsPercentage = resultEndTime / 16;
                const pad = (str, num)=>{
                    str = String(str);
                    while(str.length < num){
                        str = ' ' + str;
                    }
                    return str;
                };
                console.info(`%c⏱ ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`, `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * resultFpsPercentage, 120))}deg 100% 31%);`, opts == null ? void 0 : opts.key);
            }
        }
        return result;
    };
}
function getMemoOptions(tableOptions, debugLevel, key, onChange) {
    return {
        debug: ()=>{
            var _tableOptions$debugAl;
            return (_tableOptions$debugAl = tableOptions == null ? void 0 : tableOptions.debugAll) != null ? _tableOptions$debugAl : tableOptions[debugLevel];
        },
        key: ("TURBOPACK compile-time value", "development") === 'development' && key,
        onChange
    };
}
function createCell(table, row, column, columnId) {
    const getRenderValue = ()=>{
        var _cell$getValue;
        return (_cell$getValue = cell.getValue()) != null ? _cell$getValue : table.options.renderFallbackValue;
    };
    const cell = {
        id: `${row.id}_${column.id}`,
        row,
        column,
        getValue: ()=>row.getValue(columnId),
        renderValue: getRenderValue,
        getContext: memo(()=>[
                table,
                column,
                row,
                cell
            ], (table, column, row, cell)=>({
                table,
                column,
                row,
                cell: cell,
                getValue: cell.getValue,
                renderValue: cell.renderValue
            }), getMemoOptions(table.options, 'debugCells', 'cell.getContext'))
    };
    table._features.forEach((feature)=>{
        feature.createCell == null || feature.createCell(cell, column, row, table);
    }, {});
    return cell;
}
function createColumn(table, columnDef, depth, parent) {
    var _ref, _resolvedColumnDef$id;
    const defaultColumn = table._getDefaultColumnDef();
    const resolvedColumnDef = {
        ...defaultColumn,
        ...columnDef
    };
    const accessorKey = resolvedColumnDef.accessorKey;
    let id = (_ref = (_resolvedColumnDef$id = resolvedColumnDef.id) != null ? _resolvedColumnDef$id : accessorKey ? typeof String.prototype.replaceAll === 'function' ? accessorKey.replaceAll('.', '_') : accessorKey.replace(/\./g, '_') : undefined) != null ? _ref : typeof resolvedColumnDef.header === 'string' ? resolvedColumnDef.header : undefined;
    let accessorFn;
    if (resolvedColumnDef.accessorFn) {
        accessorFn = resolvedColumnDef.accessorFn;
    } else if (accessorKey) {
        // Support deep accessor keys
        if (accessorKey.includes('.')) {
            accessorFn = (originalRow)=>{
                let result = originalRow;
                for (const key of accessorKey.split('.')){
                    var _result;
                    result = (_result = result) == null ? void 0 : _result[key];
                    if (("TURBOPACK compile-time value", "development") !== 'production' && result === undefined) {
                        console.warn(`"${key}" in deeply nested key "${accessorKey}" returned undefined.`);
                    }
                }
                return result;
            };
        } else {
            accessorFn = (originalRow)=>originalRow[resolvedColumnDef.accessorKey];
        }
    }
    if (!id) {
        if ("TURBOPACK compile-time truthy", 1) {
            throw new Error(resolvedColumnDef.accessorFn ? `Columns require an id when using an accessorFn` : `Columns require an id when using a non-string header`);
        }
        throw new Error();
    }
    let column = {
        id: `${String(id)}`,
        accessorFn,
        parent: parent,
        depth,
        columnDef: resolvedColumnDef,
        columns: [],
        getFlatColumns: memo(()=>[
                true
            ], ()=>{
            var _column$columns;
            return [
                column,
                ...(_column$columns = column.columns) == null ? void 0 : _column$columns.flatMap((d)=>d.getFlatColumns())
            ];
        }, getMemoOptions(table.options, 'debugColumns', 'column.getFlatColumns')),
        getLeafColumns: memo(()=>[
                table._getOrderColumnsFn()
            ], (orderColumns)=>{
            var _column$columns2;
            if ((_column$columns2 = column.columns) != null && _column$columns2.length) {
                let leafColumns = column.columns.flatMap((column)=>column.getLeafColumns());
                return orderColumns(leafColumns);
            }
            return [
                column
            ];
        }, getMemoOptions(table.options, 'debugColumns', 'column.getLeafColumns'))
    };
    for (const feature of table._features){
        feature.createColumn == null || feature.createColumn(column, table);
    }
    // Yes, we have to convert table to unknown, because we know more than the compiler here.
    return column;
}
const debug = 'debugHeaders';
//
function createHeader(table, column, options) {
    var _options$id;
    const id = (_options$id = options.id) != null ? _options$id : column.id;
    let header = {
        id,
        column,
        index: options.index,
        isPlaceholder: !!options.isPlaceholder,
        placeholderId: options.placeholderId,
        depth: options.depth,
        subHeaders: [],
        colSpan: 0,
        rowSpan: 0,
        headerGroup: null,
        getLeafHeaders: ()=>{
            const leafHeaders = [];
            const recurseHeader = (h)=>{
                if (h.subHeaders && h.subHeaders.length) {
                    h.subHeaders.map(recurseHeader);
                }
                leafHeaders.push(h);
            };
            recurseHeader(header);
            return leafHeaders;
        },
        getContext: ()=>({
                table,
                header: header,
                column
            })
    };
    table._features.forEach((feature)=>{
        feature.createHeader == null || feature.createHeader(header, table);
    });
    return header;
}
const Headers = {
    createTable: (table)=>{
        // Header Groups
        table.getHeaderGroups = memo(()=>[
                table.getAllColumns(),
                table.getVisibleLeafColumns(),
                table.getState().columnPinning.left,
                table.getState().columnPinning.right
            ], (allColumns, leafColumns, left, right)=>{
            var _left$map$filter, _right$map$filter;
            const leftColumns = (_left$map$filter = left == null ? void 0 : left.map((columnId)=>leafColumns.find((d)=>d.id === columnId)).filter(Boolean)) != null ? _left$map$filter : [];
            const rightColumns = (_right$map$filter = right == null ? void 0 : right.map((columnId)=>leafColumns.find((d)=>d.id === columnId)).filter(Boolean)) != null ? _right$map$filter : [];
            const centerColumns = leafColumns.filter((column)=>!(left != null && left.includes(column.id)) && !(right != null && right.includes(column.id)));
            const headerGroups = buildHeaderGroups(allColumns, [
                ...leftColumns,
                ...centerColumns,
                ...rightColumns
            ], table);
            return headerGroups;
        }, getMemoOptions(table.options, debug, 'getHeaderGroups'));
        table.getCenterHeaderGroups = memo(()=>[
                table.getAllColumns(),
                table.getVisibleLeafColumns(),
                table.getState().columnPinning.left,
                table.getState().columnPinning.right
            ], (allColumns, leafColumns, left, right)=>{
            leafColumns = leafColumns.filter((column)=>!(left != null && left.includes(column.id)) && !(right != null && right.includes(column.id)));
            return buildHeaderGroups(allColumns, leafColumns, table, 'center');
        }, getMemoOptions(table.options, debug, 'getCenterHeaderGroups'));
        table.getLeftHeaderGroups = memo(()=>[
                table.getAllColumns(),
                table.getVisibleLeafColumns(),
                table.getState().columnPinning.left
            ], (allColumns, leafColumns, left)=>{
            var _left$map$filter2;
            const orderedLeafColumns = (_left$map$filter2 = left == null ? void 0 : left.map((columnId)=>leafColumns.find((d)=>d.id === columnId)).filter(Boolean)) != null ? _left$map$filter2 : [];
            return buildHeaderGroups(allColumns, orderedLeafColumns, table, 'left');
        }, getMemoOptions(table.options, debug, 'getLeftHeaderGroups'));
        table.getRightHeaderGroups = memo(()=>[
                table.getAllColumns(),
                table.getVisibleLeafColumns(),
                table.getState().columnPinning.right
            ], (allColumns, leafColumns, right)=>{
            var _right$map$filter2;
            const orderedLeafColumns = (_right$map$filter2 = right == null ? void 0 : right.map((columnId)=>leafColumns.find((d)=>d.id === columnId)).filter(Boolean)) != null ? _right$map$filter2 : [];
            return buildHeaderGroups(allColumns, orderedLeafColumns, table, 'right');
        }, getMemoOptions(table.options, debug, 'getRightHeaderGroups'));
        // Footer Groups
        table.getFooterGroups = memo(()=>[
                table.getHeaderGroups()
            ], (headerGroups)=>{
            return [
                ...headerGroups
            ].reverse();
        }, getMemoOptions(table.options, debug, 'getFooterGroups'));
        table.getLeftFooterGroups = memo(()=>[
                table.getLeftHeaderGroups()
            ], (headerGroups)=>{
            return [
                ...headerGroups
            ].reverse();
        }, getMemoOptions(table.options, debug, 'getLeftFooterGroups'));
        table.getCenterFooterGroups = memo(()=>[
                table.getCenterHeaderGroups()
            ], (headerGroups)=>{
            return [
                ...headerGroups
            ].reverse();
        }, getMemoOptions(table.options, debug, 'getCenterFooterGroups'));
        table.getRightFooterGroups = memo(()=>[
                table.getRightHeaderGroups()
            ], (headerGroups)=>{
            return [
                ...headerGroups
            ].reverse();
        }, getMemoOptions(table.options, debug, 'getRightFooterGroups'));
        // Flat Headers
        table.getFlatHeaders = memo(()=>[
                table.getHeaderGroups()
            ], (headerGroups)=>{
            return headerGroups.map((headerGroup)=>{
                return headerGroup.headers;
            }).flat();
        }, getMemoOptions(table.options, debug, 'getFlatHeaders'));
        table.getLeftFlatHeaders = memo(()=>[
                table.getLeftHeaderGroups()
            ], (left)=>{
            return left.map((headerGroup)=>{
                return headerGroup.headers;
            }).flat();
        }, getMemoOptions(table.options, debug, 'getLeftFlatHeaders'));
        table.getCenterFlatHeaders = memo(()=>[
                table.getCenterHeaderGroups()
            ], (left)=>{
            return left.map((headerGroup)=>{
                return headerGroup.headers;
            }).flat();
        }, getMemoOptions(table.options, debug, 'getCenterFlatHeaders'));
        table.getRightFlatHeaders = memo(()=>[
                table.getRightHeaderGroups()
            ], (left)=>{
            return left.map((headerGroup)=>{
                return headerGroup.headers;
            }).flat();
        }, getMemoOptions(table.options, debug, 'getRightFlatHeaders'));
        // Leaf Headers
        table.getCenterLeafHeaders = memo(()=>[
                table.getCenterFlatHeaders()
            ], (flatHeaders)=>{
            return flatHeaders.filter((header)=>{
                var _header$subHeaders;
                return !((_header$subHeaders = header.subHeaders) != null && _header$subHeaders.length);
            });
        }, getMemoOptions(table.options, debug, 'getCenterLeafHeaders'));
        table.getLeftLeafHeaders = memo(()=>[
                table.getLeftFlatHeaders()
            ], (flatHeaders)=>{
            return flatHeaders.filter((header)=>{
                var _header$subHeaders2;
                return !((_header$subHeaders2 = header.subHeaders) != null && _header$subHeaders2.length);
            });
        }, getMemoOptions(table.options, debug, 'getLeftLeafHeaders'));
        table.getRightLeafHeaders = memo(()=>[
                table.getRightFlatHeaders()
            ], (flatHeaders)=>{
            return flatHeaders.filter((header)=>{
                var _header$subHeaders3;
                return !((_header$subHeaders3 = header.subHeaders) != null && _header$subHeaders3.length);
            });
        }, getMemoOptions(table.options, debug, 'getRightLeafHeaders'));
        table.getLeafHeaders = memo(()=>[
                table.getLeftHeaderGroups(),
                table.getCenterHeaderGroups(),
                table.getRightHeaderGroups()
            ], (left, center, right)=>{
            var _left$0$headers, _left$, _center$0$headers, _center$, _right$0$headers, _right$;
            return [
                ...(_left$0$headers = (_left$ = left[0]) == null ? void 0 : _left$.headers) != null ? _left$0$headers : [],
                ...(_center$0$headers = (_center$ = center[0]) == null ? void 0 : _center$.headers) != null ? _center$0$headers : [],
                ...(_right$0$headers = (_right$ = right[0]) == null ? void 0 : _right$.headers) != null ? _right$0$headers : []
            ].map((header)=>{
                return header.getLeafHeaders();
            }).flat();
        }, getMemoOptions(table.options, debug, 'getLeafHeaders'));
    }
};
function buildHeaderGroups(allColumns, columnsToGroup, table, headerFamily) {
    var _headerGroups$0$heade, _headerGroups$;
    // Find the max depth of the columns:
    // build the leaf column row
    // build each buffer row going up
    //    placeholder for non-existent level
    //    real column for existing level
    let maxDepth = 0;
    const findMaxDepth = function(columns, depth) {
        if (depth === void 0) {
            depth = 1;
        }
        maxDepth = Math.max(maxDepth, depth);
        columns.filter((column)=>column.getIsVisible()).forEach((column)=>{
            var _column$columns;
            if ((_column$columns = column.columns) != null && _column$columns.length) {
                findMaxDepth(column.columns, depth + 1);
            }
        }, 0);
    };
    findMaxDepth(allColumns);
    let headerGroups = [];
    const createHeaderGroup = (headersToGroup, depth)=>{
        // The header group we are creating
        const headerGroup = {
            depth,
            id: [
                headerFamily,
                `${depth}`
            ].filter(Boolean).join('_'),
            headers: []
        };
        // The parent columns we're going to scan next
        const pendingParentHeaders = [];
        // Scan each column for parents
        headersToGroup.forEach((headerToGroup)=>{
            // What is the latest (last) parent column?
            const latestPendingParentHeader = [
                ...pendingParentHeaders
            ].reverse()[0];
            const isLeafHeader = headerToGroup.column.depth === headerGroup.depth;
            let column;
            let isPlaceholder = false;
            if (isLeafHeader && headerToGroup.column.parent) {
                // The parent header is new
                column = headerToGroup.column.parent;
            } else {
                // The parent header is repeated
                column = headerToGroup.column;
                isPlaceholder = true;
            }
            if (latestPendingParentHeader && (latestPendingParentHeader == null ? void 0 : latestPendingParentHeader.column) === column) {
                // This column is repeated. Add it as a sub header to the next batch
                latestPendingParentHeader.subHeaders.push(headerToGroup);
            } else {
                // This is a new header. Let's create it
                const header = createHeader(table, column, {
                    id: [
                        headerFamily,
                        depth,
                        column.id,
                        headerToGroup == null ? void 0 : headerToGroup.id
                    ].filter(Boolean).join('_'),
                    isPlaceholder,
                    placeholderId: isPlaceholder ? `${pendingParentHeaders.filter((d)=>d.column === column).length}` : undefined,
                    depth,
                    index: pendingParentHeaders.length
                });
                // Add the headerToGroup as a subHeader of the new header
                header.subHeaders.push(headerToGroup);
                // Add the new header to the pendingParentHeaders to get grouped
                // in the next batch
                pendingParentHeaders.push(header);
            }
            headerGroup.headers.push(headerToGroup);
            headerToGroup.headerGroup = headerGroup;
        });
        headerGroups.push(headerGroup);
        if (depth > 0) {
            createHeaderGroup(pendingParentHeaders, depth - 1);
        }
    };
    const bottomHeaders = columnsToGroup.map((column, index)=>createHeader(table, column, {
            depth: maxDepth,
            index
        }));
    createHeaderGroup(bottomHeaders, maxDepth - 1);
    headerGroups.reverse();
    // headerGroups = headerGroups.filter(headerGroup => {
    //   return !headerGroup.headers.every(header => header.isPlaceholder)
    // })
    const recurseHeadersForSpans = (headers)=>{
        const filteredHeaders = headers.filter((header)=>header.column.getIsVisible());
        return filteredHeaders.map((header)=>{
            let colSpan = 0;
            let rowSpan = 0;
            let childRowSpans = [
                0
            ];
            if (header.subHeaders && header.subHeaders.length) {
                childRowSpans = [];
                recurseHeadersForSpans(header.subHeaders).forEach((_ref)=>{
                    let { colSpan: childColSpan, rowSpan: childRowSpan } = _ref;
                    colSpan += childColSpan;
                    childRowSpans.push(childRowSpan);
                });
            } else {
                colSpan = 1;
            }
            const minChildRowSpan = Math.min(...childRowSpans);
            rowSpan = rowSpan + minChildRowSpan;
            header.colSpan = colSpan;
            header.rowSpan = rowSpan;
            return {
                colSpan,
                rowSpan
            };
        });
    };
    recurseHeadersForSpans((_headerGroups$0$heade = (_headerGroups$ = headerGroups[0]) == null ? void 0 : _headerGroups$.headers) != null ? _headerGroups$0$heade : []);
    return headerGroups;
}
const createRow = (table, id, original, rowIndex, depth, subRows, parentId)=>{
    let row = {
        id,
        index: rowIndex,
        original,
        depth,
        parentId,
        _valuesCache: {},
        _uniqueValuesCache: {},
        getValue: (columnId)=>{
            if (row._valuesCache.hasOwnProperty(columnId)) {
                return row._valuesCache[columnId];
            }
            const column = table.getColumn(columnId);
            if (!(column != null && column.accessorFn)) {
                return undefined;
            }
            row._valuesCache[columnId] = column.accessorFn(row.original, rowIndex);
            return row._valuesCache[columnId];
        },
        getUniqueValues: (columnId)=>{
            if (row._uniqueValuesCache.hasOwnProperty(columnId)) {
                return row._uniqueValuesCache[columnId];
            }
            const column = table.getColumn(columnId);
            if (!(column != null && column.accessorFn)) {
                return undefined;
            }
            if (!column.columnDef.getUniqueValues) {
                row._uniqueValuesCache[columnId] = [
                    row.getValue(columnId)
                ];
                return row._uniqueValuesCache[columnId];
            }
            row._uniqueValuesCache[columnId] = column.columnDef.getUniqueValues(row.original, rowIndex);
            return row._uniqueValuesCache[columnId];
        },
        renderValue: (columnId)=>{
            var _row$getValue;
            return (_row$getValue = row.getValue(columnId)) != null ? _row$getValue : table.options.renderFallbackValue;
        },
        subRows: subRows != null ? subRows : [],
        getLeafRows: ()=>flattenBy(row.subRows, (d)=>d.subRows),
        getParentRow: ()=>row.parentId ? table.getRow(row.parentId, true) : undefined,
        getParentRows: ()=>{
            let parentRows = [];
            let currentRow = row;
            while(true){
                const parentRow = currentRow.getParentRow();
                if (!parentRow) break;
                parentRows.push(parentRow);
                currentRow = parentRow;
            }
            return parentRows.reverse();
        },
        getAllCells: memo(()=>[
                table.getAllLeafColumns()
            ], (leafColumns)=>{
            return leafColumns.map((column)=>{
                return createCell(table, row, column, column.id);
            });
        }, getMemoOptions(table.options, 'debugRows', 'getAllCells')),
        _getAllCellsByColumnId: memo(()=>[
                row.getAllCells()
            ], (allCells)=>{
            return allCells.reduce((acc, cell)=>{
                acc[cell.column.id] = cell;
                return acc;
            }, {});
        }, getMemoOptions(table.options, 'debugRows', 'getAllCellsByColumnId'))
    };
    for(let i = 0; i < table._features.length; i++){
        const feature = table._features[i];
        feature == null || feature.createRow == null || feature.createRow(row, table);
    }
    return row;
};
//
const ColumnFaceting = {
    createColumn: (column, table)=>{
        column._getFacetedRowModel = table.options.getFacetedRowModel && table.options.getFacetedRowModel(table, column.id);
        column.getFacetedRowModel = ()=>{
            if (!column._getFacetedRowModel) {
                return table.getPreFilteredRowModel();
            }
            return column._getFacetedRowModel();
        };
        column._getFacetedUniqueValues = table.options.getFacetedUniqueValues && table.options.getFacetedUniqueValues(table, column.id);
        column.getFacetedUniqueValues = ()=>{
            if (!column._getFacetedUniqueValues) {
                return new Map();
            }
            return column._getFacetedUniqueValues();
        };
        column._getFacetedMinMaxValues = table.options.getFacetedMinMaxValues && table.options.getFacetedMinMaxValues(table, column.id);
        column.getFacetedMinMaxValues = ()=>{
            if (!column._getFacetedMinMaxValues) {
                return undefined;
            }
            return column._getFacetedMinMaxValues();
        };
    }
};
const includesString = (row, columnId, filterValue)=>{
    var _filterValue$toString, _row$getValue;
    const search = filterValue == null || (_filterValue$toString = filterValue.toString()) == null ? void 0 : _filterValue$toString.toLowerCase();
    return Boolean((_row$getValue = row.getValue(columnId)) == null || (_row$getValue = _row$getValue.toString()) == null || (_row$getValue = _row$getValue.toLowerCase()) == null ? void 0 : _row$getValue.includes(search));
};
includesString.autoRemove = (val)=>testFalsey(val);
const includesStringSensitive = (row, columnId, filterValue)=>{
    var _row$getValue2;
    return Boolean((_row$getValue2 = row.getValue(columnId)) == null || (_row$getValue2 = _row$getValue2.toString()) == null ? void 0 : _row$getValue2.includes(filterValue));
};
includesStringSensitive.autoRemove = (val)=>testFalsey(val);
const equalsString = (row, columnId, filterValue)=>{
    var _row$getValue3;
    return ((_row$getValue3 = row.getValue(columnId)) == null || (_row$getValue3 = _row$getValue3.toString()) == null ? void 0 : _row$getValue3.toLowerCase()) === (filterValue == null ? void 0 : filterValue.toLowerCase());
};
equalsString.autoRemove = (val)=>testFalsey(val);
const arrIncludes = (row, columnId, filterValue)=>{
    var _row$getValue4;
    return (_row$getValue4 = row.getValue(columnId)) == null ? void 0 : _row$getValue4.includes(filterValue);
};
arrIncludes.autoRemove = (val)=>testFalsey(val);
const arrIncludesAll = (row, columnId, filterValue)=>{
    return !filterValue.some((val)=>{
        var _row$getValue5;
        return !((_row$getValue5 = row.getValue(columnId)) != null && _row$getValue5.includes(val));
    });
};
arrIncludesAll.autoRemove = (val)=>testFalsey(val) || !(val != null && val.length);
const arrIncludesSome = (row, columnId, filterValue)=>{
    return filterValue.some((val)=>{
        var _row$getValue6;
        return (_row$getValue6 = row.getValue(columnId)) == null ? void 0 : _row$getValue6.includes(val);
    });
};
arrIncludesSome.autoRemove = (val)=>testFalsey(val) || !(val != null && val.length);
const equals = (row, columnId, filterValue)=>{
    return row.getValue(columnId) === filterValue;
};
equals.autoRemove = (val)=>testFalsey(val);
const weakEquals = (row, columnId, filterValue)=>{
    return row.getValue(columnId) == filterValue;
};
weakEquals.autoRemove = (val)=>testFalsey(val);
const inNumberRange = (row, columnId, filterValue)=>{
    let [min, max] = filterValue;
    const rowValue = row.getValue(columnId);
    return rowValue >= min && rowValue <= max;
};
inNumberRange.resolveFilterValue = (val)=>{
    let [unsafeMin, unsafeMax] = val;
    let parsedMin = typeof unsafeMin !== 'number' ? parseFloat(unsafeMin) : unsafeMin;
    let parsedMax = typeof unsafeMax !== 'number' ? parseFloat(unsafeMax) : unsafeMax;
    let min = unsafeMin === null || Number.isNaN(parsedMin) ? -Infinity : parsedMin;
    let max = unsafeMax === null || Number.isNaN(parsedMax) ? Infinity : parsedMax;
    if (min > max) {
        const temp = min;
        min = max;
        max = temp;
    }
    return [
        min,
        max
    ];
};
inNumberRange.autoRemove = (val)=>testFalsey(val) || testFalsey(val[0]) && testFalsey(val[1]);
// Export
const filterFns = {
    includesString,
    includesStringSensitive,
    equalsString,
    arrIncludes,
    arrIncludesAll,
    arrIncludesSome,
    equals,
    weakEquals,
    inNumberRange
};
// Utils
function testFalsey(val) {
    return val === undefined || val === null || val === '';
}
//
const ColumnFiltering = {
    getDefaultColumnDef: ()=>{
        return {
            filterFn: 'auto'
        };
    },
    getInitialState: (state)=>{
        return {
            columnFilters: [],
            ...state
        };
    },
    getDefaultOptions: (table)=>{
        return {
            onColumnFiltersChange: makeStateUpdater('columnFilters', table),
            filterFromLeafRows: false,
            maxLeafRowFilterDepth: 100
        };
    },
    createColumn: (column, table)=>{
        column.getAutoFilterFn = ()=>{
            const firstRow = table.getCoreRowModel().flatRows[0];
            const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
            if (typeof value === 'string') {
                return filterFns.includesString;
            }
            if (typeof value === 'number') {
                return filterFns.inNumberRange;
            }
            if (typeof value === 'boolean') {
                return filterFns.equals;
            }
            if (value !== null && typeof value === 'object') {
                return filterFns.equals;
            }
            if (Array.isArray(value)) {
                return filterFns.arrIncludes;
            }
            return filterFns.weakEquals;
        };
        column.getFilterFn = ()=>{
            var _table$options$filter, _table$options$filter2;
            return isFunction(column.columnDef.filterFn) ? column.columnDef.filterFn : column.columnDef.filterFn === 'auto' ? column.getAutoFilterFn() : (_table$options$filter = (_table$options$filter2 = table.options.filterFns) == null ? void 0 : _table$options$filter2[column.columnDef.filterFn]) != null ? _table$options$filter : filterFns[column.columnDef.filterFn];
        };
        column.getCanFilter = ()=>{
            var _column$columnDef$ena, _table$options$enable, _table$options$enable2;
            return ((_column$columnDef$ena = column.columnDef.enableColumnFilter) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableColumnFilters) != null ? _table$options$enable : true) && ((_table$options$enable2 = table.options.enableFilters) != null ? _table$options$enable2 : true) && !!column.accessorFn;
        };
        column.getIsFiltered = ()=>column.getFilterIndex() > -1;
        column.getFilterValue = ()=>{
            var _table$getState$colum;
            return (_table$getState$colum = table.getState().columnFilters) == null || (_table$getState$colum = _table$getState$colum.find((d)=>d.id === column.id)) == null ? void 0 : _table$getState$colum.value;
        };
        column.getFilterIndex = ()=>{
            var _table$getState$colum2, _table$getState$colum3;
            return (_table$getState$colum2 = (_table$getState$colum3 = table.getState().columnFilters) == null ? void 0 : _table$getState$colum3.findIndex((d)=>d.id === column.id)) != null ? _table$getState$colum2 : -1;
        };
        column.setFilterValue = (value)=>{
            table.setColumnFilters((old)=>{
                const filterFn = column.getFilterFn();
                const previousFilter = old == null ? void 0 : old.find((d)=>d.id === column.id);
                const newFilter = functionalUpdate(value, previousFilter ? previousFilter.value : undefined);
                //
                if (shouldAutoRemoveFilter(filterFn, newFilter, column)) {
                    var _old$filter;
                    return (_old$filter = old == null ? void 0 : old.filter((d)=>d.id !== column.id)) != null ? _old$filter : [];
                }
                const newFilterObj = {
                    id: column.id,
                    value: newFilter
                };
                if (previousFilter) {
                    var _old$map;
                    return (_old$map = old == null ? void 0 : old.map((d)=>{
                        if (d.id === column.id) {
                            return newFilterObj;
                        }
                        return d;
                    })) != null ? _old$map : [];
                }
                if (old != null && old.length) {
                    return [
                        ...old,
                        newFilterObj
                    ];
                }
                return [
                    newFilterObj
                ];
            });
        };
    },
    createRow: (row, _table)=>{
        row.columnFilters = {};
        row.columnFiltersMeta = {};
    },
    createTable: (table)=>{
        table.setColumnFilters = (updater)=>{
            const leafColumns = table.getAllLeafColumns();
            const updateFn = (old)=>{
                var _functionalUpdate;
                return (_functionalUpdate = functionalUpdate(updater, old)) == null ? void 0 : _functionalUpdate.filter((filter)=>{
                    const column = leafColumns.find((d)=>d.id === filter.id);
                    if (column) {
                        const filterFn = column.getFilterFn();
                        if (shouldAutoRemoveFilter(filterFn, filter.value, column)) {
                            return false;
                        }
                    }
                    return true;
                });
            };
            table.options.onColumnFiltersChange == null || table.options.onColumnFiltersChange(updateFn);
        };
        table.resetColumnFilters = (defaultState)=>{
            var _table$initialState$c, _table$initialState;
            table.setColumnFilters(defaultState ? [] : (_table$initialState$c = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.columnFilters) != null ? _table$initialState$c : []);
        };
        table.getPreFilteredRowModel = ()=>table.getCoreRowModel();
        table.getFilteredRowModel = ()=>{
            if (!table._getFilteredRowModel && table.options.getFilteredRowModel) {
                table._getFilteredRowModel = table.options.getFilteredRowModel(table);
            }
            if (table.options.manualFiltering || !table._getFilteredRowModel) {
                return table.getPreFilteredRowModel();
            }
            return table._getFilteredRowModel();
        };
    }
};
function shouldAutoRemoveFilter(filterFn, value, column) {
    return (filterFn && filterFn.autoRemove ? filterFn.autoRemove(value, column) : false) || typeof value === 'undefined' || typeof value === 'string' && !value;
}
const sum = (columnId, _leafRows, childRows)=>{
    // It's faster to just add the aggregations together instead of
    // process leaf nodes individually
    return childRows.reduce((sum, next)=>{
        const nextValue = next.getValue(columnId);
        return sum + (typeof nextValue === 'number' ? nextValue : 0);
    }, 0);
};
const min = (columnId, _leafRows, childRows)=>{
    let min;
    childRows.forEach((row)=>{
        const value = row.getValue(columnId);
        if (value != null && (min > value || min === undefined && value >= value)) {
            min = value;
        }
    });
    return min;
};
const max = (columnId, _leafRows, childRows)=>{
    let max;
    childRows.forEach((row)=>{
        const value = row.getValue(columnId);
        if (value != null && (max < value || max === undefined && value >= value)) {
            max = value;
        }
    });
    return max;
};
const extent = (columnId, _leafRows, childRows)=>{
    let min;
    let max;
    childRows.forEach((row)=>{
        const value = row.getValue(columnId);
        if (value != null) {
            if (min === undefined) {
                if (value >= value) min = max = value;
            } else {
                if (min > value) min = value;
                if (max < value) max = value;
            }
        }
    });
    return [
        min,
        max
    ];
};
const mean = (columnId, leafRows)=>{
    let count = 0;
    let sum = 0;
    leafRows.forEach((row)=>{
        let value = row.getValue(columnId);
        if (value != null && (value = +value) >= value) {
            ++count, sum += value;
        }
    });
    if (count) return sum / count;
    return;
};
const median = (columnId, leafRows)=>{
    if (!leafRows.length) {
        return;
    }
    const values = leafRows.map((row)=>row.getValue(columnId));
    if (!isNumberArray(values)) {
        return;
    }
    if (values.length === 1) {
        return values[0];
    }
    const mid = Math.floor(values.length / 2);
    const nums = values.sort((a, b)=>a - b);
    return values.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};
const unique = (columnId, leafRows)=>{
    return Array.from(new Set(leafRows.map((d)=>d.getValue(columnId))).values());
};
const uniqueCount = (columnId, leafRows)=>{
    return new Set(leafRows.map((d)=>d.getValue(columnId))).size;
};
const count = (_columnId, leafRows)=>{
    return leafRows.length;
};
const aggregationFns = {
    sum,
    min,
    max,
    extent,
    mean,
    median,
    unique,
    uniqueCount,
    count
};
//
const ColumnGrouping = {
    getDefaultColumnDef: ()=>{
        return {
            aggregatedCell: (props)=>{
                var _toString, _props$getValue;
                return (_toString = (_props$getValue = props.getValue()) == null || _props$getValue.toString == null ? void 0 : _props$getValue.toString()) != null ? _toString : null;
            },
            aggregationFn: 'auto'
        };
    },
    getInitialState: (state)=>{
        return {
            grouping: [],
            ...state
        };
    },
    getDefaultOptions: (table)=>{
        return {
            onGroupingChange: makeStateUpdater('grouping', table),
            groupedColumnMode: 'reorder'
        };
    },
    createColumn: (column, table)=>{
        column.toggleGrouping = ()=>{
            table.setGrouping((old)=>{
                // Find any existing grouping for this column
                if (old != null && old.includes(column.id)) {
                    return old.filter((d)=>d !== column.id);
                }
                return [
                    ...old != null ? old : [],
                    column.id
                ];
            });
        };
        column.getCanGroup = ()=>{
            var _column$columnDef$ena, _table$options$enable;
            return ((_column$columnDef$ena = column.columnDef.enableGrouping) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableGrouping) != null ? _table$options$enable : true) && (!!column.accessorFn || !!column.columnDef.getGroupingValue);
        };
        column.getIsGrouped = ()=>{
            var _table$getState$group;
            return (_table$getState$group = table.getState().grouping) == null ? void 0 : _table$getState$group.includes(column.id);
        };
        column.getGroupedIndex = ()=>{
            var _table$getState$group2;
            return (_table$getState$group2 = table.getState().grouping) == null ? void 0 : _table$getState$group2.indexOf(column.id);
        };
        column.getToggleGroupingHandler = ()=>{
            const canGroup = column.getCanGroup();
            return ()=>{
                if (!canGroup) return;
                column.toggleGrouping();
            };
        };
        column.getAutoAggregationFn = ()=>{
            const firstRow = table.getCoreRowModel().flatRows[0];
            const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
            if (typeof value === 'number') {
                return aggregationFns.sum;
            }
            if (Object.prototype.toString.call(value) === '[object Date]') {
                return aggregationFns.extent;
            }
        };
        column.getAggregationFn = ()=>{
            var _table$options$aggreg, _table$options$aggreg2;
            if (!column) {
                throw new Error();
            }
            return isFunction(column.columnDef.aggregationFn) ? column.columnDef.aggregationFn : column.columnDef.aggregationFn === 'auto' ? column.getAutoAggregationFn() : (_table$options$aggreg = (_table$options$aggreg2 = table.options.aggregationFns) == null ? void 0 : _table$options$aggreg2[column.columnDef.aggregationFn]) != null ? _table$options$aggreg : aggregationFns[column.columnDef.aggregationFn];
        };
    },
    createTable: (table)=>{
        table.setGrouping = (updater)=>table.options.onGroupingChange == null ? void 0 : table.options.onGroupingChange(updater);
        table.resetGrouping = (defaultState)=>{
            var _table$initialState$g, _table$initialState;
            table.setGrouping(defaultState ? [] : (_table$initialState$g = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.grouping) != null ? _table$initialState$g : []);
        };
        table.getPreGroupedRowModel = ()=>table.getFilteredRowModel();
        table.getGroupedRowModel = ()=>{
            if (!table._getGroupedRowModel && table.options.getGroupedRowModel) {
                table._getGroupedRowModel = table.options.getGroupedRowModel(table);
            }
            if (table.options.manualGrouping || !table._getGroupedRowModel) {
                return table.getPreGroupedRowModel();
            }
            return table._getGroupedRowModel();
        };
    },
    createRow: (row, table)=>{
        row.getIsGrouped = ()=>!!row.groupingColumnId;
        row.getGroupingValue = (columnId)=>{
            if (row._groupingValuesCache.hasOwnProperty(columnId)) {
                return row._groupingValuesCache[columnId];
            }
            const column = table.getColumn(columnId);
            if (!(column != null && column.columnDef.getGroupingValue)) {
                return row.getValue(columnId);
            }
            row._groupingValuesCache[columnId] = column.columnDef.getGroupingValue(row.original);
            return row._groupingValuesCache[columnId];
        };
        row._groupingValuesCache = {};
    },
    createCell: (cell, column, row, table)=>{
        cell.getIsGrouped = ()=>column.getIsGrouped() && column.id === row.groupingColumnId;
        cell.getIsPlaceholder = ()=>!cell.getIsGrouped() && column.getIsGrouped();
        cell.getIsAggregated = ()=>{
            var _row$subRows;
            return !cell.getIsGrouped() && !cell.getIsPlaceholder() && !!((_row$subRows = row.subRows) != null && _row$subRows.length);
        };
    }
};
function orderColumns(leafColumns, grouping, groupedColumnMode) {
    if (!(grouping != null && grouping.length) || !groupedColumnMode) {
        return leafColumns;
    }
    const nonGroupingColumns = leafColumns.filter((col)=>!grouping.includes(col.id));
    if (groupedColumnMode === 'remove') {
        return nonGroupingColumns;
    }
    const groupingColumns = grouping.map((g)=>leafColumns.find((col)=>col.id === g)).filter(Boolean);
    return [
        ...groupingColumns,
        ...nonGroupingColumns
    ];
}
//
const ColumnOrdering = {
    getInitialState: (state)=>{
        return {
            columnOrder: [],
            ...state
        };
    },
    getDefaultOptions: (table)=>{
        return {
            onColumnOrderChange: makeStateUpdater('columnOrder', table)
        };
    },
    createColumn: (column, table)=>{
        column.getIndex = memo((position)=>[
                _getVisibleLeafColumns(table, position)
            ], (columns)=>columns.findIndex((d)=>d.id === column.id), getMemoOptions(table.options, 'debugColumns', 'getIndex'));
        column.getIsFirstColumn = (position)=>{
            var _columns$;
            const columns = _getVisibleLeafColumns(table, position);
            return ((_columns$ = columns[0]) == null ? void 0 : _columns$.id) === column.id;
        };
        column.getIsLastColumn = (position)=>{
            var _columns;
            const columns = _getVisibleLeafColumns(table, position);
            return ((_columns = columns[columns.length - 1]) == null ? void 0 : _columns.id) === column.id;
        };
    },
    createTable: (table)=>{
        table.setColumnOrder = (updater)=>table.options.onColumnOrderChange == null ? void 0 : table.options.onColumnOrderChange(updater);
        table.resetColumnOrder = (defaultState)=>{
            var _table$initialState$c;
            table.setColumnOrder(defaultState ? [] : (_table$initialState$c = table.initialState.columnOrder) != null ? _table$initialState$c : []);
        };
        table._getOrderColumnsFn = memo(()=>[
                table.getState().columnOrder,
                table.getState().grouping,
                table.options.groupedColumnMode
            ], (columnOrder, grouping, groupedColumnMode)=>(columns)=>{
                // Sort grouped columns to the start of the column list
                // before the headers are built
                let orderedColumns = [];
                // If there is no order, return the normal columns
                if (!(columnOrder != null && columnOrder.length)) {
                    orderedColumns = columns;
                } else {
                    const columnOrderCopy = [
                        ...columnOrder
                    ];
                    // If there is an order, make a copy of the columns
                    const columnsCopy = [
                        ...columns
                    ];
                    // And make a new ordered array of the columns
                    // Loop over the columns and place them in order into the new array
                    while(columnsCopy.length && columnOrderCopy.length){
                        const targetColumnId = columnOrderCopy.shift();
                        const foundIndex = columnsCopy.findIndex((d)=>d.id === targetColumnId);
                        if (foundIndex > -1) {
                            orderedColumns.push(columnsCopy.splice(foundIndex, 1)[0]);
                        }
                    }
                    // If there are any columns left, add them to the end
                    orderedColumns = [
                        ...orderedColumns,
                        ...columnsCopy
                    ];
                }
                return orderColumns(orderedColumns, grouping, groupedColumnMode);
            }, getMemoOptions(table.options, 'debugTable', '_getOrderColumnsFn'));
    }
};
//
const getDefaultColumnPinningState = ()=>({
        left: [],
        right: []
    });
const ColumnPinning = {
    getInitialState: (state)=>{
        return {
            columnPinning: getDefaultColumnPinningState(),
            ...state
        };
    },
    getDefaultOptions: (table)=>{
        return {
            onColumnPinningChange: makeStateUpdater('columnPinning', table)
        };
    },
    createColumn: (column, table)=>{
        column.pin = (position)=>{
            const columnIds = column.getLeafColumns().map((d)=>d.id).filter(Boolean);
            table.setColumnPinning((old)=>{
                var _old$left3, _old$right3;
                if (position === 'right') {
                    var _old$left, _old$right;
                    return {
                        left: ((_old$left = old == null ? void 0 : old.left) != null ? _old$left : []).filter((d)=>!(columnIds != null && columnIds.includes(d))),
                        right: [
                            ...((_old$right = old == null ? void 0 : old.right) != null ? _old$right : []).filter((d)=>!(columnIds != null && columnIds.includes(d))),
                            ...columnIds
                        ]
                    };
                }
                if (position === 'left') {
                    var _old$left2, _old$right2;
                    return {
                        left: [
                            ...((_old$left2 = old == null ? void 0 : old.left) != null ? _old$left2 : []).filter((d)=>!(columnIds != null && columnIds.includes(d))),
                            ...columnIds
                        ],
                        right: ((_old$right2 = old == null ? void 0 : old.right) != null ? _old$right2 : []).filter((d)=>!(columnIds != null && columnIds.includes(d)))
                    };
                }
                return {
                    left: ((_old$left3 = old == null ? void 0 : old.left) != null ? _old$left3 : []).filter((d)=>!(columnIds != null && columnIds.includes(d))),
                    right: ((_old$right3 = old == null ? void 0 : old.right) != null ? _old$right3 : []).filter((d)=>!(columnIds != null && columnIds.includes(d)))
                };
            });
        };
        column.getCanPin = ()=>{
            const leafColumns = column.getLeafColumns();
            return leafColumns.some((d)=>{
                var _d$columnDef$enablePi, _ref, _table$options$enable;
                return ((_d$columnDef$enablePi = d.columnDef.enablePinning) != null ? _d$columnDef$enablePi : true) && ((_ref = (_table$options$enable = table.options.enableColumnPinning) != null ? _table$options$enable : table.options.enablePinning) != null ? _ref : true);
            });
        };
        column.getIsPinned = ()=>{
            const leafColumnIds = column.getLeafColumns().map((d)=>d.id);
            const { left, right } = table.getState().columnPinning;
            const isLeft = leafColumnIds.some((d)=>left == null ? void 0 : left.includes(d));
            const isRight = leafColumnIds.some((d)=>right == null ? void 0 : right.includes(d));
            return isLeft ? 'left' : isRight ? 'right' : false;
        };
        column.getPinnedIndex = ()=>{
            var _table$getState$colum, _table$getState$colum2;
            const position = column.getIsPinned();
            return position ? (_table$getState$colum = (_table$getState$colum2 = table.getState().columnPinning) == null || (_table$getState$colum2 = _table$getState$colum2[position]) == null ? void 0 : _table$getState$colum2.indexOf(column.id)) != null ? _table$getState$colum : -1 : 0;
        };
    },
    createRow: (row, table)=>{
        row.getCenterVisibleCells = memo(()=>[
                row._getAllVisibleCells(),
                table.getState().columnPinning.left,
                table.getState().columnPinning.right
            ], (allCells, left, right)=>{
            const leftAndRight = [
                ...left != null ? left : [],
                ...right != null ? right : []
            ];
            return allCells.filter((d)=>!leftAndRight.includes(d.column.id));
        }, getMemoOptions(table.options, 'debugRows', 'getCenterVisibleCells'));
        row.getLeftVisibleCells = memo(()=>[
                row._getAllVisibleCells(),
                table.getState().columnPinning.left
            ], (allCells, left)=>{
            const cells = (left != null ? left : []).map((columnId)=>allCells.find((cell)=>cell.column.id === columnId)).filter(Boolean).map((d)=>({
                    ...d,
                    position: 'left'
                }));
            return cells;
        }, getMemoOptions(table.options, 'debugRows', 'getLeftVisibleCells'));
        row.getRightVisibleCells = memo(()=>[
                row._getAllVisibleCells(),
                table.getState().columnPinning.right
            ], (allCells, right)=>{
            const cells = (right != null ? right : []).map((columnId)=>allCells.find((cell)=>cell.column.id === columnId)).filter(Boolean).map((d)=>({
                    ...d,
                    position: 'right'
                }));
            return cells;
        }, getMemoOptions(table.options, 'debugRows', 'getRightVisibleCells'));
    },
    createTable: (table)=>{
        table.setColumnPinning = (updater)=>table.options.onColumnPinningChange == null ? void 0 : table.options.onColumnPinningChange(updater);
        table.resetColumnPinning = (defaultState)=>{
            var _table$initialState$c, _table$initialState;
            return table.setColumnPinning(defaultState ? getDefaultColumnPinningState() : (_table$initialState$c = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.columnPinning) != null ? _table$initialState$c : getDefaultColumnPinningState());
        };
        table.getIsSomeColumnsPinned = (position)=>{
            var _pinningState$positio;
            const pinningState = table.getState().columnPinning;
            if (!position) {
                var _pinningState$left, _pinningState$right;
                return Boolean(((_pinningState$left = pinningState.left) == null ? void 0 : _pinningState$left.length) || ((_pinningState$right = pinningState.right) == null ? void 0 : _pinningState$right.length));
            }
            return Boolean((_pinningState$positio = pinningState[position]) == null ? void 0 : _pinningState$positio.length);
        };
        table.getLeftLeafColumns = memo(()=>[
                table.getAllLeafColumns(),
                table.getState().columnPinning.left
            ], (allColumns, left)=>{
            return (left != null ? left : []).map((columnId)=>allColumns.find((column)=>column.id === columnId)).filter(Boolean);
        }, getMemoOptions(table.options, 'debugColumns', 'getLeftLeafColumns'));
        table.getRightLeafColumns = memo(()=>[
                table.getAllLeafColumns(),
                table.getState().columnPinning.right
            ], (allColumns, right)=>{
            return (right != null ? right : []).map((columnId)=>allColumns.find((column)=>column.id === columnId)).filter(Boolean);
        }, getMemoOptions(table.options, 'debugColumns', 'getRightLeafColumns'));
        table.getCenterLeafColumns = memo(()=>[
                table.getAllLeafColumns(),
                table.getState().columnPinning.left,
                table.getState().columnPinning.right
            ], (allColumns, left, right)=>{
            const leftAndRight = [
                ...left != null ? left : [],
                ...right != null ? right : []
            ];
            return allColumns.filter((d)=>!leftAndRight.includes(d.id));
        }, getMemoOptions(table.options, 'debugColumns', 'getCenterLeafColumns'));
    }
};
function safelyAccessDocument(_document) {
    return _document || (typeof document !== 'undefined' ? document : null);
}
//
//
const defaultColumnSizing = {
    size: 150,
    minSize: 20,
    maxSize: Number.MAX_SAFE_INTEGER
};
const getDefaultColumnSizingInfoState = ()=>({
        startOffset: null,
        startSize: null,
        deltaOffset: null,
        deltaPercentage: null,
        isResizingColumn: false,
        columnSizingStart: []
    });
const ColumnSizing = {
    getDefaultColumnDef: ()=>{
        return defaultColumnSizing;
    },
    getInitialState: (state)=>{
        return {
            columnSizing: {},
            columnSizingInfo: getDefaultColumnSizingInfoState(),
            ...state
        };
    },
    getDefaultOptions: (table)=>{
        return {
            columnResizeMode: 'onEnd',
            columnResizeDirection: 'ltr',
            onColumnSizingChange: makeStateUpdater('columnSizing', table),
            onColumnSizingInfoChange: makeStateUpdater('columnSizingInfo', table)
        };
    },
    createColumn: (column, table)=>{
        column.getSize = ()=>{
            var _column$columnDef$min, _ref, _column$columnDef$max;
            const columnSize = table.getState().columnSizing[column.id];
            return Math.min(Math.max((_column$columnDef$min = column.columnDef.minSize) != null ? _column$columnDef$min : defaultColumnSizing.minSize, (_ref = columnSize != null ? columnSize : column.columnDef.size) != null ? _ref : defaultColumnSizing.size), (_column$columnDef$max = column.columnDef.maxSize) != null ? _column$columnDef$max : defaultColumnSizing.maxSize);
        };
        column.getStart = memo((position)=>[
                position,
                _getVisibleLeafColumns(table, position),
                table.getState().columnSizing
            ], (position, columns)=>columns.slice(0, column.getIndex(position)).reduce((sum, column)=>sum + column.getSize(), 0), getMemoOptions(table.options, 'debugColumns', 'getStart'));
        column.getAfter = memo((position)=>[
                position,
                _getVisibleLeafColumns(table, position),
                table.getState().columnSizing
            ], (position, columns)=>columns.slice(column.getIndex(position) + 1).reduce((sum, column)=>sum + column.getSize(), 0), getMemoOptions(table.options, 'debugColumns', 'getAfter'));
        column.resetSize = ()=>{
            table.setColumnSizing((_ref2)=>{
                let { [column.id]: _, ...rest } = _ref2;
                return rest;
            });
        };
        column.getCanResize = ()=>{
            var _column$columnDef$ena, _table$options$enable;
            return ((_column$columnDef$ena = column.columnDef.enableResizing) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableColumnResizing) != null ? _table$options$enable : true);
        };
        column.getIsResizing = ()=>{
            return table.getState().columnSizingInfo.isResizingColumn === column.id;
        };
    },
    createHeader: (header, table)=>{
        header.getSize = ()=>{
            let sum = 0;
            const recurse = (header)=>{
                if (header.subHeaders.length) {
                    header.subHeaders.forEach(recurse);
                } else {
                    var _header$column$getSiz;
                    sum += (_header$column$getSiz = header.column.getSize()) != null ? _header$column$getSiz : 0;
                }
            };
            recurse(header);
            return sum;
        };
        header.getStart = ()=>{
            if (header.index > 0) {
                const prevSiblingHeader = header.headerGroup.headers[header.index - 1];
                return prevSiblingHeader.getStart() + prevSiblingHeader.getSize();
            }
            return 0;
        };
        header.getResizeHandler = (_contextDocument)=>{
            const column = table.getColumn(header.column.id);
            const canResize = column == null ? void 0 : column.getCanResize();
            return (e)=>{
                if (!column || !canResize) {
                    return;
                }
                e.persist == null || e.persist();
                if (isTouchStartEvent(e)) {
                    // lets not respond to multiple touches (e.g. 2 or 3 fingers)
                    if (e.touches && e.touches.length > 1) {
                        return;
                    }
                }
                const startSize = header.getSize();
                const columnSizingStart = header ? header.getLeafHeaders().map((d)=>[
                        d.column.id,
                        d.column.getSize()
                    ]) : [
                    [
                        column.id,
                        column.getSize()
                    ]
                ];
                const clientX = isTouchStartEvent(e) ? Math.round(e.touches[0].clientX) : e.clientX;
                const newColumnSizing = {};
                const updateOffset = (eventType, clientXPos)=>{
                    if (typeof clientXPos !== 'number') {
                        return;
                    }
                    table.setColumnSizingInfo((old)=>{
                        var _old$startOffset, _old$startSize;
                        const deltaDirection = table.options.columnResizeDirection === 'rtl' ? -1 : 1;
                        const deltaOffset = (clientXPos - ((_old$startOffset = old == null ? void 0 : old.startOffset) != null ? _old$startOffset : 0)) * deltaDirection;
                        const deltaPercentage = Math.max(deltaOffset / ((_old$startSize = old == null ? void 0 : old.startSize) != null ? _old$startSize : 0), -0.999999);
                        old.columnSizingStart.forEach((_ref3)=>{
                            let [columnId, headerSize] = _ref3;
                            newColumnSizing[columnId] = Math.round(Math.max(headerSize + headerSize * deltaPercentage, 0) * 100) / 100;
                        });
                        return {
                            ...old,
                            deltaOffset,
                            deltaPercentage
                        };
                    });
                    if (table.options.columnResizeMode === 'onChange' || eventType === 'end') {
                        table.setColumnSizing((old)=>({
                                ...old,
                                ...newColumnSizing
                            }));
                    }
                };
                const onMove = (clientXPos)=>updateOffset('move', clientXPos);
                const onEnd = (clientXPos)=>{
                    updateOffset('end', clientXPos);
                    table.setColumnSizingInfo((old)=>({
                            ...old,
                            isResizingColumn: false,
                            startOffset: null,
                            startSize: null,
                            deltaOffset: null,
                            deltaPercentage: null,
                            columnSizingStart: []
                        }));
                };
                const contextDocument = safelyAccessDocument(_contextDocument);
                const mouseEvents = {
                    moveHandler: (e)=>onMove(e.clientX),
                    upHandler: (e)=>{
                        contextDocument == null || contextDocument.removeEventListener('mousemove', mouseEvents.moveHandler);
                        contextDocument == null || contextDocument.removeEventListener('mouseup', mouseEvents.upHandler);
                        onEnd(e.clientX);
                    }
                };
                const touchEvents = {
                    moveHandler: (e)=>{
                        if (e.cancelable) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        onMove(e.touches[0].clientX);
                        return false;
                    },
                    upHandler: (e)=>{
                        var _e$touches$;
                        contextDocument == null || contextDocument.removeEventListener('touchmove', touchEvents.moveHandler);
                        contextDocument == null || contextDocument.removeEventListener('touchend', touchEvents.upHandler);
                        if (e.cancelable) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        onEnd((_e$touches$ = e.touches[0]) == null ? void 0 : _e$touches$.clientX);
                    }
                };
                const passiveIfSupported = passiveEventSupported() ? {
                    passive: false
                } : false;
                if (isTouchStartEvent(e)) {
                    contextDocument == null || contextDocument.addEventListener('touchmove', touchEvents.moveHandler, passiveIfSupported);
                    contextDocument == null || contextDocument.addEventListener('touchend', touchEvents.upHandler, passiveIfSupported);
                } else {
                    contextDocument == null || contextDocument.addEventListener('mousemove', mouseEvents.moveHandler, passiveIfSupported);
                    contextDocument == null || contextDocument.addEventListener('mouseup', mouseEvents.upHandler, passiveIfSupported);
                }
                table.setColumnSizingInfo((old)=>({
                        ...old,
                        startOffset: clientX,
                        startSize,
                        deltaOffset: 0,
                        deltaPercentage: 0,
                        columnSizingStart,
                        isResizingColumn: column.id
                    }));
            };
        };
    },
    createTable: (table)=>{
        table.setColumnSizing = (updater)=>table.options.onColumnSizingChange == null ? void 0 : table.options.onColumnSizingChange(updater);
        table.setColumnSizingInfo = (updater)=>table.options.onColumnSizingInfoChange == null ? void 0 : table.options.onColumnSizingInfoChange(updater);
        table.resetColumnSizing = (defaultState)=>{
            var _table$initialState$c;
            table.setColumnSizing(defaultState ? {} : (_table$initialState$c = table.initialState.columnSizing) != null ? _table$initialState$c : {});
        };
        table.resetHeaderSizeInfo = (defaultState)=>{
            var _table$initialState$c2;
            table.setColumnSizingInfo(defaultState ? getDefaultColumnSizingInfoState() : (_table$initialState$c2 = table.initialState.columnSizingInfo) != null ? _table$initialState$c2 : getDefaultColumnSizingInfoState());
        };
        table.getTotalSize = ()=>{
            var _table$getHeaderGroup, _table$getHeaderGroup2;
            return (_table$getHeaderGroup = (_table$getHeaderGroup2 = table.getHeaderGroups()[0]) == null ? void 0 : _table$getHeaderGroup2.headers.reduce((sum, header)=>{
                return sum + header.getSize();
            }, 0)) != null ? _table$getHeaderGroup : 0;
        };
        table.getLeftTotalSize = ()=>{
            var _table$getLeftHeaderG, _table$getLeftHeaderG2;
            return (_table$getLeftHeaderG = (_table$getLeftHeaderG2 = table.getLeftHeaderGroups()[0]) == null ? void 0 : _table$getLeftHeaderG2.headers.reduce((sum, header)=>{
                return sum + header.getSize();
            }, 0)) != null ? _table$getLeftHeaderG : 0;
        };
        table.getCenterTotalSize = ()=>{
            var _table$getCenterHeade, _table$getCenterHeade2;
            return (_table$getCenterHeade = (_table$getCenterHeade2 = table.getCenterHeaderGroups()[0]) == null ? void 0 : _table$getCenterHeade2.headers.reduce((sum, header)=>{
                return sum + header.getSize();
            }, 0)) != null ? _table$getCenterHeade : 0;
        };
        table.getRightTotalSize = ()=>{
            var _table$getRightHeader, _table$getRightHeader2;
            return (_table$getRightHeader = (_table$getRightHeader2 = table.getRightHeaderGroups()[0]) == null ? void 0 : _table$getRightHeader2.headers.reduce((sum, header)=>{
                return sum + header.getSize();
            }, 0)) != null ? _table$getRightHeader : 0;
        };
    }
};
let passiveSupported = null;
function passiveEventSupported() {
    if (typeof passiveSupported === 'boolean') return passiveSupported;
    let supported = false;
    try {
        const options = {
            get passive () {
                supported = true;
                return false;
            }
        };
        const noop = ()=>{};
        window.addEventListener('test', noop, options);
        window.removeEventListener('test', noop);
    } catch (err) {
        supported = false;
    }
    passiveSupported = supported;
    return passiveSupported;
}
function isTouchStartEvent(e) {
    return e.type === 'touchstart';
}
//
const ColumnVisibility = {
    getInitialState: (state)=>{
        return {
            columnVisibility: {},
            ...state
        };
    },
    getDefaultOptions: (table)=>{
        return {
            onColumnVisibilityChange: makeStateUpdater('columnVisibility', table)
        };
    },
    createColumn: (column, table)=>{
        column.toggleVisibility = (value)=>{
            if (column.getCanHide()) {
                table.setColumnVisibility((old)=>({
                        ...old,
                        [column.id]: value != null ? value : !column.getIsVisible()
                    }));
            }
        };
        column.getIsVisible = ()=>{
            var _ref, _table$getState$colum;
            const childColumns = column.columns;
            return (_ref = childColumns.length ? childColumns.some((c)=>c.getIsVisible()) : (_table$getState$colum = table.getState().columnVisibility) == null ? void 0 : _table$getState$colum[column.id]) != null ? _ref : true;
        };
        column.getCanHide = ()=>{
            var _column$columnDef$ena, _table$options$enable;
            return ((_column$columnDef$ena = column.columnDef.enableHiding) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableHiding) != null ? _table$options$enable : true);
        };
        column.getToggleVisibilityHandler = ()=>{
            return (e)=>{
                column.toggleVisibility == null || column.toggleVisibility(e.target.checked);
            };
        };
    },
    createRow: (row, table)=>{
        row._getAllVisibleCells = memo(()=>[
                row.getAllCells(),
                table.getState().columnVisibility
            ], (cells)=>{
            return cells.filter((cell)=>cell.column.getIsVisible());
        }, getMemoOptions(table.options, 'debugRows', '_getAllVisibleCells'));
        row.getVisibleCells = memo(()=>[
                row.getLeftVisibleCells(),
                row.getCenterVisibleCells(),
                row.getRightVisibleCells()
            ], (left, center, right)=>[
                ...left,
                ...center,
                ...right
            ], getMemoOptions(table.options, 'debugRows', 'getVisibleCells'));
    },
    createTable: (table)=>{
        const makeVisibleColumnsMethod = (key, getColumns)=>{
            return memo(()=>[
                    getColumns(),
                    getColumns().filter((d)=>d.getIsVisible()).map((d)=>d.id).join('_')
                ], (columns)=>{
                return columns.filter((d)=>d.getIsVisible == null ? void 0 : d.getIsVisible());
            }, getMemoOptions(table.options, 'debugColumns', key));
        };
        table.getVisibleFlatColumns = makeVisibleColumnsMethod('getVisibleFlatColumns', ()=>table.getAllFlatColumns());
        table.getVisibleLeafColumns = makeVisibleColumnsMethod('getVisibleLeafColumns', ()=>table.getAllLeafColumns());
        table.getLeftVisibleLeafColumns = makeVisibleColumnsMethod('getLeftVisibleLeafColumns', ()=>table.getLeftLeafColumns());
        table.getRightVisibleLeafColumns = makeVisibleColumnsMethod('getRightVisibleLeafColumns', ()=>table.getRightLeafColumns());
        table.getCenterVisibleLeafColumns = makeVisibleColumnsMethod('getCenterVisibleLeafColumns', ()=>table.getCenterLeafColumns());
        table.setColumnVisibility = (updater)=>table.options.onColumnVisibilityChange == null ? void 0 : table.options.onColumnVisibilityChange(updater);
        table.resetColumnVisibility = (defaultState)=>{
            var _table$initialState$c;
            table.setColumnVisibility(defaultState ? {} : (_table$initialState$c = table.initialState.columnVisibility) != null ? _table$initialState$c : {});
        };
        table.toggleAllColumnsVisible = (value)=>{
            var _value;
            value = (_value = value) != null ? _value : !table.getIsAllColumnsVisible();
            table.setColumnVisibility(table.getAllLeafColumns().reduce((obj, column)=>({
                    ...obj,
                    [column.id]: !value ? !(column.getCanHide != null && column.getCanHide()) : value
                }), {}));
        };
        table.getIsAllColumnsVisible = ()=>!table.getAllLeafColumns().some((column)=>!(column.getIsVisible != null && column.getIsVisible()));
        table.getIsSomeColumnsVisible = ()=>table.getAllLeafColumns().some((column)=>column.getIsVisible == null ? void 0 : column.getIsVisible());
        table.getToggleAllColumnsVisibilityHandler = ()=>{
            return (e)=>{
                var _target;
                table.toggleAllColumnsVisible((_target = e.target) == null ? void 0 : _target.checked);
            };
        };
    }
};
function _getVisibleLeafColumns(table, position) {
    return !position ? table.getVisibleLeafColumns() : position === 'center' ? table.getCenterVisibleLeafColumns() : position === 'left' ? table.getLeftVisibleLeafColumns() : table.getRightVisibleLeafColumns();
}
//
const GlobalFaceting = {
    createTable: (table)=>{
        table._getGlobalFacetedRowModel = table.options.getFacetedRowModel && table.options.getFacetedRowModel(table, '__global__');
        table.getGlobalFacetedRowModel = ()=>{
            if (table.options.manualFiltering || !table._getGlobalFacetedRowModel) {
                return table.getPreFilteredRowModel();
            }
            return table._getGlobalFacetedRowModel();
        };
        table._getGlobalFacetedUniqueValues = table.options.getFacetedUniqueValues && table.options.getFacetedUniqueValues(table, '__global__');
        table.getGlobalFacetedUniqueValues = ()=>{
            if (!table._getGlobalFacetedUniqueValues) {
                return new Map();
            }
            return table._getGlobalFacetedUniqueValues();
        };
        table._getGlobalFacetedMinMaxValues = table.options.getFacetedMinMaxValues && table.options.getFacetedMinMaxValues(table, '__global__');
        table.getGlobalFacetedMinMaxValues = ()=>{
            if (!table._getGlobalFacetedMinMaxValues) {
                return;
            }
            return table._getGlobalFacetedMinMaxValues();
        };
    }
};
//
const GlobalFiltering = {
    getInitialState: (state)=>{
        return {
            globalFilter: undefined,
            ...state
        };
    },
    getDefaultOptions: (table)=>{
        return {
            onGlobalFilterChange: makeStateUpdater('globalFilter', table),
            globalFilterFn: 'auto',
            getColumnCanGlobalFilter: (column)=>{
                var _table$getCoreRowMode;
                const value = (_table$getCoreRowMode = table.getCoreRowModel().flatRows[0]) == null || (_table$getCoreRowMode = _table$getCoreRowMode._getAllCellsByColumnId()[column.id]) == null ? void 0 : _table$getCoreRowMode.getValue();
                return typeof value === 'string' || typeof value === 'number';
            }
        };
    },
    createColumn: (column, table)=>{
        column.getCanGlobalFilter = ()=>{
            var _column$columnDef$ena, _table$options$enable, _table$options$enable2, _table$options$getCol;
            return ((_column$columnDef$ena = column.columnDef.enableGlobalFilter) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableGlobalFilter) != null ? _table$options$enable : true) && ((_table$options$enable2 = table.options.enableFilters) != null ? _table$options$enable2 : true) && ((_table$options$getCol = table.options.getColumnCanGlobalFilter == null ? void 0 : table.options.getColumnCanGlobalFilter(column)) != null ? _table$options$getCol : true) && !!column.accessorFn;
        };
    },
    createTable: (table)=>{
        table.getGlobalAutoFilterFn = ()=>{
            return filterFns.includesString;
        };
        table.getGlobalFilterFn = ()=>{
            var _table$options$filter, _table$options$filter2;
            const { globalFilterFn: globalFilterFn } = table.options;
            return isFunction(globalFilterFn) ? globalFilterFn : globalFilterFn === 'auto' ? table.getGlobalAutoFilterFn() : (_table$options$filter = (_table$options$filter2 = table.options.filterFns) == null ? void 0 : _table$options$filter2[globalFilterFn]) != null ? _table$options$filter : filterFns[globalFilterFn];
        };
        table.setGlobalFilter = (updater)=>{
            table.options.onGlobalFilterChange == null || table.options.onGlobalFilterChange(updater);
        };
        table.resetGlobalFilter = (defaultState)=>{
            table.setGlobalFilter(defaultState ? undefined : table.initialState.globalFilter);
        };
    }
};
//
const RowExpanding = {
    getInitialState: (state)=>{
        return {
            expanded: {},
            ...state
        };
    },
    getDefaultOptions: (table)=>{
        return {
            onExpandedChange: makeStateUpdater('expanded', table),
            paginateExpandedRows: true
        };
    },
    createTable: (table)=>{
        let registered = false;
        let queued = false;
        table._autoResetExpanded = ()=>{
            var _ref, _table$options$autoRe;
            if (!registered) {
                table._queue(()=>{
                    registered = true;
                });
                return;
            }
            if ((_ref = (_table$options$autoRe = table.options.autoResetAll) != null ? _table$options$autoRe : table.options.autoResetExpanded) != null ? _ref : !table.options.manualExpanding) {
                if (queued) return;
                queued = true;
                table._queue(()=>{
                    table.resetExpanded();
                    queued = false;
                });
            }
        };
        table.setExpanded = (updater)=>table.options.onExpandedChange == null ? void 0 : table.options.onExpandedChange(updater);
        table.toggleAllRowsExpanded = (expanded)=>{
            if (expanded != null ? expanded : !table.getIsAllRowsExpanded()) {
                table.setExpanded(true);
            } else {
                table.setExpanded({});
            }
        };
        table.resetExpanded = (defaultState)=>{
            var _table$initialState$e, _table$initialState;
            table.setExpanded(defaultState ? {} : (_table$initialState$e = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.expanded) != null ? _table$initialState$e : {});
        };
        table.getCanSomeRowsExpand = ()=>{
            return table.getPrePaginationRowModel().flatRows.some((row)=>row.getCanExpand());
        };
        table.getToggleAllRowsExpandedHandler = ()=>{
            return (e)=>{
                e.persist == null || e.persist();
                table.toggleAllRowsExpanded();
            };
        };
        table.getIsSomeRowsExpanded = ()=>{
            const expanded = table.getState().expanded;
            return expanded === true || Object.values(expanded).some(Boolean);
        };
        table.getIsAllRowsExpanded = ()=>{
            const expanded = table.getState().expanded;
            // If expanded is true, save some cycles and return true
            if (typeof expanded === 'boolean') {
                return expanded === true;
            }
            if (!Object.keys(expanded).length) {
                return false;
            }
            // If any row is not expanded, return false
            if (table.getRowModel().flatRows.some((row)=>!row.getIsExpanded())) {
                return false;
            }
            // They must all be expanded :shrug:
            return true;
        };
        table.getExpandedDepth = ()=>{
            let maxDepth = 0;
            const rowIds = table.getState().expanded === true ? Object.keys(table.getRowModel().rowsById) : Object.keys(table.getState().expanded);
            rowIds.forEach((id)=>{
                const splitId = id.split('.');
                maxDepth = Math.max(maxDepth, splitId.length);
            });
            return maxDepth;
        };
        table.getPreExpandedRowModel = ()=>table.getSortedRowModel();
        table.getExpandedRowModel = ()=>{
            if (!table._getExpandedRowModel && table.options.getExpandedRowModel) {
                table._getExpandedRowModel = table.options.getExpandedRowModel(table);
            }
            if (table.options.manualExpanding || !table._getExpandedRowModel) {
                return table.getPreExpandedRowModel();
            }
            return table._getExpandedRowModel();
        };
    },
    createRow: (row, table)=>{
        row.toggleExpanded = (expanded)=>{
            table.setExpanded((old)=>{
                var _expanded;
                const exists = old === true ? true : !!(old != null && old[row.id]);
                let oldExpanded = {};
                if (old === true) {
                    Object.keys(table.getRowModel().rowsById).forEach((rowId)=>{
                        oldExpanded[rowId] = true;
                    });
                } else {
                    oldExpanded = old;
                }
                expanded = (_expanded = expanded) != null ? _expanded : !exists;
                if (!exists && expanded) {
                    return {
                        ...oldExpanded,
                        [row.id]: true
                    };
                }
                if (exists && !expanded) {
                    const { [row.id]: _, ...rest } = oldExpanded;
                    return rest;
                }
                return old;
            });
        };
        row.getIsExpanded = ()=>{
            var _table$options$getIsR;
            const expanded = table.getState().expanded;
            return !!((_table$options$getIsR = table.options.getIsRowExpanded == null ? void 0 : table.options.getIsRowExpanded(row)) != null ? _table$options$getIsR : expanded === true || (expanded == null ? void 0 : expanded[row.id]));
        };
        row.getCanExpand = ()=>{
            var _table$options$getRow, _table$options$enable, _row$subRows;
            return (_table$options$getRow = table.options.getRowCanExpand == null ? void 0 : table.options.getRowCanExpand(row)) != null ? _table$options$getRow : ((_table$options$enable = table.options.enableExpanding) != null ? _table$options$enable : true) && !!((_row$subRows = row.subRows) != null && _row$subRows.length);
        };
        row.getIsAllParentsExpanded = ()=>{
            let isFullyExpanded = true;
            let currentRow = row;
            while(isFullyExpanded && currentRow.parentId){
                currentRow = table.getRow(currentRow.parentId, true);
                isFullyExpanded = currentRow.getIsExpanded();
            }
            return isFullyExpanded;
        };
        row.getToggleExpandedHandler = ()=>{
            const canExpand = row.getCanExpand();
            return ()=>{
                if (!canExpand) return;
                row.toggleExpanded();
            };
        };
    }
};
//
const defaultPageIndex = 0;
const defaultPageSize = 10;
const getDefaultPaginationState = ()=>({
        pageIndex: defaultPageIndex,
        pageSize: defaultPageSize
    });
const RowPagination = {
    getInitialState: (state)=>{
        return {
            ...state,
            pagination: {
                ...getDefaultPaginationState(),
                ...state == null ? void 0 : state.pagination
            }
        };
    },
    getDefaultOptions: (table)=>{
        return {
            onPaginationChange: makeStateUpdater('pagination', table)
        };
    },
    createTable: (table)=>{
        let registered = false;
        let queued = false;
        table._autoResetPageIndex = ()=>{
            var _ref, _table$options$autoRe;
            if (!registered) {
                table._queue(()=>{
                    registered = true;
                });
                return;
            }
            if ((_ref = (_table$options$autoRe = table.options.autoResetAll) != null ? _table$options$autoRe : table.options.autoResetPageIndex) != null ? _ref : !table.options.manualPagination) {
                if (queued) return;
                queued = true;
                table._queue(()=>{
                    table.resetPageIndex();
                    queued = false;
                });
            }
        };
        table.setPagination = (updater)=>{
            const safeUpdater = (old)=>{
                let newState = functionalUpdate(updater, old);
                return newState;
            };
            return table.options.onPaginationChange == null ? void 0 : table.options.onPaginationChange(safeUpdater);
        };
        table.resetPagination = (defaultState)=>{
            var _table$initialState$p;
            table.setPagination(defaultState ? getDefaultPaginationState() : (_table$initialState$p = table.initialState.pagination) != null ? _table$initialState$p : getDefaultPaginationState());
        };
        table.setPageIndex = (updater)=>{
            table.setPagination((old)=>{
                let pageIndex = functionalUpdate(updater, old.pageIndex);
                const maxPageIndex = typeof table.options.pageCount === 'undefined' || table.options.pageCount === -1 ? Number.MAX_SAFE_INTEGER : table.options.pageCount - 1;
                pageIndex = Math.max(0, Math.min(pageIndex, maxPageIndex));
                return {
                    ...old,
                    pageIndex
                };
            });
        };
        table.resetPageIndex = (defaultState)=>{
            var _table$initialState$p2, _table$initialState;
            table.setPageIndex(defaultState ? defaultPageIndex : (_table$initialState$p2 = (_table$initialState = table.initialState) == null || (_table$initialState = _table$initialState.pagination) == null ? void 0 : _table$initialState.pageIndex) != null ? _table$initialState$p2 : defaultPageIndex);
        };
        table.resetPageSize = (defaultState)=>{
            var _table$initialState$p3, _table$initialState2;
            table.setPageSize(defaultState ? defaultPageSize : (_table$initialState$p3 = (_table$initialState2 = table.initialState) == null || (_table$initialState2 = _table$initialState2.pagination) == null ? void 0 : _table$initialState2.pageSize) != null ? _table$initialState$p3 : defaultPageSize);
        };
        table.setPageSize = (updater)=>{
            table.setPagination((old)=>{
                const pageSize = Math.max(1, functionalUpdate(updater, old.pageSize));
                const topRowIndex = old.pageSize * old.pageIndex;
                const pageIndex = Math.floor(topRowIndex / pageSize);
                return {
                    ...old,
                    pageIndex,
                    pageSize
                };
            });
        };
        //deprecated
        table.setPageCount = (updater)=>table.setPagination((old)=>{
                var _table$options$pageCo;
                let newPageCount = functionalUpdate(updater, (_table$options$pageCo = table.options.pageCount) != null ? _table$options$pageCo : -1);
                if (typeof newPageCount === 'number') {
                    newPageCount = Math.max(-1, newPageCount);
                }
                return {
                    ...old,
                    pageCount: newPageCount
                };
            });
        table.getPageOptions = memo(()=>[
                table.getPageCount()
            ], (pageCount)=>{
            let pageOptions = [];
            if (pageCount && pageCount > 0) {
                pageOptions = [
                    ...new Array(pageCount)
                ].fill(null).map((_, i)=>i);
            }
            return pageOptions;
        }, getMemoOptions(table.options, 'debugTable', 'getPageOptions'));
        table.getCanPreviousPage = ()=>table.getState().pagination.pageIndex > 0;
        table.getCanNextPage = ()=>{
            const { pageIndex } = table.getState().pagination;
            const pageCount = table.getPageCount();
            if (pageCount === -1) {
                return true;
            }
            if (pageCount === 0) {
                return false;
            }
            return pageIndex < pageCount - 1;
        };
        table.previousPage = ()=>{
            return table.setPageIndex((old)=>old - 1);
        };
        table.nextPage = ()=>{
            return table.setPageIndex((old)=>{
                return old + 1;
            });
        };
        table.firstPage = ()=>{
            return table.setPageIndex(0);
        };
        table.lastPage = ()=>{
            return table.setPageIndex(table.getPageCount() - 1);
        };
        table.getPrePaginationRowModel = ()=>table.getExpandedRowModel();
        table.getPaginationRowModel = ()=>{
            if (!table._getPaginationRowModel && table.options.getPaginationRowModel) {
                table._getPaginationRowModel = table.options.getPaginationRowModel(table);
            }
            if (table.options.manualPagination || !table._getPaginationRowModel) {
                return table.getPrePaginationRowModel();
            }
            return table._getPaginationRowModel();
        };
        table.getPageCount = ()=>{
            var _table$options$pageCo2;
            return (_table$options$pageCo2 = table.options.pageCount) != null ? _table$options$pageCo2 : Math.ceil(table.getRowCount() / table.getState().pagination.pageSize);
        };
        table.getRowCount = ()=>{
            var _table$options$rowCou;
            return (_table$options$rowCou = table.options.rowCount) != null ? _table$options$rowCou : table.getPrePaginationRowModel().rows.length;
        };
    }
};
//
const getDefaultRowPinningState = ()=>({
        top: [],
        bottom: []
    });
const RowPinning = {
    getInitialState: (state)=>{
        return {
            rowPinning: getDefaultRowPinningState(),
            ...state
        };
    },
    getDefaultOptions: (table)=>{
        return {
            onRowPinningChange: makeStateUpdater('rowPinning', table)
        };
    },
    createRow: (row, table)=>{
        row.pin = (position, includeLeafRows, includeParentRows)=>{
            const leafRowIds = includeLeafRows ? row.getLeafRows().map((_ref)=>{
                let { id } = _ref;
                return id;
            }) : [];
            const parentRowIds = includeParentRows ? row.getParentRows().map((_ref2)=>{
                let { id } = _ref2;
                return id;
            }) : [];
            const rowIds = new Set([
                ...parentRowIds,
                row.id,
                ...leafRowIds
            ]);
            table.setRowPinning((old)=>{
                var _old$top3, _old$bottom3;
                if (position === 'bottom') {
                    var _old$top, _old$bottom;
                    return {
                        top: ((_old$top = old == null ? void 0 : old.top) != null ? _old$top : []).filter((d)=>!(rowIds != null && rowIds.has(d))),
                        bottom: [
                            ...((_old$bottom = old == null ? void 0 : old.bottom) != null ? _old$bottom : []).filter((d)=>!(rowIds != null && rowIds.has(d))),
                            ...Array.from(rowIds)
                        ]
                    };
                }
                if (position === 'top') {
                    var _old$top2, _old$bottom2;
                    return {
                        top: [
                            ...((_old$top2 = old == null ? void 0 : old.top) != null ? _old$top2 : []).filter((d)=>!(rowIds != null && rowIds.has(d))),
                            ...Array.from(rowIds)
                        ],
                        bottom: ((_old$bottom2 = old == null ? void 0 : old.bottom) != null ? _old$bottom2 : []).filter((d)=>!(rowIds != null && rowIds.has(d)))
                    };
                }
                return {
                    top: ((_old$top3 = old == null ? void 0 : old.top) != null ? _old$top3 : []).filter((d)=>!(rowIds != null && rowIds.has(d))),
                    bottom: ((_old$bottom3 = old == null ? void 0 : old.bottom) != null ? _old$bottom3 : []).filter((d)=>!(rowIds != null && rowIds.has(d)))
                };
            });
        };
        row.getCanPin = ()=>{
            var _ref3;
            const { enableRowPinning, enablePinning } = table.options;
            if (typeof enableRowPinning === 'function') {
                return enableRowPinning(row);
            }
            return (_ref3 = enableRowPinning != null ? enableRowPinning : enablePinning) != null ? _ref3 : true;
        };
        row.getIsPinned = ()=>{
            const rowIds = [
                row.id
            ];
            const { top, bottom } = table.getState().rowPinning;
            const isTop = rowIds.some((d)=>top == null ? void 0 : top.includes(d));
            const isBottom = rowIds.some((d)=>bottom == null ? void 0 : bottom.includes(d));
            return isTop ? 'top' : isBottom ? 'bottom' : false;
        };
        row.getPinnedIndex = ()=>{
            var _ref4, _visiblePinnedRowIds$;
            const position = row.getIsPinned();
            if (!position) return -1;
            const visiblePinnedRowIds = (_ref4 = position === 'top' ? table.getTopRows() : table.getBottomRows()) == null ? void 0 : _ref4.map((_ref5)=>{
                let { id } = _ref5;
                return id;
            });
            return (_visiblePinnedRowIds$ = visiblePinnedRowIds == null ? void 0 : visiblePinnedRowIds.indexOf(row.id)) != null ? _visiblePinnedRowIds$ : -1;
        };
    },
    createTable: (table)=>{
        table.setRowPinning = (updater)=>table.options.onRowPinningChange == null ? void 0 : table.options.onRowPinningChange(updater);
        table.resetRowPinning = (defaultState)=>{
            var _table$initialState$r, _table$initialState;
            return table.setRowPinning(defaultState ? getDefaultRowPinningState() : (_table$initialState$r = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.rowPinning) != null ? _table$initialState$r : getDefaultRowPinningState());
        };
        table.getIsSomeRowsPinned = (position)=>{
            var _pinningState$positio;
            const pinningState = table.getState().rowPinning;
            if (!position) {
                var _pinningState$top, _pinningState$bottom;
                return Boolean(((_pinningState$top = pinningState.top) == null ? void 0 : _pinningState$top.length) || ((_pinningState$bottom = pinningState.bottom) == null ? void 0 : _pinningState$bottom.length));
            }
            return Boolean((_pinningState$positio = pinningState[position]) == null ? void 0 : _pinningState$positio.length);
        };
        table._getPinnedRows = (visibleRows, pinnedRowIds, position)=>{
            var _table$options$keepPi;
            const rows = ((_table$options$keepPi = table.options.keepPinnedRows) != null ? _table$options$keepPi : true) ? //get all rows that are pinned even if they would not be otherwise visible
            //account for expanded parent rows, but not pagination or filtering
            (pinnedRowIds != null ? pinnedRowIds : []).map((rowId)=>{
                const row = table.getRow(rowId, true);
                return row.getIsAllParentsExpanded() ? row : null;
            }) : //else get only visible rows that are pinned
            (pinnedRowIds != null ? pinnedRowIds : []).map((rowId)=>visibleRows.find((row)=>row.id === rowId));
            return rows.filter(Boolean).map((d)=>({
                    ...d,
                    position
                }));
        };
        table.getTopRows = memo(()=>[
                table.getRowModel().rows,
                table.getState().rowPinning.top
            ], (allRows, topPinnedRowIds)=>table._getPinnedRows(allRows, topPinnedRowIds, 'top'), getMemoOptions(table.options, 'debugRows', 'getTopRows'));
        table.getBottomRows = memo(()=>[
                table.getRowModel().rows,
                table.getState().rowPinning.bottom
            ], (allRows, bottomPinnedRowIds)=>table._getPinnedRows(allRows, bottomPinnedRowIds, 'bottom'), getMemoOptions(table.options, 'debugRows', 'getBottomRows'));
        table.getCenterRows = memo(()=>[
                table.getRowModel().rows,
                table.getState().rowPinning.top,
                table.getState().rowPinning.bottom
            ], (allRows, top, bottom)=>{
            const topAndBottom = new Set([
                ...top != null ? top : [],
                ...bottom != null ? bottom : []
            ]);
            return allRows.filter((d)=>!topAndBottom.has(d.id));
        }, getMemoOptions(table.options, 'debugRows', 'getCenterRows'));
    }
};
//
const RowSelection = {
    getInitialState: (state)=>{
        return {
            rowSelection: {},
            ...state
        };
    },
    getDefaultOptions: (table)=>{
        return {
            onRowSelectionChange: makeStateUpdater('rowSelection', table),
            enableRowSelection: true,
            enableMultiRowSelection: true,
            enableSubRowSelection: true
        };
    },
    createTable: (table)=>{
        table.setRowSelection = (updater)=>table.options.onRowSelectionChange == null ? void 0 : table.options.onRowSelectionChange(updater);
        table.resetRowSelection = (defaultState)=>{
            var _table$initialState$r;
            return table.setRowSelection(defaultState ? {} : (_table$initialState$r = table.initialState.rowSelection) != null ? _table$initialState$r : {});
        };
        table.toggleAllRowsSelected = (value)=>{
            table.setRowSelection((old)=>{
                value = typeof value !== 'undefined' ? value : !table.getIsAllRowsSelected();
                const rowSelection = {
                    ...old
                };
                const preGroupedFlatRows = table.getPreGroupedRowModel().flatRows;
                // We don't use `mutateRowIsSelected` here for performance reasons.
                // All of the rows are flat already, so it wouldn't be worth it
                if (value) {
                    preGroupedFlatRows.forEach((row)=>{
                        if (!row.getCanSelect()) {
                            return;
                        }
                        rowSelection[row.id] = true;
                    });
                } else {
                    preGroupedFlatRows.forEach((row)=>{
                        delete rowSelection[row.id];
                    });
                }
                return rowSelection;
            });
        };
        table.toggleAllPageRowsSelected = (value)=>table.setRowSelection((old)=>{
                const resolvedValue = typeof value !== 'undefined' ? value : !table.getIsAllPageRowsSelected();
                const rowSelection = {
                    ...old
                };
                table.getRowModel().rows.forEach((row)=>{
                    mutateRowIsSelected(rowSelection, row.id, resolvedValue, true, table);
                });
                return rowSelection;
            });
        // addRowSelectionRange: rowId => {
        //   const {
        //     rows,
        //     rowsById,
        //     options: { selectGroupingRows, selectSubRows },
        //   } = table
        //   const findSelectedRow = (rows: Row[]) => {
        //     let found
        //     rows.find(d => {
        //       if (d.getIsSelected()) {
        //         found = d
        //         return true
        //       }
        //       const subFound = findSelectedRow(d.subRows || [])
        //       if (subFound) {
        //         found = subFound
        //         return true
        //       }
        //       return false
        //     })
        //     return found
        //   }
        //   const firstRow = findSelectedRow(rows) || rows[0]
        //   const lastRow = rowsById[rowId]
        //   let include = false
        //   const selectedRowIds = {}
        //   const addRow = (row: Row) => {
        //     mutateRowIsSelected(selectedRowIds, row.id, true, {
        //       rowsById,
        //       selectGroupingRows: selectGroupingRows!,
        //       selectSubRows: selectSubRows!,
        //     })
        //   }
        //   table.rows.forEach(row => {
        //     const isFirstRow = row.id === firstRow.id
        //     const isLastRow = row.id === lastRow.id
        //     if (isFirstRow || isLastRow) {
        //       if (!include) {
        //         include = true
        //       } else if (include) {
        //         addRow(row)
        //         include = false
        //       }
        //     }
        //     if (include) {
        //       addRow(row)
        //     }
        //   })
        //   table.setRowSelection(selectedRowIds)
        // },
        table.getPreSelectedRowModel = ()=>table.getCoreRowModel();
        table.getSelectedRowModel = memo(()=>[
                table.getState().rowSelection,
                table.getCoreRowModel()
            ], (rowSelection, rowModel)=>{
            if (!Object.keys(rowSelection).length) {
                return {
                    rows: [],
                    flatRows: [],
                    rowsById: {}
                };
            }
            return selectRowsFn(table, rowModel);
        }, getMemoOptions(table.options, 'debugTable', 'getSelectedRowModel'));
        table.getFilteredSelectedRowModel = memo(()=>[
                table.getState().rowSelection,
                table.getFilteredRowModel()
            ], (rowSelection, rowModel)=>{
            if (!Object.keys(rowSelection).length) {
                return {
                    rows: [],
                    flatRows: [],
                    rowsById: {}
                };
            }
            return selectRowsFn(table, rowModel);
        }, getMemoOptions(table.options, 'debugTable', 'getFilteredSelectedRowModel'));
        table.getGroupedSelectedRowModel = memo(()=>[
                table.getState().rowSelection,
                table.getSortedRowModel()
            ], (rowSelection, rowModel)=>{
            if (!Object.keys(rowSelection).length) {
                return {
                    rows: [],
                    flatRows: [],
                    rowsById: {}
                };
            }
            return selectRowsFn(table, rowModel);
        }, getMemoOptions(table.options, 'debugTable', 'getGroupedSelectedRowModel'));
        ///
        // getGroupingRowCanSelect: rowId => {
        //   const row = table.getRow(rowId)
        //   if (!row) {
        //     throw new Error()
        //   }
        //   if (typeof table.options.enableGroupingRowSelection === 'function') {
        //     return table.options.enableGroupingRowSelection(row)
        //   }
        //   return table.options.enableGroupingRowSelection ?? false
        // },
        table.getIsAllRowsSelected = ()=>{
            const preGroupedFlatRows = table.getFilteredRowModel().flatRows;
            const { rowSelection } = table.getState();
            let isAllRowsSelected = Boolean(preGroupedFlatRows.length && Object.keys(rowSelection).length);
            if (isAllRowsSelected) {
                if (preGroupedFlatRows.some((row)=>row.getCanSelect() && !rowSelection[row.id])) {
                    isAllRowsSelected = false;
                }
            }
            return isAllRowsSelected;
        };
        table.getIsAllPageRowsSelected = ()=>{
            const paginationFlatRows = table.getPaginationRowModel().flatRows.filter((row)=>row.getCanSelect());
            const { rowSelection } = table.getState();
            let isAllPageRowsSelected = !!paginationFlatRows.length;
            if (isAllPageRowsSelected && paginationFlatRows.some((row)=>!rowSelection[row.id])) {
                isAllPageRowsSelected = false;
            }
            return isAllPageRowsSelected;
        };
        table.getIsSomeRowsSelected = ()=>{
            var _table$getState$rowSe;
            const totalSelected = Object.keys((_table$getState$rowSe = table.getState().rowSelection) != null ? _table$getState$rowSe : {}).length;
            return totalSelected > 0 && totalSelected < table.getFilteredRowModel().flatRows.length;
        };
        table.getIsSomePageRowsSelected = ()=>{
            const paginationFlatRows = table.getPaginationRowModel().flatRows;
            return table.getIsAllPageRowsSelected() ? false : paginationFlatRows.filter((row)=>row.getCanSelect()).some((d)=>d.getIsSelected() || d.getIsSomeSelected());
        };
        table.getToggleAllRowsSelectedHandler = ()=>{
            return (e)=>{
                table.toggleAllRowsSelected(e.target.checked);
            };
        };
        table.getToggleAllPageRowsSelectedHandler = ()=>{
            return (e)=>{
                table.toggleAllPageRowsSelected(e.target.checked);
            };
        };
    },
    createRow: (row, table)=>{
        row.toggleSelected = (value, opts)=>{
            const isSelected = row.getIsSelected();
            table.setRowSelection((old)=>{
                var _opts$selectChildren;
                value = typeof value !== 'undefined' ? value : !isSelected;
                if (row.getCanSelect() && isSelected === value) {
                    return old;
                }
                const selectedRowIds = {
                    ...old
                };
                mutateRowIsSelected(selectedRowIds, row.id, value, (_opts$selectChildren = opts == null ? void 0 : opts.selectChildren) != null ? _opts$selectChildren : true, table);
                return selectedRowIds;
            });
        };
        row.getIsSelected = ()=>{
            const { rowSelection } = table.getState();
            return isRowSelected(row, rowSelection);
        };
        row.getIsSomeSelected = ()=>{
            const { rowSelection } = table.getState();
            return isSubRowSelected(row, rowSelection) === 'some';
        };
        row.getIsAllSubRowsSelected = ()=>{
            const { rowSelection } = table.getState();
            return isSubRowSelected(row, rowSelection) === 'all';
        };
        row.getCanSelect = ()=>{
            var _table$options$enable;
            if (typeof table.options.enableRowSelection === 'function') {
                return table.options.enableRowSelection(row);
            }
            return (_table$options$enable = table.options.enableRowSelection) != null ? _table$options$enable : true;
        };
        row.getCanSelectSubRows = ()=>{
            var _table$options$enable2;
            if (typeof table.options.enableSubRowSelection === 'function') {
                return table.options.enableSubRowSelection(row);
            }
            return (_table$options$enable2 = table.options.enableSubRowSelection) != null ? _table$options$enable2 : true;
        };
        row.getCanMultiSelect = ()=>{
            var _table$options$enable3;
            if (typeof table.options.enableMultiRowSelection === 'function') {
                return table.options.enableMultiRowSelection(row);
            }
            return (_table$options$enable3 = table.options.enableMultiRowSelection) != null ? _table$options$enable3 : true;
        };
        row.getToggleSelectedHandler = ()=>{
            const canSelect = row.getCanSelect();
            return (e)=>{
                var _target;
                if (!canSelect) return;
                row.toggleSelected((_target = e.target) == null ? void 0 : _target.checked);
            };
        };
    }
};
const mutateRowIsSelected = (selectedRowIds, id, value, includeChildren, table)=>{
    var _row$subRows;
    const row = table.getRow(id, true);
    // const isGrouped = row.getIsGrouped()
    // if ( // TODO: enforce grouping row selection rules
    //   !isGrouped ||
    //   (isGrouped && table.options.enableGroupingRowSelection)
    // ) {
    if (value) {
        if (!row.getCanMultiSelect()) {
            Object.keys(selectedRowIds).forEach((key)=>delete selectedRowIds[key]);
        }
        if (row.getCanSelect()) {
            selectedRowIds[id] = true;
        }
    } else {
        delete selectedRowIds[id];
    }
    // }
    if (includeChildren && (_row$subRows = row.subRows) != null && _row$subRows.length && row.getCanSelectSubRows()) {
        row.subRows.forEach((row)=>mutateRowIsSelected(selectedRowIds, row.id, value, includeChildren, table));
    }
};
function selectRowsFn(table, rowModel) {
    const rowSelection = table.getState().rowSelection;
    const newSelectedFlatRows = [];
    const newSelectedRowsById = {};
    // Filters top level and nested rows
    const recurseRows = function(rows, depth) {
        return rows.map((row)=>{
            var _row$subRows2;
            const isSelected = isRowSelected(row, rowSelection);
            if (isSelected) {
                newSelectedFlatRows.push(row);
                newSelectedRowsById[row.id] = row;
            }
            if ((_row$subRows2 = row.subRows) != null && _row$subRows2.length) {
                row = {
                    ...row,
                    subRows: recurseRows(row.subRows)
                };
            }
            if (isSelected) {
                return row;
            }
        }).filter(Boolean);
    };
    return {
        rows: recurseRows(rowModel.rows),
        flatRows: newSelectedFlatRows,
        rowsById: newSelectedRowsById
    };
}
function isRowSelected(row, selection) {
    var _selection$row$id;
    return (_selection$row$id = selection[row.id]) != null ? _selection$row$id : false;
}
function isSubRowSelected(row, selection, table) {
    var _row$subRows3;
    if (!((_row$subRows3 = row.subRows) != null && _row$subRows3.length)) return false;
    let allChildrenSelected = true;
    let someSelected = false;
    row.subRows.forEach((subRow)=>{
        // Bail out early if we know both of these
        if (someSelected && !allChildrenSelected) {
            return;
        }
        if (subRow.getCanSelect()) {
            if (isRowSelected(subRow, selection)) {
                someSelected = true;
            } else {
                allChildrenSelected = false;
            }
        }
        // Check row selection of nested subrows
        if (subRow.subRows && subRow.subRows.length) {
            const subRowChildrenSelected = isSubRowSelected(subRow, selection);
            if (subRowChildrenSelected === 'all') {
                someSelected = true;
            } else if (subRowChildrenSelected === 'some') {
                someSelected = true;
                allChildrenSelected = false;
            } else {
                allChildrenSelected = false;
            }
        }
    });
    return allChildrenSelected ? 'all' : someSelected ? 'some' : false;
}
const reSplitAlphaNumeric = /([0-9]+)/gm;
const alphanumeric = (rowA, rowB, columnId)=>{
    return compareAlphanumeric(toString(rowA.getValue(columnId)).toLowerCase(), toString(rowB.getValue(columnId)).toLowerCase());
};
const alphanumericCaseSensitive = (rowA, rowB, columnId)=>{
    return compareAlphanumeric(toString(rowA.getValue(columnId)), toString(rowB.getValue(columnId)));
};
// The text filter is more basic (less numeric support)
// but is much faster
const text = (rowA, rowB, columnId)=>{
    return compareBasic(toString(rowA.getValue(columnId)).toLowerCase(), toString(rowB.getValue(columnId)).toLowerCase());
};
// The text filter is more basic (less numeric support)
// but is much faster
const textCaseSensitive = (rowA, rowB, columnId)=>{
    return compareBasic(toString(rowA.getValue(columnId)), toString(rowB.getValue(columnId)));
};
const datetime = (rowA, rowB, columnId)=>{
    const a = rowA.getValue(columnId);
    const b = rowB.getValue(columnId);
    // Can handle nullish values
    // Use > and < because == (and ===) doesn't work with
    // Date objects (would require calling getTime()).
    return a > b ? 1 : a < b ? -1 : 0;
};
const basic = (rowA, rowB, columnId)=>{
    return compareBasic(rowA.getValue(columnId), rowB.getValue(columnId));
};
// Utils
function compareBasic(a, b) {
    return a === b ? 0 : a > b ? 1 : -1;
}
function toString(a) {
    if (typeof a === 'number') {
        if (isNaN(a) || a === Infinity || a === -Infinity) {
            return '';
        }
        return String(a);
    }
    if (typeof a === 'string') {
        return a;
    }
    return '';
}
// Mixed sorting is slow, but very inclusive of many edge cases.
// It handles numbers, mixed alphanumeric combinations, and even
// null, undefined, and Infinity
function compareAlphanumeric(aStr, bStr) {
    // Split on number groups, but keep the delimiter
    // Then remove falsey split values
    const a = aStr.split(reSplitAlphaNumeric).filter(Boolean);
    const b = bStr.split(reSplitAlphaNumeric).filter(Boolean);
    // While
    while(a.length && b.length){
        const aa = a.shift();
        const bb = b.shift();
        const an = parseInt(aa, 10);
        const bn = parseInt(bb, 10);
        const combo = [
            an,
            bn
        ].sort();
        // Both are string
        if (isNaN(combo[0])) {
            if (aa > bb) {
                return 1;
            }
            if (bb > aa) {
                return -1;
            }
            continue;
        }
        // One is a string, one is a number
        if (isNaN(combo[1])) {
            return isNaN(an) ? -1 : 1;
        }
        // Both are numbers
        if (an > bn) {
            return 1;
        }
        if (bn > an) {
            return -1;
        }
    }
    return a.length - b.length;
}
// Exports
const sortingFns = {
    alphanumeric,
    alphanumericCaseSensitive,
    text,
    textCaseSensitive,
    datetime,
    basic
};
//
const RowSorting = {
    getInitialState: (state)=>{
        return {
            sorting: [],
            ...state
        };
    },
    getDefaultColumnDef: ()=>{
        return {
            sortingFn: 'auto',
            sortUndefined: 1
        };
    },
    getDefaultOptions: (table)=>{
        return {
            onSortingChange: makeStateUpdater('sorting', table),
            isMultiSortEvent: (e)=>{
                return e.shiftKey;
            }
        };
    },
    createColumn: (column, table)=>{
        column.getAutoSortingFn = ()=>{
            const firstRows = table.getFilteredRowModel().flatRows.slice(10);
            let isString = false;
            for (const row of firstRows){
                const value = row == null ? void 0 : row.getValue(column.id);
                if (Object.prototype.toString.call(value) === '[object Date]') {
                    return sortingFns.datetime;
                }
                if (typeof value === 'string') {
                    isString = true;
                    if (value.split(reSplitAlphaNumeric).length > 1) {
                        return sortingFns.alphanumeric;
                    }
                }
            }
            if (isString) {
                return sortingFns.text;
            }
            return sortingFns.basic;
        };
        column.getAutoSortDir = ()=>{
            const firstRow = table.getFilteredRowModel().flatRows[0];
            const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
            if (typeof value === 'string') {
                return 'asc';
            }
            return 'desc';
        };
        column.getSortingFn = ()=>{
            var _table$options$sortin, _table$options$sortin2;
            if (!column) {
                throw new Error();
            }
            return isFunction(column.columnDef.sortingFn) ? column.columnDef.sortingFn : column.columnDef.sortingFn === 'auto' ? column.getAutoSortingFn() : (_table$options$sortin = (_table$options$sortin2 = table.options.sortingFns) == null ? void 0 : _table$options$sortin2[column.columnDef.sortingFn]) != null ? _table$options$sortin : sortingFns[column.columnDef.sortingFn];
        };
        column.toggleSorting = (desc, multi)=>{
            // if (column.columns.length) {
            //   column.columns.forEach((c, i) => {
            //     if (c.id) {
            //       table.toggleColumnSorting(c.id, undefined, multi || !!i)
            //     }
            //   })
            //   return
            // }
            // this needs to be outside of table.setSorting to be in sync with rerender
            const nextSortingOrder = column.getNextSortingOrder();
            const hasManualValue = typeof desc !== 'undefined' && desc !== null;
            table.setSorting((old)=>{
                // Find any existing sorting for this column
                const existingSorting = old == null ? void 0 : old.find((d)=>d.id === column.id);
                const existingIndex = old == null ? void 0 : old.findIndex((d)=>d.id === column.id);
                let newSorting = [];
                // What should we do with this sort action?
                let sortAction;
                let nextDesc = hasManualValue ? desc : nextSortingOrder === 'desc';
                // Multi-mode
                if (old != null && old.length && column.getCanMultiSort() && multi) {
                    if (existingSorting) {
                        sortAction = 'toggle';
                    } else {
                        sortAction = 'add';
                    }
                } else {
                    // Normal mode
                    if (old != null && old.length && existingIndex !== old.length - 1) {
                        sortAction = 'replace';
                    } else if (existingSorting) {
                        sortAction = 'toggle';
                    } else {
                        sortAction = 'replace';
                    }
                }
                // Handle toggle states that will remove the sorting
                if (sortAction === 'toggle') {
                    // If we are "actually" toggling (not a manual set value), should we remove the sorting?
                    if (!hasManualValue) {
                        // Is our intention to remove?
                        if (!nextSortingOrder) {
                            sortAction = 'remove';
                        }
                    }
                }
                if (sortAction === 'add') {
                    var _table$options$maxMul;
                    newSorting = [
                        ...old,
                        {
                            id: column.id,
                            desc: nextDesc
                        }
                    ];
                    // Take latest n columns
                    newSorting.splice(0, newSorting.length - ((_table$options$maxMul = table.options.maxMultiSortColCount) != null ? _table$options$maxMul : Number.MAX_SAFE_INTEGER));
                } else if (sortAction === 'toggle') {
                    // This flips (or sets) the
                    newSorting = old.map((d)=>{
                        if (d.id === column.id) {
                            return {
                                ...d,
                                desc: nextDesc
                            };
                        }
                        return d;
                    });
                } else if (sortAction === 'remove') {
                    newSorting = old.filter((d)=>d.id !== column.id);
                } else {
                    newSorting = [
                        {
                            id: column.id,
                            desc: nextDesc
                        }
                    ];
                }
                return newSorting;
            });
        };
        column.getFirstSortDir = ()=>{
            var _ref, _column$columnDef$sor;
            const sortDescFirst = (_ref = (_column$columnDef$sor = column.columnDef.sortDescFirst) != null ? _column$columnDef$sor : table.options.sortDescFirst) != null ? _ref : column.getAutoSortDir() === 'desc';
            return sortDescFirst ? 'desc' : 'asc';
        };
        column.getNextSortingOrder = (multi)=>{
            var _table$options$enable, _table$options$enable2;
            const firstSortDirection = column.getFirstSortDir();
            const isSorted = column.getIsSorted();
            if (!isSorted) {
                return firstSortDirection;
            }
            if (isSorted !== firstSortDirection && ((_table$options$enable = table.options.enableSortingRemoval) != null ? _table$options$enable : true) && (// If enableSortRemove, enable in general
            multi ? (_table$options$enable2 = table.options.enableMultiRemove) != null ? _table$options$enable2 : true : true) // If multi, don't allow if enableMultiRemove))
            ) {
                return false;
            }
            return isSorted === 'desc' ? 'asc' : 'desc';
        };
        column.getCanSort = ()=>{
            var _column$columnDef$ena, _table$options$enable3;
            return ((_column$columnDef$ena = column.columnDef.enableSorting) != null ? _column$columnDef$ena : true) && ((_table$options$enable3 = table.options.enableSorting) != null ? _table$options$enable3 : true) && !!column.accessorFn;
        };
        column.getCanMultiSort = ()=>{
            var _ref2, _column$columnDef$ena2;
            return (_ref2 = (_column$columnDef$ena2 = column.columnDef.enableMultiSort) != null ? _column$columnDef$ena2 : table.options.enableMultiSort) != null ? _ref2 : !!column.accessorFn;
        };
        column.getIsSorted = ()=>{
            var _table$getState$sorti;
            const columnSort = (_table$getState$sorti = table.getState().sorting) == null ? void 0 : _table$getState$sorti.find((d)=>d.id === column.id);
            return !columnSort ? false : columnSort.desc ? 'desc' : 'asc';
        };
        column.getSortIndex = ()=>{
            var _table$getState$sorti2, _table$getState$sorti3;
            return (_table$getState$sorti2 = (_table$getState$sorti3 = table.getState().sorting) == null ? void 0 : _table$getState$sorti3.findIndex((d)=>d.id === column.id)) != null ? _table$getState$sorti2 : -1;
        };
        column.clearSorting = ()=>{
            //clear sorting for just 1 column
            table.setSorting((old)=>old != null && old.length ? old.filter((d)=>d.id !== column.id) : []);
        };
        column.getToggleSortingHandler = ()=>{
            const canSort = column.getCanSort();
            return (e)=>{
                if (!canSort) return;
                e.persist == null || e.persist();
                column.toggleSorting == null || column.toggleSorting(undefined, column.getCanMultiSort() ? table.options.isMultiSortEvent == null ? void 0 : table.options.isMultiSortEvent(e) : false);
            };
        };
    },
    createTable: (table)=>{
        table.setSorting = (updater)=>table.options.onSortingChange == null ? void 0 : table.options.onSortingChange(updater);
        table.resetSorting = (defaultState)=>{
            var _table$initialState$s, _table$initialState;
            table.setSorting(defaultState ? [] : (_table$initialState$s = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.sorting) != null ? _table$initialState$s : []);
        };
        table.getPreSortedRowModel = ()=>table.getGroupedRowModel();
        table.getSortedRowModel = ()=>{
            if (!table._getSortedRowModel && table.options.getSortedRowModel) {
                table._getSortedRowModel = table.options.getSortedRowModel(table);
            }
            if (table.options.manualSorting || !table._getSortedRowModel) {
                return table.getPreSortedRowModel();
            }
            return table._getSortedRowModel();
        };
    }
};
const builtInFeatures = [
    Headers,
    ColumnVisibility,
    ColumnOrdering,
    ColumnPinning,
    ColumnFaceting,
    ColumnFiltering,
    GlobalFaceting,
    //depends on ColumnFaceting
    GlobalFiltering,
    //depends on ColumnFiltering
    RowSorting,
    ColumnGrouping,
    //depends on RowSorting
    RowExpanding,
    RowPagination,
    RowPinning,
    RowSelection,
    ColumnSizing
];
//
function createTable(options) {
    var _options$_features, _options$initialState;
    if (("TURBOPACK compile-time value", "development") !== 'production' && (options.debugAll || options.debugTable)) {
        console.info('Creating Table Instance...');
    }
    const _features = [
        ...builtInFeatures,
        ...(_options$_features = options._features) != null ? _options$_features : []
    ];
    let table = {
        _features
    };
    const defaultOptions = table._features.reduce((obj, feature)=>{
        return Object.assign(obj, feature.getDefaultOptions == null ? void 0 : feature.getDefaultOptions(table));
    }, {});
    const mergeOptions = (options)=>{
        if (table.options.mergeOptions) {
            return table.options.mergeOptions(defaultOptions, options);
        }
        return {
            ...defaultOptions,
            ...options
        };
    };
    const coreInitialState = {};
    let initialState = {
        ...coreInitialState,
        ...(_options$initialState = options.initialState) != null ? _options$initialState : {}
    };
    table._features.forEach((feature)=>{
        var _feature$getInitialSt;
        initialState = (_feature$getInitialSt = feature.getInitialState == null ? void 0 : feature.getInitialState(initialState)) != null ? _feature$getInitialSt : initialState;
    });
    const queued = [];
    let queuedTimeout = false;
    const coreInstance = {
        _features,
        options: {
            ...defaultOptions,
            ...options
        },
        initialState,
        _queue: (cb)=>{
            queued.push(cb);
            if (!queuedTimeout) {
                queuedTimeout = true;
                // Schedule a microtask to run the queued callbacks after
                // the current call stack (render, etc) has finished.
                Promise.resolve().then(()=>{
                    while(queued.length){
                        queued.shift()();
                    }
                    queuedTimeout = false;
                }).catch((error)=>setTimeout(()=>{
                        throw error;
                    }));
            }
        },
        reset: ()=>{
            table.setState(table.initialState);
        },
        setOptions: (updater)=>{
            const newOptions = functionalUpdate(updater, table.options);
            table.options = mergeOptions(newOptions);
        },
        getState: ()=>{
            return table.options.state;
        },
        setState: (updater)=>{
            table.options.onStateChange == null || table.options.onStateChange(updater);
        },
        _getRowId: (row, index, parent)=>{
            var _table$options$getRow;
            return (_table$options$getRow = table.options.getRowId == null ? void 0 : table.options.getRowId(row, index, parent)) != null ? _table$options$getRow : `${parent ? [
                parent.id,
                index
            ].join('.') : index}`;
        },
        getCoreRowModel: ()=>{
            if (!table._getCoreRowModel) {
                table._getCoreRowModel = table.options.getCoreRowModel(table);
            }
            return table._getCoreRowModel();
        },
        // The final calls start at the bottom of the model,
        // expanded rows, which then work their way up
        getRowModel: ()=>{
            return table.getPaginationRowModel();
        },
        //in next version, we should just pass in the row model as the optional 2nd arg
        getRow: (id, searchAll)=>{
            let row = (searchAll ? table.getPrePaginationRowModel() : table.getRowModel()).rowsById[id];
            if (!row) {
                row = table.getCoreRowModel().rowsById[id];
                if (!row) {
                    if ("TURBOPACK compile-time truthy", 1) {
                        throw new Error(`getRow could not find row with ID: ${id}`);
                    }
                    throw new Error();
                }
            }
            return row;
        },
        _getDefaultColumnDef: memo(()=>[
                table.options.defaultColumn
            ], (defaultColumn)=>{
            var _defaultColumn;
            defaultColumn = (_defaultColumn = defaultColumn) != null ? _defaultColumn : {};
            return {
                header: (props)=>{
                    const resolvedColumnDef = props.header.column.columnDef;
                    if (resolvedColumnDef.accessorKey) {
                        return resolvedColumnDef.accessorKey;
                    }
                    if (resolvedColumnDef.accessorFn) {
                        return resolvedColumnDef.id;
                    }
                    return null;
                },
                // footer: props => props.header.column.id,
                cell: (props)=>{
                    var _props$renderValue$to, _props$renderValue;
                    return (_props$renderValue$to = (_props$renderValue = props.renderValue()) == null || _props$renderValue.toString == null ? void 0 : _props$renderValue.toString()) != null ? _props$renderValue$to : null;
                },
                ...table._features.reduce((obj, feature)=>{
                    return Object.assign(obj, feature.getDefaultColumnDef == null ? void 0 : feature.getDefaultColumnDef());
                }, {}),
                ...defaultColumn
            };
        }, getMemoOptions(options, 'debugColumns', '_getDefaultColumnDef')),
        _getColumnDefs: ()=>table.options.columns,
        getAllColumns: memo(()=>[
                table._getColumnDefs()
            ], (columnDefs)=>{
            const recurseColumns = function(columnDefs, parent, depth) {
                if (depth === void 0) {
                    depth = 0;
                }
                return columnDefs.map((columnDef)=>{
                    const column = createColumn(table, columnDef, depth, parent);
                    const groupingColumnDef = columnDef;
                    column.columns = groupingColumnDef.columns ? recurseColumns(groupingColumnDef.columns, column, depth + 1) : [];
                    return column;
                });
            };
            return recurseColumns(columnDefs);
        }, getMemoOptions(options, 'debugColumns', 'getAllColumns')),
        getAllFlatColumns: memo(()=>[
                table.getAllColumns()
            ], (allColumns)=>{
            return allColumns.flatMap((column)=>{
                return column.getFlatColumns();
            });
        }, getMemoOptions(options, 'debugColumns', 'getAllFlatColumns')),
        _getAllFlatColumnsById: memo(()=>[
                table.getAllFlatColumns()
            ], (flatColumns)=>{
            return flatColumns.reduce((acc, column)=>{
                acc[column.id] = column;
                return acc;
            }, {});
        }, getMemoOptions(options, 'debugColumns', 'getAllFlatColumnsById')),
        getAllLeafColumns: memo(()=>[
                table.getAllColumns(),
                table._getOrderColumnsFn()
            ], (allColumns, orderColumns)=>{
            let leafColumns = allColumns.flatMap((column)=>column.getLeafColumns());
            return orderColumns(leafColumns);
        }, getMemoOptions(options, 'debugColumns', 'getAllLeafColumns')),
        getColumn: (columnId)=>{
            const column = table._getAllFlatColumnsById()[columnId];
            if (("TURBOPACK compile-time value", "development") !== 'production' && !column) {
                console.error(`[Table] Column with id '${columnId}' does not exist.`);
            }
            return column;
        }
    };
    Object.assign(table, coreInstance);
    for(let index = 0; index < table._features.length; index++){
        const feature = table._features[index];
        feature == null || feature.createTable == null || feature.createTable(table);
    }
    return table;
}
function getCoreRowModel() {
    return (table)=>memo(()=>[
                table.options.data
            ], (data)=>{
            const rowModel = {
                rows: [],
                flatRows: [],
                rowsById: {}
            };
            const accessRows = function(originalRows, depth, parentRow) {
                if (depth === void 0) {
                    depth = 0;
                }
                const rows = [];
                for(let i = 0; i < originalRows.length; i++){
                    // This could be an expensive check at scale, so we should move it somewhere else, but where?
                    // if (!id) {
                    //   if (process.env.NODE_ENV !== 'production') {
                    //     throw new Error(`getRowId expected an ID, but got ${id}`)
                    //   }
                    // }
                    // Make the row
                    const row = createRow(table, table._getRowId(originalRows[i], i, parentRow), originalRows[i], i, depth, undefined, parentRow == null ? void 0 : parentRow.id);
                    // Keep track of every row in a flat array
                    rowModel.flatRows.push(row);
                    // Also keep track of every row by its ID
                    rowModel.rowsById[row.id] = row;
                    // Push table row into parent
                    rows.push(row);
                    // Get the original subrows
                    if (table.options.getSubRows) {
                        var _row$originalSubRows;
                        row.originalSubRows = table.options.getSubRows(originalRows[i], i);
                        // Then recursively access them
                        if ((_row$originalSubRows = row.originalSubRows) != null && _row$originalSubRows.length) {
                            row.subRows = accessRows(row.originalSubRows, depth + 1, row);
                        }
                    }
                }
                return rows;
            };
            rowModel.rows = accessRows(data);
            return rowModel;
        }, getMemoOptions(table.options, 'debugTable', 'getRowModel', ()=>table._autoResetPageIndex()));
}
function getExpandedRowModel() {
    return (table)=>memo(()=>[
                table.getState().expanded,
                table.getPreExpandedRowModel(),
                table.options.paginateExpandedRows
            ], (expanded, rowModel, paginateExpandedRows)=>{
            if (!rowModel.rows.length || expanded !== true && !Object.keys(expanded != null ? expanded : {}).length) {
                return rowModel;
            }
            if (!paginateExpandedRows) {
                // Only expand rows at this point if they are being paginated
                return rowModel;
            }
            return expandRows(rowModel);
        }, getMemoOptions(table.options, 'debugTable', 'getExpandedRowModel'));
}
function expandRows(rowModel) {
    const expandedRows = [];
    const handleRow = (row)=>{
        var _row$subRows;
        expandedRows.push(row);
        if ((_row$subRows = row.subRows) != null && _row$subRows.length && row.getIsExpanded()) {
            row.subRows.forEach(handleRow);
        }
    };
    rowModel.rows.forEach(handleRow);
    return {
        rows: expandedRows,
        flatRows: rowModel.flatRows,
        rowsById: rowModel.rowsById
    };
}
function getFacetedMinMaxValues() {
    return (table, columnId)=>memo(()=>{
            var _table$getColumn;
            return [
                (_table$getColumn = table.getColumn(columnId)) == null ? void 0 : _table$getColumn.getFacetedRowModel()
            ];
        }, (facetedRowModel)=>{
            if (!facetedRowModel) return undefined;
            const uniqueValues = facetedRowModel.flatRows.flatMap((flatRow)=>{
                var _flatRow$getUniqueVal;
                return (_flatRow$getUniqueVal = flatRow.getUniqueValues(columnId)) != null ? _flatRow$getUniqueVal : [];
            }).map(Number).filter((value)=>!Number.isNaN(value));
            if (!uniqueValues.length) return;
            let facetedMinValue = uniqueValues[0];
            let facetedMaxValue = uniqueValues[uniqueValues.length - 1];
            for (const value of uniqueValues){
                if (value < facetedMinValue) facetedMinValue = value;
                else if (value > facetedMaxValue) facetedMaxValue = value;
            }
            return [
                facetedMinValue,
                facetedMaxValue
            ];
        }, getMemoOptions(table.options, 'debugTable', 'getFacetedMinMaxValues'));
}
function filterRows(rows, filterRowImpl, table) {
    if (table.options.filterFromLeafRows) {
        return filterRowModelFromLeafs(rows, filterRowImpl, table);
    }
    return filterRowModelFromRoot(rows, filterRowImpl, table);
}
function filterRowModelFromLeafs(rowsToFilter, filterRow, table) {
    var _table$options$maxLea;
    const newFilteredFlatRows = [];
    const newFilteredRowsById = {};
    const maxDepth = (_table$options$maxLea = table.options.maxLeafRowFilterDepth) != null ? _table$options$maxLea : 100;
    const recurseFilterRows = function(rowsToFilter, depth) {
        if (depth === void 0) {
            depth = 0;
        }
        const rows = [];
        // Filter from children up first
        for(let i = 0; i < rowsToFilter.length; i++){
            var _row$subRows;
            let row = rowsToFilter[i];
            const newRow = createRow(table, row.id, row.original, row.index, row.depth, undefined, row.parentId);
            newRow.columnFilters = row.columnFilters;
            if ((_row$subRows = row.subRows) != null && _row$subRows.length && depth < maxDepth) {
                newRow.subRows = recurseFilterRows(row.subRows, depth + 1);
                row = newRow;
                if (filterRow(row) && !newRow.subRows.length) {
                    rows.push(row);
                    newFilteredRowsById[row.id] = row;
                    newFilteredFlatRows.push(row);
                    continue;
                }
                if (filterRow(row) || newRow.subRows.length) {
                    rows.push(row);
                    newFilteredRowsById[row.id] = row;
                    newFilteredFlatRows.push(row);
                    continue;
                }
            } else {
                row = newRow;
                if (filterRow(row)) {
                    rows.push(row);
                    newFilteredRowsById[row.id] = row;
                    newFilteredFlatRows.push(row);
                }
            }
        }
        return rows;
    };
    return {
        rows: recurseFilterRows(rowsToFilter),
        flatRows: newFilteredFlatRows,
        rowsById: newFilteredRowsById
    };
}
function filterRowModelFromRoot(rowsToFilter, filterRow, table) {
    var _table$options$maxLea2;
    const newFilteredFlatRows = [];
    const newFilteredRowsById = {};
    const maxDepth = (_table$options$maxLea2 = table.options.maxLeafRowFilterDepth) != null ? _table$options$maxLea2 : 100;
    // Filters top level and nested rows
    const recurseFilterRows = function(rowsToFilter, depth) {
        if (depth === void 0) {
            depth = 0;
        }
        // Filter from parents downward first
        const rows = [];
        // Apply the filter to any subRows
        for(let i = 0; i < rowsToFilter.length; i++){
            let row = rowsToFilter[i];
            const pass = filterRow(row);
            if (pass) {
                var _row$subRows2;
                if ((_row$subRows2 = row.subRows) != null && _row$subRows2.length && depth < maxDepth) {
                    const newRow = createRow(table, row.id, row.original, row.index, row.depth, undefined, row.parentId);
                    newRow.subRows = recurseFilterRows(row.subRows, depth + 1);
                    row = newRow;
                }
                rows.push(row);
                newFilteredFlatRows.push(row);
                newFilteredRowsById[row.id] = row;
            }
        }
        return rows;
    };
    return {
        rows: recurseFilterRows(rowsToFilter),
        flatRows: newFilteredFlatRows,
        rowsById: newFilteredRowsById
    };
}
function getFacetedRowModel() {
    return (table, columnId)=>memo(()=>[
                table.getPreFilteredRowModel(),
                table.getState().columnFilters,
                table.getState().globalFilter,
                table.getFilteredRowModel()
            ], (preRowModel, columnFilters, globalFilter)=>{
            if (!preRowModel.rows.length || !(columnFilters != null && columnFilters.length) && !globalFilter) {
                return preRowModel;
            }
            const filterableIds = [
                ...columnFilters.map((d)=>d.id).filter((d)=>d !== columnId),
                globalFilter ? '__global__' : undefined
            ].filter(Boolean);
            const filterRowsImpl = (row)=>{
                // Horizontally filter rows through each column
                for(let i = 0; i < filterableIds.length; i++){
                    if (row.columnFilters[filterableIds[i]] === false) {
                        return false;
                    }
                }
                return true;
            };
            return filterRows(preRowModel.rows, filterRowsImpl, table);
        }, getMemoOptions(table.options, 'debugTable', 'getFacetedRowModel'));
}
function getFacetedUniqueValues() {
    return (table, columnId)=>memo(()=>{
            var _table$getColumn;
            return [
                (_table$getColumn = table.getColumn(columnId)) == null ? void 0 : _table$getColumn.getFacetedRowModel()
            ];
        }, (facetedRowModel)=>{
            if (!facetedRowModel) return new Map();
            let facetedUniqueValues = new Map();
            for(let i = 0; i < facetedRowModel.flatRows.length; i++){
                const values = facetedRowModel.flatRows[i].getUniqueValues(columnId);
                for(let j = 0; j < values.length; j++){
                    const value = values[j];
                    if (facetedUniqueValues.has(value)) {
                        var _facetedUniqueValues$;
                        facetedUniqueValues.set(value, ((_facetedUniqueValues$ = facetedUniqueValues.get(value)) != null ? _facetedUniqueValues$ : 0) + 1);
                    } else {
                        facetedUniqueValues.set(value, 1);
                    }
                }
            }
            return facetedUniqueValues;
        }, getMemoOptions(table.options, 'debugTable', `getFacetedUniqueValues_${columnId}`));
}
function getFilteredRowModel() {
    return (table)=>memo(()=>[
                table.getPreFilteredRowModel(),
                table.getState().columnFilters,
                table.getState().globalFilter
            ], (rowModel, columnFilters, globalFilter)=>{
            if (!rowModel.rows.length || !(columnFilters != null && columnFilters.length) && !globalFilter) {
                for(let i = 0; i < rowModel.flatRows.length; i++){
                    rowModel.flatRows[i].columnFilters = {};
                    rowModel.flatRows[i].columnFiltersMeta = {};
                }
                return rowModel;
            }
            const resolvedColumnFilters = [];
            const resolvedGlobalFilters = [];
            (columnFilters != null ? columnFilters : []).forEach((d)=>{
                var _filterFn$resolveFilt;
                const column = table.getColumn(d.id);
                if (!column) {
                    return;
                }
                const filterFn = column.getFilterFn();
                if (!filterFn) {
                    if ("TURBOPACK compile-time truthy", 1) {
                        console.warn(`Could not find a valid 'column.filterFn' for column with the ID: ${column.id}.`);
                    }
                    return;
                }
                resolvedColumnFilters.push({
                    id: d.id,
                    filterFn,
                    resolvedValue: (_filterFn$resolveFilt = filterFn.resolveFilterValue == null ? void 0 : filterFn.resolveFilterValue(d.value)) != null ? _filterFn$resolveFilt : d.value
                });
            });
            const filterableIds = (columnFilters != null ? columnFilters : []).map((d)=>d.id);
            const globalFilterFn = table.getGlobalFilterFn();
            const globallyFilterableColumns = table.getAllLeafColumns().filter((column)=>column.getCanGlobalFilter());
            if (globalFilter && globalFilterFn && globallyFilterableColumns.length) {
                filterableIds.push('__global__');
                globallyFilterableColumns.forEach((column)=>{
                    var _globalFilterFn$resol;
                    resolvedGlobalFilters.push({
                        id: column.id,
                        filterFn: globalFilterFn,
                        resolvedValue: (_globalFilterFn$resol = globalFilterFn.resolveFilterValue == null ? void 0 : globalFilterFn.resolveFilterValue(globalFilter)) != null ? _globalFilterFn$resol : globalFilter
                    });
                });
            }
            let currentColumnFilter;
            let currentGlobalFilter;
            // Flag the prefiltered row model with each filter state
            for(let j = 0; j < rowModel.flatRows.length; j++){
                const row = rowModel.flatRows[j];
                row.columnFilters = {};
                if (resolvedColumnFilters.length) {
                    for(let i = 0; i < resolvedColumnFilters.length; i++){
                        currentColumnFilter = resolvedColumnFilters[i];
                        const id = currentColumnFilter.id;
                        // Tag the row with the column filter state
                        row.columnFilters[id] = currentColumnFilter.filterFn(row, id, currentColumnFilter.resolvedValue, (filterMeta)=>{
                            row.columnFiltersMeta[id] = filterMeta;
                        });
                    }
                }
                if (resolvedGlobalFilters.length) {
                    for(let i = 0; i < resolvedGlobalFilters.length; i++){
                        currentGlobalFilter = resolvedGlobalFilters[i];
                        const id = currentGlobalFilter.id;
                        // Tag the row with the first truthy global filter state
                        if (currentGlobalFilter.filterFn(row, id, currentGlobalFilter.resolvedValue, (filterMeta)=>{
                            row.columnFiltersMeta[id] = filterMeta;
                        })) {
                            row.columnFilters.__global__ = true;
                            break;
                        }
                    }
                    if (row.columnFilters.__global__ !== true) {
                        row.columnFilters.__global__ = false;
                    }
                }
            }
            const filterRowsImpl = (row)=>{
                // Horizontally filter rows through each column
                for(let i = 0; i < filterableIds.length; i++){
                    if (row.columnFilters[filterableIds[i]] === false) {
                        return false;
                    }
                }
                return true;
            };
            // Filter final rows using all of the active filters
            return filterRows(rowModel.rows, filterRowsImpl, table);
        }, getMemoOptions(table.options, 'debugTable', 'getFilteredRowModel', ()=>table._autoResetPageIndex()));
}
function getGroupedRowModel() {
    return (table)=>memo(()=>[
                table.getState().grouping,
                table.getPreGroupedRowModel()
            ], (grouping, rowModel)=>{
            if (!rowModel.rows.length || !grouping.length) {
                rowModel.rows.forEach((row)=>{
                    row.depth = 0;
                    row.parentId = undefined;
                });
                return rowModel;
            }
            // Filter the grouping list down to columns that exist
            const existingGrouping = grouping.filter((columnId)=>table.getColumn(columnId));
            const groupedFlatRows = [];
            const groupedRowsById = {};
            // const onlyGroupedFlatRows: Row[] = [];
            // const onlyGroupedRowsById: Record<RowId, Row> = {};
            // const nonGroupedFlatRows: Row[] = [];
            // const nonGroupedRowsById: Record<RowId, Row> = {};
            // Recursively group the data
            const groupUpRecursively = function(rows, depth, parentId) {
                if (depth === void 0) {
                    depth = 0;
                }
                // Grouping depth has been been met
                // Stop grouping and simply rewrite thd depth and row relationships
                if (depth >= existingGrouping.length) {
                    return rows.map((row)=>{
                        row.depth = depth;
                        groupedFlatRows.push(row);
                        groupedRowsById[row.id] = row;
                        if (row.subRows) {
                            row.subRows = groupUpRecursively(row.subRows, depth + 1, row.id);
                        }
                        return row;
                    });
                }
                const columnId = existingGrouping[depth];
                // Group the rows together for this level
                const rowGroupsMap = groupBy(rows, columnId);
                // Perform aggregations for each group
                const aggregatedGroupedRows = Array.from(rowGroupsMap.entries()).map((_ref, index)=>{
                    let [groupingValue, groupedRows] = _ref;
                    let id = `${columnId}:${groupingValue}`;
                    id = parentId ? `${parentId}>${id}` : id;
                    // First, Recurse to group sub rows before aggregation
                    const subRows = groupUpRecursively(groupedRows, depth + 1, id);
                    subRows.forEach((subRow)=>{
                        subRow.parentId = id;
                    });
                    // Flatten the leaf rows of the rows in this group
                    const leafRows = depth ? flattenBy(groupedRows, (row)=>row.subRows) : groupedRows;
                    const row = createRow(table, id, leafRows[0].original, index, depth, undefined, parentId);
                    Object.assign(row, {
                        groupingColumnId: columnId,
                        groupingValue,
                        subRows,
                        leafRows,
                        getValue: (columnId)=>{
                            // Don't aggregate columns that are in the grouping
                            if (existingGrouping.includes(columnId)) {
                                if (row._valuesCache.hasOwnProperty(columnId)) {
                                    return row._valuesCache[columnId];
                                }
                                if (groupedRows[0]) {
                                    var _groupedRows$0$getVal;
                                    row._valuesCache[columnId] = (_groupedRows$0$getVal = groupedRows[0].getValue(columnId)) != null ? _groupedRows$0$getVal : undefined;
                                }
                                return row._valuesCache[columnId];
                            }
                            if (row._groupingValuesCache.hasOwnProperty(columnId)) {
                                return row._groupingValuesCache[columnId];
                            }
                            // Aggregate the values
                            const column = table.getColumn(columnId);
                            const aggregateFn = column == null ? void 0 : column.getAggregationFn();
                            if (aggregateFn) {
                                row._groupingValuesCache[columnId] = aggregateFn(columnId, leafRows, groupedRows);
                                return row._groupingValuesCache[columnId];
                            }
                        }
                    });
                    subRows.forEach((subRow)=>{
                        groupedFlatRows.push(subRow);
                        groupedRowsById[subRow.id] = subRow;
                    // if (subRow.getIsGrouped?.()) {
                    //   onlyGroupedFlatRows.push(subRow);
                    //   onlyGroupedRowsById[subRow.id] = subRow;
                    // } else {
                    //   nonGroupedFlatRows.push(subRow);
                    //   nonGroupedRowsById[subRow.id] = subRow;
                    // }
                    });
                    return row;
                });
                return aggregatedGroupedRows;
            };
            const groupedRows = groupUpRecursively(rowModel.rows, 0);
            groupedRows.forEach((subRow)=>{
                groupedFlatRows.push(subRow);
                groupedRowsById[subRow.id] = subRow;
            // if (subRow.getIsGrouped?.()) {
            //   onlyGroupedFlatRows.push(subRow);
            //   onlyGroupedRowsById[subRow.id] = subRow;
            // } else {
            //   nonGroupedFlatRows.push(subRow);
            //   nonGroupedRowsById[subRow.id] = subRow;
            // }
            });
            return {
                rows: groupedRows,
                flatRows: groupedFlatRows,
                rowsById: groupedRowsById
            };
        }, getMemoOptions(table.options, 'debugTable', 'getGroupedRowModel', ()=>{
            table._queue(()=>{
                table._autoResetExpanded();
                table._autoResetPageIndex();
            });
        }));
}
function groupBy(rows, columnId) {
    const groupMap = new Map();
    return rows.reduce((map, row)=>{
        const resKey = `${row.getGroupingValue(columnId)}`;
        const previous = map.get(resKey);
        if (!previous) {
            map.set(resKey, [
                row
            ]);
        } else {
            previous.push(row);
        }
        return map;
    }, groupMap);
}
function getPaginationRowModel(opts) {
    return (table)=>memo(()=>[
                table.getState().pagination,
                table.getPrePaginationRowModel(),
                table.options.paginateExpandedRows ? undefined : table.getState().expanded
            ], (pagination, rowModel)=>{
            if (!rowModel.rows.length) {
                return rowModel;
            }
            const { pageSize, pageIndex } = pagination;
            let { rows, flatRows, rowsById } = rowModel;
            const pageStart = pageSize * pageIndex;
            const pageEnd = pageStart + pageSize;
            rows = rows.slice(pageStart, pageEnd);
            let paginatedRowModel;
            if (!table.options.paginateExpandedRows) {
                paginatedRowModel = expandRows({
                    rows,
                    flatRows,
                    rowsById
                });
            } else {
                paginatedRowModel = {
                    rows,
                    flatRows,
                    rowsById
                };
            }
            paginatedRowModel.flatRows = [];
            const handleRow = (row)=>{
                paginatedRowModel.flatRows.push(row);
                if (row.subRows.length) {
                    row.subRows.forEach(handleRow);
                }
            };
            paginatedRowModel.rows.forEach(handleRow);
            return paginatedRowModel;
        }, getMemoOptions(table.options, 'debugTable', 'getPaginationRowModel'));
}
function getSortedRowModel() {
    return (table)=>memo(()=>[
                table.getState().sorting,
                table.getPreSortedRowModel()
            ], (sorting, rowModel)=>{
            if (!rowModel.rows.length || !(sorting != null && sorting.length)) {
                return rowModel;
            }
            const sortingState = table.getState().sorting;
            const sortedFlatRows = [];
            // Filter out sortings that correspond to non existing columns
            const availableSorting = sortingState.filter((sort)=>{
                var _table$getColumn;
                return (_table$getColumn = table.getColumn(sort.id)) == null ? void 0 : _table$getColumn.getCanSort();
            });
            const columnInfoById = {};
            availableSorting.forEach((sortEntry)=>{
                const column = table.getColumn(sortEntry.id);
                if (!column) return;
                columnInfoById[sortEntry.id] = {
                    sortUndefined: column.columnDef.sortUndefined,
                    invertSorting: column.columnDef.invertSorting,
                    sortingFn: column.getSortingFn()
                };
            });
            const sortData = (rows)=>{
                // This will also perform a stable sorting using the row index
                // if needed.
                const sortedData = rows.map((row)=>({
                        ...row
                    }));
                sortedData.sort((rowA, rowB)=>{
                    for(let i = 0; i < availableSorting.length; i += 1){
                        var _sortEntry$desc;
                        const sortEntry = availableSorting[i];
                        const columnInfo = columnInfoById[sortEntry.id];
                        const sortUndefined = columnInfo.sortUndefined;
                        const isDesc = (_sortEntry$desc = sortEntry == null ? void 0 : sortEntry.desc) != null ? _sortEntry$desc : false;
                        let sortInt = 0;
                        // All sorting ints should always return in ascending order
                        if (sortUndefined) {
                            const aValue = rowA.getValue(sortEntry.id);
                            const bValue = rowB.getValue(sortEntry.id);
                            const aUndefined = aValue === undefined;
                            const bUndefined = bValue === undefined;
                            if (aUndefined || bUndefined) {
                                if (sortUndefined === 'first') return aUndefined ? -1 : 1;
                                if (sortUndefined === 'last') return aUndefined ? 1 : -1;
                                sortInt = aUndefined && bUndefined ? 0 : aUndefined ? sortUndefined : -sortUndefined;
                            }
                        }
                        if (sortInt === 0) {
                            sortInt = columnInfo.sortingFn(rowA, rowB, sortEntry.id);
                        }
                        // If sorting is non-zero, take care of desc and inversion
                        if (sortInt !== 0) {
                            if (isDesc) {
                                sortInt *= -1;
                            }
                            if (columnInfo.invertSorting) {
                                sortInt *= -1;
                            }
                            return sortInt;
                        }
                    }
                    return rowA.index - rowB.index;
                });
                // If there are sub-rows, sort them
                sortedData.forEach((row)=>{
                    var _row$subRows;
                    sortedFlatRows.push(row);
                    if ((_row$subRows = row.subRows) != null && _row$subRows.length) {
                        row.subRows = sortData(row.subRows);
                    }
                });
                return sortedData;
            };
            return {
                rows: sortData(rowModel.rows),
                flatRows: sortedFlatRows,
                rowsById: rowModel.rowsById
            };
        }, getMemoOptions(table.options, 'debugTable', 'getSortedRowModel', ()=>table._autoResetPageIndex()));
}
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/versotech-portal/node_modules/@tanstack/react-table/build/lib/index.mjs [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "flexRender",
    ()=>flexRender,
    "useReactTable",
    ()=>useReactTable
]);
/**
   * react-table
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   */ var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$tanstack$2f$table$2d$core$2f$build$2f$lib$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@tanstack/table-core/build/lib/index.mjs [app-ssr] (ecmascript)");
;
;
;
//
/**
 * If rendering headers, cells, or footers with custom markup, use flexRender instead of `cell.getValue()` or `cell.renderValue()`.
 */ function flexRender(Comp, props) {
    return !Comp ? null : isReactComponent(Comp) ? /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](Comp, props) : Comp;
}
function isReactComponent(component) {
    return isClassComponent(component) || typeof component === 'function' || isExoticComponent(component);
}
function isClassComponent(component) {
    return typeof component === 'function' && (()=>{
        const proto = Object.getPrototypeOf(component);
        return proto.prototype && proto.prototype.isReactComponent;
    })();
}
function isExoticComponent(component) {
    return typeof component === 'object' && typeof component.$$typeof === 'symbol' && [
        'react.memo',
        'react.forward_ref'
    ].includes(component.$$typeof.description);
}
function useReactTable(options) {
    // Compose in the generic options to the user options
    const resolvedOptions = {
        state: {},
        // Dummy state
        onStateChange: ()=>{},
        // noop
        renderFallbackValue: null,
        ...options
    };
    // Create a new table and store it in state
    const [tableRef] = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](()=>({
            current: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$tanstack$2f$table$2d$core$2f$build$2f$lib$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createTable"])(resolvedOptions)
        }));
    // By default, manage table state here using the table's initial state
    const [state, setState] = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](()=>tableRef.current.initialState);
    // Compose the default state above with any user state. This will allow the user
    // to only control a subset of the state if desired.
    tableRef.current.setOptions((prev)=>({
            ...prev,
            ...options,
            state: {
                ...state,
                ...options.state
            },
            // Similarly, we'll maintain both our internal state and any user-provided
            // state.
            onStateChange: (updater)=>{
                setState(updater);
                options.onStateChange == null || options.onStateChange(updater);
            }
        }));
    return tableRef.current;
}
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/arrow-down.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ArrowDown
]);
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 5v14",
            key: "s699le"
        }
    ],
    [
        "path",
        {
            d: "m19 12-7 7-7-7",
            key: "1idqje"
        }
    ]
];
const ArrowDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("arrow-down", __iconNode);
;
 //# sourceMappingURL=arrow-down.js.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/arrow-down.js [app-ssr] (ecmascript) <export default as ArrowDown>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrowDown",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/arrow-down.js [app-ssr] (ecmascript)");
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/arrow-up.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ArrowUp
]);
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m5 12 7-7 7 7",
            key: "hav0vg"
        }
    ],
    [
        "path",
        {
            d: "M12 19V5",
            key: "x0mq9r"
        }
    ]
];
const ArrowUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("arrow-up", __iconNode);
;
 //# sourceMappingURL=arrow-up.js.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/arrow-up.js [app-ssr] (ecmascript) <export default as ArrowUp>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrowUp",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/arrow-up.js [app-ssr] (ecmascript)");
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/arrow-up-down.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ArrowUpDown
]);
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m21 16-4 4-4-4",
            key: "f6ql7i"
        }
    ],
    [
        "path",
        {
            d: "M17 20V4",
            key: "1ejh1v"
        }
    ],
    [
        "path",
        {
            d: "m3 8 4-4 4 4",
            key: "11wl7u"
        }
    ],
    [
        "path",
        {
            d: "M7 4v16",
            key: "1glfcx"
        }
    ]
];
const ArrowUpDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("arrow-up-down", __iconNode);
;
 //# sourceMappingURL=arrow-up-down.js.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/arrow-up-down.js [app-ssr] (ecmascript) <export default as ArrowUpDown>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrowUpDown",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/arrow-up-down.js [app-ssr] (ecmascript)");
}),
"[project]/versotech-portal/node_modules/@radix-ui/react-alert-dialog/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Root",
    ()=>Slot,
    "Slot",
    ()=>Slot,
    "Slottable",
    ()=>Slottable,
    "createSlot",
    ()=>createSlot,
    "createSlottable",
    ()=>createSlottable
]);
// src/slot.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$compose$2d$refs$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-compose-refs/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
;
;
;
// @__NO_SIDE_EFFECTS__
function createSlot(ownerName) {
    const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
    const Slot2 = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
        const { children, ...slotProps } = props;
        const childrenArray = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Children"].toArray(children);
        const slottable = childrenArray.find(isSlottable);
        if (slottable) {
            const newElement = slottable.props.children;
            const newChildren = childrenArray.map((child)=>{
                if (child === slottable) {
                    if (__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Children"].count(newElement) > 1) return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Children"].only(null);
                    return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"](newElement) ? newElement.props.children : null;
                } else {
                    return child;
                }
            });
            return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SlotClone, {
                ...slotProps,
                ref: forwardedRef,
                children: __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"](newElement) ? __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneElement"](newElement, void 0, newChildren) : null
            });
        }
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SlotClone, {
            ...slotProps,
            ref: forwardedRef,
            children
        });
    });
    Slot2.displayName = `${ownerName}.Slot`;
    return Slot2;
}
var Slot = /* @__PURE__ */ createSlot("Slot");
// @__NO_SIDE_EFFECTS__
function createSlotClone(ownerName) {
    const SlotClone = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
        const { children, ...slotProps } = props;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"](children)) {
            const childrenRef = getElementRef(children);
            const props2 = mergeProps(slotProps, children.props);
            if (children.type !== __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"]) {
                props2.ref = forwardedRef ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$compose$2d$refs$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["composeRefs"])(forwardedRef, childrenRef) : childrenRef;
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneElement"](children, props2);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Children"].count(children) > 1 ? __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Children"].only(null) : null;
    });
    SlotClone.displayName = `${ownerName}.SlotClone`;
    return SlotClone;
}
var SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");
// @__NO_SIDE_EFFECTS__
function createSlottable(ownerName) {
    const Slottable2 = ({ children })=>{
        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children
        });
    };
    Slottable2.displayName = `${ownerName}.Slottable`;
    Slottable2.__radixId = SLOTTABLE_IDENTIFIER;
    return Slottable2;
}
var Slottable = /* @__PURE__ */ createSlottable("Slottable");
function isSlottable(child) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"](child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps(slotProps, childProps) {
    const overrideProps = {
        ...childProps
    };
    for(const propName in childProps){
        const slotPropValue = slotProps[propName];
        const childPropValue = childProps[propName];
        const isHandler = /^on[A-Z]/.test(propName);
        if (isHandler) {
            if (slotPropValue && childPropValue) {
                overrideProps[propName] = (...args)=>{
                    const result = childPropValue(...args);
                    slotPropValue(...args);
                    return result;
                };
            } else if (slotPropValue) {
                overrideProps[propName] = slotPropValue;
            }
        } else if (propName === "style") {
            overrideProps[propName] = {
                ...slotPropValue,
                ...childPropValue
            };
        } else if (propName === "className") {
            overrideProps[propName] = [
                slotPropValue,
                childPropValue
            ].filter(Boolean).join(" ");
        }
    }
    return {
        ...slotProps,
        ...overrideProps
    };
}
function getElementRef(element) {
    let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
    let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
        return element.ref;
    }
    getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
    mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
        return element.props.ref;
    }
    return element.props.ref || element.ref;
}
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/versotech-portal/node_modules/@radix-ui/react-alert-dialog/dist/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Action",
    ()=>Action,
    "AlertDialog",
    ()=>AlertDialog,
    "AlertDialogAction",
    ()=>AlertDialogAction,
    "AlertDialogCancel",
    ()=>AlertDialogCancel,
    "AlertDialogContent",
    ()=>AlertDialogContent,
    "AlertDialogDescription",
    ()=>AlertDialogDescription,
    "AlertDialogOverlay",
    ()=>AlertDialogOverlay,
    "AlertDialogPortal",
    ()=>AlertDialogPortal,
    "AlertDialogTitle",
    ()=>AlertDialogTitle,
    "AlertDialogTrigger",
    ()=>AlertDialogTrigger,
    "Cancel",
    ()=>Cancel,
    "Content",
    ()=>Content2,
    "Description",
    ()=>Description2,
    "Overlay",
    ()=>Overlay2,
    "Portal",
    ()=>Portal2,
    "Root",
    ()=>Root2,
    "Title",
    ()=>Title2,
    "Trigger",
    ()=>Trigger2,
    "createAlertDialogScope",
    ()=>createAlertDialogScope
]);
// src/alert-dialog.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$context$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-context/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$compose$2d$refs$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-compose-refs/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-dialog/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/primitive/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-alert-dialog/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
var ROOT_NAME = "AlertDialog";
var [createAlertDialogContext, createAlertDialogScope] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$context$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContextScope"])(ROOT_NAME, [
    __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createDialogScope"]
]);
var useDialogScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createDialogScope"])();
var AlertDialog = (props)=>{
    const { __scopeAlertDialog, ...alertDialogProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        ...dialogScope,
        ...alertDialogProps,
        modal: true
    });
};
AlertDialog.displayName = ROOT_NAME;
var TRIGGER_NAME = "AlertDialogTrigger";
var AlertDialogTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeAlertDialog, ...triggerProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Trigger"], {
        ...dialogScope,
        ...triggerProps,
        ref: forwardedRef
    });
});
AlertDialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "AlertDialogPortal";
var AlertDialogPortal = (props)=>{
    const { __scopeAlertDialog, ...portalProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Portal"], {
        ...dialogScope,
        ...portalProps
    });
};
AlertDialogPortal.displayName = PORTAL_NAME;
var OVERLAY_NAME = "AlertDialogOverlay";
var AlertDialogOverlay = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeAlertDialog, ...overlayProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Overlay"], {
        ...dialogScope,
        ...overlayProps,
        ref: forwardedRef
    });
});
AlertDialogOverlay.displayName = OVERLAY_NAME;
var CONTENT_NAME = "AlertDialogContent";
var [AlertDialogContentProvider, useAlertDialogContentContext] = createAlertDialogContext(CONTENT_NAME);
var Slottable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSlottable"])("AlertDialogContent");
var AlertDialogContent = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeAlertDialog, children, ...contentProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const contentRef = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null);
    const composedRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$compose$2d$refs$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useComposedRefs"])(forwardedRef, contentRef);
    const cancelRef = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WarningProvider"], {
        contentName: CONTENT_NAME,
        titleName: TITLE_NAME,
        docsSlug: "alert-dialog",
        children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(AlertDialogContentProvider, {
            scope: __scopeAlertDialog,
            cancelRef,
            children: /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Content"], {
                role: "alertdialog",
                ...dialogScope,
                ...contentProps,
                ref: composedRefs,
                onOpenAutoFocus: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["composeEventHandlers"])(contentProps.onOpenAutoFocus, (event)=>{
                    event.preventDefault();
                    cancelRef.current?.focus({
                        preventScroll: true
                    });
                }),
                onPointerDownOutside: (event)=>event.preventDefault(),
                onInteractOutside: (event)=>event.preventDefault(),
                children: [
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(Slottable, {
                        children
                    }),
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(DescriptionWarning, {
                        contentRef
                    })
                ]
            })
        })
    });
});
AlertDialogContent.displayName = CONTENT_NAME;
var TITLE_NAME = "AlertDialogTitle";
var AlertDialogTitle = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeAlertDialog, ...titleProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Title"], {
        ...dialogScope,
        ...titleProps,
        ref: forwardedRef
    });
});
AlertDialogTitle.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "AlertDialogDescription";
var AlertDialogDescription = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeAlertDialog, ...descriptionProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Description"], {
        ...dialogScope,
        ...descriptionProps,
        ref: forwardedRef
    });
});
AlertDialogDescription.displayName = DESCRIPTION_NAME;
var ACTION_NAME = "AlertDialogAction";
var AlertDialogAction = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeAlertDialog, ...actionProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Close"], {
        ...dialogScope,
        ...actionProps,
        ref: forwardedRef
    });
});
AlertDialogAction.displayName = ACTION_NAME;
var CANCEL_NAME = "AlertDialogCancel";
var AlertDialogCancel = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeAlertDialog, ...cancelProps } = props;
    const { cancelRef } = useAlertDialogContentContext(CANCEL_NAME, __scopeAlertDialog);
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$compose$2d$refs$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useComposedRefs"])(forwardedRef, cancelRef);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Close"], {
        ...dialogScope,
        ...cancelProps,
        ref
    });
});
AlertDialogCancel.displayName = CANCEL_NAME;
var DescriptionWarning = ({ contentRef })=>{
    const MESSAGE = `\`${CONTENT_NAME}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${CONTENT_NAME}\` by passing a \`${DESCRIPTION_NAME}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${CONTENT_NAME}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;
    __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        const hasDescription = document.getElementById(contentRef.current?.getAttribute("aria-describedby"));
        if (!hasDescription) console.warn(MESSAGE);
    }, [
        MESSAGE,
        contentRef
    ]);
    return null;
};
var Root2 = AlertDialog;
var Trigger2 = AlertDialogTrigger;
var Portal2 = AlertDialogPortal;
var Overlay2 = AlertDialogOverlay;
var Content2 = AlertDialogContent;
var Action = AlertDialogAction;
var Cancel = AlertDialogCancel;
var Title2 = AlertDialogTitle;
var Description2 = AlertDialogDescription;
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/versotech-portal/node_modules/@radix-ui/react-switch/dist/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Root",
    ()=>Root,
    "Switch",
    ()=>Switch,
    "SwitchThumb",
    ()=>SwitchThumb,
    "Thumb",
    ()=>Thumb,
    "createSwitchScope",
    ()=>createSwitchScope
]);
// src/switch.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/primitive/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$compose$2d$refs$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-compose-refs/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$context$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-context/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$controllable$2d$state$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$previous$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-use-previous/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$size$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-use-size/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@radix-ui/react-primitive/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
var SWITCH_NAME = "Switch";
var [createSwitchContext, createSwitchScope] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$context$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContextScope"])(SWITCH_NAME);
var [SwitchProvider, useSwitchContext] = createSwitchContext(SWITCH_NAME);
var Switch = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeSwitch, name, checked: checkedProp, defaultChecked, required, disabled, value = "on", onCheckedChange, form, ...switchProps } = props;
    const [button, setButton] = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](null);
    const composedRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$compose$2d$refs$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useComposedRefs"])(forwardedRef, (node)=>setButton(node));
    const hasConsumerStoppedPropagationRef = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    const [checked, setChecked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$controllable$2d$state$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useControllableState"])({
        prop: checkedProp,
        defaultProp: defaultChecked ?? false,
        onChange: onCheckedChange,
        caller: SWITCH_NAME
    });
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxs"])(SwitchProvider, {
        scope: __scopeSwitch,
        checked,
        disabled,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Primitive"].button, {
                type: "button",
                role: "switch",
                "aria-checked": checked,
                "aria-required": required,
                "data-state": getState(checked),
                "data-disabled": disabled ? "" : void 0,
                disabled,
                value,
                ...switchProps,
                ref: composedRefs,
                onClick: (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["composeEventHandlers"])(props.onClick, (event)=>{
                    setChecked((prevChecked)=>!prevChecked);
                    if (isFormControl) {
                        hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
                        if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
                    }
                })
            }),
            isFormControl && /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(SwitchBubbleInput, {
                control: button,
                bubbles: !hasConsumerStoppedPropagationRef.current,
                name,
                value,
                checked,
                required,
                disabled,
                form,
                style: {
                    transform: "translateX(-100%)"
                }
            })
        ]
    });
});
Switch.displayName = SWITCH_NAME;
var THUMB_NAME = "SwitchThumb";
var SwitchThumb = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"]((props, forwardedRef)=>{
    const { __scopeSwitch, ...thumbProps } = props;
    const context = useSwitchContext(THUMB_NAME, __scopeSwitch);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$primitive$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Primitive"].span, {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...thumbProps,
        ref: forwardedRef
    });
});
SwitchThumb.displayName = THUMB_NAME;
var BUBBLE_INPUT_NAME = "SwitchBubbleInput";
var SwitchBubbleInput = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ __scopeSwitch, control, checked, bubbles = true, ...props }, forwardedRef)=>{
    const ref = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null);
    const composedRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$compose$2d$refs$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useComposedRefs"])(ref, forwardedRef);
    const prevChecked = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$previous$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePrevious"])(checked);
    const controlSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$use$2d$size$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSize"])(control);
    __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        const input = ref.current;
        if (!input) return;
        const inputProto = window.HTMLInputElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(inputProto, "checked");
        const setChecked = descriptor.set;
        if (prevChecked !== checked && setChecked) {
            const event = new Event("click", {
                bubbles
            });
            setChecked.call(input, checked);
            input.dispatchEvent(event);
        }
    }, [
        prevChecked,
        checked,
        bubbles
    ]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsx"])("input", {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: checked,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
            ...props.style,
            ...controlSize,
            position: "absolute",
            pointerEvents: "none",
            opacity: 0,
            margin: 0
        }
    });
});
SwitchBubbleInput.displayName = BUBBLE_INPUT_NAME;
function getState(checked) {
    return checked ? "checked" : "unchecked";
}
var Root = Switch;
var Thumb = SwitchThumb;
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/upload.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Upload
]);
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 3v12",
            key: "1x0j5s"
        }
    ],
    [
        "path",
        {
            d: "m17 8-5-5-5 5",
            key: "7q97r8"
        }
    ],
    [
        "path",
        {
            d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
            key: "ih7n3h"
        }
    ]
];
const Upload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("upload", __iconNode);
;
 //# sourceMappingURL=upload.js.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/upload.js [app-ssr] (ecmascript) <export default as Upload>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Upload",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/upload.js [app-ssr] (ecmascript)");
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Trash2
]);
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M10 11v6",
            key: "nco0om"
        }
    ],
    [
        "path",
        {
            d: "M14 11v6",
            key: "outv1u"
        }
    ],
    [
        "path",
        {
            d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
            key: "miytrc"
        }
    ],
    [
        "path",
        {
            d: "M3 6h18",
            key: "d0wm0j"
        }
    ],
    [
        "path",
        {
            d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
            key: "e791ji"
        }
    ]
];
const Trash2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("trash-2", __iconNode);
;
 //# sourceMappingURL=trash-2.js.map
}),
"[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Trash2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript)");
}),
];

//# sourceMappingURL=6d6b6_b06c2f1a._.js.map