import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params

  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role.startsWith('staff_')) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const since = request.nextUrl.searchParams.get('since') ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '50')
  const offset = parseInt(request.nextUrl.searchParams.get('offset') ?? '0')

  try {
    // Fetch deal activity events (conversion events)
    const { data: activityEvents, error: activityError } = await serviceSupabase
      .from('deal_activity_events')
      .select(`
        id,
        event_type,
        payload,
        occurred_at,
        investor_id,
        investors (
          legal_name,
          display_name
        )
      `)
      .eq('deal_id', dealId)
      .gte('occurred_at', since)

    if (activityError) {
      console.error('Failed to fetch deal activity events', activityError)
      return NextResponse.json({ error: 'Failed to load activity events', details: activityError.message }, { status: 500 })
    }

    // Fetch audit logs for this deal
    const { data: auditLogs, error: auditError } = await serviceSupabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', 'deals')
      .eq('entity_id', dealId)
      .gte('timestamp', since)

    if (auditError) {
      console.error('Failed to fetch audit logs', auditError)
    }

    // Fetch interest workflow events
    const { data: interests, error: interestsError } = await serviceSupabase
      .from('investor_deal_interest')
      .select(`
        id,
        submitted_at,
        approved_at,
        rejected_at,
        status,
        indicative_amount,
        investor_id,
        investors (
          legal_name,
          display_name
        ),
        approved_by_profile:profiles!investor_deal_interest_approved_by_fkey (
          display_name,
          email,
          role
        ),
        rejected_by_profile:profiles!investor_deal_interest_rejected_by_fkey (
          display_name,
          email,
          role
        )
      `)
      .eq('deal_id', dealId)
      .gte('submitted_at', since)

    if (interestsError) {
      console.error('Failed to fetch interests', interestsError)
    }

    // Fetch subscription workflow events
    const { data: subscriptions, error: subscriptionsError } = await serviceSupabase
      .from('deal_subscription_submissions')
      .select(`
        id,
        submitted_at,
        decided_at,
        status,
        subscription_amount,
        investor_id,
        investors (
          legal_name,
          display_name
        ),
        decided_by_profile:profiles!deal_subscription_submissions_decided_by_fkey (
          display_name,
          email,
          role
        )
      `)
      .eq('deal_id', dealId)
      .gte('submitted_at', since)

    if (subscriptionsError) {
      console.error('Failed to fetch subscriptions', subscriptionsError)
    }

    // Fetch data room access events
    const { data: dataRoomAccess, error: dataRoomError } = await serviceSupabase
      .from('deal_data_room_access')
      .select(`
        id,
        granted_at,
        revoked_at,
        access_type,
        investor_id,
        investors (
          legal_name,
          display_name
        ),
        granted_by_profile:profiles!deal_data_room_access_granted_by_fkey (
          display_name,
          email,
          role
        ),
        revoked_by_profile:profiles!deal_data_room_access_revoked_by_fkey (
          display_name,
          email,
          role
        )
      `)
      .eq('deal_id', dealId)
      .gte('granted_at', since)

    if (dataRoomError) {
      console.error('Failed to fetch data room access', dataRoomError)
    }

    // Fetch team member events
    const { data: members, error: membersError } = await serviceSupabase
      .from('deal_memberships')
      .select(`
        id,
        invited_at,
        accepted_at,
        role,
        user_id,
        member_profile:profiles!deal_memberships_user_id_fkey (
          display_name,
          email,
          role
        ),
        invited_by_profile:profiles!deal_memberships_invited_by_fkey (
          display_name,
          email,
          role
        )
      `)
      .eq('deal_id', dealId)
      .gte('invited_at', since)

    if (membersError) {
      console.error('Failed to fetch members', membersError)
    }

    // Combine and format all events
    const allEvents: Array<{
      id: string
      timestamp: string
      type: string
      category: 'conversion' | 'audit' | 'membership' | 'interest' | 'access' | 'subscription'
      actor: {
        name: string | null
        email: string | null
        role: string | null
      }
      description: string
      details?: Record<string, any>
    }> = []

    // Add activity events (basic conversion events)
    activityEvents?.forEach(event => {
      const investor = Array.isArray(event.investors) ? event.investors[0] : event.investors
      const investorName = investor?.legal_name || investor?.display_name || 'Unknown Investor'

      allEvents.push({
        id: event.id,
        timestamp: event.occurred_at,
        type: event.event_type,
        category: 'conversion',
        actor: {
          name: investorName,
          email: null,
          role: 'investor'
        },
        description: formatActivityEventDescription(event.event_type, investorName),
        details: event.payload as Record<string, any>
      })
    })

    // Add interest workflow events
    interests?.forEach(interest => {
      const investor = Array.isArray(interest.investors) ? interest.investors[0] : interest.investors
      const investorName = investor?.legal_name || investor?.display_name || 'Unknown Investor'

      // Interest submitted
      if (interest.submitted_at) {
        allEvents.push({
          id: `interest-submitted-${interest.id}`,
          timestamp: interest.submitted_at,
          type: 'interest_submitted',
          category: 'interest',
          actor: {
            name: investorName,
            email: null,
            role: 'investor'
          },
          description: `${investorName} submitted interest${interest.indicative_amount ? ` for ${formatAmount(interest.indicative_amount)}` : ''}`,
          details: {
            interest_id: interest.id,
            indicative_amount: interest.indicative_amount,
            status: interest.status
          }
        })
      }

      // Interest approved
      if (interest.approved_at && interest.status === 'approved') {
        const approver = Array.isArray(interest.approved_by_profile)
          ? interest.approved_by_profile[0]
          : interest.approved_by_profile
        allEvents.push({
          id: `interest-approved-${interest.id}`,
          timestamp: interest.approved_at,
          type: 'interest_approved',
          category: 'interest',
          actor: {
            name: approver?.display_name || 'Staff',
            email: approver?.email || null,
            role: approver?.role || 'staff'
          },
          description: `Approved interest from ${investorName}${interest.indicative_amount ? ` (${formatAmount(interest.indicative_amount)})` : ''}`,
          details: {
            interest_id: interest.id,
            investor_name: investorName,
            indicative_amount: interest.indicative_amount
          }
        })
      }

      // Interest rejected
      if (interest.rejected_at && interest.status === 'rejected') {
        const rejector = Array.isArray(interest.rejected_by_profile)
          ? interest.rejected_by_profile[0]
          : interest.rejected_by_profile
        allEvents.push({
          id: `interest-rejected-${interest.id}`,
          timestamp: interest.rejected_at,
          type: 'interest_rejected',
          category: 'interest',
          actor: {
            name: rejector?.display_name || 'Staff',
            email: rejector?.email || null,
            role: rejector?.role || 'staff'
          },
          description: `Rejected interest from ${investorName}`,
          details: {
            interest_id: interest.id,
            investor_name: investorName
          }
        })
      }
    })

    // Add subscription workflow events
    subscriptions?.forEach(sub => {
      const investor = Array.isArray(sub.investors) ? sub.investors[0] : sub.investors
      const investorName = investor?.legal_name || investor?.display_name || 'Unknown Investor'

      // Subscription submitted
      if (sub.submitted_at) {
        allEvents.push({
          id: `subscription-submitted-${sub.id}`,
          timestamp: sub.submitted_at,
          type: 'subscription_submitted',
          category: 'subscription',
          actor: {
            name: investorName,
            email: null,
            role: 'investor'
          },
          description: `${investorName} submitted subscription${sub.subscription_amount ? ` for ${formatAmount(sub.subscription_amount)}` : ''}`,
          details: {
            subscription_id: sub.id,
            subscription_amount: sub.subscription_amount,
            status: sub.status
          }
        })
      }

      // Subscription approved/rejected
      if (sub.decided_at) {
        const decider = Array.isArray(sub.decided_by_profile)
          ? sub.decided_by_profile[0]
          : sub.decided_by_profile
        const isApproved = sub.status === 'approved'
        allEvents.push({
          id: `subscription-${sub.status}-${sub.id}`,
          timestamp: sub.decided_at,
          type: `subscription_${sub.status}`,
          category: 'subscription',
          actor: {
            name: decider?.display_name || 'Staff',
            email: decider?.email || null,
            role: decider?.role || 'staff'
          },
          description: `${isApproved ? 'Approved' : 'Rejected'} subscription from ${investorName}${sub.subscription_amount ? ` (${formatAmount(sub.subscription_amount)})` : ''}`,
          details: {
            subscription_id: sub.id,
            investor_name: investorName,
            subscription_amount: sub.subscription_amount
          }
        })
      }
    })

    // Add data room access events
    dataRoomAccess?.forEach(access => {
      const investor = Array.isArray(access.investors) ? access.investors[0] : access.investors
      const investorName = investor?.legal_name || investor?.display_name || 'Unknown Investor'

      // Access granted
      if (access.granted_at) {
        const granter = Array.isArray(access.granted_by_profile)
          ? access.granted_by_profile[0]
          : access.granted_by_profile
        const isManual = access.access_type === 'manual'
        allEvents.push({
          id: `access-granted-${access.id}`,
          timestamp: access.granted_at,
          type: 'data_room_granted',
          category: 'access',
          actor: {
            name: granter?.display_name || (isManual ? 'Staff' : 'System'),
            email: granter?.email || null,
            role: granter?.role || (isManual ? 'staff' : 'system')
          },
          description: `${isManual ? 'Manually granted' : 'Auto-granted'} data room access to ${investorName}`,
          details: {
            access_id: access.id,
            access_type: access.access_type,
            investor_name: investorName
          }
        })
      }

      // Access revoked
      if (access.revoked_at) {
        const revoker = Array.isArray(access.revoked_by_profile)
          ? access.revoked_by_profile[0]
          : access.revoked_by_profile
        allEvents.push({
          id: `access-revoked-${access.id}`,
          timestamp: access.revoked_at,
          type: 'data_room_revoked',
          category: 'access',
          actor: {
            name: revoker?.display_name || 'Staff',
            email: revoker?.email || null,
            role: revoker?.role || 'staff'
          },
          description: `Revoked data room access from ${investorName}`,
          details: {
            access_id: access.id,
            investor_name: investorName
          }
        })
      }
    })

    // Add team member events
    members?.forEach(member => {
      const memberProfile = Array.isArray(member.member_profile)
        ? member.member_profile[0]
        : member.member_profile
      const inviter = Array.isArray(member.invited_by_profile)
        ? member.invited_by_profile[0]
        : member.invited_by_profile
      const memberName = memberProfile?.display_name || 'Unknown Member'

      // Member invited/added
      if (member.invited_at) {
        allEvents.push({
          id: `member-added-${member.id}`,
          timestamp: member.invited_at,
          type: 'member_added',
          category: 'membership',
          actor: {
            name: inviter?.display_name || 'System',
            email: inviter?.email || null,
            role: inviter?.role || 'staff'
          },
          description: `Added ${memberName} as ${member.role || 'team member'}`,
          details: {
            membership_id: member.id,
            member_name: memberName,
            member_role: member.role
          }
        })
      }
    })

    // Add audit log events
    auditLogs?.forEach(log => {
      allEvents.push({
        id: log.id,
        timestamp: log.timestamp,
        type: `${log.action}_${log.event_type}`,
        category: 'audit',
        actor: {
          name: log.actor_name,
          email: log.actor_email,
          role: log.actor_role
        },
        description: formatAuditLogDescription(log.action, log.event_type, log.actor_name),
        details: log.action_details as Record<string, any> || {}
      })
    })

    // Sort by timestamp (newest first)
    allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Paginate
    const paginatedEvents = allEvents.slice(offset, offset + limit)

    return NextResponse.json({
      deal_id: dealId,
      since,
      events: paginatedEvents,
      total: allEvents.length,
      limit,
      offset
    })
  } catch (error) {
    console.error('Failed to fetch deal activity timeline', error)
    return NextResponse.json({ error: 'Failed to load activity timeline' }, { status: 500 })
  }
}

