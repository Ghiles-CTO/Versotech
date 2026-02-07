'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Download,
  FileText,
  Plus,
  Users,
  ClipboardList,
  Activity,
  Briefcase,
  ShieldCheck,
  Edit
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UploadDocumentModal } from '@/components/deals/upload-document-modal'
import { AddDirectorModalEnhanced } from './add-director-modal-enhanced'
import { EditEntityModal } from './edit-entity-modal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Director {
  id: string
  full_name: string
  role: string | null
  email: string | null
  effective_from: string | null
  effective_to: string | null
  notes: string | null
  created_at: string
}

interface EntityDocument {
  id: string
  name: string | null
  type: string | null
  description?: string | null
  file_key?: string | null
  created_at: string
  created_by?: string | null
}

interface EntityEvent {
  id: string
  event_type: string
  description: string | null
  payload?: Record<string, unknown> | null
  created_at: string
  changed_by_profile?: {
    id: string
    display_name: string | null
    email: string | null
  } | null
}

interface LinkedDeal {
  id: string
  name: string
  status: string
  deal_type: string
  currency: string | null
  created_at: string
}

interface EntityDetailClientProps {
  entity: {
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
    formation_date: string | null
    legal_jurisdiction: string | null
    registration_number: string | null
    reporting_type: string | null
    requires_reporting: boolean | null
    notes: string | null
    logo_url: string | null
    website_url: string | null
    created_at: string
    updated_at: string | null
    address: string | null
    arranger_entity_id: string | null
    lawyer_id: string | null
    managing_partner_id: string | null
  }
  directors: Director[]
  deals: LinkedDeal[]
  events: EntityEvent[]
}

const entityTypeLabels: Record<string, string> = {
  fund: 'Fund',
  spv: 'SPV',
  securitization: 'Securitization',
  note: 'Note',
  other: 'Other'
}

