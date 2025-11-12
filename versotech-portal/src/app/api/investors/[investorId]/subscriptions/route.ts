import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, isStaffUser } from '@/lib/api-auth'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import crypto from 'crypto'

export const runtime = 'nodejs'

const createSubscriptionSchema = z.object({
  // Core fields (required)
  vehicle_id: z.string().uuid('Vehicle ID must be a valid UUID'),
  commitment: z.number().positive('Commitment must be positive'),
  currency: z.string().length(3, 'Currency must be 3 letters').toUpperCase(),
  status: z.enum(['pending', 'committed', 'active', 'closed', 'cancelled']),

  // Date fields (optional)
  effective_date: z.string().optional().nullable(),
  funding_due_at: z.string().optional().nullable(),
  committed_at: z.string().optional().nullable(),
  contract_date: z.string().optional().nullable(),

  // Share/Unit fields (optional)
  price_per_share: z.number().optional().nullable(),
  cost_per_share: z.number().optional().nullable(),
  num_shares: z.number().optional().nullable(),
  units: z.number().optional().nullable(),
  spread_per_share: z.number().optional().nullable(),

  // Fee fields (optional)
  spread_fee_amount: z.number().optional().nullable(),
  subscription_fee_percent: z.number().optional().nullable(),
  subscription_fee_amount: z.number().optional().nullable(),
  bd_fee_percent: z.number().optional().nullable(),
  bd_fee_amount: z.number().optional().nullable(),
  finra_fee_amount: z.number().optional().nullable(),
  performance_fee_tier1_percent: z.number().optional().nullable(),
  performance_fee_tier1_threshold: z.number().optional().nullable(),
  performance_fee_tier2_percent: z.number().optional().nullable(),
  performance_fee_tier2_threshold: z.number().optional().nullable(),

  // Financial tracking fields (optional)
  funded_amount: z.number().optional().nullable(),
  outstanding_amount: z.number().optional().nullable(),
  capital_calls_total: z.number().optional().nullable(),
  distributions_total: z.number().optional().nullable(),
  current_nav: z.number().optional().nullable(),

  // Business context fields (optional)
  signed_doc_id: z.string().uuid().optional().nullable(),
  acknowledgement_notes: z.string().optional().nullable(),
  opportunity_name: z.string().optional().nullable(),
  sourcing_contract_ref: z.string().optional().nullable(),
  introducer_id: z.string().uuid().optional().nullable(),
  introduction_id: z.string().uuid().optional().nullable()
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

    // Fetch all subscriptions with vehicle details (all 39 fields)
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select(
        `
          *,
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

    // Create subscription with all provided fields (subscription_number auto-increments via trigger)
    const insertData: any = {
      investor_id: investorId,
      vehicle_id: input.vehicle_id,
      commitment: input.commitment,
      currency: input.currency,
      status: input.status,

      // Date fields
      effective_date: input.effective_date ?? null,
      funding_due_at: input.funding_due_at ?? null,
      committed_at: input.committed_at ?? input.effective_date ?? null,
      contract_date: input.contract_date ?? null,

      // Share/Unit fields
      price_per_share: input.price_per_share ?? null,
      cost_per_share: input.cost_per_share ?? null,
      num_shares: input.num_shares ?? null,
      units: input.units ?? null,
      spread_per_share: input.spread_per_share ?? null,

      // Fee fields
      spread_fee_amount: input.spread_fee_amount ?? null,
      subscription_fee_percent: input.subscription_fee_percent ?? null,
      subscription_fee_amount: input.subscription_fee_amount ?? null,
      bd_fee_percent: input.bd_fee_percent ?? null,
      bd_fee_amount: input.bd_fee_amount ?? null,
      finra_fee_amount: input.finra_fee_amount ?? null,
      performance_fee_tier1_percent: input.performance_fee_tier1_percent ?? null,
      performance_fee_tier1_threshold: input.performance_fee_tier1_threshold ?? null,
      performance_fee_tier2_percent: input.performance_fee_tier2_percent ?? null,
      performance_fee_tier2_threshold: input.performance_fee_tier2_threshold ?? null,

      // Financial tracking fields (default to 0 for numeric fields that shouldn't be null)
      funded_amount: input.funded_amount ?? 0,
      outstanding_amount: input.outstanding_amount ?? input.commitment,
      capital_calls_total: input.capital_calls_total ?? 0,
      distributions_total: input.distributions_total ?? 0,
      current_nav: input.current_nav ?? null,

      // Business context fields
      signed_doc_id: input.signed_doc_id ?? null,
      acknowledgement_notes: input.acknowledgement_notes ?? null,
      opportunity_name: input.opportunity_name ?? null,
      sourcing_contract_ref: input.sourcing_contract_ref ?? null,
      introducer_id: input.introducer_id ?? null,
      introduction_id: input.introduction_id ?? null
    }

    const { data: subscription, error: createError } = await supabase
      .from('subscriptions')
      .insert(insertData)
      .select('*')
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
        message: `Created subscription #${subscription.subscription_number} for ${investor.legal_name} in ${vehicle.name}`
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error('[Subscription POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
