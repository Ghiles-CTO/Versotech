'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { format, formatDistanceToNow } from 'date-fns'
import { Loader2, ShieldCheck, KeyRound, Clock, Trash2, Plus, Edit, Download, FileText, ExternalLink, Star, Check, ChevronsUpDown, FolderOpen, FolderClosed, FolderUp, MoreHorizontal, ChevronRight, Eye, EyeOff, File, Upload } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DataRoomDocumentUpload } from './data-room-document-upload'
import { DataRoomFolderUpload } from './data-room-folder-upload'
import { toast } from 'sonner'
import { DATA_ROOM_DEFAULT_FOLDERS } from '@/lib/data-room/constants'
import { cn } from '@/lib/utils'
import { DocumentService } from '@/services/document.service'

interface DealDataRoomAccessTabProps {
  dealId: string
  dealName: string
  memberships: Array<Record<string, any>>
  accessRecords: Array<Record<string, any>>
  documents: Array<Record<string, any>>
}

interface FolderNode {
  name: string
  fullPath: string
  documents: Array<Record<string, any>>
  children: Map<string, FolderNode>
}

interface AccessFormState {
  investorId: string
  expiresAt: string
  autoGranted: boolean
  notes: string
}

const emptyForm: AccessFormState = {
  investorId: '',
  expiresAt: '',
  autoGranted: false,
  notes: ''
}

