'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EntityKYCDocuments } from './entity-kyc-documents'
import { EntityMembersTab } from './entity-members-tab'
import { EntityFormDialog } from './entity-form-dialog'
import {
  Building2,
  MapPin,
  FileText,
  User,
  Users,
  Calendar,
  Hash,
  Shield,
  Mail,
  Phone
} from 'lucide-react'

interface CounterpartyEntity {
  id: string
  entity_type: string
  legal_name: string
  registration_number?: string
  jurisdiction?: string
  tax_id?: string
  formation_date?: string
  registered_address?: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  representative_name?: string
  representative_title?: string
  representative_email?: string
  representative_phone?: string
  notes?: string
  kyc_status?: string
  created_at?: string
}

interface EntityDetailDialogProps {
  open: boolean
  onClose: () => void
  entity: CounterpartyEntity | null
  onUpdate: () => void
}

export function EntityDetailDialog({ open, onClose, entity, onUpdate }: EntityDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  if (!entity) return null

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      trust: 'Trust',
      llc: 'LLC',
      partnership: 'Partnership',
      family_office: 'Family Office',
      law_firm: 'Law Firm',
      investment_bank: 'Investment Bank',
      fund: 'Fund',
      corporation: 'Corporation',
      other: 'Other'
    }
    return labels[type] || type
  }

  const getKYCStatusBadge = (status?: string) => {
    if (!status) {
      return (
        <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-500/30">
          No KYC
        </Badge>
      )
    }

    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            Approved
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
            Pending Review
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-rose-500/20 text-rose-300 border-rose-500/30">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatAddress = (address?: CounterpartyEntity['registered_address']) => {
    if (!address) return '—'

    const parts = [
      address.street,
      address.city,
      address.state,
      address.postal_code,
      address.country
    ].filter(Boolean)

    return parts.length > 0 ? parts.join(', ') : '—'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
    onUpdate()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl">{entity.legal_name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{getEntityTypeLabel(entity.entity_type)}</Badge>
                  {getKYCStatusBadge(entity.kyc_status)}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Entity Details</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="kyc">KYC Documents</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="details" className="space-y-4 m-0">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Legal Name</p>
                      <p className="font-medium">{entity.legal_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Entity Type</p>
                      <p className="font-medium">{getEntityTypeLabel(entity.entity_type)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Registration Number
                      </p>
                      <p className="font-medium">{entity.registration_number || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Tax ID / EIN
                      </p>
                      <p className="font-medium">{entity.tax_id || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Jurisdiction
                      </p>
                      <p className="font-medium">{entity.jurisdiction || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Formation Date
                      </p>
                      <p className="font-medium">{formatDate(entity.formation_date)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Registered Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Registered Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{formatAddress(entity.registered_address)}</p>
                  </CardContent>
                </Card>

                {/* Authorized Representative */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Authorized Representative
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Name</p>
                      <p className="font-medium">{entity.representative_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Title</p>
                      <p className="font-medium">{entity.representative_title || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </p>
                      <p className="font-medium">{entity.representative_email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone
                      </p>
                      <p className="font-medium">{entity.representative_phone || '—'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {entity.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{entity.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="members" className="m-0">
                <EntityMembersTab entityId={entity.id} entityName={entity.legal_name} />
              </TabsContent>

              <TabsContent value="kyc" className="m-0">
                <EntityKYCDocuments entityId={entity.id} entityName={entity.legal_name} />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EntityFormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
        entity={entity}
      />
    </>
  )
}
