module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},16933,a=>{a.n(a.i(618450))},498419,a=>{a.n(a.i(72598))},804267,a=>{"use strict";a.s(["DealDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call DealDetailClient() from the server but DealDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/deals/deal-detail-client.tsx <module evaluation>","DealDetailClient")},160204,a=>{"use strict";a.s(["DealDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call DealDetailClient() from the server but DealDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/deals/deal-detail-client.tsx","DealDetailClient")},32435,a=>{"use strict";a.i(804267);var b=a.i(160204);a.n(b)},818805,a=>{"use strict";var b=a.i(714898),c=a.i(198307);a.i(937413);var d=a.i(131360),e=a.i(32435);async function f({params:a}){let{id:f}=await a,g=await (0,c.createClient)(),{data:{user:h}}=await g.auth.getUser();h||(0,d.redirect)("/versotech/login");let{data:i}=await g.from("profiles").select("role").eq("id",h.id).single();i&&["staff_admin","staff_ops","staff_rm","ceo"].includes(i.role)||(0,d.redirect)("/versotech/staff");let j=i.role,k=(0,c.createServiceClient)(),{data:l,error:m}=await k.from("deals").select(`
      *,
      vehicles (
        id,
        name,
        type,
        currency
      ),
      deal_memberships (
        user_id,
        investor_id,
        role,
        invited_at,
        accepted_at,
        profiles:user_id (
          id,
          display_name,
          email
        ),
        investors:investor_id (
          id,
          legal_name,
          type
        ),
        invited_by_profile:invited_by (
          display_name,
          email
        )
      ),
      fee_plans (
        id,
        name,
        description,
        is_default,
        is_active,
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
          tier_threshold_multiplier,
          base_calculation,
          notes
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
    `).eq("id",f).single();m&&(console.error("[Deal Detail] Error fetching deal:",m),(0,d.redirect)("/versotech/staff/deals")),l||(console.error("[Deal Detail] Deal not found with ID:",f),(0,d.redirect)("/versotech/staff/deals")),console.log("[Deal Detail] Deal loaded successfully:",l.name);let{data:n}=await k.rpc("fn_deal_inventory_summary",{p_deal_id:f}),{data:o}=await k.from("deal_data_room_documents").select(`
      id,
      file_key,
      created_at,
      created_by,
      created_by_profile:created_by (
        display_name
      )
    `).eq("deal_id",f).order("created_at",{ascending:!1}),{data:p}=await k.from("deal_fee_structures").select("*").eq("deal_id",f).order("created_at",{ascending:!1}),{data:q}=await k.from("investor_deal_interest").select(`
      *,
      investors (
        id,
        legal_name
      )
    `).eq("deal_id",f).order("submitted_at",{ascending:!1}),{data:r}=await k.from("deal_data_room_access").select(`
      *,
      investors (
        id,
        legal_name
      )
    `).eq("deal_id",f).order("granted_at",{ascending:!1}),{data:s}=await k.from("deal_data_room_documents").select("*").eq("deal_id",f).order("folder",{ascending:!0}).order("created_at",{ascending:!0}),{data:t}=await k.from("deal_subscription_submissions").select(`
      *,
      investors (
        id,
        legal_name
      )
    `).eq("deal_id",f).order("submitted_at",{ascending:!1}),u=new Date(Date.now()-7776e6).toISOString(),{data:v}=await k.from("deal_activity_events").select("event_type, occurred_at").eq("deal_id",f).gte("occurred_at",u),w=(v??[]).reduce((a,b)=>(a[b.event_type]=(a[b.event_type]??0)+1,a),{}),x={...l,fee_plans:(l.fee_plans||[]).filter(a=>!1!==a.is_active)};return(0,b.jsx)(e.DealDetailClient,{deal:x,inventorySummary:n?.[0]||{total_units:0,available_units:0,reserved_units:0,allocated_units:0},documents:o||[],termSheets:p||[],interests:q||[],dataRoomAccess:r||[],dataRoomDocuments:s||[],subscriptions:t||[],activitySummary:w,userProfile:{role:j}})}a.s(["default",()=>f,"dynamic",0,"force-dynamic"])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__f80d794f._.js.map