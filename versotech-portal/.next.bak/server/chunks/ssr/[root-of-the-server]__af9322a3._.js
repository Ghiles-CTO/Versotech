module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},450926,a=>{a.n(a.i(933743))},718829,a=>{"use strict";var b=a.i(999684);let c=a=>{let b=a.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,b,c)=>c?c.toUpperCase():b.toLowerCase());return b.charAt(0).toUpperCase()+b.slice(1)},d=(...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim();var e={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let f=(0,b.forwardRef)(({color:a="currentColor",size:c=24,strokeWidth:f=2,absoluteStrokeWidth:g,className:h="",children:i,iconNode:j,...k},l)=>(0,b.createElement)("svg",{ref:l,...e,width:c,height:c,stroke:a,strokeWidth:g?24*Number(f)/Number(c):f,className:d("lucide",h),...!i&&!(a=>{for(let b in a)if(b.startsWith("aria-")||"role"===b||"title"===b)return!0})(k)&&{"aria-hidden":"true"},...k},[...j.map(([a,c])=>(0,b.createElement)(a,c)),...Array.isArray(i)?i:[i]])),g=(a,e)=>{let g=(0,b.forwardRef)(({className:g,...h},i)=>(0,b.createElement)(f,{ref:i,iconNode:e,className:d(`lucide-${c(a).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${a}`,g),...h}));return g.displayName=c(a),g};a.s(["default",()=>g],718829)},441196,a=>{"use strict";let b=(0,a.i(718829).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);a.s(["AlertCircle",()=>b],441196)},166624,a=>{"use strict";a.s(["LawyerReconciliationClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call LawyerReconciliationClient() from the server but LawyerReconciliationClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/lawyer/lawyer-reconciliation-client.tsx <module evaluation>","LawyerReconciliationClient")},302010,a=>{"use strict";a.s(["LawyerReconciliationClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call LawyerReconciliationClient() from the server but LawyerReconciliationClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/lawyer/lawyer-reconciliation-client.tsx","LawyerReconciliationClient")},777259,a=>{"use strict";a.i(166624);var b=a.i(302010);a.n(b)},855900,a=>{"use strict";var b=a.i(714898),c=a.i(198307),d=a.i(441196),e=a.i(777259);async function f(){let a=await (0,c.createClient)(),{data:{user:e},error:f}=await a.auth.getUser();if(!e||f)return(0,b.jsx)("div",{className:"p-6",children:(0,b.jsxs)("div",{className:"text-center py-16",children:[(0,b.jsx)(d.AlertCircle,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),(0,b.jsx)("h3",{className:"text-lg font-medium text-foreground mb-2",children:"Authentication Required"}),(0,b.jsx)("p",{className:"text-muted-foreground",children:"Please log in to view reconciliation."})]})});let h=(0,c.createServiceClient)(),{data:i}=await h.rpc("get_user_personas",{p_user_id:e.id}),j=i?.some(a=>"lawyer"===a.persona_type)||!1,k=i?.some(a=>"arranger"===a.persona_type)||!1;if(j){let{data:a}=await h.from("lawyer_users").select("lawyer_id").eq("user_id",e.id).maybeSingle();if(a?.lawyer_id){let{data:b}=await h.from("lawyers").select("id, firm_name, display_name, specializations, is_active, assigned_deals").eq("id",a.lawyer_id).maybeSingle(),{data:c,error:d}=await h.from("deal_lawyer_assignments").select("deal_id").eq("lawyer_id",a.lawyer_id),e=(c||[]).map(a=>a.deal_id);return(!e.length||d)&&b?.assigned_deals?.length&&(e=b.assigned_deals),await g(h,e,b?{id:b.id,firm_name:b.firm_name,display_name:b.display_name,specializations:b.specializations??null,is_active:b.is_active}:null)}}if(k){let{data:a}=await h.from("arranger_users").select("arranger_id").eq("user_id",e.id).maybeSingle();if(a?.arranger_id){let{data:b}=await h.from("arranger_entities").select("id, legal_name, status").eq("id",a.arranger_id).maybeSingle(),{data:c}=await h.from("deals").select("id").eq("arranger_entity_id",a.arranger_id),d=(c||[]).map(a=>a.id),e=b?{id:b.id,firm_name:b.legal_name,display_name:b.legal_name,specializations:["Arranger"],is_active:"active"===b.status}:null;return await g(h,d,e)}}return(0,b.jsx)("div",{className:"p-6",children:(0,b.jsxs)("div",{className:"text-center py-16",children:[(0,b.jsx)(d.AlertCircle,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),(0,b.jsx)("h3",{className:"text-lg font-medium text-foreground mb-2",children:"Access Restricted"}),(0,b.jsx)("p",{className:"text-muted-foreground",children:"This section is available only to lawyers and arrangers."})]})})}async function g(a,c,d){if(!c.length)return(0,b.jsx)(e.LawyerReconciliationClient,{lawyerInfo:d,deals:[],subscriptions:[],feeEvents:[],introducerCommissions:[],partnerCommissions:[],commercialPartnerCommissions:[],allCommissions:[]});let{data:f}=await a.from("deals").select("id, name, company_name, target_amount, currency, status").in("id",c).order("created_at",{ascending:!1}),{data:g}=await a.from("subscriptions").select(`
      id,
      deal_id,
      investor_id,
      status,
      commitment,
      currency,
      funded_amount,
      outstanding_amount,
      committed_at,
      funded_at,
      investors (
        id,
        legal_name,
        display_name
      )
    `).in("deal_id",c).in("status",["committed","partially_funded","funded","active"]).order("committed_at",{ascending:!1}),{data:h}=await a.from("fee_events").select(`
      id,
      deal_id,
      investor_id,
      allocation_id,
      fee_type,
      rate_bps,
      base_amount,
      computed_amount,
      currency,
      status,
      processed_at,
      notes,
      event_date,
      created_at,
      invoice_id,
      investors (
        id,
        legal_name,
        display_name
      ),
      invoices:invoice_id (
        invoice_number,
        status,
        due_date,
        paid_at
      )
    `).in("deal_id",c).order("created_at",{ascending:!1}),{data:i}=await a.from("introducer_commissions").select(`
      id,
      status,
      accrual_amount,
      currency,
      invoice_id,
      created_at,
      deal_id,
      introducer:introducers(id, legal_name),
      deal:deals(id, name)
    `).in("deal_id",c).eq("status","invoiced").order("created_at",{ascending:!1}),{data:j}=await a.from("partner_commissions").select(`
      id,
      status,
      accrual_amount,
      currency,
      invoice_id,
      created_at,
      deal_id,
      partner:partners(id, legal_name, name),
      deal:deals(id, name)
    `).in("deal_id",c).eq("status","invoiced").order("created_at",{ascending:!1}),{data:k}=await a.from("commercial_partner_commissions").select(`
      id,
      status,
      accrual_amount,
      currency,
      invoice_id,
      created_at,
      deal_id,
      commercial_partner:commercial_partners(id, legal_name, name, display_name),
      deal:deals(id, name)
    `).in("deal_id",c).eq("status","invoiced").order("created_at",{ascending:!1}),{data:l}=await a.from("introducer_commissions").select(`
      id,
      status,
      accrual_amount,
      currency,
      invoice_id,
      created_at,
      deal_id,
      investor_id,
      introducer:introducers(id, legal_name),
      deal:deals(id, name),
      investor:investors(id, legal_name, display_name)
    `).in("deal_id",c).order("created_at",{ascending:!1}),{data:m}=await a.from("partner_commissions").select(`
      id,
      status,
      accrual_amount,
      currency,
      invoice_id,
      created_at,
      deal_id,
      investor_id,
      partner:partners(id, legal_name),
      deal:deals(id, name),
      investor:investors(id, legal_name, display_name)
    `).in("deal_id",c).order("created_at",{ascending:!1}),{data:n}=await a.from("commercial_partner_commissions").select(`
      id,
      status,
      accrual_amount,
      currency,
      invoice_id,
      created_at,
      deal_id,
      investor_id,
      commercial_partner:commercial_partners(id, legal_name),
      deal:deals(id, name),
      investor:investors(id, legal_name, display_name)
    `).in("deal_id",c).order("created_at",{ascending:!1}),o=(f||[]).map(a=>({id:a.id,name:a.name,company_name:a.company_name,target_amount:a.target_amount,currency:a.currency||"USD",status:a.status})),p=(g||[]).map(a=>{let b=Array.isArray(a.investors)?a.investors[0]:a.investors,c=o.find(b=>b.id===a.deal_id);return{id:a.id,deal_id:a.deal_id,deal_name:c?.name||"Unknown Deal",investor_id:a.investor_id,investor_name:b?.display_name||b?.legal_name||"Unknown Investor",status:a.status,commitment:a.commitment,currency:a.currency||"USD",funded_amount:a.funded_amount||0,outstanding_amount:a.outstanding_amount||0,committed_at:a.committed_at,funded_at:a.funded_at}}),q=(h||[]).map(a=>{let b=o.find(b=>b.id===a.deal_id),c=Array.isArray(a.investors)?a.investors[0]:a.investors,d=Array.isArray(a.invoices)?a.invoices[0]:a.invoices;return{id:a.id,deal_id:a.deal_id,deal_name:b?.name||"Unknown Deal",investor_id:a.investor_id,investor_name:c?.display_name||c?.legal_name||"Unknown Investor",subscription_id:a.allocation_id||null,fee_type:a.fee_type,rate_bps:a.rate_bps,base_amount:a.base_amount,computed_amount:a.computed_amount,currency:a.currency||"USD",status:a.status,processed_at:a.processed_at,notes:a.notes,event_date:a.event_date,created_at:a.created_at,invoice_id:a.invoice_id||null,invoice_number:d?.invoice_number||null,invoice_status:d?.status||null,invoice_due_date:d?.due_date||null,invoice_paid_at:d?.paid_at||null}}),r=(i||[]).map(a=>{let b=Array.isArray(a.introducer)?a.introducer[0]:a.introducer,c=Array.isArray(a.deal)?a.deal[0]:a.deal;return{id:a.id,introducer_name:b?.legal_name||"Unknown Introducer",deal_id:a.deal_id,deal_name:c?.name||null,accrual_amount:a.accrual_amount,currency:a.currency||"USD",status:a.status,invoice_id:a.invoice_id,created_at:a.created_at}}),s=(j||[]).map(a=>{let b=Array.isArray(a.partner)?a.partner[0]:a.partner,c=Array.isArray(a.deal)?a.deal[0]:a.deal;return{id:a.id,partner_name:b?.legal_name||b?.name||"Unknown Partner",deal_id:a.deal_id,deal_name:c?.name||null,accrual_amount:a.accrual_amount,currency:a.currency||"USD",status:a.status,invoice_id:a.invoice_id,created_at:a.created_at}}),t=(k||[]).map(a=>{let b=Array.isArray(a.commercial_partner)?a.commercial_partner[0]:a.commercial_partner,c=Array.isArray(a.deal)?a.deal[0]:a.deal;return{id:a.id,commercial_partner_name:b?.legal_name||b?.display_name||b?.name||"Unknown Commercial Partner",deal_id:a.deal_id,deal_name:c?.name||null,accrual_amount:a.accrual_amount,currency:a.currency||"USD",status:a.status,invoice_id:a.invoice_id,created_at:a.created_at}}),u=[];return(l||[]).forEach(a=>{let b=Array.isArray(a.introducer)?a.introducer[0]:a.introducer,c=Array.isArray(a.deal)?a.deal[0]:a.deal,d=Array.isArray(a.investor)?a.investor[0]:a.investor;u.push({id:a.id,entity_type:"introducer",entity_name:b?.legal_name||"Unknown Introducer",deal_id:a.deal_id,deal_name:c?.name||null,investor_id:a.investor_id,investor_name:d?.display_name||d?.legal_name||null,accrual_amount:Number(a.accrual_amount)||0,currency:a.currency||"USD",status:a.status,invoice_id:a.invoice_id,created_at:a.created_at})}),(m||[]).forEach(a=>{let b=Array.isArray(a.partner)?a.partner[0]:a.partner,c=Array.isArray(a.deal)?a.deal[0]:a.deal,d=Array.isArray(a.investor)?a.investor[0]:a.investor;u.push({id:a.id,entity_type:"partner",entity_name:b?.legal_name||"Unknown Partner",deal_id:a.deal_id,deal_name:c?.name||null,investor_id:a.investor_id,investor_name:d?.display_name||d?.legal_name||null,accrual_amount:Number(a.accrual_amount)||0,currency:a.currency||"USD",status:a.status,invoice_id:a.invoice_id,created_at:a.created_at})}),(n||[]).forEach(a=>{let b=Array.isArray(a.commercial_partner)?a.commercial_partner[0]:a.commercial_partner,c=Array.isArray(a.deal)?a.deal[0]:a.deal,d=Array.isArray(a.investor)?a.investor[0]:a.investor;u.push({id:a.id,entity_type:"commercial_partner",entity_name:b?.legal_name||"Unknown Commercial Partner",deal_id:a.deal_id,deal_name:c?.name||null,investor_id:a.investor_id,investor_name:d?.display_name||d?.legal_name||null,accrual_amount:Number(a.accrual_amount)||0,currency:a.currency||"USD",status:a.status,invoice_id:a.invoice_id,created_at:a.created_at})}),u.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()),(0,b.jsx)(e.LawyerReconciliationClient,{lawyerInfo:d,deals:o,subscriptions:p,feeEvents:q,introducerCommissions:r,partnerCommissions:s,commercialPartnerCommissions:t,allCommissions:u})}a.s(["default",()=>f,"dynamic",0,"force-dynamic"])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__af9322a3._.js.map