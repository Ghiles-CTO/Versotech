import { createClient, createServiceClient } from '@/lib/supabase/server'
import { TasksPageClient } from '@/app/(investor)/versoholdings/tasks/tasks-page-client'
import { AlertCircle } from 'lucide-react'
import type { Task, TasksByVehicle, Vehicle } from '@/app/(investor)/versoholdings/tasks/page'
import { checkStaffAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Tasks Page for Unified Portal (versotech_main)
 *
 * Persona-aware task management:
 * - Staff/CEO personas: Shows tasks assigned to the user
 * - Investor personas: Shows tasks for their investor accounts
 */
export default async function TasksPage() {
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
            Please log in to view tasks.
          </p>
        </div>
      </div>
    )
  }

  // Check user personas
  const hasStaffAccess = await checkStaffAccess(user.id)
  const serviceSupabase = createServiceClient()

  const { data: personas } = await serviceSupabase.rpc('get_user_personas', {
    p_user_id: user.id
  })

  const hasInvestorAccess = personas?.some(
    (p: any) => p.persona_type === 'investor'
  ) || false

  if (!hasStaffAccess && !hasInvestorAccess) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            Tasks management requires an active persona.
          </p>
        </div>
      </div>
    )
  }

  // Get investor IDs if user has investor persona
  let investorIds: string[] = []
  if (hasInvestorAccess) {
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    investorIds = investorLinks?.map(link => link.investor_id) || []
  }

  // Get vehicles the user has access to (for investors)
  let userVehicles: Vehicle[] = []
  if (investorIds.length > 0) {
    const { data: vehicles } = await serviceSupabase
      .from('subscriptions')
      .select('vehicle_id, vehicles!inner(id, name, type, currency)')
      .in('investor_id', investorIds)
      .eq('status', 'active')

    userVehicles = vehicles
      ?.map(v => (v.vehicles as any)?.[0])
      .filter((v, i, arr) => v && arr.findIndex(x => x?.id === v.id) === i) || []
  }

  // Fetch all tasks for the user
  let tasksQuery = serviceSupabase
    .from('tasks')
    .select('*')

  // Build filter based on persona
  if (investorIds.length > 0) {
    // For investors: tasks owned by user OR by their investor IDs
    tasksQuery = tasksQuery.or(
      `owner_user_id.eq.${user.id},owner_investor_id.in.(${investorIds.join(',')})`
    )
  } else {
    // For staff only: just tasks owned by the user
    tasksQuery = tasksQuery.eq('owner_user_id', user.id)
  }

  const { data: tasks } = await tasksQuery
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  // Sort by priority (high -> medium -> low), then by due_at, then by created_at
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const allTasks = ((tasks as Task[]) || []).sort((a, b) => {
    const pA = priorityOrder[a.priority] ?? 99
    const pB = priorityOrder[b.priority] ?? 99
    if (pA !== pB) return pA - pB
    // Secondary: due_at ascending, nulls last
    if (a.due_at !== b.due_at) {
      if (!a.due_at) return 1
      if (!b.due_at) return -1
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
    }
    // Tertiary: created_at ascending
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  // Group tasks by vehicle
  const tasksByVehicle: TasksByVehicle[] = userVehicles.map(vehicle => ({
    vehicle: vehicle as Vehicle,
    tasks: allTasks.filter(t =>
      t.related_entity_type === 'vehicle' && t.related_entity_id === vehicle.id
    )
  })).filter(group => group.tasks.length > 0)

  // Onboarding tasks (no vehicle relation, has category)
  const onboardingTasks = allTasks.filter(t =>
    t.category === 'onboarding' && !t.related_entity_id
  )

  // Staff-created custom tasks (no category, or kind='other' without category)
  const staffCreatedTasks = allTasks.filter(t =>
    !t.category && !t.related_entity_id
  )

  // KYC, compliance, and investment setup tasks not tied to a vehicle (NOT signatures)
  const generalComplianceTasks = allTasks.filter(t =>
    (t.category === 'kyc' || t.category === 'compliance' || t.category === 'investment_setup') && (
      !t.related_entity_id ||
      t.related_entity_type === 'signature_request' ||
      t.related_entity_type === 'subscription'
    )
  )

  // Signature tasks - separate section
  const signatureTasks = allTasks.filter(t =>
    t.category === 'signatures' && (
      !t.related_entity_id ||
      t.related_entity_type === 'signature_request'
    )
  )

  return (
    <div className="p-6">
      <TasksPageClient
        userId={user.id}
        investorIds={investorIds}
        tasksByVehicle={tasksByVehicle}
        onboardingTasks={onboardingTasks}
        staffCreatedTasks={staffCreatedTasks}
        generalComplianceTasks={generalComplianceTasks}
        signatureTasks={signatureTasks}
      />
    </div>
  )
}
