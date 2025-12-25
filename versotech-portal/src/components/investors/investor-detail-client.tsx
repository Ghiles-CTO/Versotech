'use client'

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
}

export function InvestorDetailClient({ investor, capitalMetrics }: InvestorDetailClientProps) {
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
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.total_commitment)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {capitalMetrics.vehicle_count > 0 ? (
                <>Across {capitalMetrics.vehicle_count} vehicle{capitalMetrics.vehicle_count !== 1 ? 's' : ''}</>
              ) : (
                <>No subscriptions yet</>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contributed / Unfunded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.total_contributed)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Unfunded: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.unfunded_commitment)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current NAV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.current_nav)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Distributed: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.total_distributed)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
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
    </div>
  )
}
