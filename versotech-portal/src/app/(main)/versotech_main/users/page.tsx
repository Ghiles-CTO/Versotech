'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const UnifiedUsersContent = dynamic(
  () => import('./unified-users-content'),
  {
    loading: () => <LoadingState />,
    ssr: false
  }
)

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-3 text-muted-foreground">Loading users...</span>
    </div>
  )
}

/**
 * Unified Users Page for Versotech Portal
 *
 * Single page to view and manage ALL user types in one place:
 * - Investors
 * - Lawyers
 * - Partners
 * - Commercial Partners
 * - Introducers
 * - Arrangers
 *
 * Features:
 * - Single API call fetches all user types
 * - Filter by type, status
 * - Search across all fields
 * - Export to CSV
 */
export default function UsersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Users</h1>
          <p className="text-muted-foreground mt-1">
            Complete directory of all platform users and entities
          </p>
        </div>
      </div>

      <Suspense fallback={<LoadingState />}>
        <UnifiedUsersContent />
      </Suspense>
    </div>
  )
}
