import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/supabase'

type DbClient = SupabaseClient<Database>

type VehicleBankAccountRow = Database['public']['Tables']['vehicle_bank_accounts']['Row']

export type VehicleBankAccountRecord = VehicleBankAccountRow & {
  lawyer: {
    id: string
    firm_name: string | null
    display_name: string | null
    primary_contact_email: string | null
    street_address: string | null
    city: string | null
    state_province: string | null
    postal_code: string | null
    country: string | null
  } | null
}

export type VehicleBankAccountMutationInput = {
  lawyer_id?: string | null
  bank_name?: string | null
  bank_address?: string | null
  holder_name?: string | null
  law_firm_address?: string | null
  description?: string | null
  iban?: string | null
  bic?: string | null
  currency?: string | null
}

export type VehicleBankLawyerOption = {
  id: string
  name: string
  firm_name: string | null
  email: string | null
  street_address: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string | null
}

const VEHICLE_BANK_ACCOUNT_SELECT = `
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
`

function cleanString(value: string | null | undefined) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function formatCurrencyName(currency: string) {
  const normalized = cleanString(currency)?.toUpperCase()
  if (!normalized) return ''

  if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' })
    return cleanString(displayNames.of(normalized)) || normalized
  }

  return normalized
}

export function formatLawyerAddress(lawyer: {
  street_address?: string | null
  city?: string | null
  state_province?: string | null
  postal_code?: string | null
  country?: string | null
} | null | undefined) {
  if (!lawyer) return null

  const parts = [
    cleanString(lawyer.street_address),
    cleanString(lawyer.city),
    cleanString(lawyer.state_province),
    cleanString(lawyer.postal_code),
    cleanString(lawyer.country),
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(', ') : null
}

export function getDefaultVehicleBankAccountDescription(vehicleName: string | null | undefined) {
  const cleanName = cleanString(vehicleName)
  return `Client Account on behalf of ${cleanName || 'the vehicle'}`
}

export function normalizeVehicleBankAccountInput(
  input: VehicleBankAccountMutationInput,
  options?: {
    lawyer?: VehicleBankLawyerOption | null
    fallbackDescription?: string | null
  }
) {
  const lawyer = options?.lawyer ?? null
  const normalized = {
    lawyer_id: input.lawyer_id ?? lawyer?.id ?? null,
    bank_name: cleanString(input.bank_name),
    bank_address: cleanString(input.bank_address),
    holder_name: cleanString(input.holder_name) ?? cleanString(lawyer?.name),
    law_firm_address: cleanString(input.law_firm_address) ?? formatLawyerAddress(lawyer),
    description: cleanString(input.description) ?? cleanString(options?.fallbackDescription),
    iban: cleanString(input.iban),
    bic: cleanString(input.bic),
    currency: cleanString(input.currency),
  }

  return normalized
}

export function getVehicleBankAccountMissingFields(account: Partial<VehicleBankAccountRow>) {
  const requiredFields: Array<keyof VehicleBankAccountRow> = [
    'bank_name',
    'bank_address',
    'holder_name',
    'law_firm_address',
    'description',
    'iban',
    'bic',
    'currency',
  ]

  return requiredFields.filter((field) => !cleanString(String(account[field] ?? '')))
}

export function isVehicleBankAccountComplete(account: Partial<VehicleBankAccountRow>) {
  return getVehicleBankAccountMissingFields(account).length === 0
}

export async function fetchVehicleBankLawyers(serviceSupabase: DbClient) {
  const { data, error } = await serviceSupabase
    .from('lawyers')
    .select('id, firm_name, display_name, primary_contact_email, street_address, city, state_province, postal_code, country, is_active')
    .or('is_active.eq.true,is_active.is.null')
    .order('firm_name', { ascending: true })

  if (error) {
    throw error
  }

  return (data || []).map((lawyer) => ({
    id: lawyer.id,
    name: lawyer.display_name || lawyer.firm_name || 'Unknown lawyer',
    firm_name: lawyer.firm_name,
    email: lawyer.primary_contact_email,
    street_address: lawyer.street_address,
    city: lawyer.city,
    state_province: lawyer.state_province,
    postal_code: lawyer.postal_code,
    country: lawyer.country,
  })) satisfies VehicleBankLawyerOption[]
}

export async function fetchVehicleBankAccounts(serviceSupabase: DbClient, vehicleId: string) {
  const { data, error } = await serviceSupabase
    .from('vehicle_bank_accounts')
    .select(VEHICLE_BANK_ACCOUNT_SELECT)
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []) as VehicleBankAccountRecord[]
}

