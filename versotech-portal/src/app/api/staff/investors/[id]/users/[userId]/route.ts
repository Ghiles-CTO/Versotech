import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseDemoSession, DEMO_COOKIE_NAME } from '@/lib/demo-session'
import { revalidatePath } from 'next/cache'

// Helper to get user from either real auth or demo mode
async function getAuthenticatedUser(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (user) return { user, error: null, isDemo: false }
  
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
  if (demoCookie) {
    const demoSession = parseDemoSession(demoCookie.value)
    if (demoSession) {
      return {
        user: {
          id: demoSession.id,
          email: demoSession.email,
          role: demoSession.role
        },
        error: null,
        isDemo: true
      }
    }
  }
  return { user: null, error: authError || new Error('No authentication found'), isDemo: false }
}

/**
 * DELETE /api/staff/investors/[id]/users/[userId]
 * Remove a user from an investor
 * Authentication: Staff only
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const cookieStore = await cookies()
    const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)
    const supabase = demoCookie ? createServiceClient() : await createClient()

    // Check authentication
    const { user, error: authError, isDemo } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    let role: string
    if (isDemo) {
      role = user.role
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      role = profile?.role as string
    }

    if (!role || !role.startsWith('staff_')) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Remove the investor_users link
    const { error: deleteError } = await supabase
      .from('investor_users')
      .delete()
      .eq('investor_id', params.id)
      .eq('user_id', params.userId)

    if (deleteError) {
      console.error('Remove user from investor error:', deleteError)
      return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 })
    }

    // Revalidate the detail page
    revalidatePath(`/versotech/staff/investors/${params.id}`)

    return NextResponse.json({ message: 'User removed successfully' })
  } catch (error) {
    console.error('API /staff/investors/[id]/users/[userId] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

