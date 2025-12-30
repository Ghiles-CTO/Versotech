// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeeModelView } from '../../../components/partner/FeeModelView'

describe('FeeModelView', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('renders fee models from the API response', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        fee_models: [
          {
            id: 'plan-1',
            name: 'Partner Fee Plan',
            description: null,
            is_active: true,
            is_default: false,
            effective_from: null,
            effective_until: null,
            deal: { id: 'deal-1', name: 'Alpha Deal' },
            fee_components: [
              { id: 'comp-1', kind: 'subscription', rate_bps: 200, flat_amount: null, calc_method: null, frequency: null },
              { id: 'comp-2', kind: 'management', rate_bps: 150, flat_amount: null, calc_method: null, frequency: null },
              { id: 'comp-3', kind: 'performance', rate_bps: 1000, flat_amount: null, calc_method: null, frequency: null }
            ]
          }
        ]
      })
    })

    render(<FeeModelView />)

    expect(await screen.findByText('Partner Fee Plan')).toBeTruthy()
    expect(screen.getByText('Deal: Alpha Deal')).toBeTruthy()
    expect(screen.getByText('2%')).toBeTruthy()
    expect(screen.getByText('1.5%')).toBeTruthy()
    expect(screen.getByText('10%')).toBeTruthy()
  })
})
