module.exports=[846069,e=>{"use strict";var t=e.i(779444),a=e.i(698261),i=e.i(821776),n=e.i(796417),r=e.i(856890),o=e.i(26996),s=e.i(436944),d=e.i(88281),c=e.i(765944),l=e.i(984788),u=e.i(237011),p=e.i(712007),m=e.i(777657),_=e.i(13180),f=e.i(273827),h=e.i(193695);e.i(947956);var v=e.i(36217),g=e.i(433669),R=e.i(38896),y=e.i(414131),w=e.i(911357);let b=.01,x=e=>{if(null==e)return 0;if("number"==typeof e)return e;let t=parseFloat(e);return Number.isNaN(t)?0:t},E=(e,t,a=b)=>Math.abs(e-t)<=a,A=e=>Math.round(100*e)/100;async function N(e){let t=await (0,R.requireStaffAuth)();if(!t)return y.NextResponse.json({error:"Unauthorized"},{status:401});try{var a;let i,n,r,{suggested_match_id:o,matched_amount:s}=await e.json();if(!o)return y.NextResponse.json({error:"Missing suggested_match_id"},{status:400});let d=await (0,g.createClient)(),{data:c,error:l}=await d.from("suggested_matches").select(`
        id,
        bank_transaction_id,
        invoice_id,
        confidence,
        match_reason,
        amount_difference,
        created_at,
        bank_transactions!inner (
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
        ),
        invoices!inner (
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
        )
      `).eq("id",o).single();if(l||!c)return y.NextResponse.json({error:"Suggested match not found"},{status:404});let u=c.bank_transactions,p=c.invoices;if(!u||!p)return y.NextResponse.json({error:"Related invoice or transaction missing"},{status:404});if((u.currency||"USD")!==(p.currency||"USD"))return y.NextResponse.json({error:"Currency mismatch between bank transaction and invoice"},{status:400});let[{data:m,error:_}]=await Promise.all([d.from("reconciliation_matches").select("matched_amount").eq("bank_transaction_id",u.id).eq("status","approved")]);if(_)return console.error("Failed to load existing matches",_),y.NextResponse.json({error:"Failed to verify match context"},{status:500});let f=(m||[]).reduce((e,t)=>e+x(t.matched_amount),0),h=x(u.amount),v=A(h-f);if(v<=b)return y.NextResponse.json({error:"This bank transaction has already been fully allocated"},{status:400});let R=x(p.total),N=x(p.paid_amount),C=void 0!==p.balance_due&&null!==p.balance_due?x(p.balance_due):A(Math.max(R-N,0));if(C<=b)return y.NextResponse.json({error:"Invoice is already fully paid"},{status:400});let q=void 0!==s?A(x(s)):null,S=Math.min(C,v);if(null!==q&&q>0&&(S=Math.min(S,q)),(S=A(S))<=0||S<=b)return y.NextResponse.json({error:"Match amount must be greater than zero"},{status:400});let P=A(f+S),T=E(S,C),k=E(P,h),O="partial";T&&k?O="exact":T?O="split":k&&(O="combined");let j=c.match_reason||`${"exact"===O?"Exact":"Partial"} match from reconciliation engine`,{data:I,error:U}=await d.from("reconciliation_matches").insert({bank_transaction_id:u.id,invoice_id:p.id,match_type:O,matched_amount:S,match_confidence:c.confidence??null,match_reason:j,status:"suggested"}).select().single();if(U||!I)return console.error("Failed to create reconciliation match",U),y.NextResponse.json({error:"Failed to create reconciliation match"},{status:500});let{error:F}=await d.rpc("apply_match",{p_match_id:I.id,p_approved_by:t.id});if(F)return console.error("apply_match failed",F),await d.from("reconciliation_matches").delete().eq("id",I.id),y.NextResponse.json({error:"Failed to apply reconciliation match"},{status:500});let[D,M,$]=await Promise.all([d.from("bank_transactions").select(`
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
        `).eq("id",u.id).single(),d.from("invoices").select(`
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
        `).eq("id",p.id).single(),d.from("reconciliation_matches").select(`
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
        `).eq("bank_transaction_id",u.id).eq("status","approved")]);if(D.error||M.error||$.error)return console.error("Post-apply fetch failed",{transactionError:D.error,invoiceError:M.error,matchesError:$.error}),y.NextResponse.json({error:"Failed to load updated reconciliation data"},{status:500});let H=D.data,L=M.data,K=$.data??[],B=K.reduce((e,t)=>e+x(t.matched_amount),0),z=B<=b?"unmatched":E(B,h)?"matched":"partially_matched",V=(i=[...K.map(e=>e.invoice_id),p.id],Array.from(new Set(i.filter(e=>!!e))));if(!H||H.id!==u.id)return y.NextResponse.json({error:"Updated transaction not found"},{status:500});if(H.status!==z||(a=H.matched_invoice_ids,n=(a??[]).slice().sort(),r=V.slice().sort(),!(n.length===r.length&&n.every((e,t)=>e===r[t])))){let{data:e,error:t}=await d.from("bank_transactions").update({status:z,matched_invoice_ids:V,updated_at:new Date().toISOString()}).eq("id",u.id).select().single();if(t||!e)return console.error("Failed to reconcile bank transaction state",t),y.NextResponse.json({error:"Failed to finalize bank transaction state"},{status:500});H=e}let{error:G}=await d.from("suggested_matches").delete().eq("id",o);if(G)return y.NextResponse.json({error:"Match created but failed to remove suggestion. Please refresh the page.",deleteError:G.message},{status:500});if(L?.status==="paid"){await d.from("fee_events").update({status:"paid"}).eq("invoice_id",p.id).in("status",["accrued","invoiced"]);let{data:e}=await d.from("fee_events").select("allocation_id, fee_type, computed_amount").eq("invoice_id",p.id).eq("fee_type","flat");if(e&&e.length>0){let a=e.reduce((e,t)=>(t.allocation_id&&(e[t.allocation_id]=(e[t.allocation_id]||0)+x(t.computed_amount)),e),{});for(let[e,i]of Object.entries(a)){let{data:a}=await d.from("subscriptions").select("commitment, funded_amount, status").eq("id",e).single();if(a){if(!["pending","committed","partially_funded","funded","active"].includes(a.status)){console.warn(`⚠️ Cannot fund subscription ${e} with status '${a.status}' - skipping`);continue}let n=x(a.funded_amount),r=A(n+i),o=x(a.commitment),s=a.status;if(o>0){let e=r/o*100;e>=99.99?s="funded":e>0&&(s="partially_funded")}let{error:c}=await d.from("subscriptions").update({funded_amount:r,status:s,updated_at:new Date().toISOString()}).eq("id",e);if(c)throw console.error(`❌ CRITICAL: Failed to update subscription ${e} funded amount:`,c),Error(`Failed to update subscription funded amount: ${c.message}`);console.log(`✅ Updated subscription ${e}: funded_amount=${r}, status=${s}`),await w.auditLogger.log({actor_user_id:t.id,action:w.AuditActions.UPDATE,entity:"subscriptions",entity_id:e,metadata:{invoice_id:p.id,match_id:I.id,payment_amount:i,previous_funded:n,new_funded:r,previous_status:a.status,new_status:s,commitment:o}})}}}}else if(L?.status==="partially_paid"){let{data:e}=await d.from("fee_events").select("allocation_id, fee_type, computed_amount").eq("invoice_id",p.id).eq("fee_type","flat");if(e&&e.length>0){let t=x(L.total),a=x(L.paid_amount),i=t>0?a/t:0,n=e.reduce((e,t)=>{if(t.allocation_id){let a=x(t.computed_amount)*i;e[t.allocation_id]=(e[t.allocation_id]||0)+a}return e},{});for(let[e,t]of Object.entries(n)){let{data:a}=await d.from("subscriptions").select("commitment, funded_amount").eq("id",e).single();if(a){let i=x(a.funded_amount),n=A(Math.min(i+t,x(a.commitment))),{error:r}=await d.from("subscriptions").update({funded_amount:n,status:"partially_funded",updated_at:new Date().toISOString()}).eq("id",e);if(r)throw console.error(`❌ CRITICAL: Failed to update partially funded subscription ${e}:`,r),Error(`Failed to update subscription partial funding: ${r.message}`);console.log(`✅ Partially funded subscription ${e}: funded_amount=${n}`)}}}}return await w.auditLogger.log({actor_user_id:t.id,action:w.AuditActions.UPDATE,entity:w.AuditEntities.INVOICES,entity_id:p.id,metadata:{match_id:I.id,bank_transaction_id:u.id,applied_amount:S,previous_paid_amount:N,new_paid_amount:L?.paid_amount}}),await w.auditLogger.log({actor_user_id:t.id,action:w.AuditActions.UPDATE,entity:w.AuditEntities.BANK_TRANSACTIONS,entity_id:u.id,metadata:{match_id:I.id,applied_amount:S,status:H.status,matched_invoice_ids:H.matched_invoice_ids}}),y.NextResponse.json({success:!0,match_id:I.id,applied_amount:S,bank_transaction:H,invoice:L,matches:K,total_matched_amount:B})}catch(e){return console.error("Accept match error:",e),y.NextResponse.json({error:e?.message||"Failed to accept match"},{status:500})}}e.s(["POST",()=>N,"dynamic",0,"force-dynamic"],955665);var C=e.i(955665);let q=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/staff/reconciliation/match/accept/route",pathname:"/api/staff/reconciliation/match/accept",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/versotech-portal/src/app/api/staff/reconciliation/match/accept/route.ts",nextConfigOutput:"",userland:C}),{workAsyncStorage:S,workUnitAsyncStorage:P,serverHooks:T}=q;function k(){return(0,i.patchFetch)({workAsyncStorage:S,workUnitAsyncStorage:P})}async function O(e,t,i){q.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let g="/api/staff/reconciliation/match/accept/route";g=g.replace(/\/index$/,"")||"/";let R=await q.prepare(e,t,{srcPage:g,multiZoneDraftMode:!1});if(!R)return t.statusCode=400,t.end("Bad Request"),null==i.waitUntil||i.waitUntil.call(i,Promise.resolve()),null;let{buildId:y,params:w,nextConfig:b,parsedUrl:x,isDraftMode:E,prerenderManifest:A,routerServerContext:N,isOnDemandRevalidate:C,revalidateOnlyGenerated:S,resolvedPathname:P,clientReferenceManifest:T,serverActionsManifest:k}=R,O=(0,s.normalizeAppPath)(g),j=!!(A.dynamicRoutes[O]||A.routes[P]),I=async()=>((null==N?void 0:N.render404)?await N.render404(e,t,x,!1):t.end("This page could not be found"),null);if(j&&!E){let e=!!A.routes[P],t=A.dynamicRoutes[O];if(t&&!1===t.fallback&&!e){if(b.experimental.adapterPath)return await I();throw new h.NoFallbackError}}let U=null;!j||q.isDev||E||(U="/index"===(U=P)?"/":U);let F=!0===q.isDev||!j,D=j&&!F;k&&T&&(0,o.setManifestsSingleton)({page:g,clientReferenceManifest:T,serverActionsManifest:k});let M=e.method||"GET",$=(0,r.getTracer)(),H=$.getActiveScopeSpan(),L={params:w,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!b.experimental.authInterrupts},cacheComponents:!!b.cacheComponents,supportsDynamicResponse:F,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:b.cacheLife,waitUntil:i.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,i,n)=>q.onRequestError(e,t,i,n,N)},sharedContext:{buildId:y}},K=new d.NodeNextRequest(e),B=new d.NodeNextResponse(t),z=c.NextRequestAdapter.fromNodeNextRequest(K,(0,c.signalFromNodeResponse)(t));try{let o=async e=>q.handle(z,L).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=$.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=a.get("next.route");if(i){let t=`${M} ${i}`;e.setAttributes({"next.route":i,"http.route":i,"next.span_name":t}),e.updateName(t)}else e.updateName(`${M} ${g}`)}),s=!!(0,n.getRequestMeta)(e,"minimalMode"),d=async n=>{var r,d;let c=async({previousCacheEntry:a})=>{try{if(!s&&C&&S&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await o(n);e.fetchMetrics=L.renderOpts.fetchMetrics;let d=L.renderOpts.pendingWaitUntil;d&&i.waitUntil&&(i.waitUntil(d),d=void 0);let c=L.renderOpts.collectedTags;if(!j)return await (0,p.sendResponse)(K,B,r,L.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(r.headers);c&&(t[f.NEXT_CACHE_TAGS_HEADER]=c),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==L.renderOpts.collectedRevalidate&&!(L.renderOpts.collectedRevalidate>=f.INFINITE_CACHE)&&L.renderOpts.collectedRevalidate,i=void 0===L.renderOpts.collectedExpire||L.renderOpts.collectedExpire>=f.INFINITE_CACHE?void 0:L.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:i}}}}catch(t){throw(null==a?void 0:a.isStale)&&await q.onRequestError(e,t,{routerKind:"App Router",routePath:g,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:C})},!1,N),t}},l=await q.handleResponse({req:e,nextConfig:b,cacheKey:U,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:S,responseGenerator:c,waitUntil:i.waitUntil,isMinimalMode:s});if(!j)return null;if((null==l||null==(r=l.value)?void 0:r.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(d=l.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});s||t.setHeader("x-nextjs-cache",C?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),E&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let h=(0,m.fromNodeOutgoingHttpHeaders)(l.value.headers);return s&&j||h.delete(f.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||t.getHeader("Cache-Control")||h.get("Cache-Control")||h.set("Cache-Control",(0,_.getCacheControlHeader)(l.cacheControl)),await (0,p.sendResponse)(K,B,new Response(l.value.body,{headers:h,status:l.value.status||200})),null};H?await d(H):await $.withPropagatedContext(e.headers,()=>$.trace(l.BaseServerSpan.handleRequest,{spanName:`${M} ${g}`,kind:r.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},d))}catch(t){if(t instanceof h.NoFallbackError||await q.onRequestError(e,t,{routerKind:"App Router",routePath:O,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:C})},!1,N),j)throw t;return await (0,p.sendResponse)(K,B,new Response(null,{status:500})),null}}e.s(["handler",()=>O,"patchFetch",()=>k,"routeModule",()=>q,"serverHooks",()=>T,"workAsyncStorage",()=>S,"workUnitAsyncStorage",()=>P],846069)}];

//# sourceMappingURL=6d6b6_next_dist_esm_build_templates_app-route_48644595.js.map