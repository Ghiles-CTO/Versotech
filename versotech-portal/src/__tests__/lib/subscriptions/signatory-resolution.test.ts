import { describe, expect, it } from 'vitest'
import { resolveSubscriptionSigners } from '@/lib/subscriptions/signatory-resolution'

type TableRow = Record<string, any>
type TableData = Record<string, TableRow[]>

function createSupabaseMock(initialData: TableData) {
  const tables: TableData = Object.fromEntries(
    Object.entries(initialData).map(([tableName, rows]) => [tableName, rows.map((row) => ({ ...row }))])
  )

  function createQuery(tableName: string) {
    const state: {
      filters: Array<{ column: string; value: unknown; type: 'eq' | 'in' }>
    } = {
      filters: [],
    }

    const execute = async () => {
      let rows = tables[tableName] || []

      for (const filter of state.filters) {
        if (filter.type === 'eq') {
          rows = rows.filter((row) => row[filter.column] === filter.value)
          continue
        }

        rows = rows.filter((row) => Array.isArray(filter.value) && filter.value.includes(row[filter.column]))
      }

      return { data: rows, error: null }
    }

    const query = {
      select: () => query,
      eq: (column: string, value: unknown) => {
        state.filters.push({ type: 'eq', column, value })
        return query
      },
      in: (column: string, value: unknown[]) => {
        state.filters.push({ type: 'in', column, value })
        return query
      },
      order: () => query,
      then: (onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) =>
        execute().then(onFulfilled, onRejected),
    }

    return query
  }

  return {
    from: (tableName: string) => createQuery(tableName),
  }
}

describe('resolveSubscriptionSigners', () => {
  it('uses the linked profile email when the designated member email is blank', async () => {
    const supabase = createSupabaseMock({
      investor_members: [
        {
          id: 'member-1',
          investor_id: 'inv-1',
          full_name: 'Ashish Damankar',
          email: null,
          role: 'authorized_signatory',
          role_title: 'Director',
          is_signatory: true,
          can_sign: true,
          linked_user_id: 'user-1',
          is_active: true,
        },
      ],
      profiles: [
        {
          id: 'user-1',
          email: 'adamankar@versoholdings.com',
        },
      ],
    })

    const result = await resolveSubscriptionSigners({
      supabase: supabase as any,
      investorId: 'inv-1',
      investorName: 'Ashish Damankar',
      investorEmail: 'investor-primary@example.com',
      selectedMemberIds: ['member-1'],
    })

    expect(result.issues).toEqual([])
    expect(result.signers).toHaveLength(1)
    expect(result.signers[0]).toMatchObject({
      id: 'member-1',
      email: 'adamankar@versoholdings.com',
      email_source: 'linked_profile',
    })
  })

  it('does not fall back to the investor primary email when a designated member signer has no resolvable email', async () => {
    const supabase = createSupabaseMock({
      investor_members: [
        {
          id: 'member-1',
          investor_id: 'inv-1',
          full_name: 'Ashish Damankar',
          email: null,
          role: 'authorized_signatory',
          role_title: 'Director',
          is_signatory: true,
          can_sign: true,
          linked_user_id: 'user-1',
          is_active: true,
        },
      ],
      profiles: [
        {
          id: 'user-1',
          email: null,
        },
      ],
    })

    const result = await resolveSubscriptionSigners({
      supabase: supabase as any,
      investorId: 'inv-1',
      investorName: 'Ashish Damankar',
      investorEmail: 'investor-primary@example.com',
      selectedMemberIds: ['member-1'],
    })

    expect(result.signers).toEqual([])
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]).toMatchObject({
      code: 'missing_signer_email',
      signer_id: 'member-1',
    })
  })

  it('falls back to the investor primary email only when there is no designated member signer path', async () => {
    const supabase = createSupabaseMock({
      investor_members: [],
      profiles: [],
    })

    const result = await resolveSubscriptionSigners({
      supabase: supabase as any,
      investorId: 'inv-1',
      investorName: 'Ashish Damankar',
      investorEmail: 'investor-primary@example.com',
      selectedMemberIds: [],
    })

    expect(result.issues).toEqual([])
    expect(result.signers).toHaveLength(1)
    expect(result.signers[0]).toMatchObject({
      id: 'investor_primary',
      email: 'investor-primary@example.com',
      email_source: 'investor_primary',
    })
  })
})
