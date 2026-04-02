import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfileForm } from '@/components/profile/profile-form'

const { toastSuccess, toastError } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccess,
    error: toastError,
  },
}))

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the editable job title field', () => {
    render(
      <ProfileForm
        userId="user-1"
        initialData={{
          display_name: 'Fred Demargne',
          email: 'fred@verso.test',
          title: 'Staff Administrator',
          phone: null,
          office_location: null,
          bio: null,
          role: 'arranger',
        }}
        onUpdate={vi.fn()}
      />
    )

    expect(screen.getByLabelText('Job Title / Position')).toHaveValue('Staff Administrator')
  })

  it('submits the updated title to the profile API and applies the returned profile', async () => {
    const onUpdate = vi.fn()
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          profile: {
            display_name: 'Fred Demargne',
            email: 'fred@verso.test',
            title: 'Managing Partner',
            phone: null,
            office_location: null,
            bio: null,
            role: 'arranger',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    )

    vi.stubGlobal('fetch', fetchMock)

    render(
      <ProfileForm
        userId="user-1"
        initialData={{
          display_name: 'Fred Demargne',
          email: 'fred@verso.test',
          title: 'Staff Administrator',
          phone: null,
          office_location: null,
          bio: null,
          role: 'arranger',
        }}
        onUpdate={onUpdate}
      />
    )

    fireEvent.change(screen.getByLabelText('Job Title / Position'), {
      target: { value: 'Managing Partner' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/profiles/user-1', expect.objectContaining({
        method: 'PUT',
      }))
    })

    const [, requestInit] = fetchMock.mock.calls[0]
    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      title: 'Managing Partner',
    })

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Managing Partner',
      }))
    })
    expect(toastSuccess).toHaveBeenCalledWith('Profile updated successfully')
  })
})
