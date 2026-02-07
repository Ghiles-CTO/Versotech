import { redirect, notFound } from 'next/navigation'
import { requireStaffAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { TransactionDetailClient } from '@/app/(staff)/versotech/staff/reconciliation/[id]/transaction-detail-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const profile = await requireStaffAuth()
  if (!profile) {
    redirect('/versotech_main/login')
  }

  const { id } = await params
  const supabase = await createClient()

  // Fetch transaction with all related data
  const { data: transaction, error } = await supabase
    .from('bank_transactions')
    .select(`
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
    `)
    .eq('id', id)
    .single()

  if (error || !transaction) {
    notFound()
  }

  // Fetch open invoices for manual matching (same currency as transaction)
  const transactionCurrency = transaction.currency || 'USD'
  const { data: openInvoices } = await supabase
    .from('invoices')
    .select(`
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
    `)
    .in('status', ['sent', 'partially_paid', 'overdue'])
    .eq('currency', transactionCurrency)
    .gt('balance_due', 0)
    .order('due_date', { ascending: true })

  return (
    <div>
      <TransactionDetailClient
        transaction={transaction}
        openInvoices={openInvoices || []}
        staffProfile={profile}
      />
    </div>
  )
}
