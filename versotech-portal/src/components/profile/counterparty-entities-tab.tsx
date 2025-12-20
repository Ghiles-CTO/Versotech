'use client'

import { useState, useEffect } from 'react'
import { Building2, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Users, Loader2, MapPin, Calendar, Hash, FileText, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { EntityFormDialog } from './entity-form-dialog'
import { EntityDetailDialog } from './entity-detail-dialog'

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
  kyc_status?: string
  kyc_completed_at?: string
  kyc_expiry_date?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function CounterpartyEntitiesTab() {
  const [entities, setEntities] = useState<CounterpartyEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<CounterpartyEntity | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadEntities()
  }, [])

  const loadEntities = async () => {
    try {
      const response = await fetch('/api/investors/me/counterparty-entities')
      if (!response.ok) throw new Error('Failed to load entities')

      const data = await response.json()
      setEntities(data.entities || [])
    } catch (error) {
      console.error('Error loading entities:', error)
      toast.error('Failed to load entities')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedEntity(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (entity: CounterpartyEntity) => {
    setSelectedEntity(entity)
    setFormDialogOpen(true)
  }

  const handleViewDetails = (entity: CounterpartyEntity) => {
    setSelectedEntity(entity)
    setDetailDialogOpen(true)
  }

  const handleDelete = async (entityId: string) => {
    if (!confirm('Are you sure you want to delete this entity? This action cannot be undone.')) {
      return
    }

    setDeleting(entityId)

    try {
      const response = await fetch(`/api/investors/me/counterparty-entities/${entityId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Delete failed')
      }

      toast.success('Entity deleted successfully')
      await loadEntities()
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to delete entity')
    } finally {
      setDeleting(null)
    }
  }

  const handleFormSuccess = async () => {
    setFormDialogOpen(false)
    setSelectedEntity(null)
    await loadEntities()
  }

  const getEntityTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
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
    return typeLabels[type] || type
  }

  const getKYCStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 px-3 py-1">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            Verified
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 px-3 py-1">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Pending Review
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-rose-500/15 text-rose-700 border-rose-500/30 px-3 py-1">
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Rejected
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-400 px-3 py-1">
            Expired
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-slate-500 border-slate-300 px-3 py-1">
            Not Submitted
          </Badge>
        )
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAddress = (address?: CounterpartyEntity['registered_address']) => {
    if (!address) return null
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postal_code,
      address.country
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl">Counterparty Entities</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage legal entities you invest through (trusts, LLCs, partnerships, etc.)
              </p>
            </div>
            <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Entity
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Entities List */}
      {entities.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 font-medium text-lg mb-2">No entities added yet</p>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                Add a legal entity to invest through trusts, LLCs, or partnerships.
              </p>
              <Button onClick={handleCreate} variant="outline" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Entity
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {entities.map((entity) => (
            <Card key={entity.id} className="overflow-hidden">
              {/* Card Header with Name, Type, and Actions */}
              <CardHeader className="bg-slate-50/80 border-b pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {entity.legal_name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-medium px-3 py-1">
                          {getEntityTypeLabel(entity.entity_type)}
                        </Badge>
                        {getKYCStatusBadge(entity.kyc_status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleViewDetails(entity)}
                      className="h-9 bg-slate-900 hover:bg-slate-800"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Members & KYC
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(entity)}
                      className="h-9"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(entity.id)}
                      disabled={deleting === entity.id}
                      className="h-9 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300"
                    >
                      {deleting === entity.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Card Content with All Data */}
              <CardContent className="pt-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  {/* Jurisdiction */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <MapPin className="w-4 h-4" />
                      Jurisdiction
                    </div>
                    <p className="text-base text-slate-900 pl-6">
                      {entity.jurisdiction || <span className="text-slate-400">Not specified</span>}
                    </p>
                  </div>

                  {/* Registration Number */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Hash className="w-4 h-4" />
                      Registration Number
                    </div>
                    <p className="text-base text-slate-900 font-mono pl-6">
                      {entity.registration_number || <span className="text-slate-400 font-sans">Not specified</span>}
                    </p>
                  </div>

                  {/* Tax ID */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <FileText className="w-4 h-4" />
                      Tax ID
                    </div>
                    <p className="text-base text-slate-900 font-mono pl-6">
                      {entity.tax_id || <span className="text-slate-400 font-sans">Not specified</span>}
                    </p>
                  </div>

                  {/* Formation Date */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Calendar className="w-4 h-4" />
                      Formation Date
                    </div>
                    <p className="text-base text-slate-900 pl-6">
                      {formatDate(entity.formation_date) !== '—' ? formatDate(entity.formation_date) : <span className="text-slate-400">Not specified</span>}
                    </p>
                  </div>

                  {/* Representative */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <User className="w-4 h-4" />
                      Authorized Representative
                    </div>
                    <div className="pl-6">
                      {entity.representative_name ? (
                        <div>
                          <p className="text-base text-slate-900 font-medium">
                            {entity.representative_name}
                          </p>
                          {entity.representative_title && (
                            <p className="text-sm text-slate-500">
                              {entity.representative_title}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-400">Not specified</p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <MapPin className="w-4 h-4" />
                      Registered Address
                    </div>
                    <p className="text-base text-slate-900 pl-6">
                      {formatAddress(entity.registered_address) || <span className="text-slate-400">Not specified</span>}
                    </p>
                  </div>
                </div>

                {/* Notes Section - if present */}
                {entity.notes && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                      <FileText className="w-4 h-4" />
                      Notes
                    </div>
                    <p className="text-base text-slate-700 pl-6 whitespace-pre-wrap">
                      {entity.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EntityFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false)
          setSelectedEntity(null)
        }}
        onSuccess={handleFormSuccess}
        entity={selectedEntity}
      />

      <EntityDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false)
          setSelectedEntity(null)
        }}
        entity={selectedEntity}
        onUpdate={loadEntities}
      />
    </div>
  )
}
