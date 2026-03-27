import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/dashboard-marketing/auth', () => ({
  requireMarketingAdmin: vi.fn(),
}))

vi.mock('@/lib/dashboard-marketing/query', () => ({
  buildMarketingCardsResponse: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(),
}))

import { requireMarketingAdmin } from '@/lib/dashboard-marketing/auth'
import { buildMarketingCardsResponse } from '@/lib/dashboard-marketing/query'
import { createServiceClient } from '@/lib/supabase/server'

function createRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/admin/marketing/cards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/marketing/cards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('inserts new cards at the first position by default', async () => {
    vi.mocked(requireMarketingAdmin).mockResolvedValue({
      user: { id: 'admin-1' },
      response: null,
    } as any)

    let insertedPayload: Record<string, unknown> | null = null

    vi.mocked(createServiceClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockImplementation((payload: Record<string, unknown>) => {
          insertedPayload = payload

          return {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'card-1',
                  ...payload,
                  created_at: '2026-03-27T10:00:00.000Z',
                  updated_at: '2026-03-27T10:00:00.000Z',
                },
                error: null,
              }),
            }),
          }
        }),
      }),
    } as any)

    vi.mocked(buildMarketingCardsResponse).mockImplementation(async (rows: any[]) => ({
      items: rows as any,
      submittedCardIds: [],
      generatedAt: '2026-03-27T10:00:00.000Z',
    }))

    const { POST } = await import('@/app/api/admin/marketing/cards/route')

    const response = await POST(
      createRequest({
        card_type: 'news',
        status: 'draft',
        title: 'Fresh announcement',
        summary: 'A brand new announcement for investors.',
        media_type: 'link',
        external_url: 'https://example.com/announcement',
        cta_enabled: true,
        cta_label: 'Open',
        sort_order: 999,
      })
    )

    const data = await response.json()

    expect(response.status).toBe(201)
    expect(insertedPayload).toMatchObject({
      sort_order: 0,
      created_by: 'admin-1',
      updated_by: 'admin-1',
    })
    expect(data.sort_order).toBe(0)
  })
})
