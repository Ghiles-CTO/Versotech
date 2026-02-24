'use client'

import type { ComponentType, ReactNode } from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  User,
  Edit,
  Send,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  Globe,
  FileText,
  Flag,
  Building2,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { MemberKYCEditDialog } from '@/components/shared/member-kyc-edit-dialog'
import { getCountryName } from '@/components/kyc/country-select'

// Member KYC data structure from database
export type MemberKYCData = {
  id: string
  full_name: string | null
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  name_suffix: string | null
  role: string | null
  email: string | null
  phone: string | null
  phone_mobile: string | null
  phone_office: string | null
  date_of_birth: string | null
  country_of_birth: string | null
  nationality: string | null
  // Residential address
  residential_street: string | null
  residential_line_2: string | null
  residential_city: string | null
  residential_state: string | null
  residential_postal_code: string | null
  residential_country: string | null
  // Tax info
  is_us_citizen: boolean | null
  is_us_taxpayer: boolean | null
  us_taxpayer_id: string | null
  country_of_tax_residency: string | null
  tax_id_number: string | null
  // ID document
  id_type: string | null
  id_number: string | null
  id_issue_date: string | null
  id_expiry_date: string | null
  id_issuing_country: string | null
  // Status
  kyc_status: string | null
  kyc_approved_at: string | null
  kyc_notes: string | null
}


interface PersonalKYCSectionProps {
  memberData: MemberKYCData | null
  entityType: 'investor' | 'partner' | 'introducer' | 'lawyer' | 'commercial_partner' | 'arranger'
  entityId: string
  latestReviewSnapshot?: Record<string, unknown> | null
  onRefresh?: () => void
  profileEmail?: string | null
  profileName?: string | null
}

const normalizeComparableValue = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

const pickSnapshotValue = (
  snapshot: Record<string, unknown> | null | undefined,
  keys: readonly string[]
): unknown => {
  if (!snapshot) return null
  for (const key of keys) {
    const value = snapshot[key]
    if (value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '')) {
      return value
    }
  }
  return null
}

// --- Visual helpers (same style as IndividualKycDisplay) ---

function hasValue(value: ReactNode): boolean {
  return value !== null && value !== undefined && !(typeof value === 'string' && value.trim().length === 0)
}

function Field({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon?: ComponentType<{ className?: string }>
  label: string
  value: ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-md border border-border/70 bg-background p-3', className)}>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 min-h-5 text-sm font-medium text-foreground break-words">
        <span className="inline-flex items-start gap-2">
          {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
          {hasValue(value) ? value : '-'}
        </span>
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-lg border border-border/70 bg-muted/20 p-4', className)}>
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </h4>
      {children}
    </section>
  )
}

function BooleanField({
  icon: Icon,
  label,
  value,
}: {
  icon?: ComponentType<{ className?: string }>
  label: string
  value: boolean | null | undefined
}) {
  return (
    <div className="rounded-md border border-border/70 bg-background p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1">
        <Badge variant={value ? 'secondary' : 'outline'} className="font-medium">
          {Icon ? <Icon className="h-3 w-3 mr-1" /> : null}
          {value ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Yes
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              No
            </>
          )}
        </Badge>
      </div>
    </div>
  )
}

// --- End visual helpers ---

const MEMBER_API_ENDPOINTS: Record<PersonalKYCSectionProps['entityType'], string> = {
  investor: '/api/investors/me/members',
  partner: '/api/partners/me/members',
  introducer: '/api/introducers/me/members',
  lawyer: '/api/lawyers/me/members',
  commercial_partner: '/api/commercial-partners/me/members',
  arranger: '/api/arrangers/me/members',
}

