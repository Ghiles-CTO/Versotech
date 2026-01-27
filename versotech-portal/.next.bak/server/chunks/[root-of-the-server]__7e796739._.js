module.exports=[918622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},556704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},832319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},324725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},270406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},193695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},433669,e=>{"use strict";e.i(814247);var t=e.i(150615),r=e.i(12049),o=e.i(57824);let a=async()=>{let e=await (0,o.cookies)();return(0,t.createServerClient)("https://ipguxdssecfexudnvtia.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjE4MzcsImV4cCI6MjA3MzkzNzgzN30.AGxM_YW9hfxuu7xDpi_4xhOoRhYM7iGTS1vJ0z2FByE",{cookies:{getAll:()=>e.getAll(),setAll(t){try{t.forEach(({name:t,value:r,options:o})=>{e.set(t,r,o)})}catch(e){}}}})};e.s(["createClient",0,a,"createServiceClient",0,()=>(0,r.createClient)("https://ipguxdssecfexudnvtia.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:!1,persistSession:!1}})])},898451,e=>{"use strict";let t=process.env.EMAIL_FROM||"VERSO <onboarding@resend.dev>",r=process.env.RESEND_API_KEY;async function o(e){try{if(!r||"re_your_resend_api_key_here"===r)return console.error("Resend API key not configured"),{success:!1,error:"Email service not configured. Please set RESEND_API_KEY environment variable."};if(r.startsWith("re_test_"))return console.error("Test API key detected - emails will not be delivered"),{success:!1,error:"Test API key cannot be used for sending real emails."};let o=e.from||t,a=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${r}`,"Content-Type":"application/json"},body:JSON.stringify({from:o,to:e.to,subject:e.subject,html:e.html})});if(!a.ok){let e=await a.text();return console.error("Resend API error:",e),{success:!1,error:`Email send failed: ${a.status} ${a.statusText}`}}let s=await a.json();return{success:!0,messageId:s.id}}catch(e){return console.error("Email sending error:",e),{success:!1,error:e.message||"Unknown email error"}}}async function a(e){let t=e.displayName||e.email.split("@")[0],r=`
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
  `;return o({to:e.email,subject:"Reset Your Password - VERSO",html:r})}async function s(e){let t="investor"===e.entityType,r="staff"===e.entityType||["staff_admin","staff_ops","staff_rm","ceo"].includes(e.role),a={staff_admin:"Staff Administrator",staff_ops:"Operations Staff",staff_rm:"Relationship Manager",ceo:"Chief Executive Officer",member:"Member",admin:"Administrator",owner:"Owner",signatory:"Authorized Signatory"}[e.role]||e.role,s=`
    <p>You have been invited to join <strong>${e.entityName}</strong> on the VERSO Investment Platform.</p>
    <p>This secure platform provides you with comprehensive access to your investment portfolio, performance analytics, and exclusive deal opportunities.</p>
    <p>Click the button below to set up your account and access the platform.</p>
  `,n=`
    <p>You have been invited to join <strong>VERSO</strong> as a <strong>${a}</strong>.</p>
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
      ${t?s:r?n:i}
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
  `,d=r?`Welcome to VERSO - You've been invited as ${a}`:`You've been invited to join ${e.entityName} on VERSO`;return o({to:e.email,subject:d,html:l})}r?"re_your_resend_api_key_here"===r?console.error("CRITICAL: RESEND_API_KEY cannot use example value in production. Please set a valid Resend API key."):r.startsWith("re_test_")&&console.error("CRITICAL: RESEND_API_KEY cannot use test key in production. Please set a valid production Resend API key."):console.error("CRITICAL: RESEND_API_KEY not configured in production"),e.s(["sendEmail",()=>o,"sendInvitationEmail",()=>s,"sendPasswordResetEmail",()=>a])},627098,e=>{"use strict";var t=e.i(779444),r=e.i(698261),o=e.i(821776),a=e.i(796417),s=e.i(856890),n=e.i(26996),i=e.i(436944),l=e.i(88281),d=e.i(765944),c=e.i(984788),p=e.i(237011),u=e.i(712007),f=e.i(777657),m=e.i(13180),g=e.i(273827),h=e.i(193695);e.i(947956);var x=e.i(36217),v=e.i(414131),y=e.i(433669),b=e.i(898451);async function w(e){let t=process.env.RESEND_API_KEY;console.log("[password-reset] RESEND_API_KEY status:",{exists:!!t,length:t?.length||0,prefix:t?.substring(0,8)||"NOT_SET"});try{let{email:t}=await e.json();if(!t||"string"!=typeof t)return v.NextResponse.json({error:"Email is required"},{status:400});let r=t.toLowerCase().trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r))return v.NextResponse.json({error:"Invalid email format"},{status:400});let o=(0,y.createServiceClient)(),{data:a}=await o.from("profiles").select("id, display_name, email").eq("email",r).maybeSingle();if(!a)return console.log(`[password-reset] No account found for: ${r}`),v.NextResponse.json({success:!0,message:"If an account exists with this email, a password reset link has been sent."});let{data:s,error:n}=await o.auth.admin.generateLink({type:"recovery",email:r,options:{redirectTo:"http://localhost:3000/versotech_main/reset-password"}});if(n||!s?.properties?.hashed_token)return console.error("[password-reset] Error generating link:",n),v.NextResponse.json({error:"Failed to generate reset link"},{status:500});let i=s.properties.action_link,l=await (0,b.sendPasswordResetEmail)({email:r,displayName:a.display_name,resetUrl:i});if(!l.success){console.error("[password-reset] Email send failed:",l.error);let e=l.error||"Unknown email error",t=process.env.RESEND_API_KEY;return v.NextResponse.json({error:"Failed to send reset email. Please try again.",detail:e,envDebug:{keyExists:!!t,keyLength:t?.length||0,keyPrefix:t?.substring(0,8)||"NOT_SET"}},{status:500})}console.log(`[password-reset] Reset email sent to: ${r}`);try{await o.from("audit_logs").insert({event_type:"authentication",actor_id:a.id,action:"password_reset_requested",entity_type:"user",entity_id:a.id,action_details:{email:r,email_sent:!0},timestamp:new Date().toISOString()})}catch(e){console.error("[password-reset] Audit log failed:",e)}return v.NextResponse.json({success:!0,message:"If an account exists with this email, a password reset link has been sent."})}catch(e){return console.error("[password-reset] Error:",e?.message||e),console.error("[password-reset] Stack:",e?.stack),v.NextResponse.json({error:"Internal server error",details:e?.message},{status:500})}}e.s(["POST",()=>w],655061);var E=e.i(655061);let R=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/auth/request-reset/route",pathname:"/api/auth/request-reset",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/versotech-portal/src/app/api/auth/request-reset/route.ts",nextConfigOutput:"",userland:E}),{workAsyncStorage:_,workUnitAsyncStorage:k,serverHooks:S}=R;function A(){return(0,o.patchFetch)({workAsyncStorage:_,workUnitAsyncStorage:k})}async function I(e,t,o){R.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let v="/api/auth/request-reset/route";v=v.replace(/\/index$/,"")||"/";let y=await R.prepare(e,t,{srcPage:v,multiZoneDraftMode:!1});if(!y)return t.statusCode=400,t.end("Bad Request"),null==o.waitUntil||o.waitUntil.call(o,Promise.resolve()),null;let{buildId:b,params:w,nextConfig:E,parsedUrl:_,isDraftMode:k,prerenderManifest:S,routerServerContext:A,isOnDemandRevalidate:I,revalidateOnlyGenerated:C,resolvedPathname:N,clientReferenceManifest:P,serverActionsManifest:O}=y,T=(0,i.normalizeAppPath)(v),j=!!(S.dynamicRoutes[T]||S.routes[N]),q=async()=>((null==A?void 0:A.render404)?await A.render404(e,t,_,!1):t.end("This page could not be found"),null);if(j&&!k){let e=!!S.routes[N],t=S.dynamicRoutes[T];if(t&&!1===t.fallback&&!e){if(E.experimental.adapterPath)return await q();throw new h.NoFallbackError}}let D=null;!j||R.isDev||k||(D="/index"===(D=N)?"/":D);let z=!0===R.isDev||!j,$=j&&!z;O&&P&&(0,n.setManifestsSingleton)({page:v,clientReferenceManifest:P,serverActionsManifest:O});let U=e.method||"GET",H=(0,s.getTracer)(),M=H.getActiveScopeSpan(),Y={params:w,prerenderManifest:S,renderOpts:{experimental:{authInterrupts:!!E.experimental.authInterrupts},cacheComponents:!!E.cacheComponents,supportsDynamicResponse:z,incrementalCache:(0,a.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:E.cacheLife,waitUntil:o.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,o,a)=>R.onRequestError(e,t,o,a,A)},sharedContext:{buildId:b}},V=new l.NodeNextRequest(e),F=new l.NodeNextResponse(t),L=d.NextRequestAdapter.fromNodeNextRequest(V,(0,d.signalFromNodeResponse)(t));try{let n=async e=>R.handle(L,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=H.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let o=r.get("next.route");if(o){let t=`${U} ${o}`;e.setAttributes({"next.route":o,"http.route":o,"next.span_name":t}),e.updateName(t)}else e.updateName(`${U} ${v}`)}),i=!!(0,a.getRequestMeta)(e,"minimalMode"),l=async a=>{var s,l;let d=async({previousCacheEntry:r})=>{try{if(!i&&I&&C&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await n(a);e.fetchMetrics=Y.renderOpts.fetchMetrics;let l=Y.renderOpts.pendingWaitUntil;l&&o.waitUntil&&(o.waitUntil(l),l=void 0);let d=Y.renderOpts.collectedTags;if(!j)return await (0,u.sendResponse)(V,F,s,Y.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,f.toNodeOutgoingHttpHeaders)(s.headers);d&&(t[g.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=g.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,o=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=g.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:x.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:o}}}}catch(t){throw(null==r?void 0:r.isStale)&&await R.onRequestError(e,t,{routerKind:"App Router",routePath:v,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:I})},!1,A),t}},c=await R.handleResponse({req:e,nextConfig:E,cacheKey:D,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:S,isRoutePPREnabled:!1,isOnDemandRevalidate:I,revalidateOnlyGenerated:C,responseGenerator:d,waitUntil:o.waitUntil,isMinimalMode:i});if(!j)return null;if((null==c||null==(s=c.value)?void 0:s.kind)!==x.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(l=c.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});i||t.setHeader("x-nextjs-cache",I?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),k&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let h=(0,f.fromNodeOutgoingHttpHeaders)(c.value.headers);return i&&j||h.delete(g.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||h.get("Cache-Control")||h.set("Cache-Control",(0,m.getCacheControlHeader)(c.cacheControl)),await (0,u.sendResponse)(V,F,new Response(c.value.body,{headers:h,status:c.value.status||200})),null};M?await l(M):await H.withPropagatedContext(e.headers,()=>H.trace(c.BaseServerSpan.handleRequest,{spanName:`${U} ${v}`,kind:s.SpanKind.SERVER,attributes:{"http.method":U,"http.target":e.url}},l))}catch(t){if(t instanceof h.NoFallbackError||await R.onRequestError(e,t,{routerKind:"App Router",routePath:T,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:I})},!1,A),j)throw t;return await (0,u.sendResponse)(V,F,new Response(null,{status:500})),null}}e.s(["handler",()=>I,"patchFetch",()=>A,"routeModule",()=>R,"serverHooks",()=>S,"workAsyncStorage",()=>_,"workUnitAsyncStorage",()=>k],627098)},261365,e=>{e.v(e=>Promise.resolve().then(()=>e(368899)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__7e796739._.js.map