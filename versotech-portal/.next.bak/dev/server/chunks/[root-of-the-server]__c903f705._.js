module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/versotech-portal/src/app/api/auth/signin/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/versotech-portal/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
;
;
const STAFF_ROLES = [
    'staff_admin',
    'staff_ops',
    'staff_rm',
    'ceo'
];
const STAFF_DOMAINS = [
    '@versotech.com',
    '@verso.com'
];
const isStaffRole = (role)=>{
    return !!role && STAFF_ROLES.includes(role);
};
const isStaffEmail = (email)=>{
    if (!email) return false;
    const lowered = email.toLowerCase();
    return STAFF_DOMAINS.some((domain)=>lowered.endsWith(domain));
};
const deriveDisplayName = (user)=>{
    const metadata = user.user_metadata ?? {};
    if (typeof metadata === 'object' && metadata !== null) {
        const fullName = metadata.full_name;
        if (typeof fullName === 'string' && fullName.trim()) {
            return fullName;
        }
        const displayName = metadata.display_name;
        if (typeof displayName === 'string' && displayName.trim()) {
            return displayName;
        }
    }
    if (user.email) {
        const [localPart] = user.email.split('@');
        if (localPart) return localPart;
    }
    return 'User';
};
/**
 * Resolves the default role for a new user during sign-in.
 *
 * DESIGN DECISION (Unified Portal - Phase 2):
 * Staff auto-provisioning by company email is DISABLED in the unified portal.
 * All staff members must be invited by administrators via the User Management UI.
 * This provides better security and audit trails for staff account creation.
 *
 * The company email auto-provisioning logic below only works if portal='staff',
 * but the unified portal login always sends portal='investor'. This is intentional.
 *
 * Staff can still sign in normally after being invited - this function only affects
 * NEW users who don't have a profile yet.
 */ const resolveDefaultRole = (portal, metadataRole, email)=>{
    // SECURITY: Never trust metadataRole for staff roles
    // Staff roles should ONLY come from:
    // 1. Admin-created profiles (invitation flow)
    // 2. Company email domain validation (legacy, disabled in unified portal)
    if (portal === 'staff') {
        // Legacy staff portal: auto-provision by company email domain
        // NOTE: This path is not used in the unified portal (portal is always 'investor')
        if (isStaffEmail(email)) {
            return 'staff_ops';
        }
        // DENY - non-company email trying to access staff portal
        return null;
    }
    // Unified portal: always default to investor for new users
    // Staff must be pre-invited by administrators
    return 'investor';
};
async function POST(request) {
    // Create a response that we'll set cookies on
    // This is required because cookies().set() doesn't reliably work in Route Handlers
    let response = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: false
    });
    try {
        const body = await request.json();
        const email = typeof body.email === 'string' ? body.email : '';
        const password = typeof body.password === 'string' ? body.password : '';
        const portalContext = typeof body.portal === 'string' ? body.portal : 'investor';
        if (!email || !password) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Email and password are required'
            }, {
                status: 400
            });
        }
        // Create Supabase client that sets cookies DIRECTLY on the response
        // This pattern is required for Route Handlers (unlike Server Components)
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://ipguxdssecfexudnvtia.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjE4MzcsImV4cCI6MjA3MzkzNzgzN30.AGxM_YW9hfxuu7xDpi_4xhOoRhYM7iGTS1vJ0z2FByE"), {
            cookies: {
                getAll () {
                    return request.cookies.getAll();
                },
                setAll (cookiesToSet) {
                    // Set cookies on the response object
                    cookiesToSet.forEach(({ name, value, options })=>{
                        response.cookies.set(name, value, options);
                    });
                }
            }
        });
        // Clear any existing session first to prevent conflicts
        // This is critical for fixing "Invalid Refresh Token" errors on re-login
        try {
            await supabase.auth.signOut({
                scope: 'local'
            });
        } catch (signOutError) {
            console.warn('[signin] Pre-signin signOut warning (non-fatal):', signOutError);
        // Non-fatal, continue with sign-in
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            console.error('[signin] Supabase sign-in error:', {
                message: error.message,
                status: error.status,
                name: error.name
            });
            // Provide specific error messages based on error type
            if (error.message?.toLowerCase().includes('invalid login credentials')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Invalid email or password. Please check your credentials and try again.'
                }, {
                    status: 401
                });
            }
            if (error.message?.toLowerCase().includes('email not confirmed')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Please confirm your email address before signing in.'
                }, {
                    status: 403
                });
            }
            if (error.message?.toLowerCase().includes('refresh') || error.message?.toLowerCase().includes('session')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Session conflict detected. Please try again.'
                }, {
                    status: 409
                });
            }
            if (error.message?.toLowerCase().includes('rate limit') || error.message?.toLowerCase().includes('too many')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Too many login attempts. Please wait a moment and try again.'
                }, {
                    status: 429
                });
            }
            // Generic error for unknown cases
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Authentication failed. Please try again or contact support if the problem persists.',
                debug: ("TURBOPACK compile-time truthy", 1) ? error.message : "TURBOPACK unreachable"
            }, {
                status: 401
            });
        }
        if (!data.user) {
            await supabase.auth.signOut();
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Authentication failed - no user data'
            }, {
                status: 401
            });
        }
        if (!data.session) {
            await supabase.auth.signOut();
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Email verification required. Please confirm your email before signing in.'
            }, {
                status: 403
            });
        }
        const user = data.user;
        const userEmail = user.email?.toLowerCase() ?? null;
        const metadataRole = typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : null;
        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        let resolvedProfile = profile ?? null;
        if (profileError && profileError.code === 'PGRST116' || !profile) {
            const defaultRole = resolveDefaultRole(portalContext, metadataRole, userEmail);
            if (!defaultRole) {
                await supabase.auth.signOut();
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Staff access required. Please contact an administrator.'
                }, {
                    status: 403
                });
            }
            const displayName = deriveDisplayName(user);
            const { data: createdProfile, error: upsertError } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                role: defaultRole,
                display_name: displayName,
                created_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            }).select('*').single();
            if (upsertError || !createdProfile) {
                console.error('Signin profile upsert error:', upsertError);
                await supabase.auth.signOut();
                return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'User profile could not be created'
                }, {
                    status: 500
                });
            }
            resolvedProfile = createdProfile;
        } else if (profileError) {
            console.error('Signin profile fetch error:', profileError);
            await supabase.auth.signOut();
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to load user profile'
            }, {
                status: 500
            });
        }
        if (!resolvedProfile) {
            await supabase.auth.signOut();
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User profile not found'
            }, {
                status: 404
            });
        }
        // Unified portal: all users go to /versotech_main/dashboard
        // The layout handles persona-based routing and access control
        let redirectPath = '/versotech_main/dashboard';
        // Staff portal context check is no longer needed since we have unified access
        // Keep backward compatibility: staff role users coming from old staff login
        if (portalContext === 'staff' && !isStaffRole(resolvedProfile.role)) {
            await supabase.auth.signOut();
            return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Staff access required. This account has investor-level access.'
            }, {
                status: 403
            });
        }
        // Create the success response with all the data
        // Cookies have already been set on `response` by Supabase's setAll() callback
        const successData = {
            success: true,
            redirect: redirectPath,
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at
            },
            user: {
                id: user.id,
                email: user.email,
                role: resolvedProfile.role,
                displayName: resolvedProfile.display_name
            }
        };
        // Create new response with success data but PRESERVE the cookies from setAll
        const successResponse = __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(successData);
        // Copy all cookies from the response that setAll populated
        response.cookies.getAll().forEach((cookie)=>{
            successResponse.cookies.set(cookie.name, cookie.value);
        });
        return successResponse;
    } catch (error) {
        console.error('Signin error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$versotech$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c903f705._.js.map