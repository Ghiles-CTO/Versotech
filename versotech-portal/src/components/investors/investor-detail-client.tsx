'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Globe, Building2, Calendar, User, DollarSign, FileText, Banknote, Users, Activity } from 'lucide-react'
import { InvestorDetailActions } from '@/components/investors/investor-detail-actions'
import { PortalUsersSection } from '@/components/investors/portal-users-section'
import { SubscriptionsTab } from '@/components/investors/subscriptions-tab'
import { ActivityTimelineWrapper } from '@/components/investors/activity-timeline-wrapper'
import { KYCDocumentsTab } from '@/components/shared/kyc-documents-tab'
import { BankDetailsTab } from '@/components/shared/bank-details-tab'
import { IndividualKycDisplay, EntityKYCEditDialog } from '@/components/shared'
import { StaffEntityMembersTab } from '@/components/staff/shared/staff-entity-members-tab'

type InvestorDetail = {
  id: string
  legal_name: string
  display_name: string | null
  type: string
  email: string | null
  phone: string | null
  country: string | null
  country_of_incorporation: string | null
  tax_residency: string | null
  kyc_status: string
  status: string
  onboarding_status: string
  aml_risk_rating: string | null
  is_pep: boolean
  is_sanctioned: boolean
  created_at: string
  primary_rm_profile: {
    id: string
    display_name: string
    email: string
  } | null
  investor_users: Array<{
    user_id: string
    profiles: {
      id: string
      display_name: string
      email: string
      title: string
      role: string
    } | null
  }>
  // Individual KYC fields
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  name_suffix?: string | null
  date_of_birth?: string | null
  country_of_birth?: string | null
  nationality?: string | null
  phone_mobile?: string | null
  phone_office?: string | null
  // US Tax compliance
  is_us_citizen?: boolean | null
  is_us_taxpayer?: boolean | null
  us_taxpayer_id?: string | null
  country_of_tax_residency?: string | null
  // ID Document
  id_type?: string | null
  id_number?: string | null
  id_issue_date?: string | null
  id_expiry_date?: string | null
  id_issuing_country?: string | null
  // Residential Address
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

type CapitalMetrics = {
  total_commitment: number
  total_contributed: number
  total_distributed: number
  unfunded_commitment: number
  current_nav: number
  vehicle_count: number
}

interface InvestorDetailClientProps {
  investor: InvestorDetail
  capitalMetrics: CapitalMetrics
  metricsAvailable?: boolean
}

export function InvestorDetailClient({ investor, capitalMetrics, metricsAvailable }: InvestorDetailClientProps) {
  const [tabsReady, setTabsReady] = useState(false)
  const [kycDialogOpen, setKycDialogOpen] = useState(false)
  const hasMetrics = metricsAvailable !== false

  useEffect(() => {
    setTabsReady(true)
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/versotech_main/users">
            <Button variant="ghost" size="sm" className="bg-gray-800 text-white hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {investor.legal_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Investor ID: {investor.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <InvestorDetailActions investor={investor} />
      </div>

      {/* Status Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant={investor.kyc_status === 'completed' || investor.kyc_status === 'approved' ? 'default' : 'secondary'}>
          KYC: {investor.kyc_status}
        </Badge>
        <Badge variant={investor.status === 'active' ? 'default' : 'secondary'}>
          {investor.status}
        </Badge>
        <Badge variant="outline" className="capitalize">
          {investor.type}
        </Badge>
        {investor.aml_risk_rating && (
          <Badge variant={investor.aml_risk_rating === 'low' ? 'default' : investor.aml_risk_rating === 'high' ? 'destructive' : 'secondary'}>
            Risk: {investor.aml_risk_rating}
          </Badge>
        )}
        {investor.is_pep && (
          <Badge variant="destructive">PEP</Badge>
        )}
      </div>

      {/* Capital Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={hasMetrics ? "text-2xl font-bold text-foreground" : "text-2xl font-semibold text-muted-foreground"}>
              {hasMetrics
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.total_commitment)
                : 'Pending'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {hasMetrics ? (
                capitalMetrics.vehicle_count > 0 ? (
                  <>Across {capitalMetrics.vehicle_count} vehicle{capitalMetrics.vehicle_count !== 1 ? 's' : ''}</>
                ) : (
                  <>No subscriptions yet</>
                )
              ) : (
                <>Metrics pending</>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contributed / Unfunded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={hasMetrics ? "text-2xl font-bold text-green-400" : "text-2xl font-semibold text-muted-foreground"}>
              {hasMetrics
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.total_contributed)
                : 'Pending'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {hasMetrics
                ? <>Unfunded: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.unfunded_commitment)}</>
                : <>Metrics pending</>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current NAV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={hasMetrics ? "text-2xl font-bold text-blue-400" : "text-2xl font-semibold text-muted-foreground"}>
              {hasMetrics
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.current_nav)
                : 'Pending'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {hasMetrics
                ? <>Distributed: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.total_distributed)}</>
                : <>Metrics pending</>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      {tabsReady ? (
      <Tabs defaultValue="overview" className="space-y-6" id={`investor-tabs-${investor.id}`}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger value="kyc" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">KYC Documents</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="gap-2">
            <Banknote className="h-4 w-4" />
            <span className="hidden sm:inline">Bank Details</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Portal Users</span>
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
                {investor.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="text-sm font-medium">{investor.email}</div>
                    </div>
                  </div>
                )}
                {investor.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="text-sm font-medium">{investor.phone}</div>
                    </div>
                  </div>
                )}
                {investor.country && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Country</div>
                      <div className="text-sm font-medium">{investor.country}</div>
                    </div>
                  </div>
                )}
                {investor.primary_rm_profile && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Relationship Manager</div>
                      <div className="text-sm font-medium">{investor.primary_rm_profile.display_name}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Entity Information */}
            <Card>
              <CardHeader>
                <CardTitle>Entity Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {investor.display_name && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Display Name</div>
                      <div className="text-sm font-medium">{investor.display_name}</div>
                    </div>
                  </div>
                )}
                {investor.country_of_incorporation && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Country of Incorporation</div>
                      <div className="text-sm font-medium">{investor.country_of_incorporation}</div>
                    </div>
                  </div>
                )}
                {investor.tax_residency && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Tax Residency</div>
                      <div className="text-sm font-medium">{investor.tax_residency}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Created</div>
                    <div className="text-sm font-medium">
                      {new Date(investor.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Individual KYC Information (for individual investors) */}
          {investor.type === 'individual' && (
            <IndividualKycDisplay
              data={{
                first_name: investor.first_name,
                middle_name: investor.middle_name,
                last_name: investor.last_name,
                name_suffix: investor.name_suffix,
                date_of_birth: investor.date_of_birth,
                country_of_birth: investor.country_of_birth,
                nationality: investor.nationality,
                email: investor.email,
                phone_mobile: investor.phone_mobile,
                phone_office: investor.phone_office,
                residential_street: investor.residential_street,
                residential_line_2: investor.residential_line_2,
                residential_city: investor.residential_city,
                residential_state: investor.residential_state,
                residential_postal_code: investor.residential_postal_code,
                residential_country: investor.residential_country,
                is_us_citizen: investor.is_us_citizen,
                is_us_taxpayer: investor.is_us_taxpayer,
                us_taxpayer_id: investor.us_taxpayer_id,
                country_of_tax_residency: investor.country_of_tax_residency,
                id_type: investor.id_type,
                id_number: investor.id_number,
                id_issue_date: investor.id_issue_date,
                id_expiry_date: investor.id_expiry_date,
                id_issuing_country: investor.id_issuing_country,
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
            entityType="investor"
            entityId={investor.id}
            entityName={investor.legal_name}
          />
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <SubscriptionsTab investorId={investor.id} />
        </TabsContent>

        {/* KYC Documents Tab */}
        <TabsContent value="kyc">
          <KYCDocumentsTab
            entityType="investor"
            entityId={investor.id}
            entityName={investor.legal_name}
          />
        </TabsContent>

        {/* Bank Details Tab */}
        <TabsContent value="bank">
          <BankDetailsTab
            entityType="investor"
            entityId={investor.id}
            entityName={investor.legal_name}
          />
        </TabsContent>

        {/* Portal Users Tab */}
        <TabsContent value="users">
          <PortalUsersSection
            investorId={investor.id}
            users={investor.investor_users || []}
          />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <ActivityTimelineWrapper investorId={investor.id} />
        </TabsContent>
      </Tabs>
      ) : (
        <div className="space-y-4">
          <div className="h-10 rounded-md bg-muted/50" />
          <div className="h-64 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20" />
        </div>
      )}

      {/* KYC Edit Dialog */}
      {investor.type === 'individual' && (
        <EntityKYCEditDialog
          open={kycDialogOpen}
          onOpenChange={setKycDialogOpen}
          entityType="investor"
          entityId={investor.id}
          entityName={investor.legal_name}
          apiEndpoint={`/api/staff/investors/${investor.id}`}
          initialData={{
            first_name: investor.first_name ?? undefined,
            middle_name: investor.middle_name ?? undefined,
            last_name: investor.last_name ?? undefined,
            name_suffix: investor.name_suffix ?? undefined,
            date_of_birth: investor.date_of_birth ?? undefined,
            country_of_birth: investor.country_of_birth ?? undefined,
            nationality: investor.nationality ?? undefined,
            email: investor.email ?? undefined,
            phone_mobile: investor.phone_mobile ?? undefined,
            phone_office: investor.phone_office ?? undefined,
            residential_street: investor.residential_street ?? undefined,
            residential_line_2: investor.residential_line_2 ?? undefined,
            residential_city: investor.residential_city ?? undefined,
            residential_state: investor.residential_state ?? undefined,
            residential_postal_code: investor.residential_postal_code ?? undefined,
            residential_country: investor.residential_country ?? undefined,
            is_us_citizen: investor.is_us_citizen ?? undefined,
            is_us_taxpayer: investor.is_us_taxpayer ?? undefined,
            us_taxpayer_id: investor.us_taxpayer_id ?? undefined,
            country_of_tax_residency: investor.country_of_tax_residency ?? undefined,
            id_type: investor.id_type ?? undefined,
            id_number: investor.id_number ?? undefined,
            id_issue_date: investor.id_issue_date ?? undefined,
            id_expiry_date: investor.id_expiry_date ?? undefined,
            id_issuing_country: investor.id_issuing_country ?? undefined,
          }}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
