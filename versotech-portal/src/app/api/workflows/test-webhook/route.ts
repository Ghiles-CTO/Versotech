import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/workflows/test-webhook
 * Test webhook connection to n8n
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await requireStaffAuth()

    const body = await request.json()
    const { webhook_url, test_data } = body

    if (!webhook_url) {
      return NextResponse.json(
        { error: 'webhook_url is required' },
        { status: 400 }
      )
    }

    // Prepare test payload
    const testPayload = {
      test: true,
      timestamp: new Date().toISOString(),
      triggered_by: {
        id: user.id,
        email: user.email,
        display_name: user.displayName,
        role: user.role
      },
      workflow_key: 'investor-onboarding',
      payload: test_data || {
        investor_email: 'test@example.com',
        investment_amount: 1000000,
        investor_type: 'individual',
        message: 'Test webhook from VERSO Portal'
      }
    }

    console.log('[Test Webhook] Sending to:', webhook_url)
    console.log('[Test Webhook] Payload:', JSON.stringify(testPayload, null, 2))

    // Send to n8n webhook
    const startTime = Date.now()
    const n8nResponse = await fetch(webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-verso-test': 'true'
      },
      body: JSON.stringify(testPayload)
    })

    const duration = Date.now() - startTime

    let responseData: any = {}
    let responseText = ''

    try {
      responseText = await n8nResponse.text()
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { raw: responseText }
    }

    console.log('[Test Webhook] Response status:', n8nResponse.status)
    console.log('[Test Webhook] Response:', responseData)
    console.log('[Test Webhook] Duration:', duration, 'ms')

    // Log the test in audit log
    await supabase.from('audit_log').insert({
      actor_user_id: user.id,
      action: 'webhook_test',
      entity: 'workflows',
      entity_id: webhook_url,
      metadata: {
        webhook_url,
        status: n8nResponse.status,
        duration_ms: duration,
        response: responseData
      }
    })

    return NextResponse.json({
      success: n8nResponse.ok,
      status: n8nResponse.status,
      status_text: n8nResponse.statusText,
      duration_ms: duration,
      request_payload: testPayload,
      response_data: responseData,
      response_headers: Object.fromEntries(n8nResponse.headers.entries())
    })
  } catch (error) {
    console.error('[Test Webhook] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to test webhook',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
