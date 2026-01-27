module.exports=[918622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},556704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},832319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},324725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},270406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},193695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},433669,e=>{"use strict";e.i(814247);var t=e.i(150615),r=e.i(12049),n=e.i(57824);let o=async()=>{let e=await (0,n.cookies)();return(0,t.createServerClient)("https://ipguxdssecfexudnvtia.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjE4MzcsImV4cCI6MjA3MzkzNzgzN30.AGxM_YW9hfxuu7xDpi_4xhOoRhYM7iGTS1vJ0z2FByE",{cookies:{getAll:()=>e.getAll(),setAll(t){try{t.forEach(({name:t,value:r,options:n})=>{e.set(t,r,n)})}catch(e){}}}})};e.s(["createClient",0,o,"createServiceClient",0,()=>(0,r.createClient)("https://ipguxdssecfexudnvtia.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:!1,persistSession:!1}})])},254799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},898451,e=>{"use strict";let t=process.env.EMAIL_FROM||"VERSO <onboarding@resend.dev>",r=process.env.RESEND_API_KEY;async function n(e){try{if(!r||"re_your_resend_api_key_here"===r)return console.error("Resend API key not configured"),{success:!1,error:"Email service not configured. Please set RESEND_API_KEY environment variable."};if(r.startsWith("re_test_"))return console.error("Test API key detected - emails will not be delivered"),{success:!1,error:"Test API key cannot be used for sending real emails."};let n=e.from||t,o=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${r}`,"Content-Type":"application/json"},body:JSON.stringify({from:n,to:e.to,subject:e.subject,html:e.html})});if(!o.ok){let e=await o.text();return console.error("Resend API error:",e),{success:!1,error:`Email send failed: ${o.status} ${o.statusText}`}}let i=await o.json();return{success:!0,messageId:i.id}}catch(e){return console.error("Email sending error:",e),{success:!1,error:e.message||"Unknown email error"}}}async function o(e){let t=e.displayName||e.email.split("@")[0],r=`
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
  `;return n({to:e.email,subject:"Reset Your Password - VERSO",html:r})}async function i(e){let t="investor"===e.entityType,r="staff"===e.entityType||["staff_admin","staff_ops","staff_rm","ceo"].includes(e.role),o={staff_admin:"Staff Administrator",staff_ops:"Operations Staff",staff_rm:"Relationship Manager",ceo:"Chief Executive Officer",member:"Member",admin:"Administrator",owner:"Owner",signatory:"Authorized Signatory"}[e.role]||e.role,i=`
    <p>You have been invited to join <strong>${e.entityName}</strong> on the VERSO Investment Platform.</p>
    <p>This secure platform provides you with comprehensive access to your investment portfolio, performance analytics, and exclusive deal opportunities.</p>
    <p>Click the button below to set up your account and access the platform.</p>
  `,a=`
    <p>You have been invited to join <strong>VERSO</strong> as a <strong>${o}</strong>.</p>
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
      ${t?i:r?a:s}
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
  `,d=r?`Welcome to VERSO - You've been invited as ${o}`:`You've been invited to join ${e.entityName} on VERSO`;return n({to:e.email,subject:d,html:l})}r?"re_your_resend_api_key_here"===r?console.error("CRITICAL: RESEND_API_KEY cannot use example value in production. Please set a valid Resend API key."):r.startsWith("re_test_")&&console.error("CRITICAL: RESEND_API_KEY cannot use test key in production. Please set a valid production Resend API key."):console.error("CRITICAL: RESEND_API_KEY not configured in production"),e.s(["sendEmail",()=>n,"sendInvitationEmail",()=>i,"sendPasswordResetEmail",()=>o])},430586,e=>{"use strict";let t={storage:{bucket:process.env.SIGNATURES_BUCKET||"signatures",paths:{unsigned:(e,t)=>`${e}/${t}_unsigned.pdf`,signed:(e,t)=>`${e}/${t}_signed.pdf`}},token:{lengthBytes:32,expiryDays:7},pdf:{signature:{width:150,height:50},table:{bottom:433,height:112},positions:{party_a:{xPercent:.292},party_b:{xPercent:.704}},metadata:{timestampFontSize:7,timestampOffsetY:12,signerNameOffsetY:22,textColor:{r:.3,g:.3,b:.3}}},email:{fromAddress:"signatures@versoholdings.com",replyTo:"support@versoholdings.com"}};e.s(["SIGNATURE_CONFIG",0,t])},821275,e=>{"use strict";var t=e.i(254799),r=e.i(430586);function n(){return t.default.randomBytes(r.SIGNATURE_CONFIG.token.lengthBytes).toString("hex")}function o(e){let t=new Date;return t.setDate(t.getDate()+(e||r.SIGNATURE_CONFIG.token.expiryDays)),t}function i(e){return new Date>new Date(e)}function a(){return"http://localhost:3000".replace(/\/+$/,"")}function s(e){let t=a();return`${t}/sign/${e}`}e.s(["calculateTokenExpiry",()=>o,"generateSignatureToken",()=>n,"generateSigningUrl",()=>s,"getAppUrl",()=>a,"isTokenExpired",()=>i])},504334,e=>{"use strict";var t=e.i(779444),r=e.i(698261),n=e.i(821776),o=e.i(796417),i=e.i(856890),a=e.i(26996),s=e.i(436944),l=e.i(88281),d=e.i(765944),c=e.i(984788),p=e.i(237011),u=e.i(712007),f=e.i(777657),m=e.i(13180),g=e.i(273827),h=e.i(193695);e.i(947956);var v=e.i(36217),x=e.i(414131),y=e.i(433669),b=e.i(898451),_=e.i(821275);let R=process.env.CRON_SECRET;async function E(e){let t=e.headers.get("authorization");if(R&&t!==`Bearer ${R}`)return x.NextResponse.json({error:"Unauthorized"},{status:401});let r=(0,y.createServiceClient)(),n=new Date,o=new Date(n.getTime()-2592e5),i={checked:0,reminded:0,skipped:0,errors:[]};try{let{data:e,error:t}=await r.from("member_invitations").select("id, email, entity_name, entity_type, role, invited_by_name, expires_at, sent_at, last_reminded_at, reminder_count, invitation_token, created_at").eq("status","pending").gt("expires_at",n.toISOString());if(t)return x.NextResponse.json({error:`Failed to fetch invitations: ${t.message}`},{status:500});for(let t of(i.checked=e?.length||0,(e||[]).filter(e=>{if((e.reminder_count??0)>=2)return!1;let t=e.last_reminded_at||e.sent_at||e.created_at;return!!t&&new Date(t)<=o})))try{let e=`${(0,_.getAppUrl)()}/invitation/accept?token=${t.invitation_token}`,o=await (0,b.sendInvitationEmail)({email:t.email,inviteeName:void 0,entityName:t.entity_name||"the organization",entityType:t.entity_type,role:t.role,inviterName:t.invited_by_name||"A team member",acceptUrl:e,expiresAt:t.expires_at});if(!o.success){i.errors.push(`Failed to send reminder for ${t.email}: ${o.error}`);continue}let a=(t.reminder_count??0)+1;await r.from("member_invitations").update({last_reminded_at:n.toISOString(),reminder_count:a,sent_at:t.sent_at||n.toISOString()}).eq("id",t.id),await r.from("audit_logs").insert({event_type:"authorization",action:"invitation_reminder_sent",entity_type:"member_invitation",entity_id:t.id,action_details:{email:t.email,entity_type:t.entity_type,reminder_count:a},timestamp:n.toISOString()}),i.reminded+=1}catch(e){i.errors.push(`Error processing invitation ${t.id}: ${e instanceof Error?e.message:"unknown error"}`)}return i.skipped=i.checked-i.reminded,x.NextResponse.json({success:!0,message:`Processed ${i.checked} invitations, sent ${i.reminded} reminder(s).`,results:i})}catch(e){return console.error("[invitation-reminders] Unexpected error:",e),x.NextResponse.json({error:"Internal server error"},{status:500})}}e.s(["POST",()=>E],934043);var w=e.i(934043);let S=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/cron/invitation-reminders/route",pathname:"/api/cron/invitation-reminders",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/versotech-portal/src/app/api/cron/invitation-reminders/route.ts",nextConfigOutput:"",userland:w}),{workAsyncStorage:k,workUnitAsyncStorage:A,serverHooks:I}=S;function C(){return(0,n.patchFetch)({workAsyncStorage:k,workUnitAsyncStorage:A})}async function N(e,t,n){S.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let x="/api/cron/invitation-reminders/route";x=x.replace(/\/index$/,"")||"/";let y=await S.prepare(e,t,{srcPage:x,multiZoneDraftMode:!1});if(!y)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:b,params:_,nextConfig:R,parsedUrl:E,isDraftMode:w,prerenderManifest:k,routerServerContext:A,isOnDemandRevalidate:I,revalidateOnlyGenerated:C,resolvedPathname:N,clientReferenceManifest:O,serverActionsManifest:T}=y,P=(0,s.normalizeAppPath)(x),$=!!(k.dynamicRoutes[P]||k.routes[N]),D=async()=>((null==A?void 0:A.render404)?await A.render404(e,t,E,!1):t.end("This page could not be found"),null);if($&&!w){let e=!!k.routes[N],t=k.dynamicRoutes[P];if(t&&!1===t.fallback&&!e){if(R.experimental.adapterPath)return await D();throw new h.NoFallbackError}}let U=null;!$||S.isDev||w||(U="/index"===(U=N)?"/":U);let j=!0===S.isDev||!$,z=$&&!j;T&&O&&(0,a.setManifestsSingleton)({page:x,clientReferenceManifest:O,serverActionsManifest:T});let q=e.method||"GET",H=(0,i.getTracer)(),M=H.getActiveScopeSpan(),F={params:_,prerenderManifest:k,renderOpts:{experimental:{authInterrupts:!!R.experimental.authInterrupts},cacheComponents:!!R.cacheComponents,supportsDynamicResponse:j,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:R.cacheLife,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n,o)=>S.onRequestError(e,t,n,o,A)},sharedContext:{buildId:b}},Y=new l.NodeNextRequest(e),V=new l.NodeNextResponse(t),B=d.NextRequestAdapter.fromNodeNextRequest(Y,(0,d.signalFromNodeResponse)(t));try{let a=async e=>S.handle(B,F).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=H.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${q} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${q} ${x}`)}),s=!!(0,o.getRequestMeta)(e,"minimalMode"),l=async o=>{var i,l;let d=async({previousCacheEntry:r})=>{try{if(!s&&I&&C&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await a(o);e.fetchMetrics=F.renderOpts.fetchMetrics;let l=F.renderOpts.pendingWaitUntil;l&&n.waitUntil&&(n.waitUntil(l),l=void 0);let d=F.renderOpts.collectedTags;if(!$)return await (0,u.sendResponse)(Y,V,i,F.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,f.toNodeOutgoingHttpHeaders)(i.headers);d&&(t[g.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==F.renderOpts.collectedRevalidate&&!(F.renderOpts.collectedRevalidate>=g.INFINITE_CACHE)&&F.renderOpts.collectedRevalidate,n=void 0===F.renderOpts.collectedExpire||F.renderOpts.collectedExpire>=g.INFINITE_CACHE?void 0:F.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==r?void 0:r.isStale)&&await S.onRequestError(e,t,{routerKind:"App Router",routePath:x,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:z,isOnDemandRevalidate:I})},!1,A),t}},c=await S.handleResponse({req:e,nextConfig:R,cacheKey:U,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:k,isRoutePPREnabled:!1,isOnDemandRevalidate:I,revalidateOnlyGenerated:C,responseGenerator:d,waitUntil:n.waitUntil,isMinimalMode:s});if(!$)return null;if((null==c||null==(i=c.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(l=c.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});s||t.setHeader("x-nextjs-cache",I?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),w&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let h=(0,f.fromNodeOutgoingHttpHeaders)(c.value.headers);return s&&$||h.delete(g.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||h.get("Cache-Control")||h.set("Cache-Control",(0,m.getCacheControlHeader)(c.cacheControl)),await (0,u.sendResponse)(Y,V,new Response(c.value.body,{headers:h,status:c.value.status||200})),null};M?await l(M):await H.withPropagatedContext(e.headers,()=>H.trace(c.BaseServerSpan.handleRequest,{spanName:`${q} ${x}`,kind:i.SpanKind.SERVER,attributes:{"http.method":q,"http.target":e.url}},l))}catch(t){if(t instanceof h.NoFallbackError||await S.onRequestError(e,t,{routerKind:"App Router",routePath:P,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:z,isOnDemandRevalidate:I})},!1,A),$)throw t;return await (0,u.sendResponse)(Y,V,new Response(null,{status:500})),null}}e.s(["handler",()=>N,"patchFetch",()=>C,"routeModule",()=>S,"serverHooks",()=>I,"workAsyncStorage",()=>k,"workUnitAsyncStorage",()=>A],504334)},261365,e=>{e.v(e=>Promise.resolve().then(()=>e(368899)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__a6039472._.js.map