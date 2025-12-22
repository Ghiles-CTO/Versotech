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
} from 'lucide-react'
import { useState } from 'react'
import { KYCDocumentsTab } from '@/components/shared/kyc-documents-tab'
import { BankDetailsTab } from '@/components/shared/bank-details-tab'
import { ActivityTimelineTab } from '@/components/shared/activity-timeline-tab'
import { EditArrangerDialog } from '@/components/staff/arrangers/edit-arranger-dialog'
import { InviteUserDialog } from '@/components/users/invite-user-dialog'
import { formatCurrency, formatDate } from '@/lib/format'
import { statusStyles, kycStyles, getStatusStyle } from '@/lib/status-styles'

type ArrangerDetail = {
  id: string
  legal_name: string
  registration_number: string | null
  tax_id: string | null
  regulator: string | null
  license_number: string | null
  license_type: string | null
  license_expiry_date: string | null
  email: string | null
  phone: string | null
  address: string | null
  kyc_status: string
  kyc_approved_at: string | null
  kyc_approved_by: string | null
  kyc_expires_at: string | null
  kyc_notes: string | null
  metadata: any
  status: string
  created_at: string | null
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
}

type ArrangerMetrics = {
  totalDeals: number
  activeDeals: number
  totalVehicles: number
  totalAum: number
  documentCount: number
}

type Deal = {
  id: string
  name: string
  status: string
  target_raise: number | null
  created_at: string
}

type Vehicle = {
  id: string
  name: string
  status: string
  aum: number | null
  created_at: string
}

interface ArrangerDetailClientProps {
  arranger: ArrangerDetail
  metrics: ArrangerMetrics
  deals: Deal[]
  vehicles: Vehicle[]
}

