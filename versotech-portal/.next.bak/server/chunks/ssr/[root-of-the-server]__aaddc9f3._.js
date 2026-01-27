module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},450926,a=>{a.n(a.i(933743))},718829,a=>{"use strict";var b=a.i(999684);let c=a=>{let b=a.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,b,c)=>c?c.toUpperCase():b.toLowerCase());return b.charAt(0).toUpperCase()+b.slice(1)},d=(...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim();var e={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let f=(0,b.forwardRef)(({color:a="currentColor",size:c=24,strokeWidth:f=2,absoluteStrokeWidth:g,className:h="",children:i,iconNode:j,...k},l)=>(0,b.createElement)("svg",{ref:l,...e,width:c,height:c,stroke:a,strokeWidth:g?24*Number(f)/Number(c):f,className:d("lucide",h),...!i&&!(a=>{for(let b in a)if(b.startsWith("aria-")||"role"===b||"title"===b)return!0})(k)&&{"aria-hidden":"true"},...k},[...j.map(([a,c])=>(0,b.createElement)(a,c)),...Array.isArray(i)?i:[i]])),g=(a,e)=>{let g=(0,b.forwardRef)(({className:g,...h},i)=>(0,b.createElement)(f,{ref:i,iconNode:e,className:d(`lucide-${c(a).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${a}`,g),...h}));return g.displayName=c(a),g};a.s(["default",()=>g],718829)},441196,a=>{"use strict";let b=(0,a.i(718829).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);a.s(["AlertCircle",()=>b],441196)},809939,a=>{"use strict";a.s(["DealsListClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call DealsListClient() from the server but DealsListClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/deals/deals-list-client.tsx <module evaluation>","DealsListClient")},570268,a=>{"use strict";a.s(["DealsListClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call DealsListClient() from the server but DealsListClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/deals/deals-list-client.tsx","DealsListClient")},34810,a=>{"use strict";a.i(809939);var b=a.i(570268);a.n(b)},480732,a=>{"use strict";var b=a.i(714898),c=a.i(198307),d=a.i(34810),e=a.i(441196),f=a.i(243085);async function g(){let a=await (0,c.createClient)(),{data:{user:g},error:h}=await a.auth.getUser();if(!g||h)return(0,b.jsx)("div",{className:"p-6",children:(0,b.jsxs)("div",{className:"text-center py-16",children:[(0,b.jsx)(e.AlertCircle,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),(0,b.jsx)("h3",{className:"text-lg font-medium text-foreground mb-2",children:"Authentication Required"}),(0,b.jsx)("p",{className:"text-muted-foreground",children:"Please log in to view deals."})]})});let i=await (0,f.checkStaffAccess)(g.id),j=(0,c.createServiceClient)(),k=[];if(i){let{data:a}=await j.from("deals").select(`
        *,
        vehicles (
          name,
          type
        ),
        deal_memberships (
          user_id,
          role
        )
      `).order("created_at",{ascending:!1});k=a||[]}else{let{data:a}=await j.from("deals").select(`
        *,
        vehicles (
          name,
          type
        ),
        deal_memberships!inner (
          user_id,
          role
        )
      `).eq("deal_memberships.user_id",g.id).order("created_at",{ascending:!1});k=a||[]}let l={total:k.length,open:k.filter(a=>"open"===a.status).length,draft:k.filter(a=>"draft"===a.status).length,closed:k.filter(a=>"closed"===a.status).length,totalValue:k.reduce((a,b)=>a+1e3*(b.offer_unit_price||0),0)};return(0,b.jsx)(d.DealsListClient,{deals:k,summary:l,basePath:"/versotech_main"})}a.s(["default",()=>g,"dynamic",0,"force-dynamic"])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__aaddc9f3._.js.map