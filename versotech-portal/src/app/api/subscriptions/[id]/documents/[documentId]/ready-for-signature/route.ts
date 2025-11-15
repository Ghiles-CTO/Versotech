import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const { id: subscriptionId, documentId } = await params

  const clientSupabase = await createClient()
  const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify staff access
  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role, display_name, email')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_')
  if (!isStaff) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const serviceSupabase = createServiceClient()

  // Get document and subscription details
  const { data: document } = await serviceSupabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('subscription_id', subscriptionId)
    .single()

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Get subscription with investor details including user_id from join table
  const { data: subscription } = await serviceSupabase
    .from('subscriptions')
    .select(`
      *,
      investor:investors(
        id,
        legal_name,
        display_name,
        email,
        investor_users!inner(user_id)
      ),
      vehicle:vehicles(id, name)
    `)
    .eq('id', subscriptionId)
    .single()

  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  // Get signed URL for document
  const { data: urlData } = await serviceSupabase.storage
    .from('deal-documents')
    .createSignedUrl(document.file_key, 7 * 24 * 60 * 60) // 7 days

  if (!urlData?.signedUrl) {
    return NextResponse.json({ error: 'Failed to generate document URL' }, { status: 500 })
  }

  // Create TWO signature requests (investor + staff)
  try {
    // 1. Investor signature request
    const investorSigPayload = {
      workflow_run_id: documentId, // Use document ID as workflow reference
      investor_id: subscription.investor_id,
      signer_email: subscription.investor.email,
      signer_name: subscription.investor.legal_name || subscription.investor.display_name,
      document_type: 'subscription',
      google_drive_url: urlData.signedUrl, // Use Supabase signed URL
      signer_role: 'investor',
      signature_position: 'party_a'
    }

    const investorSigResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/signature/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(investorSigPayload)
    })

    if (!investorSigResponse.ok) {
      const errorText = await investorSigResponse.text()
      throw new Error(`Failed to create investor signature request: ${errorText}`)
    }

    const investorSigData = await investorSigResponse.json()

    // 2. Staff signature request
    const staffSigPayload = {
      workflow_run_id: documentId,
      investor_id: subscription.investor_id,
      signer_email: 'cto@versoholdings.com',
      signer_name: 'Julien Machot',
      document_type: 'subscription',
      google_drive_url: urlData.signedUrl,
      signer_role: 'admin',
      signature_position: 'party_b'
    }

    const staffSigResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/signature/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffSigPayload)
    })

    if (!staffSigResponse.ok) {
      const errorText = await staffSigResponse.text()
      throw new Error(`Failed to create staff signature request: ${errorText}`)
    }

    const staffSigData = await staffSigResponse.json()

    // Update document status
    await serviceSupabase
      .from('documents')
      .update({
        ready_for_signature: true,
        status: 'pending_signature',
        signature_workflow_run_id: documentId
      })
      .eq('id', documentId)

    // Create tasks for both parties to sign the subscription pack
    // 1. Create task for investor
    // Get the user_id from the investor_users join table (investors can have multiple users)
    const investorUserId = subscription.investor?.investor_users?.[0]?.user_id

    let investorTaskResult: any = { data: null, error: null }

    if (!investorUserId) {
      console.warn('⚠️ No user_id found for investor:', subscription.investor_id)

      // Create an operational task for staff to follow up
      const opsTaskResult = await serviceSupabase
        .from('tasks')
        .insert({
          owner_user_id: '44965e29-c986-4d2e-84e2-4965ed27bd8f', // Julien Machot (CTO)
          kind: 'other',
          category: 'operational',
          title: 'Manual Signature Follow-up Required',
          description: `Investor ${subscription.investor?.legal_name || subscription.investor?.display_name} has no user account. Please manually send the signature link or create an account for them.`,
          priority: 'high',
          related_entity_type: 'subscription',
          related_entity_id: subscriptionId,
          due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
          instructions: {
            type: 'manual_follow_up',
            investor_email: subscription.investor?.email,
            signature_url: investorSigData.signing_url,
            signature_request_id: investorSigData.signature_request_id,
            document_id: documentId,
            action_required: 'Send signature link to investor or create platform account'
          },
          metadata: {
            subscription_id: subscriptionId,
            document_id: documentId,
            investor_id: subscription.investor_id,
            issue: 'investor_no_user_account'
          }
        })
        .select()
        .single()

      if (opsTaskResult.error) {
        console.error('❌ CRITICAL: Failed to create ops follow-up task for investor without account:', opsTaskResult.error)
        // This is important - we need to track this
        throw new Error(`Investor has no user account and ops task creation failed: ${opsTaskResult.error.message}`)
      }

      console.log('📋 Created ops follow-up task for investor without account:', opsTaskResult.data.id)

      // Create audit log entry for tracking
      await serviceSupabase.from('audit_logs').insert({
        action: 'signature_request_no_user',
        entity_type: 'subscription',
        entity_id: subscriptionId,
        metadata: {
          investor_id: subscription.investor_id,
          investor_name: subscription.investor?.legal_name || subscription.investor?.display_name,
          investor_email: subscription.investor?.email,
          signature_url: investorSigData.signing_url,
          ops_task_id: opsTaskResult.data.id
        }
      })

      // Continue without creating investor task - ops will handle manually
    } else {
      investorTaskResult = await serviceSupabase
        .from('tasks')
        .insert({
          owner_user_id: investorUserId,
          owner_investor_id: subscription.investor_id,
          kind: 'subscription_pack_signature',
          category: 'investment_setup',
          title: 'Sign Subscription Agreement',
          description: `Please review and sign your subscription agreement for ${subscription.vehicle?.name || 'the investment'}. This finalizes your commitment.`,
          priority: 'high',
          related_entity_type: 'subscription',
          related_entity_id: subscriptionId,
          due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          instructions: {
            type: 'signature',
            action_url: investorSigData.signing_url,
            signature_request_id: investorSigData.signature_request_id,
            document_id: documentId
          },
          metadata: {
            subscription_id: subscriptionId,
            document_id: documentId,
            signature_request_id: investorSigData.signature_request_id
          }
        })
        .select()
        .single()

      if (investorTaskResult.error) {
        // This is critical - investor won't know to sign without a task
        console.error('❌ CRITICAL: Failed to create investor signature task:', investorTaskResult.error)
        throw new Error(`Failed to create signature task: ${investorTaskResult.error.message}`)
      } else {
        console.log('✅ Created investor signature task:', investorTaskResult.data.id)
      }
    }

    // 2. Create notification for investor about the task (only if they have a user account)
    if (investorUserId && investorTaskResult.data) {
      const notificationResult = await serviceSupabase
        .from('notifications')
        .insert({
          user_id: investorUserId,
          type: 'task_created',
          title: 'Subscription Agreement Ready for Signature',
          message: 'Your subscription agreement is ready for signature. Please review and sign within 7 days to complete your investment.',
          action_url: `/versoholdings/tasks`,
          metadata: {
            task_id: investorTaskResult.data.id,
            subscription_id: subscriptionId,
            document_id: documentId
          }
        })

      if (notificationResult.error) {
        console.error('Failed to create notification:', notificationResult.error)
        // Non-critical - continue without notification
      }
    }

    // 3. Create task for staff member to countersign
    console.log('📝 Creating staff signature task')

    // Julien Machot's user ID (CTO)
    const staffUserId = '44965e29-c986-4d2e-84e2-4965ed27bd8f'

    const staffTaskResult = await serviceSupabase
      .from('tasks')
      .insert({
        owner_user_id: staffUserId,
        kind: 'countersignature',
        category: 'investment_setup',
        title: 'Countersign Subscription Agreement',
        description: `Please countersign the subscription agreement for ${subscription.investor?.legal_name || subscription.investor?.display_name}. Investment amount: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subscription.commitment || 0)}.`,
        priority: 'high',
        related_entity_type: 'subscription',
        related_entity_id: subscriptionId,
        due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        instructions: {
          type: 'signature',
          action_url: staffSigData.signing_url,
          signature_request_id: staffSigData.signature_request_id,
          document_id: documentId,
          signer_role: 'admin',
          investor_name: subscription.investor?.legal_name || subscription.investor?.display_name
        },
        metadata: {
          subscription_id: subscriptionId,
          document_id: documentId,
          signature_request_id: staffSigData.signature_request_id,
          investor_id: subscription.investor_id,
          vehicle_id: subscription.vehicle?.id
        }
      })
      .select()
      .single()

    if (staffTaskResult.error) {
      console.error('⚠️ Failed to create staff signature task:', staffTaskResult.error)
      // Non-critical - staff can still access via other means
    } else {
      console.log('✅ Created staff signature task:', staffTaskResult.data.id)

      // Create notification for staff member
      const staffNotifResult = await serviceSupabase
        .from('notifications')
        .insert({
          user_id: staffUserId,
          type: 'task_created',
          title: 'Subscription Agreement Requires Countersignature',
          message: `Please countersign the subscription agreement for ${subscription.investor?.legal_name || subscription.investor?.display_name} (${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subscription.commitment || 0)}).`,
          action_url: `/versotech/staff/tasks`,
          metadata: {
            task_id: staffTaskResult.data.id,
            subscription_id: subscriptionId,
            document_id: documentId,
            investor_name: subscription.investor?.legal_name || subscription.investor?.display_name
          }
        })

      if (staffNotifResult.error) {
        console.error('Failed to create staff notification:', staffNotifResult.error)
        // Non-critical - continue
      } else {
        console.log('✅ Created staff notification')
      }
    }

    console.log('📝 Staff signature details:', {
      signer_email: staffSigPayload.signer_email,
      signing_url: staffSigData.signing_url,
      task_id: staffTaskResult.data?.id
    })

    console.log('✅ Dual signature requests created for subscription pack:', {
      document_id: documentId,
      investor_request: investorSigData.signature_request_id,
      investor_task_id: investorTaskResult.data?.id,
      staff_request: staffSigData.signature_request_id,
      staff_task_id: staffTaskResult.data?.id
    })

    return NextResponse.json({
      success: true,
      investor_signature_request: investorSigData,
      staff_signature_request: staffSigData,
      investor_task_id: investorTaskResult.data?.id,
      staff_task_id: staffTaskResult.data?.id
    })

  } catch (error) {
    console.error('Error creating signature requests:', error)
    return NextResponse.json({
      error: 'Failed to initiate signature workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
