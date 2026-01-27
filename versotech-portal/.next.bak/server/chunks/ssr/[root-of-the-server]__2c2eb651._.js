module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},450926,a=>{a.n(a.i(933743))},844931,a=>{"use strict";a.s(["AgreementDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call AgreementDetailClient() from the server but AgreementDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx <module evaluation>","AgreementDetailClient")},262005,a=>{"use strict";a.s(["AgreementDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call AgreementDetailClient() from the server but AgreementDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx","AgreementDetailClient")},691639,a=>{"use strict";a.i(844931);var b=a.i(262005);a.n(b)},882236,a=>{"use strict";var b=a.i(714898),c=a.i(198307);a.i(937413);var d=a.i(131360),e=a.i(691639);async function f({params:a}){let{id:f}=await a,g=await (0,c.createClient)(),{data:{user:h}}=await g.auth.getUser();h||(0,d.redirect)("/auth/login");let{data:i,error:j}=await g.from("introducer_agreements").select(`
      *,
      introducer:introducer_id (
        id,
        legal_name,
        contact_name,
        email,
        status,
        logo_url
      ),
      ceo_signature_request:ceo_signature_request_id (
        id,
        status,
        signer_name,
        signer_email,
        signature_timestamp,
        signed_pdf_path
      ),
      introducer_signature_request:introducer_signature_request_id (
        id,
        status,
        signer_name,
        signer_email,
        signature_timestamp,
        signed_pdf_path
      )
    `).eq("id",f).single();(j||!i)&&(0,d.notFound)();let k=h.user_metadata?.role||h.role,l=k?.startsWith("staff_");if(!l){let{data:a}=await g.from("introducer_users").select("introducer_id").eq("user_id",h.id).single();a&&a.introducer_id===i.introducer_id||(0,d.notFound)()}return(0,b.jsx)(e.AgreementDetailClient,{agreement:i,isStaff:l,currentUserId:h.id})}a.s(["default",()=>f])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__2c2eb651._.js.map