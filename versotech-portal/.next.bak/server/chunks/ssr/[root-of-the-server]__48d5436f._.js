module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},16933,a=>{a.n(a.i(618450))},498419,a=>{a.n(a.i(72598))},810300,a=>{a.n(a.i(932455))},677387,a=>{"use strict";a.s(["InvestorDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call InvestorDetailClient() from the server but InvestorDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/investors/investor-detail-client.tsx <module evaluation>","InvestorDetailClient")},835446,a=>{"use strict";a.s(["InvestorDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call InvestorDetailClient() from the server but InvestorDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/investors/investor-detail-client.tsx","InvestorDetailClient")},845708,a=>{"use strict";a.i(677387);var b=a.i(835446);a.n(b)},857614,a=>{"use strict";var b=a.i(714898),c=a.i(198307),d=a.i(243085);a.i(937413);var e=a.i(131360),f=a.i(845708);async function g({params:a}){let{id:g}=await a;await (0,d.requireStaffAuth)();let h=await (0,c.createClient)(),{data:i,error:j}=await h.from("investors").select(`
      *,
      primary_rm_profile:profiles!investors_primary_rm_fkey (
        id,
        display_name,
        email
      ),
      investor_users (
        user_id,
        profiles:profiles!investor_users_user_id_fkey (
          id,
          display_name,
          email,
          title,
          role
        )
      )
    `).eq("id",g).single();(j||!i)&&(console.error("[Investor Detail] Error:",j),(0,e.notFound)());let k={total_commitment:0,total_contributed:0,total_distributed:0,unfunded_commitment:0,current_nav:0,vehicle_count:0},l=!1;try{let{data:a,error:b}=await h.rpc("get_investor_capital_summary",{p_investor_ids:[g]});if(b)console.error("[Investor Detail] Capital metrics error:",b);else if(a&&a.length>0){let b=a[0];l=!0,k={total_commitment:Number(b.total_commitment)||0,total_contributed:Number(b.total_contributed)||0,total_distributed:Number(b.total_distributed)||0,unfunded_commitment:Number(b.unfunded_commitment)||0,current_nav:Number(b.current_nav)||0,vehicle_count:Number(b.vehicle_count)||0}}}catch(a){console.error("[Investor Detail] Capital metrics exception:",a)}return(0,b.jsx)(f.InvestorDetailClient,{investor:i,capitalMetrics:k,metricsAvailable:l})}a.s(["default",()=>g,"dynamic",0,"force-dynamic","revalidate",0,0])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__48d5436f._.js.map