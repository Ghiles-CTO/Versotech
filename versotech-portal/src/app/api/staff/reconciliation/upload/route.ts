import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// CSV Upload for bank transactions
export async function POST(req: Request) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 })
    }

    // Parse CSV header
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

    // Expected columns (flexible order)
    const requiredCols = ['date', 'amount', 'counterparty']
    const hasRequired = requiredCols.every(col =>
      header.some(h => h.toLowerCase().includes(col.toLowerCase()))
    )

    if (!hasRequired) {
      return NextResponse.json({
        error: 'CSV must contain date, amount, and counterparty columns',
        found: header
      }, { status: 400 })
    }

    // Parse transactions
    const transactions = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row: any = {}

      header.forEach((col, idx) => {
        row[col.toLowerCase()] = values[idx] || ''
      })

      // Map to bank_transactions schema
      const txn = {
        value_date: row.date || row.value_date || row.transaction_date,
        amount: parseFloat(row.amount?.replace(/[^0-9.-]/g, '') || '0'),
        currency: row.currency || 'USD',
        counterparty: row.counterparty || row.name || row.sender,
        memo: row.memo || row.description || row.reference || '',
        account_ref: row.account || row.account_ref || file.name,
        bank_reference: row.reference || row.transaction_id || '',
        import_method: 'csv_upload',
        status: 'unmatched',
        imported_at: new Date().toISOString(),
        imported_by: profile.id
      }

      if (txn.amount !== 0) {
        transactions.push(txn)
      }
    }

    // Insert into database
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('bank_transactions')
      .insert(transactions)
      .select('id')

    if (error) {
      console.error('Failed to insert transactions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Auto-trigger matching after successful upload
    let matchCount = 0
    try {
      const { data: matches, error: matchError } = await supabase.rpc('run_auto_match')
      if (!matchError && matches) {
        matchCount = matches.length || 0
      }
    } catch (matchErr) {
      console.error('Auto-match warning:', matchErr)
      // Don't fail the upload if matching fails
    }

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      matchesFound: matchCount,
      message: `Imported ${data?.length || 0} transactions${matchCount > 0 ? ` and found ${matchCount} suggested matches` : ''}`
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to upload CSV'
    }, { status: 500 })
  }
}
