import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

import {
  createHomeTestSupabase,
  makeHomeInterest,
  makeHomeItem,
} from '@/__tests__/helpers/home-test-db'

vi.mock('@/lib/home/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/home/api')>('@/lib/home/api')
  return {
    ...actual,
    requireStaffActor: vi.fn(),
    requireInvestorActor: vi.fn(),
  }
})

vi.mock('@/lib/audit', () => ({
  auditLogger: {
    log: vi.fn(),
  },
  AuditActions: {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
  },
}))

vi.mock('@/lib/home/notifications', () => ({
  notifyHomeInterestRecipients: vi.fn(),
}))

vi.mock('@/lib/home/metadata', () => ({
  fetchHomeLinkMetadata: vi.fn(),
}))

import { requireInvestorActor, requireStaffActor } from '@/lib/home/api'
import { auditLogger } from '@/lib/audit'
import { notifyHomeInterestRecipients } from '@/lib/home/notifications'
import { fetchHomeLinkMetadata } from '@/lib/home/metadata'

const staffUser = { id: 'staff-user-1' }
const investorUser = { id: 'investor-user-1' }

function createRequest(path: string, method: string, body?: unknown, search?: Record<string, string>) {
  const url = new URL(`http://localhost:3000${path}`)

  if (search) {
    Object.entries(search).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  return new NextRequest(url, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
}

describe('Home backend routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the published home feed partitioned into hero, featured, feed, and news', async () => {
    const supabase = createHomeTestSupabase({
      home_items: [
        makeHomeItem({
          id: 'hero-1',
          kind: 'hero',
          status: 'published',
          title: 'Welcome to Verso',
          summary: 'Hero copy',
          cta_action: 'go_to_dashboard',
          cta_label: 'Go to Dashboard',
          is_pinned: true,
        }),
        makeHomeItem({
          id: 'featured-1',
          kind: 'report',
          status: 'published',
          title: 'Private markets report',
          summary: 'Featured report',
          featured_slot: 1,
        }),
        makeHomeItem({
          id: 'feed-1',
          kind: 'event',
          status: 'published',
          title: 'Founder dinner',
          summary: 'Event card',
        }),
        makeHomeItem({
          id: 'news-1',
          kind: 'news_article',
          status: 'published',
          title: 'Market news',
          summary: 'News summary',
          source_url: 'https://example.com/news',
          source_domain: 'example.com',
          source_name: 'Example',
          link_url: 'https://example.com/news',
          cta_action: 'open_link',
          cta_label: 'Read article',
        }),
      ],
    })

    vi.mocked(requireInvestorActor).mockResolvedValue({
      authSupabase: {} as any,
      serviceSupabase: supabase as any,
      user: investorUser as any,
      investorId: 'investor-1',
    })

    const { GET } = await import('@/app/api/home/route')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.hero?.title).toBe('Welcome to Verso')
    expect(data.featuredItems).toHaveLength(1)
    expect(data.featuredItems[0].title).toBe('Private markets report')
    expect(data.feedItems).toHaveLength(1)
    expect(data.feedItems[0].title).toBe('Founder dinner')
    expect(data.marketNews).toHaveLength(1)
    expect(data.marketNews[0].title).toBe('Market news')
  })

  it('runs the admin to investor interest flow end to end', async () => {
    const supabase = createHomeTestSupabase({
      investors: [{ id: 'investor-1', legal_name: 'Atlas Family Office' }],
      profiles: [
        { id: staffUser.id, email: 'staff@verso.test', display_name: 'Staff User' },
        { id: investorUser.id, email: 'investor@verso.test', display_name: 'Investor User' },
      ],
    })

    vi.mocked(requireStaffActor).mockResolvedValue({
      authSupabase: {} as any,
      serviceSupabase: supabase as any,
      user: staffUser as any,
    })

    vi.mocked(requireInvestorActor).mockResolvedValue({
      authSupabase: {} as any,
      serviceSupabase: supabase as any,
      user: investorUser as any,
      investorId: 'investor-1',
    })

    const { POST: createItem } = await import('@/app/api/admin/home/items/route')
    const createResponse = await createItem(
      createRequest('/api/admin/home/items', 'POST', {
        kind: 'opportunity_teaser',
        title: 'Series B teaser',
        summary: 'A private opportunity teaser',
      })
    )
    const createdPayload = await createResponse.json()
    const itemId = createdPayload.item.id

    expect(createResponse.status).toBe(201)
    expect(createdPayload.item.status).toBe('draft')
    expect(createdPayload.item.cta_action).toBe('interest_capture')
    expect(createdPayload.item.cta_label).toBe("I'm interested")

    const { POST: publishItem } = await import('@/app/api/admin/home/items/[id]/publish/route')
    const publishResponse = await publishItem(createRequest(`/api/admin/home/items/${itemId}/publish`, 'POST'), {
      params: Promise.resolve({ id: itemId }),
    })
    const publishedPayload = await publishResponse.json()

    expect(publishResponse.status).toBe(200)
    expect(publishedPayload.item.status).toBe('published')

    const { GET: getHome } = await import('@/app/api/home/route')
    const homeResponse = await getHome()
    const homePayload = await homeResponse.json()

    expect(homeResponse.status).toBe(200)
    expect(homePayload.feedItems).toHaveLength(1)
    expect(homePayload.feedItems[0].id).toBe(itemId)

    const { POST: submitInterest } = await import('@/app/api/home/items/[id]/interest/route')
    const firstInterestResponse = await submitInterest(
      createRequest(`/api/home/items/${itemId}/interest`, 'POST', { note: 'Keep me informed' }),
      { params: Promise.resolve({ id: itemId }) }
    )
    const firstInterestPayload = await firstInterestResponse.json()

    expect(firstInterestResponse.status).toBe(200)
    expect(firstInterestPayload.created).toBe(true)
    expect(supabase.state.home_interest_submissions).toHaveLength(1)
    expect(vi.mocked(notifyHomeInterestRecipients)).toHaveBeenCalledTimes(1)

    const secondInterestResponse = await submitInterest(
      createRequest(`/api/home/items/${itemId}/interest`, 'POST', { note: 'Keep me informed' }),
      { params: Promise.resolve({ id: itemId }) }
    )
    const secondInterestPayload = await secondInterestResponse.json()

    expect(secondInterestResponse.status).toBe(200)
    expect(secondInterestPayload.created).toBe(false)
    expect(supabase.state.home_interest_submissions).toHaveLength(1)

    const { GET: listInterests } = await import('@/app/api/admin/home/interests/route')
    const listResponse = await listInterests(
      createRequest('/api/admin/home/interests', 'GET', undefined, { home_item_id: itemId })
    )
    const listPayload = await listResponse.json()

    expect(listResponse.status).toBe(200)
    expect(listPayload.interests).toHaveLength(1)
    expect(listPayload.interests[0].home_item.title).toBe('Series B teaser')
    expect(listPayload.interests[0].investor.legal_name).toBe('Atlas Family Office')

    const interestId = listPayload.interests[0].id
    const { PATCH: updateInterest } = await import('@/app/api/admin/home/interests/[id]/route')
    const updateResponse = await updateInterest(
      createRequest(`/api/admin/home/interests/${interestId}`, 'PATCH', {
        status: 'contacted',
        admin_note: 'Reached out manually',
      }),
      { params: Promise.resolve({ id: interestId }) }
    )
    const updatePayload = await updateResponse.json()

    expect(updateResponse.status).toBe(200)
    expect(updatePayload.interest.status).toBe('contacted')
    expect(updatePayload.interest.admin_note).toBe('Reached out manually')

    const { DELETE: archiveItem } = await import('@/app/api/admin/home/items/[id]/route')
    const archiveResponse = await archiveItem(
      createRequest(`/api/admin/home/items/${itemId}`, 'DELETE'),
      { params: Promise.resolve({ id: itemId }) }
    )

    expect(archiveResponse.status).toBe(200)

    const homeAfterArchiveResponse = await getHome()
    const homeAfterArchivePayload = await homeAfterArchiveResponse.json()
    expect(homeAfterArchivePayload.feedItems).toHaveLength(0)
    expect(vi.mocked(auditLogger.log)).toHaveBeenCalled()
  })

  it('ingests link metadata and rejects conflicting featured reorders', async () => {
    const supabase = createHomeTestSupabase({
      home_items: [
        makeHomeItem({
          id: '11111111-1111-4111-8111-111111111111',
          kind: 'report',
          status: 'published',
          title: 'Existing featured',
          summary: 'Existing featured summary',
          featured_slot: 1,
        }),
        makeHomeItem({
          id: '22222222-2222-4222-8222-222222222222',
          kind: 'event',
          status: 'published',
          title: 'Move me',
          summary: 'Move me summary',
          featured_slot: 2,
        }),
      ],
    })

    vi.mocked(requireStaffActor).mockResolvedValue({
      authSupabase: {} as any,
      serviceSupabase: supabase as any,
      user: staffUser as any,
    })

    vi.mocked(fetchHomeLinkMetadata).mockResolvedValue({
      sourceUrl: 'https://example.com/article',
      sourceName: 'Example News',
      sourceDomain: 'example.com',
      title: 'Article title',
      summary: 'Article summary',
      imageUrl: 'https://example.com/image.jpg',
      publishedAt: '2026-03-10T10:00:00.000Z',
      metadata: { ogType: 'article' },
    })

    const { POST: ingestLink } = await import('@/app/api/admin/home/ingest-link/route')
    const ingestResponse = await ingestLink(
      createRequest('/api/admin/home/ingest-link', 'POST', {
        url: 'https://example.com/article',
      })
    )
    const ingestPayload = await ingestResponse.json()

    expect(ingestResponse.status).toBe(200)
    expect(ingestPayload.metadata.title).toBe('Article title')
    expect(ingestPayload.metadata.sourceDomain).toBe('example.com')

    const { POST: reorderItems } = await import('@/app/api/admin/home/items/reorder/route')
    const conflictResponse = await reorderItems(
      createRequest('/api/admin/home/items/reorder', 'POST', {
        items: [
          {
            id: '22222222-2222-4222-8222-222222222222',
            sort_order: 5,
            featured_slot: 1,
          },
        ],
      })
    )
    const conflictPayload = await conflictResponse.json()

    expect(conflictResponse.status).toBe(409)
    expect(conflictPayload.error).toContain('Featured slot 1')

    const successResponse = await reorderItems(
      createRequest('/api/admin/home/items/reorder', 'POST', {
        items: [
          {
            id: '22222222-2222-4222-8222-222222222222',
            sort_order: 7,
            featured_slot: 3,
          },
        ],
      })
    )
    const successPayload = await successResponse.json()

    expect(successResponse.status).toBe(200)
    expect(successPayload.items[0].sort_order).toBe(7)
    expect(successPayload.items[0].featured_slot).toBe(3)
  })

  it('returns existing interest submissions idempotently from the helper state', () => {
    const stateful = createHomeTestSupabase({
      home_interest_submissions: [
        makeHomeInterest({ id: 'interest-1', home_item_id: 'item-1', user_id: 'investor-user-1' }),
      ],
    })

    expect(stateful.state.home_interest_submissions).toHaveLength(1)
    expect(stateful.state.home_interest_submissions[0].id).toBe('interest-1')
  })
})
