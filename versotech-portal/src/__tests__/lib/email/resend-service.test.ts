import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('sendSignatureRequestEmail', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('RESEND_API_KEY', 're_live_mocked_key')
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email-123' }),
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('includes series and investment company for subscription pack emails', async () => {
    const { sendSignatureRequestEmail } = await import('@/lib/email/resend-service')

    const result = await sendSignatureRequestEmail({
      email: 'investor@example.com',
      signerName: 'Jane Investor',
      documentType: 'subscription',
      signingUrl: 'https://app.versotech.com/sign/test-token',
      expiresAt: '2026-04-30T00:00:00.000Z',
      seriesName: 'VERSO Capital 2 SCSP Series 600',
      investmentCompany: 'OpenAI Holdings',
    })

    expect(result.success).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    const payload = JSON.parse(String(request.body))

    expect(payload.html).toContain('<strong>Series:</strong> VERSO Capital 2 SCSP Series 600')
    expect(payload.html).toContain('<strong>Investment Company:</strong> OpenAI Holdings')
    expect(payload.subject).toBe('A Subscription Pack available for your signature in VERSOTECH')
  })

  it('does not render subscription context for non-subscription emails', async () => {
    const { sendSignatureRequestEmail } = await import('@/lib/email/resend-service')

    const result = await sendSignatureRequestEmail({
      email: 'investor@example.com',
      signerName: 'Jane Investor',
      documentType: 'nda',
      signingUrl: 'https://app.versotech.com/sign/test-token',
      expiresAt: '2026-04-30T00:00:00.000Z',
      seriesName: 'Should not appear',
      investmentCompany: 'Should not appear',
    })

    expect(result.success).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    const payload = JSON.parse(String(request.body))

    expect(payload.html).not.toContain('<strong>Series:</strong>')
    expect(payload.html).not.toContain('<strong>Investment Company:</strong>')
  })
})
