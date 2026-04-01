import { NextResponse } from 'next/server'

import { isStaffUser } from '@/lib/api-auth'
import { createClient, createServiceClient } from '@/lib/supabase/server'

type EscrowDealRecord = {
  id: string
  name: string | null
  company_name: string | null
  target_amount: number | null
  currency: string | null
  status: string | null
  vehicle_id: string | null
}

type EscrowFeeStructureRecord = {
  id: string
  deal_id: string
  status: string
  legal_counsel: string | null
  escrow_fee_text: string | null
  deal: EscrowDealRecord | EscrowDealRecord[] | null
}

type VehicleBankAccountRecord = {
  vehicle_id: string
  bank_name: string | null
  holder_name: string | null
  iban: string | null
  bic: string | null
  lawyer: {
    display_name: string | null
    firm_name: string | null
  } | Array<{
    display_name: string | null
    firm_name: string | null
  }> | null
}

function getSingleRecord<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export async function GET() {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: lawyerUser } = await serviceSupabase
    .from('lawyer_users')
    .select('lawyer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: arrangerUser } = await serviceSupabase
    .from('arranger_users')
    .select('arranger_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: partnerUser } = await serviceSupabase
    .from('partner_users')
    .select('partner_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (lawyerUser?.lawyer_id) {
    const [{ data: assignedVehicles }, { data: assignments }, { data: lawyer }] = await Promise.all([
      serviceSupabase
        .from('vehicles')
        .select('id')
        .eq('lawyer_id', lawyerUser.lawyer_id),
      serviceSupabase
        .from('deal_lawyer_assignments')
        .select('deal_id')
        .eq('lawyer_id', lawyerUser.lawyer_id),
      serviceSupabase
        .from('lawyers')
        .select('assigned_deals')
        .eq('id', lawyerUser.lawyer_id)
        .maybeSingle(),
    ])

    const vehicleIds = (assignedVehicles || []).map((vehicle) => vehicle.id).filter(Boolean)

    let vehicleDealIds: string[] = []
    if (vehicleIds.length > 0) {
      const { data: vehicleDeals } = await serviceSupabase
        .from('deals')
        .select('id')
        .in('vehicle_id', vehicleIds)

      vehicleDealIds = (vehicleDeals || []).map((deal) => deal.id).filter(Boolean)
    }

    let dealIds = Array.from(new Set([
      ...vehicleDealIds,
      ...(assignments || []).map((assignment) => assignment.deal_id).filter(Boolean),
    ]))

    if (dealIds.length === 0) {
      dealIds = Array.isArray(lawyer?.assigned_deals)
        ? lawyer.assigned_deals.filter((dealId): dealId is string => typeof dealId === 'string' && dealId.length > 0)
        : []
    }

    if (dealIds.length === 0) {
      return NextResponse.json({ feeStructures: [] })
    }

    return fetchEscrowAccountRows(serviceSupabase, { dealIds })
  }

  if (arrangerUser?.arranger_id) {
    const { data: deals } = await serviceSupabase
      .from('deals')
      .select('id')
      .eq('arranger_entity_id', arrangerUser.arranger_id)

    const dealIds = (deals || []).map((deal) => deal.id).filter(Boolean)
    if (dealIds.length === 0) {
      return NextResponse.json({ feeStructures: [] })
    }

    return fetchEscrowAccountRows(serviceSupabase, { dealIds })
  }

  if (partnerUser?.partner_id) {
    return NextResponse.json(
      { error: 'Access restricted. Partners cannot access escrow information.' },
      { status: 403 }
    )
  }

  const hasStaffAccess = await isStaffUser(serviceSupabase, user)
  if (!hasStaffAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return fetchEscrowAccountRows(serviceSupabase, {})
}

async function fetchEscrowAccountRows(
  serviceSupabase: ReturnType<typeof createServiceClient>,
  options: { dealIds?: string[] }
) {
  let feeStructuresQuery = serviceSupabase
    .from('deal_fee_structures')
    .select(`
      id,
      deal_id,
      status,
      legal_counsel,
      escrow_fee_text,
      deal:deal_id (
        id,
        name,
        company_name,
        target_amount,
        currency,
        status,
        vehicle_id
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (options.dealIds && options.dealIds.length > 0) {
    feeStructuresQuery = feeStructuresQuery.in('deal_id', options.dealIds)
  } else {
    feeStructuresQuery = feeStructuresQuery.limit(100)
  }

  const { data: rawFeeStructures, error: feeStructuresError } = await feeStructuresQuery

  if (feeStructuresError) {
    console.error('[escrow/accounts] Failed to load fee structures:', feeStructuresError)
    return NextResponse.json(
      { error: 'Failed to load escrow account data' },
      { status: 500 }
    )
  }

  const feeStructures = (rawFeeStructures || []) as EscrowFeeStructureRecord[]
  const vehicleIds = Array.from(new Set(
    feeStructures
      .map((feeStructure) => getSingleRecord(feeStructure.deal)?.vehicle_id)
      .filter((vehicleId): vehicleId is string => typeof vehicleId === 'string' && vehicleId.length > 0)
  ))

  const bankAccountByVehicleId = new Map<string, VehicleBankAccountRecord>()

  if (vehicleIds.length > 0) {
    const { data: rawBankAccounts, error: bankAccountsError } = await serviceSupabase
      .from('vehicle_bank_accounts')
      .select(`
        vehicle_id,
        bank_name,
        holder_name,
        iban,
        bic,
        lawyer:lawyers (
          display_name,
          firm_name
        )
      `)
      .eq('status', 'active')
      .in('vehicle_id', vehicleIds)
      .order('published_at', { ascending: false })

    if (bankAccountsError) {
      console.error('[escrow/accounts] Failed to load vehicle bank accounts:', bankAccountsError)
      return NextResponse.json(
        { error: 'Failed to load vehicle bank accounts' },
        { status: 500 }
      )
    }

    for (const account of (rawBankAccounts || []) as VehicleBankAccountRecord[]) {
      if (!bankAccountByVehicleId.has(account.vehicle_id)) {
        bankAccountByVehicleId.set(account.vehicle_id, account)
      }
    }
  }

  const mappedFeeStructures = feeStructures.map((feeStructure) => {
    const deal = getSingleRecord(feeStructure.deal)
    const bankAccount = deal?.vehicle_id ? bankAccountByVehicleId.get(deal.vehicle_id) : null
    const lawyer = getSingleRecord(bankAccount?.lawyer)
    const wireEscrowAgent = lawyer?.display_name || lawyer?.firm_name || bankAccount?.holder_name || null

    return {
      id: feeStructure.id,
      deal_id: feeStructure.deal_id,
      status: feeStructure.status,
      legal_counsel: feeStructure.legal_counsel,
      wire_escrow_agent: wireEscrowAgent,
      wire_bank_name: bankAccount?.bank_name || null,
      wire_account_holder: bankAccount?.holder_name || null,
      wire_iban: bankAccount?.iban || null,
      wire_bic: bankAccount?.bic || null,
      escrow_fee_text: feeStructure.escrow_fee_text,
      deal: deal
        ? {
            id: deal.id,
            name: deal.name,
            company_name: deal.company_name,
            target_amount: deal.target_amount,
            currency: deal.currency,
            status: deal.status,
          }
        : null,
    }
  })

  return NextResponse.json({ feeStructures: mappedFeeStructures })
}
