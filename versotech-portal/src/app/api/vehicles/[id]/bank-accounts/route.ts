import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { canManageVehicleBankAccounts, canReadVehicleBankAccounts } from '@/lib/vehicles/bank-account-auth'
import {
  fetchVehicleBankAccounts,
  fetchVehicleBankLawyers,
  getDefaultVehicleBankAccountDescription,
  normalizeVehicleBankAccountInput,
} from '@/lib/vehicles/bank-accounts'

const createDraftSchema = z.object({
  lawyer_id: z.string().uuid().nullable().optional(),
  bank_name: z.string().nullable().optional(),
  bank_address: z.string().nullable().optional(),
  holder_name: z.string().nullable().optional(),
  law_firm_address: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  iban: z.string().nullable().optional(),
  bic: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const canRead = await canReadVehicleBankAccounts(serviceSupabase, user)
    if (!canRead) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [{ data: vehicle, error: vehicleError }, lawyers, bankAccounts] = await Promise.all([
      serviceSupabase
        .from('vehicles')
        .select('id, name, lawyer_id, currency')
        .eq('id', vehicleId)
        .single(),
      fetchVehicleBankLawyers(serviceSupabase),
      fetchVehicleBankAccounts(serviceSupabase, vehicleId),
    ])

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const mainAccount = bankAccounts.find((account) => account.status === 'active') ?? null
    const draftAccount = bankAccounts.find((account) => account.status === 'draft') ?? null

    return NextResponse.json({
      bankAccounts,
      mainAccount,
      draftAccount,
      lawyers,
      canManage: await canManageVehicleBankAccounts(serviceSupabase, user),
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        lawyer_id: vehicle.lawyer_id,
        currency: vehicle.currency,
        default_description: getDefaultVehicleBankAccountDescription(vehicle.name),
      },
    })
  } catch (error) {
    console.error('[vehicle-bank-accounts] GET unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const canManage = await canManageVehicleBankAccounts(serviceSupabase, user)
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = createDraftSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const [{ data: vehicle, error: vehicleError }, existingAccounts, lawyers] = await Promise.all([
      serviceSupabase
        .from('vehicles')
        .select('id, name, lawyer_id')
        .eq('id', vehicleId)
        .single(),
      fetchVehicleBankAccounts(serviceSupabase, vehicleId),
      fetchVehicleBankLawyers(serviceSupabase),
    ])

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    if (existingAccounts.some((account) => account.status === 'draft')) {
      return NextResponse.json(
        {
          error: 'A draft bank account already exists for this vehicle.',
          reasonCode: 'vehicle_bank_account_draft_exists',
        },
        { status: 409 }
      )
    }

    const selectedLawyerId = parsed.data.lawyer_id ?? vehicle.lawyer_id ?? null
    const selectedLawyer = lawyers.find((lawyer) => lawyer.id === selectedLawyerId) ?? null
    const normalized = normalizeVehicleBankAccountInput(
      {
        ...parsed.data,
        lawyer_id: selectedLawyerId,
      },
      {
        lawyer: selectedLawyer,
        fallbackDescription: getDefaultVehicleBankAccountDescription(vehicle.name),
      }
    )

    const { data: inserted, error: insertError } = await serviceSupabase
      .from('vehicle_bank_accounts')
      .insert({
        vehicle_id: vehicleId,
        status: 'draft',
        ...normalized,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        lawyer:lawyers (
          id,
          firm_name,
          display_name,
          primary_contact_email,
          street_address,
          city,
          state_province,
          postal_code,
          country
        )
      `)
      .single()

    if (insertError || !inserted) {
      console.error('[vehicle-bank-accounts] POST insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create bank account draft' }, { status: 500 })
    }

    await serviceSupabase.from('audit_logs').insert({
      action: 'vehicle_bank_account_draft_created',
      entity_type: 'vehicle_bank_account',
      entity_id: inserted.id,
      actor_id: user.id,
      details: {
        vehicle_id: vehicleId,
        status: inserted.status,
      },
    })

    return NextResponse.json({ bankAccount: inserted }, { status: 201 })
  } catch (error) {
    console.error('[vehicle-bank-accounts] POST unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
