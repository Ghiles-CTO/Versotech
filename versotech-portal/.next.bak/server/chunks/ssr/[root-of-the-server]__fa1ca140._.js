module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},16933,a=>{a.n(a.i(618450))},498419,a=>{a.n(a.i(72598))},880642,a=>{"use strict";a.s(["SubscriptionDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call SubscriptionDetailClient() from the server but SubscriptionDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/subscriptions/subscription-detail-client.tsx <module evaluation>","SubscriptionDetailClient")},814205,a=>{"use strict";a.s(["SubscriptionDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call SubscriptionDetailClient() from the server but SubscriptionDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/subscriptions/subscription-detail-client.tsx","SubscriptionDetailClient")},436851,a=>{"use strict";a.i(880642);var b=a.i(814205);a.n(b)},997586,a=>{"use strict";var b=a.i(714898),c=a.i(198307),d=a.i(243085);a.i(937413);var e=a.i(131360),f=a.i(436851);async function g({params:a}){let{id:g}=await a;await (0,d.requireStaffAuth)();let h=await (0,c.createClient)(),{data:i,error:j}=await h.from("subscriptions").select(`
        *,
        investor:investors (
          id,
          legal_name,
          display_name,
          type,
          country,
          email,
          phone,
          kyc_status,
          status,
          aml_risk_rating,
          is_pep,
          primary_rm,
          primary_rm_profile:profiles!investors_primary_rm_fkey (
            id,
            display_name,
            email
          )
        ),
        vehicle:vehicles (
          id,
          name,
          entity_code,
          type,
          currency,
          status,
          domicile,
          formation_date
        )
      `).eq("id",g).single();(j||!i)&&(console.error("[Subscription Detail] Error:",j),(0,e.notFound)());let{data:k}=await h.from("cashflows").select("*").eq("investor_id",i.investor_id).eq("vehicle_id",i.vehicle_id).order("date",{ascending:!1}),{data:l}=await h.from("capital_calls").select("*").eq("vehicle_id",i.vehicle_id).order("due_date",{ascending:!1}),{data:m}=await h.from("distributions").select("*").eq("vehicle_id",i.vehicle_id).order("date",{ascending:!1}),n=k?.filter(a=>"contribution"===a.type)||[],o=k?.filter(a=>"distribution"===a.type)||[],p=n.reduce((a,b)=>a+Number(b.amount),0),q=o.reduce((a,b)=>a+Number(b.amount),0),r=Number(i.commitment)-p,s={total_commitment:Number(i.commitment),total_contributed:p,total_distributed:q,unfunded_commitment:r,current_nav:p-q,total_calls:l?.length||0,pending_calls:l?.filter(a=>"pending"===a.status)?.length||0};return(0,b.jsx)(f.SubscriptionDetailClient,{subscription:i,cashflows:k||[],capitalCalls:l||[],distributions:m||[],metrics:s})}a.s(["default",()=>g,"dynamic",0,"force-dynamic"])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__fa1ca140._.js.map