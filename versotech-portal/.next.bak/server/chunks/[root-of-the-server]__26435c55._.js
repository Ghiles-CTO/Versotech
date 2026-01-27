module.exports=[918622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},556704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},832319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},324725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},270406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},193695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},433669,e=>{"use strict";e.i(814247);var t=e.i(150615),r=e.i(12049),a=e.i(57824);let n=async()=>{let e=await (0,a.cookies)();return(0,t.createServerClient)("https://ipguxdssecfexudnvtia.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjE4MzcsImV4cCI6MjA3MzkzNzgzN30.AGxM_YW9hfxuu7xDpi_4xhOoRhYM7iGTS1vJ0z2FByE",{cookies:{getAll:()=>e.getAll(),setAll(t){try{t.forEach(({name:t,value:r,options:a})=>{e.set(t,r,a)})}catch(e){}}}})};e.s(["createClient",0,n,"createServiceClient",0,()=>(0,r.createClient)("https://ipguxdssecfexudnvtia.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:!1,persistSession:!1}})])},221640,e=>{"use strict";async function t(e){let{data:{user:t},error:r}=await e.auth.getUser();return{user:t,error:r}}async function r(e,t){let{data:r}=await e.from("profiles").select("role").eq("id",t.id).single();return r?.role||null}async function a(e,t,r){let{data:a}=await e.from("profiles").select("role").eq("id",t).single();if(a?.role==="ceo")return!0;let{data:n}=await e.from("ceo_users").select("user_id").eq("user_id",t).maybeSingle();if(n)return!0;let{data:i}=await e.from("staff_permissions").select("permission").eq("user_id",t).in("permission",r).limit(1).maybeSingle();return!!i}async function n(e,t){return a(e,t,["super_admin"])}async function i(e,t){let a=await r(e,t);if(a&&(a.startsWith("staff_")||"ceo"===a))return!0;if("multi_persona"===a)try{let{data:r}=await e.rpc("get_user_personas",{p_user_id:t.id});if(r&&Array.isArray(r))return r.some(e=>"staff"===e.persona_type||"ceo"===e.persona_type)}catch(e){console.error("[isStaffUser] Error checking personas:",e)}return!1}e.s(["getAuthenticatedUser",()=>t,"hasPermission",()=>a,"isStaffUser",()=>i,"isSuperAdmin",()=>n])},254799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},898451,e=>{"use strict";let t=process.env.EMAIL_FROM||"VERSO <onboarding@resend.dev>",r=process.env.RESEND_API_KEY;async function a(e){try{if(!r||"re_your_resend_api_key_here"===r)return console.error("Resend API key not configured"),{success:!1,error:"Email service not configured. Please set RESEND_API_KEY environment variable."};if(r.startsWith("re_test_"))return console.error("Test API key detected - emails will not be delivered"),{success:!1,error:"Test API key cannot be used for sending real emails."};let a=e.from||t,n=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${r}`,"Content-Type":"application/json"},body:JSON.stringify({from:a,to:e.to,subject:e.subject,html:e.html})});if(!n.ok){let e=await n.text();return console.error("Resend API error:",e),{success:!1,error:`Email send failed: ${n.status} ${n.statusText}`}}let i=await n.json();return{success:!0,messageId:i.id}}catch(e){return console.error("Email sending error:",e),{success:!1,error:e.message||"Unknown email error"}}}async function n(e){let t=e.displayName||e.email.split("@")[0],r=`
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
  `;return a({to:e.email,subject:"Reset Your Password - VERSO",html:r})}async function i(e){let t="investor"===e.entityType,r="staff"===e.entityType||["staff_admin","staff_ops","staff_rm","ceo"].includes(e.role),n={staff_admin:"Staff Administrator",staff_ops:"Operations Staff",staff_rm:"Relationship Manager",ceo:"Chief Executive Officer",member:"Member",admin:"Administrator",owner:"Owner",signatory:"Authorized Signatory"}[e.role]||e.role,i=`
    <p>You have been invited to join <strong>${e.entityName}</strong> on the VERSO Investment Platform.</p>
    <p>This secure platform provides you with comprehensive access to your investment portfolio, performance analytics, and exclusive deal opportunities.</p>
    <p>Click the button below to set up your account and access the platform.</p>
  `,s=`
    <p>You have been invited to join <strong>VERSO</strong> as a <strong>${n}</strong>.</p>
    <p>As a member of the VERSO team, you'll have access to investor management, deal operations, and administrative tools.</p>
    <p>Click the button below to set up your password and access your dashboard.</p>
  `,o=`
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
      ${t?i:r?s:o}
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
  `,d=r?`Welcome to VERSO - You've been invited as ${n}`:`You've been invited to join ${e.entityName} on VERSO`;return a({to:e.email,subject:d,html:l})}r?"re_your_resend_api_key_here"===r?console.error("CRITICAL: RESEND_API_KEY cannot use example value in production. Please set a valid Resend API key."):r.startsWith("re_test_")&&console.error("CRITICAL: RESEND_API_KEY cannot use test key in production. Please set a valid production Resend API key."):console.error("CRITICAL: RESEND_API_KEY not configured in production"),e.s(["sendEmail",()=>a,"sendInvitationEmail",()=>i,"sendPasswordResetEmail",()=>n])},430586,e=>{"use strict";let t={storage:{bucket:process.env.SIGNATURES_BUCKET||"signatures",paths:{unsigned:(e,t)=>`${e}/${t}_unsigned.pdf`,signed:(e,t)=>`${e}/${t}_signed.pdf`}},token:{lengthBytes:32,expiryDays:7},pdf:{signature:{width:150,height:50},table:{bottom:433,height:112},positions:{party_a:{xPercent:.292},party_b:{xPercent:.704}},metadata:{timestampFontSize:7,timestampOffsetY:12,signerNameOffsetY:22,textColor:{r:.3,g:.3,b:.3}}},email:{fromAddress:"signatures@versoholdings.com",replyTo:"support@versoholdings.com"}};e.s(["SIGNATURE_CONFIG",0,t])},821275,e=>{"use strict";var t=e.i(254799),r=e.i(430586);function a(){return t.default.randomBytes(r.SIGNATURE_CONFIG.token.lengthBytes).toString("hex")}function n(e){let t=new Date;return t.setDate(t.getDate()+(e||r.SIGNATURE_CONFIG.token.expiryDays)),t}function i(e){return new Date>new Date(e)}function s(){return"http://localhost:3000".replace(/\/+$/,"")}function o(e){let t=s();return`${t}/sign/${e}`}e.s(["calculateTokenExpiry",()=>n,"generateSignatureToken",()=>a,"generateSigningUrl",()=>o,"getAppUrl",()=>s,"isTokenExpired",()=>i])},231031,e=>{"use strict";var t=e.i(779444),r=e.i(698261),a=e.i(821776),n=e.i(796417),i=e.i(856890),s=e.i(26996),o=e.i(436944),l=e.i(88281),d=e.i(765944),p=e.i(984788),c=e.i(237011),u=e.i(712007),f=e.i(777657),m=e.i(13180),g=e.i(273827),h=e.i(193695);e.i(947956);var v=e.i(36217),y=e.i(414131),x=e.i(433669),_=e.i(107854),b=e.i(821275),w=e.i(898451),R=e.i(221640);let E=_.z.object({email:_.z.string().email("Invalid email address"),role:_.z.enum(["staff_admin","staff_ops","staff_rm","ceo"]),display_name:_.z.string().min(2,"Display name must be at least 2 characters"),title:_.z.string().optional(),is_super_admin:_.z.boolean().optional().default(!1)}),S={staff_admin:"Staff Administrator",staff_ops:"Operations Staff",staff_rm:"Relationship Manager",ceo:"Chief Executive Officer"};async function A(e){try{var t,r;let a,n=await (0,x.createClient)(),{data:{user:i}}=await n.auth.getUser();if(!i)return y.NextResponse.json({error:"Unauthorized"},{status:401});let s=(0,x.createServiceClient)();if(!await (0,R.isSuperAdmin)(s,i.id))return y.NextResponse.json({error:"Insufficient permissions"},{status:403});let o=await e.json(),l=E.parse(o),d=l.email.trim().toLowerCase(),{data:p}=await s.from("profiles").select("id").eq("email",d).maybeSingle();if(p)return y.NextResponse.json({error:"Email already registered"},{status:400});let{data:c}=await s.from("member_invitations").select("id, status").eq("entity_type","staff").eq("email",d).in("status",["pending","pending_approval"]).maybeSingle();if(c)return y.NextResponse.json({error:"A pending invitation already exists for this email"},{status:400});let{data:u}=await s.from("profiles").select("display_name, email").eq("id",i.id).single(),f=u?.display_name||u?.email||"VERSO",{data:m,error:g}=await s.from("member_invitations").insert({entity_type:"staff",entity_id:null,entity_name:"VERSO",email:d,role:l.role,is_signatory:!1,invited_by:i.id,invited_by_name:f,status:"pending",expires_at:new Date(Date.now()+6048e5).toISOString(),sent_at:new Date().toISOString(),reminder_count:0,last_reminded_at:null,metadata:{display_name:l.display_name,title:l.title||S[l.role],is_super_admin:l.is_super_admin,permissions:(t=l.role,r=l.is_super_admin,a=[...{staff_admin:["manage_investors","manage_deals","trigger_workflows","view_financials"],staff_ops:["manage_investors","trigger_workflows"],staff_rm:["manage_investors","view_financials"],ceo:["manage_investors","manage_deals","trigger_workflows","view_financials","super_admin"]}[t]||[]],r&&!a.includes("super_admin")&&a.push("super_admin"),a)}}).select().single();if(g||!m)return console.error("Invitation creation error:",g),y.NextResponse.json({error:"Failed to create invitation"},{status:500});let h=`${(0,b.getAppUrl)()}/invitation/accept?token=${m.invitation_token}`,v=await (0,w.sendInvitationEmail)({email:d,inviteeName:l.display_name,entityName:"VERSO",entityType:"staff",role:l.role,inviterName:f,acceptUrl:h,expiresAt:m.expires_at});if(!v.success)return console.error("Failed to send staff invitation email:",v.error),await s.from("member_invitations").delete().eq("id",m.id),y.NextResponse.json({error:"Failed to send invitation email. Please try again."},{status:500});return await s.from("audit_logs").insert({event_type:"authorization",actor_id:i.id,action:"staff_invited",entity_type:"staff",entity_id:m.id,action_details:{invitation_id:m.id,email:d,role:l.role,display_name:l.display_name,is_super_admin:l.is_super_admin},timestamp:new Date().toISOString()}),y.NextResponse.json({success:!0,message:"Staff member invited successfully",data:{invitation_id:m.id,email:d,role:l.role,accept_url:h}})}catch(e){if(console.error("Staff invite error:",e),e instanceof _.z.ZodError)return y.NextResponse.json({error:e.issues[0].message},{status:400});return y.NextResponse.json({error:"Internal server error"},{status:500})}}e.s(["POST",()=>A],996723);var I=e.i(996723);let k=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/admin/staff/invite/route",pathname:"/api/admin/staff/invite",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/versotech-portal/src/app/api/admin/staff/invite/route.ts",nextConfigOutput:"",userland:I}),{workAsyncStorage:C,workUnitAsyncStorage:N,serverHooks:O}=k;function P(){return(0,a.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:N})}async function T(e,t,a){k.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let y="/api/admin/staff/invite/route";y=y.replace(/\/index$/,"")||"/";let x=await k.prepare(e,t,{srcPage:y,multiZoneDraftMode:!1});if(!x)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:_,params:b,nextConfig:w,parsedUrl:R,isDraftMode:E,prerenderManifest:S,routerServerContext:A,isOnDemandRevalidate:I,revalidateOnlyGenerated:C,resolvedPathname:N,clientReferenceManifest:O,serverActionsManifest:P}=x,T=(0,o.normalizeAppPath)(y),j=!!(S.dynamicRoutes[T]||S.routes[N]),U=async()=>((null==A?void 0:A.render404)?await A.render404(e,t,R,!1):t.end("This page could not be found"),null);if(j&&!E){let e=!!S.routes[N],t=S.dynamicRoutes[T];if(t&&!1===t.fallback&&!e){if(w.experimental.adapterPath)return await U();throw new h.NoFallbackError}}let z=null;!j||k.isDev||E||(z="/index"===(z=N)?"/":z);let D=!0===k.isDev||!j,q=j&&!D;P&&O&&(0,s.setManifestsSingleton)({page:y,clientReferenceManifest:O,serverActionsManifest:P});let $=e.method||"GET",M=(0,i.getTracer)(),F=M.getActiveScopeSpan(),H={params:b,prerenderManifest:S,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:D,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:w.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>k.onRequestError(e,t,a,n,A)},sharedContext:{buildId:_}},V=new l.NodeNextRequest(e),Y=new l.NodeNextResponse(t),L=d.NextRequestAdapter.fromNodeNextRequest(V,(0,d.signalFromNodeResponse)(t));try{let s=async e=>k.handle(L,H).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=M.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${$} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${$} ${y}`)}),o=!!(0,n.getRequestMeta)(e,"minimalMode"),l=async n=>{var i,l;let d=async({previousCacheEntry:r})=>{try{if(!o&&I&&C&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(n);e.fetchMetrics=H.renderOpts.fetchMetrics;let l=H.renderOpts.pendingWaitUntil;l&&a.waitUntil&&(a.waitUntil(l),l=void 0);let d=H.renderOpts.collectedTags;if(!j)return await (0,u.sendResponse)(V,Y,i,H.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,f.toNodeOutgoingHttpHeaders)(i.headers);d&&(t[g.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=g.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,a=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=g.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await k.onRequestError(e,t,{routerKind:"App Router",routePath:y,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:I})},!1,A),t}},p=await k.handleResponse({req:e,nextConfig:w,cacheKey:z,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:S,isRoutePPREnabled:!1,isOnDemandRevalidate:I,revalidateOnlyGenerated:C,responseGenerator:d,waitUntil:a.waitUntil,isMinimalMode:o});if(!j)return null;if((null==p||null==(i=p.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==p||null==(l=p.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});o||t.setHeader("x-nextjs-cache",I?"REVALIDATED":p.isMiss?"MISS":p.isStale?"STALE":"HIT"),E&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let h=(0,f.fromNodeOutgoingHttpHeaders)(p.value.headers);return o&&j||h.delete(g.NEXT_CACHE_TAGS_HEADER),!p.cacheControl||t.getHeader("Cache-Control")||h.get("Cache-Control")||h.set("Cache-Control",(0,m.getCacheControlHeader)(p.cacheControl)),await (0,u.sendResponse)(V,Y,new Response(p.value.body,{headers:h,status:p.value.status||200})),null};F?await l(F):await M.withPropagatedContext(e.headers,()=>M.trace(p.BaseServerSpan.handleRequest,{spanName:`${$} ${y}`,kind:i.SpanKind.SERVER,attributes:{"http.method":$,"http.target":e.url}},l))}catch(t){if(t instanceof h.NoFallbackError||await k.onRequestError(e,t,{routerKind:"App Router",routePath:T,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:I})},!1,A),j)throw t;return await (0,u.sendResponse)(V,Y,new Response(null,{status:500})),null}}e.s(["handler",()=>T,"patchFetch",()=>P,"routeModule",()=>k,"serverHooks",()=>O,"workAsyncStorage",()=>C,"workUnitAsyncStorage",()=>N],231031)},261365,e=>{e.v(e=>Promise.resolve().then(()=>e(368899)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__26435c55._.js.map