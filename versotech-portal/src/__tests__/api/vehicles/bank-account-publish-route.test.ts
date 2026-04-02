import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/vehicles/bank-account-auth', () => ({
  canManageVehicleBankAccounts: vi.fn(),
}))

vi.mock('@/lib/vehicles/bank-accounts', () => ({
  getVehicleBankAccountMissingFields: vi.fn(),
  getVehicleBankAccountState: vi.fn(),
  syncVehicleBankFieldsToLegacyFeeStructures: vi.fn(),
}))

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { canManageVehicleBankAccounts } from '@/lib/vehicles/bank-account-auth'
import {
  getVehicleBankAccountMissingFields,
  getVehicleBankAccountState,
  syncVehicleBankFieldsToLegacyFeeStructures,
} from '@/lib/vehicles/bank-accounts'

function createMockServiceSupabase() {
  return {
    rpc: vi.fn().mockResolvedValue({ data: 'draft-1', error: null }),
    from(table: string) {
      if (table === 'vehicle_bank_accounts') {
        return {
          select() {
            return this
          },
          eq() {
            return this
          },
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'draft-1',
              vehicle_id: 'vehicle-1',
              status: 'active',
              bank_name: 'ING Luxembourg S.A.',
              holder_name: 'Dupont Partners',
            },
            error: null,
          }),
        }
      }

      if (table === 'audit_logs') {
        return {
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }

      throw new Error(`Unexpected table: ${table}`)
    },
  }
}

describe('vehicle bank account publish route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'staff-user-1' } },
          error: null,
        }),
      },
    } as any)
    vi.mocked(canManageVehicleBankAccounts).mockResolvedValue(true)
    vi.mocked(getVehicleBankAccountState).mockResolvedValue({
      accounts: [{ id: 'draft-1', status: 'draft' }],
      activeAccounts: [{ id: 'active-1', status: 'active' }],
      draftAccounts: [{ id: 'draft-1', status: 'draft' }],
      activeAccount: { id: 'active-1', status: 'active' },
      draftAccount: { id: 'draft-1', status: 'draft' },
    } as any)
    vi.mocked(getVehicleBankAccountMissingFields).mockReturnValue([])
    vi.mocked(syncVehicleBankFieldsToLegacyFeeStructures).mockResolvedValue(undefined)
  })

  it('publishes through the transactional rpc path', async () => {
    const serviceSupabase = createMockServiceSupabase()
    vi.mocked(createServiceClient).mockReturnValue(serviceSupabase as any)

    const { POST } = await import('@/app/api/vehicles/[id]/bank-accounts/[accountId]/publish/route')

    const response = await POST(
      new Request('http://localhost/api/vehicles/vehicle-1/bank-accounts/draft-1/publish', { method: 'POST' }) as any,
      { params: Promise.resolve({ id: 'vehicle-1', accountId: 'draft-1' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(serviceSupabase.rpc).toHaveBeenCalledWith('publish_vehicle_bank_account', {
      p_vehicle_id: 'vehicle-1',
      p_account_id: 'draft-1',
      p_actor_id: 'staff-user-1',
    })
    expect(syncVehicleBankFieldsToLegacyFeeStructures).toHaveBeenCalledWith(serviceSupabase, 'vehicle-1')
    expect(data.bankAccount.id).toBe('draft-1')
  })

  it('blocks publishing incomplete drafts', async () => {
    const serviceSupabase = createMockServiceSupabase()
    vi.mocked(createServiceClient).mockReturnValue(serviceSupabase as any)
    vi.mocked(getVehicleBankAccountMissingFields).mockReturnValue(['iban', 'bic'] as any)

    const { POST } = await import('@/app/api/vehicles/[id]/bank-accounts/[accountId]/publish/route')

    const response = await POST(
      new Request('http://localhost/api/vehicles/vehicle-1/bank-accounts/draft-1/publish', { method: 'POST' }) as any,
      { params: Promise.resolve({ id: 'vehicle-1', accountId: 'draft-1' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.reasonCode).toBe('vehicle_bank_account_incomplete')
    expect(serviceSupabase.rpc).not.toHaveBeenCalled()
  })

  it('blocks publishing non-draft accounts', async () => {
    const serviceSupabase = createMockServiceSupabase()
    vi.mocked(createServiceClient).mockReturnValue(serviceSupabase as any)
    vi.mocked(getVehicleBankAccountState).mockResolvedValue({
      accounts: [{ id: 'active-1', status: 'active' }],
      activeAccounts: [{ id: 'active-1', status: 'active' }],
      draftAccounts: [],
      activeAccount: { id: 'active-1', status: 'active' },
      draftAccount: null,
    } as any)

    const { POST } = await import('@/app/api/vehicles/[id]/bank-accounts/[accountId]/publish/route')

    const response = await POST(
      new Request('http://localhost/api/vehicles/vehicle-1/bank-accounts/active-1/publish', { method: 'POST' }) as any,
      { params: Promise.resolve({ id: 'vehicle-1', accountId: 'active-1' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.reasonCode).toBe('vehicle_bank_account_publish_requires_draft')
    expect(serviceSupabase.rpc).not.toHaveBeenCalled()
  })

  it('returns success with a warning when legacy sync fails after publish', async () => {
    const serviceSupabase = createMockServiceSupabase()
    vi.mocked(createServiceClient).mockReturnValue(serviceSupabase as any)
    vi.mocked(syncVehicleBankFieldsToLegacyFeeStructures).mockRejectedValue(new Error('sync failed'))

    const { POST } = await import('@/app/api/vehicles/[id]/bank-accounts/[accountId]/publish/route')

    const response = await POST(
      new Request('http://localhost/api/vehicles/vehicle-1/bank-accounts/draft-1/publish', { method: 'POST' }) as any,
      { params: Promise.resolve({ id: 'vehicle-1', accountId: 'draft-1' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.warning).toContain('legacy term-sheet bank fields could not be synced')
    expect(data.bankAccount.id).toBe('draft-1')
  })
})
