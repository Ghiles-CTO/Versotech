import { createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'

// Validation schema for bank transaction import
const bankTransactionSchema = z.object({
  account_ref: z.string().min(1, 'Account reference is required'),
  amount: z.number(),
  currency: z.string().default('USD'),
  value_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  memo: z.string().optional(),
  counterparty: z.string().optional()
})

const ingestBankDataSchema = z.object({
  transactions: z.array(bankTransactionSchema),
  import_batch_id: z.string().uuid().optional()
})

export async function POST(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await serviceSupabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff (only staff can import bank data)
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required to import bank transactions' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validation = ingestBankDataSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (validation.error as any).errors },
        { status: 400 }
      )
    }

    const { transactions, import_batch_id } = validation.data
    const batchId = import_batch_id || crypto.randomUUID()

    // Insert bank transactions
    const transactionsToInsert = transactions.map(tx => ({
      account_ref: tx.account_ref,
      amount: tx.amount,
      currency: tx.currency,
      value_date: tx.value_date,
      memo: tx.memo,
      counterparty: tx.counterparty,
      import_batch_id: batchId
    }))

    const { data: insertedTransactions, error: insertError } = await serviceSupabase
      .from('bank_transactions')
      .insert(transactionsToInsert)
      .select('*')

    if (insertError) {
      console.error('Bank transaction insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to insert bank transactions' },
        { status: 500 }
      )
    }

    // Try to auto-match with existing invoices (simple heuristic)
    const matchingResults = []
    
    for (const transaction of insertedTransactions || []) {
      // Look for invoices with similar amounts
      const { data: potentialMatches } = await serviceSupabase
        .from('invoices')
        .select(`
          id,
          total,
          currency,
          investor_id,
          investors (
            legal_name
          )
        `)
        .eq('status', 'sent')
        .eq('currency', transaction.currency)
        .gte('total', transaction.amount * 0.95) // Allow 5% variance
        .lte('total', transaction.amount * 1.05)

      if (potentialMatches && potentialMatches.length === 1) {
        // Exact match found - create reconciliation
        const invoice = potentialMatches[0]
        
        const { error: reconcileError } = await serviceSupabase
          .from('reconciliations')
          .insert({
            invoice_id: invoice.id,
            bank_transaction_id: transaction.id,
            matched_amount: transaction.amount,
            matched_by: user.id
          })

        if (!reconcileError) {
          // Update invoice status to paid
          await serviceSupabase
            .from('invoices')
            .update({ status: 'paid' })
            .eq('id', invoice.id)

          matchingResults.push({
            transaction_id: transaction.id,
            invoice_id: invoice.id,
            matched_amount: transaction.amount,
            investor_name: (invoice.investors as any)?.[0]?.legal_name
          })
        }
      }
    }

    // Log the bank import
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.BANK_TRANSACTIONS,
      entity_id: batchId,
      metadata: {
        import_batch_id: batchId,
        transactions_count: transactions.length,
        auto_matches: matchingResults.length,
        imported_by: profile.display_name,
        total_amount: transactions.reduce((sum, tx) => sum + tx.amount, 0)
      }
    })

    return NextResponse.json({
      success: true,
      import_batch_id: batchId,
      transactions_imported: insertedTransactions?.length || 0,
      auto_matches: matchingResults.length,
      matching_results: matchingResults,
      message: `Successfully imported ${insertedTransactions?.length} transactions with ${matchingResults.length} auto-matches`
    })

  } catch (error) {
    console.error('Bank import API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to view bank transactions
export async function GET(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await serviceSupabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff (only staff can view bank transactions)
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required to view bank transactions' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const batchId = searchParams.get('batch_id')
    const fromDate = searchParams.get('from_date')
    const toDate = searchParams.get('to_date')
    const accountRef = searchParams.get('account_ref')

    // Build query
    let query = serviceSupabase
      .from('bank_transactions')
      .select(`
        *,
        reconciliations (
          id,
          matched_amount,
          invoices (
            id,
            total,
            investors (
              legal_name
            )
          )
        )
      `)

    if (batchId) {
      query = query.eq('import_batch_id', batchId)
    }
    if (fromDate) {
      query = query.gte('value_date', fromDate)
    }
    if (toDate) {
      query = query.lte('value_date', toDate)
    }
    if (accountRef) {
      query = query.eq('account_ref', accountRef)
    }

    const { data: transactions, error } = await query
      .order('value_date', { ascending: false })
      .limit(100) // Reasonable limit

    if (error) {
      console.error('Error fetching bank transactions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bank transactions' },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const totalAmount = transactions?.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0) || 0
    const reconciledCount = transactions?.filter(tx => tx.reconciliations && tx.reconciliations.length > 0).length || 0

    return NextResponse.json({
      transactions: transactions || [],
      summary: {
        total_amount: totalAmount,
        transaction_count: transactions?.length || 0,
        reconciled_count: reconciledCount,
        unreconciled_count: (transactions?.length || 0) - reconciledCount
      }
    })

  } catch (error) {
    console.error('Bank transactions GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
