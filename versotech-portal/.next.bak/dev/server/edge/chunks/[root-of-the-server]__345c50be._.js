(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__345c50be._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/versotech-portal/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@supabase/ssr/dist/module/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
;
async function middleware(request) {
    const { pathname } = request.nextUrl;
    let supabaseResponse = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request
    });
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://ipguxdssecfexudnvtia.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjE4MzcsImV4cCI6MjA3MzkzNzgzN30.AGxM_YW9hfxuu7xDpi_4xhOoRhYM7iGTS1vJ0z2FByE"), {
        cookies: {
            getAll () {
                return request.cookies.getAll();
            },
            setAll (cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options })=>request.cookies.set(name, value));
                supabaseResponse = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
                    request
                });
                cookiesToSet.forEach(({ name, value, options })=>supabaseResponse.cookies.set(name, value, options));
            }
        }
    });
    try {
        // Skip middleware for static files, API routes, and public pages
        if (pathname.startsWith('/_next/static') || pathname.startsWith('/_next/image') || pathname.startsWith('/favicon.ico') || pathname.startsWith('/api/') || pathname === '/auth/callback' || pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)) {
            return supabaseResponse;
        }
        // =========================================================================
        // LEGACY URL REDIRECTS (301 Permanent)
        // Phase 2 migration: Old portal URLs → New unified portal URLs
        // =========================================================================
        // Helper to create 301 redirect preserving query params
        const createLegacyRedirect = (newPath)=>{
            const url = new URL(request.url);
            url.pathname = newPath;
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url, {
                status: 301
            });
        };
        // --- Investor Portal Redirects (/versoholdings/* → /versotech_main/*) ---
        // Login/Auth
        if (pathname === '/versoholdings/login') {
            return createLegacyRedirect('/versotech_main/login');
        }
        if (pathname === '/versoholdings/set-password') {
            return createLegacyRedirect('/versotech_main/set-password');
        }
        // Dashboard
        if (pathname === '/versoholdings/dashboard') {
            return createLegacyRedirect('/versotech_main/dashboard');
        }
        // Deals → Opportunities (renamed)
        if (pathname === '/versoholdings/deals') {
            return createLegacyRedirect('/versotech_main/opportunities');
        }
        // Dynamic deal route
        if (pathname.match(/^\/versoholdings\/deal\/([^/]+)$/)) {
            const dealId = pathname.split('/')[3];
            return createLegacyRedirect(`/versotech_main/opportunities/${dealId}`);
        }
        // Data Rooms → Opportunities (integrated)
        if (pathname === '/versoholdings/data-rooms') {
            return createLegacyRedirect('/versotech_main/opportunities');
        }
        if (pathname.match(/^\/versoholdings\/data-rooms\/([^/]+)$/)) {
            const dealId = pathname.split('/')[3];
            return createLegacyRedirect(`/versotech_main/opportunities/${dealId}`);
        }
        // Holdings → Portfolio (renamed)
        if (pathname === '/versoholdings/holdings') {
            return createLegacyRedirect('/versotech_main/portfolio');
        }
        // Vehicle detail → Portfolio detail
        if (pathname.match(/^\/versoholdings\/vehicle\/([^/]+)$/)) {
            const vehicleId = pathname.split('/')[3];
            return createLegacyRedirect(`/versotech_main/portfolio/${vehicleId}`);
        }
        // Tasks/Notifications → Dashboard (moved to header)
        if (pathname === '/versoholdings/tasks') {
            return createLegacyRedirect('/versotech_main/tasks');
        }
        if (pathname === '/versoholdings/notifications') {
            return createLegacyRedirect('/versotech_main/notifications');
        }
        // Messages → Inbox
        if (pathname === '/versoholdings/messages') {
            return createLegacyRedirect('/versotech_main/messages');
        }
        // Reports → Documents (renamed)
        if (pathname === '/versoholdings/reports') {
            return createLegacyRedirect('/versotech_main/documents');
        }
        if (pathname === '/versoholdings/documents') {
            return createLegacyRedirect('/versotech_main/documents');
        }
        // Profile
        if (pathname === '/versoholdings/profile') {
            return createLegacyRedirect('/versotech_main/profile');
        }
        // --- Staff Portal Redirects (/versotech/staff/* → /versotech_main/*) ---
        // Login
        if (pathname === '/versotech/login') {
            return createLegacyRedirect('/versotech_main/login');
        }
        // Staff dashboard
        if (pathname === '/versotech/staff' || pathname === '/versotech/staff/') {
            return createLegacyRedirect('/versotech_main/dashboard');
        }
        // Deals management
        if (pathname === '/versotech/staff/deals') {
            return createLegacyRedirect('/versotech_main/deals');
        }
        if (pathname === '/versotech/staff/deals/new') {
            return createLegacyRedirect('/versotech_main/deals/new');
        }
        if (pathname.match(/^\/versotech\/staff\/deals\/([^/]+)$/)) {
            const dealId = pathname.split('/')[4];
            return createLegacyRedirect(`/versotech_main/deals/${dealId}`);
        }
        // Investors management → Users with type filter
        if (pathname === '/versotech/staff/investors') {
            const url = new URL(request.url);
            url.pathname = '/versotech_main/investors';
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url, {
                status: 301
            });
        }
        if (pathname.match(/^\/versotech\/staff\/investors\/([^/]+)$/)) {
            const investorId = pathname.split('/')[4];
            const url = new URL(request.url);
            url.pathname = `/versotech_main/investors/${investorId}`;
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url, {
                status: 301
            });
        }
        // Arrangers management
        if (pathname === '/versotech/staff/arrangers') {
            return createLegacyRedirect('/versotech_main/arrangers');
        }
        if (pathname.match(/^\/versotech\/staff\/arrangers\/([^/]+)$/)) {
            const arrangerId = pathname.split('/')[4];
            return createLegacyRedirect(`/versotech_main/arrangers/${arrangerId}`);
        }
        // Introducers management
        if (pathname === '/versotech/staff/introducers') {
            return createLegacyRedirect('/versotech_main/introducers');
        }
        if (pathname.match(/^\/versotech\/staff\/introducers\/([^/]+)$/)) {
            const introducerId = pathname.split('/')[4];
            return createLegacyRedirect(`/versotech_main/introducers/${introducerId}`);
        }
        // Approvals → Inbox with tab
        if (pathname === '/versotech/staff/approvals') {
            const url = new URL(request.url);
            url.pathname = '/versotech_main/approvals';
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url, {
                status: 301
            });
        }
        // Messages → Inbox with tab
        if (pathname === '/versotech/staff/messages') {
            return createLegacyRedirect('/versotech_main/messages');
        }
        // Fees
        if (pathname === '/versotech/staff/fees') {
            return createLegacyRedirect('/versotech_main/fees');
        }
        // KYC Review
        if (pathname === '/versotech/staff/kyc-review') {
            return createLegacyRedirect('/versotech_main/kyc-review');
        }
        // VersoSign
        if (pathname === '/versotech/staff/versosign') {
            return createLegacyRedirect('/versotech_main/versosign');
        }
        // Audit
        if (pathname === '/versotech/staff/audit') {
            return createLegacyRedirect('/versotech_main/audit');
        }
        // Reconciliation
        if (pathname === '/versotech/staff/reconciliation') {
            return createLegacyRedirect('/versotech_main/reconciliation');
        }
        // Subscriptions
        if (pathname === '/versotech/staff/subscriptions') {
            return createLegacyRedirect('/versotech_main/subscriptions');
        }
        if (pathname === '/versotech/staff/subscriptions/vehicle-summary') {
            return createLegacyRedirect('/versotech_main/subscriptions/vehicle-summary');
        }
        // Documents
        if (pathname === '/versotech/staff/documents') {
            return createLegacyRedirect('/versotech_main/documents');
        }
        // Entities
        if (pathname === '/versotech/staff/entities') {
            return createLegacyRedirect('/versotech_main/entities');
        }
        if (pathname.match(/^\/versotech\/staff\/entities\/([^/]+)$/)) {
            const entityId = pathname.split('/')[4];
            return createLegacyRedirect(`/versotech_main/entities/${entityId}`);
        }
        // Calendar
        if (pathname === '/versotech/staff/calendar') {
            return createLegacyRedirect('/versotech_main/calendar');
        }
        // Admin → Admin portal
        if (pathname === '/versotech/staff/admin') {
            return createLegacyRedirect('/versotech_main/admin');
        }
        // Processes
        if (pathname === '/versotech/staff/processes') {
            return createLegacyRedirect('/versotech_admin/processes');
        }
        // =========================================================================
        // END LEGACY URL REDIRECTS
        // =========================================================================
        // Skip auth check if there's a confirmation code - let the client handle it
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        if (code || error) {
            console.log('[middleware] Auth code/error detected, skipping auth check:', {
                code: code?.substring(0, 8) + '...',
                error
            });
            // If there's an error param (like session_expired), clear cookies to prevent loops
            if (error) {
                console.log('[middleware] Clearing cookies due to error param:', error);
                // Redirect to same URL without error param to break the cycle
                const cleanUrl = new URL(request.url);
                cleanUrl.searchParams.delete('error');
                cleanUrl.searchParams.delete('code');
                const response = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(cleanUrl);
                // Delete Supabase auth cookies using correct names (project-specific)
                // NEW production database: kagzryotbbnusdcyvqei
                response.cookies.delete('sb-kagzryotbbnusdcyvqei-auth-token');
                response.cookies.delete('sb-kagzryotbbnusdcyvqei-auth-token-code-verifier');
                // Also set to empty as fallback
                response.cookies.set('sb-kagzryotbbnusdcyvqei-auth-token', '', {
                    maxAge: 0,
                    path: '/'
                });
                response.cookies.set('sb-kagzryotbbnusdcyvqei-auth-token-code-verifier', '', {
                    maxAge: 0,
                    path: '/'
                });
                return response;
            }
            return supabaseResponse;
        }
        // Public routes that don't require authentication
        const publicRoutes = [
            '/',
            '/versoholdings/login',
            '/versotech/login',
            '/versotech_main/login',
            '/versotech_main/set-password',
            '/versotech_main/reset-password',
            '/logout',
            '/invitation/accept' // Allow unauthenticated access for new user invitations
        ];
        const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/sign/');
        const isLoginRoute = pathname === '/versoholdings/login' || pathname === '/versotech/login' || pathname === '/versotech_main/login';
        // Step 1: Use getUser() for authenticated validation (recommended by Supabase)
        // This contacts the Supabase Auth server to validate the session, ensuring authenticity
        let user = null;
        let authError = null;
        const { data: { user: validatedUser }, error: userError } = await supabase.auth.getUser();
        if (userError) {
            // Check if token needs refresh
            if (userError.message?.includes('token') || userError.message?.includes('expired')) {
                console.log('[middleware] Token validation failed, attempting refresh...');
                // Attempt to refresh the session with retry logic for transient failures
                let refreshAttempts = 0;
                let refreshedSession = null;
                let refreshError = null;
                while(refreshAttempts < 3){
                    const { data, error } = await supabase.auth.refreshSession();
                    if (!error && data.session) {
                        refreshedSession = data.session;
                        console.log('[middleware] Token refreshed successfully', refreshAttempts > 0 ? `(after ${refreshAttempts + 1} attempts)` : '');
                        break;
                    }
                    refreshError = error;
                    refreshAttempts++;
                    // Don't retry on permanent errors
                    if (error?.message?.includes('Invalid Refresh Token') || error?.message?.includes('already been used')) {
                        console.warn('[middleware] Permanent refresh error, not retrying:', error.message);
                        break;
                    }
                    if (refreshAttempts < 3) {
                        console.warn(`[middleware] Token refresh attempt ${refreshAttempts} failed, retrying...`, error?.message);
                        // Exponential backoff: 100ms, 200ms, 400ms
                        await new Promise((resolve)=>setTimeout(resolve, 100 * Math.pow(2, refreshAttempts - 1)));
                    }
                }
                if (refreshError) {
                    console.warn('[middleware] Token refresh failed after retries:', refreshError.message);
                    authError = refreshError;
                } else if (refreshedSession) {
                    user = refreshedSession.user;
                }
            } else {
                console.warn('[middleware] User validation failed:', userError.message);
                authError = userError;
            }
        } else {
            user = validatedUser;
        }
        // Step 4: Handle authentication failure
        const isRefreshTokenError = authError && (authError.message?.includes('refresh') || authError.message?.includes('Invalid Refresh Token') || authError.message?.includes('already been used'));
        if (isRefreshTokenError && authError) {
            console.log('[middleware] Refresh token error detected, clearing session:', authError.message);
            // TODO: Add monitoring/alerting here for production - this should be RARE with the fixes
            // Example: Sentry.captureException(authError, { tags: { type: 'refresh_token_already_used' } })
            // Clear the invalid session
            await supabase.auth.signOut({
                scope: 'local'
            });
            // Only redirect if not already on a public route
            if (!isPublicRoute) {
                const response = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versotech_main/login?error=session_expired', request.url));
                // NEW production database: kagzryotbbnusdcyvqei
                response.cookies.delete('sb-kagzryotbbnusdcyvqei-auth-token');
                response.cookies.delete('sb-kagzryotbbnusdcyvqei-auth-token-code-verifier');
                response.cookies.set('sb-kagzryotbbnusdcyvqei-auth-token', '', {
                    maxAge: 0,
                    path: '/'
                });
                response.cookies.set('sb-kagzryotbbnusdcyvqei-auth-token-code-verifier', '', {
                    maxAge: 0,
                    path: '/'
                });
                return response;
            }
        }
        if (authError || !user) {
            if (isPublicRoute) {
                const response = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
                    request
                });
                if (isLoginRoute) {
                    // NEW production database: kagzryotbbnusdcyvqei
                    response.cookies.delete('sb-kagzryotbbnusdcyvqei-auth-token');
                    response.cookies.delete('sb-kagzryotbbnusdcyvqei-auth-token-code-verifier');
                    response.cookies.set('sb-kagzryotbbnusdcyvqei-auth-token', '', {
                        maxAge: 0,
                        path: '/'
                    });
                    response.cookies.set('sb-kagzryotbbnusdcyvqei-auth-token-code-verifier', '', {
                        maxAge: 0,
                        path: '/'
                    });
                }
                return response;
            }
            console.log('[auth] Authentication failed:', authError?.message || 'No user found');
            // Unified login - all unauthenticated users go to the same login
            const redirectUrl = new URL('/versotech_main/login?error=auth_required', request.url);
            const response = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl);
            // NEW production database: kagzryotbbnusdcyvqei
            response.cookies.delete('sb-kagzryotbbnusdcyvqei-auth-token');
            response.cookies.delete('sb-kagzryotbbnusdcyvqei-auth-token-code-verifier');
            response.cookies.set('sb-kagzryotbbnusdcyvqei-auth-token', '', {
                maxAge: 0,
                path: '/'
            });
            response.cookies.set('sb-kagzryotbbnusdcyvqei-auth-token-code-verifier', '', {
                maxAge: 0,
                path: '/'
            });
            return response;
        }
        console.log('🔍 User authenticated:', {
            userId: user.id,
            email: user.email,
            pathname: pathname
        });
        if (isPublicRoute) {
            return supabaseResponse;
        }
        // This check is now handled above - user is guaranteed to exist here
        // Get user profile for role-based access control
        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        // Handle profile fetch errors - distinguish between permanent and transient failures
        if (profileError || !profile) {
            // PGRST116 = Profile record not found (permanent error - user needs to be signed out)
            if (profileError?.code === 'PGRST116' || !profile) {
                console.error('[auth] Profile not found for authenticated user (permanent error):', {
                    userId: user.id,
                    error: profileError
                });
                await supabase.auth.signOut();
                // Redirect to unified login
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versotech_main/login?error=profile_not_found', request.url));
            } else {
                // Transient database error (connection timeout, etc.) - return 500, don't sign out
                console.error('[auth] Transient database error fetching profile:', {
                    userId: user.id,
                    error: profileError,
                    errorCode: profileError?.code
                });
                // TODO: Add monitoring/alerting here for production
                // Example: Sentry.captureException(profileError, { tags: { type: 'profile_fetch_failure' } })
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Database error. Please try again.'
                }, {
                    status: 500
                });
            }
        }
        const effectiveProfile = profile;
        // =========================================================================
        // ROLE-BASED & PERSONA-BASED ACCESS CONTROL
        // =========================================================================
        // Architecture:
        // - MIDDLEWARE: Handles authentication and persona-based route access
        // - LAYOUTS: Still enforce persona requirements and load full persona context
        //   - versotech_main/layout.tsx: Requires at least one persona
        //   - versotech_admin/layout.tsx: Requires CEO persona (staff + role_in_entity='ceo')
        // - SIDEBAR: Filters navigation items by active persona (users only see relevant routes)
        // - DATA QUERIES: Filter by actual entity relationships (security layer)
        //
        // This separation ensures:
        // 1. Fast middleware (no persona DB calls)
        // 2. Clean authorization in layouts (one place to maintain)
        // 3. Defense in depth (data queries enforce final access)
        // =========================================================================
        const isUnifiedRoute = pathname.startsWith('/versotech_main');
        const isAdminRoute = pathname.startsWith('/versotech_admin');
        let personaTypes = new Set();
        let isCEO = false;
        const isProfileCEO = effectiveProfile.role === 'ceo' || effectiveProfile.role === 'staff_admin';
        if (isUnifiedRoute || isAdminRoute) {
            const { data: personas, error: personaError } = await supabase.rpc('get_user_personas', {
                p_user_id: user.id
            });
            if (personaError) {
                console.warn('[middleware] Persona lookup failed, falling back to profile role:', personaError.message);
            } else if (Array.isArray(personas)) {
                personaTypes = new Set(personas.map((persona)=>persona.persona_type));
                // isCEO grants access to CEO-only sections (/versotech_admin, sensitive reports, etc.)
                // DESIGN DECISION: Both 'ceo' persona AND 'staff_admin' role get CEO-level access.
                // This is intentional - staff_admin users are system administrators who need
                // full platform access. If stricter separation is needed in the future,
                // create a separate 'isSystemAdmin' check or restrict staff_admin from this check.
                isCEO = personas.some((persona)=>persona.persona_type === 'ceo' || persona.persona_type === 'staff' && persona.role_in_entity === 'staff_admin' // staff_admin also gets CEO access
                );
            }
            if (personaTypes.size === 0) {
                const roleToPersona = {
                    investor: 'investor',
                    arranger: 'arranger',
                    introducer: 'introducer',
                    partner: 'partner',
                    commercial_partner: 'commercial_partner',
                    lawyer: 'lawyer',
                    ceo: 'staff',
                    staff_admin: 'staff',
                    staff_ops: 'staff',
                    staff_rm: 'staff'
                };
                const fallbackPersona = roleToPersona[effectiveProfile.role];
                if (fallbackPersona) {
                    personaTypes.add(fallbackPersona);
                }
                // CEO fallback: ceo or staff_admin role
                if (effectiveProfile.role === 'ceo' || effectiveProfile.role === 'staff_admin') {
                    isCEO = true;
                }
            }
            if (isProfileCEO) {
                isCEO = true;
                personaTypes.add('ceo');
            }
            if (personaTypes.size === 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versotech_main/login?error=no_personas', request.url));
            }
            supabaseResponse.cookies.set('verso_personas', JSON.stringify({
                types: Array.from(personaTypes),
                isCEO
            }), {
                httpOnly: true,
                sameSite: 'lax',
                path: '/'
            });
            const hasPersona = (personaType)=>personaTypes.has(personaType);
            const hasAnyPersona = (allowed)=>allowed.some((type)=>personaTypes.has(type));
            const matchesPrefix = (prefixes)=>prefixes.some((prefix)=>pathname.startsWith(prefix));
            const ceoOnlyPaths = [
                '/versotech_admin',
                '/versotech_main/kyc-review',
                '/versotech_main/fees',
                '/versotech_main/reconciliation',
                '/versotech_main/audit',
                '/versotech_main/users',
                '/versotech_main/admin'
            ];
            const staffPaths = [
                '/versotech_main/deals',
                '/versotech_main/subscriptions',
                '/versotech_main/investors',
                '/versotech_main/entities',
                '/versotech_main/approvals',
                '/versotech_main/requests',
                '/versotech_main/introducers',
                '/versotech_main/arrangers'
            ];
            const investorAccessPaths = [
                '/versotech_main/opportunities',
                '/versotech_main/portfolio'
            ];
            const arrangerPaths = [
                '/versotech_main/my-mandates',
                '/versotech_main/my-partners',
                '/versotech_main/my-introducers',
                '/versotech_main/my-commercial-partners',
                '/versotech_main/my-lawyers',
                '/versotech_main/fee-plans',
                '/versotech_main/payment-requests',
                '/versotech_main/arranger-profile'
            ];
            const introducerPaths = [
                '/versotech_main/introductions',
                '/versotech_main/introducer-agreements'
            ];
            const partnerPaths = [
                '/versotech_main/partner-transactions',
                '/versotech_main/shared-transactions'
            ];
            const commercialPartnerPaths = [
                '/versotech_main/client-transactions',
                '/versotech_main/placement-agreements'
            ];
            const lawyerPaths = [
                '/versotech_main/assigned-deals'
            ];
            // Paths accessible by both lawyers and arrangers
            const lawyerAndArrangerPaths = [
                '/versotech_main/escrow',
                '/versotech_main/subscription-packs',
                '/versotech_main/lawyer-reconciliation'
            ];
            if (matchesPrefix(ceoOnlyPaths) && !isCEO) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versotech_main/dashboard', request.url));
            }
            // CEO users have full access to staff paths (they have 'ceo' persona, not 'staff')
            if (matchesPrefix(staffPaths) && !hasAnyPersona([
                'staff',
                'ceo'
            ])) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versotech_main/dashboard', request.url));
            }
            // Allow all personas that need to view opportunities/deals:
            // - investors, partners, introducers, commercial_partners (core investor personas)
            // - lawyers (need to view deals for escrow/compliance)
            // - arrangers (need to view deals they're managing)
            if (matchesPrefix(investorAccessPaths) && !hasAnyPersona([
                'investor',
                'partner',
                'introducer',
                'commercial_partner',
                'lawyer',
                'arranger'
            ])) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versotech_main/dashboard', request.url));
            }
            if (matchesPrefix(arrangerPaths) && !hasPersona('arranger')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versotech_main/dashboard', request.url));
            }
            if (matchesPrefix(introducerPaths) && !hasAnyPersona([
                'introducer',
                'staff',
                'ceo'
            ])) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versotech_main/dashboard', request.url));
            }
            if (matchesPrefix(partnerPaths) && !hasPersona('partner')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versotech_main/dashboard', request.url));
            }
            if (matchesPrefix(commercialPartnerPaths) && !hasPersona('commercial_partner')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versotech_main/dashboard', request.url));
            }
            if (matchesPrefix(lawyerPaths) && !hasPersona('lawyer')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versotech_main/dashboard', request.url));
            }
            if (matchesPrefix(lawyerAndArrangerPaths) && !hasAnyPersona([
                'lawyer',
                'arranger'
            ])) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versotech_main/dashboard', request.url));
            }
            console.log(`✅ Access granted (persona-checked): ${user.email} → ${pathname}`);
            return supabaseResponse;
        }
        // LEGACY: Old investor portal routes
        if (pathname.startsWith('/versoholdings') && effectiveProfile.role !== 'investor') {
            // Staff user trying to access investor portal
            if ([
                'staff_admin',
                'staff_ops',
                'staff_rm',
                'ceo'
            ].includes(effectiveProfile.role)) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versotech/staff', request.url));
            }
            // Unknown role, redirect to investor login
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versoholdings/login', request.url));
        }
        // LEGACY: Old staff portal routes
        // CRITICAL FIX: Use '/versotech/' (with trailing slash) to avoid matching '/versotech_main/*'
        // The old check used '/versotech' which incorrectly matched '/versotech_main/dashboard' because
        // '/versotech_main'.startsWith('/versotech') === true
        if (pathname.startsWith('/versotech/staff') || pathname.startsWith('/versotech/') && !pathname.startsWith('/versotech/login')) {
            // Only staff roles can access staff portal
            if (![
                'staff_admin',
                'staff_ops',
                'staff_rm',
                'ceo'
            ].includes(effectiveProfile.role)) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/versoholdings/dashboard', request.url));
            }
        }
        console.log(`✅ Access granted: ${user.email} (${effectiveProfile.role}) → ${pathname}`);
        return supabaseResponse;
    } catch (error) {
        console.error('Middleware error:', error);
        // On error, redirect to login WITH error indicator so we can debug
        const errorMessage = error instanceof Error ? error.message : 'unknown';
        console.error('Middleware error details:', errorMessage);
        return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(`/versotech_main/login?error=middleware_error&detail=${encodeURIComponent(errorMessage.substring(0, 100))}`, request.url));
    }
}
const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__345c50be._.js.map