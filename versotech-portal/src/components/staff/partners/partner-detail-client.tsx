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
} from 'lucide-react'
import { useState } from 'react'
import { KYCDocumentsTab } from '@/components/shared/kyc-documents-tab'
import { BankDetailsTab } from '@/components/shared/bank-details-tab'
import { ActivityTimelineTab } from '@/components/shared/activity-timeline-tab'
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
}

type PartnerMetrics = {
  documentCount: number
}

interface PartnerDetailClientProps {
  partner: PartnerDetail
  metrics: PartnerMetrics
}

export function PartnerDetailClient({ partner, metrics }: PartnerDetailClientProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

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
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="kyc" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">KYC Documents</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="gap-2">
            <Banknote className="h-4 w-4" />
            <span className="hidden sm:inline">Bank Details</span>
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
    </div>
  )
}
