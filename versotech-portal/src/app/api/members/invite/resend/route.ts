import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendInvitationEmail } from '@/lib/email/resend-service'

/**
 * POST /api/members/invite/resend
 * Resend an invitation email and extend the expiry
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invitation_id } = body

    if (!invitation_id) {
      return NextResponse.json({ error: 'Missing invitation_id' }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()

    // Get the invitation
    const { data: invitation, error: fetchError } = await serviceSupabase
      .from('member_invitations')
      .select('*')
      .eq('id', invitation_id)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Check if invitation can be resent (pending or expired)
    if (!['pending', 'expired'].includes(invitation.status)) {
      return NextResponse.json({
        error: `Cannot resend invitation with status: ${invitation.status}`
      }, { status: 400 })
    }

    // Verify user has permission (must be the inviter, entity admin, or staff)
    const { data: inviterProfile } = await serviceSupabase
      .from('profiles')
      .select('display_name, email, role')
      .eq('id', user.id)
      .single()

    const isStaff = inviterProfile?.role?.startsWith('staff_') || inviterProfile?.role === 'ceo'
    const isInviter = invitation.invited_by === user.id

    if (!isStaff && !isInviter) {
      return NextResponse.json({
        error: 'You do not have permission to resend this invitation'
      }, { status: 403 })
    }

    // Extend expiry by 7 days from now
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const sentAt = new Date().toISOString()
    const reminderCount = (invitation.reminder_count ?? 0) + 1

    // Update invitation
    const { error: updateError } = await serviceSupabase
      .from('member_invitations')
      .update({
        status: 'pending', // Reset to pending if expired
        expires_at: newExpiresAt,
        sent_at: sentAt,
        last_reminded_at: sentAt,
        reminder_count: reminderCount,
      })
      .eq('id', invitation_id)

    if (updateError) {
      console.error('Error updating invitation:', updateError)
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
    }

    // Construct accept URL
    const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitation/accept?token=${invitation.invitation_token}`

    // Resend invitation email
    const emailResult = await sendInvitationEmail({
      email: invitation.email,
      inviteeName: undefined, // Will use email prefix
      entityName: invitation.entity_name,
      entityType: invitation.entity_type,
      role: invitation.role,
      inviterName: invitation.invited_by_name,
      acceptUrl: acceptUrl,
      expiresAt: newExpiresAt
    })

    if (!emailResult.success) {
      console.error('Failed to resend invitation email:', emailResult.error)
      return NextResponse.json({
        success: true,
        email_sent: false,
        message: 'Invitation updated but email delivery failed',
        new_expires_at: newExpiresAt
      })
    }

    // Log the action
    await serviceSupabase.from('audit_logs').insert({
      event_type: 'authorization',
      actor_id: user.id,
      action: 'invitation_resent',
      entity_type: invitation.entity_type,
      entity_id: invitation.entity_id,
      action_details: {
        invitation_id: invitation.id,
        email: invitation.email,
        previous_status: invitation.status,
        new_expires_at: newExpiresAt
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      email_sent: true,
      message: `Invitation resent to ${invitation.email}`,
      new_expires_at: newExpiresAt
    })

  } catch (error) {
    console.error('Error in POST /api/members/invite/resend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
