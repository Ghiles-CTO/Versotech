import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import crypto from 'crypto'

export const runtime = 'nodejs'

const createSubscriptionSchema = z.object({
  vehicle_id: z.string().uuid('Vehicle ID must be a valid UUID'),
  commitment: z.number().positive('Commitment must be positive'),
  currency: z.string().length(3, 'Currency must be 3 letters').toUpperCase(),
  status: z.enum(['pending', 'committed', 'active', 'closed', 'cancelled']),
  effective_date: z.string().optional().nullable(),
  funding_due_at: z.string().optional().nullable(),
  acknowledgement_notes: z.string().optional().nullable()
})

type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>

function createSubscriptionFingerprint(
  investorId: string,
  vehicleId: string,
  commitment: number,
  effectiveDate: string | null | undefined
): string {
  const commitmentStr = commitment.toString()
  const dateStr = effectiveDate || 'NULL'
  const input = `${investorId}:${vehicleId}:${commitmentStr}:${dateStr}`
  return crypto.createHash('sha256').update(input).digest('hex')
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ investorId: string }> }
) {
  const { investorId } = await params

  try {
    const authClient = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authClient)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staff = await isStaffUser(authClient, user)
    if (!staff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      console.error('[Subscriptions GET] Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
      return NextResponse.json(
        { error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set' },
        { status: 500 }
      )
    }

    const supabase = createServiceClient()

    // Verify investor exists
    const { data: investor, error: investorError } = await supabase
      .from('investors')
      .select('id, legal_name')
      .eq('id', investorId)
      .single()

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    // Fetch all subscriptions with vehicle details
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select(
        `
          id,
          subscription_number,
          vehicle_id,
          commitment,
          currency,
          status,
          effective_date,
          funding_due_at,
          committed_at,
          units,
          acknowledgement_notes,
          created_at,
          vehicle:vehicles (
            id,
            name,
            type,
            currency
          )
        `
      )
      .eq('investor_id', investorId)
      .order('vehicle_id', { ascending: true })
      .order('subscription_number', { ascending: true })

    if (subsError) {
      console.error('[Subscriptions GET] Error:', subsError)
      return NextResponse.json(
        {
          error: 'Failed to fetch subscriptions',
          details: subsError.message ?? subsError.hint ?? subsError.details ?? null
        },
        { status: 500 }
      )
    }

    // Group by vehicle and calculate totals
    const byVehicle: Record<string, any> = {}
    const totalsByCurrency: Record<string, number> = {}

    for (const sub of subscriptions || []) {
      const vehicleId = sub.vehicle_id
      if (!byVehicle[vehicleId]) {
        byVehicle[vehicleId] = {
          vehicle: sub.vehicle,
          subscriptions: [],
          total_commitment: 0,
          currency: sub.currency
        }
      }

      byVehicle[vehicleId].subscriptions.push(sub)
      byVehicle[vehicleId].total_commitment += Number(sub.commitment || 0)

      const currency = sub.currency || 'USD'
      totalsByCurrency[currency] = (totalsByCurrency[currency] || 0) + Number(sub.commitment || 0)
    }

    return NextResponse.json({
      investor: {
        id: investor.id,
        legal_name: investor.legal_name
      },
      subscriptions: subscriptions || [],
      grouped_by_vehicle: Object.values(byVehicle),
      summary: {
        total_vehicles: Object.keys(byVehicle).length,
        total_subscriptions: (subscriptions || []).length,
        total_commitment_by_currency: totalsByCurrency
      }
    })
  } catch (error) {
    console.error('[Subscriptions GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ investorId: string }> }
) {
  const { investorId } = await params

  try {
    const authClient = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(authClient)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staff = await isStaffUser(authClient, user)
    if (!staff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const input: CreateSubscriptionInput = createSubscriptionSchema.parse(body)

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      console.error('[Subscription POST] Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
      return NextResponse.json(
        { error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set' },
        { status: 500 }
      )
    }

    const supabase = createServiceClient()

    // Verify investor exists
    const { data: investor, error: investorError } = await supabase
      .from('investors')
      .select('id, legal_name')
      .eq('id', investorId)
      .single()

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    // Verify vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, name')
      .eq('id', input.vehicle_id)
      .single()

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Check fingerprint for idempotency
    const fingerprint = createSubscriptionFingerprint(
      investorId,
      input.vehicle_id,
      input.commitment,
      input.effective_date
    )

    const { data: existingFingerprint } = await supabase
      .from('subscription_fingerprints')
      .select('subscription_id')
      .eq('fingerprint', fingerprint)
      .maybeSingle()

    if (existingFingerprint) {
      // Duplicate detected - fetch existing subscription
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id, subscription_number, commitment, currency, status, created_at')
        .eq('id', existingFingerprint.subscription_id)
        .single()

      return NextResponse.json(
        {
          error: 'Subscription with this fingerprint already exists',
          existing_subscription: existingSub
        },
        { status: 409 }
      )
    }

    // Create subscription (subscription_number auto-increments via trigger)
    const { data: subscription, error: createError } = await supabase
      .from('subscriptions')
      .insert({
        investor_id: investorId,
        vehicle_id: input.vehicle_id,
        commitment: input.commitment,
        currency: input.currency,
        status: input.status,
        effective_date: input.effective_date || null,
        funding_due_at: input.funding_due_at || null,
        committed_at: input.effective_date || null,
        acknowledgement_notes: input.acknowledgement_notes || null
      })
      .select(
        `
          id,
          subscription_number,
          investor_id,
          vehicle_id,
          commitment,
          currency,
          status,
          effective_date,
          funding_due_at,
          committed_at,
          units,
          acknowledgement_notes,
          created_at
        `
      )
      .single()

    if (createError || !subscription) {
      console.error('[Subscription POST] Create error:', createError)
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      )
    }

    // Save fingerprint
    await supabase.from('subscription_fingerprints').insert({
      fingerprint,
      subscription_id: subscription.id
    })

    // Fetch entity_investor link (created by trigger)
    const { data: entityInvestor } = await supabase
      .from('entity_investors')
      .select('id, allocation_status, created_at')
      .eq('vehicle_id', input.vehicle_id)
      .eq('investor_id', investorId)
      .single()

    // Audit log
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.SUBSCRIPTION_CREATED,
      entity: AuditEntities.SUBSCRIPTIONS,
      entity_id: subscription.id,
      metadata: {
        vehicle_id: input.vehicle_id,
        investor_id: investorId,
        subscription_number: subscription.subscription_number,
        commitment: input.commitment,
        currency: input.currency,
        status: input.status
      }
    })

    return NextResponse.json(
      {
        subscription,
        entity_investor: entityInvestor,
        message: `Created subscription #${subscription.subscription_number} for ${investor.legal_name} in ${vehicle.name}`
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[Subscription POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
