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
  User,
  Calendar,
  FileText,
  Banknote,
  Activity,
  DollarSign,
  TrendingUp,
  Building2,
  Edit,
  UserPlus,
  Clock,
  Percent,
} from 'lucide-react'
import { useState } from 'react'
import { KYCDocumentsTab } from '@/components/shared/kyc-documents-tab'
import { BankDetailsTab } from '@/components/shared/bank-details-tab'
import { ActivityTimelineTab } from '@/components/shared/activity-timeline-tab'
import { EditIntroducerDialog } from '@/components/staff/introducers/edit-introducer-dialog'
import { InviteUserDialog } from '@/components/users/invite-user-dialog'
import { formatCurrency, formatBps, formatDate } from '@/lib/format'
import { statusStyles, kycStyles, getStatusStyle } from '@/lib/status-styles'

type IntroducerDetail = {
  id: string
  legal_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  default_commission_bps: number | null
  commission_cap_amount: number | null
  payment_terms: string | null
  status: string
  kyc_status: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

type Introduction = {
  id: string
  prospect_email: string | null
  status: string
  introduced_at: string | null
  deal: {
    id: string
    name: string
  } | null
}

type Commission = {
  id: string
  accrual_amount: number
  status: string
  paid_at: string | null
  created_at: string
  subscription?: {
    id: string
    commitment_amount: number
    investor?: {
      legal_name: string
    } | null
  } | null
}

type IntroducerMetrics = {
  totalIntroductions: number
  successfulAllocations: number
  conversionRate: number
  totalCommissionPaid: number
  pendingCommission: number
}

interface IntroducerDetailClientProps {
  introducer: IntroducerDetail
  metrics: IntroducerMetrics
  introductions: Introduction[]
  commissions: Commission[]
}

export function IntroducerDetailClient({
  introducer,
  metrics,
  introductions,
  commissions
}: IntroducerDetailClientProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const introStatusStyles: Record<string, string> = {
    allocated: 'bg-green-500/20 text-green-400',
    converted: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    expired: 'bg-gray-500/20 text-gray-400',
  }

  const commissionStatusStyles: Record<string, string> = {
    paid: 'bg-green-500/20 text-green-400',
    accrued: 'bg-yellow-500/20 text-yellow-400',
    invoiced: 'bg-blue-500/20 text-blue-400',
    cancelled: 'bg-red-500/20 text-red-400',
  }

  const formatPaymentTerms = (terms: string | null) => {
    if (!terms) return 'Not set'
    const mapping: Record<string, string> = {
      'net_15': 'Net 15',
      'net_30': 'Net 30',
      'net_45': 'Net 45',
      'net_60': 'Net 60',
    }
    return mapping[terms] || terms
  }

  // Format introducer data for edit dialog
  const introducerForDialog = {
    id: introducer.id,
    legalName: introducer.legal_name,
    contactName: introducer.contact_name,
    email: introducer.email,
    defaultCommissionBps: introducer.default_commission_bps || 0,
    commissionCapAmount: introducer.commission_cap_amount,
    paymentTerms: introducer.payment_terms,
    status: introducer.status,
    notes: introducer.notes,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/versotech/staff/introducers">
            <Button variant="ghost" size="sm" className="bg-gray-800 text-white hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Introducers
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {introducer.legal_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Introducer ID: {introducer.id.slice(0, 8)}
            </p>
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
        <Badge className={getStatusStyle(introducer.status, statusStyles)}>
          {introducer.status}
        </Badge>
        {introducer.kyc_status && (
          <Badge className={getStatusStyle(introducer.kyc_status, kycStyles)}>
            KYC: {introducer.kyc_status}
          </Badge>
        )}
        {introducer.default_commission_bps && (
          <Badge variant="outline">
            {formatBps(introducer.default_commission_bps)} Commission
          </Badge>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Introductions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.totalIntroductions}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {metrics.successfulAllocations} converted
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Success rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Paid Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(metrics.totalCommissionPaid)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">All time</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {formatCurrency(metrics.pendingCommission)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Owed</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Default Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatBps(introducer.default_commission_bps || 0)}
            </div>
            {introducer.commission_cap_amount && (
              <div className="text-sm text-muted-foreground mt-1">
                Cap: {formatCurrency(introducer.commission_cap_amount)}
              </div>
            )}
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
          <TabsTrigger value="introductions" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Introductions</span>
          </TabsTrigger>
          <TabsTrigger value="commissions" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Commissions</span>
          </TabsTrigger>
          <TabsTrigger value="kyc" className="gap-2">
            <FileText className="h-4 w-4" />
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
                {introducer.contact_name && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Primary Contact</div>
                      <div className="text-sm font-medium">{introducer.contact_name}</div>
                    </div>
                  </div>
                )}
                {introducer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <a href={`mailto:${introducer.email}`} className="text-sm font-medium text-blue-400 hover:underline">
                        {introducer.email}
                      </a>
                    </div>
                  </div>
                )}
                {introducer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="text-sm font-medium">{introducer.phone}</div>
                    </div>
                  </div>
                )}
                {introducer.created_at && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Member Since</div>
                      <div className="text-sm font-medium">{formatDate(introducer.created_at)}</div>
                    </div>
                  </div>
                )}
                {!introducer.contact_name && !introducer.email && !introducer.phone && (
                  <p className="text-sm text-muted-foreground">No contact information available</p>
                )}
              </CardContent>
            </Card>

            {/* Commission Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Commission Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Default Commission Rate</div>
                    <div className="text-sm font-medium">{formatBps(introducer.default_commission_bps || 0)}</div>
                  </div>
                </div>
                {introducer.commission_cap_amount && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Commission Cap</div>
                      <div className="text-sm font-medium">{formatCurrency(introducer.commission_cap_amount)}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Payment Terms</div>
                    <div className="text-sm font-medium">{formatPaymentTerms(introducer.payment_terms)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes Card */}
          {introducer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm bg-white/5 rounded-lg p-4 whitespace-pre-wrap">
                  {introducer.notes}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Introductions Tab */}
        <TabsContent value="introductions">
          <Card>
            <CardHeader>
              <CardTitle>Introductions</CardTitle>
              <CardDescription>
                All prospects introduced by {introducer.legal_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {introductions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No introductions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {introductions.map((intro) => (
                    <div
                      key={intro.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-foreground">{intro.prospect_email || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">
                          {intro.deal?.name || 'Unknown deal'}
                          {intro.introduced_at && ` • ${formatDate(intro.introduced_at)}`}
                        </div>
                      </div>
                      <Badge className={introStatusStyles[intro.status] ?? 'bg-gray-500/20 text-gray-400'}>
                        {intro.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Commission History</CardTitle>
              <CardDescription>
                All commissions earned by {introducer.legal_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No commissions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {commissions.map((comm) => (
                    <div
                      key={comm.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {formatCurrency(comm.accrual_amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {comm.subscription?.investor?.legal_name || 'Unknown investor'}
                          {comm.subscription && (
                            <> • {formatCurrency(comm.subscription.commitment_amount)} commitment</>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created {formatDate(comm.created_at)}
                          {comm.paid_at && ` • Paid ${formatDate(comm.paid_at)}`}
                        </div>
                      </div>
                      <Badge className={commissionStatusStyles[comm.status] ?? 'bg-gray-500/20 text-gray-400'}>
                        {comm.status}
                      </Badge>
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
            entityType="introducer"
            entityId={introducer.id}
            entityName={introducer.legal_name}
          />
        </TabsContent>

        {/* Bank Details Tab */}
        <TabsContent value="bank">
          <BankDetailsTab
            entityType="introducer"
            entityId={introducer.id}
            entityName={introducer.legal_name}
          />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <ActivityTimelineTab
            entityType="introducer"
            entityId={introducer.id}
            entityName={introducer.legal_name}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditIntroducerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        introducer={introducerForDialog}
      />

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        entityType="introducer"
        entityId={introducer.id}
        entityName={introducer.legal_name}
      />
    </div>
  )
}
