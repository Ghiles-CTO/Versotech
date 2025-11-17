import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'

// Input validation schema
const inviteStaffSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['staff_admin', 'staff_ops', 'staff_rm']),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  title: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Get the super admin user
    const supabase = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has super_admin permission
    const { data: permission } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .eq('permission', 'super_admin')
      .single()

    if (!permission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = inviteStaffSchema.parse(body)

    // Check if email already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingProfile) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Generate temporary password
    const tempPassword = randomBytes(16).toString('hex')

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Create profile
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        role: validatedData.role,
        display_name: validatedData.display_name,
        title: validatedData.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      console.error('Profile creation error:', profileError)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    // Grant default permissions based on role
    const defaultPermissions = {
      staff_admin: ['manage_investors', 'manage_deals', 'trigger_workflows', 'view_financials'],
      staff_ops: ['manage_investors', 'trigger_workflows'],
      staff_rm: ['manage_investors', 'view_financials'],
    }

    const permissions = defaultPermissions[validatedData.role]

    if (permissions.length > 0) {
      await supabase
        .from('staff_permissions')
        .insert(
          permissions.map(permission => ({
            user_id: authData.user.id,
            permission,
            granted_by: user.id,
          }))
        )
    }

    // Log the action in audit_log
    await supabase
      .from('audit_log')
      .insert({
        actor_user_id: user.id,
        action: 'staff_invited',
        entity: 'profiles',
        entity_id: authData.user.id,
        metadata: {
          email: validatedData.email,
          role: validatedData.role,
          display_name: validatedData.display_name,
        },
      })

    // Send invitation email (would integrate with n8n workflow in production)
    // For now, return the temporary password (in production, send via secure email)

    return NextResponse.json({
      success: true,
      message: 'Staff member invited successfully',
      data: {
        user_id: authData.user.id,
        email: validatedData.email,
        role: validatedData.role,
        // In production, don't return password - send via secure email
        temporary_password: process.env.NODE_ENV === 'development' ? tempPassword : undefined,
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