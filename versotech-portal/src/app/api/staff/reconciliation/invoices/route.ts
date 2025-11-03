import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    const { data: invoices, error } = await supabase
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
        created_at,
        paid_at,
        investor:investor_id (
          id,
          legal_name
        ),
        deal:deal_id (
          id,
          name
        ),
        matches:reconciliation_matches!reconciliation_matches_invoice_id_fkey (
          id,
          bank_transaction_id,
          matched_amount,
          status,
          approved_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch invoices:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate match counts and enriched data
    const invoicesWithDerived = (invoices || []).map(inv => {
      const allMatches = (inv.matches as any[]) || []
      const approvedMatches = allMatches.filter(match => match.status === 'approved')
      const matchCount = approvedMatches.length
      const transactionCount = new Set(approvedMatches.map(m => m.bank_transaction_id)).size

      return {
        ...inv,
        match_count: matchCount,
        transaction_count: transactionCount,
        matches: approvedMatches // Only include approved matches
      }
    })

    // Calculate stats
    const totalInvoices = invoicesWithDerived.length
    const paidInvoices = invoicesWithDerived.filter(i => i.status === 'paid').length
    const partiallyPaidInvoices = invoicesWithDerived.filter(i => i.status === 'partially_paid').length
    const unpaidInvoices = invoicesWithDerived.filter(i => ['sent', 'overdue'].includes(i.status)).length
    const matchedInvoices = invoicesWithDerived.filter(i => i.match_status === 'matched').length
    const partiallyMatchedInvoices = invoicesWithDerived.filter(i => i.match_status === 'partially_matched').length
    const unmatchedInvoices = invoicesWithDerived.filter(i => i.match_status === 'unmatched').length

    const totalAmount = invoicesWithDerived.reduce((sum, i) => sum + (i.total || 0), 0)
    const paidAmount = invoicesWithDerived.reduce((sum, i) => sum + (i.paid_amount || 0), 0)
    const balanceAmount = invoicesWithDerived.reduce((sum, i) => sum + (i.balance_due || 0), 0)

    const stats = {
      total: totalInvoices,
      paid: paidInvoices,
      partiallyPaid: partiallyPaidInvoices,
      unpaid: unpaidInvoices,
      matched: matchedInvoices,
      partiallyMatched: partiallyMatchedInvoices,
      unmatched: unmatchedInvoices,
      totalAmount,
      paidAmount,
      balanceAmount
    }

    return NextResponse.json({
      invoices: invoicesWithDerived,
      stats
    })
  } catch (error: any) {
    console.error('Invoices fetch error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to fetch invoices'
    }, { status: 500 })
  }
}
