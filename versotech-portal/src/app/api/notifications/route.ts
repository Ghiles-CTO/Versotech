import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 50)
  const offset = Number(request.nextUrl.searchParams.get('offset') ?? 0)
  const type = request.nextUrl.searchParams.get('type')
  const createdByMe = request.nextUrl.searchParams.get('created_by_me') === 'true'
  const dealId = request.nextUrl.searchParams.get('deal_id')
  const includeTasks = request.nextUrl.searchParams.get('include_tasks') === 'true'
  const taskLimitRaw = Number(request.nextUrl.searchParams.get('task_limit') ?? 2)
  const taskLimit = Number.isFinite(taskLimitRaw) ? Math.min(Math.max(taskLimitRaw, 1), 20) : 2

  // Check if user is a lawyer (lawyers use 'notifications' table, others use 'investor_notifications')
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', { p_user_id: user.id })
  const isLawyer = personas?.some((p: { persona_type: string }) => p.persona_type === 'lawyer') || false

  let data: any[] = []
  let uniqueTypes: string[] = []
  let tasks: any[] = []

  if (isLawyer) {
    const maxFetch = offset + limit
    let notificationsQuery = serviceSupabase
      .from('notifications')
      .select('id, user_id, title, message, link, read, created_at, type, agent_id, agent:agent_id (id, name, avatar_url)')
      .eq('user_id', user.id)

    if (type && type !== 'all') {
      notificationsQuery = notificationsQuery.eq('type', type)
    }

    const notificationsPromise = createdByMe
      ? Promise.resolve({ data: [] as any[], error: null })
      : notificationsQuery
          .order('created_at', { ascending: false })
          .range(0, maxFetch - 1)

    let investorQuery = serviceSupabase
      .from('investor_notifications')
      .select('id, user_id, investor_id, title, message, link, action_url, read_at, created_at, type, created_by, deal_id, agent_id, agent:agent_id (id, name, avatar_url)')

    if (createdByMe) {
      investorQuery = investorQuery.eq('created_by', user.id)
    } else {
      investorQuery = investorQuery.eq('user_id', user.id)
    }

    if (type && type !== 'all') {
      investorQuery = investorQuery.eq('type', type)
    }

    if (dealId) {
      investorQuery = investorQuery.eq('deal_id', dealId)
    }

    const [notifResult, investorResult] = await Promise.all([
      notificationsPromise,
      investorQuery
        .order('created_at', { ascending: false })
        .range(0, maxFetch - 1)
    ])

    if (notifResult.error) {
      console.error('Failed to fetch notifications:', notifResult.error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    if (investorResult.error) {
      console.error('Failed to fetch investor notifications:', investorResult.error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    const notificationRows = (notifResult.data || []).map(n => ({
      ...n,
      read_at: n.read ? n.created_at : null,
      investor_id: null,
      created_by: null,
      deal_id: null
    }))

    const investorRows = (investorResult.data || []).map((n: any) => ({
      ...n,
      link: n.link ?? n.action_url ?? null
    }))

    data = [...notificationRows, ...investorRows]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit)

    const typeSets = new Set<string>()

    if (!createdByMe) {
      const { data: typesData } = await serviceSupabase
        .from('notifications')
        .select('type')
        .eq('user_id', user.id)
        .not('type', 'is', null)

      ;(typesData || []).forEach((t: any) => {
        if (t.type) typeSets.add(t.type)
      })
    }

    const { data: investorTypes } = await serviceSupabase
      .from('investor_notifications')
      .select('type')
      .eq(createdByMe ? 'created_by' : 'user_id', user.id)
      .not('type', 'is', null)

    ;(investorTypes || []).forEach((t: any) => {
      if (t.type) typeSets.add(t.type)
    })

    uniqueTypes = Array.from(typeSets)
  } else {
    // Non-lawyers use 'investor_notifications' table
    let query = serviceSupabase
      .from('investor_notifications')
      .select('id, user_id, investor_id, title, message, link, action_url, read_at, created_at, type, created_by, deal_id, agent_id, agent:agent_id (id, name, avatar_url)')

    if (createdByMe) {
      // Show notifications I created for others
      query = query.eq('created_by', user.id)
    } else {
      // Show notifications addressed to me
      query = query.eq('user_id', user.id)
    }

    // Apply type filter if specified
    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    // Apply deal filter if specified
    if (dealId) {
      query = query.eq('deal_id', dealId)
    }

    const { data: notifData, error: notificationsError } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (notificationsError) {
      console.error('Failed to fetch notifications:', notificationsError)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    data = (notifData || []).map((n: any) => ({
      ...n,
      link: n.link ?? n.action_url ?? null
    }))

    // Get unique notification types for filter dropdown
    const { data: typesData } = await serviceSupabase
      .from('investor_notifications')
      .select('type')
      .eq('user_id', user.id)
      .not('type', 'is', null)

    uniqueTypes = [...new Set((typesData || []).map(t => t.type).filter(Boolean))]
  }

  if (includeTasks) {
    const { data: investorLinks, error: investorLinksError } = await serviceSupabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (investorLinksError) {
      console.error('Failed to fetch investor links for tasks:', investorLinksError)
    }

    const investorIds = (investorLinks || [])
      .map((link: { investor_id: string | null }) => link.investor_id)
      .filter(Boolean) as string[]

    let tasksQuery = serviceSupabase
      .from('tasks')
      .select('id, title, description, status, priority, due_at, kind, category, created_at, instructions')
      .in('kind', ['deal_nda_signature', 'subscription_pack_signature'])
      .eq('category', 'signatures')
      .in('status', ['pending', 'in_progress'])

    if (investorIds.length > 0) {
      tasksQuery = tasksQuery.or(
        `owner_user_id.eq.${user.id},owner_investor_id.in.(${investorIds.join(',')})`
      )
    } else {
      tasksQuery = tasksQuery.eq('owner_user_id', user.id)
    }

    const { data: taskRows, error: taskError } = await tasksQuery
      .order('created_at', { ascending: false })
      .limit(taskLimit)

    if (taskError) {
      console.error('Failed to fetch signature tasks for dropdown:', taskError)
    } else {
      tasks = taskRows || []
    }
  }

  return NextResponse.json({
    notifications: data,
    types: uniqueTypes,
    tasks
  })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const ids: string[] = Array.isArray(body?.ids) ? body.ids : []

  if (!ids.length) {
    return NextResponse.json({ error: 'No notification ids provided' }, { status: 400 })
  }

  // Check if user is a lawyer (lawyers use 'notifications' table with 'read' boolean)
  const { data: personas } = await serviceSupabase.rpc('get_user_personas', { p_user_id: user.id })
  const isLawyer = personas?.some((p: { persona_type: string }) => p.persona_type === 'lawyer') || false

  if (isLawyer) {
    // Lawyers can receive both notifications and investor_notifications
    const [notifUpdate, investorUpdate] = await Promise.all([
      serviceSupabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .in('id', ids),
      serviceSupabase
        .from('investor_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .in('id', ids)
    ])

    if (notifUpdate.error || investorUpdate.error) {
      console.error('Failed to mark notifications read:', notifUpdate.error || investorUpdate.error)
      return NextResponse.json({ error: 'Failed to mark notifications read' }, { status: 500 })
    }
  } else {
    // Non-lawyers use 'investor_notifications' table with 'read_at' timestamp
    const { error: updateError } = await serviceSupabase
      .from('investor_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .in('id', ids)

    if (updateError) {
      console.error('Failed to mark notifications read:', updateError)
      return NextResponse.json({ error: 'Failed to mark notifications read' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
