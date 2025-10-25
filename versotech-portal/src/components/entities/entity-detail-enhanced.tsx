'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  Info,
  Loader2,
  ExternalLink,
  RefreshCw,
  Trash2,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
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
import { UploadDocumentModal } from '@/components/deals/upload-document-modal'
import { AddDirectorModalEnhanced } from './add-director-modal-enhanced'
import { AddStakeholderModal } from './add-stakeholder-modal'
import { EditEntityModal } from './edit-entity-modal'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { LinkEntityInvestorModal } from './link-entity-investor-modal'
import { EntityInvestorSummary, EntityFlagSummary } from './types'
import { toast } from 'sonner'
import { AddEntityFlagModal } from './add-entity-flag-modal'
import { EntityHealthMonitor } from './entity-health-monitor'
import { FolderManager } from './folder-manager'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

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
  parent_folder_id: string | null
  name: string
  path: string
  folder_type: string
  created_at: string
  updated_at: string
}

interface EntityDocument {
  id: string
  name: string | null
  type: string | null
  description?: string | null
  file_key?: string | null
  external_url?: string | null
  link_type?: string | null
  created_at: string
  created_by?: string | null
  folder_id?: string | null
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
  flags: EntityFlagSummary[]
  deals: LinkedDeal[]
  events: EntityEvent[]
  investors: EntityInvestorSummary[]
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

const getAllocationStatusColor = (status?: string | null) => {
  switch (status) {
    case 'active':
    case 'committed':
      return 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
    case 'closed':
      return 'bg-blue-500/20 border-blue-400/40 text-blue-100'
    case 'cancelled':
      return 'bg-red-500/20 border-red-400/40 text-red-100'
    default:
      return 'bg-amber-500/20 border-amber-400/40 text-amber-100'
  }
}

const getFlagStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-red-500/20 border-red-400/40 text-red-100'
    case 'in_progress':
      return 'bg-blue-500/20 border-blue-400/40 text-blue-100'
    case 'closed':
      return 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
    default:
      return 'bg-white/10 border-white/10 text-foreground'
  }
}

const formatCurrencyValue = (amount?: number | null, currency?: string | null) => {
  if (amount == null) return null
  const currencyCode = (currency || 'USD').toUpperCase()
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(amount)
  } catch {
    return `${currencyCode} ${amount.toLocaleString()}`
  }
}

const formatWorkbookDate = (value?: string | number | null) => {
  if (value == null || value === '') {
    return '—'
  }

  const castNumber = typeof value === 'number' ? value : Number(value)
  if (!Number.isNaN(castNumber) && castNumber > 0) {
    const excelEpoch = new Date(1899, 11, 30)
    const computed = new Date(excelEpoch.getTime() + castNumber * 24 * 60 * 60 * 1000)
    if (!Number.isNaN(computed.getTime())) {
      return computed.toLocaleDateString()
    }
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString()
    }
  }

  return String(value)
}

