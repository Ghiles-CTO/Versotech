import { describe, expect, it } from 'vitest'

import { buildSubscriptionPackPayload } from '@/lib/subscription-pack/payload-builder'

function buildBasePayload(overrides?: {
  investor?: Record<string, unknown>
  counterpartyEntity?: Record<string, unknown> | null
}) {
  return buildSubscriptionPackPayload({
    outputFormat: 'pdf',
    subscription: {
      commitment: 390000,
      currency: 'USD',
      price_per_share: 199.12345,
      num_shares: 1883,
      subscription_fee_percent: 4,
    },
    investor: {
      legal_name: 'UatInvestor Ltd',
      display_name: 'UatInvestor Ltd',
      type: 'entity',
      registered_address: '12 Main Street, Suite 3',
      city: 'New York',
      state_province: 'NY',
      postal_code: '10001',
      country: 'US',
      ...overrides?.investor,
    },
    deal: {
      name: 'Anthropic',
      company_name: 'Anthropic',
      currency: 'USD',
    },
    vehicle: {
      series_number: '600',
      name: 'VERSO Capital 2 SCSP Series 600',
      issuer_gp_name: 'VERSO Capital 2 GP SARL',
      issuer_gp_rcc_number: 'B290857',
      issuer_rcc_number: 'B290858',
      issuer_website: 'www.versoholdings.com',
    },
    feeStructure: {
      subscription_fee_percent: 4,
      management_fee_percent: 1,
      carried_interest_percent: 15,
      payment_deadline_days: 5,
      issue_within_business_days: 10,
    },
    counterpartyEntity: overrides?.counterpartyEntity as any,
    signatories: [{ name: 'Jane Doe', title: 'Director', number: 1 }],
    issuerName: 'Julien Machot',
    issuerTitle: 'Manager',
    arrangerName: 'Julien Machot',
    arrangerTitle: 'Director',
    signatoriesTableHtml: '',
    signatoriesFormHtml: '',
    signatoriesSignatureHtml: '',
    issuerSignatureHtml: '',
    arrangerSignatureHtml: '',
  }).payload
}

describe('buildSubscriptionPackPayload', () => {
  it('uses the structured registered address for direct entity investors', () => {
    const payload = buildBasePayload()

    expect(payload.subscriber_address).toBe('12 Main Street, Suite 3, New York, NY, 10001, United States')
    expect(payload.subscriber_clause_text).toBe('UatInvestor Ltd, with registered office at 12 Main Street, Suite 3, New York, NY, 10001, United States')
    expect(payload.subscriber_clause_text).not.toContain(' at US')
    expect(payload.subscriber_clause_text).not.toContain(', entity ')
  })

  it('uses the real counterparty entity type and address when subscribing through an entity', () => {
    const payload = buildBasePayload({
      investor: {
        type: 'individual',
        legal_name: 'Underlying Person',
        display_name: 'Underlying Person',
        residential_street: '1 Home Lane',
        residential_city: 'Miami',
        residential_state: 'FL',
        residential_postal_code: '33101',
        residential_country: 'US',
      },
      counterpartyEntity: {
        legal_name: 'UatInvestor Ltd',
        entity_type: 'llc',
        representative_name: 'Jane Doe',
        representative_title: 'Director',
        registered_address: {
          street: '500 Market St',
          city: 'Wilmington',
          state: 'DE',
          postal_code: '19801',
          country: 'US',
        },
      },
    })

    expect(payload.subscriber_type).toBe('LLC')
    expect(payload.subscriber_address).toBe('500 Market St, Wilmington, DE, 19801, United States')
    expect(payload.subscriber_clause_text).toBe('UatInvestor Ltd, an LLC with registered office at 500 Market St, Wilmington, DE, 19801, United States')
  })

  it('keeps individual subscribers on the residential address path', () => {
    const payload = buildBasePayload({
      investor: {
        legal_name: 'John Smith',
        display_name: 'John Smith',
        type: 'individual',
        registered_address: null,
        city: null,
        state_province: null,
        postal_code: null,
        country: null,
        residential_street: '1 Home Lane',
        residential_city: 'Miami',
        residential_state: 'FL',
        residential_postal_code: '33101',
        residential_country: 'US',
        id_type: 'passport',
        id_number: 'A1234567',
      },
    })

    expect(payload.subscriber_address).toBe('1 Home Lane, Miami, FL, 33101, United States')
    expect(payload.subscriber_clause_text).toBe('John Smith, passport number A1234567, with registered address at 1 Home Lane, Miami, FL, 33101, United States')
  })
})
