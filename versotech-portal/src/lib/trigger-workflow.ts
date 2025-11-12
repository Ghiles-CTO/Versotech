import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

interface TriggerWorkflowParams {
  workflowKey: string
  payload: Record<string, any>
  entityType?: string
  entityId?: string
  user: {
    id: string
    email: string
    displayName?: string
    role: string
    title?: string
  }
}

export async function triggerWorkflow({
  workflowKey,
  payload,
  entityType,
  entityId,
  user
}: TriggerWorkflowParams): Promise<{
  success: boolean
  workflow_run_id?: string
  n8n_response?: any
  error?: string
}> {
  try {
    const serviceSupabase = createServiceClient()

    // Fetch workflow from database
    const { data: workflow, error: workflowError } = await serviceSupabase
      .from('workflows')
      .select('*')
      .eq('key', workflowKey)
      .eq('is_active', true)
      .single()

    if (workflowError || !workflow) {
      console.error('Workflow not found:', workflowKey)
      return { success: false, error: 'Workflow not found' }
    }

    // Generate idempotency token
    const idempotencyToken = crypto
      .createHash('sha256')
      .update(`${workflow.id}:${user.id}:${JSON.stringify(payload)}`)
      .digest('hex')

    // Generate webhook signature
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET || process.env.N8N_OUTBOUND_SECRET || 'default-webhook-secret'
    const webhookSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(idempotencyToken)
      .digest('hex')

    // Create workflow run
    const { data: workflowRun, error: runError } = await serviceSupabase
      .from('workflow_runs')
      .insert({
        workflow_id: workflow.id,
        workflow_key: workflow.key,
        triggered_by: user.id,
        entity_type: entityType ?? 'process',
        entity_id: entityId || null,
        input_params: payload,
        status: 'queued',
        idempotency_token: idempotencyToken,
        webhook_signature: webhookSignature
      })
      .select()
      .single()

    if (runError || !workflowRun) {
      console.error('Failed to create workflow run:', runError)
      return { success: false, error: 'Failed to create workflow run' }
    }

    // Prepare n8n payload
    const n8nPayload = {
      workflow_run_id: workflowRun.id,
      workflow_key: workflow.key,
      triggered_by: {
        id: user.id,
        email: user.email,
        display_name: user.displayName,
        role: user.role,
        title: user.title
      },
      payload,
      entity_type: workflowRun.entity_type
    }

    // Trigger n8n webhook
    const n8nResponse = await fetch(workflow.n8n_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-verso-signature': webhookSignature,
        'x-idempotency-key': idempotencyToken,
        'x-workflow-run-id': workflowRun.id
      },
      body: JSON.stringify(n8nPayload)
    })

    const responseText = await n8nResponse.text()
    let n8nResult: any = {}
    try {
      n8nResult = JSON.parse(responseText)
    } catch {
      n8nResult = { raw: responseText }
    }

    if (!n8nResponse.ok) {
      await serviceSupabase
        .from('workflow_runs')
        .update({
          status: 'failed',
          error_message: `Failed to trigger n8n: ${responseText}`,
          completed_at: new Date().toISOString()
        })
        .eq('id', workflowRun.id)

      return { success: false, error: 'Failed to trigger n8n webhook' }
    }

    // Update workflow run status
    await serviceSupabase
      .from('workflow_runs')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        output_data: n8nResult
      })
      .eq('id', workflowRun.id)

    // Create audit log
    await serviceSupabase.from('audit_log').insert({
      actor_user_id: user.id,
      action: 'workflow_triggered',
      entity: 'workflow_runs',
      entity_id: workflowRun.id,
      metadata: {
        workflow_key: workflow.key,
        payload,
        entity_type: workflowRun.entity_type
      }
    })

    return {
      success: true,
      workflow_run_id: workflowRun.id,
      n8n_response: n8nResult
    }
  } catch (error) {
    console.error('Workflow trigger error:', error)
    return { success: false, error: 'Internal error triggering workflow' }
  }
}
