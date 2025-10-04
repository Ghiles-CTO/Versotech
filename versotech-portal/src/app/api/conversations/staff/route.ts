import { createClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Get or create a conversation between the current investor and a specific staff member
 * API Route: /api/conversations/staff?staff_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Staff Conversation API] Request received')
    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[Staff Conversation API] Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Staff Conversation API] User authenticated:', user.id)

    // Get staff member ID from query parameter
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staff_id')

    if (!staffId) {
      return NextResponse.json({ error: 'staff_id parameter is required' }, { status: 400 })
    }

    // Get the specific staff member
    const { data: staffMember, error: staffError } = await supabase
      .from('profiles')
      .select('id, display_name, email, role')
      .eq('id', staffId)
      .or('role.eq.staff_admin,role.eq.staff_ops,role.eq.staff_rm')
      .single()

    if (staffError || !staffMember) {
      console.error('[Staff Conversation API] Staff member not found:', staffError)
      return NextResponse.json({
        error: 'Staff member not found or not available for messaging'
      }, { status: 404 })
    }

    console.log('[Staff Conversation API] Found staff member:', staffMember.display_name)

    // Check if conversation already exists between these two users
    const { data: existingConversations, error: searchError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations:conversation_id (
          id,
          subject,
          type,
          created_at,
          last_message_at
        )
      `)
      .eq('user_id', user.id)

    if (searchError) {
      console.error('Error searching conversations:', searchError)
    }

    // Find conversation where both users are participants
    let existingConversation = null
    if (existingConversations) {
      for (const conv of existingConversations) {
        // Check if staff member is also in this conversation
        const { data: staffInConv } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.conversation_id)
          .eq('user_id', staffMember.id)
          .single()

        if (staffInConv) {
          existingConversation = conv.conversations
          break
        }
      }
    }

    // If conversation exists, return it
    if (existingConversation) {
      // Get full conversation details with participants and messages
      const { data: fullConv, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants (
            user_id,
            last_read_at,
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
            file_key,
            message_type,
            created_at,
            edited_at,
            deleted_at,
            sender:sender_id (
              id,
              display_name,
              email,
              role
            )
          )
        `)
        .eq('id', existingConversation.id)
        .single()

      if (convError) {
        console.error('Error fetching conversation:', convError)
        return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
      }

      // Transform data
      const conversation = {
        ...fullConv,
        participants: fullConv.conversation_participants?.map((p: any) => p.profiles) || [],
        messages: fullConv.messages?.filter((m: any) => !m.deleted_at) || []
      }

      return NextResponse.json({
        conversation,
        isNew: false
      })
    }

    // Create new conversation with staff member
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        subject: `Chat with ${staffMember.display_name || 'VERSO Team'}`,
        type: 'dm',
        created_by: user.id,
        last_message_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating conversation:', createError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    // Add both participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        {
          conversation_id: newConversation.id,
          user_id: user.id,
          last_read_at: new Date().toISOString()
        },
        {
          conversation_id: newConversation.id,
          user_id: staffMember.id,
          last_read_at: new Date().toISOString()
        }
      ])

    if (participantsError) {
      console.error('Error adding participants:', participantsError)
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 })
    }

    // Send welcome message from staff
    const { error: welcomeError } = await supabase
      .from('messages')
      .insert({
        conversation_id: newConversation.id,
        sender_id: staffMember.id,
        body: `Hello! I'm ${staffMember.display_name || 'from the VERSO team'}. How can I help you today?`,
        message_type: 'system'
      })

    if (welcomeError) {
      console.error('Error sending welcome message:', welcomeError)
    }

    // Log conversation creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.CONVERSATIONS,
      entity_id: newConversation.id,
      metadata: {
        type: 'dm',
        staff_member_id: staffMember.id,
        auto_created: true
      }
    })

    // Get full conversation with participants
    const { data: fullConv } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants (
          user_id,
          last_read_at,
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
          file_key,
          message_type,
          created_at,
          sender:sender_id (
            id,
            display_name,
            email,
            role
          )
        )
      `)
      .eq('id', newConversation.id)
      .single()

    const conversation = {
      ...fullConv,
      participants: fullConv?.conversation_participants?.map((p: any) => p.profiles) || [],
      messages: fullConv?.messages || []
    }

    return NextResponse.json({
      conversation,
      isNew: true
    })

  } catch (error) {
    console.error('Get/create staff conversation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
