module.exports=[120635,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},918622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},556704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},832319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},324725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},270406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},193695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},433669,e=>{"use strict";e.i(814247);var t=e.i(150615),r=e.i(12049),a=e.i(57824);let s=async()=>{let e=await (0,a.cookies)();return(0,t.createServerClient)("https://ipguxdssecfexudnvtia.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjE4MzcsImV4cCI6MjA3MzkzNzgzN30.AGxM_YW9hfxuu7xDpi_4xhOoRhYM7iGTS1vJ0z2FByE",{cookies:{getAll:()=>e.getAll(),setAll(t){try{t.forEach(({name:t,value:r,options:a})=>{e.set(t,r,a)})}catch(e){}}}})};e.s(["createClient",0,s,"createServiceClient",0,()=>(0,r.createClient)("https://ipguxdssecfexudnvtia.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:!1,persistSession:!1}})])},911357,e=>{"use strict";var t=e.i(433669);class r{static instance;static getInstance(){return r.instance||(r.instance=new r),r.instance}async log(e){try{let r=await (0,t.createClient)();await r.from("audit_logs").insert({event_type:"system",actor_id:e.actor_user_id||null,action:e.action,entity_type:e.entity,entity_id:e.entity_id||null,action_details:e.metadata||null,timestamp:new Date().toISOString()})}catch(e){console.error("Audit logging failed:",e)}}async logMany(e){for(let t of e)await this.log(t)}}let a=r.getInstance();e.s(["AuditActions",0,{LOGIN:"login",LOGOUT:"logout",PASSWORD_CHANGE:"password_change",CREATE:"create",READ:"read",UPDATE:"update",DELETE:"delete",DOCUMENT_UPLOAD:"document_upload",DOCUMENT_DOWNLOAD:"document_download",DOCUMENT_DELETE:"document_delete",WORKFLOW_TRIGGER:"workflow_trigger",WORKFLOW_COMPLETED:"workflow_completed",WORKFLOW_FAILED:"workflow_failed",USER_CREATED:"user_created",PROFILE_UPDATED:"profile_updated",ROLE_CHANGED:"role_changed",SUBSCRIPTION_CREATED:"subscription_created",CAPITAL_CALL_CREATED:"capital_call_created",DISTRIBUTION_CREATED:"distribution_created",REPORT_REQUESTED:"report_requested",MESSAGE_SENT:"message_sent",COMMISSION_CREATED:"commission_created",COMMISSION_ACCRUED:"commission_accrued",COMMISSION_INVOICE_REQUESTED:"commission_invoice_requested",COMMISSION_INVOICED:"commission_invoiced",COMMISSION_PAID:"commission_paid",COMMISSION_CANCELLED:"commission_cancelled",AGREEMENT_CREATED:"agreement_created",AGREEMENT_SENT:"agreement_sent",AGREEMENT_APPROVED:"agreement_approved",AGREEMENT_SIGNED:"agreement_signed",AGREEMENT_ACTIVATED:"agreement_activated",AGREEMENT_REJECTED:"agreement_rejected",AGREEMENT_EXPIRED:"agreement_expired"},"AuditEntities",0,{USERS:"users",PROFILES:"profiles",INVESTORS:"investors",VEHICLES:"vehicles",SUBSCRIPTIONS:"subscriptions",POSITIONS:"positions",DOCUMENTS:"documents",WORKFLOWS:"workflows",WORKFLOW_RUNS:"workflow_runs",CONVERSATIONS:"conversations",MESSAGES:"messages",REQUEST_TICKETS:"request_tickets",CAPITAL_CALLS:"capital_calls",DISTRIBUTIONS:"distributions",DEALS:"deals",ALLOCATIONS:"allocations",FEE_EVENTS:"fee_events",INVOICES:"invoices",BANK_TRANSACTIONS:"bank_transactions",PAYMENTS:"payments",ARRANGER:"arranger_entities",INTRODUCER:"introducers",PARTNER:"partners",COMMERCIAL_PARTNER:"commercial_partners",FEE_PLANS:"arranger_fee_plans",CEO_ENTITY:"ceo_entity",CEO_USERS:"ceo_users",INTRODUCER_COMMISSIONS:"introducer_commissions",PARTNER_COMMISSIONS:"partner_commissions",COMMERCIAL_PARTNER_COMMISSIONS:"commercial_partner_commissions",INTRODUCER_AGREEMENTS:"introducer_agreements",PARTNER_AGREEMENTS:"partner_agreements",COMMERCIAL_PARTNER_AGREEMENTS:"commercial_partner_agreements",INTRODUCTIONS:"introductions"},"auditLogger",0,a])},221640,e=>{"use strict";async function t(e){let{data:{user:t},error:r}=await e.auth.getUser();return{user:t,error:r}}async function r(e,t){let{data:r}=await e.from("profiles").select("role").eq("id",t.id).single();return r?.role||null}async function a(e,t,r){let{data:a}=await e.from("profiles").select("role").eq("id",t).single();if(a?.role==="ceo")return!0;let{data:s}=await e.from("ceo_users").select("user_id").eq("user_id",t).maybeSingle();if(s)return!0;let{data:n}=await e.from("staff_permissions").select("permission").eq("user_id",t).in("permission",r).limit(1).maybeSingle();return!!n}async function s(e,t){return a(e,t,["super_admin"])}async function n(e,t){let a=await r(e,t);if(a&&(a.startsWith("staff_")||"ceo"===a))return!0;if("multi_persona"===a)try{let{data:r}=await e.rpc("get_user_personas",{p_user_id:t.id});if(r&&Array.isArray(r))return r.some(e=>"staff"===e.persona_type||"ceo"===e.persona_type)}catch(e){console.error("[isStaffUser] Error checking personas:",e)}return!1}e.s(["getAuthenticatedUser",()=>t,"hasPermission",()=>a,"isStaffUser",()=>n,"isSuperAdmin",()=>s])},898451,e=>{"use strict";let t=process.env.EMAIL_FROM||"VERSO <onboarding@resend.dev>",r=process.env.RESEND_API_KEY;async function a(e){try{if(!r||"re_your_resend_api_key_here"===r)return console.error("Resend API key not configured"),{success:!1,error:"Email service not configured. Please set RESEND_API_KEY environment variable."};if(r.startsWith("re_test_"))return console.error("Test API key detected - emails will not be delivered"),{success:!1,error:"Test API key cannot be used for sending real emails."};let a=e.from||t,s=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${r}`,"Content-Type":"application/json"},body:JSON.stringify({from:a,to:e.to,subject:e.subject,html:e.html})});if(!s.ok){let e=await s.text();return console.error("Resend API error:",e),{success:!1,error:`Email send failed: ${s.status} ${s.statusText}`}}let n=await s.json();return{success:!0,messageId:n.id}}catch(e){return console.error("Email sending error:",e),{success:!1,error:e.message||"Unknown email error"}}}async function s(e){let t=e.displayName||e.email.split("@")[0],r=`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 50px 40px;
      background: #ffffff;
    }
    .logo-container {
      text-align: center;
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 1px solid #f0f0f0;
    }
    .logo {
      font-family: 'League Spartan', Arial, Helvetica, sans-serif;
      font-size: 48px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #000000;
      text-transform: uppercase;
      margin: 0;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 30px;
    }
    .content {
      font-size: 15px;
      color: #333333;
    }
    .content p {
      margin-bottom: 20px;
    }
    .alert-box {
      background: #fef3cd;
      border-left: 4px solid #ffc107;
      padding: 15px 20px;
      margin: 25px 0;
      font-size: 14px;
    }
    .button-container {
      text-align: center;
      margin: 45px 0;
    }
    .button {
      display: inline-block;
      background: #000000;
      color: #ffffff !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .footer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #f0f0f0;
      font-size: 12px;
      color: #999999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-container">
      <div class="logo">VERSO</div>
    </div>

    <div class="greeting">Dear ${t},</div>

    <div class="content">
      <p>We received a request to reset the password for your VERSO account.</p>
      <p>Click the button below to create a new password. For security reasons, this link will expire in 1 hour.</p>
    </div>

    <div class="button-container">
      <a href="${e.resetUrl}" class="button">Reset Password</a>
    </div>

    <div class="content">
      <div class="alert-box">
        <strong>Didn't request this?</strong><br>
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </div>
      <p style="font-size: 13px; color: #666666;">If you're having trouble clicking the button, copy and paste the following link into your browser:</p>
      <p style="font-size: 12px; color: #999999; word-break: break-all;">${e.resetUrl}</p>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} VERSO. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;return a({to:e.email,subject:"Reset Your Password - VERSO",html:r})}async function n(e){let t="investor"===e.entityType,r="staff"===e.entityType||["staff_admin","staff_ops","staff_rm","ceo"].includes(e.role),s={staff_admin:"Staff Administrator",staff_ops:"Operations Staff",staff_rm:"Relationship Manager",ceo:"Chief Executive Officer",member:"Member",admin:"Administrator",owner:"Owner",signatory:"Authorized Signatory"}[e.role]||e.role,n=`
    <p>You have been invited to join <strong>${e.entityName}</strong> on the VERSO Investment Platform.</p>
    <p>This secure platform provides you with comprehensive access to your investment portfolio, performance analytics, and exclusive deal opportunities.</p>
    <p>Click the button below to set up your account and access the platform.</p>
  `,o=`
    <p>You have been invited to join <strong>VERSO</strong> as a <strong>${s}</strong>.</p>
    <p>As a member of the VERSO team, you'll have access to investor management, deal operations, and administrative tools.</p>
    <p>Click the button below to set up your password and access your dashboard.</p>
  `,i=`
    <p>You have been invited to join <strong>${e.entityName}</strong> on the VERSO Platform.</p>
    <p>This platform provides access to deal management, document processing, and collaboration tools for your organization.</p>
    <p>Click the button below to set up your account and get started.</p>
  `,l=`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 50px 40px;
      background: #ffffff;
    }
    .logo-container {
      text-align: center;
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 1px solid #f0f0f0;
    }
    .logo {
      font-family: 'League Spartan', Arial, Helvetica, sans-serif;
      font-size: 48px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #000000;
      text-transform: uppercase;
      margin: 0;
    }
    .content {
      font-size: 15px;
      color: #333333;
    }
    .content p {
      margin-bottom: 20px;
    }
    .button-container {
      text-align: center;
      margin: 45px 0;
    }
    .button {
      display: inline-block;
      background: #000000;
      color: #ffffff !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .footer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #f0f0f0;
      font-size: 12px;
      color: #999999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-container">
      <div class="logo">VERSO</div>
    </div>

    <div class="content">
      ${t?n:r?o:i}
    </div>

    <div class="button-container">
      <a href="${e.acceptUrl}" class="button">Accept Invitation</a>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} VERSO. All rights reserved.
    </div>
  </div>
</body>
</html>
  `,d=r?`Welcome to VERSO - You've been invited as ${s}`:`You've been invited to join ${e.entityName} on VERSO`;return a({to:e.email,subject:d,html:l})}r?"re_your_resend_api_key_here"===r?console.error("CRITICAL: RESEND_API_KEY cannot use example value in production. Please set a valid Resend API key."):r.startsWith("re_test_")&&console.error("CRITICAL: RESEND_API_KEY cannot use test key in production. Please set a valid production Resend API key."):console.error("CRITICAL: RESEND_API_KEY not configured in production"),e.s(["sendEmail",()=>a,"sendInvitationEmail",()=>n,"sendPasswordResetEmail",()=>s])},230211,e=>{"use strict";var t=e.i(779444),r=e.i(698261),a=e.i(821776),s=e.i(796417),n=e.i(856890),o=e.i(26996),i=e.i(436944),l=e.i(88281),d=e.i(765944),c=e.i(984788),p=e.i(237011),u=e.i(712007),f=e.i(777657),m=e.i(13180),E=e.i(273827),g=e.i(193695);e.i(947956);var _=e.i(36217),R=e.i(414131),h=e.i(433669),x=e.i(38896),y=e.i(221640),v=e.i(898451),S=e.i(911357);async function A(e,{params:t}){try{let e=await (0,x.getCurrentUser)();if(!e)return R.NextResponse.json({success:!1,error:"Unauthorized"},{status:401});let r=(0,h.createServiceClient)();if(!await (0,y.isSuperAdmin)(r,e.id))return R.NextResponse.json({success:!1,error:"Forbidden"},{status:403});let{id:a}=await t,{data:s,error:n}=await r.from("profiles").select("email, display_name, deleted_at").eq("id",a).single();if(n||!s)return R.NextResponse.json({success:!1,error:"User not found"},{status:404});if(s.deleted_at)return R.NextResponse.json({success:!1,error:"Cannot reset password for deactivated user"},{status:400});let{data:o,error:i}=await r.auth.admin.generateLink({type:"recovery",email:s.email,options:{redirectTo:"http://localhost:3000/versotech_main/reset-password"}});if(i||!o?.properties?.action_link)return console.error("[reset-password] Link generation error:",i),R.NextResponse.json({success:!1,error:"Failed to generate reset link"},{status:500});let l=o.properties.action_link,d=await (0,v.sendPasswordResetEmail)({email:s.email,displayName:s.display_name,resetUrl:l});if(!d.success)return console.error("[reset-password] Email send failed:",d.error),R.NextResponse.json({success:!1,error:"Failed to send password reset email"},{status:500});return await S.auditLogger.log({actor_user_id:e.id,action:"password_reset_initiated",entity:S.AuditEntities.USERS,entity_id:a,metadata:{target_email:s.email,target_name:s.display_name,email_sent:!0,initiated_by:"admin"}}),R.NextResponse.json({success:!0,message:"Password reset email sent"})}catch(e){return console.error("[reset-password] API error:",e),R.NextResponse.json({success:!1,error:"Internal server error"},{status:500})}}e.s(["POST",()=>A],480538);var w=e.i(480538);let I=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/admin/users/[id]/reset-password/route",pathname:"/api/admin/users/[id]/reset-password",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/versotech-portal/src/app/api/admin/users/[id]/reset-password/route.ts",nextConfigOutput:"",userland:w}),{workAsyncStorage:b,workUnitAsyncStorage:O,serverHooks:C}=I;function N(){return(0,a.patchFetch)({workAsyncStorage:b,workUnitAsyncStorage:O})}async function T(e,t,a){I.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let R="/api/admin/users/[id]/reset-password/route";R=R.replace(/\/index$/,"")||"/";let h=await I.prepare(e,t,{srcPage:R,multiZoneDraftMode:!1});if(!h)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:x,params:y,nextConfig:v,parsedUrl:S,isDraftMode:A,prerenderManifest:w,routerServerContext:b,isOnDemandRevalidate:O,revalidateOnlyGenerated:C,resolvedPathname:N,clientReferenceManifest:T,serverActionsManifest:P}=h,k=(0,i.normalizeAppPath)(R),D=!!(w.dynamicRoutes[k]||w.routes[N]),M=async()=>((null==b?void 0:b.render404)?await b.render404(e,t,S,!1):t.end("This page could not be found"),null);if(D&&!A){let e=!!w.routes[N],t=w.dynamicRoutes[k];if(t&&!1===t.fallback&&!e){if(v.experimental.adapterPath)return await M();throw new g.NoFallbackError}}let U=null;!D||I.isDev||A||(U="/index"===(U=N)?"/":U);let L=!0===I.isDev||!D,j=D&&!L;P&&T&&(0,o.setManifestsSingleton)({page:R,clientReferenceManifest:T,serverActionsManifest:P});let q=e.method||"GET",F=(0,n.getTracer)(),V=F.getActiveScopeSpan(),z={params:y,prerenderManifest:w,renderOpts:{experimental:{authInterrupts:!!v.experimental.authInterrupts},cacheComponents:!!v.cacheComponents,supportsDynamicResponse:L,incrementalCache:(0,s.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:v.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,s)=>I.onRequestError(e,t,a,s,b)},sharedContext:{buildId:x}},G=new l.NodeNextRequest(e),H=new l.NodeNextResponse(t),$=d.NextRequestAdapter.fromNodeNextRequest(G,(0,d.signalFromNodeResponse)(t));try{let o=async e=>I.handle($,z).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=F.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${q} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${q} ${R}`)}),i=!!(0,s.getRequestMeta)(e,"minimalMode"),l=async s=>{var n,l;let d=async({previousCacheEntry:r})=>{try{if(!i&&O&&C&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await o(s);e.fetchMetrics=z.renderOpts.fetchMetrics;let l=z.renderOpts.pendingWaitUntil;l&&a.waitUntil&&(a.waitUntil(l),l=void 0);let d=z.renderOpts.collectedTags;if(!D)return await (0,u.sendResponse)(G,H,n,z.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,f.toNodeOutgoingHttpHeaders)(n.headers);d&&(t[E.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==z.renderOpts.collectedRevalidate&&!(z.renderOpts.collectedRevalidate>=E.INFINITE_CACHE)&&z.renderOpts.collectedRevalidate,a=void 0===z.renderOpts.collectedExpire||z.renderOpts.collectedExpire>=E.INFINITE_CACHE?void 0:z.renderOpts.collectedExpire;return{value:{kind:_.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await I.onRequestError(e,t,{routerKind:"App Router",routePath:R,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:O})},!1,b),t}},c=await I.handleResponse({req:e,nextConfig:v,cacheKey:U,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:w,isRoutePPREnabled:!1,isOnDemandRevalidate:O,revalidateOnlyGenerated:C,responseGenerator:d,waitUntil:a.waitUntil,isMinimalMode:i});if(!D)return null;if((null==c||null==(n=c.value)?void 0:n.kind)!==_.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(l=c.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});i||t.setHeader("x-nextjs-cache",O?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),A&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let g=(0,f.fromNodeOutgoingHttpHeaders)(c.value.headers);return i&&D||g.delete(E.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||g.get("Cache-Control")||g.set("Cache-Control",(0,m.getCacheControlHeader)(c.cacheControl)),await (0,u.sendResponse)(G,H,new Response(c.value.body,{headers:g,status:c.value.status||200})),null};V?await l(V):await F.withPropagatedContext(e.headers,()=>F.trace(c.BaseServerSpan.handleRequest,{spanName:`${q} ${R}`,kind:n.SpanKind.SERVER,attributes:{"http.method":q,"http.target":e.url}},l))}catch(t){if(t instanceof g.NoFallbackError||await I.onRequestError(e,t,{routerKind:"App Router",routePath:k,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:O})},!1,b),D)throw t;return await (0,u.sendResponse)(G,H,new Response(null,{status:500})),null}}e.s(["handler",()=>T,"patchFetch",()=>N,"routeModule",()=>I,"serverHooks",()=>C,"workAsyncStorage",()=>b,"workUnitAsyncStorage",()=>O],230211)},261365,e=>{e.v(e=>Promise.resolve().then(()=>e(368899)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__8b31b890._.js.map