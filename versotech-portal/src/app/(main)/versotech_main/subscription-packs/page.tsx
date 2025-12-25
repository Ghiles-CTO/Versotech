import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { SubscriptionPacksClient } from './subscription-packs-client'

export const dynamic = 'force-dynamic'

export default async function SubscriptionPacksPage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground">
            Please log in to view subscription packs.
          </p>
        </div>
      </div>
    )
  }

  const serviceSupabase = createServiceClient()

  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const isLawyer = personas?.some((p: any) => p.persona_type === 'lawyer') || false

  if (!isLawyer) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Lawyer Access Required
          </h3>
          <p className="text-muted-foreground">
            This section is available only to assigned legal counsel.
          </p>
        </div>
      </div>
    )
  }

  const { data: lawyerUser } = await serviceSupabase
    .from('lawyer_users')
    .select('lawyer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!lawyerUser?.lawyer_id) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Lawyer Profile Linked
          </h3>
          <p className="text-muted-foreground">
            Please contact the VERSO team to link your lawyer profile.
          </p>
        </div>
      </div>
    )
  }

  const { data: lawyer } = await serviceSupabase
    .from('lawyers')
    .select('id, firm_name, display_name, specializations, is_active, assigned_deals')
    .eq('id', lawyerUser.lawyer_id)
    .maybeSingle()

  const { data: assignments, error: assignmentsError } = await serviceSupabase
    .from('deal_lawyer_assignments')
    .select('deal_id')
    .eq('lawyer_id', lawyerUser.lawyer_id)

  let dealIds = (assignments || []).map((assignment: any) => assignment.deal_id)

  if ((!dealIds.length || assignmentsError) && lawyer?.assigned_deals?.length) {
    dealIds = lawyer.assigned_deals
  }

  if (!dealIds.length) {
    return (
      <SubscriptionPacksClient
        lawyerInfo={lawyer ? {
          id: lawyer.id,
          firm_name: lawyer.firm_name,
          display_name: lawyer.display_name,
          specializations: lawyer.specializations ?? null,
          is_active: lawyer.is_active
        } : null}
        submissions={[]}
      />
    )
  }

  const { data: submissionsData } = await serviceSupabase
    .from('deal_subscription_submissions')
    .select(`
      id,
      deal_id,
      investor_id,
      status,
      submitted_at,
      decided_at,
      deals (
        id,
        name,
        currency
      ),
      investors (
        id,
        legal_name
      )
    `)
    .in('deal_id', dealIds)
    .order('submitted_at', { ascending: false })

  const submissions = (submissionsData || []).map((submission: any) => {
    const deal = Array.isArray(submission.deals) ? submission.deals[0] : submission.deals
    const investor = Array.isArray(submission.investors) ? submission.investors[0] : submission.investors

    return {
      id: submission.id,
      deal_id: submission.deal_id,
      investor_id: submission.investor_id,
      status: submission.status,
      submitted_at: submission.submitted_at,
      decided_at: submission.decided_at,
      deal_name: deal?.name || 'Unknown deal',
      deal_currency: deal?.currency || null,
      investor_name: investor?.legal_name || 'Unknown investor'
    }
  })

  return (
    <SubscriptionPacksClient
      lawyerInfo={lawyer ? {
        id: lawyer.id,
        firm_name: lawyer.firm_name,
        display_name: lawyer.display_name,
        specializations: lawyer.specializations ?? null,
        is_active: lawyer.is_active
      } : null}
      submissions={submissions}
    />
  )
}
