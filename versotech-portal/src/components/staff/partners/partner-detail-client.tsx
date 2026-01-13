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
  DollarSign,
  Edit,
  UserPlus,
  Globe,
  ExternalLink,
  FileCheck,
  User,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { KYCDocumentsTab } from '@/components/shared/kyc-documents-tab'
import { BankDetailsTab } from '@/components/shared/bank-details-tab'
import { ActivityTimelineTab } from '@/components/shared/activity-timeline-tab'
import { IndividualKycDisplay, EntityKYCEditDialog } from '@/components/shared'
import { StaffEntityMembersTab } from '@/components/staff/shared/staff-entity-members-tab'
import { EditPartnerDialog } from '@/components/staff/partners/edit-partner-dialog'
import { InviteUserDialog } from '@/components/users/invite-user-dialog'
import { formatCurrency, formatDate } from '@/lib/format'
import { statusStyles, kycStyles, getStatusStyle } from '@/lib/status-styles'

type PartnerDetail = {
  id: string
  name: string
  legal_name: string | null
  type: string
  partner_type: string
  status: string
  accreditation_status: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  typical_investment_min: number | null
  typical_investment_max: number | null
  preferred_sectors: string[] | null
  preferred_geographies: string[] | null
  relationship_manager_id: string | null
  notes: string | null
  created_at: string | null
  created_by: string | null
  updated_at: string | null
  kyc_status: string | null
  kyc_approved_at: string | null
  kyc_approved_by: string | null
  kyc_expires_at: string | null
  kyc_notes: string | null
  logo_url: string | null
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

type PartnerMetrics = {
  documentCount: number
}

type PartnerFeePlan = {
  id: string
  name: string
  status: 'draft' | 'sent' | 'pending_signature' | 'accepted' | 'rejected'
  is_active: boolean
  accepted_at: string | null
  accepted_by: string | null
  created_at: string
  updated_at: string
  deal: {
    id: string
    name: string
    status: string
  } | null
  term_sheet: {
    id: string
    version: number
    status: string
  } | null
  investor_count: number
}

type ReferredInvestor = {
  id: string
  investor_id: string | null
  user_id: string | null
  role: string
  invited_at: string | null
  accepted_at: string | null
  profile: {
    id: string
    display_name: string | null
    email: string | null
  } | null
  investor: {
    id: string
    legal_name: string
    type: string | null
  } | null
  deal: {
    id: string
    name: string
    status: string
  } | null
  fee_plan: {
    id: string
    name: string
    status: string
  } | null
  subscription: {
    status: string
    amount: number | null
    funded_at: string | null
  } | null
}

interface PartnerDetailClientProps {
  partner: PartnerDetail
  metrics: PartnerMetrics
}

export function PartnerDetailClient({ partner, metrics }: PartnerDetailClientProps) {
  const router = useRouter()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [kycDialogOpen, setKycDialogOpen] = useState(false)

  // Fee Plans and Referred Investors state
  const [feePlans, setFeePlans] = useState<PartnerFeePlan[]>([])
  const [feePlansLoading, setFeePlansLoading] = useState(false)
  const [referredInvestors, setReferredInvestors] = useState<ReferredInvestor[]>([])
  const [referredInvestorsLoading, setReferredInvestorsLoading] = useState(false)

  // Fetch fee plans for this partner
  const fetchFeePlans = useCallback(async () => {
    setFeePlansLoading(true)
    try {
      const response = await fetch(`/api/partners/${partner.id}/fee-plans`)
      if (response.ok) {
        const data = await response.json()
        setFeePlans(data.fee_plans || [])
      }
    } catch (error) {
      console.error('Error fetching fee plans:', error)
    } finally {
      setFeePlansLoading(false)
    }
  }, [partner.id])

  // Fetch referred investors for this partner
  const fetchReferredInvestors = useCallback(async () => {
    setReferredInvestorsLoading(true)
    try {
      const response = await fetch(`/api/partners/${partner.id}/referred-investors`)
      if (response.ok) {
        const data = await response.json()
        setReferredInvestors(data.referred_investors || [])
      }
    } catch (error) {
      console.error('Error fetching referred investors:', error)
    } finally {
      setReferredInvestorsLoading(false)
    }
  }, [partner.id])

  // Load fee plans and referred investors on mount
  useEffect(() => {
    fetchFeePlans()
    fetchReferredInvestors()
  }, [fetchFeePlans, fetchReferredInvestors])

  const feePlanStatusStyles: Record<string, string> = {
    draft: 'bg-slate-500/20 text-slate-400',
    sent: 'bg-blue-500/20 text-blue-400',
    pending_signature: 'bg-purple-500/20 text-purple-400',
    accepted: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
  }

  const typeLabels: Record<string, string> = {
    'co-investor': 'Co-Investor',
    'syndicate-lead': 'Syndicate Lead',
    'family-office': 'Family Office',
    'other': 'Other',
  }

  const formatAddress = () => {
    const parts = [
      partner.address_line_1,
      partner.address_line_2,
      partner.city,
      partner.postal_code,
      partner.country,
    ].filter(Boolean)
    return parts.join(', ')
  }

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
          <div className="flex items-center gap-3">
            {partner.logo_url ? (
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {partner.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {typeLabels[partner.partner_type] || partner.partner_type}
                {partner.country && ` • ${partner.country}`}
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
        <Badge className={getStatusStyle(partner.status, statusStyles)}>
          {partner.status}
        </Badge>
        <Badge className={getStatusStyle(partner.kyc_status, kycStyles)}>
          KYC: {partner.kyc_status || 'draft'}
        </Badge>
        <Badge variant="outline">
          {partner.type === 'entity' ? 'Entity' : 'Individual'}
        </Badge>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Investment Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {partner.typical_investment_min && partner.typical_investment_max ? (
                <>
                  {formatCurrency(partner.typical_investment_min)} - {formatCurrency(partner.typical_investment_max)}
                </>
              ) : (
                '-'
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Typical investment</div>
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
              Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {partner.created_at ? formatDate(partner.created_at) : '-'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Registration date</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6" id={`partner-tabs-${partner.id}`}>
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
          <TabsTrigger value="fee-plans" className="gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Fee Plans</span>
          </TabsTrigger>
          <TabsTrigger value="referred-investors" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Investors</span>
          </TabsTrigger>
          <TabsTrigger value="kyc" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">KYC</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="gap-2">
            <Banknote className="h-4 w-4" />
            <span className="hidden sm:inline">Bank</span>
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
                {partner.contact_name && (
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Primary Contact</div>
                      <div className="text-sm font-medium">{partner.contact_name}</div>
                    </div>
                  </div>
                )}
                {partner.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="text-sm font-medium">{partner.contact_email}</div>
                    </div>
                  </div>
                )}
                {partner.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="text-sm font-medium">{partner.contact_phone}</div>
                    </div>
                  </div>
                )}
                {partner.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Website</div>
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        {partner.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
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
                {!partner.contact_name && !partner.contact_email && !formatAddress() && (
                  <p className="text-sm text-muted-foreground">No contact information available</p>
                )}
              </CardContent>
            </Card>

            {/* Partner Details */}
            <Card>
              <CardHeader>
                <CardTitle>Partner Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {partner.legal_name && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Legal Name</div>
                      <div className="text-sm font-medium">{partner.legal_name}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Partner Type</div>
                    <div className="text-sm font-medium">
                      {typeLabels[partner.partner_type] || partner.partner_type}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Entity Type</div>
                    <div className="text-sm font-medium">
                      {partner.type === 'entity' ? 'Entity' : 'Individual'}
                    </div>
                  </div>
                </div>
                {partner.accreditation_status && (
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Accreditation</div>
                      <div className="text-sm font-medium">{partner.accreditation_status}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Investment Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Investment Range</div>
                  <div className="text-sm font-medium">
                    {partner.typical_investment_min && partner.typical_investment_max ? (
                      <>
                        {formatCurrency(partner.typical_investment_min)} - {formatCurrency(partner.typical_investment_max)}
                      </>
                    ) : (
                      'Not specified'
                    )}
                  </div>
                </div>
              </div>
              {partner.preferred_sectors && partner.preferred_sectors.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Preferred Sectors</div>
                  <div className="flex flex-wrap gap-2">
                    {partner.preferred_sectors.map((sector) => (
                      <Badge key={sector} variant="outline">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {partner.preferred_geographies && partner.preferred_geographies.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Preferred Geographies</div>
                  <div className="flex flex-wrap gap-2">
                    {partner.preferred_geographies.map((geo) => (
                      <Badge key={geo} variant="outline">
                        {geo}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {partner.notes && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Notes</div>
                  <div className="text-sm bg-white/5 rounded-lg p-3">{partner.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* KYC Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>KYC Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={getStatusStyle(partner.kyc_status, kycStyles)}>
                    {partner.kyc_status || 'draft'}
                  </Badge>
                </div>
                {partner.kyc_approved_at && (
                  <div>
                    <div className="text-sm text-muted-foreground">Approved At</div>
                    <div className="text-sm font-medium">{formatDate(partner.kyc_approved_at)}</div>
                  </div>
                )}
                {partner.kyc_expires_at && (
                  <div>
                    <div className="text-sm text-muted-foreground">Expires At</div>
                    <div className="text-sm font-medium">{formatDate(partner.kyc_expires_at)}</div>
                  </div>
                )}
              </div>
              {partner.kyc_notes && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Notes</div>
                  <div className="text-sm bg-white/5 rounded-lg p-3">{partner.kyc_notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Individual KYC Information (for individual partners) */}
          {partner.type === 'individual' && (
            <IndividualKycDisplay
              data={{
                first_name: partner.first_name,
                middle_name: partner.middle_name,
                last_name: partner.last_name,
                name_suffix: partner.name_suffix,
                date_of_birth: partner.date_of_birth,
                country_of_birth: partner.country_of_birth,
                nationality: partner.nationality,
                email: partner.contact_email,
                phone_mobile: partner.phone_mobile,
                phone_office: partner.phone_office,
                residential_street: partner.residential_street,
                residential_line_2: partner.residential_line_2,
                residential_city: partner.residential_city,
                residential_state: partner.residential_state,
                residential_postal_code: partner.residential_postal_code,
                residential_country: partner.residential_country,
                is_us_citizen: partner.is_us_citizen,
                is_us_taxpayer: partner.is_us_taxpayer,
                us_taxpayer_id: partner.us_taxpayer_id,
                country_of_tax_residency: partner.country_of_tax_residency,
                id_type: partner.id_type,
                id_number: partner.id_number,
                id_issue_date: partner.id_issue_date,
                id_expiry_date: partner.id_expiry_date,
                id_issuing_country: partner.id_issuing_country,
                // Additional KYC fields
                middle_initial: partner.middle_initial,
                proof_of_address_date: partner.proof_of_address_date,
                proof_of_address_expiry: partner.proof_of_address_expiry,
                tax_id_number: partner.tax_id_number,
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
            entityType="partner"
            entityId={partner.id}
            entityName={partner.name}
          />
        </TabsContent>

        {/* Fee Plans Tab */}
        <TabsContent value="fee-plans">
          <Card>
            <CardHeader>
              <CardTitle>Fee Plans</CardTitle>
              <CardDescription>
                All fee plans linked to {partner.name} across deals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feePlansLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : feePlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 mb-4">
                    <FileCheck className="h-10 w-10 text-blue-400/60" />
                  </div>
                  <p className="text-muted-foreground mb-1">No fee plans yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    Fee plans will appear here when created from deals
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feePlans.map((feePlan) => (
                    <div
                      key={feePlan.id}
                      className="group flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer"
                      onClick={() => feePlan.deal?.id && router.push(`/versotech_main/deals/${feePlan.deal.id}?tab=fees`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg ${feePlan.status === 'accepted' ? 'bg-green-500/20' : 'bg-slate-500/20'}`}>
                          <FileCheck className={`h-5 w-5 ${feePlan.status === 'accepted' ? 'text-green-400' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{feePlan.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                            <Briefcase className="h-3 w-3" />
                            {feePlan.deal?.name || 'Unknown Deal'}
                            {feePlan.term_sheet && (
                              <span className="text-xs text-muted-foreground/70">
                                • Term Sheet v{feePlan.term_sheet.version}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {feePlan.investor_count > 0 && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {feePlan.investor_count}
                          </div>
                        )}
                        <Badge className={feePlanStatusStyles[feePlan.status] || 'bg-gray-500/20 text-gray-400'}>
                          {feePlan.status}
                        </Badge>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referred Investors Tab */}
        <TabsContent value="referred-investors">
          <Card>
            <CardHeader>
              <CardTitle>Referred Investors</CardTitle>
              <CardDescription>
                Investors dispatched through {partner.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referredInvestorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : referredInvestors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-4">
                    <Users className="h-10 w-10 text-purple-400/60" />
                  </div>
                  <p className="text-muted-foreground mb-1">No referred investors yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    Investors dispatched through this partner will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referredInvestors.map((refInvestor) => (
                    <div
                      key={refInvestor.id}
                      className="group flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer"
                      onClick={() => {
                      if (refInvestor.deal?.id) {
                        router.push(`/versotech_main/deals/${refInvestor.deal.id}?tab=members`)
                      } else if (refInvestor.investor?.id) {
                        router.push(`/versotech_main/investors/${refInvestor.investor.id}`)
                      }
                    }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-lg bg-purple-500/20">
                          <User className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {refInvestor.investor?.legal_name || refInvestor.profile?.display_name || refInvestor.profile?.email || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                            <Briefcase className="h-3 w-3" />
                            {refInvestor.deal?.name || 'Unknown Deal'}
                            {refInvestor.fee_plan && (
                              <span className="text-xs text-muted-foreground/70">
                                • {refInvestor.fee_plan.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {refInvestor.subscription?.amount && (
                          <div className="text-sm font-medium text-foreground">
                            {formatCurrency(refInvestor.subscription.amount)}
                          </div>
                        )}
                        <Badge className={
                          refInvestor.subscription?.status === 'funded'
                            ? 'bg-green-500/20 text-green-400'
                            : refInvestor.subscription?.status
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                        }>
                          {refInvestor.subscription?.status || 'Invited'}
                        </Badge>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Documents Tab */}
        <TabsContent value="kyc">
          <KYCDocumentsTab
            entityType="partner"
            entityId={partner.id}
            entityName={partner.name}
          />
        </TabsContent>

        {/* Bank Details Tab */}
        <TabsContent value="bank">
          <BankDetailsTab
            entityType="partner"
            entityId={partner.id}
            entityName={partner.name}
          />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <ActivityTimelineTab
            entityType="partner"
            entityId={partner.id}
            entityName={partner.name}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditPartnerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        partner={partner}
      />

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        entityType="partner"
        entityId={partner.id}
        entityName={partner.name}
      />

      {/* KYC Edit Dialog for individual partners */}
      {partner.type === 'individual' && (
        <EntityKYCEditDialog
          open={kycDialogOpen}
          onOpenChange={setKycDialogOpen}
          entityType="partner"
          entityId={partner.id}
          entityName={partner.name}
          apiEndpoint={`/api/admin/partners/${partner.id}`}
          initialData={{
            first_name: partner.first_name ?? undefined,
            middle_name: partner.middle_name ?? undefined,
            last_name: partner.last_name ?? undefined,
            name_suffix: partner.name_suffix ?? undefined,
            date_of_birth: partner.date_of_birth ?? undefined,
            country_of_birth: partner.country_of_birth ?? undefined,
            nationality: partner.nationality ?? undefined,
            email: partner.contact_email ?? undefined,
            phone_mobile: partner.phone_mobile ?? undefined,
            phone_office: partner.phone_office ?? undefined,
            residential_street: partner.residential_street ?? undefined,
            residential_line_2: partner.residential_line_2 ?? undefined,
            residential_city: partner.residential_city ?? undefined,
            residential_state: partner.residential_state ?? undefined,
            residential_postal_code: partner.residential_postal_code ?? undefined,
            residential_country: partner.residential_country ?? undefined,
            is_us_citizen: partner.is_us_citizen ?? undefined,
            is_us_taxpayer: partner.is_us_taxpayer ?? undefined,
            us_taxpayer_id: partner.us_taxpayer_id ?? undefined,
            country_of_tax_residency: partner.country_of_tax_residency ?? undefined,
            id_type: partner.id_type ?? undefined,
            id_number: partner.id_number ?? undefined,
            id_issue_date: partner.id_issue_date ?? undefined,
            id_expiry_date: partner.id_expiry_date ?? undefined,
            id_issuing_country: partner.id_issuing_country ?? undefined,
            // Additional KYC fields
            middle_initial: partner.middle_initial ?? undefined,
            proof_of_address_date: partner.proof_of_address_date ?? undefined,
            proof_of_address_expiry: partner.proof_of_address_expiry ?? undefined,
            tax_id_number: partner.tax_id_number ?? undefined,
          }}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
