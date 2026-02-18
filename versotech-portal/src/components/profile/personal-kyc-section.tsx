'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  User,
  Edit,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Globe,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { MemberKYCEditDialog } from '@/components/shared/member-kyc-edit-dialog'

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

// KYC Status badges
const KYC_STATUS_BADGES: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Send },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
}

interface PersonalKYCSectionProps {
  memberData: MemberKYCData | null
  entityType: 'investor' | 'partner' | 'introducer' | 'lawyer' | 'commercial_partner' | 'arranger'
  entityId: string
  onRefresh?: () => void
}

export function PersonalKYCSection({
  memberData,
  entityType,
  entityId,
  onRefresh,
}: PersonalKYCSectionProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const statusBadge = KYC_STATUS_BADGES[memberData?.kyc_status || 'pending'] || KYC_STATUS_BADGES.pending
  const StatusIcon = statusBadge.icon

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
      memberData.residential_country,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }

  // Check if personal info is complete enough to submit
  const isInfoComplete = memberData && (
    memberData.first_name &&
    memberData.last_name &&
    memberData.date_of_birth &&
    memberData.nationality &&
    memberData.residential_street &&
    memberData.residential_country &&
    memberData.id_type &&
    memberData.id_number
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

      toast.success('Personal KYC submitted for review')
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
            <Badge className={statusBadge.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusBadge.label}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <User className="h-4 w-4" />
                Identity
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Full Name</Label>
                  <div className="font-medium">
                    {[memberData.first_name, memberData.middle_name, memberData.last_name, memberData.name_suffix]
                      .filter(Boolean)
                      .join(' ') || '-'}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Date of Birth</Label>
                  <div className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {formatDate(memberData.date_of_birth)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Nationality</Label>
                  <div className="font-medium flex items-center gap-1">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    {memberData.nationality || '-'}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Country of Birth</Label>
                  <div className="font-medium">{memberData.country_of_birth || '-'}</div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact
              </h4>
              <div className="space-y-3">
                {memberData.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{memberData.email}</span>
                  </div>
                )}
                {(memberData.phone || memberData.phone_mobile) && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{memberData.phone_mobile || memberData.phone}</span>
                  </div>
                )}
                {getFullAddress() && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{getFullAddress()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ID Document & Tax Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            {/* ID Document */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                ID Document
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Document Type</Label>
                  <div className="font-medium capitalize">
                    {memberData.id_type?.replace(/_/g, ' ') || '-'}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Document Number</Label>
                  <div className="font-medium">{memberData.id_number || '-'}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Issue Date</Label>
                  <div className="font-medium">{formatDate(memberData.id_issue_date)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Expiry Date</Label>
                  <div className="font-medium">{formatDate(memberData.id_expiry_date)}</div>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground text-xs">Issuing Country</Label>
                  <div className="font-medium">{memberData.id_issuing_country || '-'}</div>
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tax Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">US Citizen</Label>
                  <div className="font-medium">{memberData.is_us_citizen ? 'Yes' : 'No'}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">US Taxpayer</Label>
                  <div className="font-medium">{memberData.is_us_taxpayer ? 'Yes' : 'No'}</div>
                </div>
                {memberData.is_us_taxpayer && memberData.us_taxpayer_id && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground text-xs">US Taxpayer ID</Label>
                    <div className="font-medium">{memberData.us_taxpayer_id}</div>
                  </div>
                )}
                <div className="col-span-2">
                  <Label className="text-muted-foreground text-xs">Tax Residency</Label>
                  <div className="font-medium">{memberData.country_of_tax_residency || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {memberData.kyc_status !== 'submitted' && (
            <div className="pt-4 border-t">
              {isInfoComplete ? (
                <Button onClick={handleSubmitForReview} disabled={isSubmitting}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : memberData.kyc_status === 'approved' ? 'Re-submit for Review' : 'Submit for Review'}
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button disabled variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Review
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Please complete all required fields before submitting
                  </span>
                </div>
              )}
            </div>
          )}

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
          first_name: memberData.first_name || '',
          middle_name: memberData.middle_name,
          last_name: memberData.last_name || '',
          name_suffix: memberData.name_suffix,
          date_of_birth: memberData.date_of_birth,
          country_of_birth: memberData.country_of_birth,
          nationality: memberData.nationality,
          email: memberData.email,
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
          id_type: memberData.id_type,
          id_number: memberData.id_number,
          id_issue_date: memberData.id_issue_date,
          id_expiry_date: memberData.id_expiry_date,
          id_issuing_country: memberData.id_issuing_country,
        }}
        apiEndpoint={`/api/${entityType}s/me/members`}
        onSuccess={() => {
          setShowEditDialog(false)
          onRefresh?.()
        }}
        mode="edit"
      />
    </>
  )
}
