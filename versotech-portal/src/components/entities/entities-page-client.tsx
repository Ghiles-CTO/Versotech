'use client'

import { useMemo, useState, MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertCircle, Building2, Eye, FileText, Pencil, Plus, Search } from 'lucide-react'

interface Entity {
  id: string
  name: string
  entity_code: string | null
  platform: string | null
  investment_name: string | null
  former_entity: string | null
  status: string | null
  type: string
  domicile: string | null
  currency: string
  formation_date?: string | null
  legal_jurisdiction?: string | null
  registration_number?: string | null
  reporting_type?: string | null
  requires_reporting?: boolean
  notes?: string | null
  created_at: string
}

interface EntitiesPageClientProps {
  entities: Entity[]
}

const entityTypeLabels: Record<string, string> = {
  fund: 'Fund',
  spv: 'SPV',
  securitization: 'Securitization',
  note: 'Note',
  other: 'Other'
}

const emptyEntityForm = {
  name: '',
  type: 'fund',
  domicile: '',
  currency: 'USD',
  legal_jurisdiction: '',
  formation_date: '',
  registration_number: '',
  notes: ''
}

type EntityFormState = typeof emptyEntityForm

export function EntitiesPageClient({ entities }: EntitiesPageClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<Entity[]>(entities)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all')
  const [currencyFilter, setCurrencyFilter] = useState<'all' | string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [activeEntity, setActiveEntity] = useState<Entity | null>(null)
  const [formData, setFormData] = useState<EntityFormState>(emptyEntityForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [bannerMessage, setBannerMessage] = useState<string | null>(null)
  const [bannerTone, setBannerTone] = useState<'success' | 'error'>('success')

  const currencyOptions = useMemo(() => {
    const set = new Set<string>()
    items.forEach((entity) => {
      if (entity.currency) {
        set.add(entity.currency.toUpperCase())
      }
    })
    return Array.from(set)
  }, [items])

  const filteredEntities = useMemo(() => {
    let next = [...items]

    if (search) {
      const query = search.toLowerCase()
      next = next.filter(
        (entity) =>
          entity.name.toLowerCase().includes(query) ||
          entity.entity_code?.toLowerCase().includes(query) ||
          entity.investment_name?.toLowerCase().includes(query) ||
          entity.platform?.toLowerCase().includes(query) ||
          entity.domicile?.toLowerCase().includes(query)
      )
    }

    if (typeFilter !== 'all') {
      next = next.filter((entity) => entity.type === typeFilter)
    }

    if (currencyFilter !== 'all') {
      next = next.filter((entity) => entity.currency.toUpperCase() === currencyFilter)
    }

    next.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return next
  }, [items, search, typeFilter, currencyFilter])

  const openCreateModal = () => {
    setModalMode('create')
    setActiveEntity(null)
    setFormData(emptyEntityForm)
    setFormError(null)
    setModalOpen(true)
  }

  const openEditModal = (entity: Entity) => {
    setModalMode('edit')
    setActiveEntity(entity)
    setFormData({
      name: entity.name,
      type: entity.type,
      domicile: entity.domicile || '',
      currency: entity.currency,
      legal_jurisdiction: entity.legal_jurisdiction || '',
      formation_date: entity.formation_date ? entity.formation_date.slice(0, 10) : '',
      registration_number: entity.registration_number || '',
      notes: entity.notes || ''
    })
    setFormError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setActiveEntity(null)
    setFormError(null)
    setFormData(emptyEntityForm)
  }

  const handleSubmit = async () => {
    setFormLoading(true)
    setFormError(null)

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      domicile: formData.domicile.trim() || null,
      currency: formData.currency.trim().toUpperCase() || 'USD',
      legal_jurisdiction: formData.legal_jurisdiction.trim() || null,
      formation_date: formData.formation_date || null,
      registration_number: formData.registration_number.trim() || null,
      notes: formData.notes.trim() || null
    }

    try {
      const endpoint =
        modalMode === 'create'
          ? '/api/vehicles'
          : `/api/vehicles/${activeEntity?.id}`
      const method = modalMode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || data.details || 'Request failed')
      }

      const data = await response.json()
      const updatedEntity: Entity = data.vehicle

      if (modalMode === 'create') {
        setItems((prev) => [updatedEntity, ...prev])
        setBannerTone('success')
        setBannerMessage(`Entity “${updatedEntity.name}” created successfully.`)
      } else {
        setItems((prev) =>
          prev.map((entity) =>
            entity.id === updatedEntity.id ? updatedEntity : entity
          )
        )
        setBannerTone('success')
        setBannerMessage(`Entity “${updatedEntity.name}” updated successfully.`)
      }

      closeModal()
      router.refresh()
    } catch (error: any) {
      setFormError(error.message || 'Something went wrong')
      setBannerTone('error')
      setBannerMessage(null)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Entities</h1>
          <p className="text-muted-foreground mt-1">
            Manage legal entities used across deals, holdings, and reporting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/versotech/staff/documents">
              <FileText className="h-4 w-4" />
              Documents Workspace
            </Link>
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Entity
          </Button>
        </div>
      </div>

      {bannerMessage && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            bannerTone === 'success'
              ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
              : 'border-red-400/40 bg-red-500/10 text-red-100'
          }`}
        >
          {bannerMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Entities</CardTitle>
            <CardDescription className="text-3xl text-foreground font-semibold">
              {items.length}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Fund Structures</CardTitle>
            <CardDescription className="text-3xl text-foreground font-semibold">
              {items.filter((entity) => entity.type === 'fund').length}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">SPVs</CardTitle>
            <CardDescription className="text-3xl text-foreground font-semibold">
              {items.filter((entity) => entity.type === 'spv').length}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="border border-white/10 bg-white/5">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code, name, investment, or platform"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="fund">Fund</SelectItem>
                <SelectItem value="spv">SPV</SelectItem>
                <SelectItem value="securitization">Securitization</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={currencyFilter}
              onValueChange={(value) => setCurrencyFilter(value)}
            >
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All currencies</SelectItem>
                {currencyOptions.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border border-white/10 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead className="w-[240px]">Name</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Reporting</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-6 w-6" />
                        <p>No entities found. Try adjusting your filters or create a new vehicle.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntities.map((entity) => (
                    <TableRow
                      key={entity.id}
                      className="cursor-pointer hover:bg-white/10"
                      onClick={() => router.push(`/versotech/staff/entities/${entity.id}`)}
                    >
                      <TableCell>
                        {entity.entity_code ? (
                          <Badge variant="outline" className="font-mono text-xs border-emerald-400/40 text-emerald-100">
                            {entity.entity_code}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-foreground">{entity.name}</div>
                            {entity.former_entity && (
                              <div className="text-xs text-muted-foreground">
                                Formerly: {entity.former_entity}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-foreground font-medium">
                          {entity.investment_name || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {entity.platform ? (
                          <Badge className="bg-white/10 border border-white/10 text-foreground">
                            {entity.platform}
                          </Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-white/10 border border-white/10 text-foreground">
                          {entityTypeLabels[entity.type] || entity.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entity.status ? (
                          <Badge
                            className={
                              entity.status === 'LIVE'
                                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
                                : entity.status === 'CLOSED'
                                ? 'bg-red-500/20 border-red-400/40 text-red-100'
                                : 'bg-amber-500/20 border-amber-400/40 text-amber-100'
                            }
                          >
                            {entity.status}
                          </Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell>{entity.currency}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {entity.reporting_type || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={(event) => {
                              event.stopPropagation()
                              router.push(`/versotech/staff/entities/${entity.id}`)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={(event) => {
                              event.stopPropagation()
                              openEditModal(entity)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={(open) => (open ? setModalOpen(true) : closeModal())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{modalMode === 'create' ? 'Create Entity' : 'Edit Entity'}</DialogTitle>
            <DialogDescription>
              {modalMode === 'create'
                ? 'Define a new entity to associate with future deals and holdings.'
                : 'Update the details for this entity. Changes apply immediately to linked records.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="entity-name">
                Entity Name
              </label>
              <Input
                id="entity-name"
                placeholder="e.g., Verso Fund II"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fund">Fund</SelectItem>
                    <SelectItem value="spv">SPV</SelectItem>
                    <SelectItem value="securitization">Securitization</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Currency</label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Domicile / Jurisdiction</label>
              <Input
                placeholder="e.g., Luxembourg, BVI, Delaware"
                value={formData.domicile}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, domicile: event.target.value }))
                }
              />
            </div>

            {formError && (
              <div className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">
                {formError}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={closeModal} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={formLoading || !formData.name.trim()}>
              {formLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

