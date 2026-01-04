/**
 * Lawyer Deal Detail Page
 * /versotech_main/lawyer-deal/[id]
 *
 * Server component that fetches deal data for lawyer review.
 * Shows comprehensive deal information scoped to the lawyer's assignment.
 */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LawyerDealClient } from '@/components/lawyer/lawyer-deal-client'

type Props = {
  params: Promise<{ id: string }>
}

export default async function LawyerDealPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/auth/login')
  }

  // Fetch deal data from API
  const cookieStore = await cookies()
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/lawyers/me/deals/${id}`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      redirect('/auth/login')
    }
    if (response.status === 403 || response.status === 404) {
      redirect('/versotech_main/assigned-deals')
    }
    // For other errors, show error state
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold text-destructive">Error loading deal</h1>
        <p className="text-muted-foreground mt-2">Unable to fetch deal details. Please try again.</p>
      </div>
    )
  }

  const data = await response.json()

  return <LawyerDealClient data={data} />
}
