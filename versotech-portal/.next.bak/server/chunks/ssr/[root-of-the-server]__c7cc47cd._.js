module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},450926,a=>{a.n(a.i(933743))},254799,(a,b,c)=>{b.exports=a.x("crypto",()=>require("crypto"))},689784,a=>{"use strict";var b=a.i(198307);async function c(){return await (0,b.createClient)()}a.s(["createSmartClient",()=>c])},794428,a=>{"use strict";a.s(["EntityDetailEnhanced",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call EntityDetailEnhanced() from the server but EntityDetailEnhanced is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/entities/entity-detail-enhanced.tsx <module evaluation>","EntityDetailEnhanced")},210146,a=>{"use strict";a.s(["EntityDetailEnhanced",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call EntityDetailEnhanced() from the server but EntityDetailEnhanced is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/entities/entity-detail-enhanced.tsx","EntityDetailEnhanced")},696474,a=>{"use strict";a.i(794428);var b=a.i(210146);a.n(b)},580129,a=>{"use strict";var b=a.i(254799);let c={active:0,committed:1,pending:2,closed:3,cancelled:4,archived:5},d={funded:"active",active:"active",pending:"pending",pending_funding:"pending",committed:"committed",closed:"closed",cancelled:"cancelled"};function e(a,c){return{id:c.id??(0,b.randomUUID)(),commitment:c.commitment??null,currency:c.currency??null,status:c.status??null,effective_date:c.effective_date??null,funding_due_at:c.funding_due_at??null,units:c.units??null,acknowledgement_notes:c.acknowledgement_notes??null,created_at:c.created_at??null,origin:a}}function f(a){return e("holding_projection",{id:a.subscription_submission_id??`holding-${a.id}`,commitment:a.subscribed_amount??null,currency:a.currency??null,status:d[a.status??"pending"]??"pending",effective_date:a.effective_date??null,funding_due_at:a.funding_due_at??null,units:null,acknowledgement_notes:null,created_at:a.created_at??null})}function g(a){let b=a.reduce((a,b)=>a+(b.commitment??0),0);return b>0?b:null}function h(a){let b=a.reduce((a,b)=>a+(b.subscribed_amount??0),0);return b>0?b:null}function i(a){return 0===a.length?null:[...a].sort((a,b)=>{let c=a.created_at?new Date(a.created_at).getTime():0;return(b.created_at?new Date(b.created_at).getTime():0)-c})[0]??null}function j({entityInvestors:a=[],subscriptions:b=[],holdings:j=[],deals:k=[]}){let l=new Map,m=new Set,n=new Map;for(let o of(k?.forEach(a=>{a?.id&&n.set(a.id,a.name??null)}),a?.forEach(a=>{let b=a.investor?.id??a.investor_id??a.id,c=[];if(a.subscription){let b=e("linked",a.subscription);c.push(b),m.add(b.id)}let d={id:a.id,relationship_role:a.relationship_role??null,allocation_status:a.allocation_status??null,invite_sent_at:a.invite_sent_at??null,created_at:a.created_at,updated_at:a.updated_at??null,notes:a.notes??null,investor:a.investor??null,subscription:i(c),subscriptions:c,holdings:[],total_commitment:g(c),total_holdings_amount:null,source:"entity_link"};l.set(b,d)}),b?.forEach(a=>{if(!a?.investor_id||m.has(a.id))return;let b=e("auto_discovered",a);m.add(b.id);let c=l.get(a.investor_id);if(c)c.subscriptions=c.subscriptions??[],c.subscriptions.push(b),c.subscription=i(c.subscriptions),c.total_commitment=g(c.subscriptions),c.source="entity_link"===c.source&&(c.holdings?.length??0)>0?"hybrid":"entity_link"===c.source?"entity_link":"subscription_only",c.investor||(c.investor=a.investor??null);else{let c={id:`subscription-${a.id}`,relationship_role:"Subscription Holder",allocation_status:a.status??"pending",invite_sent_at:null,created_at:a.created_at??new Date().toISOString(),updated_at:null,notes:"Auto-discovered via subscription record",investor:a.investor??null,subscription:b,subscriptions:[b],holdings:[],total_commitment:b.commitment??null,total_holdings_amount:null,source:"subscription_only"};l.set(a.investor_id,c)}}),j?.forEach(a=>{let b;if(!a?.investor_id)return;let c=(b=a.deal_id??"unknown",{id:a.id,deal_id:b,deal_name:n.get(b)??null,status:a.status??null,subscribed_amount:a.subscribed_amount??null,currency:a.currency??null,effective_date:a.effective_date??null,funding_due_at:a.funding_due_at??null,funded_at:a.funded_at??null,created_at:a.created_at??null,updated_at:a.updated_at??null}),e=l.get(a.investor_id);if(e){if(e.holdings=e.holdings??[],e.holdings.some(a=>a.id===c.id)||e.holdings.push(c),e.total_holdings_amount=h(e.holdings),!e.subscription&&e.subscriptions&&0===e.subscriptions.length){let b=f(a);e.subscriptions=[b],e.subscription=b,e.total_commitment=g(e.subscriptions)}e.investor||(e.investor=a.investor??null),e.source="entity_link"===e.source?(e.subscriptions?.length??0)>0?"hybrid":"entity_link":(e.subscriptions?.length??0)>0?"hybrid":"holding_only"}else{let b=f(a),e={id:`holding-${a.id}`,relationship_role:"Holding Participant",allocation_status:d[a.status??"pending"]??"pending",invite_sent_at:null,created_at:a.created_at??new Date().toISOString(),updated_at:a.updated_at??null,notes:`Auto-discovered holding for deal ${c.deal_name??a.deal_id??""}`.trim(),investor:a.investor??null,subscription:b,subscriptions:[b],holdings:[c],total_commitment:b.commitment??null,total_holdings_amount:c.subscribed_amount??null,source:"holding_only"};l.set(a.investor_id,e)}}),l.values())){o.subscriptions=o.subscriptions??[],o.holdings=o.holdings??[],o.total_commitment=g(o.subscriptions),o.total_holdings_amount=h(o.holdings),o.subscription=i(o.subscriptions),o.allocation_status=function(a,b,e){let f=[a??null,0===b.length?null:b.map(a=>a.status??"pending").sort((a,b)=>(c[a]??99)-(c[b]??99))[0]??null,0===e.length?null:e.map(a=>d[a.status??"pending"]??"pending").sort((a,b)=>(c[a]??99)-(c[b]??99))[0]??null].filter(a=>!!a);return 0===f.length?"pending":f.sort((a,b)=>(c[a]??99)-(c[b]??99))[0]}(o.allocation_status,o.subscriptions,o.holdings);let a="entity_link"===o.source,b=(o.subscriptions?.length??0)>0,e=(o.holdings?.length??0)>0;a&&(b||e)||!a&&b&&e?o.source="hybrid":a||!b||e?a||b||!e||(o.source="holding_only"):o.source="subscription_only"}return Array.from(l.values()).sort((a,b)=>{let c=a.created_at?new Date(a.created_at).getTime():0;return(b.created_at?new Date(b.created_at).getTime():0)-c})}a.s(["mergeEntityInvestorData",()=>j])},764551,a=>{"use strict";var b=a.i(714898),c=a.i(689784);a.i(937413);var d=a.i(131360),e=a.i(696474),f=a.i(243085),g=a.i(580129);async function h({params:a}){let h=await (0,f.getCurrentUser)();h&&(h.role.startsWith("staff_")||"ceo"===h.role)||(console.error("[EntityDetailPage] Unauthorized access attempt"),(0,d.redirect)("/versotech_main/entities"));let{id:i}=await a,j=await (0,c.createSmartClient)(),{data:k,error:l}=await j.from("vehicles").select(`
      *,
      lawyer:lawyers (
        id,
        firm_name,
        display_name,
        primary_contact_email
      ),
      arranger_entity:arranger_entities (
        id,
        legal_name,
        email
      )
    `).eq("id",i).single();(l||!k)&&(console.error("[EntityDetailPage] Failed to load entity:",{id:i,error:l?.message}),(0,d.redirect)("/versotech_main/entities"));let[{data:m},{data:n},{data:o},{data:p},{data:q},{data:r},{data:s},{data:t},{data:u},{data:v}]=await Promise.all([j.from("entity_directors").select("*").eq("vehicle_id",i).order("created_at",{ascending:!1}),j.from("entity_stakeholders").select("*").eq("vehicle_id",i).order("created_at",{ascending:!1}),j.from("document_folders").select("id, parent_folder_id, name, path, folder_type, vehicle_id, created_at, updated_at").eq("vehicle_id",i).order("path",{ascending:!0}),j.from("entity_flags").select("*").eq("vehicle_id",i).eq("is_resolved",!1).order("severity",{ascending:!0}),j.from("deals").select("id, name, status, deal_type, currency, created_at").eq("vehicle_id",i).order("created_at",{ascending:!1}),j.from("entity_events").select(`
        id,
        event_type,
        description,
        payload,
        created_at,
        changed_by_profile:profiles!entity_events_changed_by_fkey(
          id,
          display_name,
          email
        )
      `).eq("vehicle_id",i).order("created_at",{ascending:!1}).limit(50),j.from("entity_investors").select(`
        id,
        subscription_id,
        relationship_role,
        allocation_status,
        invite_sent_at,
        created_at,
        updated_at,
        notes,
        investor:investors (
          id,
          legal_name,
          display_name,
          type,
          email,
          country,
          status,
          onboarding_status,
          aml_risk_rating
        ),
        subscription:subscriptions (
          *
        )
      `).eq("vehicle_id",i).order("created_at",{ascending:!1}),j.from("subscriptions").select(`
        *,
        investor:investors (
          id,
          legal_name,
          display_name,
          type,
          email,
          country,
          status,
          onboarding_status,
          aml_risk_rating
        )
      `).eq("vehicle_id",i).order("created_at",{ascending:!1}),j.from("valuations").select("*").eq("vehicle_id",i).order("as_of_date",{ascending:!1}),j.from("positions").select(`
        *,
        investor:investors (
          id,
          legal_name,
          display_name,
          type,
          email
        )
      `).eq("vehicle_id",i).order("as_of_date",{ascending:!1})]),w=[];if(q&&q.length>0){let a=q.map(a=>a.id).filter(Boolean);if(a.length>0){let{data:b,error:c}=await j.from("investor_deal_holdings").select(`
          id,
          investor_id,
          deal_id,
          subscription_submission_id,
          status,
          subscribed_amount,
          currency,
          effective_date,
          funding_due_at,
          funded_at,
          created_at,
          updated_at,
          investor:investors (
            id,
            legal_name,
            display_name,
            type,
            email,
            country,
            status,
            onboarding_status,
            aml_risk_rating
          )
        `).in("deal_id",a);c?console.error("[EntityDetailPage] Failed to load holdings:",c):w=b??[]}}let x=(0,g.mergeEntityInvestorData)({entityInvestors:s??[],subscriptions:t??[],holdings:w,deals:q??[]});return(0,b.jsx)(e.EntityDetailEnhanced,{entity:{...k,updated_at:null},directors:m||[],stakeholders:n||[],folders:o||[],flags:p||[],deals:q||[],events:r||[],investors:x,valuations:u||[],positions:v||[]})}a.s(["default",()=>h,"dynamic",0,"force-dynamic","revalidate",0,0])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__c7cc47cd._.js.map