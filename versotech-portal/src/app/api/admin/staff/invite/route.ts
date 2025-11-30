import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getAppUrl } from '@/lib/signature/token'

// Input validation schema
const inviteStaffSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['staff_admin', 'staff_ops', 'staff_rm']),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  title: z.string().optional(),
})

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

    // Check if email already exists in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingProfile) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Send invitation via Supabase Auth
    const { data: authData, error: authError} = await supabase.auth.admin.inviteUserByEmail(
      validatedData.email,
      {
        data: {
          display_name: validatedData.display_name,
          role: validatedData.role,
          title: validatedData.title,
        },
        // IMPORTANT: Must redirect to /auth/callback for PKCE code exchange
        // The callback will then redirect to staff portal based on user role
        redirectTo: `${getAppUrl()}/auth/callback?portal=staff`
      }
    )

    if (authError) {
      console.error('Auth invitation error:', authError)
      return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Create profile
    // Note: Supabase might create the user in auth.users, but we still need to ensure the profile exists in our public.profiles table
    // The trigger might handle this, but to be safe and ensure all fields are set correctly immediately:
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: validatedData.email,
        role: validatedData.role,
        display_name: validatedData.display_name,
        title: validatedData.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // We don't delete the auth user here because the invite was already sent, 
      // but we should log this critical error.
      return NextResponse.json({ error: 'User invited but profile creation failed' }, { status: 500 })
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

    // Log the action in audit_logs
    await supabase
      .from('audit_logs')
      .insert({
        event_type: 'authorization',
        actor_id: user.id,
        action: 'staff_invited',
        entity_type: 'profiles',
        entity_id: authData.user.id,
        action_details: {
          email: validatedData.email,
          role: validatedData.role,
          display_name: validatedData.display_name,
        },
        timestamp: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: 'Staff member invited successfully',
      data: {
        user_id: authData.user.id,
        email: validatedData.email,
        role: validatedData.role,
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