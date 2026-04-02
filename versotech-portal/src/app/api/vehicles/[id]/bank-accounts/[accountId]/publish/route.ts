import { NextRequest, NextResponse } from 'next/server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { canManageVehicleBankAccounts } from '@/lib/vehicles/bank-account-auth'
import {
  getVehicleBankAccountMissingFields,
  getVehicleBankAccountState,
  syncVehicleBankFieldsToLegacyFeeStructures,
} from '@/lib/vehicles/bank-accounts'

export async function POST(
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

    const state = await getVehicleBankAccountState(serviceSupabase, vehicleId)
    const selectedAccount = state.accounts.find((account) => account.id === accountId)

    if (!selectedAccount) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
    }

    if (selectedAccount.status !== 'draft') {
      return NextResponse.json(
        {
          error: 'Only draft bank accounts can be published.',
          reasonCode: 'vehicle_bank_account_publish_requires_draft',
        },
        { status: 409 }
      )
    }

    const missingFields = getVehicleBankAccountMissingFields(selectedAccount)
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Bank account is incomplete and cannot be published.',
          reasonCode: 'vehicle_bank_account_incomplete',
          missingFields,
        },
        { status: 400 }
      )
    }

    const { data: publishedId, error: publishError } = await serviceSupabase.rpc(
      'publish_vehicle_bank_account',
      {
        p_vehicle_id: vehicleId,
        p_account_id: accountId,
        p_actor_id: user.id,
      },
    )

    if (publishError || !publishedId) {
      console.error('[vehicle-bank-accounts] publish update error:', publishError)
      return NextResponse.json({ error: 'Failed to publish bank account' }, { status: 500 })
    }

    const { data: published, error: publishedFetchError } = await serviceSupabase
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
      .eq('id', publishedId)
      .eq('vehicle_id', vehicleId)
      .single()

    if (publishedFetchError || !published) {
      console.error('[vehicle-bank-accounts] publish fetch error:', publishedFetchError)
      return NextResponse.json({ error: 'Failed to load published bank account' }, { status: 500 })
    }

    let warning: string | null = null
    try {
      await syncVehicleBankFieldsToLegacyFeeStructures(serviceSupabase, vehicleId)
    } catch (syncError) {
      console.error('[vehicle-bank-accounts] publish legacy sync error:', syncError)
      warning = 'Bank account was published, but the legacy term-sheet bank fields could not be synced.'
    }

    await serviceSupabase.from('audit_logs').insert({
      action: 'vehicle_bank_account_published',
      entity_type: 'vehicle_bank_account',
      entity_id: accountId,
      actor_id: user.id,
      details: {
        vehicle_id: vehicleId,
      },
    })

    return NextResponse.json({ bankAccount: published, warning })
  } catch (error) {
    console.error('[vehicle-bank-accounts] publish unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
