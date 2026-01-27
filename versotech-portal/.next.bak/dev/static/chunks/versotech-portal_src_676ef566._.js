(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/versotech-portal/src/lib/session-manager.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sessionManager",
    ()=>sessionManager
]);
'use client';
/**
 * Simplified Session Manager
 * 
 * Provides basic session management utilities without forcing re-authentication.
 * Supabase handles session persistence and expiration automatically.
 */ const AUTH_KEY_HINTS = [
    'supabase',
    'sb-',
    'auth',
    'supabase.auth.token'
];
const removeAuthKeys = (storage)=>{
    const keysToRemove = new Set();
    AUTH_KEY_HINTS.forEach((hint)=>{
        Object.keys(storage).filter((key)=>key.includes(hint)).forEach((key)=>keysToRemove.add(key));
    });
    keysToRemove.forEach((key)=>storage.removeItem(key));
};
class SessionManager {
    static instance;
    isInitialized = false;
    constructor(){}
    static getInstance() {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }
    /**
   * Initialize session manager
   * Sets up storage event listeners to handle cross-tab logout
   */ init() {
        if (this.isInitialized || ("TURBOPACK compile-time value", "object") === 'undefined') {
            return;
        }
        try {
            this.isInitialized = true;
            // Listen for storage changes in other tabs (cross-tab logout)
            window.addEventListener('storage', this.handleStorageChange);
            console.info('[auth-session] Session manager initialized');
        } catch (error) {
            console.error('[auth-session] Failed to initialize session manager:', error);
            this.isInitialized = false;
        }
    }
    /**
   * Clear all auth-related cookies
   * Cookies need to be cleared with exact path and domain to work properly
   */ clearAuthCookies() {
        if (typeof document === 'undefined') {
            return;
        }
        // Get all cookies
        const cookies = document.cookie.split(';');
        const authCookieNames = [];
        // Find all auth-related cookies
        cookies.forEach((cookie)=>{
            const cookieName = cookie.split('=')[0].trim();
            if (AUTH_KEY_HINTS.some((hint)=>cookieName.includes(hint))) {
                authCookieNames.push(cookieName);
            }
        });
        // Clear each auth cookie with multiple path/domain combinations
        authCookieNames.forEach((name)=>{
            // Try various path combinations
            const paths = [
                '/',
                '/versoholdings',
                '/versotech',
                '/versotech_main'
            ];
            const domains = [
                window.location.hostname,
                `.${window.location.hostname}`,
                ''
            ];
            paths.forEach((path)=>{
                domains.forEach((domain)=>{
                    const domainStr = domain ? `domain=${domain};` : '';
                    document.cookie = `${name}=; ${domainStr}path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
                });
            });
        });
        console.info('[auth-session] Cleared auth cookies:', authCookieNames);
    }
    /**
   * Clear all auth data - localStorage, sessionStorage, and cookies
   * This is the most comprehensive cleanup and should be used before re-authentication
   */ clearAllAuthData() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        console.info('[auth-session] Clearing ALL auth data (storage + cookies)');
        // Clear storage
        removeAuthKeys(window.localStorage);
        removeAuthKeys(window.sessionStorage);
        // Clear cookies
        this.clearAuthCookies();
    }
    /**
   * Force sign out by clearing all auth-related storage
   * Used during logout to ensure clean state
   */ forceSignOut() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        console.info('[auth-session] Force sign out - clearing all auth state');
        // Clear all local auth data
        this.clearAllAuthData();
        // Call logout API to clear server-side session
        void fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        }).catch((error)=>{
            console.error('[auth-session] Failed to revoke server session', error);
        });
    }
    /**
   * Handle storage changes from other tabs
   * If auth keys are removed in another tab, redirect to login
   */ handleStorageChange = (event)=>{
        if (event.key && AUTH_KEY_HINTS.some((hint)=>event.key?.includes(hint)) && event.newValue === null) {
            console.info('[auth-session] Auth state cleared in another tab, redirecting to login');
            window.location.href = '/versotech_main/login?error=signed_out';
        }
    };
    /**
   * Mark session as authenticated
   * This is called after successful login to update session state
   */ markAuthenticated() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        console.info('[auth-session] Session marked as authenticated');
    }
    /**
   * Get debug information about current session state
   * Useful for troubleshooting auth issues
   */ getDebugInfo() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return {
            localStorageKeys: Object.keys(localStorage).filter((key)=>AUTH_KEY_HINTS.some((hint)=>key.includes(hint))),
            sessionStorageKeys: Object.keys(sessionStorage).filter((key)=>AUTH_KEY_HINTS.some((hint)=>key.includes(hint)))
        };
    }
}
const sessionManager = SessionManager.getInstance();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/versotech-portal/src/app/auth-init.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthInit",
    ()=>AuthInit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$session$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/src/lib/session-manager.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function AuthInit() {
    _s();
    const [isClient, setIsClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthInit.useEffect": ()=>{
            setIsClient(true);
            // Only initialize on client side
            if ("TURBOPACK compile-time truthy", 1) {
                try {
                    // Initialize aggressive session management
                    __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$session$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sessionManager"].init();
                    // Debug info
                    if ("TURBOPACK compile-time truthy", 1) {
                        console.log('[auth-session] Debug info:', __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$src$2f$lib$2f$session$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sessionManager"].getDebugInfo());
                    }
                } catch (error) {
                    console.error('[auth-session] Initialization error:', error);
                }
            }
        }
    }["AuthInit.useEffect"], []);
    // Prevent hydration mismatch by not rendering anything until client-side
    if (!isClient) {
        return null;
    }
    return null // This component renders nothing
    ;
}
_s(AuthInit, "k460N28PNzD7zo1YW47Q9UigQis=");
_c = AuthInit;
var _c;
__turbopack_context__.k.register(_c, "AuthInit");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/versotech-portal/src/app/auth-init.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/versotech-portal/src/app/auth-init.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=versotech-portal_src_676ef566._.js.map