export function PersonalKYCSection({
  memberData,
  entityType,
  entityId,
  latestReviewSnapshot,
  onRefresh,
  profileEmail,
  profileName,
}: PersonalKYCSectionProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
    } catch {
      return dateStr
    }
  }

  // Build full address string
  const getFullAddress = () => {
    if (!memberData) return null
    const parts = [
      memberData.residential_street,
      memberData.residential_line_2,
      memberData.residential_city,
      memberData.residential_state,
      memberData.residential_postal_code,
      getCountryName(memberData.residential_country),
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }

  const hasEditsToSave = !!memberData && (
    !latestReviewSnapshot ||
    Object.keys(latestReviewSnapshot).length === 0 ||
    [
      { current: memberData.first_name, keys: ['first_name'] },
      { current: memberData.middle_name, keys: ['middle_name'] },
      { current: memberData.last_name, keys: ['last_name'] },
      { current: memberData.name_suffix, keys: ['name_suffix'] },
      { current: memberData.date_of_birth, keys: ['date_of_birth'] },
      { current: memberData.country_of_birth, keys: ['country_of_birth'] },
      { current: memberData.nationality, keys: ['nationality'] },
      { current: memberData.email, keys: ['email'] },
      { current: memberData.phone_mobile, keys: ['phone_mobile'] },
      { current: memberData.phone_office, keys: ['phone_office'] },
      { current: memberData.residential_street, keys: ['residential_street', 'address_line_1'] },
      { current: memberData.residential_line_2, keys: ['residential_line_2', 'address_line_2'] },
      { current: memberData.residential_city, keys: ['residential_city', 'city'] },
      { current: memberData.residential_state, keys: ['residential_state', 'state_province'] },
      { current: memberData.residential_postal_code, keys: ['residential_postal_code', 'postal_code'] },
      { current: memberData.residential_country, keys: ['residential_country', 'country'] },
      { current: memberData.is_us_citizen, keys: ['is_us_citizen'] },
      { current: memberData.is_us_taxpayer, keys: ['is_us_taxpayer'] },
      { current: memberData.us_taxpayer_id, keys: ['us_taxpayer_id'] },
      { current: memberData.country_of_tax_residency, keys: ['country_of_tax_residency', 'tax_residency'] },
      { current: memberData.tax_id_number, keys: ['tax_id_number'] },
      { current: memberData.id_type, keys: ['id_type'] },
      { current: memberData.id_number, keys: ['id_number'] },
      { current: memberData.id_issue_date, keys: ['id_issue_date'] },
      { current: memberData.id_expiry_date, keys: ['id_expiry_date'] },
      { current: memberData.id_issuing_country, keys: ['id_issuing_country'] },
    ].some(
      ({ current, keys }) =>
        normalizeComparableValue(current) !==
        normalizeComparableValue(pickSnapshotValue(latestReviewSnapshot, keys))
    )
  )

  // Submit personal KYC for review
  const handleSubmitForReview = async () => {
    if (!memberData?.id) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/me/personal-kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          memberId: memberData.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit KYC')
      }

      toast.success('Personal KYC submitted')
      onRefresh?.()
    } catch (error) {
      console.error('Error submitting KYC:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit KYC')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If no member data, show message to complete profile
  if (!memberData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Personal Information
          </CardTitle>
          <CardDescription>
            Complete your personal KYC information for compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed border-muted rounded-lg py-8 px-4 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Your personal information record is being set up. Please check back shortly.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Personal Information
            </CardTitle>
            <CardDescription>
              Your personal KYC details for this entity
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Personal Information */}
          <Section icon={User} title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field
                label="Full Name"
                value={
                  [memberData.first_name, memberData.middle_name, memberData.last_name, memberData.name_suffix]
                    .filter(Boolean)
                    .join(' ') || '-'
                }
              />
              <Field icon={Calendar} label="Date of Birth" value={formatDate(memberData.date_of_birth)} />
              <Field icon={Globe} label="Nationality" value={getCountryName(memberData.nationality)} />
              <Field icon={Flag} label="Country of Birth" value={getCountryName(memberData.country_of_birth)} />
            </div>
          </Section>

          {/* Contact Information */}
          <Section icon={Phone} title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Email" value={memberData.email} />
              <Field icon={Phone} label="Mobile" value={memberData.phone_mobile} />
              <Field icon={Phone} label="Office Phone" value={memberData.phone_office} />
              <Field icon={MapPin} label="Address" value={getFullAddress()} />
            </div>
          </Section>

          {/* Tax Information */}
          <Section icon={FileText} title="Tax Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <BooleanField icon={Flag} label="US Citizen" value={memberData.is_us_citizen} />
              <BooleanField icon={Building2} label="US Taxpayer" value={memberData.is_us_taxpayer} />
              {memberData.is_us_taxpayer && (
                <Field label="US Taxpayer ID" value={memberData.us_taxpayer_id} />
              )}
              <Field icon={Globe} label="Tax Residency" value={getCountryName(memberData.country_of_tax_residency)} />
              {memberData.tax_id_number && (
                <Field label="Tax ID Number" value={memberData.tax_id_number} />
              )}
            </div>
          </Section>

          {/* Save Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleSubmitForReview}
              disabled={isSubmitting || !hasEditsToSave}
              variant={hasEditsToSave ? 'default' : 'outline'}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            {!hasEditsToSave && (
              <p className="text-sm text-muted-foreground mt-2">
                No edits to save.
              </p>
            )}
          </div>

          {/* KYC Notes (if rejected) */}
          {memberData.kyc_status === 'rejected' && memberData.kyc_notes && (
            <div className="pt-4 border-t">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Review Notes
                </h4>
                <p className="text-sm text-red-700 mt-1">{memberData.kyc_notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <MemberKYCEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        entityType={entityType}
        entityId={entityId}
        memberId={memberData.id}
        memberName={memberData.full_name || undefined}
        initialData={{
          role: memberData.role || 'other',
          first_name: memberData.first_name || (profileName?.split(' ')[0]) || '',
          middle_name: memberData.middle_name,
          last_name: memberData.last_name || (profileName?.split(' ').slice(1).join(' ')) || '',
          name_suffix: memberData.name_suffix,
          date_of_birth: memberData.date_of_birth,
          country_of_birth: memberData.country_of_birth,
          nationality: memberData.nationality,
          email: memberData.email || profileEmail,
          phone_mobile: memberData.phone_mobile,
          phone_office: memberData.phone_office,
          residential_street: memberData.residential_street,
          residential_line_2: memberData.residential_line_2,
          residential_city: memberData.residential_city,
          residential_state: memberData.residential_state,
          residential_postal_code: memberData.residential_postal_code,
          residential_country: memberData.residential_country,
          is_us_citizen: memberData.is_us_citizen || false,
          is_us_taxpayer: memberData.is_us_taxpayer || false,
          us_taxpayer_id: memberData.us_taxpayer_id,
          country_of_tax_residency: memberData.country_of_tax_residency,
          tax_id_number: memberData.tax_id_number,
        }}
        apiEndpoint={MEMBER_API_ENDPOINTS[entityType]}
        onSuccess={() => {
          setShowEditDialog(false)
          onRefresh?.()
        }}
        mode="edit"
      />
    </>
  )
}
