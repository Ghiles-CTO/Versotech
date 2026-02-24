import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { getAppUrl } from '@/lib/signature/token'
import { sendInvitationEmail } from '@/lib/email/resend-service'
import { syncMemberSignatoryFromUserLink } from '@/lib/kyc/member-signatory-sync'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const addInvestorUserSchema = z.object({
  email: z.string().email().optional(),
  user_id: z.string().uuid().optional(),
}).refine((data) => data.email || data.user_id, {
  message: 'Either user_id or email is required'
})

/**
 * POST /api/staff/investors/[id]/users
 * Add a user to an investor (invite or link existing user)
 * Authentication: Staff only
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    const isStaff = await isStaffUser(authSupabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Use service client for data operations
    const supabase = createServiceClient()

    const body = await request.json()
    const validation = addInvestorUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, user_id } = validation.data

    // Check if investor exists
    const { data: investor, error: investorError } = await supabase
      .from('investors')
      .select('id, legal_name')
      .eq('id', id)
      .single()

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    let targetUserId: string | null = null
    let isNewInvite = false
    let emailMessageId: string | undefined
    let invitationId: string | undefined
    let acceptUrl: string | undefined
    let inviteEmail: string | undefined

    // If user_id is provided (existing user selected), use it directly
    if (user_id) {
      // Check if already linked
      const { data: existingLink } = await supabase
        .from('investor_users')
        .select('investor_id, user_id')
        .eq('investor_id', id)
        .eq('user_id', user_id)
        .single()

      if (existingLink) {
        return NextResponse.json(
          { error: 'User is already linked to this investor' },
          { status: 409 }
        )
      }

      targetUserId = user_id
    } else if (email) {
      const normalizedEmail = email.trim().toLowerCase()
      inviteEmail = normalizedEmail
      // Email provided - check if user exists or invite
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, email, display_name, role')
        .eq('email', normalizedEmail)
        .single()

      if (existingUser) {
        // User exists - check if already linked
        const { data: existingLink } = await supabase
          .from('investor_users')
          .select('investor_id, user_id')
          .eq('investor_id', id)
          .eq('user_id', existingUser.id)
          .single()

        if (existingLink) {
          return NextResponse.json(
            { error: 'User is already linked to this investor' },
            { status: 409 }
          )
        }

        targetUserId = existingUser.id
      } else {
        isNewInvite = true
        // User doesn't exist - create invitation and send via Resend
        try {
          const inviteeName = normalizedEmail.split('@')[0]
          const { data: inviterProfile } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', user.id)
            .single()

          const inviterName = inviterProfile?.display_name || inviterProfile?.email || 'A team member'

          const { data: existingInvitation } = await supabase
            .from('member_invitations')
            .select('id, status')
            .eq('entity_type', 'investor')
            .eq('entity_id', id)
            .eq('email', normalizedEmail)
            .in('status', ['pending', 'pending_approval'])
            .maybeSingle()

          if (existingInvitation) {
            return NextResponse.json(
              { error: 'A pending invitation already exists for this email.' },
              { status: 409 }
            )
          }

          const { data: invitation, error: invitationError } = await supabase
            .from('member_invitations')
            .insert({
              entity_type: 'investor',
              entity_id: id,
              entity_name: investor.legal_name || 'Investor',
              email: normalizedEmail,
              role: 'member',
              is_signatory: false,
              invited_by: user.id,
              invited_by_name: inviterName,
              status: 'pending',
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single()

          if (invitationError || !invitation) {
            console.error('Invitation creation error:', invitationError)
            return NextResponse.json(
              { error: 'Failed to create invitation' },
              { status: 500 }
            )
          }

          invitationId = invitation.id
          acceptUrl = `${getAppUrl()}/invitation/accept?token=${invitation.invitation_token}`

          const emailResult = await sendInvitationEmail({
            email: normalizedEmail,
            inviteeName: inviteeName,
            entityName: investor.legal_name || 'Investor',
            entityType: 'investor',
            role: 'member',
            inviterName,
            acceptUrl: acceptUrl,
            expiresAt: invitation.expires_at
          })

          if (!emailResult.success) {
            console.error('Failed to send invitation email via Resend:', emailResult.error)
            try {
              await supabase.from('member_invitations').delete().eq('id', invitation.id)
            } catch (cleanupError) {
              console.error('Failed to cleanup invitation after email failure:', cleanupError)
            }
            return NextResponse.json(
              { error: 'Invitation email failed to send. Please verify the email domain and try again.' },
              { status: 502 }
            )
          }
          emailMessageId = emailResult.messageId
        } catch (inviteErr) {
          console.error('Invitation error:', inviteErr)
          return NextResponse.json(
            { error: 'Failed to send invitation. User may already exist in auth system.' },
            { status: 500 }
          )
        }
      }
    }

    if (isNewInvite) {
      revalidatePath(`/versotech/staff/investors/${id}`)

      return NextResponse.json(
        {
          message: inviteEmail
            ? `Invitation sent to ${inviteEmail}`
            : 'Invitation sent',
          invited: true,
          email_sent: Boolean(emailMessageId),
          email_message_id: emailMessageId,
          invitation_id: invitationId,
          accept_url: acceptUrl
        },
        { status: 201 }
      )
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'User resolution failed' }, { status: 500 })
    }

    let targetEmail: string | null = inviteEmail || null
    if (!targetEmail) {
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', targetUserId)
        .maybeSingle()
      targetEmail = targetProfile?.email?.toLowerCase() || null
    }

    let resolvedCanSign = false
    const { data: linkedMember } = await supabase
      .from('investor_members')
      .select('is_signatory, can_sign')
      .eq('investor_id', id)
      .eq('is_active', true)
      .eq('linked_user_id', targetUserId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (linkedMember) {
      resolvedCanSign = Boolean(linkedMember.is_signatory || linkedMember.can_sign)
    } else if (targetEmail) {
      const { data: emailMember } = await supabase
        .from('investor_members')
        .select('is_signatory, can_sign')
        .eq('investor_id', id)
        .eq('is_active', true)
        .is('linked_user_id', null)
        .ilike('email', targetEmail)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      resolvedCanSign = Boolean(emailMember?.is_signatory || emailMember?.can_sign)
    }

    // Create the investor_users link
    const { error: linkError } = await supabase
      .from('investor_users')
      .insert({
        investor_id: id,
        user_id: targetUserId,
        can_sign: resolvedCanSign,
      })

    if (linkError) {
      console.error('Link user to investor error:', linkError)
      return NextResponse.json({ error: 'Failed to link user to investor' }, { status: 500 })
    }

    await syncMemberSignatoryFromUserLink({
      supabase,
      entityType: 'investor',
      entityId: id,
      userId: targetUserId,
      canSign: resolvedCanSign,
      userEmail: targetEmail,
    })

    // Note: Onboarding tasks are created automatically by database trigger
    // 'investor_users_create_onboarding_tasks' which fires AFTER INSERT on investor_users table
    // See: supabase/migrations/20251123000000_fix_onboarding_tasks_automation.sql

    // Revalidate the detail page
    revalidatePath(`/versotech/staff/investors/${id}`)

    return NextResponse.json(
      {
        message: 'User linked to investor successfully',
        user_id: targetUserId,
        invited: isNewInvite,
        email_sent: isNewInvite ? Boolean(emailMessageId) : undefined,
        email_message_id: emailMessageId
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API /staff/investors/[id]/users POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
