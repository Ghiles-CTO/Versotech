import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createInvestorNotification } from '@/lib/notifications'

const createCapitalCallSchema = z.object({
  vehicle_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  call_pct: z.number().min(0).max(100),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['draft', 'pending', 'completed', 'cancelled']).optional().default('draft')
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'ceo'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createCapitalCallSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, name')
      .eq('id', data.vehicle_id)
      .single()

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Create capital call
    const { data: capitalCall, error: insertError } = await supabase
      .from('capital_calls')
      .insert({
        vehicle_id: data.vehicle_id,
        name: data.name,
        call_pct: data.call_pct,
        due_date: data.due_date,
        status: data.status
      })
      .select()
      .single()

    if (insertError) {
      console.error('Capital call creation error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create capital call' },
        { status: 500 }
      )
    }

    // Log audit
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: 'capital_calls',
      entity_id: capitalCall.id,
      metadata: {
        vehicle_id: data.vehicle_id,
        vehicle_name: vehicle.name,
        name: data.name,
        call_pct: data.call_pct,
        due_date: data.due_date,
        status: data.status
      }
    })

    // Notify investors if capital call is not a draft
    if (data.status !== 'draft') {
      try {
        const serviceSupabase = createServiceClient()

        // Get all investors subscribed to this vehicle
        const { data: subscriptions } = await serviceSupabase
          .from('subscriptions')
          .select(`
            investor_id,
            investor_users:investor_id (
              user_id
            )
          `)
          .eq('vehicle_id', data.vehicle_id)
          .not('investor_id', 'is', null)

        if (subscriptions && subscriptions.length > 0) {
          const dueDate = new Date(data.due_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })

          // Create notifications for each investor
          for (const subscription of subscriptions) {
            const investorUsers = subscription.investor_users as any[]
            const userId = investorUsers?.[0]?.user_id

            if (userId) {
              await createInvestorNotification({
                userId,
                investorId: subscription.investor_id,
                title: 'Capital Call Issued',
                message: `A capital call for ${vehicle.name} has been issued. Amount: ${data.call_pct}% of commitment. Due: ${dueDate}.`,
                link: '/versoholdings/tasks',
                type: 'capital_call',
                extraMetadata: {
                  capital_call_id: capitalCall.id,
                  vehicle_id: data.vehicle_id,
                  vehicle_name: vehicle.name,
                  call_pct: data.call_pct,
                  due_date: data.due_date
                }
              })
            }
          }
        }
      } catch (notificationError) {
        console.error('[capital-calls] Failed to send notifications:', notificationError)
      }
    }

    return NextResponse.json({
      success: true,
      capitalCall: {
        id: capitalCall.id,
        vehicleId: capitalCall.vehicle_id,
        vehicleName: vehicle.name,
        name: capitalCall.name,
        callPct: capitalCall.call_pct,
        dueDate: capitalCall.due_date,
        status: capitalCall.status
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Capital calls API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
