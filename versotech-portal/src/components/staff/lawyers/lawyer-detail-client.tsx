'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  FileText,
  Banknote,
  Users,
  Activity,
  Shield,
  Briefcase,
  Scale,
  Edit,
  UserPlus,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'
import { KYCDocumentsTab } from '@/components/shared/kyc-documents-tab'
import { BankDetailsTab } from '@/components/shared/bank-details-tab'
import { ActivityTimelineTab } from '@/components/shared/activity-timeline-tab'
import { IndividualKycDisplay, EntityKYCEditDialog } from '@/components/shared'
import { StaffEntityMembersTab } from '@/components/staff/shared/staff-entity-members-tab'
import { EditLawyerDialog } from '@/components/staff/lawyers/edit-lawyer-dialog'
import { InviteUserDialog } from '@/components/users/invite-user-dialog'
import { formatDate } from '@/lib/format'
import { statusStyles, kycStyles, getStatusStyle } from '@/lib/status-styles'

type LawyerDetail = {
  id: string
  firm_name: string
  display_name: string
  legal_entity_type: string | null
  registration_number: string | null
  tax_id: string | null
  primary_contact_name: string | null
  primary_contact_email: string | null
  primary_contact_phone: string | null
  street_address: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string | null
  specializations: string[] | null
  is_active: boolean
  onboarded_at: string | null
  created_at: string | null
  created_by: string | null
  updated_at: string | null
  logo_url: string | null
  kyc_status: string | null
  kyc_approved_at: string | null
  kyc_approved_by: string | null
  kyc_expires_at: string | null
  kyc_notes: string | null
  assigned_deals: string[] | null
  // Entity type (individual vs entity)
  type?: string | null
  // Individual KYC fields
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  name_suffix?: string | null
  date_of_birth?: string | null
  country_of_birth?: string | null
  nationality?: string | null
  email?: string | null
  phone_mobile?: string | null
  phone_office?: string | null
  is_us_citizen?: boolean | null
  is_us_taxpayer?: boolean | null
  us_taxpayer_id?: string | null
  country_of_tax_residency?: string | null
  id_type?: string | null
  id_number?: string | null
  id_issue_date?: string | null
  id_expiry_date?: string | null
  id_issuing_country?: string | null
  residential_street?: string | null
  residential_line_2?: string | null
  residential_city?: string | null
  residential_state?: string | null
  residential_postal_code?: string | null
  residential_country?: string | null
  // New KYC fields
  middle_initial?: string | null
  proof_of_address_date?: string | null
  proof_of_address_expiry?: string | null
  tax_id_number?: string | null
}

type LawyerMetrics = {
  totalDeals: number
  activeDeals: number
  documentCount: number
}

type Deal = {
  id: string
  name: string
  status: string
  target_amount: number | null
  created_at: string
}

interface LawyerDetailClientProps {
  lawyer: LawyerDetail
  metrics: LawyerMetrics
  deals: Deal[]
}

