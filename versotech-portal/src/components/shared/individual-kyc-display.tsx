'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Phone,
  MapPin,
  FileText,
  IdCard,
  Calendar,
  Globe,
  Flag,
  Building2,
  Edit,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

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
  showIdentification?: boolean
  showProofDates?: boolean
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

// Helper to format ID type
function formatIdType(idType: string | null | undefined): string {
  if (!idType) return '-'
  const types: Record<string, string> = {
    passport: 'Passport',
    national_id: 'National ID',
    drivers_license: "Driver's License",
    residence_permit: 'Residence Permit',
  }
  return types[idType] || idType
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

// Helper to build full address
function buildFullAddress(data: IndividualKycData): string {
  const parts = [
    data.residential_street,
    data.residential_line_2,
    [data.residential_city, data.residential_state, data.residential_postal_code]
      .filter(Boolean)
      .join(', '),
    data.residential_country,
  ].filter(Boolean)
  return parts.join('\n') || '-'
}

// Field display component
function Field({
  icon: Icon,
  label,
  value,
  className = '',
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground break-words">
          {value || '-'}
        </div>
      </div>
    </div>
  )
}

// Boolean field with badge
function BooleanField({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value: boolean | null | undefined
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <Badge
          variant="outline"
          className={
            value
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
          }
        >
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
  showIdentification = true,
  showProofDates = true,
}: IndividualKycDisplayProps) {
  const hasAnyData =
    data.first_name ||
    data.last_name ||
    data.date_of_birth ||
    data.nationality ||
    data.residential_street ||
    data.id_number

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          {title}
        </CardTitle>
        {showEditButton && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!hasAnyData ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No KYC information available</p>
            {showEditButton && onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="mt-4">
                Add KYC Information
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personal Information */}
            {showPersonalInfo && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Full Name" value={buildFullName(data)} />
                  <Field
                    icon={Calendar}
                    label="Date of Birth"
                    value={formatDate(data.date_of_birth)}
                  />
                  <Field icon={Globe} label="Nationality" value={data.nationality} />
                  <Field icon={Flag} label="Country of Birth" value={data.country_of_birth} />
                </div>
              </div>
            )}

            {/* Contact Information */}
            {showContact && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field icon={Phone} label="Mobile" value={data.phone_mobile} />
                  <Field icon={Phone} label="Office" value={data.phone_office} />
                  {data.email && <Field label="Email" value={data.email} />}
                </div>
              </div>
            )}

            {/* Residential Address */}
            {showAddress && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Residential Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Street Address" value={data.residential_street} />
                  <Field label="Address Line 2" value={data.residential_line_2} />
                  <Field label="City" value={data.residential_city} />
                  <Field label="State/Province" value={data.residential_state} />
                  <Field label="Postal Code" value={data.residential_postal_code} />
                  <Field icon={Globe} label="Country" value={data.residential_country} />
                </div>
              </div>
            )}

            {/* Tax Information */}
            {showTaxInfo && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tax Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <BooleanField icon={Flag} label="US Citizen" value={data.is_us_citizen} />
                  <BooleanField icon={Building2} label="US Taxpayer" value={data.is_us_taxpayer} />
                  {data.is_us_taxpayer && (
                    <Field label="US Taxpayer ID" value={data.us_taxpayer_id} />
                  )}
                  <Field
                    icon={Globe}
                    label="Country of Tax Residency"
                    value={data.country_of_tax_residency}
                  />
                  {data.tax_id_number && (
                    <Field label="Tax ID Number" value={data.tax_id_number} />
                  )}
                </div>
              </div>
            )}

            {/* Identification Document */}
            {showIdentification && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
                  Identification Document
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field icon={IdCard} label="ID Type" value={formatIdType(data.id_type)} />
                  <Field label="ID Number" value={data.id_number} />
                  <Field
                    icon={Calendar}
                    label="Issue Date"
                    value={formatDate(data.id_issue_date)}
                  />
                  <Field
                    icon={Calendar}
                    label="Expiry Date"
                    value={formatDate(data.id_expiry_date)}
                  />
                  <Field icon={Globe} label="Issuing Country" value={data.id_issuing_country} />
                </div>
              </div>
            )}

            {/* Proof Document Dates */}
            {showProofDates && data.proof_of_address_date && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Proof Document Validation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <Field
                    icon={Calendar}
                    label="Proof of Address Date"
                    value={formatDate(data.proof_of_address_date)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
