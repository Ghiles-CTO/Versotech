import { describe, expect, it } from 'vitest'

import { checkVehicleBankAccountStatus, runEntityHealthChecks } from '@/lib/entity-health-checker'

describe('entity health checker bank accounts', () => {
  it('fails when no main bank account is published', () => {
    const checks = checkVehicleBankAccountStatus({
      totalCount: 0,
      activeCount: 0,
      draftCount: 0,
    })

    expect(checks).toHaveLength(1)
    expect(checks[0].category).toBe('bank_accounts')
    expect(checks[0].status).toBe('fail')
    expect(checks[0].actionable?.action).toBe('manage_bank_accounts')
  })

  it('passes when exactly one active bank account exists', () => {
    const checks = checkVehicleBankAccountStatus({
      totalCount: 2,
      activeCount: 1,
      draftCount: 1,
    })

    expect(checks).toHaveLength(1)
    expect(checks[0].status).toBe('pass')
  })

  it('includes bank account checks in the overall health result', () => {
    const result = runEntityHealthChecks({
      entity: {
        id: 'vehicle-1',
        name: 'VERSO Capital 2 SCSp Series 201',
        entity_code: 'V201',
        type: 'fund',
        status: 'LIVE',
        domicile: 'Luxembourg',
        legal_jurisdiction: 'Luxembourg',
        formation_date: '2024-01-01',
        registration_number: 'B123',
        currency: 'USD',
      },
      directors: [{ id: 'dir-1', full_name: 'Jane Doe', effective_from: '2024-01-01', effective_to: null }],
      stakeholders: [
        { id: 'stk-1', role: 'lawyer', effective_to: null },
        { id: 'stk-2', role: 'accountant', effective_to: null },
        { id: 'stk-3', role: 'auditor', effective_to: null },
        { id: 'stk-4', role: 'administrator', effective_to: null },
      ],
      documents: [
        { id: 'doc-1', type: 'kyc', folder_id: 'folder-1' },
        { id: 'doc-2', type: 'legal', folder_id: 'folder-1' },
        { id: 'doc-3', type: 'formation', folder_id: 'folder-1' },
        { id: 'doc-4', type: 'regulatory', folder_id: 'folder-1' },
      ],
      folders: [{ id: 'folder-1', folder_type: 'legal' }],
      deals: [{ id: 'deal-1', status: 'active' }],
      investors: [{ id: 'inv-1', allocation_status: 'active' }],
      bankAccountState: {
        totalCount: 1,
        activeCount: 1,
        draftCount: 0,
      },
    })

    expect(result.checks.some((check) => check.category === 'bank_accounts')).toBe(true)
  })
})
