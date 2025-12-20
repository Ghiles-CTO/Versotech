import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateMemberSchema = z.object({
  full_name: z.string().min(1).optional(),
  role: z.enum(['director', 'shareholder', 'beneficial_owner', 'authorized_signatory', 'officer', 'partner', 'other']).optional(),
  role_title: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  residential_street: z.string().optional().nullable(),
  residential_city: z.string().optional().nullable(),
  residential_state: z.string().optional().nullable(),
  residential_postal_code: z.string().optional().nullable(),
  residential_country: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  id_type: z.enum(['passport', 'national_id', 'drivers_license', 'other']).optional().nullable(),
  id_number: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  ownership_percentage: z.number().min(0).max(100).optional().nullable(),
  is_beneficial_owner: z.boolean().optional(),
  effective_from: z.string().optional().nullable(),
  effective_to: z.string().optional().nullable(),
})

interface RouteParams {
  params: Promise<{ memberId: string }>
}

/**
 * GET /api/investors/me/members/[memberId]
 * Get a single member by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { memberId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Fetch member and verify ownership
    const { data: member, error: memberError } = await serviceSupabase
      .from('investor_members')
      .select('*')
      .eq('id', memberId)
      .in('investor_id', investorIds)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/investors/me/members/[memberId]
 * Update a member
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { memberId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Verify member belongs to user's investor
    const { data: existingMember } = await serviceSupabase
      .from('investor_members')
      .select('id')
      .eq('id', memberId)
      .in('investor_id', investorIds)
      .single()

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = updateMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Update member
    const { data: updatedMember, error: updateError } = await serviceSupabase
      .from('investor_members')
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating member:', updateError)
      return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
    }

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/investors/me/members/[memberId]
 * Soft-delete a member (sets is_active = false)
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const { memberId } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get investor IDs for this user
    const { data: investorLinks } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Verify member belongs to user's investor
    const { data: existingMember } = await serviceSupabase
      .from('investor_members')
      .select('id')
      .eq('id', memberId)
      .in('investor_id', investorIds)
      .single()

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Soft delete - set is_active to false and effective_to date
    const { error: deleteError } = await serviceSupabase
      .from('investor_members')
      .update({
        is_active: false,
        effective_to: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)

    if (deleteError) {
      console.error('Error deleting member:', deleteError)
      return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
