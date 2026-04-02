import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/vehicles/bank-account-auth', () => ({
  canManageVehicleBankAccounts: vi.fn(),
}))

vi.mock('@/lib/vehicles/bank-accounts', () => ({
  fetchVehicleBankLawyers: vi.fn(),
  getDefaultVehicleBankAccountDescription: vi.fn(() => 'Client Account on behalf of Test Vehicle'),
  normalizeVehicleBankAccountInput: vi.fn((input) => input),
  syncVehicleBankFieldsToLegacyFeeStructures: vi.fn(),
}))

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { canManageVehicleBankAccounts } from '@/lib/vehicles/bank-account-auth'
import {
  fetchVehicleBankLawyers,
  normalizeVehicleBankAccountInput,
  syncVehicleBankFieldsToLegacyFeeStructures,
} from '@/lib/vehicles/bank-accounts'

function createPatchServiceSupabase() {
  return {
    from(table: string) {
      if (table === 'vehicle_bank_accounts') {
        return {
          select() {
            return this
          },
          eq() {
            return this
          },
          single: vi.fn().mockResolvedValueOnce({
            data: {
              id: 'active-1',
              vehicle_id: 'vehicle-1',
              status: 'active',
              lawyer_id: null,
              bank_name: 'Old Bank',
              bank_address: 'Old Address',
              holder_name: 'Old Holder',
              law_firm_address: 'Old Law Firm',
              description: 'Old Description',
              iban: 'OLDIBAN',
              bic: 'OLDBIC',
              currency: 'USD',
            },
            error: null,
          }),
          update() {
            return {
              eq() {
                return this
              },
              select() {
                return this
              },
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'active-1',
                  vehicle_id: 'vehicle-1',
                  status: 'active',
                  bank_name: 'Updated Bank',
                  holder_name: 'Updated Holder',
                },
                error: null,
              }),
            }
          },
        }
      }

      if (table === 'vehicles') {
        return {
          select() {
            return this
          },
          eq() {
            return this
          },
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'vehicle-1',
              name: 'Test Vehicle',
              lawyer_id: null,
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

function createDeleteServiceSupabase() {
  return {
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
              id: 'active-1',
              vehicle_id: 'vehicle-1',
              status: 'active',
            },
            error: null,
          }),
          delete() {
            return {
              eq() {
                return this
              },
              then(resolve: (value: { error: null }) => unknown) {
                return Promise.resolve({ error: null }).then(resolve)
              },
            }
          },
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

describe('vehicle bank account update/delete routes', () => {
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
    vi.mocked(fetchVehicleBankLawyers).mockResolvedValue([])
    vi.mocked(normalizeVehicleBankAccountInput).mockImplementation((input) => input as any)
  })

  it('returns success with a warning when legacy sync fails after updating an active account', async () => {
    const serviceSupabase = createPatchServiceSupabase()
    vi.mocked(createServiceClient).mockReturnValue(serviceSupabase as any)
    vi.mocked(syncVehicleBankFieldsToLegacyFeeStructures).mockRejectedValue(new Error('sync failed'))

    const { PATCH } = await import('@/app/api/vehicles/[id]/bank-accounts/[accountId]/route')

    const response = await PATCH(
      new Request('http://localhost/api/vehicles/vehicle-1/bank-accounts/active-1', {
        method: 'PATCH',
        body: JSON.stringify({ bank_name: 'Updated Bank' }),
        headers: { 'Content-Type': 'application/json' },
      }) as any,
      { params: Promise.resolve({ id: 'vehicle-1', accountId: 'active-1' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.warning).toContain('legacy term-sheet bank fields could not be synced')
    expect(data.bankAccount.id).toBe('active-1')
  })

  it('returns success with a warning when legacy sync fails after deleting an active account', async () => {
    const serviceSupabase = createDeleteServiceSupabase()
    vi.mocked(createServiceClient).mockReturnValue(serviceSupabase as any)
    vi.mocked(syncVehicleBankFieldsToLegacyFeeStructures).mockRejectedValue(new Error('sync failed'))

    const { DELETE } = await import('@/app/api/vehicles/[id]/bank-accounts/[accountId]/route')

    const response = await DELETE(
      new Request('http://localhost/api/vehicles/vehicle-1/bank-accounts/active-1', {
        method: 'DELETE',
      }) as any,
      { params: Promise.resolve({ id: 'vehicle-1', accountId: 'active-1' }) }
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.warning).toContain('legacy term-sheet bank fields could not be synced')
    expect(data.success).toBe(true)
  })
})
