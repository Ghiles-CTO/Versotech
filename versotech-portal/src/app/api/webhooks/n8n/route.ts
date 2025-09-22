import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Inbound webhook from n8n workflow completion
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-signature')
    const timestamp = request.headers.get('x-timestamp')
    const body = await request.text()
    
    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Missing signature or timestamp' }, { status: 400 })
    }

    // Verify timestamp (within 5 minutes)
    const requestTime = parseInt(timestamp)
    const currentTime = Date.now()
    if (Math.abs(currentTime - requestTime) > 300000) { // 5 minutes
      return NextResponse.json({ error: 'Request timestamp too old' }, { status: 400 })
    }

    // Verify HMAC signature
    const secret = process.env.N8N_WEBHOOK_SECRET!
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const { workflow_run_id, status, result_ref, error_message, artifacts } = payload

    if (!workflow_run_id) {
      return NextResponse.json({ error: 'Missing workflow_run_id' }, { status: 400 })
    }

    const supabase = await createClient()

    // Update workflow run status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (result_ref) {
      updateData.result_ref = result_ref
    }

    const { error: updateError } = await supabase
      .from('workflow_runs')
      .update(updateData)
      .eq('id', workflow_run_id)

    if (updateError) {
      console.error('Error updating workflow run:', updateError)
      return NextResponse.json({ error: 'Failed to update workflow run' }, { status: 500 })
    }

    // If workflow generated a document, create document record
    if (status === 'completed' && artifacts && artifacts.document) {
      const { file_key, type, owner_investor_id, vehicle_id } = artifacts.document
      
      await supabase.from('documents').insert({
        file_key,
        type,
        owner_investor_id: owner_investor_id || null,
        vehicle_id: vehicle_id || null,
        created_by: payload.original_user_id, // From the original trigger
        watermark: {
          generated_by: 'n8n_workflow',
          workflow_run_id,
          generated_at: new Date().toISOString()
        }
      })
    }

    // Log audit event
    await supabase.from('audit_log').insert({
      actor_user_id: payload.original_user_id || null,
      action: 'workflow_completed',
      entity: 'workflow_runs',
      entity_id: workflow_run_id,
      hash: crypto.createHash('sha256').update(`workflow_completed:${workflow_run_id}:${Date.now()}`).digest('hex')
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('n8n webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

