// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SubscriptionStatusCard } from '@/components/deals/subscription-status-card'

describe('SubscriptionStatusCard', () => {
  it('shows the business-friendly document actions for a signed additional investment', () => {
    const handleViewNdas = vi.fn()
    const handleViewSignedPack = vi.fn()

    render(
      <SubscriptionStatusCard
        entry={{
          id: 'entry-1',
          amount: 250000,
          currency: 'USD',
          status: 'active',
          status_label: 'Active Investment',
          is_reinvestment: true,
          milestones: {
            confirmed: true,
            signed: true,
            funded: true,
            active: true,
          },
          documents: {
            signed_pack_available: true,
            signed_pack_path: 'signed/sub-1.pdf',
          },
        }}
        onViewNdas={handleViewNdas}
        onViewSignedPack={handleViewSignedPack}
      />
    )

    expect(screen.getByText('Additional investment')).toBeInTheDocument()
    expect(screen.getByText('View NDAs')).toBeInTheDocument()
    expect(screen.getByText('Preview signed subscription pack')).toBeInTheDocument()
  })
})
