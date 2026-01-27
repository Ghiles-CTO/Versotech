module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},450926,a=>{a.n(a.i(933743))},718829,a=>{"use strict";var b=a.i(999684);let c=a=>{let b=a.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,b,c)=>c?c.toUpperCase():b.toLowerCase());return b.charAt(0).toUpperCase()+b.slice(1)},d=(...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim();var e={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let f=(0,b.forwardRef)(({color:a="currentColor",size:c=24,strokeWidth:f=2,absoluteStrokeWidth:g,className:h="",children:i,iconNode:j,...k},l)=>(0,b.createElement)("svg",{ref:l,...e,width:c,height:c,stroke:a,strokeWidth:g?24*Number(f)/Number(c):f,className:d("lucide",h),...!i&&!(a=>{for(let b in a)if(b.startsWith("aria-")||"role"===b||"title"===b)return!0})(k)&&{"aria-hidden":"true"},...k},[...j.map(([a,c])=>(0,b.createElement)(a,c)),...Array.isArray(i)?i:[i]])),g=(a,e)=>{let g=(0,b.forwardRef)(({className:g,...h},i)=>(0,b.createElement)(f,{ref:i,iconNode:e,className:d(`lucide-${c(a).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${a}`,g),...h}));return g.displayName=c(a),g};a.s(["default",()=>g],718829)},441196,a=>{"use strict";let b=(0,a.i(718829).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);a.s(["AlertCircle",()=>b],441196)},581295,a=>{"use strict";a.s(["MandateDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call MandateDetailClient() from the server but MandateDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/mandates/mandate-detail-client.tsx <module evaluation>","MandateDetailClient")},321289,a=>{"use strict";a.s(["MandateDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call MandateDetailClient() from the server but MandateDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/mandates/mandate-detail-client.tsx","MandateDetailClient")},275351,a=>{"use strict";a.i(581295);var b=a.i(321289);a.n(b)},67110,a=>{"use strict";var b=a.i(714898),c=a.i(198307);a.i(937413);var d=a.i(131360),e=a.i(275351),f=a.i(441196),g=a.i(243085);async function h({params:a}){let{mandateId:h}=await a,i=await (0,c.createClient)(),{data:{user:j},error:k}=await i.auth.getUser();(!j||k)&&(0,d.redirect)("/versotech_main/login");let l=await (0,g.checkStaffAccess)(j.id),m=(0,c.createServiceClient)(),{data:n}=await m.rpc("get_user_personas",{p_user_id:j.id}),o=n?.some(a=>"arranger"===a.persona_type)||!1;if(!l&&!o)return(0,b.jsx)("div",{className:"p-6",children:(0,b.jsxs)("div",{className:"text-center py-16",children:[(0,b.jsx)(f.AlertCircle,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),(0,b.jsx)("h3",{className:"text-lg font-medium text-foreground mb-2",children:"Access Restricted"}),(0,b.jsx)("p",{className:"text-muted-foreground",children:"Mandate details are only available to staff and arrangers."})]})});let p=[];if(o){let{data:a}=await m.from("arranger_users").select("arranger_id").eq("user_id",j.id);p=a?.map(a=>a.arranger_id)||[]}let q=`
    *,
    vehicles (
      id,
      name,
      type,
      currency
    ),
    arranger_entities:arranger_entity_id (
      id,
      legal_name
    ),
    deal_memberships (
      deal_id,
      user_id,
      investor_id,
      role,
      dispatched_at,
      viewed_at,
      interest_confirmed_at,
      nda_signed_at,
      data_room_granted_at,
      investors:investor_id (
        id,
        legal_name,
        type,
        kyc_status
      )
    )
  `,r=null,s=null;if(l){let a=await m.from("deals").select(q).eq("id",h).single();r=a.data,s=a.error}else if(o&&p.length>0){let a=await m.from("deals").select(q).eq("id",h).in("arranger_entity_id",p).single();r=a.data,s=a.error}else(0,d.notFound)();s&&(console.error("[MandateDetailPage] Deal query error:",s),(0,d.notFound)()),r||(0,d.notFound)();let{data:t}=await m.from("deal_fee_structures").select("*").eq("deal_id",h).order("created_at",{ascending:!1}),{data:u}=await m.from("deal_data_room_documents").select(`
      id,
      file_key,
      folder,
      created_at,
      created_by,
      created_by_profile:created_by (
        display_name
      )
    `).eq("deal_id",h).order("folder",{ascending:!0}).order("created_at",{ascending:!0}),{data:v}=await m.from("subscriptions").select(`
      id,
      investor_id,
      status,
      pack_generated_at,
      pack_sent_at,
      signed_at,
      funded_at,
      investors:investor_id (
        id,
        legal_name,
        type
      )
    `).eq("deal_id",h),{data:w}=await m.from("tasks").select("*").eq("related_deal_id",h).in("kind",["countersignature","subscription_pack_signature"]).in("status",["pending","in_progress"]).order("due_at",{ascending:!0,nullsFirst:!1}),{data:x}=await m.from("investor_deal_interest").select(`
      *,
      investors (
        id,
        legal_name
      )
    `).eq("deal_id",h).order("submitted_at",{ascending:!1}),{data:y}=await m.from("signature_requests").select(`
      id,
      signer_name,
      signer_email,
      signer_role,
      document_type,
      status,
      signature_timestamp,
      email_sent_at,
      created_at,
      subscription_id,
      investor_id,
      investors:investor_id (
        id,
        legal_name
      )
    `).eq("deal_id",h).order("created_at",{ascending:!1});return(0,b.jsx)(e.MandateDetailClient,{deal:r,termSheets:t||[],dataRoomDocuments:u||[],subscriptions:v||[],pendingTasks:w||[],interests:x||[],signatureHistory:y||[]})}a.s(["default",()=>h,"dynamic",0,"force-dynamic"])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__406b8645._.js.map