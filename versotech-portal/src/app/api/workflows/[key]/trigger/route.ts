import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'

const FIVE_MINUTES_MS = 5 * 60 * 1000

const schema = z.object({
  entity_type: z.string().optional(),
  payload: z.record(z.any()),
  workflow_category: z.string().optional()
})

// Outbound webhook to n8n workflow
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const supabase = await createClient()
    const user = await requireStaffAuth()

    const { key: workflowKey } = await params

    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid payload',
          details: parsed.error.flatten()
        },
        { status: 400 }
      )
    }

    const { payload, entity_type } = parsed.data

    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('key', workflowKey)
      .eq('is_active', true)
      .single()

    if (workflowError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    if (workflow.required_role && workflow.required_role !== user.role) {
      return NextResponse.json(
        { error: `Requires ${workflow.required_role} role` },
        { status: 403 }
      )
    }

    if (
      workflow.required_title &&
      workflow.required_title.length > 0 &&
      (!user.title || !workflow.required_title.includes(user.title))
    ) {
      return NextResponse.json(
        { error: `Requires title: ${workflow.required_title.join(', ')}` },
        { status: 403 }
      )
    }

    const validationErrors: string[] = []
    for (const [key, fieldConfig] of Object.entries(workflow.input_schema ?? {})) {
      if (!fieldConfig) continue

      if (fieldConfig.required && !payload[key]) {
        validationErrors.push(`${fieldConfig.label || key} is required`)
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    const fiveMinutesAgo = new Date(Date.now() - FIVE_MINUTES_MS).toISOString()

    const { data: duplicateRun } = await supabase
      .from('workflow_runs')
      .select('id')
      .eq('workflow_id', workflow.id)
      .eq('triggered_by', user.id)
      .eq('input_params', payload)
      .gte('created_at', fiveMinutesAgo)
      .single()

    if (duplicateRun) {
      return NextResponse.json(
        {
          error: 'Duplicate workflow triggered within 5 minutes',
          workflow_run_id: duplicateRun.id
        },
        { status: 409 }
      )
    }

    const idempotencyToken = crypto
      .createHash('sha256')
      .update(`${workflow.id}:${user.id}:${JSON.stringify(payload)}`)
      .digest('hex')

    const webhookSignature = crypto
      .createHmac('sha256', process.env.N8N_WEBHOOK_SECRET!)
      .update(idempotencyToken)
      .digest('hex')

    const { data: workflowRun, error: runError } = await supabase
      .from('workflow_runs')
      .insert({
        workflow_id: workflow.id,
        workflow_key: workflow.key,
        triggered_by: user.id,
        entity_type: entity_type ?? 'process',
        input_params: payload,
        status: 'queued',
        idempotency_token: idempotencyToken,
        webhook_signature: webhookSignature
      })
      .select()
      .single()

    if (runError || !workflowRun) {
      return NextResponse.json(
        { error: 'Failed to create workflow run' },
        { status: 500 }
      )
    }

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

    const n8nResult = await n8nResponse.json().catch(() => ({}))

    if (!n8nResponse.ok) {
      await supabase
        .from('workflow_runs')
        .update({
          status: 'failed',
          error_message: `Failed to trigger n8n: ${await n8nResponse.text()}`,
          completed_at: new Date().toISOString()
        })
        .eq('id', workflowRun.id)

      return NextResponse.json(
        { error: 'Failed to trigger workflow' },
        { status: 502 }
      )
    }

    await supabase
      .from('workflow_runs')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        n8n_execution_id: n8nResult.execution_id ?? null
      })
      .eq('id', workflowRun.id)

    await supabase.from('audit_log').insert({
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

    return NextResponse.json({
      success: true,
      workflow_run_id: workflowRun.id,
      status: 'running',
      n8n_execution_id: n8nResult.execution_id ?? null
    })
  } catch (error) {
    console.error('Workflow trigger error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

