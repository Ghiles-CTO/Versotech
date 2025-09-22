import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'

// Get conversations for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get conversations where user is a participant (RLS handles access control)
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants!inner (
          user_id,
          profiles:user_id (
            id,
            display_name,
            email,
            role
          )
        ),
        messages (
          id,
          body,
          created_at,
          sender:sender_id (
            display_name,
            email
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // Transform data to include latest message and participant info
    const transformedConversations = conversations?.map(conv => ({
      ...conv,
      participants: conv.conversation_participants?.map((p: any) => p.profiles) || [],
      latest_message: conv.messages?.[0] || null,
      message_count: conv.messages?.length || 0
    })) || []

    return NextResponse.json({
      conversations: transformedConversations
    })

  } catch (error) {
    console.error('Conversations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new conversation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subject, participant_ids, type = 'dm', initial_message } = await request.json()

    if (!participant_ids || participant_ids.length === 0) {
      return NextResponse.json({ error: 'At least one participant is required' }, { status: 400 })
    }

    // Ensure current user is included in participants
    const allParticipants = [...new Set([user.id, ...participant_ids])]

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        subject,
        created_by: user.id,
        type,
        name: type === 'group' ? subject : null
      })
      .select()
      .single()

    if (convError) {
      console.error('Error creating conversation:', convError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    // Add participants
    const participantInserts = allParticipants.map(participantId => ({
      conversation_id: conversation.id,
      user_id: participantId
    }))

    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert(participantInserts)

    if (partError) {
      console.error('Error adding participants:', partError)
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 })
    }

    // Send initial message if provided
    if (initial_message) {
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          body: initial_message
        })

      if (msgError) {
        console.error('Error sending initial message:', msgError)
      }
    }

    // Log conversation creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.CONVERSATIONS,
      entity_id: conversation.id,
      metadata: {
        subject,
        type,
        participant_count: allParticipants.length,
        has_initial_message: !!initial_message
      }
    })

    return NextResponse.json({
      success: true,
      conversation: {
        ...conversation,
        participant_count: allParticipants.length
      }
    })

  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

