module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},450926,a=>{a.n(a.i(933743))},718829,a=>{"use strict";var b=a.i(999684);let c=a=>{let b=a.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,b,c)=>c?c.toUpperCase():b.toLowerCase());return b.charAt(0).toUpperCase()+b.slice(1)},d=(...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim();var e={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let f=(0,b.forwardRef)(({color:a="currentColor",size:c=24,strokeWidth:f=2,absoluteStrokeWidth:g,className:h="",children:i,iconNode:j,...k},l)=>(0,b.createElement)("svg",{ref:l,...e,width:c,height:c,stroke:a,strokeWidth:g?24*Number(f)/Number(c):f,className:d("lucide",h),...!i&&!(a=>{for(let b in a)if(b.startsWith("aria-")||"role"===b||"title"===b)return!0})(k)&&{"aria-hidden":"true"},...k},[...j.map(([a,c])=>(0,b.createElement)(a,c)),...Array.isArray(i)?i:[i]])),g=(a,e)=>{let g=(0,b.forwardRef)(({className:g,...h},i)=>(0,b.createElement)(f,{ref:i,iconNode:e,className:d(`lucide-${c(a).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${a}`,g),...h}));return g.displayName=c(a),g};a.s(["default",()=>g],718829)},441196,a=>{"use strict";let b=(0,a.i(718829).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);a.s(["AlertCircle",()=>b],441196)},830116,a=>{"use strict";a.s(["InvestorDealsListClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call InvestorDealsListClient() from the server but InvestorDealsListClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/deals/investor-deals-list-client.tsx <module evaluation>","InvestorDealsListClient")},201692,a=>{"use strict";a.s(["InvestorDealsListClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call InvestorDealsListClient() from the server but InvestorDealsListClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/deals/investor-deals-list-client.tsx","InvestorDealsListClient")},595282,a=>{"use strict";a.i(830116);var b=a.i(201692);a.n(b)},735802,a=>{"use strict";var b=a.i(714898),c=a.i(198307),d=a.i(441196),e=a.i(595282);function f(a){let b=new Map;for(let c of a){let a=b.get(c.deal_id),d="submitted_at"in c?new Date(c.submitted_at).getTime():"granted_at"in c?new Date(c.granted_at).getTime():0;if(!a){b.set(c.deal_id,c);continue}d>("submitted_at"in a?new Date(a.submitted_at).getTime():"granted_at"in a?new Date(a.granted_at).getTime():0)&&b.set(c.deal_id,c)}return b}async function g(){let a=await (0,c.createClient)(),{data:{user:g},error:h}=await a.auth.getUser();if(!g||h)throw Error("Authentication required");let i=(0,c.createServiceClient)(),{data:j,error:k}=await i.from("deals").select(`
      *,
      vehicles (
        id,
        name,
        type
      ),
      deal_memberships!inner (
        role,
        accepted_at,
        dispatched_at
      ),
      fee_plans (
        id,
        name,
        description,
        is_default,
        fee_components (
          id,
          kind,
          calc_method,
          rate_bps,
          flat_amount,
          frequency,
          notes
        )
      )
    `).eq("deal_memberships.user_id",g.id).order("status",{ascending:!0}).order("close_at",{ascending:!0,nullsFirst:!1});k&&console.error("Failed to load deals",k);let l=j??[];if(0===l.length)return(0,b.jsx)("div",{className:"p-6",children:(0,b.jsxs)("div",{className:"text-center py-16",children:[(0,b.jsx)(d.AlertCircle,{className:"h-12 w-12 text-muted-foreground mx-auto mb-4"}),(0,b.jsx)("h3",{className:"text-lg font-medium text-foreground mb-2",children:"No opportunities available"}),(0,b.jsxs)("p",{className:"text-muted-foreground",children:["You haven't been dispatched to any investment opportunities yet.",(0,b.jsx)("br",{}),"Please contact your relationship manager for access."]})]})});let{data:m}=await i.from("investor_users").select("investor_id").eq("user_id",g.id),n=m?.map(a=>a.investor_id)??[],o=n[0]??null,{data:p}=await i.from("partner_users").select("partner_id").eq("user_id",g.id).maybeSingle(),q=p?.partner_id??null,r=l.map(a=>a.id),s=new Map,t=new Map,u=new Map,v={totalReferrals:0,converted:0,pipelineValue:0,pendingCommissions:0,currency:"USD"};if(q&&r.length>0){let{data:a}=await i.from("deal_memberships").select(`
        deal_id,
        investor_id,
        dispatched_at,
        interest_confirmed_at,
        investors:investor_id (
          id,
          legal_name,
          display_name
        )
      `).eq("referred_by_entity_id",q).eq("referred_by_entity_type","partner").in("deal_id",r);if(a&&a.length>0){let b=a.map(a=>{let b=a.investors;return{deal_id:a.deal_id,investor_id:a.investor_id,investor_name:b?.display_name||b?.legal_name||"Unknown Investor",dispatched_at:a.dispatched_at,interest_confirmed_at:a.interest_confirmed_at}});for(let a of b){let b=s.get(a.deal_id)||[];b.push(a),s.set(a.deal_id,b)}let c=[...new Set(b.map(a=>a.investor_id))],{data:d}=await i.from("subscriptions").select("investor_id, deal_id, status, commitment, currency, funded_at, signed_at").in("investor_id",c).in("deal_id",r);if(d)for(let a of d){let b=t.get(a.deal_id)||[];b.push(a),t.set(a.deal_id,b)}let{data:e}=await i.from("partner_commissions").select("deal_id, investor_id, rate_bps, accrual_amount, currency, status").eq("partner_id",q).in("deal_id",r);if(e)for(let a of e){let b=u.get(a.deal_id)||[];b.push(a),u.set(a.deal_id,b)}let f=["funded","active","activated","committed"],g=["pending","pending_review","approved","signed","pack_sent","pack_generated"],h=0,j=0,k=0,l="USD";for(let[,a]of t)for(let b of a)b.currency&&(l=b.currency),f.includes(b.status?.toLowerCase())?k++:g.includes(b.status?.toLowerCase())&&b.commitment&&(h+=Number(b.commitment));for(let[,a]of u)for(let b of a)"accrued"===b.status&&b.accrual_amount&&(j+=Number(b.accrual_amount),b.currency&&(l=b.currency));v={totalReferrals:b.length,converted:k,pipelineValue:h,pendingCommissions:j,currency:l}}}let w=new Map,x=[],y=[],z=[];if(r.length>0){let{data:a}=await i.from("deal_fee_structures").select(`
        id,
        deal_id,
        created_at,
        effective_at,
        published_at,
        allocation_up_to,
        price_per_share_text,
        minimum_ticket,
        term_sheet_date,
        transaction_type,
        opportunity_summary,
        issuer,
        vehicle,
        exclusive_arranger,
        purchaser,
        seller,
        structure,
        subscription_fee_percent,
        management_fee_percent,
        carried_interest_percent,
        legal_counsel,
        interest_confirmation_deadline,
        completion_date,
        completion_date_text,
        validity_date,
        term_sheet_attachment_key
      `).in("deal_id",r).eq("status","published").order("effective_at",{ascending:!1});if(a&&a.length>0&&(w=a.reduce((a,b)=>{let c=a.get(b.deal_id);if(!c)return a.set(b.deal_id,b),a;let d=a=>{let b=a.effective_at??a.published_at??a.validity_date??a.term_sheet_date??a.created_at??null;return b?new Date(b).getTime():0};return d(b)>d(c)&&a.set(b.deal_id,b),a},new Map)),n.length>0){let{data:a}=await i.from("investor_deal_interest").select(`
          id,
          deal_id,
          investor_id,
          status,
          submitted_at,
          approved_at,
          indicative_amount,
          indicative_currency,
          is_post_close
        `).in("deal_id",r).in("investor_id",n).order("submitted_at",{ascending:!1});x=a??[];let{data:b}=await i.from("deal_data_room_access").select(`
          id,
          deal_id,
          investor_id,
          granted_at,
          expires_at,
          auto_granted,
          revoked_at
        `).in("deal_id",r).in("investor_id",n).order("granted_at",{ascending:!1});y=(b??[]).filter(a=>!a.revoked_at);let{data:c}=await i.from("deal_subscription_submissions").select(`
          id,
          deal_id,
          investor_id,
          status,
          submitted_at
        `).in("deal_id",r).in("investor_id",n).order("submitted_at",{ascending:!1});z=c??[]}}let A=f(x),B=f(y),C=f(z),D=new Date,E={totalDeals:l.length,openDeals:l.filter(a=>!("closed"===a.status||"cancelled"===a.status||a.close_at&&new Date(a.close_at)<D)&&"open"===a.status).length,pendingInterests:x.filter(a=>"pending_review"===a.status).length,activeNdas:y.length,submittedSubscriptions:z.length},F=Object.fromEntries(s),G=Object.fromEntries(t),H=Object.fromEntries(u);return(0,b.jsx)(e.InvestorDealsListClient,{dealsData:l,feeStructureMap:w,interestByDeal:A,accessByDeal:B,subscriptionByDeal:C,primaryInvestorId:o,partnerId:q,summary:E,detailUrlBase:"/versotech_main/opportunities",referralsByDeal:F,referralSubscriptionsByDeal:G,partnerCommissionsByDeal:H,partnerSummary:v})}a.s(["default",()=>g,"dynamic",0,"force-dynamic"])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__d35b24b7._.js.map