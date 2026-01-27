module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},16933,a=>{a.n(a.i(618450))},498419,a=>{a.n(a.i(72598))},454884,a=>{"use strict";a.s(["ApprovalsPageClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call ApprovalsPageClient() from the server but ApprovalsPageClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/approvals/approvals-page-client.tsx <module evaluation>","ApprovalsPageClient")},432724,a=>{"use strict";a.s(["ApprovalsPageClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call ApprovalsPageClient() from the server but ApprovalsPageClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/components/approvals/approvals-page-client.tsx","ApprovalsPageClient")},541665,a=>{"use strict";a.i(454884);var b=a.i(432724);a.n(b)},876099,a=>{"use strict";var b=a.i(714898),c=a.i(541665),d=a.i(198307);async function e(){try{let a=(0,d.createServiceClient)(),b=new Date;b.setDate(b.getDate()-30);let{data:c,error:e}=await a.from("approvals").select(`
        *,
        requested_by_profile:requested_by (
          id,
          display_name,
          email,
          role
        ),
        assigned_to_profile:assigned_to (
          id,
          display_name,
          email,
          role
        ),
        approved_by_profile:approved_by (
          id,
          display_name,
          email,
          role
        ),
        related_deal:deals (
          id,
          name,
          status,
          deal_type,
          currency
        ),
        related_investor:investors (
          id,
          legal_name,
          kyc_status,
          type
        )
      `).or(`status.eq.pending,and(status.in.(approved,rejected),resolved_at.gte.${b.toISOString()})`).order("sla_breach_at",{ascending:!0,nullsFirst:!1}).order("created_at",{ascending:!1});if(e)return console.error("[Approvals] Error fetching approvals:",e),f();console.log(`[Approvals] Fetched ${c?.length||0} approvals (pending + recent approved/rejected)`);let{data:g,error:h}=await a.rpc("get_approval_stats",{p_staff_id:null}).single();h&&console.warn("[Approvals] Error fetching stats:",h);let i=g||{total_pending:c?.length||0,overdue_count:0,avg_processing_time_hours:0,approval_rate_24h:0,total_approved_30d:0,total_rejected_30d:0,total_awaiting_info:0};return console.log("[Approvals] Stats:",i),{approvals:c||[],stats:i,counts:{pending:i.total_pending,approved:i.total_approved_30d,rejected:i.total_rejected_30d},hasData:c&&c.length>0||!1}}catch(a){return console.error("[Approvals] Error in fetchApprovalData:",a),f()}}function f(){return{approvals:[],stats:{total_pending:0,overdue_count:0,avg_processing_time_hours:0,approval_rate_24h:0,total_approved_30d:0,total_rejected_30d:0,total_awaiting_info:0},counts:{pending:0,approved:0,rejected:0},hasData:!1}}async function g(){let{approvals:a,stats:d,counts:f,hasData:g}=await e();return(0,b.jsxs)("div",{className:"p-6 space-y-8",children:[(0,b.jsxs)("div",{className:"border-b border-gray-800 pb-6",children:[(0,b.jsx)("h1",{className:"text-3xl font-bold text-foreground",children:"Approval Queue"}),(0,b.jsx)("p",{className:"text-lg text-muted-foreground mt-1",children:"Review and approve investor commitments and allocations"})]}),(0,b.jsx)(c.ApprovalsPageClient,{initialApprovals:a,initialStats:d,initialCounts:f})]})}a.s(["default",()=>g,"dynamic",0,"force-dynamic"])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0c587a23._.js.map