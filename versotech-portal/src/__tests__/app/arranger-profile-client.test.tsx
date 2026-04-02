import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ArrangerProfileClient } from '@/app/(main)/versotech_main/arranger-profile/arranger-profile-client'

const profileFormSpy = vi.fn()

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}))

vi.mock('@/components/profile/profile-form', () => ({
  ProfileForm: (props: Record<string, unknown>) => {
    profileFormSpy(props)
    return <div>Profile Form Mounted</div>
  },
}))

vi.mock('@/components/profile/password-change-form', () => ({
  PasswordChangeForm: () => <div>Password Change</div>,
}))

vi.mock('@/components/profile/preferences-editor', () => ({
  PreferencesEditor: () => <div>Preferences Editor</div>,
}))

vi.mock('@/components/profile/gdpr-controls', () => ({
  GDPRControls: () => <div>GDPR Controls</div>,
}))

vi.mock('@/components/profile/arranger-kyc-documents-tab', () => ({
  ArrangerKYCDocumentsTab: () => <div>Arranger KYC Documents</div>,
}))

vi.mock('@/components/members/members-management-tab', () => ({
  MembersManagementTab: () => <div>Members Management</div>,
}))

vi.mock('@/components/profile/generic-entity-members-tab', () => ({
  GenericEntityMembersTab: () => <div>Generic Entity Members</div>,
}))

vi.mock('@/components/profile/notice-contacts-tab', () => ({
  NoticeContactsTab: () => <div>Notice Contacts</div>,
}))

vi.mock('@/components/profile/overview', () => ({
  ProfileOverviewShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  OverviewSectionCard: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}))

vi.mock('@/components/shared', () => ({
  EntityKYCEditDialog: () => null,
  EntityAddressEditDialog: () => null,
  IndividualKycDisplay: () => <div>Individual KYC</div>,
}))

vi.mock('@/components/profile/personal-kyc-section', () => ({
  PersonalKYCSection: () => <div>Personal KYC Section</div>,
}))

describe('ArrangerProfileClient', () => {
  it('renders the personal profile form with the signer title data on the arranger profile page', () => {
    render(
      <ArrangerProfileClient
        userEmail="fred@verso.test"
        profile={{
          id: 'user-1',
          display_name: 'Fred Demargne',
          email: 'fred@verso.test',
          avatar_url: null,
          title: 'Managing Partner',
          phone: null,
          office_location: null,
          bio: null,
          role: 'arranger',
        }}
        arrangerInfo={{
          id: 'arranger-1',
          legal_name: 'Verso Management Ltd.',
          company_name: 'Verso Management Ltd.',
          registration_number: 'REG-1',
          tax_id: 'TAX-1',
          regulator: 'CSSF',
          license_number: 'LIC-1',
          license_type: 'AIFM',
          license_expiry_date: null,
          email: 'entity@verso.test',
          phone: '+352 123456',
          address: '2 Avenue Charles de Gaulle',
          website: 'https://verso.test',
          kyc_status: 'approved',
          kyc_approved_at: null,
          kyc_expires_at: null,
          status: 'active',
          is_active: true,
          created_at: '2026-01-01T00:00:00.000Z',
          type: 'entity',
        }}
        arrangerUserInfo={{
          role: 'admin',
          is_primary: true,
          is_active: true,
          can_sign: true,
          signature_specimen_url: null,
          signature_specimen_uploaded_at: null,
        }}
        dealCount={3}
        memberInfo={null}
      />
    )

    expect(screen.getByText('Profile Form Mounted')).toBeInTheDocument()
    expect(profileFormSpy).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1',
      initialData: expect.objectContaining({
        title: 'Managing Partner',
        email: 'fred@verso.test',
      }),
    }))
  })
})
