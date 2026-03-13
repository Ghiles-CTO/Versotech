import { describe, expect, it } from 'vitest'
import { getRoleOptions } from '@/components/shared/member-kyc-edit-dialog'

describe('getRoleOptions', () => {
  it('includes canonical saved roles so the dialog can reload them', () => {
    expect(getRoleOptions('beneficial_owner')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: 'beneficial_owner',
          label: 'Beneficial Owner',
        }),
      ])
    )

    expect(getRoleOptions('partner')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: 'partner',
          label: 'Partner',
        }),
      ])
    )
  })

  it('does not duplicate roles that are already in the base list', () => {
    const directorOptions = getRoleOptions('director').filter((option) => option.value === 'director')
    expect(directorOptions).toHaveLength(1)
  })
})