export async function getVehicleBankAccountState(serviceSupabase: DbClient, vehicleId: string) {
  const accounts = await fetchVehicleBankAccounts(serviceSupabase, vehicleId)
  const activeAccounts = accounts.filter((account) => account.status === 'active')
  const draftAccounts = accounts.filter((account) => account.status === 'draft')

  return {
    accounts,
    activeAccounts,
    draftAccounts,
    activeAccount: activeAccounts[0] ?? null,
    draftAccount: draftAccounts[0] ?? null,
  }
}

export async function resolveVehicleActiveBankAccount(serviceSupabase: DbClient, vehicleId: string) {
  const state = await getVehicleBankAccountState(serviceSupabase, vehicleId)

  return {
    ...state,
    hasExactlyOneActiveAccount: state.activeAccounts.length === 1,
    hasNoActiveAccount: state.activeAccounts.length === 0,
    hasMultipleActiveAccounts: state.activeAccounts.length > 1,
  }
}

export function toVehicleBankAccountPayload(account: VehicleBankAccountRecord, vehicle: {
  name?: string | null
  currency?: string | null
}) {
  const wireCurrencyCode = cleanString(account.currency) || cleanString(vehicle.currency) || 'USD'
  const lawyerName = cleanString(account.lawyer?.display_name) || cleanString(account.lawyer?.firm_name)

  return {
    wire_bank_name: cleanString(account.bank_name) || '',
    wire_bank_address: cleanString(account.bank_address) || '',
    wire_account_holder: cleanString(account.holder_name) || '',
    wire_law_firm_address: cleanString(account.law_firm_address) || '',
    wire_description: cleanString(account.description) || getDefaultVehicleBankAccountDescription(vehicle.name),
    wire_iban: cleanString(account.iban) || '',
    wire_bic: cleanString(account.bic) || '',
    wire_reference_display: `Agency ${cleanString(vehicle.name) || 'Vehicle'}`,
    wire_currency_code: wireCurrencyCode,
    wire_currency_long: formatCurrencyName(wireCurrencyCode),
    wire_escrow_agent: lawyerName || cleanString(account.holder_name) || '',
  }
}

export async function syncVehicleBankFieldsToLegacyFeeStructures(
  serviceSupabase: DbClient,
  vehicleId: string
) {
  const [{ data: deals, error: dealsError }, state] = await Promise.all([
    serviceSupabase
      .from('deals')
      .select('id')
      .eq('vehicle_id', vehicleId),
    getVehicleBankAccountState(serviceSupabase, vehicleId),
  ])

  if (dealsError) {
    throw dealsError
  }

  const dealIds = (deals || []).map((deal) => deal.id).filter(Boolean)
  if (dealIds.length === 0) {
    return
  }

  const activeAccount = state.activeAccount
  const payload = activeAccount
    ? {
        wire_bank_name: cleanString(activeAccount.bank_name),
        wire_bank_address: cleanString(activeAccount.bank_address),
        wire_account_holder: cleanString(activeAccount.holder_name),
        wire_escrow_agent: cleanString(activeAccount.lawyer?.display_name)
          || cleanString(activeAccount.lawyer?.firm_name)
          || cleanString(activeAccount.holder_name),
        wire_law_firm_address: cleanString(activeAccount.law_firm_address),
        wire_iban: cleanString(activeAccount.iban),
        wire_bic: cleanString(activeAccount.bic),
      }
    : {
        wire_bank_name: null,
        wire_bank_address: null,
        wire_account_holder: null,
        wire_escrow_agent: null,
        wire_law_firm_address: null,
        wire_iban: null,
        wire_bic: null,
      }

  const { error: updateError } = await serviceSupabase
    .from('deal_fee_structures')
    .update(payload)
    .in('deal_id', dealIds)

  if (updateError) {
    throw updateError
  }
}
