'use client'

import type { ComponentType, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  User,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Globe,
  Flag,
  Building2,
  Edit,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { getCountryName } from '@/components/kyc/country-select'

// Individual KYC data structure (matches entity-kyc-edit-dialog)
export interface IndividualKycData {
  // Personal Info
  first_name?: string | null
  middle_name?: string | null
  middle_initial?: string | null
  last_name?: string | null
  name_suffix?: string | null
  date_of_birth?: string | null
  country_of_birth?: string | null
  nationality?: string | null
  email?: string | null
  phone_mobile?: string | null
  phone_office?: string | null

  // Residential Address
  residential_street?: string | null
  residential_line_2?: string | null
  residential_city?: string | null
  residential_state?: string | null
  residential_postal_code?: string | null
  residential_country?: string | null

  // Tax Information
  is_us_citizen?: boolean | null
  is_us_taxpayer?: boolean | null
  us_taxpayer_id?: string | null
  country_of_tax_residency?: string | null
  tax_id_number?: string | null

  // Identification Document
  id_type?: string | null
  id_number?: string | null
  id_issue_date?: string | null
  id_expiry_date?: string | null
  id_issuing_country?: string | null

  // Proof documents (dates for validation)
  proof_of_address_date?: string | null
  proof_of_address_expiry?: string | null
}

interface IndividualKycDisplayProps {
  data: IndividualKycData
  onEdit?: () => void
  showEditButton?: boolean
  title?: string
  className?: string
  // Control which sections to show
  showPersonalInfo?: boolean
  showContact?: boolean
  showAddress?: boolean
  showTaxInfo?: boolean
}

// Helper to format dates
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

// Helper to build full name
function buildFullName(data: IndividualKycData): string {
  const parts = [
    data.first_name,
    data.middle_name,
    data.last_name,
    data.name_suffix,
  ].filter(Boolean)
  return parts.join(' ') || '-'
}

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

export function IndividualKycDisplay({
  data,
  onEdit,
  showEditButton = true,
  title = 'Personal KYC Information',
  className = '',
  showPersonalInfo = true,
  showContact = true,
  showAddress = true,
  showTaxInfo = true,
}: IndividualKycDisplayProps) {
  const hasAnyData =
    data.first_name ||
    data.last_name ||
    data.date_of_birth ||
    data.nationality ||
    data.residential_street

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>Personal details used for KYC verification.</CardDescription>
        </div>
        {showEditButton && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-2 self-start">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAnyData ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            <User className="h-10 w-10 mx-auto mb-3 opacity-60" />
            <p className="text-sm">No KYC information available yet.</p>
            {showEditButton && onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="mt-4">
                Add KYC Information
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Personal Information */}
            {showPersonalInfo && (
              <Section icon={User} title="Personal Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Full Name" value={buildFullName(data)} />
                  <Field
                    icon={Calendar}
                    label="Date of Birth"
                    value={formatDate(data.date_of_birth)}
                  />
                  <Field icon={Globe} label="Nationality" value={getCountryName(data.nationality)} />
                  <Field icon={Flag} label="Country of Birth" value={getCountryName(data.country_of_birth)} />
                </div>
              </Section>
            )}

            {/* Contact Information */}
            {showContact && (
              <Section icon={Phone} title="Contact Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Email" value={data.email} />
                  <Field icon={Phone} label="Mobile" value={data.phone_mobile} />
                  <Field icon={Phone} label="Office" value={data.phone_office} />
                </div>
              </Section>
            )}

            {/* Residential Address */}
            {showAddress && (
              <Section icon={MapPin} title="Residential Address">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Address Line 1" value={data.residential_street} />
                  <Field label="Address Line 2" value={data.residential_line_2} />
                  <Field label="City" value={data.residential_city} />
                  <Field label="State/Province" value={data.residential_state} />
                  <Field label="Postal Code" value={data.residential_postal_code} />
                  <Field icon={Globe} label="Country" value={getCountryName(data.residential_country)} />
                </div>
              </Section>
            )}

            {/* Tax Information */}
            {showTaxInfo && (
              <Section icon={FileText} title="Tax Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <BooleanField icon={Flag} label="US Citizen" value={data.is_us_citizen} />
                  <BooleanField icon={Building2} label="US Taxpayer" value={data.is_us_taxpayer} />
                  {data.is_us_taxpayer && (
                    <Field label="US Taxpayer ID" value={data.us_taxpayer_id} />
                  )}
                  <Field
                    icon={Globe}
                    label="Country of Tax Residency"
                    value={getCountryName(data.country_of_tax_residency)}
                  />
                  {data.tax_id_number && (
                    <Field label="Tax ID Number" value={data.tax_id_number} />
                  )}
                </div>
              </Section>
            )}

          </div>
        )}
      </CardContent>
    </Card>
  )
}
