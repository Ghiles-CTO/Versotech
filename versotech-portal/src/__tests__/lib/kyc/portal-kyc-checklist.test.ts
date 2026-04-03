import { describe, expect, it } from 'vitest'

import {
  buildPortalKycChecklistRows,
  getEquivalentKycRequirementDocumentTypes,
} from '@/lib/kyc/portal-kyc-checklist'

describe('portal-kyc-checklist', () => {
  it('builds two individual rows and keeps the latest ID subtype/version on one requirement', () => {
    const rows = buildPortalKycChecklistRows({
      entityType: 'individual',
      submissions: [
        {
          id: 'sub-1',
          document_type: 'passport',
          status: 'pending',
          version: 1,
          created_at: '2026-04-01T08:00:00.000Z',
        },
        {
          id: 'sub-2',
          document_type: 'national_id',
          status: 'approved',
          version: 2,
          created_at: '2026-04-02T08:00:00.000Z',
        },
      ],
    })

    expect(rows).toHaveLength(2)

    const idRow = rows.find((row) => row.label === 'Proof of Identification')
    expect(idRow?.status).toBe('approved')
    expect(idRow?.latestSubmission?.document_type).toBe('national_id')
    expect(idRow?.latestSubmission?.version).toBe(2)
  })

  it('builds entity rows plus member rows and marks missing items distinctly', () => {
    const rows = buildPortalKycChecklistRows({
      entityType: 'entity',
      members: [
        { id: 'member-1', full_name: 'Alice Director', role: 'director' },
        { id: 'member-2', full_name: 'Bob Ubo', role: 'ubo' },
      ],
      submissions: [
        {
          id: 'sub-1',
          document_type: 'incorporation_certificate',
          status: 'approved',
          version: 1,
          created_at: '2026-04-01T08:00:00.000Z',
        },
        {
          id: 'sub-2',
          document_type: 'utility_bill',
          status: 'under_review',
          version: 1,
          created_at: '2026-04-01T09:00:00.000Z',
          memberId: 'member-1',
        },
      ],
    })

    expect(rows).toHaveLength(10)

    const incorporationRow = rows.find((row) => row.key === 'incorporation_certificate')
    const aliceProofRow = rows.find((row) => row.key === 'proof_of_address:member-1')
    const bobIdRow = rows.find((row) => row.key === 'proof_of_identification:member-2')

    expect(incorporationRow?.status).toBe('approved')
    expect(aliceProofRow?.status).toBe('under_review')
    expect(bobIdRow?.status).toBe('missing')
  })

  it('treats concrete ID and proof-of-address types as one requirement group for duplicate checks', () => {
    expect(getEquivalentKycRequirementDocumentTypes('passport')).toEqual(
      expect.arrayContaining(['passport', 'national_id', 'drivers_license'])
    )

    expect(getEquivalentKycRequirementDocumentTypes('government_correspondence')).toEqual(
      expect.arrayContaining(['utility_bill', 'government_correspondence', 'other'])
    )

    expect(getEquivalentKycRequirementDocumentTypes('bank_account_details')).toEqual(
      expect.arrayContaining(['bank_confirmation', 'bank_account_details'])
    )

    expect(getEquivalentKycRequirementDocumentTypes('bank_confirmation')).toEqual(
      expect.arrayContaining(['bank_confirmation', 'bank_account_details'])
    )
  })

  it('maps legacy entity document aliases into the current checklist rows without a data backfill', () => {
    const rows = buildPortalKycChecklistRows({
      entityType: 'entity',
      submissions: [
        {
          id: 'sub-company-registration',
          document_type: 'company_registration',
          status: 'approved',
          version: 1,
          created_at: '2026-04-01T08:00:00.000Z',
        },
        {
          id: 'sub-bank-details',
          document_type: 'bank_account_details',
          status: 'under_review',
          version: 2,
          created_at: '2026-04-02T08:00:00.000Z',
        },
      ],
    })

    const memoRow = rows.find((row) => row.key === 'memo_articles')
    const bankRow = rows.find((row) => row.key === 'bank_confirmation')

    expect(memoRow?.status).toBe('approved')
    expect(memoRow?.latestSubmission?.document_type).toBe('company_registration')

    expect(bankRow?.status).toBe('under_review')
    expect(bankRow?.latestSubmission?.document_type).toBe('bank_account_details')
    expect(bankRow?.latestSubmission?.version).toBe(2)
  })

  it('keeps only the latest submission visible after a rejected document is explicitly updated', () => {
    const rows = buildPortalKycChecklistRows({
      entityType: 'entity',
      submissions: [
        {
          id: 'sub-old',
          document_type: 'register_directors',
          status: 'rejected',
          version: 1,
          created_at: '2026-04-01T08:00:00.000Z',
          rejection_reason: 'Please provide the latest register.',
        },
        {
          id: 'sub-new',
          document_type: 'register_directors',
          status: 'pending',
          version: 2,
          created_at: '2026-04-03T08:00:00.000Z',
        },
      ],
    })

    const registerRow = rows.find((row) => row.key === 'register_directors')

    expect(registerRow?.status).toBe('pending')
    expect(registerRow?.latestSubmission?.id).toBe('sub-new')
    expect(registerRow?.latestSubmission?.version).toBe(2)
  })

  it('scopes grouped document requirements per member so one member upload does not satisfy another', () => {
    const rows = buildPortalKycChecklistRows({
      entityType: 'entity',
      members: [
        { id: 'member-1', full_name: 'Alice Director', role: 'director' },
        { id: 'member-2', full_name: 'Bob Ubo', role: 'ubo' },
      ],
      submissions: [
        {
          id: 'sub-member-1',
          document_type: 'passport',
          status: 'approved',
          version: 1,
          created_at: '2026-04-01T08:00:00.000Z',
          memberId: 'member-1',
        },
      ],
    })

    const aliceIdRow = rows.find((row) => row.key === 'proof_of_identification:member-1')
    const bobIdRow = rows.find((row) => row.key === 'proof_of_identification:member-2')

    expect(aliceIdRow?.status).toBe('approved')
    expect(bobIdRow?.status).toBe('missing')
  })
})
