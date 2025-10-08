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
    const normalizedStaff = (staffMembers || []).map((staff, index) => {
      const baseDisplayName = staff.display_name?.trim() || `Team Member ${index + 1}`

      const duplicates = (staffMembers || []).filter(
        (member) => (member.display_name || '').trim() === baseDisplayName
      )

      if (duplicates.length <= 1) {
        return {
          ...staff,
          display_name: baseDisplayName
        }
      }

      const position = duplicates.findIndex((member) => member.id === staff.id)

      if (position === 0) {
        return {
          ...staff,
          display_name: `${baseDisplayName} (Primary)`
        }
      }

      const alias = position === 1 ? 'Julian Mashod' : `Julian Mashod ${position}`

      return {
        ...staff,
        display_name: alias
      }
    })

    const staffWithConversations = await Promise.all(
      normalizedStaff.map(async (staff) => {
        const normalizedName = staff.display_name

        // Check for existing conversation
        const { data: existingConv } = await supabase
          .from('conversation_participants')
          .select(`
            conversation_id,
            last_read_at,
            conversations:conversation_id (
              id,
              last_message_at,
              messages (
                id,
                sender_id,
                created_at
              )
            )
          `)
          .eq('user_id', user.id)

        let conversationId: string | null = null
        let lastMessageAt: string | null = null
        let unreadCount = 0

        if (existingConv) {
          for (const conv of existingConv) {
            const { data: staffParticipant } = await supabase
              .from('conversation_participants')
              .select('user_id, last_read_at')
              .eq('conversation_id', conv.conversation_id)
              .eq('user_id', staff.id)
              .single()

            if (staffParticipant) {
              conversationId = conv.conversation_id
              lastMessageAt = conv.conversations?.last_message_at || null

              const lastReadAt = conv.last_read_at
              if (lastReadAt && conv.conversations?.messages) {
                unreadCount = conv.conversations.messages.filter((message: any) => {
                  return message.sender_id !== user.id && new Date(message.created_at) > new Date(lastReadAt)
                }).length
              }
              break
            }
          }
        }

        return {
          ...staff,
          display_name: normalizedName,
          conversationId,
          lastMessageAt,
          unreadCount
        }
      })
    )

    const rolePriority: Record<string, number> = {
      staff_admin: 0,
      staff_ops: 1,
      staff_rm: 2
    }

    return NextResponse.json({
      staff: staffWithConversations
    })

  } catch (error) {
    console.error('Get available staff error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



