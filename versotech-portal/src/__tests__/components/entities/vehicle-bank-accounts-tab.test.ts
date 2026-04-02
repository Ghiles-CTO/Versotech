import { describe, expect, it } from 'vitest'

import {
  applyLawyerSelectionToFormState,
  buildInitialFormState,
} from '@/components/entities/vehicle-bank-accounts-tab'

describe('vehicle bank accounts form state', () => {
  it('prefills holder and law firm address from the selected lawyer on first open', () => {
    const formState = buildInitialFormState({
      bankAccounts: [],
      mainAccount: null,
      draftAccount: null,
      canManage: true,
      lawyers: [
        {
          id: 'lawyer-1',
          name: 'Dupont Partners',
          firm_name: 'Dupont Partners',
          email: 'contact@dupont.test',
          street_address: '2 Avenue Charles de Gaulle',
          city: 'Luxembourg',
          state_province: null,
          postal_code: 'L-1653',
          country: 'Luxembourg',
        },
      ],
      vehicle: {
        id: 'vehicle-1',
        name: 'VERSO Capital 2 SCSp Series 201',
        lawyer_id: 'lawyer-1',
        currency: 'USD',
        default_description: 'Client Account on behalf of VERSO Capital 2 SCSp Series 201',
      },
    })

    expect(formState.lawyer_id).toBe('lawyer-1')
    expect(formState.holder_name).toBe('Dupont Partners')
    expect(formState.law_firm_address).toBe('2 Avenue Charles de Gaulle, Luxembourg, L-1653, Luxembourg')
  })

  it('clears lawyer-prefilled holder and address when switching to manual entry', () => {
    const nextState = applyLawyerSelectionToFormState(
      {
        lawyer_id: 'lawyer-1',
        bank_name: 'ING Luxembourg S.A.',
        bank_address: '52 route dEsch',
        holder_name: 'Dupont Partners',
        law_firm_address: '2 Avenue Charles de Gaulle, Luxembourg, L-1653, Luxembourg',
        description: 'Client Account on behalf of VERSO Capital 2 SCSp Series 201',
        iban: 'LU71',
        bic: 'CELLLULLXXX',
        currency: 'USD',
      },
      undefined,
    )

    expect(nextState.lawyer_id).toBe('')
    expect(nextState.holder_name).toBe('')
    expect(nextState.law_firm_address).toBe('')
    expect(nextState.bank_name).toBe('ING Luxembourg S.A.')
  })
})
