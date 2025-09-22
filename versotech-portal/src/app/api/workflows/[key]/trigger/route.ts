import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Outbound webhook to n8n workflow
export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile 
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, title')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.role.startsWith('staff_')) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Get workflow configuration
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('key', params.key)
      .single()

    if (workflowError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Check if user is authorized for this workflow
    if (workflow.allowed_titles && !workflow.allowed_titles.includes(profile.title)) {
      return NextResponse.json({ error: 'Insufficient permissions for this workflow' }, { status: 403 })
    }

    // Parse request payload
    const payload = await request.json()
    
    // Generate idempotency key
    const idempotencyKey = crypto.randomUUID()
    
    // Create workflow run record
    const { data: workflowRun, error: runError } = await supabase
      .from('workflow_runs')
      .insert({
        workflow_id: workflow.id,
        triggered_by: user.id,
        payload,
        status: 'queued'
      })
      .select()
      .single()

    if (runError) {
      console.error('Error creating workflow run:', runError)
      return NextResponse.json({ error: 'Failed to create workflow run' }, { status: 500 })
    }

    // Prepare payload for n8n
    const n8nPayload = {
      action: params.key,
      entity_type: payload.entity_type || 'generic',
      entity_id: payload.entity_id,
      payload,
      idempotency_key: idempotencyKey,
      workflow_run_id: workflowRun.id,
      user_id: user.id,
      user_email: profile.email || user.email
    }

    // Sign the payload with HMAC
    const secret = process.env.N8N_WEBHOOK_SECRET!
    const signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(n8nPayload))
      .digest('hex')

    // Send to n8n webhook
    const n8nResponse = await fetch(workflow.n8n_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': Date.now().toString(),
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nResponse.ok) {
      // Update workflow run status to failed
      await supabase
        .from('workflow_runs')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', workflowRun.id)
      
      return NextResponse.json({ 
        error: 'Workflow trigger failed',
        details: await n8nResponse.text()
      }, { status: 500 })
    }

    // Update workflow run status to running
    await supabase
      .from('workflow_runs')
      .update({ status: 'running', updated_at: new Date().toISOString() })
      .eq('id', workflowRun.id)

    // Log audit event
    await supabase.from('audit_log').insert({
      actor_user_id: user.id,
      action: 'workflow_trigger',
      entity: 'workflow_runs',
      entity_id: workflowRun.id,
      hash: crypto.createHash('sha256').update(`workflow_trigger:${workflowRun.id}:${Date.now()}`).digest('hex')
    })

    return NextResponse.json({
      success: true,
      workflow_run_id: workflowRun.id,
      status: 'triggered'
    })

  } catch (error) {
    console.error('Workflow trigger error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

