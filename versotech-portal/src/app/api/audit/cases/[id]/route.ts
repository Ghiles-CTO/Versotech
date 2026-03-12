import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { getAdminCaseDetail } from '@/lib/audit/admin-cases'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authSupabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authSupabase)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasStaffAccess = await isStaffUser(authSupabase, user)
    if (!hasStaffAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const serviceSupabase = createServiceClient()
    const detail = await getAdminCaseDetail(serviceSupabase, id)

    return NextResponse.json(detail)
  } catch (error) {
    console.error('[audit-cases] Failed to load admin case detail:', error)
    const message = error instanceof Error ? error.message : 'Failed to load admin case detail'
    const status = message === 'Case not found' ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
