module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},16933,a=>{a.n(a.i(618450))},498419,a=>{a.n(a.i(72598))},444007,a=>{"use strict";a.s(["CommercialPartnersDashboard",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call CommercialPartnersDashboard() from the server but CommercialPartnersDashboard is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/staff/commercial-partners/commercial-partners-dashboard.tsx <module evaluation>","CommercialPartnersDashboard")},674783,a=>{"use strict";a.s(["CommercialPartnersDashboard",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call CommercialPartnersDashboard() from the server but CommercialPartnersDashboard is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/staff/commercial-partners/commercial-partners-dashboard.tsx","CommercialPartnersDashboard")},206247,a=>{"use strict";a.i(444007);var b=a.i(674783);a.n(b)},764710,a=>{"use strict";var b=a.i(714898),c=a.i(198307),d=a.i(206247);async function e(){let a=(0,c.createServiceClient)(),{data:e,error:f}=await a.from("commercial_partners").select(`
      id,
      name,
      legal_name,
      type,
      cp_type,
      status,
      kyc_status,
      regulatory_status,
      jurisdiction,
      contact_name,
      contact_email,
      country,
      created_at
    `).order("name",{ascending:!0});f&&console.error("Failed to fetch commercial partners:",f);let g=(e||[]).map(a=>({id:a.id,name:a.name,legalName:a.legal_name,type:a.type,cpType:a.cp_type,status:a.status,kycStatus:a.kyc_status,regulatoryStatus:a.regulatory_status,jurisdiction:a.jurisdiction,contactName:a.contact_name,contactEmail:a.contact_email,country:a.country,createdAt:a.created_at})),h={totalPartners:g.length,activePartners:g.filter(a=>"active"===a.status).length,kycApproved:g.filter(a=>"approved"===a.kycStatus).length,kycPending:g.filter(a=>"pending"===a.kycStatus).length};return(0,b.jsx)(d.CommercialPartnersDashboard,{summary:h,partners:g})}a.s(["default",()=>e,"dynamic",0,"force-dynamic"])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__8b022533._.js.map