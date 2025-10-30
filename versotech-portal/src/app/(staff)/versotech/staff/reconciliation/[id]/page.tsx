import { redirect, notFound } from 'next/navigation'
import { requireStaffAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { TransactionDetailClient } from './transaction-detail-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const profile = await requireStaffAuth()
  if (!profile) {
    redirect('/versotech/login')
  }

  const { id } = await params
  const supabase = await createClient()

  // Fetch transaction with all related data
  const { data: transaction, error } = await supabase
    .from('bank_transactions')
    .select(`
      *,
      subscriptions:matched_subscription_id (
        id,
        commitment,
        funded_amount,
        currency,
        status,
        subscription_number,
        effective_date,
        investors (
          id,
          legal_name
        ),
        vehicles (
          id,
          name,
          vehicle_type
        )
      ),
      suggested_matches!suggested_matches_bank_transaction_id_fkey (
        id,
        subscription_id,
        confidence,
        match_reason,
        amount_difference,
        created_at,
        subscriptions (
          id,
          commitment,
          funded_amount,
          currency,
          status,
          subscription_number,
          investors (
            id,
            legal_name
          ),
          vehicles (
            id,
            name,
            vehicle_type
          )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !transaction) {
    notFound()
  }

  // Fetch all active subscriptions for manual matching
  const { data: allSubscriptions } = await supabase
    .from('subscriptions')
    .select(`
      id,
      commitment,
      funded_amount,
      currency,
      status,
      subscription_number,
      investors (
        id,
        legal_name
      ),
      vehicles (
        id,
        name,
        vehicle_type
      )
    `)
    .in('status', ['active', 'committed'])
    .order('subscription_number', { ascending: false })

  return (
    <div className="p-6">
      <TransactionDetailClient
        transaction={transaction}
        allSubscriptions={allSubscriptions || []}
        staffProfile={profile}
      />
    </div>
  )
}
