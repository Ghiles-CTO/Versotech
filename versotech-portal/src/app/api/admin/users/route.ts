import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check if user is super admin OR CEO
    const hasAccess = await isSuperAdmin(supabase, user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    // Fetch all profiles
    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        display_name,
        role,
        created_at,
        last_login_at,
        deleted_at
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`)
    }
    if (role && role !== 'all') {
      query = query.eq('role', role)
    }
    if (status && status !== 'all') {
      if (status === 'active') {
        query = query.is('deleted_at', null)
      } else if (status === 'inactive') {
        query = query.not('deleted_at', 'is', null)
      }
    }

    const { data: profiles, error } = await query.limit(100)

    if (error) {
      console.error('Failed to fetch users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Get failed login counts from audit logs
    const userIds = profiles?.map((p) => p.id) || []
    const { data: failedLogins } = await supabase
      .from('audit_logs')
      .select('actor_id')
      .eq('action', 'login_failed')
      .in('actor_id', userIds)
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    // Count failed logins per user
    const failedLoginCounts: Record<string, number> = {}
    failedLogins?.forEach((log) => {
      failedLoginCounts[log.actor_id] = (failedLoginCounts[log.actor_id] || 0) + 1
    })

    // Merge data with computed status
    const users = profiles?.map((p) => ({
      ...p,
      status: p.deleted_at ? 'inactive' : 'active',
      failed_login_attempts: failedLoginCounts[p.id] || 0,
    }))

    return NextResponse.json({
      success: true,
      data: {
        users,
        total: users?.length || 0,
      },
    })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
