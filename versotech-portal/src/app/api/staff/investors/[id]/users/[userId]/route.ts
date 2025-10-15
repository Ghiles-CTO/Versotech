import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * DELETE /api/staff/investors/[id]/users/[userId]
 * Remove a user from an investor
 * Authentication: Staff only
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params
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

    // Remove the investor_users link
    const { error: deleteError } = await supabase
      .from('investor_users')
      .delete()
      .eq('investor_id', id)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Remove user from investor error:', deleteError)
      return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 })
    }

    // Revalidate the detail page
    revalidatePath(`/versotech/staff/investors/${id}`)

    return NextResponse.json({ message: 'User removed successfully' })
  } catch (error) {
    console.error('API /staff/investors/[id]/users/[userId] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

