import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { user, error: authError } = await getAuthenticatedUser(supabase)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Query profiles table for authoritative role (don't use stale user_metadata)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role && ['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)
    if (!isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { subject, message } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 })
    }

    const serviceClient = createServiceClient()

    const { data: investors, error: investorsError } = await serviceClient
      .from('investor_users')
      .select('user_id')

    if (investorsError) {
      console.error('Broadcast: failed to fetch investor users', investorsError)
      return NextResponse.json({ error: 'Failed to fetch investor recipients' }, { status: 500 })
    }

    const investorUserIds = (investors || []).map((row: any) => row.user_id)

    if (investorUserIds.length === 0) {
      return NextResponse.json({ error: 'No investor users found' }, { status: 400 })
    }

    const { data: conversation, error: conversationError } = await serviceClient
      .from('conversations')
      .insert({
        subject: subject?.trim() || 'Investor Broadcast',
        type: 'broadcast',
        visibility: 'investor',
        created_by: user.id,
        last_message_at: new Date().toISOString()
      })
      .select()
      .single()

    if (conversationError || !conversation?.id) {
      console.error('Broadcast: failed to create conversation', conversationError)
      return NextResponse.json({ error: 'Failed to create broadcast conversation' }, { status: 500 })
    }

    const participantInserts = investorUserIds
      .filter((investorUserId: string) => investorUserId !== user.id)
      .map((investorUserId: string) => ({
        conversation_id: conversation.id,
        user_id: investorUserId
      }))

    participantInserts.push({
      conversation_id: conversation.id,
      user_id: user.id
    } as any)

    const { error: participantsError } = await serviceClient
      .from('conversation_participants')
      .insert(participantInserts)

    if (participantsError) {
      console.error('Broadcast: failed to add participants', participantsError)
      return NextResponse.json({ error: 'Failed to add participants to broadcast' }, { status: 500 })
    }

    const { error: messageError } = await serviceClient
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        body: message.trim(),
        message_type: 'text'
      })

    if (messageError) {
      console.error('Broadcast: failed to create message', messageError)
      return NextResponse.json({ error: 'Failed to send broadcast message' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.CONVERSATIONS,
      entity_id: conversation.id,
      metadata: {
        type: 'broadcast',
        recipient_count: investorUserIds.length
      }
    })

    return NextResponse.json({
      success: true,
      conversation_id: conversation.id
    })

  } catch (error) {
    console.error('Broadcast endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

