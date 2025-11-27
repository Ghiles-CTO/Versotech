'use client'

import { useState, useEffect } from 'react'
import { Building2, Plus, Edit, Trash2, FileText, Upload, CheckCircle, XCircle, Clock, Eye, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

  const getEntityTypeBadge = (type: string) => {
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

    return <Badge variant="outline">{typeLabels[type] || type}</Badge>
  }

  const getKYCStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'expired':
        return <Badge variant="outline" className="text-orange-500">Expired</Badge>
      default:
        return <Badge variant="outline">Not Submitted</Badge>
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading entities...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Counterparty Entities</CardTitle>
              <CardDescription>
                Manage legal entities you invest through (trusts, LLCs, partnerships, etc.). Click "Members & KYC" to add members and upload KYC documents.
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Entity
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {entities.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No entities added yet. Add an entity to invest through a legal entity.
              </p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Entity
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Legal Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Jurisdiction</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Representative</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entities.map((entity) => (
                  <TableRow key={entity.id}>
                    <TableCell className="font-medium">{entity.legal_name}</TableCell>
                    <TableCell>{getEntityTypeBadge(entity.entity_type)}</TableCell>
                    <TableCell>{entity.jurisdiction || 'N/A'}</TableCell>
                    <TableCell>{getKYCStatusBadge(entity.kyc_status)}</TableCell>
                    <TableCell>
                      {entity.representative_name ? (
                        <div>
                          <div className="font-medium">{entity.representative_name}</div>
                          {entity.representative_title && (
                            <div className="text-sm text-muted-foreground">
                              {entity.representative_title}
                            </div>
                          )}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{formatDate(entity.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleViewDetails(entity)}
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Members & KYC
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(entity)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(entity.id)}
                          disabled={deleting === entity.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