function formatAmount(amount: number | string | null): string {
  if (!amount) return ''
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function formatActivityEventDescription(eventType: string, investorName: string): string {
  const descriptions: Record<string, string> = {
    // Actual event types in database
    'im_interested': `${investorName} expressed interest in the deal`,
    'data_room_submit': `${investorName} submitted subscription documents to data room`,

    // Legacy/future event types
    'interest_submitted': `${investorName} submitted interest in the deal`,
    'interest_approved': `Interest from ${investorName} was approved`,
    'interest_rejected': `Interest from ${investorName} was rejected`,
    'nda_granted': `${investorName} was granted NDA access`,
    'nda_completed': `${investorName} completed NDA signing`,
    'data_room_granted': `${investorName} was granted data room access`,
    'subscription_started': `${investorName} started subscription process`,
    'subscription_submitted': `${investorName} submitted subscription documents`,
    'subscription_approved': `Subscription from ${investorName} was approved`,
    'allocation_confirmed': `Allocation confirmed for ${investorName}`,
    'capital_called': `Capital call sent to ${investorName}`,
    'capital_funded': `${investorName} funded capital call`
  }

  return descriptions[eventType] || `${investorName} - ${eventType.replace(/_/g, ' ')}`
}

function formatAuditLogDescription(action: string, eventType: string, actorName: string | null): string {
  const actor = actorName || 'System'

  const descriptions: Record<string, string> = {
    'create': `${actor} created the deal`,
    'update': `${actor} updated deal information`,
    'delete': `${actor} deleted the deal`,
    'publish': `${actor} published the deal`,
    'archive': `${actor} archived the deal`,
    'member_added': `${actor} added a team member`,
    'member_removed': `${actor} removed a team member`,
    'term_sheet_published': `${actor} published term sheet`,
    'allocation_updated': `${actor} updated allocations`
  }

  const key = eventType ? eventType : action
  return descriptions[key] || `${actor} performed ${action}`
}
