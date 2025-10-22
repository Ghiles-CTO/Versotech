'use client'

import { useState, useMemo } from 'react'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertCircle, FileText, FlagTriangleRight, LayoutGrid, List, Plus, Search, Table } from 'lucide-react'
import { Entity, EntitiesTableView, EntitiesListView, EntitiesKanbanView } from './entities-views'
import { EditEntityModal } from './edit-entity-modal'
import { CreateEntityModal } from './create-entity-modal'

interface EntitiesPageEnhancedProps {
  entities: Entity[]
}

type ViewMode = 'table' | 'list' | 'kanban'

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

export function EntitiesPageEnhanced({ entities: initialEntities }: EntitiesPageEnhancedProps) {
  const router = useRouter()
  const [entities, setEntities] = useState<Entity[]>(initialEntities)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all')
  const [platformFilter, setPlatformFilter] = useState<'all' | string>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all')
  const [editEntity, setEditEntity] = useState<Entity | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [bannerMessage, setBannerMessage] = useState<string | null>(null)
  const [bannerTone, setBannerTone] = useState<'success' | 'error'>('success')
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false)

  const platformOptions = useMemo(() => {
    const set = new Set<string>()
    entities.forEach((entity) => {
      if (entity.platform) {
        set.add(entity.platform)
      }
    })
    return Array.from(set).sort()
  }, [entities])

  const filteredEntities = useMemo(() => {
    let next = [...entities]

    if (search) {
      const query = search.toLowerCase()
      next = next.filter(
        (entity) =>
          entity.name.toLowerCase().includes(query) ||
          entity.entity_code?.toLowerCase().includes(query) ||
          entity.investment_name?.toLowerCase().includes(query) ||
          entity.platform?.toLowerCase().includes(query) ||
          entity.former_entity?.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      next = next.filter((entity) => entity.status === statusFilter)
    }

    if (platformFilter !== 'all') {
      next = next.filter((entity) => entity.platform === platformFilter)
    }

    if (typeFilter !== 'all') {
      next = next.filter((entity) => entity.type === typeFilter)
    }

    if (showOnlyFlagged) {
      next = next.filter((entity) => (entity.open_flag_count ?? 0) > 0)
    }

    return next
  }, [entities, search, statusFilter, platformFilter, typeFilter, showOnlyFlagged])

  const stats = useMemo(() => {
    return {
      total: entities.length,
      live: entities.filter((e) => e.status === 'LIVE').length,
      closed: entities.filter((e) => e.status === 'CLOSED').length,
      tbd: entities.filter((e) => e.status === 'TBD').length,
      platforms: new Set(entities.map((e) => e.platform).filter(Boolean)).size
    }
  }, [entities])

  const flaggedEntities = useMemo(
    () =>
      entities
        .filter((entity) => (entity.open_flag_count ?? 0) > 0)
        .sort((a, b) => (b.open_flag_count ?? 0) - (a.open_flag_count ?? 0)),
    [entities]
  )

  const handleEntityClick = (id: string) => {
    router.push(`/versotech/staff/entities/${id}`)
  }

  const handleEntityEdit = (entity: Entity) => {
    setEditEntity(entity)
  }

  const handleStatusChange = async (entityId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/vehicles/${entityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setEntities((prev) =>
        prev.map((e) => (e.id === entityId ? { ...e, status: newStatus } : e))
      )
      setBannerTone('success')
      setBannerMessage(`Entity status updated to ${newStatus}`)
      setTimeout(() => setBannerMessage(null), 3000)
    } catch (error) {
      console.error('Failed to update status:', error)
      setBannerTone('error')
      setBannerMessage('Failed to update entity status')
      setTimeout(() => setBannerMessage(null), 3000)
    }
  }

  const refreshEntity = (updatedEntity: Entity) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === updatedEntity.id ? updatedEntity : e))
    )
  }

  return (
    <div className="p-6 space-y-6 text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Entities</h1>
          <p className="text-muted-foreground mt-1">
            Manage legal entities with comprehensive tracking and multiple view modes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/versotech/staff/documents">
              <FileText className="h-4 w-4" />
              Documents Workspace
            </Link>
          </Button>
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Entities</CardTitle>
            <CardDescription className="text-3xl text-foreground font-semibold">
              {stats.total}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Live</CardTitle>
            <CardDescription className="text-3xl text-emerald-400 font-semibold">
              {stats.live}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Closed</CardTitle>
            <CardDescription className="text-3xl text-red-400 font-semibold">
              {stats.closed}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">TBD</CardTitle>
            <CardDescription className="text-3xl text-amber-400 font-semibold">
              {stats.tbd}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Platforms</CardTitle>
            <CardDescription className="text-3xl text-foreground font-semibold">
              {stats.platforms}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {flaggedEntities.length > 0 && (
        <Card className="border border-red-400/30 bg-red-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base text-red-100 flex items-center gap-2">
                <FlagTriangleRight className="h-4 w-4" />
                Action Center
              </CardTitle>
              <CardDescription className="text-red-100/80">
                Entities with outstanding health flags. Resolve issues to keep governance on track.
              </CardDescription>
            </div>
            <Badge className="bg-red-500/20 border-red-400/40 text-red-100">{flaggedEntities.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {flaggedEntities.slice(0, 4).map((entity) => (
              <button
                key={entity.id}
                onClick={() => handleEntityClick(entity.id)}
                className="w-full text-left rounded-lg border border-red-400/30 bg-black/20 px-4 py-3 hover:bg-red-500/10 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{entity.name}</p>
                    <p className="text-xs text-red-100/80">
                      {entity.open_flag_count} unresolved flag{entity.open_flag_count === 1 ? '' : 's'} • Last update{' '}
                      {entity.last_event_at ? new Date(entity.last_event_at).toLocaleDateString() : 'n/a'}
                    </p>
                  </div>
                  <Badge className="bg-red-500/20 border-red-400/40 text-red-100">Review</Badge>
                </div>
              </button>
            ))}
            {flaggedEntities.length > 4 && (
              <p className="text-xs text-red-100/60">
                Showing top priorities. Use the filter below to focus on all flagged entities.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border border-white/10 bg-white/5">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code, name, investment, or platform"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="LIVE">Live</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="TBD">TBD</SelectItem>
                </SelectContent>
              </Select>

              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {platformOptions.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="venture_capital">Venture Capital</SelectItem>
                  <SelectItem value="private_equity">Private Equity</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                  <SelectItem value="fund">Fund</SelectItem>
                  <SelectItem value="spv">SPV</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="table" className="gap-2">
                  <Table className="h-4 w-4" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="kanban" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              id="filter-flagged"
              checked={showOnlyFlagged}
              onCheckedChange={(checked) => setShowOnlyFlagged(checked === true)}
            />
            <Label htmlFor="filter-flagged" className="cursor-pointer">
              Show only entities with unresolved flags
            </Label>
          </div>

          {filteredEntities.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-6 w-6" />
                <p>No entities found. Try adjusting your filters.</p>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'table' && (
                <EntitiesTableView
                  entities={filteredEntities}
                  onEntityClick={handleEntityClick}
                  onEntityEdit={handleEntityEdit}
                />
              )}
              {viewMode === 'list' && (
                <EntitiesListView
                  entities={filteredEntities}
                  onEntityClick={handleEntityClick}
                  onEntityEdit={handleEntityEdit}
                  onStatusChange={handleStatusChange}
                />
              )}
              {viewMode === 'kanban' && (
                <EntitiesKanbanView
                  entities={filteredEntities}
                  onEntityClick={handleEntityClick}
                  onEntityEdit={handleEntityEdit}
                  onStatusChange={handleStatusChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {editEntity && (
        <EditEntityModal
          entity={editEntity}
          open={true}
          onClose={() => setEditEntity(null)}
          onSuccess={(updated) => {
            refreshEntity(updated as Entity)
            setEditEntity(null)
          }}
        />
      )}

      <CreateEntityModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={(entity) => {
          setEntities((prev) => [entity, ...prev])
          setBannerTone('success')
          setBannerMessage(`Entity "${entity.name}" created successfully.`)
          setTimeout(() => setBannerMessage(null), 4000)
          router.refresh()
        }}
      />
    </div>
  )
}