export function ArrangerDetailClient({ arranger, metrics, deals, vehicles }: ArrangerDetailClientProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  // Format arranger data for edit dialog
  const arrangerForDialog = {
    ...arranger,
    legalName: arranger.legal_name,
    registrationNumber: arranger.registration_number,
    taxId: arranger.tax_id,
    licenseNumber: arranger.license_number,
    licenseType: arranger.license_type,
    licenseExpiryDate: arranger.license_expiry_date,
    kycStatus: arranger.kyc_status,
    kycApprovedAt: arranger.kyc_approved_at,
    kycApprovedBy: arranger.kyc_approved_by,
    kycExpiresAt: arranger.kyc_expires_at,
    kycNotes: arranger.kyc_notes,
    createdAt: arranger.created_at,
    createdBy: arranger.created_by,
    updatedAt: arranger.updated_at,
    updatedBy: arranger.updated_by,
    totalDeals: metrics.totalDeals,
    activeDeals: metrics.activeDeals,
    totalVehicles: metrics.totalVehicles,
    totalAum: metrics.totalAum,
    documentCount: metrics.documentCount,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/versotech/staff/arrangers">
            <Button variant="ghost" size="sm" className="bg-gray-800 text-white hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Arrangers
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {arranger.legal_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {arranger.regulator && arranger.license_number
                ? `${arranger.regulator}: ${arranger.license_number}`
                : `Arranger ID: ${arranger.id.slice(0, 8)}`
              }
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
        <Badge className={getStatusStyle(arranger.status, statusStyles)}>
          {arranger.status}
        </Badge>
        <Badge className={getStatusStyle(arranger.kyc_status, kycStyles)}>
          KYC: {arranger.kyc_status}
        </Badge>
        {arranger.license_type && (
          <Badge variant="outline">
            {arranger.license_type}
          </Badge>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Total Deals
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
              <Building2 className="h-4 w-4" />
              Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.totalVehicles}</div>
            <div className="text-sm text-muted-foreground mt-1">Managed</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total AUM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(metrics.totalAum)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Under management</div>
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
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <Building2 className="h-4 w-4" />
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
          <TabsTrigger value="deals" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Deals</span>
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Vehicles</span>
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
                {arranger.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="text-sm font-medium">{arranger.email}</div>
                    </div>
                  </div>
                )}
                {arranger.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="text-sm font-medium">{arranger.phone}</div>
                    </div>
                  </div>
                )}
                {arranger.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div className="text-sm font-medium">{arranger.address}</div>
                    </div>
                  </div>
                )}
                {!arranger.email && !arranger.phone && !arranger.address && (
                  <p className="text-sm text-muted-foreground">No contact information available</p>
                )}
              </CardContent>
            </Card>

            {/* Regulatory Information */}
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {arranger.regulator && (
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Regulator</div>
                      <div className="text-sm font-medium">{arranger.regulator}</div>
                    </div>
                  </div>
                )}
                {arranger.license_number && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">License Number</div>
                      <div className="text-sm font-medium">{arranger.license_number}</div>
                    </div>
                  </div>
                )}
                {arranger.license_type && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">License Type</div>
                      <div className="text-sm font-medium">{arranger.license_type}</div>
                    </div>
                  </div>
                )}
                {arranger.license_expiry_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">License Expires</div>
                      <div className="text-sm font-medium">{formatDate(arranger.license_expiry_date)}</div>
                    </div>
                  </div>
                )}
                {arranger.registration_number && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Registration Number</div>
                      <div className="text-sm font-medium">{arranger.registration_number}</div>
                    </div>
                  </div>
                )}
                {arranger.tax_id && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Tax ID</div>
                      <div className="text-sm font-medium">{arranger.tax_id}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* KYC Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>KYC Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={getStatusStyle(arranger.kyc_status, kycStyles)}>
                    {arranger.kyc_status}
                  </Badge>
                </div>
                {arranger.kyc_approved_at && (
                  <div>
                    <div className="text-sm text-muted-foreground">Approved At</div>
                    <div className="text-sm font-medium">{formatDate(arranger.kyc_approved_at)}</div>
                  </div>
                )}
                {arranger.kyc_expires_at && (
                  <div>
                    <div className="text-sm text-muted-foreground">Expires At</div>
                    <div className="text-sm font-medium">{formatDate(arranger.kyc_expires_at)}</div>
                  </div>
                )}
              </div>
              {arranger.kyc_notes && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Notes</div>
                  <div className="text-sm bg-white/5 rounded-lg p-3">{arranger.kyc_notes}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Documents Tab */}
        <TabsContent value="kyc">
          <KYCDocumentsTab
            entityType="arranger"
            entityId={arranger.id}
            entityName={arranger.legal_name}
          />
        </TabsContent>

        {/* Bank Details Tab */}
        <TabsContent value="bank">
          <BankDetailsTab
            entityType="arranger"
            entityId={arranger.id}
            entityName={arranger.legal_name}
          />
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle>Arranged Deals</CardTitle>
              <CardDescription>
                Deals arranged by {arranger.legal_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No deals arranged yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/versotech/staff/deals/${deal.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                        <div>
                          <div className="font-medium text-foreground">{deal.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Created: {formatDate(deal.created_at)}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{deal.status}</Badge>
                          {deal.target_raise && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {formatCurrency(deal.target_raise)}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Managed Vehicles</CardTitle>
              <CardDescription>
                Investment vehicles managed by {arranger.legal_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No vehicles managed yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((vehicle) => (
                    <Link
                      key={vehicle.id}
                      href={`/versotech/staff/entities/${vehicle.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                        <div>
                          <div className="font-medium text-foreground">{vehicle.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Created: {formatDate(vehicle.created_at)}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{vehicle.status}</Badge>
                          {vehicle.aum && (
                            <div className="text-sm text-green-400 mt-1">
                              {formatCurrency(vehicle.aum)}
                            </div>
                          )}
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
            entityType="arranger"
            entityId={arranger.id}
            entityName={arranger.legal_name}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditArrangerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        arranger={arrangerForDialog}
      />

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        entityType="arranger"
        entityId={arranger.id}
        entityName={arranger.legal_name}
      />
    </div>
  )
}
