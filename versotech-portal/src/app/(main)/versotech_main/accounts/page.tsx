'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const UnifiedAccountsContent = dynamic(
  () => import('./unified-accounts-content'),
  {
    loading: () => <LoadingState />,
    ssr: false
  }
)

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-3 text-muted-foreground">Loading accounts...</span>
    </div>
  )
}

/**
 * Accounts Page for Versotech Portal
 *
 * Manage all business entities (accounts) in one place:
 * - Investors
 * - Lawyers
 * - Partners
 * - Commercial Partners
 * - Introducers
 * - Arrangers
 *
 * These are business entities linked to investments, subscriptions, and deals.
 * For managing people with platform logins, see the Users page.
 */
export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage business entities linked to investments and deals
          </p>
        </div>
      </div>

      <Suspense fallback={<LoadingState />}>
        <UnifiedAccountsContent />
      </Suspense>
    </div>
  )
}
