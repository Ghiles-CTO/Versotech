import { describe, expect, it } from 'vitest'
import { parseProfileSaveFollowUp } from '@/components/profile/profile-page-client'

describe('parseProfileSaveFollowUp', () => {
  const options = {
    successMessage: 'Saved successfully',
    alreadyHandledMessage: 'Changes saved.',
    missingPrefix: 'Changes saved. Complete',
    invalidPrefix: 'Changes saved. Fix',
    fallbackErrorMessage: 'Changes saved, but follow-up failed.',
  }

  it('keeps the dialog open when required fields are still missing', async () => {
    const response = new Response(
      JSON.stringify({ missing: ['Legal Name', 'Mobile Phone'] }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )

    await expect(parseProfileSaveFollowUp(response, options)).resolves.toEqual({
      level: 'info',
      message: 'Changes saved. Complete Legal Name, Mobile Phone.',
      closeDialog: false,
      refresh: false,
    })
  })

  it('treats already submitted responses as handled', async () => {
    const response = new Response(
      JSON.stringify({ error: 'Entity KYC information already submitted' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )

    await expect(parseProfileSaveFollowUp(response, options)).resolves.toEqual({
      level: 'info',
      message: 'Changes saved.',
    })
  })
})