const AcknowledgementNotes = ({ notes }: { notes: string }) => {
  try {
    const parsed = JSON.parse(notes)
    const lineItems: Array<Record<string, unknown>> = Array.isArray(parsed?.line_items)
      ? parsed.line_items
      : []

    if (lineItems.length > 0) {
      return (
        <div className="mt-2 space-y-2 rounded-md border border-emerald-400/30 bg-emerald-500/5 p-3 text-xs text-emerald-50">
          <div className="flex flex-wrap items-center gap-2 text-emerald-200">
            <span className="font-semibold uppercase tracking-wide">
              {parsed?.source ? String(parsed.source) : 'Legacy workbook import'}
            </span>
            {parsed?.run_id && <span>Run ID {parsed.run_id}</span>}
          </div>
          <div className="space-y-2">
            {lineItems.map((item, index) => {
              const sheet = String(item.sheet ?? 'Sheet')
              const row = item.row != null ? String(item.row) : '?'
              const amountValue =
                item.amount_converted ??
                item.amount_original ??
                undefined
              const amountNumber =
                typeof amountValue === 'number'
                  ? amountValue
                  : amountValue != null
                    ? Number(amountValue)
                    : undefined
              const currency =
                item.currency_converted ??
                item.currency_original ??
                parsed?.currency ??
                'USD'
              const comment = item.comments ? String(item.comments) : null
              const orderDate = formatWorkbookDate(item.order_date as string | number | null)
              const settlementDate = formatWorkbookDate(
                item.settlement_date as string | number | null
              )

              const amountDisplay =
                amountNumber != null && !Number.isNaN(amountNumber)
                  ? formatCurrencyValue(amountNumber, String(currency)) ??
                    amountNumber.toLocaleString()
                  : null

              return (
                <div
                  key={`${sheet}-${row}-${index}`}
                  className="rounded border border-emerald-500/20 bg-emerald-500/10 p-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold uppercase tracking-wide text-emerald-200">
                      {sheet} #{row}
                    </span>
                    {amountDisplay && <span>{amountDisplay}</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4 text-emerald-100">
                    {orderDate !== '—' && <span>Order: {orderDate}</span>}
                    {settlementDate !== '—' && <span>Settlement: {settlementDate}</span>}
                  </div>
                  {comment && <p className="mt-1 italic text-emerald-200">{comment}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  } catch (error) {
    // fall back to default rendering below
  }

  return (
    <p className="mt-2 whitespace-pre-wrap break-words text-emerald-50">
      {notes}
    </p>
  )
}

const stakeholderCategoryConfig = [
  { key: 'shareholders', label: 'Shareholders', roles: ['shareholder'] },
  { key: 'legal', label: 'Legal & Counsel', roles: ['lawyer'] },
  { key: 'accounting', label: 'Accounting', roles: ['accountant'] },
  { key: 'auditors', label: 'Auditors', roles: ['auditor'] },
  { key: 'administrators', label: 'Administrators', roles: ['administrator'] },
  { key: 'strategic', label: 'Strategic Partners', roles: ['strategic_partner'] },
  { key: 'other', label: 'Other Stakeholders', roles: ['other'] }
]

const formatWebsite = (website?: string | null) => {
  if (!website) return null

  try {
    const url = new URL(website)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return website.replace(/^https?:\/\//, '')
  }
}

const allocationStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'committed', label: 'Committed' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' }
]

export function EntityDetailEnhanced({
  entity: initialEntity,
  directors: initialDirectors,
  stakeholders: initialStakeholders,
  folders: initialFolders,
  flags: initialFlags,
  deals,
  events: initialEvents,
  investors: initialInvestors
}: EntityDetailEnhancedProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [entity, setEntity] = useState(initialEntity)
  const [directors, setDirectors] = useState<Director[]>(initialDirectors)
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(initialStakeholders)
  const [folders, setFolders] = useState<Folder[]>(initialFolders)
  const [flags, setFlags] = useState<EntityFlagSummary[]>(initialFlags)
  const [documents, setDocuments] = useState<EntityDocument[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [documentsError, setDocumentsError] = useState<string | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [events, setEvents] = useState<EntityEvent[]>(initialEvents)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [directorModalOpen, setDirectorModalOpen] = useState(false)
  const [stakeholderModalOpen, setStakeholderModalOpen] = useState(false)
  const [editEntityModalOpen, setEditEntityModalOpen] = useState(false)
  const [investors, setInvestors] = useState<EntityInvestorSummary[]>(initialInvestors)
  const [investorModalOpen, setInvestorModalOpen] = useState(false)
  const [updatingInvestorId, setUpdatingInvestorId] = useState<string | null>(null)
  const [removingInvestorId, setRemovingInvestorId] = useState<string | null>(null)
  const [investorRefreshLoading, setInvestorRefreshLoading] = useState(false)
  const [flagModalOpen, setFlagModalOpen] = useState(false)
  const [resolvingFlagId, setResolvingFlagId] = useState<string | null>(null)
  const [flagRefreshLoading, setFlagRefreshLoading] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<EntityDocument | null>(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<{investorId: string, subscription: any} | null>(null)
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false)
  const [savingSubscription, setSavingSubscription] = useState(false)

  // Subscription form refs
  const commitmentRef = useRef<HTMLInputElement>(null)
  const currencyRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<string>('')
  const effectiveDateRef = useRef<HTMLInputElement>(null)
  const fundingDueDateRef = useRef<HTMLInputElement>(null)
  const unitsRef = useRef<HTMLInputElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)

  const fetchFolders = useCallback(async () => {
    try {
      const response = await fetch(`/api/entities/${entity.id}/folders`)
      if (!response.ok) {
        throw new Error('Failed to fetch folders')
      }
      const data = await response.json()
      setFolders(data.folders || [])
    } catch (error) {
      console.error('Failed to fetch folders:', error)
      toast.error('Failed to refresh folders')
    }
  }, [entity.id])

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
        setInvestors((data.investors || []) as EntityInvestorSummary[])
        setEvents((data.entity_events || []) as EntityEvent[])
      }
    } catch (error) {
      console.error('Failed to refresh entity data:', error)
    }
  }, [entity.id])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  useEffect(() => {
    if (selectedFolderId && folders.some((folder) => folder.id === selectedFolderId)) {
      return
    }
    if (folders.length > 0) {
      setSelectedFolderId(folders[0].id)
    } else {
      setSelectedFolderId(null)
    }
  }, [folders, selectedFolderId])

  const activeDirectors = useMemo(
    () => directors.filter((director) => !director.effective_to),
    [directors]
  )

  const formerDirectors = useMemo(
    () => directors.filter((director) => director.effective_to),
    [directors]
  )

  const stakeholderSections = useMemo(() => {
    const groups: Record<string, Stakeholder[]> = {}
    stakeholderCategoryConfig.forEach((category) => {
      groups[category.key] = []
    })

    stakeholders.forEach((stakeholder) => {
      const category =
        stakeholderCategoryConfig.find((config) => config.roles.includes(stakeholder.role)) ??
        stakeholderCategoryConfig.find((config) => config.key === 'other')
      const key = category?.key ?? 'other'
      if (!groups[key]) groups[key] = []
      groups[key].push(stakeholder)
    })

    return groups
  }, [stakeholders])

  const folderMap = useMemo(() => {
    const map = new Map<string, Folder>()
    folders.forEach((folder) => map.set(folder.id, folder))
    return map
  }, [folders])

  const filteredDocuments = useMemo(() => {
    if (!selectedFolderId) return documents
    return documents.filter((doc) => doc.folder_id === selectedFolderId)
  }, [documents, selectedFolderId])

  const activeFolder = selectedFolderId ? folderMap.get(selectedFolderId) ?? null : null

  const sortedFlags = useMemo(() => {
    const statusPriority: Record<string, number> = {
      open: 0,
      in_progress: 1,
      closed: 2
    }

    return [...flags].sort((a, b) => {
      const priorityDiff =
        (statusPriority[a.status] ?? 3) - (statusPriority[b.status] ?? 3)
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [flags])

  const refreshInvestors = useCallback(async () => {
    setInvestorRefreshLoading(true)
    try {
      const response = await fetch(`/api/entities/${entity.id}/investors`)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load investors')
      }
      const data = await response.json()
      setInvestors((data.investors || []) as EntityInvestorSummary[])
    } catch (error) {
      console.error('Failed to refresh investors:', error)
      toast.error('Unable to reload entity investors.')
    } finally {
      setInvestorRefreshLoading(false)
    }
  }, [entity.id])

  const refreshFlags = useCallback(async () => {
    setFlagRefreshLoading(true)
    try {
      const response = await fetch(`/api/entities/${entity.id}/flags`)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load flags')
      }
      const data = await response.json()
      setFlags((data.flags || []) as EntityFlagSummary[])
    } catch (error) {
      console.error('Failed to refresh flags:', error)
      toast.error('Unable to reload entity flags.')
    } finally {
      setFlagRefreshLoading(false)
    }
  }, [entity.id])

  const handleInvestorAdded = useCallback(
    (investor: EntityInvestorSummary) => {
      setInvestors((prev) => [investor, ...prev])
      toast.success('Investor linked to entity.')
    },
    []
  )

  const handleInvestorStatusChange = useCallback(
    async (linkId: string, newStatus: string, hasSubscription: boolean) => {
      setUpdatingInvestorId(linkId)
      try {
        const payload: Record<string, any> = { allocation_status: newStatus }
        if (hasSubscription) {
          payload.subscription = { status: newStatus }
        }

        const response = await fetch(`/api/entities/${entity.id}/investors/${linkId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to update investor')
        }

        const data = await response.json()
        setInvestors((prev) => prev.map((inv) => (inv.id === linkId ? (data.investor as EntityInvestorSummary) : inv)))
        toast.success('Investor allocation updated.')
      } catch (error) {
        console.error('Failed to update investor status:', error)
        toast.error('Unable to update investor allocation.')
      } finally {
        setUpdatingInvestorId(null)
      }
    },
    [entity.id]
  )

  // Initialize statusRef when editing subscription changes
  useEffect(() => {
    if (editingSubscription?.subscription) {
      statusRef.current = editingSubscription.subscription.status || 'pending'
    }
  }, [editingSubscription])

  const handleSaveSubscription = useCallback(async () => {
    if (!editingSubscription) return

    setSavingSubscription(true)
    try {
      const payload: Record<string, any> = {}

      // Build subscription update object
      const subscriptionUpdate: Record<string, any> = {}

      if (commitmentRef.current?.value) {
        subscriptionUpdate.commitment = parseFloat(commitmentRef.current.value)
      }

      if (currencyRef.current?.value) {
        subscriptionUpdate.currency = currencyRef.current.value.toUpperCase()
      }

      if (statusRef.current) {
        subscriptionUpdate.status = statusRef.current
        payload.allocation_status = statusRef.current
      }

      if (effectiveDateRef.current?.value) {
        subscriptionUpdate.effective_date = effectiveDateRef.current.value
      }

      if (fundingDueDateRef.current?.value) {
        subscriptionUpdate.funding_due_at = fundingDueDateRef.current.value
      }

      if (unitsRef.current?.value) {
        subscriptionUpdate.units = parseFloat(unitsRef.current.value)
      }

      if (notesRef.current?.value !== undefined) {
        subscriptionUpdate.acknowledgement_notes = notesRef.current.value
      }

      payload.subscription = subscriptionUpdate

      const response = await fetch(`/api/entities/${entity.id}/investors/${editingSubscription.investorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update subscription')
      }

      const data = await response.json()
      setInvestors((prev) =>
        prev.map((inv) =>
          inv.id === editingSubscription.investorId ? (data.investor as EntityInvestorSummary) : inv
        )
      )

      toast.success('Subscription updated successfully!')
      setSubscriptionModalOpen(false)
      setEditingSubscription(null)
    } catch (error) {
      console.error('Failed to update subscription:', error)
      toast.error('Unable to update subscription.')
    } finally {
      setSavingSubscription(false)
    }
  }, [editingSubscription, entity.id])

  const handleRemoveInvestor = useCallback(
    async (linkId: string) => {
      setRemovingInvestorId(linkId)
      try {
        const response = await fetch(`/api/entities/${entity.id}/investors/${linkId}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to remove investor')
        }

        setInvestors((prev) => prev.filter((inv) => inv.id !== linkId))
        toast.success('Investor unlinked from entity.')
      } catch (error) {
        console.error('Failed to remove investor:', error)
        toast.error('Unable to remove investor from entity.')
      } finally {
        setRemovingInvestorId(null)
      }
    },
    [entity.id]
  )

  const handlePreviewDocument = useCallback(async (doc: EntityDocument) => {
    setPreviewDocument(doc)
    setPreviewModalOpen(true)
    setLoadingPreview(true)
    setPreviewUrl(null)

    try {
      const response = await fetch(`/api/documents/${doc.id}/download`)
      if (!response.ok) {
        throw new Error('Failed to get document URL')
      }

      const data = await response.json()
      if (data.download_url) {
        setPreviewUrl(data.download_url)
      }
    } catch (error) {
      console.error('Failed to load document preview:', error)
      toast.error('Failed to load document preview')
    } finally {
      setLoadingPreview(false)
    }
  }, [])

  const handleDownloadDocument = useCallback(async (docId: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}/download`)
      if (!response.ok) {
        throw new Error('Failed to get download URL')
      }

      const data = await response.json()
      if (data.download_url) {
        window.open(data.download_url, '_blank')
      }
    } catch (error) {
      console.error('Failed to download document:', error)
      toast.error('Failed to download document')
    }
  }, [])

  const handleFlagCreated = useCallback(
    (flag: EntityFlagSummary) => {
      setFlags((prev) => [flag, ...prev])
      toast.success('Flag created for this entity.')
    },
    []
  )

  const updateFlag = useCallback(
    async (flagId: string, updates: Record<string, unknown>, message?: string) => {
      setResolvingFlagId(flagId)
      try {
        const response = await fetch(`/api/entities/${entity.id}/flags/${flagId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to update flag')
        }

        const data = await response.json()
        setFlags((prev) =>
          prev.map((flag) => (flag.id === flagId ? (data.flag as EntityFlagSummary) : flag))
        )
        if (message) {
          toast.success(message)
        }
      } catch (error) {
        console.error('Failed to update flag:', error)
        toast.error(error instanceof Error ? error.message : 'Unable to update flag.')
      } finally {
        setResolvingFlagId(null)
      }
    },
    [entity.id]
  )

  const handleResolveFlag = useCallback(
    async (flagId: string) => {
      await updateFlag(flagId, { status: 'closed' }, 'Flag marked as resolved.')
    },
    [updateFlag]
  )

  const handleReopenFlag = useCallback(
    async (flagId: string) => {
      await updateFlag(
        flagId,
        { status: 'open', resolution_notes: null, resolved_at: null },
        'Flag reopened.'
      )
    },
    [updateFlag]
  )

  const handleProgressFlag = useCallback(
    async (flagId: string) => {
      await updateFlag(flagId, { status: 'in_progress' }, 'Flag marked in progress.')
    },
    [updateFlag]
  )

  const handleDeleteFlag = useCallback(
    async (flagId: string) => {
      try {
        const response = await fetch(`/api/entities/${entity.id}/flags/${flagId}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to remove flag')
        }

        setFlags((prev) => prev.filter((flag) => flag.id !== flagId))
        toast.success('Flag removed from entity.')
      } catch (error) {
        console.error('Failed to delete flag:', error)
        toast.error(error instanceof Error ? error.message : 'Unable to delete flag.')
      }
    },
    [entity.id]
  )

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
          <TabsTrigger value="investors" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Investors ({investors.length})
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
          <TabsTrigger value="health" className="gap-2">
            <Activity className="h-4 w-4" />
            Health
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activity Log
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

        {/* Investors Tab */}
        <TabsContent value="investors" className="space-y-4">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Investors & Allocations</CardTitle>
                <CardDescription>
                  Manage allocations, commitments, and onboarding for this vehicle.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refreshInvestors} disabled={investorRefreshLoading}>
                  {investorRefreshLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Refresh
                </Button>
                <Button size="sm" className="gap-2" onClick={() => setInvestorModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Link Investor
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {investors.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No investors linked yet. Use &ldquo;Link Investor&rdquo; to allocate commitments to this
                  vehicle.
                </div>
              ) : (
                <div className="space-y-3">
                  {investors.map((investor) => {
                    const allocationStatus = investor.allocation_status || 'pending'
                    const investorProfile = investor.investor
                    const subscriptionEntries = investor.subscriptions ?? []
                    const primarySubscription = investor.subscription
                    const hasSubscription = subscriptionEntries.length > 0
                    const holdings = investor.holdings ?? []
                    const hasHoldings = holdings.length > 0
                    const totalCommitment =
                      investor.total_commitment ??
                      (hasSubscription
                        ? subscriptionEntries.reduce(
                            (sum, entry) => sum + (entry.commitment ?? 0),
                            0
                          )
                        : null)
                    const totalHoldingsAmount =
                      investor.total_holdings_amount ??
                      (hasHoldings
                        ? holdings.reduce((sum, entry) => sum + (entry.subscribed_amount ?? 0), 0)
                        : null)

                    return (
                      <div
                        key={investor.id}
                        className="rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-lg font-semibold text-foreground">
                                {investorProfile?.legal_name || 'Unknown Investor'}
                              </p>
                              {investorProfile?.type && (
                                <Badge variant="outline" className="bg-white/10 text-xs capitalize">
                                  {investorProfile.type.replace(/_/g, ' ')}
                                </Badge>
                              )}
                              <Badge className={getAllocationStatusColor(allocationStatus)}>
                                {allocationStatus.replace(/_/g, ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              {investor.relationship_role && (
                                <p>
                                  <span className="font-medium text-foreground">Role:</span>{' '}
                                  {investor.relationship_role || '-'}
                                </p>
                              )}
                              {investorProfile?.email && <p>{investorProfile.email}</p>}
                              {investor.invite_sent_at && (
                                <p>
                                  Invite sent {new Date(investor.invite_sent_at).toLocaleString()}
                                </p>
                              )}
                              <p>
                                Linked {new Date(investor.created_at).toLocaleString()}
                              </p>
                            </div>

                            {hasSubscription && (
                              <div className="rounded-md border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-emerald-100">
                                        Subscription{subscriptionEntries.length > 1 ? 's' : ''}
                                        {subscriptionEntries.length > 1 && (
                                          <span className="ml-1 text-xs">({subscriptionEntries.length})</span>
                                        )}
                                      </p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs text-emerald-200 hover:text-emerald-100 hover:bg-emerald-500/20"
                                        onClick={() => {
                                          setEditingSubscription({
                                            investorId: investor.id,
                                            subscription: primarySubscription
                                          })
                                          setSubscriptionModalOpen(true)
                                        }}
                                      >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                      </Button>
                                    </div>
                                    {totalCommitment != null ? (
                                      <p className="text-sm text-emerald-200">
                                        {formatCurrencyValue(
                                          totalCommitment,
                                          primarySubscription?.currency
                                        )}
                                      </p>
                                    ) : (
                                      <p className="text-sm text-emerald-200">Not set</p>
                                    )}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="border-emerald-400/40 bg-emerald-500/10 text-emerald-100 uppercase"
                                  >
                                    {primarySubscription?.status?.replace(/_/g, ' ') || allocationStatus}
                                  </Badge>
                                </div>
                                <div className="mt-3 space-y-3 text-xs text-emerald-200">
                                  {subscriptionEntries.map((entry) => {
                                    const displayAmount = formatCurrencyValue(
                                      entry.commitment,
                                      entry.currency
                                    )
                                    return (
                                      <div
                                        key={entry.id}
                                        className="rounded border border-emerald-400/20 bg-emerald-500/5 p-2"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <span className="font-medium text-emerald-100">
                                            {displayAmount || 'Commitment pending'}
                                          </span>
                                          <Badge className="bg-emerald-500/20 text-emerald-100 uppercase">
                                            {entry.status?.replace(/_/g, ' ') || 'Pending'}
                                          </Badge>
                                        </div>
                                        <div className="mt-1 grid gap-2 md:grid-cols-3">
                                          <div>
                                            <p className="font-semibold uppercase tracking-wide text-emerald-300">
                                              Effective
                                            </p>
                                            <p>
                                              {entry.effective_date
                                                ? new Date(entry.effective_date).toLocaleDateString()
                                                : '—'}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="font-semibold uppercase tracking-wide text-emerald-300">
                                              Funding Due
                                            </p>
                                            <p>
                                              {entry.funding_due_at
                                                ? new Date(entry.funding_due_at).toLocaleDateString()
                                                : '—'}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="font-semibold uppercase tracking-wide text-emerald-300">
                                              Units
                                            </p>
                                            <p>{entry.units ?? '—'}</p>
                                          </div>
                                        </div>
                                        {entry.acknowledgement_notes && (
                                          <AcknowledgementNotes notes={entry.acknowledgement_notes} />
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {hasHoldings && (
                              <div className="rounded-md border border-blue-400/30 bg-blue-500/10 p-3 text-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="space-y-1">
                                    <p className="font-semibold text-blue-100">Holdings</p>
                                    {totalHoldingsAmount != null && (
                                      <p className="text-xs text-blue-200">
                                        Total Exposure:{' '}
                                        {formatCurrencyValue(
                                          totalHoldingsAmount,
                                          holdings[0]?.currency ?? primarySubscription?.currency
                                        )}
                                      </p>
                                    )}
                                  </div>
                                  <Badge className="bg-blue-500/20 text-blue-100">
                                    {holdings.length} {holdings.length === 1 ? 'Position' : 'Positions'}
                                  </Badge>
                                </div>
                                <div className="mt-3 space-y-2 text-xs text-blue-100">
                                  {holdings.map((holding) => {
                                    const holdingAmount = formatCurrencyValue(
                                      holding.subscribed_amount,
                                      holding.currency
                                    )
                                    return (
                                      <div
                                        key={holding.id}
                                        className="rounded border border-blue-400/20 bg-blue-500/5 p-2"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <div className="flex flex-col">
                                            <span className="font-medium text-blue-100">
                                              {holding.deal_name || 'Deal Allocation'}
                                            </span>
                                            <span className="text-blue-200">
                                              {holdingAmount || 'Amount pending'}
                                            </span>
                                          </div>
                                          <Badge className="bg-blue-500/20 text-blue-100 uppercase">
                                            {holding.status?.replace(/_/g, ' ') || 'Pending'}
                                          </Badge>
                                        </div>
                                        <div className="mt-1 grid gap-2 md:grid-cols-2">
                                          <div>
                                            <p className="font-semibold uppercase tracking-wide text-blue-300">
                                              Effective
                                            </p>
                                            <p>
                                              {holding.effective_date
                                                ? new Date(holding.effective_date).toLocaleDateString()
                                                : '—'}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="font-semibold uppercase tracking-wide text-blue-300">
                                              Funding Due
                                            </p>
                                            <p>
                                              {holding.funding_due_at
                                                ? new Date(holding.funding_due_at).toLocaleDateString()
                                                : '—'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {investor.notes && (
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap border-l border-white/10 pl-3">
                                {investor.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            <div className="space-y-2 text-right">
                              <Label className="text-xs uppercase text-muted-foreground">
                                Allocation Status
                              </Label>
                              <Select
                                value={allocationStatus}
                                onValueChange={(value) =>
                                  handleInvestorStatusChange(investor.id, value, hasSubscription)
                                }
                                disabled={updatingInvestorId === investor.id}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {allocationStatusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {investor.source === 'entity_link' || investor.source === 'hybrid' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-200"
                                onClick={() => handleRemoveInvestor(investor.id)}
                                disabled={removingInvestorId === investor.id}
                              >
                                {removingInvestorId === investor.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Remove
                              </Button>
                            ) : (
                              <div className="text-xs text-gray-500 italic">
                                Auto-discovered
                              </div>
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
        </TabsContent>

        {/* Documents & Folders Tab - Combined */}
        <TabsContent value="documents" className="space-y-4">
          {/* Folder Structure with Management */}
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Document Folders</CardTitle>
                  <CardDescription>
                    Create, organize, and manage document folders with Google Drive-like structure
                  </CardDescription>
                </div>
                <UploadDocumentModal
                  entityId={entity.id}
                  triggerLabel="Upload Document"
                  onUploaded={fetchDocuments}
                  defaultFolderId={selectedFolderId}
                  folderOptions={folders
                    .filter((folder) => {
                      const isRootEntityFolder =
                        (folder.folder_type === 'entity' || folder.folder_type === 'vehicle_root') &&
                        !folder.parent_folder_id
                      return !isRootEntityFolder
                    })
                    .map((folder) => ({
                      id: folder.id,
                      name: folder.name,
                      path: folder.path
                    }))}
                />
              </div>
            </CardHeader>
            <CardContent>
              <FolderManager
                entityId={entity.id}
                folders={folders}
                documents={documents}
                onFoldersChange={fetchFolders}
                onFolderSelect={setSelectedFolderId}
                selectedFolderId={selectedFolderId}
              />
            </CardContent>
          </Card>

          {/* All Documents List */}
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>
                {activeFolder ? `${activeFolder.name} Documents` : 'All Documents'} ({filteredDocuments.length})
              </CardTitle>
              <CardDescription>
                {activeFolder
                  ? `Showing files stored under ${activeFolder.path}`
                  : 'Complete list of all documents across all folders'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="text-gray-400 text-sm">Loading documents…</div>
              ) : documentsError ? (
                <div className="text-red-200 text-sm">{documentsError}</div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-gray-400 text-sm">
                  No documents uploaded yet. Use the "Upload Document" button above to add documents.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((doc) => {
                    const isExternal = Boolean(doc.external_url)
                    const actionHref = isExternal
                      ? (doc.external_url as string)
                      : `/api/documents/${doc.id}/download`
                    const actionText = isExternal ? 'Open Link' : 'Download'
                    const timestampLabel = isExternal ? 'Linked' : 'Uploaded'
                    const folderInfo = doc.folder_id ? folderMap.get(doc.folder_id) : null

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-white">
                              {doc.name || doc.file_key?.split('/').pop() || 'Untitled document'}
                            </span>
                            {doc.type && (
                              <Badge className="bg-white/10 border border-white/10 text-white capitalize">
                                {doc.type.replace('_', ' ')}
                              </Badge>
                            )}
                            {isExternal && (
                              <Badge variant="outline" className="text-xs bg-emerald-500/10 border-emerald-400/30 text-emerald-100">
                                External Link
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {timestampLabel} {new Date(doc.created_at).toLocaleString()}
                            {doc.created_by && ` • ${doc.created_by}`}
                          </p>
                          {folderInfo && (
                            <p className="text-xs text-gray-400">
                              Folder: {folderInfo.path} ({folderInfo.folder_type.replace('_', ' ')})
                            </p>
                          )}
                          {doc.description && (
                            <p className="text-sm text-gray-400 max-w-2xl">
                              {doc.description}
                            </p>
                          )}
                          {isExternal && (
                            <p className="text-xs text-emerald-200 break-all">
                              {doc.external_url}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isExternal ? (
                            <Button variant="outline" size="sm" className="gap-2" asChild>
                              <Link
                                href={actionHref}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Visit
                              </Link>
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => handlePreviewDocument(doc)}
                              >
                                <Eye className="h-4 w-4" />
                                Preview
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleDownloadDocument(doc.id)}
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
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
              <div className="text-gray-400 text-sm">
                No stakeholders recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {stakeholderCategoryConfig.map((category) => {
                  const group = stakeholderSections[category.key] ?? []
                  return (
                    <div key={category.key} className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{category.label}</p>
                          <p className="text-xs text-gray-400">
                            {group.length === 0
                              ? 'No relationships recorded yet.'
                              : `Tracking ${group.length} relationship${group.length === 1 ? '' : 's'}.`}
                          </p>
                        </div>
                        <Badge className="bg-white/10 border border-white/10 text-white">
                          {group.length}
                        </Badge>
                      </div>

                      {group.length > 0 && (
                        <div className="space-y-3">
                          {group.map((stakeholder) => (
                            <div
                              key={stakeholder.id}
                              className="rounded-md border border-white/10 bg-black/20 px-4 py-3"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-white">
                                    {stakeholder.company_name || stakeholder.contact_person || 'Unnamed'}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {stakeholder.contact_person && `Contact: ${stakeholder.contact_person}`}
                                    {stakeholder.email && ` • ${stakeholder.email}`}
                                    {stakeholder.phone && ` • ${stakeholder.phone}`}
                                  </p>
                                </div>
                                <Badge className="bg-white/10 border border-white/10 text-white">
                                  {stakeholder.effective_to ? 'Former' : 'Active'}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Effective {stakeholder.effective_from
                                  ? new Date(stakeholder.effective_from).toLocaleDateString()
                                  : 'unknown'}
                                {stakeholder.effective_to &&
                                  ` • Ended ${new Date(stakeholder.effective_to).toLocaleDateString()}`}
                              </p>
                              {stakeholder.notes && (
                                <p className="text-sm text-gray-400 mt-2">{stakeholder.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
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
                <div className="text-gray-400 text-sm">No directors recorded yet.</div>
              ) : (
                <div className="space-y-3">
                  {directors.map((director) => (
                    <div
                      key={director.id}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{director.full_name}</p>
                          <p className="text-xs text-gray-400">
                            {director.role || 'Role not specified'}
                            {director.email && ` • ${director.email}`}
                          </p>
                        </div>
                        <Badge className="bg-white/10 border border-white/10 text-white">
                          {director.effective_to ? 'Former' : 'Active'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Effective{' '}
                        {director.effective_from
                          ? new Date(director.effective_from).toLocaleDateString()
                          : 'unknown'}
                        {director.effective_to &&
                          ` • Ended ${new Date(director.effective_to).toLocaleDateString()}`}
                      </div>
                      {director.notes && (
                        <p className="text-sm text-gray-400 mt-2">{director.notes}</p>
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
                Click on any deal to view details and manage investment opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deals.length === 0 ? (
                <div className="text-gray-400 text-sm py-8 text-center">
                  <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-white">No deals linked to this entity yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/versotech/staff/deals/${deal.id}`}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition-all hover:bg-white/10 hover:border-emerald-400/30 cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                          <Briefcase className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-emerald-100 transition-colors">{deal.name}</p>
                          <p className="text-xs text-gray-400 capitalize">
                            {deal.deal_type.replace('_', ' ')} • {deal.currency || '—'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Created {new Date(deal.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={
                        deal.status === 'active'
                          ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
                          : deal.status === 'closed'
                          ? 'bg-blue-500/20 border-blue-400/40 text-blue-100'
                          : 'bg-amber-500/20 border-amber-400/40 text-amber-100'
                      }>
                        {deal.status}
                      </Badge>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 transition-colors ml-2" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab - New automatic health monitoring system */}
        <TabsContent value="health" className="space-y-4">
          <EntityHealthMonitor
            entity={entity}
            directors={directors}
            stakeholders={stakeholders}
            documents={documents}
            folders={folders}
            deals={deals}
            investors={investors}
            onAction={(action) => {
              // Handle quick actions from health monitor
              switch (action) {
                case 'edit_metadata':
                  setEditEntityModalOpen(true)
                  break
                case 'add_stakeholder':
                  setStakeholderModalOpen(true)
                  break
                case 'add_director':
                  setDirectorModalOpen(true)
                  break
                case 'link_investor':
                  setInvestorModalOpen(true)
                  break
                case 'upload_document':
                case 'create_folder':
                  setActiveTab('documents')
                  break
                default:
                  console.log('Action not implemented:', action)
              }
            }}
          />
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

      <AddEntityFlagModal
        entityId={entity.id}
        open={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        onSuccess={(flag) => {
          handleFlagCreated(flag)
          refreshFlags()
        }}
      />

      <LinkEntityInvestorModal
        entityId={entity.id}
        open={investorModalOpen}
        onClose={() => setInvestorModalOpen(false)}
        onSuccess={handleInvestorAdded}
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

      {/* Document Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-emerald-400" />
              {previewDocument?.name || previewDocument?.file_key?.split('/').pop() || 'Document Preview'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {previewDocument?.type && `Type: ${previewDocument.type.replace('_', ' ')} • `}
              {previewDocument?.created_at && `Uploaded ${new Date(previewDocument.created_at).toLocaleString()}`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-white/5 rounded-lg p-4 flex items-center justify-center">
            {loadingPreview ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                <p className="text-gray-400">Loading document...</p>
              </div>
            ) : previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-full min-h-[600px] bg-white rounded"
                title={previewDocument?.name || 'Document preview'}
              />
            ) : (
              <div className="text-center text-gray-400">
                <p>Unable to load document preview</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewModalOpen(false)} className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
              onClick={() => previewDocument && handleDownloadDocument(previewDocument.id)}
              disabled={!previewDocument}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Modal */}
      {editingSubscription && (
        <Dialog open={subscriptionModalOpen} onOpenChange={setSubscriptionModalOpen}>
          <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <Edit className="h-5 w-5 text-emerald-400" />
                Edit Subscription
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Update subscription details for this investor's commitment to the vehicle
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Commitment Amount</Label>
                  <Input
                    ref={commitmentRef}
                    type="number"
                    defaultValue={editingSubscription.subscription?.commitment}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Currency</Label>
                  <Input
                    ref={currencyRef}
                    defaultValue={editingSubscription.subscription?.currency || 'USD'}
                    maxLength={3}
                    className="bg-white/5 border-white/10 text-white uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Status</Label>
                <Select
                  defaultValue={editingSubscription.subscription?.status || 'pending'}
                  onValueChange={(value) => { statusRef.current = value }}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10">
                    <SelectItem value="pending" className="text-white">Pending</SelectItem>
                    <SelectItem value="committed" className="text-white">Committed</SelectItem>
                    <SelectItem value="active" className="text-white">Active</SelectItem>
                    <SelectItem value="closed" className="text-white">Closed</SelectItem>
                    <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Effective Date</Label>
                  <Input
                    ref={effectiveDateRef}
                    type="date"
                    defaultValue={editingSubscription.subscription?.effective_date}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Funding Due Date</Label>
                  <Input
                    ref={fundingDueDateRef}
                    type="date"
                    defaultValue={editingSubscription.subscription?.funding_due_at}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Units</Label>
                <Input
                  ref={unitsRef}
                  type="number"
                  defaultValue={editingSubscription.subscription?.units}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Number of units"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Acknowledgement Notes</Label>
                <Textarea
                  ref={notesRef}
                  defaultValue={editingSubscription.subscription?.acknowledgement_notes}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Internal notes about this subscription"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSubscriptionModalOpen(false)}
                className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                disabled={savingSubscription}
              >
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleSaveSubscription}
                disabled={savingSubscription}
              >
                {savingSubscription ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
