module.exports=[705366,e=>{"use strict";var t=e.i(779444),n=e.i(698261),i=e.i(821776),r=e.i(796417),a=e.i(856890),s=e.i(26996),o=e.i(436944),l=e.i(88281),d=e.i(765944),u=e.i(984788),c=e.i(237011),p=e.i(712007),_=e.i(777657),v=e.i(13180),m=e.i(273827),g=e.i(193695);e.i(947956);var f=e.i(36217),h=e.i(414131),y=e.i(107854),b=e.i(433669),R=e.i(221640),w=e.i(911357),E=e.i(589912);let x=y.z.object({commitment:y.z.number().nonnegative().optional(),currency:y.z.string().length(3).optional(),status:y.z.enum(["pending","committed","partially_funded","funded","active","closed","cancelled"]).optional(),effective_date:y.z.string().optional(),funding_due_at:y.z.string().optional(),units:y.z.number().nonnegative().optional(),acknowledgement_notes:y.z.string().optional().nullable()}).optional(),C=y.z.object({investor_id:y.z.string().uuid(),relationship_role:y.z.string().optional().nullable(),allocation_status:y.z.enum(["pending","committed","active","closed","cancelled"]).optional(),notes:y.z.string().optional().nullable(),send_invite:y.z.boolean().optional(),subscription:x}),S=y.z.object({investor:y.z.object({legal_name:y.z.string().min(1,"Legal name is required"),display_name:y.z.string().optional().nullable(),type:y.z.enum(["individual","institutional","entity","family_office","fund"]).optional().nullable(),email:y.z.string().email().or(y.z.literal("")).optional().nullable(),phone:y.z.string().optional().nullable(),country:y.z.string().optional().nullable(),country_of_incorporation:y.z.string().optional().nullable(),tax_residency:y.z.string().optional().nullable()}),relationship_role:y.z.string().optional().nullable(),allocation_status:y.z.enum(["pending","committed","active","closed","cancelled"]).optional(),notes:y.z.string().optional().nullable(),send_invite:y.z.boolean().optional(),subscription:x}),A=e=>{if("string"!=typeof e)return null;let t=e.trim();return t.length>0?t:null};async function N(e,{params:t}){let{id:n}=await t;try{let e=await (0,b.createClient)(),{user:t,error:i}=await (0,R.getAuthenticatedUser)(e);if(i||!t)return h.NextResponse.json({error:"Unauthorized"},{status:401});if(!await (0,R.isStaffUser)(e,t))return h.NextResponse.json({error:"Staff access required"},{status:403});let r=(0,b.createServiceClient)(),[{data:a,error:s},{data:o,error:l},{data:d,error:u}]=await Promise.all([r.from("entity_investors").select(`
            id,
            relationship_role,
            allocation_status,
            invite_sent_at,
            created_at,
            updated_at,
            notes,
            investor:investors (
              id,
              legal_name,
              display_name,
              type,
              email,
              country,
              status,
              onboarding_status,
              aml_risk_rating
            ),
            subscription:subscriptions (
              id,
              commitment,
              currency,
              status,
              effective_date,
              funding_due_at,
              units,
              created_at,
              acknowledgement_notes
            )
          `).eq("vehicle_id",n).order("created_at",{ascending:!1}),r.from("subscriptions").select(`
            id,
            investor_id,
            vehicle_id,
            commitment,
            currency,
            status,
            effective_date,
            funding_due_at,
            units,
            acknowledgement_notes,
            created_at,
            investor:investors (
              id,
              legal_name,
              display_name,
              type,
              email,
              country,
              status,
              onboarding_status,
              aml_risk_rating
            )
          `).eq("vehicle_id",n),r.from("deals").select("id, name").eq("vehicle_id",n)]);if(s)return console.error("Entity investors fetch error:",s),h.NextResponse.json({error:"Failed to load investors"},{status:500});l&&console.error("Subscriptions fetch error:",l),u&&console.error("Deals fetch error for investor view:",u);let c=[];if(d&&d.length>0){let e=d.map(e=>e.id).filter(Boolean);if(e.length>0){let{data:t,error:n}=await r.from("investor_deal_holdings").select(`
              id,
              investor_id,
              deal_id,
              subscription_submission_id,
              status,
              subscribed_amount,
              currency,
              effective_date,
              funding_due_at,
              funded_at,
              created_at,
              updated_at,
              investor:investors (
                id,
                legal_name,
                display_name,
                type,
                email,
                country,
                status,
                onboarding_status,
                aml_risk_rating
              )
            `).in("deal_id",e);n?console.error("Holdings fetch error:",n):c=t??[]}}let p=(0,E.mergeEntityInvestorData)({entityInvestors:a??[],subscriptions:o??[],holdings:c,deals:d??[]});return h.NextResponse.json({investors:p})}catch(e){return console.error("Entity investors GET error:",e),h.NextResponse.json({error:"Internal server error"},{status:500})}}async function T(e,{params:t}){let{id:n}=await t;try{let t,i,r=await (0,b.createClient)(),{user:a,error:s}=await (0,R.getAuthenticatedUser)(r);if(s||!a)return h.NextResponse.json({error:"Unauthorized"},{status:401});if(!await (0,R.isStaffUser)(r,a))return h.NextResponse.json({error:"Staff access required"},{status:403});console.warn("[DEPRECATED] POST /api/entities/[id]/investors bypasses subscription_number system. Use POST /api/investors/[investorId]/subscriptions for proper multi-subscription support.");let o=await e.json().catch(()=>({}));t="investor_id"in o&&o.investor_id?C.parse(o):S.parse(o);let l=(0,b.createServiceClient)(),d=null,u="allocation_status"in t&&t.allocation_status?t.allocation_status:"pending",c="notes"in t?A(t.notes):null,p="relationship_role"in t?A(t.relationship_role):null;if("investor_id"in t)i=t.investor_id;else{let e=t.investor,r=e.legal_name.trim(),s=A(e.email)?.toLowerCase()??null,{data:o}=await l.from("investors").select("id").eq("legal_name",r).maybeSingle();if(o)return h.NextResponse.json({error:"Investor with this legal name already exists"},{status:409});if(s){let{data:e}=await l.from("investors").select("id").eq("email",s).maybeSingle();if(e)return h.NextResponse.json({error:"Investor with this email already exists"},{status:409})}let{data:d,error:u}=await l.from("investors").insert({legal_name:r,display_name:A(e.display_name)??r,type:e.type??null,email:s,phone:A(e.phone),country:A(e.country),country_of_incorporation:A(e.country_of_incorporation),tax_residency:A(e.tax_residency),created_by:a.id.startsWith("demo-")?null:a.id}).select("id").single();if(u||!d)return console.error("Failed to create investor:",u),h.NextResponse.json({error:"Failed to create investor"},{status:500});i=d.id,await w.auditLogger.log({actor_user_id:a.id,action:w.AuditActions.CREATE,entity:w.AuditEntities.INVESTORS,entity_id:i,metadata:{source:"entity_link",vehicle_id:n}})}let _=null,v=null;if("subscription"in t&&t.subscription){let e=t.subscription,{data:r,error:s}=await l.from("subscriptions").insert({investor_id:i,vehicle_id:n,commitment:e.commitment??null,currency:e.currency?e.currency.toUpperCase():"USD",status:e.status??"pending",effective_date:e.effective_date??null,funding_due_at:e.funding_due_at??null,units:e.units??null,acknowledgement_notes:e.acknowledgement_notes??null}).select(`
            id,
            investor_id,
            vehicle_id,
            commitment,
            currency,
            status,
            effective_date,
            funding_due_at,
            units,
            acknowledgement_notes,
            created_at
          `).single();if(s||!r)return console.error("Failed to create subscription:",s),h.NextResponse.json({error:"Failed to create subscription"},{status:500});d=r.id,u=r.status??u,await w.auditLogger.log({actor_user_id:a.id,action:w.AuditActions.SUBSCRIPTION_CREATED,entity:w.AuditEntities.SUBSCRIPTIONS,entity_id:r.id,metadata:{vehicle_id:n,investor_id:i,status:r.status}});let{data:o}=await l.from("deals").select("id, name, currency").eq("vehicle_id",n).eq("status","open").order("created_at",{ascending:!1}).limit(1).maybeSingle();if(o){v=o;let t=e.currency?.toUpperCase()||v.currency||"USD",n="active"===e.status?"funded":"pending_funding",{data:r,error:a}=await l.from("investor_deal_holdings").insert({investor_id:i,deal_id:o.id,subscription_submission_id:d,status:n,subscribed_amount:e.commitment??0,currency:t,effective_date:e.effective_date||new Date().toISOString().slice(0,10),funding_due_at:e.funding_due_at||null,funded_at:"active"===e.status?new Date().toISOString():null}).select(`
              id,
              investor_id,
              deal_id,
              subscription_submission_id,
              status,
              subscribed_amount,
              currency,
              effective_date,
              funding_due_at,
              funded_at,
              created_at,
              updated_at,
              investor:investors (
                id,
                legal_name,
                display_name,
                type,
                email,
                country,
                status,
                onboarding_status,
                aml_risk_rating
              )
            `).single();a?console.error("Failed to create holding:",a):_=r}else console.log("No active deal found for vehicle, skipping holding creation")}let{data:m,error:g}=await l.from("entity_investors").insert({vehicle_id:n,investor_id:i,relationship_role:p,allocation_status:u,notes:c,invite_sent_at:"send_invite"in t&&t.send_invite?new Date().toISOString():null,created_by:a.id.startsWith("demo-")?null:a.id}).select(`
          id,
          relationship_role,
          allocation_status,
          invite_sent_at,
          created_at,
          notes,
          investor:investors (
            id,
            legal_name,
            display_name,
            type,
            email,
            country,
            status,
            onboarding_status,
            aml_risk_rating
          ),
          subscription:subscriptions (
            id,
            commitment,
            currency,
            status,
            effective_date,
            funding_due_at,
            units,
            created_at,
            acknowledgement_notes
          )
        `).single();if(g||!m)return console.error("Failed to link investor:",g),h.NextResponse.json({error:"Failed to link investor"},{status:500});await l.from("entity_events").insert({vehicle_id:n,event_type:"investor_linked",description:`Linked investor ${m.investor?.[0]?.legal_name??i} (${u})`,changed_by:a.id.startsWith("demo-")?null:a.id,payload:{investor_id:i,allocation_status:u}}),await w.auditLogger.log({actor_user_id:a.id,action:w.AuditActions.CREATE,entity:w.AuditEntities.VEHICLES,entity_id:n,metadata:{action:"link_investor",investor_id:i,entity_investor_id:m.id,allocation_status:u}});let f=(0,E.mergeEntityInvestorData)({entityInvestors:[{...m}],subscriptions:d&&m.subscription?[{...m.subscription?.[0],id:m.subscription?.[0]?.id,investor_id:i,vehicle_id:n,investor:m.investor??null}]:d&&!m.subscription?[{id:d,investor_id:i,vehicle_id:n,commitment:t.subscription?.commitment??null,currency:t.subscription?.currency?.toUpperCase()??"USD",status:t.subscription?.status??"pending",effective_date:t.subscription?.effective_date??null,funding_due_at:t.subscription?.funding_due_at??null,units:t.subscription?.units??null,acknowledgement_notes:t.subscription?.acknowledgement_notes??null,created_at:m.created_at,investor:m.investor??null}]:[],holdings:_?[_]:[],deals:v?[v]:[]})[0]??m;return h.NextResponse.json({investor:f},{status:201})}catch(e){if(e instanceof y.z.ZodError)return h.NextResponse.json({error:"Invalid input",details:e.errors},{status:400});return console.error("Entity investors POST error:",e),h.NextResponse.json({error:"Internal server error"},{status:500})}}e.s(["GET",()=>N,"POST",()=>T],159318);var k=e.i(159318);let I=new t.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/entities/[id]/investors/route",pathname:"/api/entities/[id]/investors",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/versotech-portal/src/app/api/entities/[id]/investors/route.ts",nextConfigOutput:"",userland:k}),{workAsyncStorage:z,workUnitAsyncStorage:O,serverHooks:P}=I;function U(){return(0,i.patchFetch)({workAsyncStorage:z,workUnitAsyncStorage:O})}async function j(e,t,i){I.isDev&&(0,r.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let h="/api/entities/[id]/investors/route";h=h.replace(/\/index$/,"")||"/";let y=await I.prepare(e,t,{srcPage:h,multiZoneDraftMode:!1});if(!y)return t.statusCode=400,t.end("Bad Request"),null==i.waitUntil||i.waitUntil.call(i,Promise.resolve()),null;let{buildId:b,params:R,nextConfig:w,parsedUrl:E,isDraftMode:x,prerenderManifest:C,routerServerContext:S,isOnDemandRevalidate:A,revalidateOnlyGenerated:N,resolvedPathname:T,clientReferenceManifest:k,serverActionsManifest:z}=y,O=(0,o.normalizeAppPath)(h),P=!!(C.dynamicRoutes[O]||C.routes[T]),U=async()=>((null==S?void 0:S.render404)?await S.render404(e,t,E,!1):t.end("This page could not be found"),null);if(P&&!x){let e=!!C.routes[T],t=C.dynamicRoutes[O];if(t&&!1===t.fallback&&!e){if(w.experimental.adapterPath)return await U();throw new g.NoFallbackError}}let j=null;!P||I.isDev||x||(j="/index"===(j=T)?"/":j);let D=!0===I.isDev||!P,q=P&&!D;z&&k&&(0,s.setManifestsSingleton)({page:h,clientReferenceManifest:k,serverActionsManifest:z});let H=e.method||"GET",F=(0,a.getTracer)(),L=F.getActiveScopeSpan(),M={params:R,prerenderManifest:C,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:D,incrementalCache:(0,r.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:w.cacheLife,waitUntil:i.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,n,i,r)=>I.onRequestError(e,t,i,r,S)},sharedContext:{buildId:b}},$=new l.NodeNextRequest(e),B=new l.NodeNextResponse(t),K=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let s=async e=>I.handle(K,M).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let n=F.getRootSpanAttributes();if(!n)return;if(n.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${n.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=n.get("next.route");if(i){let t=`${H} ${i}`;e.setAttributes({"next.route":i,"http.route":i,"next.span_name":t}),e.updateName(t)}else e.updateName(`${H} ${h}`)}),o=!!(0,r.getRequestMeta)(e,"minimalMode"),l=async r=>{var a,l;let d=async({previousCacheEntry:n})=>{try{if(!o&&A&&N&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let a=await s(r);e.fetchMetrics=M.renderOpts.fetchMetrics;let l=M.renderOpts.pendingWaitUntil;l&&i.waitUntil&&(i.waitUntil(l),l=void 0);let d=M.renderOpts.collectedTags;if(!P)return await (0,p.sendResponse)($,B,a,M.renderOpts.pendingWaitUntil),null;{let e=await a.blob(),t=(0,_.toNodeOutgoingHttpHeaders)(a.headers);d&&(t[m.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let n=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,i=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:f.CachedRouteKind.APP_ROUTE,status:a.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:n,expire:i}}}}catch(t){throw(null==n?void 0:n.isStale)&&await I.onRequestError(e,t,{routerKind:"App Router",routePath:h,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:A})},!1,S),t}},u=await I.handleResponse({req:e,nextConfig:w,cacheKey:j,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:N,responseGenerator:d,waitUntil:i.waitUntil,isMinimalMode:o});if(!P)return null;if((null==u||null==(a=u.value)?void 0:a.kind)!==f.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(l=u.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});o||t.setHeader("x-nextjs-cache",A?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),x&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let g=(0,_.fromNodeOutgoingHttpHeaders)(u.value.headers);return o&&P||g.delete(m.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||g.get("Cache-Control")||g.set("Cache-Control",(0,v.getCacheControlHeader)(u.cacheControl)),await (0,p.sendResponse)($,B,new Response(u.value.body,{headers:g,status:u.value.status||200})),null};L?await l(L):await F.withPropagatedContext(e.headers,()=>F.trace(u.BaseServerSpan.handleRequest,{spanName:`${H} ${h}`,kind:a.SpanKind.SERVER,attributes:{"http.method":H,"http.target":e.url}},l))}catch(t){if(t instanceof g.NoFallbackError||await I.onRequestError(e,t,{routerKind:"App Router",routePath:O,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:A})},!1,S),P)throw t;return await (0,p.sendResponse)($,B,new Response(null,{status:500})),null}}e.s(["handler",()=>j,"patchFetch",()=>U,"routeModule",()=>I,"serverHooks",()=>P,"workAsyncStorage",()=>z,"workUnitAsyncStorage",()=>O],705366)}];

//# sourceMappingURL=6d6b6_next_dist_esm_build_templates_app-route_9d0a1072.js.map