module.exports=[120635,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},918622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},556704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},832319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},324725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},270406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},193695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},433669,e=>{"use strict";e.i(814247);var t=e.i(150615),a=e.i(12049),r=e.i(57824);let n=async()=>{let e=await (0,r.cookies)();return(0,t.createServerClient)("https://ipguxdssecfexudnvtia.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjE4MzcsImV4cCI6MjA3MzkzNzgzN30.AGxM_YW9hfxuu7xDpi_4xhOoRhYM7iGTS1vJ0z2FByE",{cookies:{getAll:()=>e.getAll(),setAll(t){try{t.forEach(({name:t,value:a,options:r})=>{e.set(t,a,r)})}catch(e){}}}})};e.s(["createClient",0,n,"createServiceClient",0,()=>(0,a.createClient)("https://ipguxdssecfexudnvtia.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:!1,persistSession:!1}})])},68145,e=>{"use strict";var t=e.i(779444),a=e.i(698261),r=e.i(821776),n=e.i(796417),i=e.i(856890),s=e.i(26996),o=e.i(436944),l=e.i(88281),c=e.i(765944),d=e.i(984788),u=e.i(237011),p=e.i(712007),h=e.i(777657),m=e.i(13180),_=e.i(273827),f=e.i(193695);e.i(947956);var v=e.i(36217),x=e.i(433669),g=e.i(38896),R=e.i(414131);let y=e=>{if(null==e)return 0;if("number"==typeof e)return e;let t=parseFloat(e);return Number.isNaN(t)?0:t};async function E(e){if(!await (0,g.requireStaffAuth)())return R.NextResponse.json({error:"Unauthorized"},{status:401});try{let e=await (0,x.createClient)(),{data:t,error:a}=await e.from("bank_transactions").select(`
        id,
        account_ref,
        amount,
        currency,
        value_date,
        memo,
        counterparty,
        bank_reference,
        status,
        matched_invoice_ids,
        match_confidence,
        match_notes,
        match_group_id,
        import_batch_id,
        created_at,
        updated_at,
        matches:reconciliation_matches!reconciliation_matches_bank_transaction_id_fkey (
          id,
          invoice_id,
          match_type,
          matched_amount,
          match_confidence,
          match_reason,
          status,
          approved_at,
          approved_by,
          invoices (
            id,
            invoice_number,
            total,
            paid_amount,
            balance_due,
            status,
            match_status,
            currency,
            investor:investor_id (
              id,
              legal_name
            ),
            deal:deal_id (
              id,
              name
            )
          )
        ),
        suggestions:suggested_matches!suggested_matches_bank_transaction_id_fkey (
          id,
          invoice_id,
          confidence,
          match_reason,
          amount_difference,
          created_at,
          invoices (
            id,
            invoice_number,
            total,
            paid_amount,
            balance_due,
            status,
            match_status,
            currency,
            investor:investor_id (
              id,
              legal_name
            ),
            deal:deal_id (
              id,
              name
            )
          )
        )
      `).order("value_date",{ascending:!1});if(a)return console.error("Failed to fetch transactions:",a),R.NextResponse.json({error:a.message},{status:500});let r=(t||[]).map(e=>{let t=(e.matches||[]).filter(e=>"approved"===e.status),a=t.reduce((e,t)=>e+y(t.matched_amount),0),r=y(e.amount),n=Math.max(r-a,0),i=0===t.length?"unmatched":.01>=Math.abs(a-r)?"matched":"partially_matched",s=Array.from(new Set(t.map(e=>e.invoice_id).filter(Boolean)));return{...e,status:i,matched_invoice_ids:s,matches:t,matched_amount_total:a,remaining_amount:n}}),n=r.filter(e=>"matched"===e.status).length,i=r.filter(e=>"partially_matched"===e.status).length,s=r.filter(e=>"unmatched"===e.status).length,o=r.reduce((e,t)=>e+y(t.amount),0),l=r.reduce((e,t)=>e+y(t.matched_amount_total),0),c=r.filter(e=>"unmatched"===e.status).reduce((e,t)=>e+y(t.amount),0),d={total:r.length,matched:n,partiallyMatched:i,partially_matched:i,unmatched:s,totalAmount:o,matchedAmount:l,unmatchedAmount:c,suggestedMatchesCount:r.reduce((e,t)=>e+(t.suggestions||[]).length,0),resolved:0,withDiscrepancies:0};return R.NextResponse.json({transactions:r,stats:d})}catch(e){return console.error("Reconciliation error:",e),R.NextResponse.json({error:e.message||"Failed to fetch reconciliation data"},{status:500})}}e.s(["GET",()=>E,"dynamic",0,"force-dynamic"],83832);var w=e.i(83832);let C=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/staff/reconciliation/route",pathname:"/api/staff/reconciliation",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/versotech-portal/src/app/api/staff/reconciliation/route.ts",nextConfigOutput:"",userland:w}),{workAsyncStorage:b,workUnitAsyncStorage:A,serverHooks:N}=C;function k(){return(0,r.patchFetch)({workAsyncStorage:b,workUnitAsyncStorage:A})}async function I(e,t,r){C.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let x="/api/staff/reconciliation/route";x=x.replace(/\/index$/,"")||"/";let g=await C.prepare(e,t,{srcPage:x,multiZoneDraftMode:!1});if(!g)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:R,params:y,nextConfig:E,parsedUrl:w,isDraftMode:b,prerenderManifest:A,routerServerContext:N,isOnDemandRevalidate:k,revalidateOnlyGenerated:I,resolvedPathname:S,clientReferenceManifest:T,serverActionsManifest:j}=g,O=(0,o.normalizeAppPath)(x),P=!!(A.dynamicRoutes[O]||A.routes[S]),q=async()=>((null==N?void 0:N.render404)?await N.render404(e,t,w,!1):t.end("This page could not be found"),null);if(P&&!b){let e=!!A.routes[S],t=A.dynamicRoutes[O];if(t&&!1===t.fallback&&!e){if(E.experimental.adapterPath)return await q();throw new f.NoFallbackError}}let M=null;!P||C.isDev||b||(M="/index"===(M=S)?"/":M);let U=!0===C.isDev||!P,H=P&&!U;j&&T&&(0,s.setManifestsSingleton)({page:x,clientReferenceManifest:T,serverActionsManifest:j});let D=e.method||"GET",F=(0,i.getTracer)(),z=F.getActiveScopeSpan(),B={params:y,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!E.experimental.authInterrupts},cacheComponents:!!E.cacheComponents,supportsDynamicResponse:U,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:E.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>C.onRequestError(e,t,r,n,N)},sharedContext:{buildId:R}},G=new l.NodeNextRequest(e),K=new l.NodeNextResponse(t),Z=c.NextRequestAdapter.fromNodeNextRequest(G,(0,c.signalFromNodeResponse)(t));try{let s=async e=>C.handle(Z,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=F.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${D} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t)}else e.updateName(`${D} ${x}`)}),o=!!(0,n.getRequestMeta)(e,"minimalMode"),l=async n=>{var i,l;let c=async({previousCacheEntry:a})=>{try{if(!o&&k&&I&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(n);e.fetchMetrics=B.renderOpts.fetchMetrics;let l=B.renderOpts.pendingWaitUntil;l&&r.waitUntil&&(r.waitUntil(l),l=void 0);let c=B.renderOpts.collectedTags;if(!P)return await (0,p.sendResponse)(G,K,i,B.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,h.toNodeOutgoingHttpHeaders)(i.headers);c&&(t[_.NEXT_CACHE_TAGS_HEADER]=c),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=_.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,r=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=_.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await C.onRequestError(e,t,{routerKind:"App Router",routePath:x,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:k})},!1,N),t}},d=await C.handleResponse({req:e,nextConfig:E,cacheKey:M,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:k,revalidateOnlyGenerated:I,responseGenerator:c,waitUntil:r.waitUntil,isMinimalMode:o});if(!P)return null;if((null==d||null==(i=d.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(l=d.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});o||t.setHeader("x-nextjs-cache",k?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),b&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let f=(0,h.fromNodeOutgoingHttpHeaders)(d.value.headers);return o&&P||f.delete(_.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||f.get("Cache-Control")||f.set("Cache-Control",(0,m.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)(G,K,new Response(d.value.body,{headers:f,status:d.value.status||200})),null};z?await l(z):await F.withPropagatedContext(e.headers,()=>F.trace(d.BaseServerSpan.handleRequest,{spanName:`${D} ${x}`,kind:i.SpanKind.SERVER,attributes:{"http.method":D,"http.target":e.url}},l))}catch(t){if(t instanceof f.NoFallbackError||await C.onRequestError(e,t,{routerKind:"App Router",routePath:O,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:k})},!1,N),P)throw t;return await (0,p.sendResponse)(G,K,new Response(null,{status:500})),null}}e.s(["handler",()=>I,"patchFetch",()=>k,"routeModule",()=>C,"serverHooks",()=>N,"workAsyncStorage",()=>b,"workUnitAsyncStorage",()=>A],68145)},261365,e=>{e.v(e=>Promise.resolve().then(()=>e(368899)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__9905c878._.js.map