import { createClient, createServiceClient } from '@/lib/supabase/server'
import { VersoSignPageClient } from '@/app/(staff)/versotech/staff/versosign/versosign-page-client'
import { AlertCircle } from 'lucide-react'
import type { SignatureGroup, SignatureTask } from '@/app/(staff)/versotech/staff/versosign/page'

export const dynamic = 'force-dynamic'

/**
 * VersoSign Page for Unified Portal (versotech_main)
 *
 * Persona-aware signature management:
 * - Staff/CEO personas: Full access to signature tasks
 * - Other personas: Access denied
 */
export default async function VersoSignPage() {
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
            Please log in to view VersoSign.
          </p>
        </div>
      </div>
    )
  }

  // Check if user has staff/CEO persona for full access
  const serviceSupabase = createServiceClient()
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const hasStaffAccess = personas?.some(
    (p: any) => p.persona_type === 'staff'
  ) || false

  if (!hasStaffAccess) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            VersoSign is only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  // Fetch all signature-related tasks for this staff member
  const { data: tasks } = await serviceSupabase
    .from('tasks')
    .select('*')
    .eq('owner_user_id', user.id)
    .in('kind', ['countersignature', 'subscription_pack_signature', 'other'])
    .order('due_at', { ascending: true, nullsFirst: false })

  // Sort by priority (high → medium → low), then by due_at
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const allTasks = ((tasks as SignatureTask[]) || []).sort((a, b) => {
    const pA = priorityOrder[a.priority] ?? 99
    const pB = priorityOrder[b.priority] ?? 99
    if (pA !== pB) return pA - pB
    if (!a.due_at && !b.due_at) return 0
    if (!a.due_at) return 1
    if (!b.due_at) return -1
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
  })

  // Group tasks by type
  const signatureGroups: SignatureGroup[] = [
    {
      category: 'countersignatures',
      title: 'Pending Countersignatures',
      description: 'Subscription agreements awaiting your countersignature',
      tasks: allTasks.filter(t =>
        t.kind === 'countersignature' &&
        (t.status === 'pending' || t.status === 'in_progress')
      )
    },
    {
      category: 'follow_ups',
      title: 'Manual Follow-ups Required',
      description: 'Investors without platform accounts - manual intervention needed',
      tasks: allTasks.filter(t =>
        t.metadata?.issue === 'investor_no_user_account' &&
        t.status === 'pending'
      )
    },
    {
      category: 'other',
      title: 'Completed Signatures',
      description: 'Recently completed signature tasks',
      tasks: allTasks.filter(t =>
        (t.kind === 'countersignature' || t.kind === 'subscription_pack_signature') &&
        t.status === 'completed'
      ).slice(0, 10) // Show last 10 completed
    }
  ]

  // Get stats for dashboard
  const stats = {
    pending: allTasks.filter(t => t.status === 'pending').length,
    in_progress: allTasks.filter(t => t.status === 'in_progress').length,
    completed_today: allTasks.filter(t =>
      t.status === 'completed' &&
      t.completed_at &&
      new Date(t.completed_at).toDateString() === new Date().toDateString()
    ).length,
    overdue: allTasks.filter(t =>
      t.status === 'pending' &&
      t.due_at &&
      new Date(t.due_at) < new Date()
    ).length
  }

  return (
    <div className="p-6">
      <VersoSignPageClient
        userId={user.id}
        signatureGroups={signatureGroups}
        stats={stats}
      />
    </div>
  )
}
