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
  Edit,
  FolderOpen,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UploadDocumentModal } from '@/components/deals/upload-document-modal'
import { AddDirectorModalEnhanced } from './add-director-modal-enhanced'
import { AddStakeholderModal } from './add-stakeholder-modal'
import { EditEntityModal } from './edit-entity-modal'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

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

interface Stakeholder {
  id: string
  role: string
  company_name: string | null
  contact_person: string | null
  email: string | null
  phone: string | null
  effective_from: string | null
  effective_to: string | null
  notes: string | null
  created_at: string
}

interface Folder {
  id: string
  folder_type: string
  folder_name: string
  description: string | null
  is_default: boolean
  created_at: string
}

interface Flag {
  id: string
  flag_type: string
  severity: string
  title: string
  description: string | null
  due_date: string | null
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
  formation_date: string | null
  legal_jurisdiction: string | null
  registration_number: string | null
  reporting_type: string | null
  requires_reporting: boolean | null
  notes: string | null
  created_at: string
  updated_at: string | null
  logo_url?: string | null
  website_url?: string | null
}

interface EntityDetailEnhancedProps {
  entity: Entity
  directors: Director[]
  stakeholders: Stakeholder[]
  folders: Folder[]
  flags: Flag[]
  deals: LinkedDeal[]
  events: EntityEvent[]
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

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <AlertTriangle className="h-4 w-4 text-red-400" />
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-amber-400" />
    case 'info':
      return <Info className="h-4 w-4 text-blue-400" />
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/20 border-red-400/40 text-red-100'
    case 'warning':
      return 'bg-amber-500/20 border-amber-400/40 text-amber-100'
    case 'info':
      return 'bg-blue-500/20 border-blue-400/40 text-blue-100'
    case 'success':
      return 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
    default:
      return 'bg-white/10 border-white/10 text-foreground'
  }
}

