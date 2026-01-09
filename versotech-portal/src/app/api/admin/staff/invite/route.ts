import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getAppUrl } from '@/lib/signature/token'
import { sendInvitationEmail } from '@/lib/email/resend-service'
import { isSuperAdmin } from '@/lib/api-auth'

// Input validation schema
const inviteStaffSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['staff_admin', 'staff_ops', 'staff_rm', 'ceo']),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  title: z.string().optional(),
  is_super_admin: z.boolean().optional().default(false),
})

// Role display names for email
const ROLE_DISPLAY_NAMES: Record<string, string> = {
  staff_admin: 'Staff Administrator',
  staff_ops: 'Operations Staff',
  staff_rm: 'Relationship Manager',
  ceo: 'Chief Executive Officer',
}

export async function POST(request: NextRequest) {
  try {
    // Use regular client for authentication (reads cookies)
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client for admin operations (bypasses RLS)
    const supabase = createServiceClient()

    // Check if user has super_admin permission OR is CEO
    const hasAccess = await isSuperAdmin(supabase, user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = inviteStaffSchema.parse(body)

    const normalizedEmail = validatedData.email.trim().toLowerCase()

    // Check if email already exists in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from('member_invitations')
      .select('id, status')
      .eq('entity_type', 'staff')
      .eq('email', normalizedEmail)
      .in('status', ['pending', 'pending_approval'])
      .maybeSingle()

    if (existingInvitation) {
      return NextResponse.json({
        error: 'A pending invitation already exists for this email'
      }, { status: 400 })
    }

    // Get inviter info
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', user.id)
      .single()

    const inviterName = inviterProfile?.display_name || inviterProfile?.email || 'VERSO'

    // Create member_invitation record
    // Staff invitations are auto-approved (CEO is doing the inviting)
    const { data: invitation, error: invitationError } = await supabase
      .from('member_invitations')
      .insert({
        entity_type: 'staff',
        entity_id: null, // Staff don't have a specific entity - they're internal team
        entity_name: 'VERSO',
        email: normalizedEmail,
        role: validatedData.role,
        is_signatory: false,
        invited_by: user.id,
        invited_by_name: inviterName,
        status: 'pending', // Auto-approved since CEO/admin is inviting
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        // Store extra data in metadata for staff-specific info
        metadata: {
          display_name: validatedData.display_name,
          title: validatedData.title || ROLE_DISPLAY_NAMES[validatedData.role],
          is_super_admin: validatedData.is_super_admin,
          permissions: getDefaultPermissions(validatedData.role, validatedData.is_super_admin)
        }
      })
      .select()
      .single()

    if (invitationError || !invitation) {
      console.error('Invitation creation error:', invitationError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // Build accept URL using invitation token
    const acceptUrl = `${getAppUrl()}/invitation/accept?token=${invitation.invitation_token}`

    // Send invitation email
    const emailResult = await sendInvitationEmail({
      email: normalizedEmail,
      inviteeName: validatedData.display_name,
      entityName: 'VERSO',
      entityType: 'staff',
      role: validatedData.role,
      inviterName,
      acceptUrl,
      expiresAt: invitation.expires_at
    })

    if (!emailResult.success) {
      console.error('Failed to send staff invitation email:', emailResult.error)
      // Delete the invitation since email failed
      await supabase.from('member_invitations').delete().eq('id', invitation.id)
      return NextResponse.json({
        error: 'Failed to send invitation email. Please try again.'
      }, { status: 500 })
    }

    // Log the action in audit_logs
    await supabase
      .from('audit_logs')
      .insert({
        event_type: 'authorization',
        actor_id: user.id,
        action: 'staff_invited',
        entity_type: 'staff',
        entity_id: invitation.id,
        action_details: {
          invitation_id: invitation.id,
          email: normalizedEmail,
          role: validatedData.role,
          display_name: validatedData.display_name,
          is_super_admin: validatedData.is_super_admin,
        },
        timestamp: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: 'Staff member invited successfully',
      data: {
        invitation_id: invitation.id,
        email: normalizedEmail,
        role: validatedData.role,
        accept_url: acceptUrl,
      },
    })
  } catch (error) {
    console.error('Staff invite error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper to get default permissions for a role
function getDefaultPermissions(role: string, isSuperAdmin?: boolean): string[] {
  const defaultPermissions: Record<string, string[]> = {
    staff_admin: ['manage_investors', 'manage_deals', 'trigger_workflows', 'view_financials'],
    staff_ops: ['manage_investors', 'trigger_workflows'],
    staff_rm: ['manage_investors', 'view_financials'],
    ceo: ['manage_investors', 'manage_deals', 'trigger_workflows', 'view_financials', 'super_admin'],
  }

  const permissions = [...(defaultPermissions[role] || [])]

  if (isSuperAdmin && !permissions.includes('super_admin')) {
    permissions.push('super_admin')
  }

  return permissions
}
