import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const updateInvestorUserSchema = z.object({
  can_sign: z.boolean().optional(),
  is_primary: z.boolean().optional(),
})

/**
 * PATCH /api/staff/investors/[id]/users/[userId]
 * Update a user's settings within an investor
 * Authentication: Staff only
 */
export async function PATCH(
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

    // Parse request body
    const body = await request.json()
    const validation = updateInvestorUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Use service client for data operations
    const supabase = createServiceClient()

    // First check if the record exists
    const { data: existing, error: checkError } = await supabase
      .from('investor_users')
      .select('investor_id, user_id')
      .eq('investor_id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError) {
      console.error('Check investor_users error:', checkError)
      return NextResponse.json({ error: 'Failed to check user', details: checkError.message }, { status: 500 })
    }

    if (!existing) {
      return NextResponse.json({ error: 'User not linked to this investor', investor_id: id, user_id: userId }, { status: 404 })
    }

    // Update the investor_users record
    const { data: updated, error: updateError } = await supabase
      .from('investor_users')
      .update(validation.data)
      .eq('investor_id', id)
      .eq('user_id', userId)
      .select()

    if (updateError) {
      console.error('Update investor_users error:', updateError)
      return NextResponse.json({ error: 'Failed to update user settings', details: updateError.message }, { status: 500 })
    }

    // Revalidate the detail page
    revalidatePath(`/versotech/staff/investors/${id}`)

    return NextResponse.json({
      message: 'User settings updated successfully',
      data: updated
    })
  } catch (error) {
    console.error('API /staff/investors/[id]/users/[userId] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

