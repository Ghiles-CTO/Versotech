import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Resolve a discrepancy
export async function POST(req: Request) {
  const profile = await requireStaffAuth()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { bank_transaction_id, resolution_type, notes } = await req.json()

    if (!bank_transaction_id) {
      return NextResponse.json({ error: 'Missing bank_transaction_id' }, { status: 400 })
    }

    const supabase = await createClient()

    // Update transaction with resolution
    const { error } = await supabase
      .from('bank_transactions')
      .update({
        status: 'resolved',
        resolution_notes: `${resolution_type || 'Manual resolution'}: ${notes || ''}`,
        resolved_by: profile.id,
        resolved_at: new Date().toISOString()
      })
      .eq('id', bank_transaction_id)

    if (error) {
      console.error('Failed to resolve discrepancy:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Discrepancy resolved'
    })

  } catch (error: any) {
    console.error('Resolve error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to resolve discrepancy'
    }, { status: 500 })
  }
}
