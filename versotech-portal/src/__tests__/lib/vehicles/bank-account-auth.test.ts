import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/api-auth', () => ({
  isStaffUser: vi.fn(),
}))

import { isStaffUser } from '@/lib/api-auth'
import {
  canManageVehicleBankAccounts,
  canReadVehicleBankAccounts,
} from '@/lib/vehicles/bank-account-auth'

function createSupabase({
  role = null,
  personas = [],
}: {
  role?: string | null
  personas?: Array<{ persona_type?: string | null; role_in_entity?: string | null }>
}) {
  return {
    from(table: string) {
      if (table !== 'profiles') {
        throw new Error(`Unexpected table: ${table}`)
      }

      return {
        select() {
          return this
        },
        eq() {
          return this
        },
        maybeSingle: vi.fn().mockResolvedValue({
          data: { role },
          error: null,
        }),
      }
    },
    rpc: vi.fn().mockResolvedValue({
      data: personas,
      error: null,
    }),
  }
}

describe('vehicle bank account auth', () => {
  it('allows read access for a ceo persona even when the profile role is empty', async () => {
    vi.mocked(isStaffUser).mockResolvedValue(false)
    const supabase = createSupabase({
      role: null,
      personas: [{ persona_type: 'ceo', role_in_entity: 'ceo' }],
    })

    const canRead = await canReadVehicleBankAccounts(supabase as any, { id: 'user-1' } as any)

    expect(canRead).toBe(true)
  })

  it('allows staff_rm to read but not manage vehicle bank accounts', async () => {
    vi.mocked(isStaffUser).mockResolvedValue(false)
    const supabase = createSupabase({
      role: 'staff_rm',
      personas: [],
    })

    const canRead = await canReadVehicleBankAccounts(supabase as any, { id: 'user-1' } as any)
    const canManage = await canManageVehicleBankAccounts(supabase as any, { id: 'user-1' } as any)

    expect(canRead).toBe(true)
    expect(canManage).toBe(false)
  })
})
