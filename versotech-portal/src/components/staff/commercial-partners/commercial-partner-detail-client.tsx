'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Clock,
  Shield,
  Edit,
  Users,
  Landmark,
  FileCheck,
  CreditCard,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { EditCommercialPartnerDialog } from '@/components/staff/commercial-partners/edit-commercial-partner-dialog'
import { KYCDocumentsTab } from '@/components/shared/kyc-documents-tab'
import { BankDetailsTab } from '@/components/shared/bank-details-tab'
import { InviteUserDialog } from '@/components/users/invite-user-dialog'

type CommercialPartner = {
  id: string
  name: string
  legal_name: string | null
  type: string
  cp_type: string
  status: string
  regulatory_status: string | null
  regulatory_number: string | null
  jurisdiction: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  payment_terms: string | null
  contract_start_date: string | null
  contract_end_date: string | null
  notes: string | null
  kyc_status: string | null
  kyc_notes: string | null
  kyc_approved_at: string | null
  kyc_expires_at: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

type LinkedUser = {
  userId: string
  email: string
  displayName: string | null
  title: string | null
  role: string
  isPrimary: boolean
  canSign: boolean
  canExecuteForClients: boolean
  createdAt: string
}

interface CommercialPartnerDetailClientProps {
  partner: CommercialPartner
  linkedUsers: LinkedUser[]
  documentCount: number
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const kycStyles: Record<string, string> = {
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  not_started: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const cpTypeLabels: Record<string, string> = {
  'bank': 'Bank',
  'insurance': 'Insurance',
  'wealth-manager': 'Wealth Manager',
  'broker': 'Broker',
  'custodian': 'Custodian',
  'other': 'Other',
}

export function CommercialPartnerDetailClient({
  partner,
  linkedUsers,
  documentCount,
}: CommercialPartnerDetailClientProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const fullAddress = [
    partner.address_line_1,
    partner.address_line_2,
    partner.city,
    partner.postal_code,
    partner.country,
  ].filter(Boolean).join(', ')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/versotech/staff/commercial-partners">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
            {partner.logo_url ? (
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <Landmark className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{partner.name}</h1>
            <p className="text-muted-foreground">
              {cpTypeLabels[partner.cp_type] || partner.cp_type}
              {partner.jurisdiction && ` • ${partner.jurisdiction}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusStyles[partner.status] || 'bg-gray-500/20 text-gray-400'}>
            {partner.status}
          </Badge>
          {partner.kyc_status && (
            <Badge className={kycStyles[partner.kyc_status] || 'bg-gray-500/20 text-gray-400'}>
              KYC: {partner.kyc_status.replace('_', ' ')}
            </Badge>
          )}
          <Button onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Linked Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{linkedUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              KYC Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">
              {partner.kyc_status?.replace('_', ' ') || 'Not Started'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatDistanceToNow(new Date(partner.created_at), { addSuffix: true })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kyc-documents">KYC Documents</TabsTrigger>
          <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Legal Name</p>
                    <p className="font-medium">{partner.legal_name || partner.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Entity Type</p>
                    <p className="font-medium capitalize">{partner.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Partner Type</p>
                    <p className="font-medium">{cpTypeLabels[partner.cp_type] || partner.cp_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={statusStyles[partner.status] || 'bg-gray-500/20 text-gray-400'}>
                      {partner.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regulatory Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Regulatory Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Regulatory Status</p>
                    <p className="font-medium">{partner.regulatory_status || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Regulatory Number</p>
                    <p className="font-medium">{partner.regulatory_number || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Jurisdiction</p>
                    <p className="font-medium">{partner.jurisdiction || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {partner.contact_name && (
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{partner.contact_name}</span>
                  </div>
                )}
                {partner.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${partner.contact_email}`} className="text-primary hover:underline">
                      {partner.contact_email}
                    </a>
                  </div>
                )}
                {partner.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{partner.contact_phone}</span>
                  </div>
                )}
                {partner.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {partner.website}
                    </a>
                  </div>
                )}
                {fullAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span>{fullAddress}</span>
                  </div>
                )}
                {!partner.contact_name && !partner.contact_email && !partner.contact_phone && (
                  <p className="text-muted-foreground text-sm">No contact information available</p>
                )}
              </CardContent>
            </Card>

            {/* Business Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Business Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Terms</p>
                    <p className="font-medium">{partner.payment_terms || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Start</p>
                    <p className="font-medium">
                      {partner.contract_start_date
                        ? format(new Date(partner.contract_start_date), 'dd MMM yyyy')
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contract End</p>
                    <p className="font-medium">
                      {partner.contract_end_date
                        ? format(new Date(partner.contract_end_date), 'dd MMM yyyy')
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Linked Users */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Linked Users
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setInviteDialogOpen(true)}>
                  Invite User
                </Button>
              </CardHeader>
              <CardContent>
                {linkedUsers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No users linked to this commercial partner</p>
                ) : (
                  <div className="space-y-3">
                    {linkedUsers.map((user) => (
                      <div
                        key={user.userId}
                        className="flex items-center justify-between p-3 rounded-lg border border-white/10"
                      >
                        <div>
                          <p className="font-medium">{user.displayName || user.email}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                          {user.isPrimary && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">Primary</Badge>
                          )}
                          {user.canSign && (
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">Can Sign</Badge>
                          )}
                          {user.canExecuteForClients && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">Execute</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {partner.notes && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{partner.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* KYC Documents Tab */}
        <TabsContent value="kyc-documents">
          <KYCDocumentsTab
            entityType="commercial_partner"
            entityId={partner.id}
            entityName={partner.name}
          />
        </TabsContent>

        {/* Bank Details Tab */}
        <TabsContent value="bank-details">
          <BankDetailsTab entityType="commercial_partner" entityId={partner.id} entityName={partner.name} />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Log</CardTitle>
              <CardDescription>Recent activity for this commercial partner</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg border border-white/10">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Commercial partner created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(partner.created_at), 'dd MMM yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                {partner.updated_at !== partner.created_at && (
                  <div className="flex items-start gap-4 p-4 rounded-lg border border-white/10">
                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Edit className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Commercial partner updated</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(partner.updated_at), 'dd MMM yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditCommercialPartnerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        partner={partner}
      />

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        entityType="commercial_partner"
        entityId={partner.id}
        entityName={partner.name}
      />
    </div>
  )
}
