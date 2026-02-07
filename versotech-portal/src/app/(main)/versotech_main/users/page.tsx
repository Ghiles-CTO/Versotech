'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const UsersPageClient = dynamic(
  () => import('./users-page-client'),
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
 * Users Management Page for Versotech Portal
 *
 * Comprehensive view of all platform users (people with logins):
 * - View all profiles from the profiles table
 * - See entity associations per user
 * - View KYC status where applicable
 * - Advanced filtering, sorting, and pagination
 * - Export to CSV
 *
 * This page shows "Users" (people with logins).
 * For business entities, see the Accounts page.
 */
export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage platform users and their access
          </p>
        </div>
      </div>

      <Suspense fallback={<LoadingState />}>
        <UsersPageClient />
      </Suspense>
    </div>
  )
}
