module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},16933,a=>{a.n(a.i(618450))},498419,a=>{a.n(a.i(72598))},809939,a=>{"use strict";a.s(["DealsListClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call DealsListClient() from the server but DealsListClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/deals/deals-list-client.tsx <module evaluation>","DealsListClient")},570268,a=>{"use strict";a.s(["DealsListClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call DealsListClient() from the server but DealsListClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/deals/deals-list-client.tsx","DealsListClient")},34810,a=>{"use strict";a.i(809939);var b=a.i(570268);a.n(b)},159802,a=>{"use strict";var b=a.i(714898),c=a.i(198307),d=a.i(34810);async function e(){let a=(0,c.createServiceClient)(),{data:e,error:f}=await a.from("deals").select(`
      *,
      vehicles (
        name,
        type
      ),
      deal_memberships (
        user_id,
        role
      )
    `).order("created_at",{ascending:!1}),g=e||[],h={total:g.length,open:g.filter(a=>"open"===a.status).length,draft:g.filter(a=>"draft"===a.status).length,closed:g.filter(a=>"closed"===a.status).length,totalValue:g.reduce((a,b)=>a+1e3*(b.offer_unit_price||0),0)};return(0,b.jsx)(d.DealsListClient,{deals:g,summary:h})}a.s(["default",()=>e,"dynamic",0,"force-dynamic"])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__15cc0890._.js.map