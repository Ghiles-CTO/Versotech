import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/api-auth'
import { auditLogger, AuditActions } from '@/lib/audit'

interface TransferAssignmentsRequest {
  fromStaffId: string
  toStaffId: string
  assignmentType?: 'primary' | 'secondary' | 'both'
}

/**
 * POST /api/admin/staff/transfer-assignments
 * Transfers investor assignments from one staff member to another
 */
export async function POST(request: NextRequest) {
  try {
    // Use regular client for authentication
    const authSupabase = await createClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    // Use service client for admin operations (bypasses RLS)
    const supabase = createServiceClient()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions - only super_admin and manage_staff can transfer assignments
    const canAccess = await hasPermission(supabase, user.id, ['super_admin', 'manage_staff'])

    if (!canAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body: TransferAssignmentsRequest = await request.json()
    const { fromStaffId, toStaffId, assignmentType = 'both' } = body

    if (!fromStaffId || !toStaffId) {
      return NextResponse.json(
        { error: 'Both fromStaffId and toStaffId are required' },
        { status: 400 }
      )
    }

    if (fromStaffId === toStaffId) {
      return NextResponse.json(
        { error: 'Source and target staff cannot be the same' },
        { status: 400 }
      )
    }

    // Verify both staff members exist
    const { data: fromStaff, error: fromError } = await supabase
      .from('profiles')
      .select('id, display_name, role')
      .eq('id', fromStaffId)
      .single()

    if (fromError || !fromStaff) {
      return NextResponse.json({ error: 'Source staff member not found' }, { status: 404 })
    }

    const { data: toStaff, error: toError } = await supabase
      .from('profiles')
      .select('id, display_name, role')
      .eq('id', toStaffId)
      .single()

    if (toError || !toStaff) {
      return NextResponse.json({ error: 'Target staff member not found' }, { status: 404 })
    }

    let primaryTransferred = 0
    let secondaryTransferred = 0

    // Transfer primary RM assignments
    if (assignmentType === 'primary' || assignmentType === 'both') {
      const { data: primaryUpdated, error: primaryError } = await supabase
        .from('investors')
        .update({ primary_rm: toStaffId })
        .eq('primary_rm', fromStaffId)
        .select('id')

      if (primaryError) {
        console.error('Primary transfer error:', primaryError)
        return NextResponse.json({ error: 'Failed to transfer primary assignments' }, { status: 500 })
      }

      primaryTransferred = primaryUpdated?.length || 0
    }

    // Transfer secondary RM assignments
    if (assignmentType === 'secondary' || assignmentType === 'both') {
      const { data: secondaryUpdated, error: secondaryError } = await supabase
        .from('investors')
        .update({ secondary_rm: toStaffId })
        .eq('secondary_rm', fromStaffId)
        .select('id')

      if (secondaryError) {
        console.error('Secondary transfer error:', secondaryError)
        return NextResponse.json({ error: 'Failed to transfer secondary assignments' }, { status: 500 })
      }

      secondaryTransferred = secondaryUpdated?.length || 0
    }

    // Log the transfer action
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.UPDATE,
      entity: 'staff',
      entity_id: fromStaffId,
      metadata: {
        action_type: 'transfer_assignments',
        from_staff_id: fromStaffId,
        from_staff_name: fromStaff.display_name,
        to_staff_id: toStaffId,
        to_staff_name: toStaff.display_name,
        assignment_type: assignmentType,
        primary_transferred: primaryTransferred,
        secondary_transferred: secondaryTransferred,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        fromStaff: {
          id: fromStaff.id,
          displayName: fromStaff.display_name,
        },
        toStaff: {
          id: toStaff.id,
          displayName: toStaff.display_name,
        },
        transferred: {
          primary: primaryTransferred,
          secondary: secondaryTransferred,
          total: primaryTransferred + secondaryTransferred,
        },
      },
    })
  } catch (error) {
    console.error('Transfer assignments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
