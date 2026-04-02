import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { canManageVehicleBankAccounts } from '@/lib/vehicles/bank-account-auth'
import {
  fetchVehicleBankLawyers,
  getDefaultVehicleBankAccountDescription,
  normalizeVehicleBankAccountInput,
  syncVehicleBankFieldsToLegacyFeeStructures,
} from '@/lib/vehicles/bank-accounts'

const updateAccountSchema = z.object({
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; accountId: string }> }
) {
  try {
    const { id: vehicleId, accountId } = await params
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
    const parsed = updateAccountSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const [{ data: existing, error: existingError }, { data: vehicle, error: vehicleError }, lawyers] = await Promise.all([
      serviceSupabase
        .from('vehicle_bank_accounts')
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
        .eq('id', accountId)
        .eq('vehicle_id', vehicleId)
        .single(),
      serviceSupabase
        .from('vehicles')
        .select('id, name, lawyer_id')
        .eq('id', vehicleId)
        .single(),
      fetchVehicleBankLawyers(serviceSupabase),
    ])

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
    }

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const mergedInput = {
      lawyer_id: parsed.data.lawyer_id ?? existing.lawyer_id,
      bank_name: parsed.data.bank_name ?? existing.bank_name,
      bank_address: parsed.data.bank_address ?? existing.bank_address,
      holder_name: parsed.data.holder_name ?? existing.holder_name,
      law_firm_address: parsed.data.law_firm_address ?? existing.law_firm_address,
      description: parsed.data.description ?? existing.description,
      iban: parsed.data.iban ?? existing.iban,
      bic: parsed.data.bic ?? existing.bic,
      currency: parsed.data.currency ?? existing.currency,
    }

    const selectedLawyer = lawyers.find((lawyer) => lawyer.id === mergedInput.lawyer_id) ?? null
    const normalized = normalizeVehicleBankAccountInput(mergedInput, {
      lawyer: selectedLawyer,
      fallbackDescription: existing.description || getDefaultVehicleBankAccountDescription(vehicle.name),
    })

    const { data: updated, error: updateError } = await serviceSupabase
      .from('vehicle_bank_accounts')
      .update({
        ...normalized,
        updated_by: user.id,
      })
      .eq('id', accountId)
      .eq('vehicle_id', vehicleId)
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

    if (updateError || !updated) {
      console.error('[vehicle-bank-accounts] PATCH update error:', updateError)
      return NextResponse.json({ error: 'Failed to update bank account' }, { status: 500 })
    }

    let warning: string | null = null
    if (updated.status === 'active') {
      try {
        await syncVehicleBankFieldsToLegacyFeeStructures(serviceSupabase, vehicleId)
      } catch (syncError) {
        console.error('[vehicle-bank-accounts] PATCH legacy sync error:', syncError)
        warning = 'Bank account was updated, but the legacy term-sheet bank fields could not be synced.'
      }
    }

    await serviceSupabase.from('audit_logs').insert({
      action: 'vehicle_bank_account_updated',
      entity_type: 'vehicle_bank_account',
      entity_id: accountId,
      actor_id: user.id,
      details: {
        vehicle_id: vehicleId,
        status: updated.status,
      },
    })

    return NextResponse.json({ bankAccount: updated, warning })
  } catch (error) {
    console.error('[vehicle-bank-accounts] PATCH unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; accountId: string }> }
) {
  try {
    const { id: vehicleId, accountId } = await params
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

    const { data: existing, error: existingError } = await serviceSupabase
      .from('vehicle_bank_accounts')
      .select('id, vehicle_id, status')
      .eq('id', accountId)
      .eq('vehicle_id', vehicleId)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
    }

    const { error: deleteError } = await serviceSupabase
      .from('vehicle_bank_accounts')
      .delete()
      .eq('id', accountId)
      .eq('vehicle_id', vehicleId)

    if (deleteError) {
      console.error('[vehicle-bank-accounts] DELETE error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete bank account' }, { status: 500 })
    }

    let warning: string | null = null
    if (existing.status === 'active') {
      try {
        await syncVehicleBankFieldsToLegacyFeeStructures(serviceSupabase, vehicleId)
      } catch (syncError) {
        console.error('[vehicle-bank-accounts] DELETE legacy sync error:', syncError)
        warning = 'Bank account was deleted, but the legacy term-sheet bank fields could not be synced.'
      }
    }

    await serviceSupabase.from('audit_logs').insert({
      action: 'vehicle_bank_account_deleted',
      entity_type: 'vehicle_bank_account',
      entity_id: accountId,
      actor_id: user.id,
      details: {
        vehicle_id: vehicleId,
        status: existing.status,
      },
    })

    return NextResponse.json({ success: true, warning })
  } catch (error) {
    console.error('[vehicle-bank-accounts] DELETE unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
