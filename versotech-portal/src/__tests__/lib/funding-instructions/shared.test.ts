import { describe, expect, it } from 'vitest'

import {
  buildFundingInstructionDocumentName,
  buildFundingInstructionSnapshot,
  buildFundingInstructionSummary,
  parseFundingInstructionSnapshot,
} from '@/lib/funding-instructions/shared'

describe('funding instructions shared helpers', () => {
  it('builds a frozen funding snapshot from the signed gross amount inputs', () => {
    const now = new Date('2026-04-03T00:00:00.000Z')

    const snapshot = buildFundingInstructionSnapshot({
      now,
      subscription: {
        id: 'sub-1',
        deal_id: 'deal-1',
        investor_id: 'investor-1',
        cycle_id: 'cycle-1',
        commitment: 100000,
        currency: 'USD',
        subscription_fee_amount: 3500,
      },
      deal: {
        id: 'deal-1',
        name: 'Anthropic Series',
        currency: 'USD',
      },
      vehicle: {
        id: 'vehicle-1',
        name: 'VERSO Capital 2 SCSP Series 600',
        currency: 'USD',
      },
      feeStructure: {
        payment_deadline_days: 5,
        wire_contact_email: 'funding@verso.test',
      },
    })

    expect(snapshot.gross_amount).toBe(103500)
    expect(snapshot.subscription_fee_amount).toBe(3500)
    expect(snapshot.due_at).toBe('2026-04-08T00:00:00.000Z')
    expect(snapshot.wire_reference).toBe('Agency VERSO Capital 2 SCSP Series 600')
    expect(snapshot.wire_contact_email).toBe('funding@verso.test')
  })

  it('prefers the active vehicle bank account over legacy fee-structure wire fields', () => {
    const snapshot = buildFundingInstructionSnapshot({
      now: new Date('2026-04-03T00:00:00.000Z'),
      subscription: {
        id: 'sub-2',
        commitment: 250000,
        currency: 'USD',
        subscription_fee_percent: 2,
      },
      deal: {
        name: 'Anthropic Series',
        currency: 'USD',
      },
      vehicle: {
        name: 'VERSO Capital 2 SCSP Series 601',
        currency: 'USD',
      },
      feeStructure: {
        wire_bank_name: 'Legacy Bank',
        wire_account_holder: 'Legacy Holder',
        wire_iban: 'LEGACY-IBAN',
        wire_bic: 'LEGACY-BIC',
      },
      activeBankAccount: {
        bank_name: 'ING Luxembourg S.A.',
        bank_address: "52, route d'Esch, L-2965 Luxembourg",
        holder_name: 'Dupont Partners',
        law_firm_address: '2 Avenue Charles de Gaulle, L-1653 Luxembourg',
        description: 'Client Account on behalf of VERSO Capital 2 SCSP Series 601',
        iban: 'LU71 0141 8595 5133 3010',
        bic: 'CELLLULLXXX',
        currency: 'EUR',
        lawyer: {
          display_name: 'Dupont Partners',
          firm_name: 'Dupont Partners',
          primary_contact_email: 'escrow@dupont.test',
          street_address: '2 Avenue Charles de Gaulle',
          city: 'Luxembourg',
          state_province: null,
          postal_code: 'L-1653',
          country: 'Luxembourg',
        },
      } as any,
    })

    expect(snapshot.wire_bank_name).toBe('ING Luxembourg S.A.')
    expect(snapshot.wire_account_holder).toBe('Dupont Partners')
    expect(snapshot.wire_iban).toBe('LU71 0141 8595 5133 3010')
    expect(snapshot.wire_bic).toBe('CELLLULLXXX')
    expect(snapshot.wire_currency_code).toBe('EUR')
    expect(snapshot.wire_currency_long).toBe('Euro')
  })

  it('builds a funding summary from the frozen snapshot and clamps remaining due at zero', () => {
    const snapshot = parseFundingInstructionSnapshot({
      subscription_id: 'sub-3',
      deal_id: 'deal-3',
      investor_id: 'investor-3',
      cycle_id: 'cycle-3',
      deal_name: 'OpenAI SPV',
      vehicle_name: 'VERSO Series 777',
      currency: 'USD',
      commitment_amount: 50000,
      subscription_fee_amount: 2500,
      gross_amount: 52500,
      due_at: '2026-04-10T00:00:00.000Z',
      wire_bank_name: 'ING Luxembourg S.A.',
      wire_bank_address: '52, route d\'Esch, Luxembourg',
      wire_account_holder: 'Dupont Partners',
      wire_escrow_agent: 'Dupont Partners',
      wire_law_firm_address: '2 Avenue Charles de Gaulle, Luxembourg',
      wire_iban: 'LU71 0141 8595 5133 3010',
      wire_bic: 'CELLLULLXXX',
      wire_reference: 'Agency VERSO Series 777',
      wire_description: 'Client Account on behalf of VERSO Series 777',
      wire_currency_code: 'USD',
      wire_currency_long: 'United States Dollar',
      wire_contact_email: 'funding@verso.test',
      created_at: '2026-04-03T00:00:00.000Z',
    })

    const partialSummary = buildFundingInstructionSummary({
      subscriptionId: 'sub-3',
      cycleId: 'cycle-3',
      snapshot,
      fundingGrossTargetAmount: 52500,
      fundingGrossReceivedAmount: 10000,
      fundingDocumentId: 'doc-3',
      signedPackPath: 'subscriptions/sub-3/signed-pack.pdf',
    })

    expect(partialSummary).toMatchObject({
      is_available: true,
      amount_original: 52500,
      amount_received: 10000,
      amount_due: 42500,
      funding_document_id: 'doc-3',
      signed_pack_path: 'subscriptions/sub-3/signed-pack.pdf',
    })

    const fundedSummary = buildFundingInstructionSummary({
      subscriptionId: 'sub-3',
      cycleId: 'cycle-3',
      snapshot,
      fundingGrossTargetAmount: 52500,
      fundingGrossReceivedAmount: 70000,
    })

    expect(fundedSummary).toMatchObject({
      is_available: false,
      auto_open: false,
      amount_due: 0,
      amount_received: 70000,
    })
  })

  it('builds a VERSO-style funding document filename', () => {
    const snapshot = parseFundingInstructionSnapshot({
      subscription_id: 'sub-4',
      deal_id: 'deal-4',
      investor_id: 'investor-4',
      cycle_id: null,
      deal_name: 'SpaceX Secondary',
      vehicle_name: 'SPACE X Secondary Investment',
      currency: 'USD',
      commitment_amount: 350000,
      subscription_fee_amount: 14000,
      gross_amount: 364000,
      due_at: '2026-03-03T00:00:00.000Z',
      wire_bank_name: 'ING Luxembourg S.A.',
      wire_bank_address: '52, route d\'Esch, Luxembourg',
      wire_account_holder: 'Dupont Partners',
      wire_escrow_agent: 'Dupont Partners',
      wire_law_firm_address: '2 Avenue Charles de Gaulle, Luxembourg',
      wire_iban: 'LU71 0141 8595 5133 3010',
      wire_bic: 'CELLLULLXXX',
      wire_reference: 'Agency SPACE X Secondary Investment',
      wire_description: 'Client Account on behalf of SPACE X Secondary Investment',
      wire_currency_code: 'USD',
      wire_currency_long: 'United States Dollar',
      wire_contact_email: 'funding@verso.test',
      created_at: '2026-04-03T00:00:00.000Z',
    })

    expect(snapshot).not.toBeNull()
    expect(
      buildFundingInstructionDocumentName(snapshot!, {
        entityCode: 'VERSO-001',
        investmentName: 'SPACE X Secondary Investment',
        investorName: 'Ghiles Ventures LLC',
        extension: 'pdf',
      })
    ).toBe('VERSO-001 - FUNDING INSTRUCTIONS - SPACE X Secondary Investment - Ghiles Ventures LLC - 030426.pdf')
  })
})
