'use client'

import { useMemo, useState } from 'react'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertCircle, Building2, Eye, FileText, Pencil, Plus, Search } from 'lucide-react'
import { CreateEntityModal } from './create-entity-modal'
import { EditEntityModal } from './edit-entity-modal'
import type { Entity } from './entities-views'

interface EntitiesPageClientProps {
  entities: Entity[]
}

const entityTypeLabels: Record<string, string> = {
  fund: 'Fund',
  spv: 'SPV',
  securitization: 'Securitization',
  note: 'Note',
  venture_capital: 'Venture Capital',
  private_equity: 'Private Equity',
  real_estate: 'Real Estate',
  other: 'Other'
}

export function EntitiesPageClient({ entities }: EntitiesPageClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<Entity[]>(entities)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all')
  const [currencyFilter, setCurrencyFilter] = useState<'all' | string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editEntity, setEditEntity] = useState<Entity | null>(null)
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
    setCreateOpen(true)
  }

  const openEditModal = (entity: Entity) => {
    setEditEntity(entity)
  }

  const handleEntityCreated = (entity: Entity) => {
    setItems((prev) => [entity, ...prev])
    setCreateOpen(false)
    setBannerTone('success')
    setBannerMessage(`Vehicle "${entity.name}" created successfully.`)
    setTimeout(() => setBannerMessage(null), 4000)
    router.refresh()
  }

  const handleEntityUpdated = (entity: Entity) => {
    setItems((prev) => prev.map((item) => (item.id === entity.id ? entity : item)))
    setEditEntity(null)
    setBannerTone('success')
    setBannerMessage(`Vehicle "${entity.name}" updated successfully.`)
    setTimeout(() => setBannerMessage(null), 4000)
    router.refresh()
  }

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicles</h1>
          <p className="text-muted-foreground mt-1">
            Manage investment vehicles used across deals, holdings, and reporting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/versotech_main/documents">
              <FileText className="h-4 w-4" />
              Documents Workspace
            </Link>
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Vehicle
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
            <CardTitle className="text-sm text-muted-foreground">Total Vehicles</CardTitle>
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
                        <p>No vehicles found. Try adjusting your filters or create a new one.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntities.map((entity) => (
                    <TableRow
                      key={entity.id}
                      className="cursor-pointer hover:bg-white/10"
                      onClick={() => router.push(`/versotech_main/entities/${entity.id}`)}
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
                              router.push(`/versotech_main/entities/${entity.id}`)
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

      <CreateEntityModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleEntityCreated}
      />

      {editEntity && (
        <EditEntityModal
          entity={editEntity as any}
          open={true}
          onClose={() => setEditEntity(null)}
          onSuccess={(updated) => {
            handleEntityUpdated(updated as Entity)
          }}
        />
      )}


    </div>
  )
}