export function DealDataRoomAccessTab({
  dealId,
  dealName,
  memberships,
  accessRecords,
  documents
}: DealDataRoomAccessTabProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<AccessFormState>(emptyForm)
  const [editingAccessId, setEditingAccessId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [items, setItems] = useState(accessRecords ?? [])
  const [editingDocId, setEditingDocId] = useState<string | null>(null)
  const [docFormValues, setDocFormValues] = useState<any>({})
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false)

  useEffect(() => {
    setItems(accessRecords ?? [])
  }, [accessRecords])

  const investorOptions = useMemo(() => {
    const investors = memberships
      ?.filter(member => member.investor_id && member.investors)
      .map(member => ({
        id: member.investor_id,
        label: member.investors?.legal_name || 'Unnamed investor'
      })) ?? []
    return investors
  }, [memberships])

  // Build a folder tree that supports nested paths (e.g. "Data Room/Reports/Q4")
  const folderTree = useMemo(() => {
    const root = new Map<string, FolderNode>()

    const getOrCreate = (parent: Map<string, FolderNode>, parts: string[], depth: number, fullPathSoFar: string): FolderNode => {
      const name = parts[depth]
      const fullPath = fullPathSoFar ? `${fullPathSoFar}/${name}` : name
      if (!parent.has(name)) {
        parent.set(name, { name, fullPath, documents: [], children: new Map() })
      }
      const node = parent.get(name)!
      if (depth < parts.length - 1) {
        return getOrCreate(node.children, parts, depth + 1, fullPath)
      }
      return node
    }

    documents?.forEach(doc => {
      const folderPath = doc.folder || 'Uncategorised'
      const parts = folderPath.split('/')
      const leaf = getOrCreate(root, parts, 0, '')
      leaf.documents.push(doc)
    })

    return root
  }, [documents])

  // Derive unique existing folders from documents for combobox
  const existingFolders = useMemo(() => {
    const set = new Set<string>([...DATA_ROOM_DEFAULT_FOLDERS])
    documents?.forEach(doc => {
      if (doc.folder) set.add(doc.folder)
    })
    return Array.from(set)
  }, [documents])

  const [editFolderComboOpen, setEditFolderComboOpen] = useState(false)
  const [editFolderSearch, setEditFolderSearch] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  // Auto-expand first-level folders on mount
  useEffect(() => {
    if (folderTree.size > 0 && expandedFolders.size === 0) {
      setExpandedFolders(new Set(Array.from(folderTree.keys())))
    }
  }, [folderTree])

  const handleDeleteFolder = useCallback(async (folderName: string, mode: 'move' | 'delete') => {
    const docsInFolder = documents?.filter(d => d.folder === folderName || d.folder?.startsWith(folderName + '/')) || []
    if (docsInFolder.length === 0) return

    const confirmMsg = mode === 'delete'
      ? `Delete all ${docsInFolder.length} document(s) in "${folderName}"? This cannot be undone.`
      : `Move all ${docsInFolder.length} document(s) in "${folderName}" to "Misc"?`

    if (!confirm(confirmMsg)) return

    setIsSubmitting(true)
    try {
      let failed = 0
      for (const doc of docsInFolder) {
        if (mode === 'delete') {
          const res = await fetch(`/api/deals/${dealId}/documents/${doc.id}`, { method: 'DELETE' })
          if (!res.ok) failed++
        } else {
          const res = await fetch(`/api/deals/${dealId}/documents/${doc.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folder: 'Misc' })
          })
          if (!res.ok) failed++
        }
      }
      if (failed > 0) {
        toast.error(`Failed to process ${failed} document(s)`)
      } else {
        toast.success(mode === 'delete' ? `Deleted folder "${folderName}"` : `Moved documents to Misc`)
      }
      router.refresh()
    } catch {
      toast.error('Failed to process folder')
    } finally {
      setIsSubmitting(false)
    }
  }, [dealId, documents, router])

  const resetForm = () => {
    setFormValues(emptyForm)
    setEditingAccessId(null)
    setErrorMessage(null)
  }

  const openCreateDialog = (investorId?: string) => {
    resetForm()
    if (investorId) {
      setFormValues(prev => ({ ...prev, investorId }))
    }
    setIsDialogOpen(true)
  }

  const openEditDialog = (record: Record<string, any>) => {
    setFormValues({
      investorId: record.investor_id,
      expiresAt: record.expires_at ? record.expires_at.slice(0, 16) : '',
      autoGranted: Boolean(record.auto_granted),
      notes: record.notes ?? ''
    })
    setEditingAccessId(record.id)
    setErrorMessage(null)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const refresh = async () => {
    const response = await fetch(`/api/deals/${dealId}/data-room-access`)
    if (!response.ok) {
      setErrorMessage('Failed to refresh access records. Please reload the page.')
      return
    }
    const data = await response.json()
    setItems(data.access ?? [])
  }

  const latestAccessByInvestor = useMemo(() => {
    const map = new Map<string, Record<string, any>>()
    ;(items ?? []).forEach(record => {
      const investorId = record?.investor_id
      if (!investorId) return

      const existing = map.get(investorId)
      if (!existing) {
        map.set(investorId, record)
        return
      }

      const existingGrantedAt = existing?.granted_at ? new Date(existing.granted_at).getTime() : 0
      const currentGrantedAt = record?.granted_at ? new Date(record.granted_at).getTime() : 0
      if (currentGrantedAt > existingGrantedAt) {
        map.set(investorId, record)
      }
    })
    return map
  }, [items])

  const memberAccessRows = useMemo(() => {
    const rows: Array<{
      investorId: string
      investorName: string
      accessRecord: Record<string, any> | null
    }> = []
    const seen = new Set<string>()

    ;(memberships ?? []).forEach(member => {
      const investorId = member?.investor_id
      if (!investorId || seen.has(investorId)) return
      seen.add(investorId)
      rows.push({
        investorId,
        investorName: member?.investors?.legal_name || 'Unknown investor',
        accessRecord: latestAccessByInvestor.get(investorId) ?? null
      })
    })

    for (const [investorId, accessRecord] of latestAccessByInvestor.entries()) {
      if (seen.has(investorId)) continue
      rows.push({
        investorId,
        investorName: accessRecord?.investors?.legal_name || 'Unknown investor',
        accessRecord
      })
    }

    return rows.sort((a, b) => a.investorName.localeCompare(b.investorName))
  }, [memberships, latestAccessByInvestor])

  const submitForm = async () => {
    if (!formValues.investorId) {
      setErrorMessage('Select an investor before submitting.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const response = await fetch(`/api/deals/${dealId}/data-room-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investor_id: formValues.investorId,
          expires_at: formValues.expiresAt ? new Date(formValues.expiresAt).toISOString() : null,
          auto_granted: formValues.autoGranted,
          notes: formValues.notes || null
        })
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Failed to save access record')
      }

      await refresh()
      closeDialog()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error saving access record')
    } finally {
      setIsSubmitting(false)
    }
  }

  const revokeAccess = async (record: Record<string, any>) => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const response = await fetch(`/api/deals/${dealId}/data-room-access`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_id: record.id, reason: 'Revoked via staff portal' })
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Failed to revoke access')
      }
      await refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error revoking access')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadDoc = async (doc: any) => {
    try {
      if (doc.external_link) {
        window.open(doc.external_link, '_blank', 'noopener,noreferrer')
        toast.success('Opening document in new tab')
      } else {
        const data = await DocumentService.getDealDocumentDownloadUrl(dealId, doc.id)

        if (data.download_url.startsWith('blob:')) {
          const a = window.document.createElement('a')
          a.href = data.download_url
          a.download = doc.file_name || 'document.pdf'
          a.click()
          setTimeout(() => URL.revokeObjectURL(data.download_url), 1000)
        } else {
          window.open(data.download_url, '_blank')
        }
        toast.success('Document download started')
      }
    } catch (error) {
      toast.error('Failed to open document')
    }
  }

  const openEditDocDialog = (doc: any) => {
    setEditingDocId(doc.id)
    setDocFormValues({
      file_name: doc.file_name || '',
      folder: doc.folder || 'Data Room',
      visible_to_investors: doc.visible_to_investors || false,
      is_featured: doc.is_featured || false,
      document_notes: doc.document_notes || '',
      external_link: doc.external_link || ''
    })
    setIsDocDialogOpen(true)
  }

  const handleSaveDocEdit = async () => {
    if (!editingDocId) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/deals/${dealId}/documents/${editingDocId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docFormValues)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update document')
      }

      toast.success('Document updated successfully')
      setIsDocDialogOpen(false)
      setEditingDocId(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update document')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDoc = async (doc: any) => {
    if (!confirm(`Are you sure you want to delete "${doc.file_name}"? This action cannot be undone.`)) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/deals/${dealId}/documents/${doc.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      toast.success('Document deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete document')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Count total documents in a folder node (including nested children)
  const countNodeDocs = (node: FolderNode): number => {
    let count = node.documents.length
    node.children.forEach(child => { count += countNodeDocs(child) })
    return count
  }

  // File icon based on mime type / extension
  const getFileIcon = (doc: Record<string, any>) => {
    if (doc.external_link) return <ExternalLink className="h-4 w-4 text-blue-400" />
    const name = (doc.file_name || '').toLowerCase()
    if (name.endsWith('.pdf')) return <FileText className="h-4 w-4 text-red-400" />
    if (name.match(/\.(xlsx?|csv)$/)) return <FileText className="h-4 w-4 text-emerald-400" />
    if (name.match(/\.(docx?|txt|rtf)$/)) return <FileText className="h-4 w-4 text-blue-400" />
    if (name.match(/\.(png|jpe?g|gif|svg|webp)$/)) return <File className="h-4 w-4 text-purple-400" />
    if (name.match(/\.(zip|rar|tar|gz)$/)) return <File className="h-4 w-4 text-amber-400" />
    return <File className="h-4 w-4 text-muted-foreground" />
  }

  // Format file size
  const formatSize = (bytes: number | null | undefined) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Render a single file row in the tree — uses relative padding inside border-l wrapper
  const renderFileRow = (doc: Record<string, any>) => (
    <div
      key={doc.id}
      className="group flex items-center gap-2 py-1 px-2 pl-4 rounded-sm hover:bg-muted/60 transition-colors"
    >
      {/* File icon */}
      <span className="flex-shrink-0">{getFileIcon(doc)}</span>

      {/* File name + badges */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className="text-sm truncate">
          {doc.file_name || doc.file_key?.split('/').pop() || 'Untitled'}
        </span>
        {doc.is_featured && (
          <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />
        )}
        {doc.external_link && (
          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-blue-500/10 text-blue-400 border-blue-500/30">
            Link
          </Badge>
        )}
      </div>

      {/* Visibility indicator */}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex-shrink-0">
              {doc.visible_to_investors
                ? <Eye className="h-3.5 w-3.5 text-emerald-400" />
                : <EyeOff className="h-3.5 w-3.5 text-muted-foreground/40" />
              }
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            {doc.visible_to_investors ? 'Visible to investors' : 'Hidden from investors'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Size */}
      <span className="text-[11px] text-muted-foreground tabular-nums flex-shrink-0 w-14 text-right">
        {formatSize(doc.file_size_bytes)}
      </span>

      {/* Date */}
      <span className="text-[11px] text-muted-foreground flex-shrink-0 w-20 text-right">
        {doc.created_at ? format(new Date(doc.created_at), 'MMM d, yyyy') : ''}
      </span>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => handleDownloadDoc(doc)}
                disabled={isSubmitting}
              >
                {doc.external_link ? <ExternalLink className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{doc.external_link ? 'Open link' : 'Download'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => openEditDocDialog(doc)}
                disabled={isSubmitting}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300"
                onClick={() => handleDeleteDoc(doc)}
                disabled={isSubmitting}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Delete</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )

  // Recursive tree renderer — VS Code file explorer style with indent guide lines
  const renderFolderTree = (nodes: Map<string, FolderNode>, depth: number): React.ReactNode => {
    return Array.from(nodes.entries()).map(([, node]) => {
      const isExpanded = expandedFolders.has(node.fullPath)
      const totalDocs = countNodeDocs(node)
      const hasContent = node.children.size > 0 || node.documents.length > 0

      return (
        <Collapsible
          key={node.fullPath}
          open={isExpanded}
          onOpenChange={() => toggleFolder(node.fullPath)}
        >
          {/* Folder row */}
          <CollapsibleTrigger asChild>
            <div
              className="group flex items-center gap-1 py-1 px-2 rounded-sm hover:bg-muted/60 transition-colors cursor-pointer select-none"
              style={{ paddingLeft: depth * 20 + 8 }}
            >
              {/* Chevron — single icon with rotation transition */}
              {hasContent ? (
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-150",
                    isExpanded && "rotate-90"
                  )}
                />
              ) : (
                <span className="w-3.5 flex-shrink-0" />
              )}

              {/* Folder icon */}
              {isExpanded
                ? <FolderOpen className="h-4 w-4 text-blue-400 flex-shrink-0" />
                : <FolderClosed className="h-4 w-4 text-blue-400/70 flex-shrink-0" />
              }

              {/* Folder name + file count */}
              <span className="text-sm font-medium ml-0.5">{node.name}</span>
              <span className="text-[11px] text-muted-foreground ml-1.5">
                {totalDocs} {totalDocs === 1 ? 'file' : 'files'}
              </span>

              {/* Spacer */}
              <span className="flex-1" />

              {/* Folder actions — visible on hover */}
              <div
                className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={e => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={isSubmitting}>
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDeleteFolder(node.fullPath, 'move')}>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Move docs to Misc
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteFolder(node.fullPath, 'delete')}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete all docs
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CollapsibleTrigger>

          {/* Expanded children — wrapped in border-l indent guide */}
          <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            <div
              className="border-l border-border/40"
              style={{ marginLeft: depth * 20 + 16 }}
            >
              {node.children.size > 0 && renderFolderTree(node.children, depth + 1)}
              {node.documents.map(doc => renderFileRow(doc))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-muted/50">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-foreground">Data Room Access</CardTitle>
            <CardDescription>
              Manage NDA-cleared investors, extend access windows, and keep visibility in sync with documentation.
            </CardDescription>
          </div>
          <Button onClick={() => openCreateDialog()} className="gap-2" disabled={isSubmitting}>
            <KeyRound className="h-4 w-4" />
            Grant Access
          </Button>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead>Granted</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberAccessRows.length ? (
                memberAccessRows.map(({ investorId, investorName, accessRecord }) => {
                  const record = accessRecord
                  const isRevoked = Boolean(record?.revoked_at)
                  const isExpired = Boolean(
                    !isRevoked &&
                    record?.expires_at &&
                    new Date(record.expires_at) <= new Date()
                  )
                  const expiresSoon = Boolean(
                    !isRevoked &&
                    !isExpired &&
                    record?.expires_at &&
                    new Date(record.expires_at) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                  )

                  const statusLabel = !record
                    ? 'NOT GRANTED'
                    : isRevoked
                      ? 'REVOKED'
                      : isExpired
                        ? 'EXPIRED'
                        : expiresSoon
                          ? 'EXPIRING'
                          : 'ACTIVE'

                  const statusClass = !record
                    ? 'border border-slate-300/50 bg-slate-500/10 text-slate-700 dark:text-slate-300'
                    : isRevoked
                      ? 'border border-rose-300/50 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                      : isExpired
                        ? 'border border-rose-300/50 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                        : expiresSoon
                          ? 'border border-amber-300/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          : 'border border-emerald-300/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'

                  return (
                    <TableRow key={record?.id ?? `investor-${investorId}`}>
                      <TableCell className="font-medium">
                        {investorName}
                      </TableCell>
                      <TableCell>
                        {record?.granted_at ? format(new Date(record.granted_at), 'dd MMM yyyy HH:mm') : 'Not granted'}
                      </TableCell>
                      <TableCell>
                        {!record
                          ? '—'
                          : record.expires_at
                            ? `${format(new Date(record.expires_at), 'dd MMM yyyy HH:mm')} (${formatDistanceToNow(new Date(record.expires_at), { addSuffix: true })})`
                            : 'No expiry'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusClass}>
                          {statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {!record ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => openCreateDialog(investorId)}
                            disabled={isSubmitting}
                          >
                            <Plus className="h-4 w-4" />
                            Grant
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => openEditDialog(record)}
                              disabled={isSubmitting || isRevoked}
                            >
                              <Clock className="h-4 w-4" />
                              Extend
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 text-rose-300"
                              onClick={() => revokeAccess(record)}
                              disabled={isSubmitting || isRevoked}
                            >
                              <Trash2 className="h-4 w-4" />
                              Revoke
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No active access yet. Grant access once the NDA is signed.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border bg-muted/50">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-foreground">Data Room Documents</CardTitle>
            <CardDescription>
              Upload and manage documents that investors can access in their data room.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <DataRoomDocumentUpload
              dealId={dealId}
              onUploadComplete={refresh}
              trigger={
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Files
                </Button>
              }
            />
            <DataRoomFolderUpload
              dealId={dealId}
              onUploadComplete={refresh}
              trigger={
                <Button className="gap-2">
                  <FolderUp className="h-4 w-4" />
                  Upload Folder
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {folderTree.size > 0 ? (
            <div className="border-t border-border">
              {/* Column hints */}
              <div className="flex items-center gap-2 px-4 py-1.5 text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border/50 bg-muted/30">
                <span className="flex-1">Name</span>
                <span className="w-14 text-right">Size</span>
                <span className="w-20 text-right">Date</span>
                <span className="w-[84px]" />
              </div>
              <div className="py-1">
                {renderFolderTree(folderTree, 0)}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border-t border-border">
              <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm">No documents yet</p>
              <p className="text-xs mt-1">Upload files to populate the data room</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={open => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAccessId ? 'Update Data Room Access' : 'Grant Data Room Access'}</DialogTitle>
            <CardDescription>
              Select an investor and optionally set an expiry to control data room visibility for {dealName}.
            </CardDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Investor</Label>
              <Select
                value={formValues.investorId}
                onValueChange={value => setFormValues(prev => ({ ...prev, investorId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select investor" />
                </SelectTrigger>
                <SelectContent>
                  {investorOptions.length ? (
                    investorOptions.map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="">No investors invited yet</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiry</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formValues.expiresAt}
                onChange={event => setFormValues(prev => ({ ...prev, expiresAt: event.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Leave blank for open-ended access.</p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoGranted"
                checked={formValues.autoGranted}
                onCheckedChange={checked =>
                  setFormValues(prev => ({ ...prev, autoGranted: Boolean(checked) }))
                }
              />
              <Label htmlFor="autoGranted" className="text-sm font-medium">
                Mark as auto-granted (automation)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                value={formValues.notes}
                onChange={event => setFormValues(prev => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={closeDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={submitForm} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Edit Dialog */}
      <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <CardDescription>
              Update document metadata, folder, and visibility settings.
            </CardDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fileName">Document Name</Label>
              <Input
                id="fileName"
                value={docFormValues.file_name || ''}
                onChange={event => setDocFormValues((prev: any) => ({ ...prev, file_name: event.target.value }))}
                placeholder="Enter document name..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalLink">External Link (optional)</Label>
              <Input
                id="externalLink"
                type="url"
                value={docFormValues.external_link || ''}
                onChange={event => setDocFormValues((prev: any) => ({ ...prev, external_link: event.target.value }))}
                placeholder="https://drive.google.com/file/d/..."
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for uploaded files. Add a Google Drive, Dropbox, or other external link to reference documents hosted elsewhere.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Folder</Label>
              <Popover open={editFolderComboOpen} onOpenChange={setEditFolderComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={editFolderComboOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" />
                      {docFormValues.folder || 'Select folder...'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search or create folder..."
                      value={editFolderSearch}
                      onValueChange={setEditFolderSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {editFolderSearch.trim() && (
                          <button
                            className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                            onClick={() => {
                              setDocFormValues((prev: any) => ({ ...prev, folder: editFolderSearch.trim() }))
                              setEditFolderComboOpen(false)
                              setEditFolderSearch('')
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            Create folder: &quot;{editFolderSearch.trim()}&quot;
                          </button>
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {existingFolders.map((f) => (
                          <CommandItem
                            key={f}
                            value={f}
                            onSelect={() => {
                              setDocFormValues((prev: any) => ({ ...prev, folder: f }))
                              setEditFolderComboOpen(false)
                              setEditFolderSearch('')
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                docFormValues.folder === f ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <FolderOpen className="mr-2 h-3.5 w-3.5" />
                            {f}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="docVisible"
                checked={docFormValues.visible_to_investors}
                onCheckedChange={checked =>
                  setDocFormValues((prev: any) => ({ ...prev, visible_to_investors: Boolean(checked) }))
                }
              />
              <Label htmlFor="docVisible" className="text-sm font-medium">
                Visible to investors
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="docFeatured"
                checked={docFormValues.is_featured}
                onCheckedChange={checked =>
                  setDocFormValues((prev: any) => ({ ...prev, is_featured: Boolean(checked) }))
                }
              />
              <Label htmlFor="docFeatured" className="text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  Featured document
                </span>
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="docNotes">Notes</Label>
              <Textarea
                id="docNotes"
                rows={3}
                value={docFormValues.document_notes}
                onChange={event => setDocFormValues((prev: any) => ({ ...prev, document_notes: event.target.value }))}
                placeholder="Internal notes about this document..."
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDocDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDocEdit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
