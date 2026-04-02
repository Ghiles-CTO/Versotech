import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getArrangerSigner } from '@/lib/staff/arranger-signer'

type TableRow = Record<string, any>
type TableData = Record<string, TableRow[]>

function createSupabaseMock(initialData: TableData) {
  const tables: TableData = Object.fromEntries(
    Object.entries(initialData).map(([tableName, rows]) => [
      tableName,
      rows.map((row) => ({ ...row })),
    ])
  )

  function createQuery(tableName: string) {
    const state: {
      filters: Array<{ column: string; value: unknown }>
      limit: number | null
    } = {
      filters: [],
      limit: null,
    }

    const execute = async (returnSingle: boolean) => {
      let rows = tables[tableName] || []

      for (const filter of state.filters) {
        rows = rows.filter((row) => row[filter.column] === filter.value)
      }

      if (state.limit !== null) {
        rows = rows.slice(0, state.limit)
      }

      return {
        data: returnSingle ? rows[0] ?? null : rows,
        error: null,
      }
    }

    const query = {
      select: () => query,
      eq: (column: string, value: unknown) => {
        state.filters.push({ column, value })
        return query
      },
      limit: (value: number) => {
        state.limit = value
        return query
      },
      maybeSingle: () => execute(true),
      single: () => execute(true),
      then: (onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) =>
        execute(false).then(onFulfilled, onRejected),
    }

    return query
  }

  return {
    from: (tableName: string) => createQuery(tableName),
  }
}

describe('getArrangerSigner', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the primary arranger signer with the editable profile title', async () => {
    const supabase = createSupabaseMock({
      arranger_users: [
        {
          arranger_id: 'arranger-1',
          user_id: 'user-primary',
          can_sign: true,
          is_primary: true,
        },
        {
          arranger_id: 'arranger-1',
          user_id: 'user-fallback',
          can_sign: true,
          is_primary: false,
        },
      ],
      profiles: [
        {
          id: 'user-primary',
          email: 'primary@verso.test',
          display_name: 'Fred Demargne',
          title: 'Managing Partner',
        },
        {
          id: 'user-fallback',
          email: 'fallback@verso.test',
          display_name: 'Fallback Signer',
          title: 'Administrator',
        },
      ],
    })

    const signer = await getArrangerSigner(supabase as any, 'arranger-1')

    expect(signer).toEqual({
      id: 'user-primary',
      email: 'primary@verso.test',
      displayName: 'Fred Demargne',
      title: 'Managing Partner',
      canSign: true,
      isPrimary: true,
    })
  })

  it('falls back to another authorized signer when no primary signer exists', async () => {
    const supabase = createSupabaseMock({
      arranger_users: [
        {
          arranger_id: 'arranger-1',
          user_id: 'user-fallback',
          can_sign: true,
          is_primary: false,
        },
      ],
      profiles: [
        {
          id: 'user-fallback',
          email: 'fallback@verso.test',
          display_name: null,
          title: null,
        },
      ],
    })

    const signer = await getArrangerSigner(supabase as any, 'arranger-1')

    expect(signer).toEqual({
      id: 'user-fallback',
      email: 'fallback@verso.test',
      displayName: 'fallback',
      title: null,
      canSign: true,
      isPrimary: false,
    })
  })

  it('returns null when the arranger has no authorized signer', async () => {
    const supabase = createSupabaseMock({
      arranger_users: [
        {
          arranger_id: 'arranger-1',
          user_id: 'user-viewer',
          can_sign: false,
          is_primary: false,
        },
      ],
      profiles: [],
    })

    await expect(getArrangerSigner(supabase as any, 'arranger-1')).resolves.toBeNull()
  })

  it('returns null when the signer profile cannot be loaded', async () => {
    const supabase = createSupabaseMock({
      arranger_users: [
        {
          arranger_id: 'arranger-1',
          user_id: 'user-primary',
          can_sign: true,
          is_primary: true,
        },
      ],
      profiles: [],
    })

    await expect(getArrangerSigner(supabase as any, 'arranger-1')).resolves.toBeNull()
  })
})
