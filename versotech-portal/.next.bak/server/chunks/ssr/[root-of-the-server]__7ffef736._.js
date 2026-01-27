module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},16933,a=>{a.n(a.i(618450))},498419,a=>{a.n(a.i(72598))},442633,a=>{"use strict";a.s(["IntroducerDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call IntroducerDetailClient() from the server but IntroducerDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/staff/introducers/introducer-detail-client.tsx <module evaluation>","IntroducerDetailClient")},480630,a=>{"use strict";a.s(["IntroducerDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call IntroducerDetailClient() from the server but IntroducerDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/staff/introducers/introducer-detail-client.tsx","IntroducerDetailClient")},833569,a=>{"use strict";a.i(442633);var b=a.i(480630);a.n(b)},38429,a=>{"use strict";var b=a.i(714898),c=a.i(198307),d=a.i(243085);a.i(937413);var e=a.i(131360),f=a.i(833569);async function g({params:a}){let{id:g}=await a;await (0,d.requireStaffAuth)();let h=(0,c.createServiceClient)(),{data:i,error:j}=await h.from("introducers").select("*").eq("id",g).single();(j||!i)&&(console.error("[Introducer Detail] Error:",j),(0,e.notFound)());let{data:k}=await h.from("introductions").select(`
      id,
      prospect_email,
      prospect_investor_id,
      status,
      introduced_at,
      deal_id
    `).eq("introducer_id",g).order("introduced_at",{ascending:!1}),l=(k||[]).map(a=>a.deal_id).filter(a=>null!=a),m={};if(l.length>0){let{data:a}=await h.from("deals").select("id, name").in("id",l);m=(a||[]).reduce((a,b)=>(a[b.id]={id:b.id,name:b.name},a),{})}let n=(k||[]).map(a=>a.prospect_investor_id).filter(a=>null!=a),o={};if(n.length>0){let{data:a}=await h.from("investors").select("id, legal_name").in("id",n);o=(a||[]).reduce((a,b)=>(a[b.id]={id:b.id,legal_name:b.legal_name},a),{})}let p=(k||[]).map(a=>({id:a.id,prospect_email:a.prospect_email,status:a.status||"pending",introduced_at:a.introduced_at,deal:a.deal_id&&m[a.deal_id]||null,investor:a.prospect_investor_id&&o[a.prospect_investor_id]||null})),{data:q}=await h.from("introducer_commissions").select(`
      id,
      accrual_amount,
      status,
      paid_at,
      created_at,
      deal_id,
      investor_id
    `).eq("introducer_id",g).order("created_at",{ascending:!1}),r=(q||[]).map(a=>a.investor_id).filter(a=>null!=a),s={};if(r.length>0){let{data:a}=await h.from("investors").select("id, legal_name").in("id",r);s=(a||[]).reduce((a,b)=>(a[b.id]={legal_name:b.legal_name},a),{})}let t=(q||[]).map(a=>a.deal_id).filter(a=>null!=a),u={};if(t.length>0){let{data:a}=await h.from("deals").select("id, name").in("id",t);u=(a||[]).reduce((a,b)=>(a[b.id]={name:b.name},a),{})}let v=(q||[]).map(a=>{let b=a.investor_id?s[a.investor_id]:null,c=a.deal_id?u[a.deal_id]:null;return{id:a.id,accrual_amount:Number(a.accrual_amount)||0,status:a.status||"accrued",paid_at:a.paid_at,created_at:a.created_at,deal_id:a.deal_id,investor_id:a.investor_id,investor:b||void 0,deal:c||void 0}}),{data:w}=await h.from("introducer_agreements").select(`
      id,
      status,
      reference_number,
      default_commission_bps,
      agreement_date,
      effective_date,
      expiry_date,
      special_terms,
      signed_date,
      pdf_url,
      deal_id,
      fee_plan_id,
      created_at,
      updated_at,
      deal:deal_id (
        id,
        name
      )
    `).eq("introducer_id",g).order("created_at",{ascending:!1}),x=(w||[]).map(a=>({id:a.id,status:a.status||"draft",reference_number:a.reference_number,default_commission_bps:a.default_commission_bps,agreement_date:a.agreement_date,effective_date:a.effective_date,expiry_date:a.expiry_date,special_terms:a.special_terms,signed_date:a.signed_date,pdf_url:a.pdf_url,deal_id:a.deal_id,fee_plan_id:a.fee_plan_id,created_at:a.created_at,updated_at:a.updated_at,deal:a.deal})),y=p.length,z=p.filter(a=>["allocated","converted"].includes(a.status)).length,A=v.filter(a=>"paid"===a.status).reduce((a,b)=>a+b.accrual_amount,0),B=v.filter(a=>"accrued"===a.status||"invoiced"===a.status).reduce((a,b)=>a+b.accrual_amount,0);return(0,b.jsx)(f.IntroducerDetailClient,{introducer:i,metrics:{totalIntroductions:y,successfulAllocations:z,conversionRate:y>0?z/y*100:0,totalCommissionPaid:A,pendingCommission:B},introductions:p,commissions:v,agreements:x})}a.s(["default",()=>g,"dynamic",0,"force-dynamic","revalidate",0,0])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__7ffef736._.js.map