export function LawyerDetailClient({ lawyer, metrics, deals }: LawyerDetailClientProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [kycDialogOpen, setKycDialogOpen] = useState(false)

  const formatAddress = () => {
    const parts = [
      lawyer.street_address,
      lawyer.city,
      lawyer.state_province,
      lawyer.postal_code,
      lawyer.country,
    ].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/versotech_main/users">
            <Button variant="ghost" size="sm" className="bg-gray-800 text-white hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {lawyer.logo_url ? (
              <img
                src={lawyer.logo_url}
                alt={lawyer.firm_name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <Scale className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {lawyer.firm_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {lawyer.display_name !== lawyer.firm_name
                  ? lawyer.display_name
                  : `ID: ${lawyer.id.slice(0, 8)}`
                }
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge className={getStatusStyle(lawyer.is_active ? 'active' : 'inactive', statusStyles)}>
          {lawyer.is_active ? 'Active' : 'Inactive'}
        </Badge>
        <Badge className={getStatusStyle(lawyer.kyc_status, kycStyles)}>
          KYC: {lawyer.kyc_status || 'draft'}
        </Badge>
        {lawyer.legal_entity_type && (
          <Badge variant="outline">
            {lawyer.legal_entity_type.toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Assigned Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.totalDeals}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {metrics.activeDeals} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.documentCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Uploaded</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Onboarded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {lawyer.onboarded_at ? formatDate(lawyer.onboarded_at) : '-'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Created: {lawyer.created_at ? formatDate(lawyer.created_at) : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6" id={`lawyer-tabs-${lawyer.id}`}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
          <TabsTrigger value="kyc" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">KYC Documents</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="gap-2">
            <Banknote className="h-4 w-4" />
            <span className="hidden sm:inline">Bank Details</span>
          </TabsTrigger>
          <TabsTrigger value="deals" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Deals</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lawyer.primary_contact_name && (
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Primary Contact</div>
                      <div className="text-sm font-medium">{lawyer.primary_contact_name}</div>
                    </div>
                  </div>
                )}
                {lawyer.primary_contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="text-sm font-medium">{lawyer.primary_contact_email}</div>
                    </div>
                  </div>
                )}
                {lawyer.primary_contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="text-sm font-medium">{lawyer.primary_contact_phone}</div>
                    </div>
                  </div>
                )}
                {formatAddress() && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div className="text-sm font-medium">{formatAddress()}</div>
                    </div>
                  </div>
                )}
                {!lawyer.primary_contact_name && !lawyer.primary_contact_email && !formatAddress() && (
                  <p className="text-sm text-muted-foreground">No contact information available</p>
                )}
              </CardContent>
            </Card>

            {/* Firm Details */}
            <Card>
              <CardHeader>
                <CardTitle>Firm Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lawyer.legal_entity_type && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Entity Type</div>
                      <div className="text-sm font-medium">{lawyer.legal_entity_type.toUpperCase()}</div>
                    </div>
                  </div>
                )}
                {lawyer.registration_number && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Registration Number</div>
                      <div className="text-sm font-medium">{lawyer.registration_number}</div>
                    </div>
                  </div>
                )}
                {lawyer.tax_id && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Tax ID</div>
                      <div className="text-sm font-medium">{lawyer.tax_id}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Specializations */}
          {lawyer.specializations && lawyer.specializations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lawyer.specializations.map((spec) => (
                    <Badge key={spec} variant="outline">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* KYC Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>KYC Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={getStatusStyle(lawyer.kyc_status, kycStyles)}>
                    {lawyer.kyc_status || 'draft'}
                  </Badge>
                </div>
                {lawyer.kyc_approved_at && (
                  <div>
                    <div className="text-sm text-muted-foreground">Approved At</div>
                    <div className="text-sm font-medium">{formatDate(lawyer.kyc_approved_at)}</div>
                  </div>
                )}
                {lawyer.kyc_expires_at && (
                  <div>
                    <div className="text-sm text-muted-foreground">Expires At</div>
                    <div className="text-sm font-medium">{formatDate(lawyer.kyc_expires_at)}</div>
                  </div>
                )}
              </div>
              {lawyer.kyc_notes && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Notes</div>
                  <div className="text-sm bg-white/5 rounded-lg p-3">{lawyer.kyc_notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Individual KYC Information (for individual lawyers) */}
          {lawyer.type === 'individual' && (
            <IndividualKycDisplay
              data={{
                first_name: lawyer.first_name,
                middle_name: lawyer.middle_name,
                last_name: lawyer.last_name,
                name_suffix: lawyer.name_suffix,
                date_of_birth: lawyer.date_of_birth,
                country_of_birth: lawyer.country_of_birth,
                nationality: lawyer.nationality,
                email: lawyer.email || lawyer.primary_contact_email,
                phone_mobile: lawyer.phone_mobile,
                phone_office: lawyer.phone_office,
                residential_street: lawyer.residential_street,
                residential_line_2: lawyer.residential_line_2,
                residential_city: lawyer.residential_city,
                residential_state: lawyer.residential_state,
                residential_postal_code: lawyer.residential_postal_code,
                residential_country: lawyer.residential_country,
                is_us_citizen: lawyer.is_us_citizen,
                is_us_taxpayer: lawyer.is_us_taxpayer,
                us_taxpayer_id: lawyer.us_taxpayer_id,
                country_of_tax_residency: lawyer.country_of_tax_residency,
                id_type: lawyer.id_type,
                id_number: lawyer.id_number,
                id_issue_date: lawyer.id_issue_date,
                id_expiry_date: lawyer.id_expiry_date,
                id_issuing_country: lawyer.id_issuing_country,
                // Additional KYC fields
                middle_initial: lawyer.middle_initial,
                proof_of_address_date: lawyer.proof_of_address_date,
                proof_of_address_expiry: lawyer.proof_of_address_expiry,
                tax_id_number: lawyer.tax_id_number,
              }}
              showEditButton={true}
              onEdit={() => setKycDialogOpen(true)}
              title="Personal KYC Information"
            />
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <StaffEntityMembersTab
            entityType="lawyer"
            entityId={lawyer.id}
            entityName={lawyer.firm_name}
          />
        </TabsContent>

        {/* KYC Documents Tab */}
        <TabsContent value="kyc">
          <KYCDocumentsTab
            entityType="lawyer"
            entityId={lawyer.id}
            entityName={lawyer.firm_name}
          />
        </TabsContent>

        {/* Bank Details Tab */}
        <TabsContent value="bank">
          <BankDetailsTab
            entityType="lawyer"
            entityId={lawyer.id}
            entityName={lawyer.firm_name}
          />
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Deals</CardTitle>
              <CardDescription>
                Deals where {lawyer.firm_name} is assigned as legal counsel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No deals assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/versotech_main/deals/${deal.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                        <div>
                          <div className="font-medium text-foreground">{deal.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Created: {formatDate(deal.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{deal.status}</Badge>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <ActivityTimelineTab
            entityType="lawyer"
            entityId={lawyer.id}
            entityName={lawyer.firm_name}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditLawyerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        lawyer={lawyer}
      />

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        entityType="lawyer"
        entityId={lawyer.id}
        entityName={lawyer.firm_name}
      />

      {lawyer.type === 'individual' && (
        <EntityKYCEditDialog
          open={kycDialogOpen}
          onOpenChange={setKycDialogOpen}
          entityType="lawyer"
          entityId={lawyer.id}
          entityName={lawyer.firm_name}
          apiEndpoint={`/api/admin/lawyers/${lawyer.id}`}
          initialData={{
            first_name: lawyer.first_name ?? undefined,
            middle_name: lawyer.middle_name ?? undefined,
            last_name: lawyer.last_name ?? undefined,
            name_suffix: lawyer.name_suffix ?? undefined,
            date_of_birth: lawyer.date_of_birth ?? undefined,
            country_of_birth: lawyer.country_of_birth ?? undefined,
            nationality: lawyer.nationality ?? undefined,
            email: (lawyer.email || lawyer.primary_contact_email) ?? undefined,
            phone_mobile: lawyer.phone_mobile ?? undefined,
            phone_office: lawyer.phone_office ?? undefined,
            residential_street: lawyer.residential_street ?? undefined,
            residential_line_2: lawyer.residential_line_2 ?? undefined,
            residential_city: lawyer.residential_city ?? undefined,
            residential_state: lawyer.residential_state ?? undefined,
            residential_postal_code: lawyer.residential_postal_code ?? undefined,
            residential_country: lawyer.residential_country ?? undefined,
            is_us_citizen: lawyer.is_us_citizen ?? undefined,
            is_us_taxpayer: lawyer.is_us_taxpayer ?? undefined,
            us_taxpayer_id: lawyer.us_taxpayer_id ?? undefined,
            country_of_tax_residency: lawyer.country_of_tax_residency ?? undefined,
            id_type: lawyer.id_type ?? undefined,
            id_number: lawyer.id_number ?? undefined,
            id_issue_date: lawyer.id_issue_date ?? undefined,
            id_expiry_date: lawyer.id_expiry_date ?? undefined,
            id_issuing_country: lawyer.id_issuing_country ?? undefined,
            // Additional KYC fields
            middle_initial: lawyer.middle_initial ?? undefined,
            proof_of_address_date: lawyer.proof_of_address_date ?? undefined,

            tax_id_number: lawyer.tax_id_number ?? undefined,
          }}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
