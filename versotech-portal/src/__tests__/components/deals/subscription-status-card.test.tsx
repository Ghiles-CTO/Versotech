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
    expect(screen.getByText('NDA')).toBeInTheDocument()
    expect(screen.getByText('Subscription Pack')).toBeInTheDocument()
  })

  it('hides the subscription pack row before the pack has been sent for signature', () => {
    render(
      <SubscriptionStatusCard
        subscription={{
          id: 'sub-1',
          status: 'pending',
          commitment: 250000,
          currency: 'USD',
          funded_amount: null,
          pack_generated_at: null,
          pack_sent_at: null,
          signed_at: null,
          funded_at: null,
          activated_at: null,
          created_at: '2026-03-29T10:00:00.000Z',
          is_signed: false,
          is_funded: false,
          is_active: false,
          documents: {
            nda: {
              status: 'complete',
              signatories: [],
              unsigned_url: null,
              signed_url: null,
            },
            subscription_pack: {
              status: 'not_started',
              signatories: [],
              unsigned_url: null,
              signed_url: null,
            },
            certificate: null,
          },
        }}
      />
    )

    expect(screen.getByText('NDA')).toBeInTheDocument()
    expect(screen.queryByText('Subscription Pack')).not.toBeInTheDocument()
  })
})
