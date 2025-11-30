import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'

const payloadSchema = z.object({
  workflow_run_id: z.string().uuid(),
  status: z.enum(['queued', 'running', 'completed', 'failed', 'cancelled']),
  error_message: z.string().optional(),
  output_data: z.record(z.string(), z.any()).nullable().optional(),
  result_doc_id: z.string().uuid().nullable().optional(),
  created_task_ids: z.array(z.string().uuid()).optional(),
  n8n_execution_id: z.string().optional(),
  duration_ms: z.number().optional()
})

// Inbound webhook from n8n workflow completion
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-verso-signature')
    const body = await request.text()

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.N8N_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const parsed = payloadSchema.safeParse(JSON.parse(body))

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { workflow_run_id, status, error_message, output_data, result_doc_id, created_task_ids, n8n_execution_id, duration_ms } = parsed.data

    const supabase = await createClient()

    const { data: workflowRun, error: runError } = await supabase
      .from('workflow_runs')
      .select('id, workflow_key, entity_type, entity_id, triggered_by, started_at')
      .eq('id', workflow_run_id)
      .single()

    if (runError || !workflowRun) {
      return NextResponse.json({ error: 'Workflow run not found' }, { status: 404 })
    }

    const updateData: Record<string, any> = {
      status,
      error_message: error_message ?? null,
      output_data: output_data ?? null,
      result_doc_id: result_doc_id ?? null,
      created_tasks: created_task_ids ?? null,
      n8n_execution_id: n8n_execution_id ?? null,
      updated_at: new Date().toISOString()
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
      updateData.duration_ms = duration_ms ??
        (workflowRun.started_at ? Date.now() - new Date(workflowRun.started_at).getTime() : null)
    }

    const { error: updateError } = await supabase
      .from('workflow_runs')
      .update(updateData)
      .eq('id', workflow_run_id)

    if (updateError) {
      console.error('Error updating workflow run', updateError)
      return NextResponse.json({ error: 'Failed to update workflow run' }, { status: 500 })
    }

    if (status === 'failed' && error_message) {
      await supabase.from('notifications').insert({
        user_id: workflowRun.triggered_by,
        title: 'Workflow Failed',
        message: `${workflowRun.workflow_key} failed: ${error_message}`,
        type: 'error',
        link: `/versotech/staff/workflows/${workflow_run_id}`
      })
    }

    await supabase.from('audit_logs').insert({
      event_type: 'workflow',
      actor_id: workflowRun.triggered_by,
      action: 'workflow_completed',
      entity_type: 'workflow_runs',
      entity_id: workflow_run_id,
      action_details: {
        status,
        error_message,
        result_doc_id,
        created_task_ids
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('n8n webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

