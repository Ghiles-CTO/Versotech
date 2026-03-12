import { describe, expect, it, vi } from 'vitest'

import { syncLinkedIndividualInvestorMemberKycStatus } from '@/lib/kyc/check-entity-kyc-status'

function createMockSupabase(options?: {
  selectResult?: { data: Array<{ id: string; kyc_status?: string | null }>; error: null | unknown }
  updateResult?: { error: null | unknown }
}) {
  const selectResult = options?.selectResult ?? {
    data: [{ id: 'member-1', kyc_status: 'pending' }],
    error: null,
  }
  const updateResult = options?.updateResult ?? { error: null }

  const limit = vi.fn().mockResolvedValue(selectResult)
  const not = vi.fn().mockReturnValue({ limit })
  const secondEq = vi.fn().mockReturnValue({ not })
  const firstEq = vi.fn().mockReturnValue({ eq: secondEq })
  const select = vi.fn().mockReturnValue({ eq: firstEq })

  const updateEq = vi.fn().mockResolvedValue(updateResult)
  const update = vi.fn().mockReturnValue({ eq: updateEq })

  const from = vi
    .fn()
    .mockReturnValueOnce({ select })
    .mockReturnValueOnce({ update })

  return {
    supabase: { from } as any,
    update,
    updateEq,
  }
}

describe('syncLinkedIndividualInvestorMemberKycStatus', () => {
  it('syncs a single linked member to approved', async () => {
    const { supabase, update, updateEq } = createMockSupabase({
      selectResult: {
        data: [{ id: 'member-1', kyc_status: 'pending' }],
        error: null,
      },
    })

    const synced = await syncLinkedIndividualInvestorMemberKycStatus(supabase, 'investor-1', 'approved')

    expect(synced).toBe(true)
    expect(update).toHaveBeenCalledTimes(1)
    expect(updateEq).toHaveBeenCalledWith('id', 'member-1')

    const payload = update.mock.calls[0][0]
    expect(payload).toMatchObject({
      kyc_status: 'approved',
    })
    expect(payload.kyc_approved_at).toEqual(expect.any(String))
  })

  it('clears approval metadata when syncing back to pending', async () => {
    const { supabase, update } = createMockSupabase({
      selectResult: {
        data: [{ id: 'member-1', kyc_status: 'approved' }],
        error: null,
      },
    })

    const synced = await syncLinkedIndividualInvestorMemberKycStatus(supabase, 'investor-1', 'pending')

    expect(synced).toBe(true)
    expect(update).toHaveBeenCalledTimes(1)

    const payload = update.mock.calls[0][0]
    expect(payload).toMatchObject({
      kyc_status: 'pending',
      kyc_approved_at: null,
    })
  })

  it('skips syncing when more than one linked member exists', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { supabase, update } = createMockSupabase({
      selectResult: {
        data: [
          { id: 'member-1', kyc_status: 'pending' },
          { id: 'member-2', kyc_status: 'pending' },
        ],
        error: null,
      },
    })

    const synced = await syncLinkedIndividualInvestorMemberKycStatus(supabase, 'investor-1', 'approved')

    expect(synced).toBe(false)
    expect(update).not.toHaveBeenCalled()

    warnSpy.mockRestore()
  })
})
