// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InterestStatusCard } from '../../../components/deals/interest-status-card'

describe('InterestStatusCard', () => {
  const baseProps = {
    currentStage: 0,
    membership: null,
    subscription: null,
    canExpressInterest: true,
    canSignNda: false,
    canSubscribe: true,
    isTrackingOnly: false,
    onExpressInterest: vi.fn(),
    onSignNda: vi.fn(),
    onSubscribe: vi.fn()
  }

  it('shows tracking-only notice and hides actions', () => {
    render(
      <InterestStatusCard
        {...baseProps}
        isTrackingOnly={true}
      />
    )

    expect(screen.getByText('Tracking Only Access')).toBeTruthy()
    expect(screen.queryByText('Subscribe to Investment')).toBeNull()
    expect(screen.queryByText('Request Data Room Access')).toBeNull()
  })

  it('renders only subscribe action when express interest is unavailable', () => {
    render(
      <InterestStatusCard
        {...baseProps}
        canExpressInterest={false}
      />
    )

    expect(screen.getByText('Subscribe to Investment')).toBeTruthy()
    expect(screen.queryByText('Request Data Room Access')).toBeNull()
  })
})
