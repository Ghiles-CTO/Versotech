import { createClient } from '@/lib/supabase/server'
import { VersoSignPageClient } from './versosign-page-client'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export interface SignatureInstructions {
  type: 'signature' | 'manual_follow_up'
  action_url?: string
  signature_request_id?: string
  document_id?: string
  signer_role?: string
  investor_name?: string
  investor_email?: string
  action_required?: string
}

export interface SignatureTask {
  id: string
  owner_user_id: string
  kind: string
  category: string | null
  title: string
  description: string | null
  instructions: SignatureInstructions | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'waived' | 'blocked'
  due_at: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string | null
  related_entity_type: string | null
  related_entity_id: string | null
  metadata: {
    subscription_id?: string
    document_id?: string
    investor_id?: string
    vehicle_id?: string
    investor_name?: string
    issue?: string
  } | null
}

export interface ExpiredSignature {
  id: string
  signer_name: string
  signer_email: string
  document_type: string
  token_expires_at: string
  created_at: string
  investor_id: string
  investor?: {
    display_name: string | null
    legal_name: string | null
  }
}

export interface SignatureGroup {
  category: 'countersignatures' | 'follow_ups' | 'other' | 'expired'
  title: string
  description: string
  tasks: SignatureTask[]
  expiredSignatures?: ExpiredSignature[]
}

export default async function StaffSignaturesPage() {
  const user = await getCurrentUser()

  if (!user || !(user.role?.startsWith('staff_') || user.role === 'ceo')) {
    redirect('/versotech/login')
  }

  const supabase = await createClient()

  // Fetch all signature-related tasks for this staff member
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('owner_user_id', user.id)
    .in('kind', ['countersignature', 'subscription_pack_signature', 'other'])
    .order('due_at', { ascending: true, nullsFirst: false })

  // Fetch expired signature requests
  const { data: expiredSignatures } = await supabase
    .from('signature_requests')
    .select(`
      id, signer_name, signer_email, document_type,
      token_expires_at, created_at, investor_id,
      investor:investors(display_name, legal_name)
    `)
    .eq('status', 'expired')
    .order('token_expires_at', { ascending: false })
    .limit(50)

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
    },
    {
      category: 'expired',
      title: 'Expired Signatures',
      description: 'Signature requests that have expired - may need to be resent',
      tasks: [],
      expiredSignatures: (expiredSignatures as unknown as ExpiredSignature[]) || []
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
    ).length,
    expired: (expiredSignatures || []).length
  }

  return (
    <VersoSignPageClient
      userId={user.id}
      signatureGroups={signatureGroups}
      stats={stats}
    />
  )
}