module.exports=[918622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},556704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},832319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},324725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},270406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},193695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},433669,e=>{"use strict";e.i(814247);var t=e.i(150615),r=e.i(12049),n=e.i(57824);let a=async()=>{let e=await (0,n.cookies)();return(0,t.createServerClient)("https://ipguxdssecfexudnvtia.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjE4MzcsImV4cCI6MjA3MzkzNzgzN30.AGxM_YW9hfxuu7xDpi_4xhOoRhYM7iGTS1vJ0z2FByE",{cookies:{getAll:()=>e.getAll(),setAll(t){try{t.forEach(({name:t,value:r,options:n})=>{e.set(t,r,n)})}catch(e){}}}})};e.s(["createClient",0,a,"createServiceClient",0,()=>(0,r.createClient)("https://ipguxdssecfexudnvtia.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:!1,persistSession:!1}})])},898451,e=>{"use strict";let t=process.env.EMAIL_FROM||"VERSO <onboarding@resend.dev>",r=process.env.RESEND_API_KEY;async function n(e){try{if(!r||"re_your_resend_api_key_here"===r)return console.error("Resend API key not configured"),{success:!1,error:"Email service not configured. Please set RESEND_API_KEY environment variable."};if(r.startsWith("re_test_"))return console.error("Test API key detected - emails will not be delivered"),{success:!1,error:"Test API key cannot be used for sending real emails."};let n=e.from||t,a=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${r}`,"Content-Type":"application/json"},body:JSON.stringify({from:n,to:e.to,subject:e.subject,html:e.html})});if(!a.ok){let e=await a.text();return console.error("Resend API error:",e),{success:!1,error:`Email send failed: ${a.status} ${a.statusText}`}}let o=await a.json();return{success:!0,messageId:o.id}}catch(e){return console.error("Email sending error:",e),{success:!1,error:e.message||"Unknown email error"}}}async function a(e){let t=e.displayName||e.email.split("@")[0],r=`
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
  `;return n({to:e.email,subject:"Reset Your Password - VERSO",html:r})}async function o(e){let t="investor"===e.entityType,r="staff"===e.entityType||["staff_admin","staff_ops","staff_rm","ceo"].includes(e.role),a={staff_admin:"Staff Administrator",staff_ops:"Operations Staff",staff_rm:"Relationship Manager",ceo:"Chief Executive Officer",member:"Member",admin:"Administrator",owner:"Owner",signatory:"Authorized Signatory"}[e.role]||e.role,o=`
    <p>You have been invited to join <strong>${e.entityName}</strong> on the VERSO Investment Platform.</p>
    <p>This secure platform provides you with comprehensive access to your investment portfolio, performance analytics, and exclusive deal opportunities.</p>
    <p>Click the button below to set up your account and access the platform.</p>
  `,i=`
    <p>You have been invited to join <strong>VERSO</strong> as a <strong>${a}</strong>.</p>
    <p>As a member of the VERSO team, you'll have access to investor management, deal operations, and administrative tools.</p>
    <p>Click the button below to set up your password and access your dashboard.</p>
  `,s=`
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
      ${t?o:r?i:s}
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
  `,d=r?`Welcome to VERSO - You've been invited as ${a}`:`You've been invited to join ${e.entityName} on VERSO`;return n({to:e.email,subject:d,html:l})}r?"re_your_resend_api_key_here"===r?console.error("CRITICAL: RESEND_API_KEY cannot use example value in production. Please set a valid Resend API key."):r.startsWith("re_test_")&&console.error("CRITICAL: RESEND_API_KEY cannot use test key in production. Please set a valid production Resend API key."):console.error("CRITICAL: RESEND_API_KEY not configured in production"),e.s(["sendEmail",()=>n,"sendInvitationEmail",()=>o,"sendPasswordResetEmail",()=>a])},436826,e=>{"use strict";var t=e.i(779444),r=e.i(698261),n=e.i(821776),a=e.i(796417),o=e.i(856890),i=e.i(26996),s=e.i(436944),l=e.i(88281),d=e.i(765944),p=e.i(984788),c=e.i(237011),u=e.i(712007),f=e.i(777657),m=e.i(13180),g=e.i(273827),v=e.i(193695);e.i(947956);var h=e.i(36217),x=e.i(414131),y=e.i(433669),b=e.i(898451);async function w(e){try{let t=await (0,y.createClient)(),{data:{user:r},error:n}=await t.auth.getUser();if(n||!r)return x.NextResponse.json({error:"Unauthorized"},{status:401});let{invitation_id:a}=await e.json();if(!a)return x.NextResponse.json({error:"Missing invitation_id"},{status:400});let o=(0,y.createServiceClient)(),{data:i,error:s}=await o.from("member_invitations").select("*").eq("id",a).single();if(s||!i)return x.NextResponse.json({error:"Invitation not found"},{status:404});if(!["pending","expired"].includes(i.status))return x.NextResponse.json({error:`Cannot resend invitation with status: ${i.status}`},{status:400});let{data:l}=await o.from("profiles").select("display_name, email, role").eq("id",r.id).single(),d=l?.role?.startsWith("staff_")||l?.role==="ceo",p=i.invited_by===r.id;if(!d&&!p)return x.NextResponse.json({error:"You do not have permission to resend this invitation"},{status:403});let c=new Date(Date.now()+6048e5).toISOString(),u=new Date().toISOString(),f=(i.reminder_count??0)+1,{error:m}=await o.from("member_invitations").update({status:"pending",expires_at:c,sent_at:u,last_reminded_at:u,reminder_count:f}).eq("id",a);if(m)return console.error("Error updating invitation:",m),x.NextResponse.json({error:"Failed to update invitation"},{status:500});let g=`http://localhost:3000/invitation/accept?token=${i.invitation_token}`,v=await (0,b.sendInvitationEmail)({email:i.email,inviteeName:void 0,entityName:i.entity_name,entityType:i.entity_type,role:i.role,inviterName:i.invited_by_name,acceptUrl:g,expiresAt:c});if(!v.success)return console.error("Failed to resend invitation email:",v.error),x.NextResponse.json({success:!0,email_sent:!1,message:"Invitation updated but email delivery failed",new_expires_at:c});return await o.from("audit_logs").insert({event_type:"authorization",actor_id:r.id,action:"invitation_resent",entity_type:i.entity_type,entity_id:i.entity_id,action_details:{invitation_id:i.id,email:i.email,previous_status:i.status,new_expires_at:c},timestamp:new Date().toISOString()}),x.NextResponse.json({success:!0,email_sent:!0,message:`Invitation resent to ${i.email}`,new_expires_at:c})}catch(e){return console.error("Error in POST /api/members/invite/resend:",e),x.NextResponse.json({error:"Internal server error"},{status:500})}}e.s(["POST",()=>w],24826);var R=e.i(24826);let _=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/members/invite/resend/route",pathname:"/api/members/invite/resend",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/versotech-portal/src/app/api/members/invite/resend/route.ts",nextConfigOutput:"",userland:R}),{workAsyncStorage:E,workUnitAsyncStorage:S,serverHooks:A}=_;function I(){return(0,n.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:S})}async function C(e,t,n){_.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let x="/api/members/invite/resend/route";x=x.replace(/\/index$/,"")||"/";let y=await _.prepare(e,t,{srcPage:x,multiZoneDraftMode:!1});if(!y)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:b,params:w,nextConfig:R,parsedUrl:E,isDraftMode:S,prerenderManifest:A,routerServerContext:I,isOnDemandRevalidate:C,revalidateOnlyGenerated:k,resolvedPathname:N,clientReferenceManifest:O,serverActionsManifest:P}=y,T=(0,s.normalizeAppPath)(x),j=!!(A.dynamicRoutes[T]||A.routes[N]),z=async()=>((null==I?void 0:I.render404)?await I.render404(e,t,E,!1):t.end("This page could not be found"),null);if(j&&!S){let e=!!A.routes[N],t=A.dynamicRoutes[T];if(t&&!1===t.fallback&&!e){if(R.experimental.adapterPath)return await z();throw new v.NoFallbackError}}let D=null;!j||_.isDev||S||(D="/index"===(D=N)?"/":D);let U=!0===_.isDev||!j,$=j&&!U;P&&O&&(0,i.setManifestsSingleton)({page:x,clientReferenceManifest:O,serverActionsManifest:P});let q=e.method||"GET",M=(0,o.getTracer)(),H=M.getActiveScopeSpan(),Y={params:w,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!R.experimental.authInterrupts},cacheComponents:!!R.cacheComponents,supportsDynamicResponse:U,incrementalCache:(0,a.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:R.cacheLife,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n,a)=>_.onRequestError(e,t,n,a,I)},sharedContext:{buildId:b}},V=new l.NodeNextRequest(e),F=new l.NodeNextResponse(t),L=d.NextRequestAdapter.fromNodeNextRequest(V,(0,d.signalFromNodeResponse)(t));try{let i=async e=>_.handle(L,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=M.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${q} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${q} ${x}`)}),s=!!(0,a.getRequestMeta)(e,"minimalMode"),l=async a=>{var o,l;let d=async({previousCacheEntry:r})=>{try{if(!s&&C&&k&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let o=await i(a);e.fetchMetrics=Y.renderOpts.fetchMetrics;let l=Y.renderOpts.pendingWaitUntil;l&&n.waitUntil&&(n.waitUntil(l),l=void 0);let d=Y.renderOpts.collectedTags;if(!j)return await (0,u.sendResponse)(V,F,o,Y.renderOpts.pendingWaitUntil),null;{let e=await o.blob(),t=(0,f.toNodeOutgoingHttpHeaders)(o.headers);d&&(t[g.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=g.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,n=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=g.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==r?void 0:r.isStale)&&await _.onRequestError(e,t,{routerKind:"App Router",routePath:x,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:C})},!1,I),t}},p=await _.handleResponse({req:e,nextConfig:R,cacheKey:D,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:k,responseGenerator:d,waitUntil:n.waitUntil,isMinimalMode:s});if(!j)return null;if((null==p||null==(o=p.value)?void 0:o.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==p||null==(l=p.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});s||t.setHeader("x-nextjs-cache",C?"REVALIDATED":p.isMiss?"MISS":p.isStale?"STALE":"HIT"),S&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let v=(0,f.fromNodeOutgoingHttpHeaders)(p.value.headers);return s&&j||v.delete(g.NEXT_CACHE_TAGS_HEADER),!p.cacheControl||t.getHeader("Cache-Control")||v.get("Cache-Control")||v.set("Cache-Control",(0,m.getCacheControlHeader)(p.cacheControl)),await (0,u.sendResponse)(V,F,new Response(p.value.body,{headers:v,status:p.value.status||200})),null};H?await l(H):await M.withPropagatedContext(e.headers,()=>M.trace(p.BaseServerSpan.handleRequest,{spanName:`${q} ${x}`,kind:o.SpanKind.SERVER,attributes:{"http.method":q,"http.target":e.url}},l))}catch(t){if(t instanceof v.NoFallbackError||await _.onRequestError(e,t,{routerKind:"App Router",routePath:T,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:C})},!1,I),j)throw t;return await (0,u.sendResponse)(V,F,new Response(null,{status:500})),null}}e.s(["handler",()=>C,"patchFetch",()=>I,"routeModule",()=>_,"serverHooks",()=>A,"workAsyncStorage",()=>E,"workUnitAsyncStorage",()=>S],436826)},261365,e=>{e.v(e=>Promise.resolve().then(()=>e(368899)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__a34eb168._.js.map