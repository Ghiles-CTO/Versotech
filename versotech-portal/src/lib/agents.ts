import { createServiceClient } from '@/lib/supabase/server'

export async function resolveAgentIdForTask(
  supabase: ReturnType<typeof createServiceClient>,
  taskCode?: string | null
) {
  if (!taskCode) return null

  const { data: assignment } = await supabase
    .from('agent_task_assignments')
    .select('agent_id')
    .eq('task_code', taskCode)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (assignment?.agent_id) {
    const { data: agent } = await supabase
      .from('ai_agents')
      .select('id, is_active')
      .eq('id', assignment.agent_id)
      .maybeSingle()

    if (agent?.is_active) return agent.id
  }

  const { data: fallback } = await supabase
    .from('ai_agents')
    .select('id')
    .eq('name', 'Uma NAIDU')
    .limit(1)
    .maybeSingle()

  return fallback?.id ?? null
}
