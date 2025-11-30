import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * Extract filename from Content-Disposition header
 */
function extractFilenameFromHeaders(headers: Headers): string | undefined {
  const disposition = headers.get('content-disposition')
  if (!disposition) return undefined

  const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
  if (filenameMatch && filenameMatch[1]) {
    return filenameMatch[1].replace(/['"]/g, '')
  }
  return undefined
}

/**
 * Check if Content-Type indicates binary response
 */
function isBinaryContentType(contentType: string): boolean {
  const binaryTypes = [
    'application/octet-stream',
    'application/vnd.openxmlformats-officedocument',
    'application/msword',
    'application/pdf',
    'application/zip',
    'image/',
    'video/',
    'audio/'
  ]
  return binaryTypes.some(type => contentType.includes(type))
}

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
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET || process.env.N8N_OUTBOUND_SECRET

    if (!webhookSecret) {
      console.error('N8N_WEBHOOK_SECRET not configured')
      return {
        success: false,
        error: 'Webhook authentication not configured. Cannot trigger workflow.'
      }
    }

    if (webhookSecret === 'default-webhook-secret' && process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: N8N_WEBHOOK_SECRET using insecure default value in production')
      return {
        success: false,
        error: 'Webhook authentication misconfigured. Please set a secure N8N_WEBHOOK_SECRET.'
      }
    }

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

    // Detect response type and handle accordingly
    const contentType = n8nResponse.headers.get('content-type') || ''
    let n8nResult: any = {}

    if (isBinaryContentType(contentType)) {
      // Binary response - use arrayBuffer to preserve binary data
      console.log('🔍 Detected binary response, Content-Type:', contentType)
      const arrayBuffer = await n8nResponse.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Extract filename from headers if available
      const filename = extractFilenameFromHeaders(n8nResponse.headers)

      // Verify binary integrity (check for common file signatures)
      const signature = buffer.slice(0, 4).toString('hex')
      console.log('📄 Binary file signature:', signature, 'size:', buffer.length, 'bytes')

      n8nResult = {
        binary: buffer,
        filename: filename,
        mimeType: contentType,
        size: buffer.length,
        signature: signature // Useful for debugging
      }
    } else if (contentType.includes('application/json')) {
      // JSON response
      const responseText = await n8nResponse.text()
      try {
        n8nResult = JSON.parse(responseText)
      } catch (error) {
        console.warn('⚠️ Failed to parse JSON response:', error)
        n8nResult = { raw: responseText }
      }
    } else {
      // Unknown content type - try JSON first, fall back to text
      const responseText = await n8nResponse.text()
      try {
        n8nResult = JSON.parse(responseText)
      } catch {
        // If not JSON and not explicitly binary, treat as latin1-encoded binary string
        // This handles cases where n8n returns binary without proper Content-Type
        console.log('⚠️ Unknown content type, treating as potential binary string')
        n8nResult = { raw: responseText }
      }
    }

    if (!n8nResponse.ok) {
      const errorMessage = n8nResult.raw
        ? `Failed to trigger n8n: ${n8nResult.raw}`
        : `Failed to trigger n8n: ${n8nResponse.status} ${n8nResponse.statusText}`

      await serviceSupabase
        .from('workflow_runs')
        .update({
          status: 'failed',
          error_message: errorMessage,
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
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'workflow',
      actor_id: user.id,
      action: 'workflow_triggered',
      entity_type: 'workflow_runs',
      entity_id: workflowRun.id,
      action_details: {
        workflow_key: workflow.key,
        payload,
        entity_type: workflowRun.entity_type
      },
      timestamp: new Date().toISOString()
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
