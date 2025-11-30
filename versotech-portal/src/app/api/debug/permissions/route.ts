import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// TEMPORARY DEBUG ENDPOINT - DELETE AFTER TESTING
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated', user: null })
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', user.id)
      .single()

    // Get permissions
    const { data: permissions, error: permError } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)

    return NextResponse.json({
      user_id: user.id,
      email: user.email,
      profile,
      profileError: profileError?.message,
      permissions,
      permError: permError?.message,
      permissions_array: permissions?.map(p => p.permission) || []
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