export function EntityDetailClient({ entity: initialEntity, directors: initialDirectors, deals, events: initialEvents }: EntityDetailClientProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [entity, setEntity] = useState(initialEntity)
  const [directors, setDirectors] = useState<Director[]>(initialDirectors)
  const [documents, setDocuments] = useState<EntityDocument[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [documentsError, setDocumentsError] = useState<string | null>(null)
  const [events, setEvents] = useState<EntityEvent[]>(initialEvents)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [directorModalOpen, setDirectorModalOpen] = useState(false)
  const [editEntityModalOpen, setEditEntityModalOpen] = useState(false)

  const fetchDocuments = useCallback(async () => {
    setDocumentsLoading(true)
    setDocumentsError(null)
    try {
      const response = await fetch(`/api/documents?entity_id=${entity.id}`)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load documents')
      }
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error: any) {
      setDocumentsError(error.message)
    } finally {
      setDocumentsLoading(false)
    }
  }, [entity.id])

  const refreshEntityData = useCallback(async () => {
    try {
      const response = await fetch(`/api/entities/${entity.id}`)
      if (response.ok) {
        const data = await response.json()
        setEntity({ ...data.entity, updated_at: null })
        setDirectors(data.directors || [])
        setEvents(data.entity_events || [])
      }
    } catch (error) {
      console.error('Failed to refresh entity data:', error)
    }
  }, [entity.id])

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true)
    try {
      const response = await fetch(`/api/entities/${entity.id}/events`)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load events')
      }
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('[EntityDetail] Failed to load events', error)
    } finally {
      setEventsLoading(false)
    }
  }, [entity.id])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const overviewStats = useMemo(() => {
    return [
      {
        label: 'Formation Date',
        value: entity.formation_date
          ? new Date(entity.formation_date).toLocaleDateString()
          : '—',
        icon: CalendarClock
      },
      {
        label: 'Jurisdiction',
        value: entity.legal_jurisdiction || '—',
        icon: ShieldCheck
      },
      {
        label: 'Registration #',
        value: entity.registration_number || '—',
        icon: ClipboardList
      },
      {
        label: 'Active Directors',
        value: directors.filter((d) => !d.effective_to).length.toString(),
        icon: Users
      }
    ]
  }, [entity, directors])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <Link href="/versotech_main/entities" className="inline-flex">
            <Button variant="ghost" size="sm" className="gap-2 text-foreground hover:text-emerald-200 hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              Back to Vehicles
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {entity.entity_code && (
              <Badge variant="outline" className="font-mono text-lg px-3 py-1 border-emerald-400/40 text-emerald-100">
                {entity.entity_code}
              </Badge>
            )}
            <h1 className="text-3xl font-bold text-foreground">{entity.name}</h1>
            <Badge className="bg-white/10 border border-white/15 text-foreground">
              {entityTypeLabels[entity.type] || entity.type}
            </Badge>
            {entity.status && (
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
            )}
            <Badge variant="outline" className="border-emerald-400/40 text-emerald-100">
              {entity.currency}
            </Badge>
          </div>
          <div className="text-muted-foreground space-y-1">
            {entity.investment_name && (
              <p className="font-medium text-foreground">Investment: {entity.investment_name}</p>
            )}
            {entity.platform && (
              <p>Platform: {entity.platform}</p>
            )}
            <p>{entity.domicile || 'Domicile unknown'}</p>
            <p className="text-sm">
              Created {new Date(entity.created_at).toLocaleString()}
              {entity.updated_at && ` • Updated ${new Date(entity.updated_at).toLocaleString()}`}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEditEntityModalOpen(true)}
              className="gap-2 border-white/20 text-foreground hover:bg-white/10 hover:text-emerald-200"
            >
              <Edit className="h-4 w-4" />
              Edit Metadata
            </Button>
            <UploadDocumentModal
              entityId={entity.id}
              triggerLabel="Upload Entity Document"
              onUploaded={fetchDocuments}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <Card key={stat.label} className="border border-white/10 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="directors" className="gap-2">
            <Users className="h-4 w-4" />
            Directors
          </TabsTrigger>
          <TabsTrigger value="deals" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Deals
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Change Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Entity Summary</CardTitle>
              <CardDescription>Key metadata and notes for this legal vehicle.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {entity.entity_code && (
                <div>
                  <p className="text-muted-foreground">Entity Code</p>
                  <p className="text-foreground font-medium font-mono">{entity.entity_code}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Legal Name</p>
                <p className="text-foreground font-medium">{entity.name}</p>
              </div>
              {entity.investment_name && (
                <div>
                  <p className="text-muted-foreground">Investment Name</p>
                  <p className="text-foreground font-medium">{entity.investment_name}</p>
                </div>
              )}
              {entity.platform && (
                <div>
                  <p className="text-muted-foreground">Platform</p>
                  <p className="text-foreground font-medium">{entity.platform}</p>
                </div>
              )}
              {entity.former_entity && (
                <div>
                  <p className="text-muted-foreground">Former Entity</p>
                  <p className="text-foreground font-medium">{entity.former_entity}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Domicile</p>
                <p className="text-foreground font-medium">{entity.domicile || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Jurisdiction</p>
                <p className="text-foreground font-medium">{entity.legal_jurisdiction || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Registration Number</p>
                <p className="text-foreground font-medium">{entity.registration_number || '—'}</p>
              </div>
              {entity.reporting_type && (
                <div>
                  <p className="text-muted-foreground">Reporting Type</p>
                  <p className="text-foreground font-medium">{entity.reporting_type}</p>
                </div>
              )}
              {entity.requires_reporting !== null && (
                <div>
                  <p className="text-muted-foreground">Requires Reporting</p>
                  <p className="text-foreground font-medium">{entity.requires_reporting ? 'Yes' : 'No'}</p>
                </div>
              )}
              <div className="md:col-span-2">
                <p className="text-muted-foreground">Notes</p>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {entity.notes?.trim() || 'No notes recorded yet.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Linked Deals</CardTitle>
              <CardDescription>Deals currently associated with this entity.</CardDescription>
            </CardHeader>
            <CardContent>
              {deals.length === 0 ? (
                <div className="text-muted-foreground text-sm">No deals linked to this entity yet.</div>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{deal.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {deal.deal_type.replace('_', ' ')} • {deal.currency || '—'} • Created{' '}
                          {new Date(deal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/versotech_main/deals/${deal.id}`}>View Deal</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Entity Documents</CardTitle>
                <CardDescription>Corporate documents, KYCs, board resolutions, and more.</CardDescription>
              </div>
              <UploadDocumentModal entityId={entity.id} triggerLabel="Upload Entity Document" onUploaded={fetchDocuments} />
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="text-muted-foreground text-sm">Loading documents…</div>
              ) : documentsError ? (
                <div className="text-red-200 text-sm">{documentsError}</div>
              ) : documents.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No documents attached yet. Upload the first corporate document using the button above.
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {doc.name || doc.file_key?.split('/').pop() || 'Untitled document'}
                          </span>
                          {doc.type && (
                            <Badge className="bg-white/10 border border-white/10 text-foreground capitalize">{doc.type}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(doc.created_at).toLocaleString()}
                          {doc.created_by && ` • ${doc.created_by}`}
                        </p>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground max-w-2xl">{doc.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <Link href={`/api/documents/${doc.id}/download`} target="_blank">
                            <Download className="h-4 w-4" />
                            Download
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directors" className="space-y-4">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Directors & Officers</CardTitle>
                <CardDescription>Maintain the current roster and historical appointments.</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setDirectorModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Director
              </Button>
            </CardHeader>
            <CardContent>
              {directors.length === 0 ? (
                <div className="text-muted-foreground text-sm">No directors recorded yet.</div>
              ) : (
                <div className="space-y-3">
                  {directors.map((director) => (
                    <div key={director.id} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{director.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {director.role || 'Role not specified'}
                            {director.email && ` • ${director.email}`}
                          </p>
                        </div>
                        <Badge className="bg-white/10 border border-white/10 text-foreground">
                          {director.effective_to ? 'Former' : 'Active'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Effective {director.effective_from ? new Date(director.effective_from).toLocaleDateString() : 'unknown'}
                        {director.effective_to && ` • Ended ${new Date(director.effective_to).toLocaleDateString()}`}
                      </div>
                      {director.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{director.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Deals Linked to {entity.name}</CardTitle>
              <CardDescription>Manage and review investment opportunities that use this vehicle.</CardDescription>
            </CardHeader>
            <CardContent>
              {deals.length === 0 ? (
                <div className="text-muted-foreground text-sm">No deals linked to this entity yet.</div>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{deal.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {deal.deal_type.replace('_', ' ')} • {deal.currency || '—'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/versotech_main/deals/${deal.id}`}>Open Deal</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Change Log</CardTitle>
                <CardDescription>Automatic and manual updates recorded against this entity.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchEvents} disabled={eventsLoading}>
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-muted-foreground text-sm">No change events recorded yet.</div>
              ) : (
                <ScrollArea className="max-h-[24rem] pr-4">
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="border-l-2 border-emerald-400/40 pl-4">
                        <p className="text-sm font-medium text-foreground">
                          {event.event_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                          {event.changed_by_profile?.display_name && ` • ${event.changed_by_profile.display_name}`}
                        </p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Director Modal */}
      <AddDirectorModalEnhanced
        entityId={entity.id}
        open={directorModalOpen}
        onClose={() => setDirectorModalOpen(false)}
        onSuccess={refreshEntityData}
      />

      {/* Edit Entity Modal */}
      <EditEntityModal
        entity={entity}
        open={editEntityModalOpen}
        onClose={() => setEditEntityModalOpen(false)}
        onSuccess={refreshEntityData}
      />
    </div>
  )
}


