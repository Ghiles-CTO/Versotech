module.exports=[403476,e=>{"use strict";var t=e.i(779444),a=e.i(698261),n=e.i(821776),r=e.i(796417),i=e.i(856890),o=e.i(26996),s=e.i(436944),d=e.i(88281),l=e.i(765944),c=e.i(984788),u=e.i(237011),m=e.i(712007),p=e.i(777657),_=e.i(13180),h=e.i(273827),f=e.i(193695);e.i(947956);var v=e.i(36217),R=e.i(433669),g=e.i(38896),y=e.i(414131),w=e.i(911357);let b=.01,x=e=>{if(null==e)return 0;if("number"==typeof e)return e;let t=parseFloat(e);return Number.isNaN(t)?0:t},E=(e,t,a=b)=>Math.abs(e-t)<=a,N=e=>Math.round(100*e)/100;async function A(e){let t=await (0,g.requireStaffAuth)();if(!t)return y.NextResponse.json({error:"Unauthorized"},{status:401});try{var a;let n,r,i,{bank_transaction_id:o,invoice_id:s,matched_amount:d,notes:l}=await e.json();if(!o||!s)return y.NextResponse.json({error:"Missing required fields"},{status:400});let c=await (0,R.createClient)(),[u,m,p]=await Promise.all([c.from("bank_transactions").select(`
          id,
          amount,
          currency,
          status,
          matched_invoice_ids,
          match_confidence,
          match_notes,
          value_date,
          counterparty,
          memo
        `).eq("id",o).single(),c.from("invoices").select(`
          id,
          invoice_number,
          total,
          paid_amount,
          balance_due,
          currency,
          status,
          match_status,
          paid_at,
          investor:investor_id (
            id,
            legal_name
          ),
          deal:deal_id (
            id,
            name
          )
        `).eq("id",s).single(),c.from("reconciliation_matches").select("matched_amount").eq("bank_transaction_id",o).eq("status","approved")]);if(u.error||!u.data)return y.NextResponse.json({error:"Bank transaction not found"},{status:404});if(m.error||!m.data)return y.NextResponse.json({error:"Invoice not found"},{status:404});if(p.error)return console.error("Manual match: failed to load existing matches",p.error),y.NextResponse.json({error:"Failed to verify match context"},{status:500});let _=u.data,h=m.data,f=p.data||[];if((_.currency||"USD")!==(h.currency||"USD"))return y.NextResponse.json({error:"Currency mismatch between bank transaction and invoice"},{status:400});let v=x(_.amount),g=f.reduce((e,t)=>e+x(t.matched_amount),0),A=N(v-g);if(A<=b)return y.NextResponse.json({error:"This bank transaction has no remaining funds to allocate"},{status:400});let C=x(h.total),q=x(h.paid_amount),T=void 0!==h.balance_due&&null!==h.balance_due?x(h.balance_due):N(Math.max(C-q,0));if(T<=b)return y.NextResponse.json({error:"Invoice is already fully paid"},{status:400});let S=void 0!==d?N(x(d)):null,P=Math.min(T,A);if(null!==S&&S>0&&(P=Math.min(P,S)),(P=N(P))<=0||P<=b)return y.NextResponse.json({error:"Match amount must be greater than zero"},{status:400});let O=N(g+P),k=E(P,T),j=E(O,v),I="partial";k&&j?I="exact":k?I="split":j&&(I="combined");let M=l?.trim()?l.trim():`Manual match created by ${t.displayName||"staff"}`,{data:U,error:D}=await c.from("reconciliation_matches").insert({bank_transaction_id:o,invoice_id:s,match_type:"manual",matched_amount:P,match_confidence:100,match_reason:`${M} (${I})`,notes:M,status:"suggested"}).select().single();if(D||!U)return console.error("Manual match insert failed",D),y.NextResponse.json({error:"Failed to create manual reconciliation match"},{status:500});let{error:$}=await c.rpc("apply_match",{p_match_id:U.id,p_approved_by:t.id});if($)return console.error("apply_match failed for manual match",$),await c.from("reconciliation_matches").delete().eq("id",U.id),y.NextResponse.json({error:"Failed to apply manual match"},{status:500});let[F,H,K]=await Promise.all([c.from("bank_transactions").select(`
          id,
          amount,
          currency,
          status,
          match_confidence,
          match_notes,
          matched_invoice_ids,
          value_date,
          counterparty,
          memo,
          updated_at
        `).eq("id",o).single(),c.from("invoices").select(`
          id,
          invoice_number,
          total,
          paid_amount,
          balance_due,
          status,
          match_status,
          currency,
          paid_at,
          investor:investor_id (
            id,
            legal_name
          ),
          deal:deal_id (
            id,
            name
          )
        `).eq("id",s).single(),c.from("reconciliation_matches").select(`
          id,
          bank_transaction_id,
          invoice_id,
          matched_amount,
          match_type,
          match_reason,
          match_confidence,
          status,
          approved_at,
          invoices:invoice_id (
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
        `).eq("bank_transaction_id",o).eq("status","approved")]);if(F.error||H.error||K.error)return console.error("Manual match follow-up fetch failed",{transactionError:F.error,invoiceError:H.error,matchesError:K.error}),y.NextResponse.json({error:"Failed to load updated reconciliation data"},{status:500});let L=F.data,B=H.data,z=K.data??[],V=z.reduce((e,t)=>e+x(t.matched_amount),0),G=V<=b?"unmatched":E(V,v)?"matched":"partially_matched",X=(n=z.map(e=>e.invoice_id),Array.from(new Set(n.filter(e=>!!e))));if(!L||L.id!==o)return y.NextResponse.json({error:"Updated bank transaction not found"},{status:500});if(L.status!==G||(a=L.matched_invoice_ids,r=(a??[]).slice().sort(),i=X.slice().sort(),!(r.length===i.length&&r.every((e,t)=>e===i[t])))){let{data:e,error:t}=await c.from("bank_transactions").update({status:G,matched_invoice_ids:X,updated_at:new Date().toISOString()}).eq("id",o).select().single();if(t||!e)return console.error("Failed to reconcile manual transaction state",t),y.NextResponse.json({error:"Failed to finalize transaction state"},{status:500});L=e}if(await c.from("suggested_matches").delete().eq("bank_transaction_id",o).eq("invoice_id",s),B?.status==="paid"){await c.from("fee_events").update({status:"paid"}).eq("invoice_id",s).in("status",["accrued","invoiced"]);let{data:e}=await c.from("fee_events").select("allocation_id, fee_type, computed_amount").eq("invoice_id",s).eq("fee_type","flat");if(e&&e.length>0){let a=e.reduce((e,t)=>(t.allocation_id&&(e[t.allocation_id]=(e[t.allocation_id]||0)+x(t.computed_amount)),e),{});for(let[e,n]of Object.entries(a)){let{data:a}=await c.from("subscriptions").select("commitment, funded_amount, status, investor_id, vehicle_id, num_shares, units, price_per_share, cost_per_share").eq("id",e).single();if(a){if(!["pending","committed","partially_funded","funded","active"].includes(a.status)){console.warn(`⚠️ Cannot fund subscription ${e} with status '${a.status}' - skipping`);continue}let r=x(a.funded_amount),i=N(r+n),o=x(a.commitment),d=a.status;if(o>0){let e=i/o*100;e>=99.99?d="funded":e>0&&(d="partially_funded")}let{error:l}=await c.from("subscriptions").update({funded_amount:i,status:d,updated_at:new Date().toISOString()}).eq("id",e);if(l)throw console.error(`❌ CRITICAL: Failed to update subscription ${e} funded amount:`,l),Error(`Failed to update subscription funded amount: ${l.message}`);console.log(`✅ Updated subscription ${e}: funded_amount=${i}, status=${d}`),await w.auditLogger.log({actor_user_id:t.id,action:w.AuditActions.UPDATE,entity:"subscriptions",entity_id:e,metadata:{invoice_id:s,match_id:U.id,payment_amount:n,previous_funded:r,new_funded:i,previous_status:a.status,new_status:d,commitment:o,manual_match:!0}})}}}}return await w.auditLogger.log({actor_user_id:t.id,action:w.AuditActions.UPDATE,entity:w.AuditEntities.INVOICES,entity_id:s,metadata:{match_id:U.id,bank_transaction_id:o,applied_amount:P,manual:!0,notes:M}}),await w.auditLogger.log({actor_user_id:t.id,action:w.AuditActions.UPDATE,entity:w.AuditEntities.BANK_TRANSACTIONS,entity_id:o,metadata:{match_id:U.id,applied_amount:P,manual:!0,status:L.status,matched_invoice_ids:L.matched_invoice_ids}}),y.NextResponse.json({success:!0,match_id:U.id,applied_amount:P,bank_transaction:L,invoice:B,matches:z,total_matched_amount:V})}catch(e){return console.error("Manual match error:",e),y.NextResponse.json({error:e?.message||"Failed to create manual match"},{status:500})}}e.s(["POST",()=>A,"dynamic",0,"force-dynamic"],747047);var C=e.i(747047);let q=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/staff/reconciliation/match/manual/route",pathname:"/api/staff/reconciliation/match/manual",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/versotech-portal/src/app/api/staff/reconciliation/match/manual/route.ts",nextConfigOutput:"",userland:C}),{workAsyncStorage:T,workUnitAsyncStorage:S,serverHooks:P}=q;function O(){return(0,n.patchFetch)({workAsyncStorage:T,workUnitAsyncStorage:S})}async function k(e,t,n){q.isDev&&(0,r.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let R="/api/staff/reconciliation/match/manual/route";R=R.replace(/\/index$/,"")||"/";let g=await q.prepare(e,t,{srcPage:R,multiZoneDraftMode:!1});if(!g)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:y,params:w,nextConfig:b,parsedUrl:x,isDraftMode:E,prerenderManifest:N,routerServerContext:A,isOnDemandRevalidate:C,revalidateOnlyGenerated:T,resolvedPathname:S,clientReferenceManifest:P,serverActionsManifest:O}=g,k=(0,s.normalizeAppPath)(R),j=!!(N.dynamicRoutes[k]||N.routes[S]),I=async()=>((null==A?void 0:A.render404)?await A.render404(e,t,x,!1):t.end("This page could not be found"),null);if(j&&!E){let e=!!N.routes[S],t=N.dynamicRoutes[k];if(t&&!1===t.fallback&&!e){if(b.experimental.adapterPath)return await I();throw new f.NoFallbackError}}let M=null;!j||q.isDev||E||(M="/index"===(M=S)?"/":M);let U=!0===q.isDev||!j,D=j&&!U;O&&P&&(0,o.setManifestsSingleton)({page:R,clientReferenceManifest:P,serverActionsManifest:O});let $=e.method||"GET",F=(0,i.getTracer)(),H=F.getActiveScopeSpan(),K={params:w,prerenderManifest:N,renderOpts:{experimental:{authInterrupts:!!b.experimental.authInterrupts},cacheComponents:!!b.cacheComponents,supportsDynamicResponse:U,incrementalCache:(0,r.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:b.cacheLife,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,n,r)=>q.onRequestError(e,t,n,r,A)},sharedContext:{buildId:y}},L=new d.NodeNextRequest(e),B=new d.NodeNextResponse(t),z=l.NextRequestAdapter.fromNodeNextRequest(L,(0,l.signalFromNodeResponse)(t));try{let o=async e=>q.handle(z,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=F.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${$} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${$} ${R}`)}),s=!!(0,r.getRequestMeta)(e,"minimalMode"),d=async r=>{var i,d;let l=async({previousCacheEntry:a})=>{try{if(!s&&C&&T&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await o(r);e.fetchMetrics=K.renderOpts.fetchMetrics;let d=K.renderOpts.pendingWaitUntil;d&&n.waitUntil&&(n.waitUntil(d),d=void 0);let l=K.renderOpts.collectedTags;if(!j)return await (0,m.sendResponse)(L,B,i,K.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(i.headers);l&&(t[h.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=h.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,n=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=h.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==a?void 0:a.isStale)&&await q.onRequestError(e,t,{routerKind:"App Router",routePath:R,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:C})},!1,A),t}},c=await q.handleResponse({req:e,nextConfig:b,cacheKey:M,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:N,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:T,responseGenerator:l,waitUntil:n.waitUntil,isMinimalMode:s});if(!j)return null;if((null==c||null==(i=c.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(d=c.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});s||t.setHeader("x-nextjs-cache",C?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),E&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let f=(0,p.fromNodeOutgoingHttpHeaders)(c.value.headers);return s&&j||f.delete(h.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||f.get("Cache-Control")||f.set("Cache-Control",(0,_.getCacheControlHeader)(c.cacheControl)),await (0,m.sendResponse)(L,B,new Response(c.value.body,{headers:f,status:c.value.status||200})),null};H?await d(H):await F.withPropagatedContext(e.headers,()=>F.trace(c.BaseServerSpan.handleRequest,{spanName:`${$} ${R}`,kind:i.SpanKind.SERVER,attributes:{"http.method":$,"http.target":e.url}},d))}catch(t){if(t instanceof f.NoFallbackError||await q.onRequestError(e,t,{routerKind:"App Router",routePath:k,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:C})},!1,A),j)throw t;return await (0,m.sendResponse)(L,B,new Response(null,{status:500})),null}}e.s(["handler",()=>k,"patchFetch",()=>O,"routeModule",()=>q,"serverHooks",()=>P,"workAsyncStorage",()=>T,"workUnitAsyncStorage",()=>S],403476)}];

//# sourceMappingURL=6d6b6_next_dist_esm_build_templates_app-route_ddb563b6.js.map