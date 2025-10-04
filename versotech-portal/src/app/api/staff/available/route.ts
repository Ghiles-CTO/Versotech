import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Get list of available staff members that investors can message
 * API Route: /api/staff/available
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all staff members (admin, ops, rm)
    const { data: staffMembers, error: staffError } = await supabase
      .from('profiles')
      .select('id, display_name, email, role')
      .or('role.eq.staff_admin,role.eq.staff_ops,role.eq.staff_rm')
      .order('display_name')

    if (staffError) {
      console.error('Error fetching staff members:', staffError)
      return NextResponse.json({ error: 'Failed to fetch staff members' }, { status: 500 })
    }

    // For each staff member, check if there's an existing conversation
    const staffWithConversations = await Promise.all(
      (staffMembers || []).map(async (staff) => {
        // Check for existing conversation
        const { data: existingConv } = await supabase
          .from('conversation_participants')
          .select(`
            conversation_id,
            conversations:conversation_id (
              id,
              last_message_at,
              messages (
                id,
                body,
                created_at
              )
            )
          `)
          .eq('user_id', user.id)

        // Find conversation where this staff member is also a participant
        let hasConversation = false
        let lastMessageAt = null
        let unreadCount = 0

        if (existingConv) {
          for (const conv of existingConv) {
            const { data: staffInConv } = await supabase
              .from('conversation_participants')
              .select('user_id, last_read_at')
              .eq('conversation_id', conv.conversation_id)
              .eq('user_id', staff.id)
              .single()

            if (staffInConv) {
              hasConversation = true
              lastMessageAt = conv.conversations?.last_message_at

              // Calculate unread count
              const { data: participant } = await supabase
                .from('conversation_participants')
                .select('last_read_at')
                .eq('conversation_id', conv.conversation_id)
                .eq('user_id', user.id)
                .single()

              if (participant && conv.conversations?.messages) {
                unreadCount = conv.conversations.messages.filter(
                  (m: any) => new Date(m.created_at) > new Date(participant.last_read_at)
                ).length
              }
              break
            }
          }
        }

        return {
          ...staff,
          hasConversation,
          lastMessageAt,
          unreadCount
        }
      })
    )

    return NextResponse.json({
      staff: staffWithConversations
    })

  } catch (error) {
    console.error('Get available staff error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


