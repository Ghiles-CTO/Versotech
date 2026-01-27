module.exports=[918622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},556704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},832319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},324725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},270406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},193695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},433669,e=>{"use strict";e.i(814247);var t=e.i(150615),r=e.i(12049),s=e.i(57824);let i=async()=>{let e=await (0,s.cookies)();return(0,t.createServerClient)("https://ipguxdssecfexudnvtia.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjE4MzcsImV4cCI6MjA3MzkzNzgzN30.AGxM_YW9hfxuu7xDpi_4xhOoRhYM7iGTS1vJ0z2FByE",{cookies:{getAll:()=>e.getAll(),setAll(t){try{t.forEach(({name:t,value:r,options:s})=>{e.set(t,r,s)})}catch(e){}}}})};e.s(["createClient",0,i,"createServiceClient",0,()=>(0,r.createClient)("https://ipguxdssecfexudnvtia.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:!1,persistSession:!1}})])},221640,e=>{"use strict";async function t(e){let{data:{user:t},error:r}=await e.auth.getUser();return{user:t,error:r}}async function r(e,t){let{data:r}=await e.from("profiles").select("role").eq("id",t.id).single();return r?.role||null}async function s(e,t,r){let{data:s}=await e.from("profiles").select("role").eq("id",t).single();if(s?.role==="ceo")return!0;let{data:i}=await e.from("ceo_users").select("user_id").eq("user_id",t).maybeSingle();if(i)return!0;let{data:n}=await e.from("staff_permissions").select("permission").eq("user_id",t).in("permission",r).limit(1).maybeSingle();return!!n}async function i(e,t){return s(e,t,["super_admin"])}async function n(e,t){let s=await r(e,t);if(s&&(s.startsWith("staff_")||"ceo"===s))return!0;if("multi_persona"===s)try{let{data:r}=await e.rpc("get_user_personas",{p_user_id:t.id});if(r&&Array.isArray(r))return r.some(e=>"staff"===e.persona_type||"ceo"===e.persona_type)}catch(e){console.error("[isStaffUser] Error checking personas:",e)}return!1}e.s(["getAuthenticatedUser",()=>t,"hasPermission",()=>s,"isStaffUser",()=>n,"isSuperAdmin",()=>i])},254799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},898451,e=>{"use strict";let t=process.env.EMAIL_FROM||"VERSO <onboarding@resend.dev>",r=process.env.RESEND_API_KEY;async function s(e){try{if(!r||"re_your_resend_api_key_here"===r)return console.error("Resend API key not configured"),{success:!1,error:"Email service not configured. Please set RESEND_API_KEY environment variable."};if(r.startsWith("re_test_"))return console.error("Test API key detected - emails will not be delivered"),{success:!1,error:"Test API key cannot be used for sending real emails."};let s=e.from||t,i=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${r}`,"Content-Type":"application/json"},body:JSON.stringify({from:s,to:e.to,subject:e.subject,html:e.html})});if(!i.ok){let e=await i.text();return console.error("Resend API error:",e),{success:!1,error:`Email send failed: ${i.status} ${i.statusText}`}}let n=await i.json();return{success:!0,messageId:n.id}}catch(e){return console.error("Email sending error:",e),{success:!1,error:e.message||"Unknown email error"}}}async function i(e){let t=e.displayName||e.email.split("@")[0],r=`
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
  `;return s({to:e.email,subject:"Reset Your Password - VERSO",html:r})}async function n(e){let t="investor"===e.entityType,r="staff"===e.entityType||["staff_admin","staff_ops","staff_rm","ceo"].includes(e.role),i={staff_admin:"Staff Administrator",staff_ops:"Operations Staff",staff_rm:"Relationship Manager",ceo:"Chief Executive Officer",member:"Member",admin:"Administrator",owner:"Owner",signatory:"Authorized Signatory"}[e.role]||e.role,n=`
    <p>You have been invited to join <strong>${e.entityName}</strong> on the VERSO Investment Platform.</p>
    <p>This secure platform provides you with comprehensive access to your investment portfolio, performance analytics, and exclusive deal opportunities.</p>
    <p>Click the button below to set up your account and access the platform.</p>
  `,a=`
    <p>You have been invited to join <strong>VERSO</strong> as a <strong>${i}</strong>.</p>
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
      ${t?n:r?a:o}
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
  `,d=r?`Welcome to VERSO - You've been invited as ${i}`:`You've been invited to join ${e.entityName} on VERSO`;return s({to:e.email,subject:d,html:l})}r?"re_your_resend_api_key_here"===r?console.error("CRITICAL: RESEND_API_KEY cannot use example value in production. Please set a valid Resend API key."):r.startsWith("re_test_")&&console.error("CRITICAL: RESEND_API_KEY cannot use test key in production. Please set a valid production Resend API key."):console.error("CRITICAL: RESEND_API_KEY not configured in production"),e.s(["sendEmail",()=>s,"sendInvitationEmail",()=>n,"sendPasswordResetEmail",()=>i])},430586,e=>{"use strict";let t={storage:{bucket:process.env.SIGNATURES_BUCKET||"signatures",paths:{unsigned:(e,t)=>`${e}/${t}_unsigned.pdf`,signed:(e,t)=>`${e}/${t}_signed.pdf`}},token:{lengthBytes:32,expiryDays:7},pdf:{signature:{width:150,height:50},table:{bottom:433,height:112},positions:{party_a:{xPercent:.292},party_b:{xPercent:.704}},metadata:{timestampFontSize:7,timestampOffsetY:12,signerNameOffsetY:22,textColor:{r:.3,g:.3,b:.3}}},email:{fromAddress:"signatures@versoholdings.com",replyTo:"support@versoholdings.com"}};e.s(["SIGNATURE_CONFIG",0,t])},821275,e=>{"use strict";var t=e.i(254799),r=e.i(430586);function s(){return t.default.randomBytes(r.SIGNATURE_CONFIG.token.lengthBytes).toString("hex")}function i(e){let t=new Date;return t.setDate(t.getDate()+(e||r.SIGNATURE_CONFIG.token.expiryDays)),t}function n(e){return new Date>new Date(e)}function a(){return"http://localhost:3000".replace(/\/+$/,"")}function o(e){let t=a();return`${t}/sign/${e}`}e.s(["calculateTokenExpiry",()=>i,"generateSignatureToken",()=>s,"generateSigningUrl",()=>o,"getAppUrl",()=>a,"isTokenExpired",()=>n])},392468,e=>{"use strict";var t=e.i(779444),r=e.i(698261),s=e.i(821776),i=e.i(796417),n=e.i(856890),a=e.i(26996),o=e.i(436944),l=e.i(88281),d=e.i(765944),c=e.i(984788),p=e.i(237011),u=e.i(712007),f=e.i(777657),m=e.i(13180),g=e.i(273827),v=e.i(193695);e.i(947956);var h=e.i(36217),y=e.i(414131),x=e.i(442862),b=e.i(107854),_=e.i(221640),w=e.i(821275),R=e.i(898451),E=e.i(433669);let A=b.z.object({email:b.z.string().email().optional(),user_id:b.z.string().uuid().optional()}).refine(e=>e.email||e.user_id,{message:"Either user_id or email is required"});async function S(e,{params:t}){try{let r,s,i,n,{id:a}=await t,o=await (0,E.createClient)(),{user:l,error:d}=await (0,_.getAuthenticatedUser)(o);if(d||!l)return y.NextResponse.json({error:"Unauthorized"},{status:401});if(!await (0,_.isStaffUser)(o,l))return y.NextResponse.json({error:"Staff access required"},{status:403});let c=(0,E.createServiceClient)(),p=await e.json(),u=A.safeParse(p);if(!u.success)return y.NextResponse.json({error:u.error.issues[0].message},{status:400});let{email:f,user_id:m}=u.data,{data:g,error:v}=await c.from("investors").select("id, legal_name").eq("id",a).single();if(v||!g)return y.NextResponse.json({error:"Investor not found"},{status:404});let h=null,b=!1;if(m){let{data:e}=await c.from("investor_users").select("investor_id, user_id").eq("investor_id",a).eq("user_id",m).single();if(e)return y.NextResponse.json({error:"User is already linked to this investor"},{status:409});h=m}else if(f){let e=f.trim().toLowerCase();n=e;let{data:t}=await c.from("profiles").select("id, email, display_name, role").eq("email",e).single();if(t){let{data:e}=await c.from("investor_users").select("investor_id, user_id").eq("investor_id",a).eq("user_id",t.id).single();if(e)return y.NextResponse.json({error:"User is already linked to this investor"},{status:409});h=t.id}else{b=!0;try{let t=e.split("@")[0],{data:n}=await c.from("profiles").select("display_name, email").eq("id",l.id).single(),o=n?.display_name||n?.email||"A team member",{data:d}=await c.from("member_invitations").select("id, status").eq("entity_type","investor").eq("entity_id",a).eq("email",e).in("status",["pending","pending_approval"]).maybeSingle();if(d)return y.NextResponse.json({error:"A pending invitation already exists for this email."},{status:409});let{data:p,error:u}=await c.from("member_invitations").insert({entity_type:"investor",entity_id:a,entity_name:g.legal_name||"Investor",email:e,role:"member",is_signatory:!1,invited_by:l.id,invited_by_name:o,status:"pending",expires_at:new Date(Date.now()+6048e5).toISOString()}).select().single();if(u||!p)return console.error("Invitation creation error:",u),y.NextResponse.json({error:"Failed to create invitation"},{status:500});s=p.id,i=`${(0,w.getAppUrl)()}/invitation/accept?token=${p.invitation_token}`;let f=await (0,R.sendInvitationEmail)({email:e,inviteeName:t,entityName:g.legal_name||"Investor",entityType:"investor",role:"member",inviterName:o,acceptUrl:i,expiresAt:p.expires_at});if(!f.success){console.error("Failed to send invitation email via Resend:",f.error);try{await c.from("member_invitations").delete().eq("id",p.id)}catch(e){console.error("Failed to cleanup invitation after email failure:",e)}return y.NextResponse.json({error:"Invitation email failed to send. Please verify the email domain and try again."},{status:502})}r=f.messageId}catch(e){return console.error("Invitation error:",e),y.NextResponse.json({error:"Failed to send invitation. User may already exist in auth system."},{status:500})}}}if(b)return(0,x.revalidatePath)(`/versotech/staff/investors/${a}`),y.NextResponse.json({message:n?`Invitation sent to ${n}`:"Invitation sent",invited:!0,email_sent:!!r,email_message_id:r,invitation_id:s,accept_url:i},{status:201});if(!h)return y.NextResponse.json({error:"User resolution failed"},{status:500});let{error:S}=await c.from("investor_users").insert({investor_id:a,user_id:h});if(S)return console.error("Link user to investor error:",S),y.NextResponse.json({error:"Failed to link user to investor"},{status:500});return(0,x.revalidatePath)(`/versotech/staff/investors/${a}`),y.NextResponse.json({message:"User linked to investor successfully",user_id:h,invited:b,email_sent:b?!!r:void 0,email_message_id:r},{status:201})}catch(e){return console.error("API /staff/investors/[id]/users POST error:",e),y.NextResponse.json({error:"Internal server error"},{status:500})}}e.s(["POST",()=>S],533902);var I=e.i(533902);let k=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/staff/investors/[id]/users/route",pathname:"/api/staff/investors/[id]/users",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/versotech-portal/src/app/api/staff/investors/[id]/users/route.ts",nextConfigOutput:"",userland:I}),{workAsyncStorage:N,workUnitAsyncStorage:C,serverHooks:P}=k;function O(){return(0,s.patchFetch)({workAsyncStorage:N,workUnitAsyncStorage:C})}async function T(e,t,s){k.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let y="/api/staff/investors/[id]/users/route";y=y.replace(/\/index$/,"")||"/";let x=await k.prepare(e,t,{srcPage:y,multiZoneDraftMode:!1});if(!x)return t.statusCode=400,t.end("Bad Request"),null==s.waitUntil||s.waitUntil.call(s,Promise.resolve()),null;let{buildId:b,params:_,nextConfig:w,parsedUrl:R,isDraftMode:E,prerenderManifest:A,routerServerContext:S,isOnDemandRevalidate:I,revalidateOnlyGenerated:N,resolvedPathname:C,clientReferenceManifest:P,serverActionsManifest:O}=x,T=(0,o.normalizeAppPath)(y),j=!!(A.dynamicRoutes[T]||A.routes[C]),U=async()=>((null==S?void 0:S.render404)?await S.render404(e,t,R,!1):t.end("This page could not be found"),null);if(j&&!E){let e=!!A.routes[C],t=A.dynamicRoutes[T];if(t&&!1===t.fallback&&!e){if(w.experimental.adapterPath)return await U();throw new v.NoFallbackError}}let q=null;!j||k.isDev||E||(q="/index"===(q=C)?"/":q);let $=!0===k.isDev||!j,D=j&&!$;O&&P&&(0,a.setManifestsSingleton)({page:y,clientReferenceManifest:P,serverActionsManifest:O});let z=e.method||"GET",F=(0,n.getTracer)(),H=F.getActiveScopeSpan(),M={params:_,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:$,incrementalCache:(0,i.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:w.cacheLife,waitUntil:s.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,s,i)=>k.onRequestError(e,t,s,i,S)},sharedContext:{buildId:b}},Y=new l.NodeNextRequest(e),V=new l.NodeNextResponse(t),L=d.NextRequestAdapter.fromNodeNextRequest(Y,(0,d.signalFromNodeResponse)(t));try{let a=async e=>k.handle(L,M).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=F.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=r.get("next.route");if(s){let t=`${z} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t)}else e.updateName(`${z} ${y}`)}),o=!!(0,i.getRequestMeta)(e,"minimalMode"),l=async i=>{var n,l;let d=async({previousCacheEntry:r})=>{try{if(!o&&I&&N&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await a(i);e.fetchMetrics=M.renderOpts.fetchMetrics;let l=M.renderOpts.pendingWaitUntil;l&&s.waitUntil&&(s.waitUntil(l),l=void 0);let d=M.renderOpts.collectedTags;if(!j)return await (0,u.sendResponse)(Y,V,n,M.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,f.toNodeOutgoingHttpHeaders)(n.headers);d&&(t[g.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=g.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,s=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=g.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:s}}}}catch(t){throw(null==r?void 0:r.isStale)&&await k.onRequestError(e,t,{routerKind:"App Router",routePath:y,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:I})},!1,S),t}},c=await k.handleResponse({req:e,nextConfig:w,cacheKey:q,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:I,revalidateOnlyGenerated:N,responseGenerator:d,waitUntil:s.waitUntil,isMinimalMode:o});if(!j)return null;if((null==c||null==(n=c.value)?void 0:n.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(l=c.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});o||t.setHeader("x-nextjs-cache",I?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),E&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let v=(0,f.fromNodeOutgoingHttpHeaders)(c.value.headers);return o&&j||v.delete(g.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||v.get("Cache-Control")||v.set("Cache-Control",(0,m.getCacheControlHeader)(c.cacheControl)),await (0,u.sendResponse)(Y,V,new Response(c.value.body,{headers:v,status:c.value.status||200})),null};H?await l(H):await F.withPropagatedContext(e.headers,()=>F.trace(c.BaseServerSpan.handleRequest,{spanName:`${z} ${y}`,kind:n.SpanKind.SERVER,attributes:{"http.method":z,"http.target":e.url}},l))}catch(t){if(t instanceof v.NoFallbackError||await k.onRequestError(e,t,{routerKind:"App Router",routePath:T,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:I})},!1,S),j)throw t;return await (0,u.sendResponse)(Y,V,new Response(null,{status:500})),null}}e.s(["handler",()=>T,"patchFetch",()=>O,"routeModule",()=>k,"serverHooks",()=>P,"workAsyncStorage",()=>N,"workUnitAsyncStorage",()=>C],392468)},261365,e=>{e.v(e=>Promise.resolve().then(()=>e(368899)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__7334f6ef._.js.map