const formatWebsite = (website?: string | null) => {
  if (!website) return null

  try {
    const url = new URL(website)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return website.replace(/^https?:\/\//, '')
  }
}

export function EntityDetailEnhanced({
  entity: initialEntity,
  directors: initialDirectors,
  stakeholders: initialStakeholders,
  folders: initialFolders,
  flags: initialFlags,
  deals,
  events: initialEvents
}: EntityDetailEnhancedProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [entity, setEntity] = useState(initialEntity)
  const [directors, setDirectors] = useState<Director[]>(initialDirectors)
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(initialStakeholders)
  const [folders, setFolders] = useState<Folder[]>(initialFolders)
  const [flags, setFlags] = useState<Flag[]>(initialFlags)
  const [documents, setDocuments] = useState<EntityDocument[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [documentsError, setDocumentsError] = useState<string | null>(null)
  const [events, setEvents] = useState<EntityEvent[]>(initialEvents)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [directorModalOpen, setDirectorModalOpen] = useState(false)
  const [stakeholderModalOpen, setStakeholderModalOpen] = useState(false)
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
      const response = await fetch(`/api/vehicles/${entity.id}`)
      if (response.ok) {
        const data = await response.json()
        setEntity(data.entity)
        setDirectors(data.directors || [])
        setStakeholders(data.stakeholders || [])
        setFolders(data.folders || [])
        setFlags(data.flags || [])
        setEvents(data.entity_events || [])
      }
    } catch (error) {
      console.error('Failed to refresh entity data:', error)
    }
  }, [entity.id])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const overviewStats = useMemo(() => {
    return [
      {
        label: 'Entity Code',
        value: entity.entity_code || '—',
        icon: ClipboardList
      },
      {
        label: 'Platform',
        value: entity.platform || '—',
        icon: Building2
      },
      {
        label: 'Formation Date',
        value: entity.formation_date
          ? new Date(entity.formation_date).toLocaleDateString()
          : '—',
        icon: CalendarClock
      },
      {
        label: 'Active Stakeholders',
        value: stakeholders.filter((s) => !s.effective_to).length.toString(),
        icon: Users
      }
    ]
  }, [entity, stakeholders])
  const logoUrl = entity.logo_url || ''

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="space-y-4 max-w-3xl">
          <Link href="/versotech/staff/entities" className="inline-flex">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-foreground hover:text-emerald-200 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Entities
            </Button>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            {entity.entity_code && (
              <Badge
                variant="outline"
                className="font-mono text-lg px-3 py-1 border-emerald-400/40 text-emerald-100"
              >
                {entity.entity_code}
              </Badge>
            )}
            <h1 className="text-3xl font-bold text-foreground">{entity.name}</h1>
            <Badge className="bg-white/10 border-white/15 text-foreground">
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
              <p className="font-medium text-foreground text-lg">
                Investment: {entity.investment_name}
              </p>
            )}
            {entity.platform && <p>Platform: {entity.platform}</p>}
            {entity.former_entity && <p>Formerly: {entity.former_entity}</p>}
            <p>{entity.domicile || 'Domicile unknown'}</p>
            <p className="text-sm">
              Created {new Date(entity.created_at).toLocaleString()}
              {entity.updated_at && ` • Updated ${new Date(entity.updated_at).toLocaleString()}`}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 w-[220px] flex flex-col items-center gap-3 text-sm">
            <div className="h-24 w-24 rounded-xl border border-white/10 bg-black/60 flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={`${entity.name} logo`}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <Building2 className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Branding</p>
              <p className="text-sm font-medium text-foreground">
                {logoUrl ? 'Logo uploaded' : 'No logo set'}
              </p>
              {formatWebsite(entity.website_url) && (
                <a
                  href={entity.website_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
                >
                  {formatWebsite(entity.website_url)}
                </a>
              )}
            </div>
          </div>
          <Button
            onClick={() => setEditEntityModalOpen(true)}
            className="gap-2 rounded-full bg-emerald-500 text-emerald-950 px-5 shadow-[0_12px_30px_rgba(16,185,129,0.35)] transition-colors hover:bg-emerald-400"
          >
            <Edit className="h-4 w-4" />
            Edit Metadata
          </Button>
        </div>
      </div>

      {flags.length > 0 && (
        <Card className="border-amber-400/40 bg-amber-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Action Required ({flags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {flags.slice(0, 3).map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  {getSeverityIcon(flag.severity)}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{flag.title}</p>
                    {flag.description && (
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                    )}
                  </div>
                  <Badge className={getSeverityColor(flag.severity)}>{flag.severity}</Badge>
                </div>
              ))}
              {flags.length > 3 && (
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('flags')}>
                  View all {flags.length} flags
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <Card key={stat.label} className="border border-white/10 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
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
            <FolderOpen className="h-4 w-4" />
            Documents & Folders
          </TabsTrigger>
          <TabsTrigger value="stakeholders" className="gap-2">
            <Users className="h-4 w-4" />
            Stakeholders ({stakeholders.length})
          </TabsTrigger>
          <TabsTrigger value="directors" className="gap-2">
            <Users className="h-4 w-4" />
            Directors ({directors.length})
          </TabsTrigger>
          <TabsTrigger value="deals" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Deals ({deals.length})
          </TabsTrigger>
          <TabsTrigger value="flags" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Flags ({flags.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - showing CSV fields */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Entity Details</CardTitle>
              <CardDescription>Complete information about this entity</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {entity.entity_code && (
                <div>
                  <p className="text-muted-foreground">Entity Code</p>
                  <p className="text-foreground font-medium font-mono text-lg">
                    {entity.entity_code}
                  </p>
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
                <p className="text-muted-foreground">Type</p>
                <p className="text-foreground font-medium">
                  {entityTypeLabels[entity.type] || entity.type}
                </p>
              </div>
              {entity.status && (
                <div>
                  <p className="text-muted-foreground">Status</p>
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
              <div>
                <p className="text-muted-foreground">Currency</p>
                <p className="text-foreground font-medium">{entity.currency}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Formation Date</p>
                <p className="text-foreground font-medium">
                  {entity.formation_date
                    ? new Date(entity.formation_date).toLocaleDateString()
                    : '—'}
                </p>
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
                  <Badge variant="outline">
                    {entity.requires_reporting ? 'Yes' : 'No'}
                  </Badge>
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
        </TabsContent>

        {/* Documents & Folders Tab - Combined */}
        <TabsContent value="documents" className="space-y-4">
          {/* Folder Structure */}
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Document Folders</CardTitle>
                  <CardDescription>
                    Organize documents by type: KYC, Legal, Redemption, etc.
                  </CardDescription>
                </div>
                <UploadDocumentModal
                  entityId={entity.id}
                  triggerLabel="Upload Document"
                  onUploaded={fetchDocuments}
                />
              </div>
            </CardHeader>
            <CardContent>
              {folders.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No folders created yet. Folders will be created automatically or you can create custom folders.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folders.map((folder) => {
                    const folderDocs = documents.filter(
                      (doc) => doc.type === folder.folder_type || doc.description?.includes(folder.folder_type)
                    )
                    return (
                      <div
                        key={folder.id}
                        className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <FolderOpen className="h-5 w-5 text-emerald-400 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-foreground">{folder.folder_name}</p>
                              <Badge variant="outline" className="text-xs">
                                {folderDocs.length}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground capitalize">
                              {folder.folder_type.replace('_', ' ')}
                            </p>
                            {folder.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {folder.description}
                              </p>
                            )}
                            {folder.is_default && (
                              <Badge variant="outline" className="text-xs mt-2">
                                Default
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Documents List */}
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>All Documents ({documents.length})</CardTitle>
              <CardDescription>
                Complete list of all documents across all folders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="text-muted-foreground text-sm">Loading documents…</div>
              ) : documentsError ? (
                <div className="text-red-200 text-sm">{documentsError}</div>
              ) : documents.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No documents uploaded yet. Use the "Upload Document" button above to add documents.
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
                            <Badge className="bg-white/10 border border-white/10 text-foreground capitalize">
                              {doc.type.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(doc.created_at).toLocaleString()}
                          {doc.created_by && ` • ${doc.created_by}`}
                        </p>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground max-w-2xl">
                            {doc.description}
                          </p>
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

        {/* Stakeholders Tab */}
        <TabsContent value="stakeholders" className="space-y-4">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Stakeholders</CardTitle>
                <CardDescription>
                  Lawyers, accountants, auditors, administrators, and strategic partners
                </CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setStakeholderModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Stakeholder
              </Button>
            </CardHeader>
            <CardContent>
              {stakeholders.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No stakeholders recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {stakeholders.map((stakeholder) => (
                    <div
                      key={stakeholder.id}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {stakeholder.company_name || stakeholder.contact_person || 'Unnamed'}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {stakeholder.role.replace('_', ' ')}
                            {stakeholder.email && ` • ${stakeholder.email}`}
                            {stakeholder.phone && ` • ${stakeholder.phone}`}
                          </p>
                        </div>
                        <Badge className="bg-white/10 border border-white/10 text-foreground">
                          {stakeholder.effective_to ? 'Former' : 'Active'}
                        </Badge>
                      </div>
                      {stakeholder.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{stakeholder.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Directors Tab */}
        <TabsContent value="directors" className="space-y-4">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Directors & Officers</CardTitle>
                <CardDescription>
                  Maintain the current roster and historical appointments
                </CardDescription>
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
                    <div
                      key={director.id}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                    >
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
                        Effective{' '}
                        {director.effective_from
                          ? new Date(director.effective_from).toLocaleDateString()
                          : 'unknown'}
                        {director.effective_to &&
                          ` • Ended ${new Date(director.effective_to).toLocaleDateString()}`}
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

        {/* Deals Tab */}
        <TabsContent value="deals" className="space-y-4">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Deals Linked to {entity.name}</CardTitle>
              <CardDescription>
                Manage and review investment opportunities that use this vehicle
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deals.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No deals linked to this entity yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{deal.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {deal.deal_type.replace('_', ' ')} • {deal.currency || '—'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/versotech/staff/deals/${deal.id}`}>Open Deal</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flags Tab */}
        <TabsContent value="flags" className="space-y-4">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Action Items & Flags</CardTitle>
              <CardDescription>
                Track compliance issues, missing documents, and action items
              </CardDescription>
            </CardHeader>
            <CardContent>
              {flags.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No flags or action items. Everything looks good!
                </div>
              ) : (
                <div className="space-y-3">
                  {flags.map((flag) => (
                    <div
                      key={flag.id}
                      className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
                    >
                      {getSeverityIcon(flag.severity)}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-foreground">{flag.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {flag.flag_type.replace('_', ' ')}
                            </p>
                          </div>
                          <Badge className={getSeverityColor(flag.severity)}>
                            {flag.severity}
                          </Badge>
                        </div>
                        {flag.description && (
                          <p className="text-sm text-muted-foreground mt-2">{flag.description}</p>
                        )}
                        {flag.due_date && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Due: {new Date(flag.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Change Log</CardTitle>
                <CardDescription>
                  Automatic and manual updates recorded against this entity
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshEntityData}
                disabled={eventsLoading}
              >
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No change events recorded yet.
                </div>
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
                          {event.changed_by_profile?.display_name &&
                            ` • ${event.changed_by_profile.display_name}`}
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

      {/* Modals */}
      <AddDirectorModalEnhanced
        entityId={entity.id}
        open={directorModalOpen}
        onClose={() => setDirectorModalOpen(false)}
        onSuccess={refreshEntityData}
      />

      <AddStakeholderModal
        entityId={entity.id}
        open={stakeholderModalOpen}
        onClose={() => setStakeholderModalOpen(false)}
        onSuccess={refreshEntityData}
      />

      <EditEntityModal
        entity={entity}
        open={editEntityModalOpen}
        onClose={() => setEditEntityModalOpen(false)}
        onSuccess={(updated) => {
          setEntity(updated as Entity)
          setEditEntityModalOpen(false)
        }}
      />
    </div>
  )
}
