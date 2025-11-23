import { AppLayout } from '@/components/layout/app-layout'
import { createClient } from '@/lib/supabase/server'
import { TasksPageClient } from './tasks-page-client'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export interface TaskInstructions {
  steps: string[]
  requirements: string[]
  estimated_time: string
  documents?: string[]
  assigned_by?: string
  action_url?: string
  wire_details?: {
    amount: string
    percentage: string
    bank: string
    deadline: string
  }
}

export interface Task {
  id: string
  owner_user_id: string
  owner_investor_id: string | null
  kind: string | null
  category: 'onboarding' | 'compliance' | 'investment_setup' | null
  title: string
  description: string | null
  instructions: TaskInstructions | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'waived' | 'blocked'
  due_at: string | null
  estimated_minutes: number | null
  started_at: string | null
  completed_at: string | null
  completed_by: string | null
  created_at: string
  updated_at: string | null
  related_entity_type: string | null
  related_entity_id: string | null
}

export interface Vehicle {
  id: string
  name: string
  type: string
  currency: string
}

export interface TasksByVehicle {
  vehicle: Vehicle
  tasks: Task[]
}

export default async function TasksPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/versoholdings/login')
  }

  // Get investor IDs
  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)

  const investorIds = investorLinks?.map(link => link.investor_id) || []

  // Get vehicles the user has access to
  const { data: vehicles } = await supabase
    .from('subscriptions')
    .select('vehicle_id, vehicles!inner(id, name, type, currency)')
    .in('investor_id', investorIds)
    .eq('status', 'active')

  const userVehicles = vehicles
    ?.map(v => v.vehicles?.[0])
    .filter((v, i, arr) => v && arr.findIndex(x => x?.id === v.id) === i) || []

  // Fetch all tasks
  let tasksQuery = supabase
    .from('tasks')
    .select('*')

  if (investorIds.length > 0) {
    tasksQuery = tasksQuery.or(
      `owner_user_id.eq.${user.id},owner_investor_id.in.(${investorIds.join(',')})`
    )
  } else {
    tasksQuery = tasksQuery.eq('owner_user_id', user.id)
  }

  const { data: tasks } = await tasksQuery
    .order('priority', { ascending: false })
    .order('due_at', { ascending: true, nullsFirst: false })

  const allTasks = (tasks as Task[]) || []

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

  // General compliance tasks not tied to a vehicle (includes signature tasks and investment setup)
  const generalComplianceTasks = allTasks.filter(t =>
    (t.category === 'compliance' || t.category === 'investment_setup') && (
      !t.related_entity_id ||
      t.related_entity_type === 'signature_request'
    )
  )

  return (
    <AppLayout brand="versoholdings">
      <TasksPageClient
        userId={user.id}
        tasksByVehicle={tasksByVehicle}
        onboardingTasks={onboardingTasks}
        staffCreatedTasks={staffCreatedTasks}
        generalComplianceTasks={generalComplianceTasks}
      />
    </AppLayout>
  )
}