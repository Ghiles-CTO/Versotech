module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},450926,a=>{a.n(a.i(933743))},804267,a=>{"use strict";a.s(["DealDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call DealDetailClient() from the server but DealDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/deals/deal-detail-client.tsx <module evaluation>","DealDetailClient")},160204,a=>{"use strict";a.s(["DealDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call DealDetailClient() from the server but DealDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/deals/deal-detail-client.tsx","DealDetailClient")},32435,a=>{"use strict";a.i(804267);var b=a.i(160204);a.n(b)},425480,a=>{"use strict";var b=a.i(714898),c=a.i(198307);a.i(937413);var d=a.i(131360),e=a.i(32435),f=a.i(243085);async function g({params:a}){let{id:g}=await a,h=await (0,c.createClient)(),{data:{user:i},error:j}=await h.auth.getUser();(!i||j)&&(0,d.redirect)("/versotech_main/login");let k=await (0,f.checkStaffAccess)(i.id),l=(0,c.createServiceClient)();k||(0,d.redirect)("/versotech_main/deals");let{data:m}=await h.from("profiles").select("role").eq("id",i.id).single(),n=m?.role||"staff_ops",{data:o}=await l.from("arranger_entities").select("id, legal_name").eq("status","active").order("legal_name"),{data:p,error:q}=await l.from("deals").select(`
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
        user_id,
        investor_id,
        role,
        invited_at,
        accepted_at,
        dispatched_at,
        viewed_at,
        interest_confirmed_at,
        nda_signed_at,
        data_room_granted_at,
        profiles:user_id (
          id,
          display_name,
          email
        ),
        investors:investor_id (
          id,
          legal_name,
          type,
          kyc_status
        ),
        invited_by_profile:invited_by (
          display_name,
          email
        )
      ),
      fee_plans (
        id,
        deal_id,
        name,
        description,
        is_default,
        is_active,
        term_sheet_id,
        introducer_id,
        partner_id,
        commercial_partner_id,
        status,
        accepted_at,
        generated_agreement_id,
        generated_placement_agreement_id,
        agreement_duration_months,
        non_circumvention_months,
        governing_law,
        vat_registration_number,
        fee_components (
          id,
          kind,
          calc_method,
          rate_bps,
          flat_amount,
          frequency,
          payment_schedule,
          duration_periods,
          duration_unit,
          hurdle_rate_bps,
          has_catchup,
          catchup_rate_bps,
          has_high_water_mark,
          has_no_cap,
          performance_cap_percent,
          payment_days_after_event,
          tier_threshold_multiplier,
          base_calculation,
          notes
        ),
        term_sheet:term_sheet_id (
          id,
          version,
          status,
          term_sheet_date,
          subscription_fee_percent,
          management_fee_percent,
          carried_interest_percent
        ),
        introducer:introducer_id (
          id,
          legal_name,
          contact_name,
          email
        ),
        partner:partner_id (
          id,
          name,
          legal_name,
          contact_name,
          contact_email
        ),
        commercial_partner:commercial_partner_id (
          id,
          name,
          legal_name,
          contact_name,
          contact_email
        ),
        introducer_agreement:generated_agreement_id (
          id,
          reference_number,
          status,
          pdf_url
        ),
        placement_agreement:generated_placement_agreement_id (
          id,
          reference_number,
          status,
          pdf_url
        )
      ),
      share_lots (
        id,
        source_id,
        units_total,
        unit_cost,
        units_remaining,
        currency,
        acquired_at,
        lockup_until,
        status,
        share_sources:source_id (
          id,
          kind,
          counterparty_name,
          notes
        )
      )
    `).eq("id",g).single();(q||!p)&&(0,d.notFound)();let{data:r}=await l.rpc("fn_deal_inventory_summary",{p_deal_id:g}),{data:s}=await l.from("deal_data_room_documents").select(`
      id,
      file_key,
      created_at,
      created_by,
      created_by_profile:created_by (
        display_name
      )
    `).eq("deal_id",g).order("created_at",{ascending:!1}),{data:t}=await l.from("deal_fee_structures").select("*").eq("deal_id",g).order("created_at",{ascending:!1}),{data:u}=await l.from("investor_deal_interest").select(`
      *,
      investors (
        id,
        legal_name
      )
    `).eq("deal_id",g).order("submitted_at",{ascending:!1}),{data:v}=await l.from("deal_data_room_access").select(`
      *,
      investors (
        id,
        legal_name
      )
    `).eq("deal_id",g).order("granted_at",{ascending:!1}),{data:w}=await l.from("deal_data_room_documents").select("*").eq("deal_id",g).order("folder",{ascending:!0}).order("created_at",{ascending:!0}),{data:x}=await l.from("deal_subscription_submissions").select(`
      *,
      investors (
        id,
        legal_name
      )
    `).eq("deal_id",g).order("submitted_at",{ascending:!1}),{data:y}=await l.from("subscriptions").select(`
      id,
      investor_id,
      commitment,
      funded_amount,
      status,
      pack_generated_at,
      pack_sent_at,
      signed_at,
      funded_at
    `).eq("deal_id",g),z=new Date(Date.now()-7776e6).toISOString(),{data:A}=await l.from("deal_activity_events").select("event_type, occurred_at").eq("deal_id",g).gte("occurred_at",z),B=(A??[]).reduce((a,b)=>(a[b.event_type]=(a[b.event_type]??0)+1,a),{}),C={...p,fee_plans:(p.fee_plans||[]).filter(a=>!1!==a.is_active)};return(0,b.jsx)(e.DealDetailClient,{deal:C,inventorySummary:r?.[0]||{total_units:0,available_units:0,reserved_units:0,allocated_units:0},documents:s||[],termSheets:t||[],interests:u||[],dataRoomAccess:v||[],dataRoomDocuments:w||[],subscriptions:x||[],subscriptionsForJourney:y||[],activitySummary:B,userProfile:{role:n},arrangerEntities:o||[]})}a.s(["default",()=>g,"dynamic",0,"force-dynamic"])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__6683c6cd._.js.map