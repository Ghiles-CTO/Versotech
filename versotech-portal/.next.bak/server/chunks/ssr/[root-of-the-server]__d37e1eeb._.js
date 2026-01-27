module.exports=[193695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},9349,a=>{a.n(a.i(142710))},199585,a=>{a.n(a.i(701395))},929852,a=>{a.n(a.i(816404))},516153,a=>{a.n(a.i(422096))},911164,a=>{a.n(a.i(273021))},16933,a=>{a.n(a.i(618450))},498419,a=>{a.n(a.i(72598))},60311,a=>{"use strict";a.s(["TransactionDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call TransactionDetailClient() from the server but TransactionDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/app/(staff)/versotech/staff/reconciliation/[id]/transaction-detail-client.tsx <module evaluation>","TransactionDetailClient")},139165,a=>{"use strict";a.s(["TransactionDetailClient",()=>b]);let b=(0,a.i(578644).registerClientReference)(function(){throw Error("Attempted to call TransactionDetailClient() from the server but TransactionDetailClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/versotech-portal/src/app/(staff)/versotech/staff/reconciliation/[id]/transaction-detail-client.tsx","TransactionDetailClient")},234120,a=>{"use strict";a.i(60311);var b=a.i(139165);a.n(b)},326282,a=>{"use strict";var b=a.i(714898);a.i(937413);var c=a.i(131360),d=a.i(243085),e=a.i(198307),f=a.i(234120);async function g({params:a}){let g=await (0,d.requireStaffAuth)();g||(0,c.redirect)("/versotech/login");let{id:h}=await a,i=await (0,e.createClient)(),{data:j,error:k}=await i.from("bank_transactions").select(`
      id,
      account_ref,
      amount,
      currency,
      value_date,
      memo,
      counterparty,
      bank_reference,
      status,
      match_confidence,
      match_notes,
      matched_invoice_ids,
      import_batch_id,
      created_at,
      updated_at,
      matches:reconciliation_matches!reconciliation_matches_bank_transaction_id_fkey (
        id,
        invoice_id,
        match_type,
        matched_amount,
        match_confidence,
        match_reason,
        status,
        approved_at,
        approved_by,
        invoices (
          id,
          invoice_number,
          total,
          paid_amount,
          balance_due,
          status,
          match_status,
          currency,
          investor:investor_id (
            id,
            legal_name
          ),
          deal:deal_id (
            id,
            name
          )
        )
      ),
      suggestions:suggested_matches!suggested_matches_bank_transaction_id_fkey (
        id,
        invoice_id,
        confidence,
        match_reason,
        amount_difference,
        created_at,
        invoices (
          id,
          invoice_number,
          total,
          paid_amount,
          balance_due,
          status,
          match_status,
          currency,
          investor:investor_id (
            id,
            legal_name
          ),
          deal:deal_id (
            id,
            name
          )
        )
      )
    `).eq("id",h).single();(k||!j)&&(0,c.notFound)();let l=j.currency||"USD",{data:m}=await i.from("invoices").select(`
      id,
      invoice_number,
      total,
      paid_amount,
      balance_due,
      status,
      match_status,
      currency,
      due_date,
      investor:investor_id (
        id,
        legal_name
      ),
      deal:deal_id (
        id,
        name
      )
    `).in("status",["sent","partially_paid","overdue"]).eq("currency",l).gt("balance_due",0).order("due_date",{ascending:!0});return(0,b.jsx)("div",{className:"p-6",children:(0,b.jsx)(f.TransactionDetailClient,{transaction:j,openInvoices:m||[],staffProfile:g})})}a.s(["default",()=>g,"dynamic",0,"force-dynamic"])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__d37e1eeb._.js.map