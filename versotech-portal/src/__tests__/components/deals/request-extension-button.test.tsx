// @vitest-environment happy-dom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RequestExtensionButton } from '@/components/deals/request-extension-button'

describe('RequestExtensionButton', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('stays hidden when access is not expiring soon', () => {
    const { container } = render(
      <RequestExtensionButton
        dealId="deal-1"
        dealName="OpenAI Secondary"
        expiresAt="2026-04-10T12:00:00.000Z"
        daysRemaining={14}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows a request-again CTA for expired access when explicitly allowed', () => {
    render(
      <RequestExtensionButton
        dealId="deal-1"
        dealName="OpenAI Secondary"
        expiresAt="2026-03-20T12:00:00.000Z"
        daysRemaining={-2}
        allowExpired
      />
    )

    expect(screen.getByRole('button', { name: 'Request Access Again' })).toBeInTheDocument()
  })

  it('renders a locked pending state when an extension request is already under review', () => {
    render(
      <RequestExtensionButton
        dealId="deal-1"
        dealName="OpenAI Secondary"
        expiresAt="2026-03-20T12:00:00.000Z"
        daysRemaining={-2}
        allowExpired
        initialPending
      />
    )

    expect(screen.getByRole('button', { name: 'Request Pending' })).toBeDisabled()
  })

  it('submits through the existing extension endpoint for expired access', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <RequestExtensionButton
        dealId="deal-1"
        dealName="OpenAI Secondary"
        expiresAt="2026-03-20T12:00:00.000Z"
        daysRemaining={-2}
        allowExpired
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Request Access Again' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/data-room-access/request-extension', expect.objectContaining({
        method: 'POST',
      }))
    })

    expect(screen.getByRole('button', { name: 'Request Pending' })).toBeDisabled()
  })

  it('treats access that expired earlier today as expired even when the rounded day count is zero', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-03-27T12:00:00.000Z').getTime())

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <RequestExtensionButton
        dealId="deal-1"
        dealName="OpenAI Secondary"
        expiresAt="2026-03-27T11:00:00.000Z"
        daysRemaining={0}
        allowExpired
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Request Access Again' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/data-room-access/request-extension', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          deal_id: 'deal-1',
          reason: 'Requesting renewed access to review OpenAI Secondary data room materials after prior access expired',
        }),
      }))
    })
  })
})
