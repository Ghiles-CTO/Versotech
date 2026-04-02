import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'

type ProfileRow = {
  id: string
  display_name: string | null
  email: string | null
  title: string | null
  phone: string | null
  office_location: string | null
  bio: string | null
  avatar_url?: string | null
  role?: string | null
}

function createProfileSupabase(options?: {
  authenticatedUserId?: string | null
  profiles?: ProfileRow[]
}) {
  const profiles = (options?.profiles || []).map((profile) => ({ ...profile }))

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: options?.authenticatedUserId
            ? { id: options.authenticatedUserId }
            : null,
        },
        error: null,
      }),
    },
    from(tableName: string) {
      if (tableName !== 'profiles') {
        throw new Error(`Unexpected table: ${tableName}`)
      }

      const state: {
        targetId: string | null
        updateData: Record<string, unknown> | null
      } = {
        targetId: null,
        updateData: null,
      }

      const query = {
        update(data: Record<string, unknown>) {
          state.updateData = data
          return query
        },
        select() {
          return query
        },
        eq(column: string, value: string) {
          if (column === 'id') {
            state.targetId = value
          }
          return query
        },
        async single() {
          const profile = profiles.find((row) => row.id === state.targetId)

          if (!profile) {
            return { data: null, error: { message: 'Profile not found' } }
          }

          if (state.updateData) {
            Object.assign(profile, state.updateData)
          }

          return { data: { ...profile }, error: null }
        },
      }

      return query
    },
    _profiles: profiles,
  }
}

function createPutRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/profiles/user-1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('PUT /api/profiles/[userId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lets a user update their own title', async () => {
    const supabase = createProfileSupabase({
      authenticatedUserId: 'user-1',
      profiles: [
        {
          id: 'user-1',
          display_name: 'Fred Demargne',
          email: 'fred@verso.test',
          title: 'Staff Administrator',
          phone: null,
          office_location: null,
          bio: null,
          role: 'arranger',
        },
      ],
    })

    vi.mocked(createClient).mockResolvedValue(supabase as any)

    const { PUT } = await import('@/app/api/profiles/[userId]/route')
    const response = await PUT(createPutRequest({ title: 'Managing Partner' }) as any, {
      params: Promise.resolve({ userId: 'user-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.profile.title).toBe('Managing Partner')
    expect(supabase._profiles[0].title).toBe('Managing Partner')
  })

  it('blocks updating another user profile', async () => {
    const supabase = createProfileSupabase({
      authenticatedUserId: 'user-1',
      profiles: [
        {
          id: 'user-2',
          display_name: 'Julien Machot',
          email: 'julien@verso.test',
          title: 'CEO',
          phone: null,
          office_location: null,
          bio: null,
          role: 'ceo',
        },
      ],
    })

    vi.mocked(createClient).mockResolvedValue(supabase as any)

    const { PUT } = await import('@/app/api/profiles/[userId]/route')
    const response = await PUT(createPutRequest({ title: 'Managing Partner' }) as any, {
      params: Promise.resolve({ userId: 'user-2' }),
    })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toMatch(/only update your own profile/i)
    expect(supabase._profiles[0].title).toBe('CEO')
  })

  it('rejects payloads that do not include any allowed profile fields', async () => {
    const supabase = createProfileSupabase({
      authenticatedUserId: 'user-1',
      profiles: [
        {
          id: 'user-1',
          display_name: 'Fred Demargne',
          email: 'fred@verso.test',
          title: 'Staff Administrator',
          phone: null,
          office_location: null,
          bio: null,
          role: 'arranger',
        },
      ],
    })

    vi.mocked(createClient).mockResolvedValue(supabase as any)

    const { PUT } = await import('@/app/api/profiles/[userId]/route')
    const response = await PUT(createPutRequest({ role: 'ceo' }) as any, {
      params: Promise.resolve({ userId: 'user-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toMatch(/no valid fields/i)
    expect(supabase._profiles[0].role).toBe('arranger')
  })

  it('filters out disallowed fields and only persists the allowed profile data', async () => {
    const supabase = createProfileSupabase({
      authenticatedUserId: 'user-1',
      profiles: [
        {
          id: 'user-1',
          display_name: 'Fred Demargne',
          email: 'fred@verso.test',
          title: 'Staff Administrator',
          phone: null,
          office_location: null,
          bio: null,
          role: 'arranger',
        },
      ],
    })

    vi.mocked(createClient).mockResolvedValue(supabase as any)

    const { PUT } = await import('@/app/api/profiles/[userId]/route')
    const response = await PUT(createPutRequest({
      title: 'Managing Partner',
      role: 'ceo',
      email: 'hijack@verso.test',
    }) as any, {
      params: Promise.resolve({ userId: 'user-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.profile.title).toBe('Managing Partner')
    expect(data.profile.role).toBe('arranger')
    expect(data.profile.email).toBe('fred@verso.test')
  })
})
