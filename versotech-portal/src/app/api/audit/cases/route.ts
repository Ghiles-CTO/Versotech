import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { listAdminCases } from '@/lib/audit/admin-cases'

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const serviceSupabase = createServiceClient()
    const result = await listAdminCases(serviceSupabase, {
      search: searchParams.get('q'),
      status: searchParams.get('status'),
      assignedTo: searchParams.get('agent'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      escalatedOnly: searchParams.get('escalated') === 'true',
      resolution: searchParams.get('resolution'),
      priority: searchParams.get('priority'),
      category: searchParams.get('category'),
      limit: searchParams.get('limit') ? Number.parseInt(searchParams.get('limit') || '0', 10) : undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[audit-cases] Failed to load admin cases:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load admin cases' },
      { status: 500 },
    )
  }
}
