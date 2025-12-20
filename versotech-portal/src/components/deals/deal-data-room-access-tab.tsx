'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { format, formatDistanceToNow } from 'date-fns'
import { Loader2, ShieldCheck, KeyRound, Clock, Trash2, Plus, Edit, Download, FileText, ExternalLink } from 'lucide-react'
import { DataRoomDocumentUpload } from './data-room-document-upload'
import { toast } from 'sonner'

interface DealDataRoomAccessTabProps {
  dealId: string
  dealName: string
  memberships: Array<Record<string, any>>
  accessRecords: Array<Record<string, any>>
  documents: Array<Record<string, any>>
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

  const groupedDocuments = useMemo(() => {
    const map = new Map<string, Array<Record<string, any>>>()
    documents?.forEach(doc => {
      const key = doc.folder || 'Uncategorised'
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(doc)
    })
    return Array.from(map.entries())
  }, [documents])

  const resetForm = () => {
    setFormValues(emptyForm)
    setEditingAccessId(null)
    setErrorMessage(null)
  }

  const openCreateDialog = () => {
    resetForm()
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
      // If document has external link, open it directly
      if (doc.external_link) {
        window.open(doc.external_link, '_blank', 'noopener,noreferrer')
        toast.success('Opening document in new tab')
      } else {
        // Otherwise, fetch download URL from API
        const response = await fetch(`/api/deals/${dealId}/documents/${doc.id}/download`)
        if (!response.ok) {
          throw new Error('Failed to get download link')
        }
        const data = await response.json()
        window.open(data.download_url, '_blank')
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
      folder: doc.folder || 'Legal',
      visible_to_investors: doc.visible_to_investors || false,
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

  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-foreground">Data Room Access</CardTitle>
            <CardDescription>
              Manage NDA-cleared investors, extend access windows, and keep visibility in sync with documentation.
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog} className="gap-2" disabled={isSubmitting}>
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
              {items?.length ? (
                items.map(record => {
                  const isRevoked = Boolean(record.revoked_at)
                  const expiresSoon = !record.revoked_at && record.expires_at && new Date(record.expires_at) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.investors?.legal_name || 'Unknown investor'}
                      </TableCell>
                      <TableCell>
                        {record.granted_at ? format(new Date(record.granted_at), 'dd MMM yyyy HH:mm') : '—'}
                      </TableCell>
                      <TableCell>
                        {record.expires_at
                          ? `${format(new Date(record.expires_at), 'dd MMM yyyy HH:mm')} (${formatDistanceToNow(new Date(record.expires_at), { addSuffix: true })})`
                          : 'No expiry'}
                      </TableCell>
                      <TableCell>
                        <Badge className={isRevoked ? 'bg-rose-500/20 text-rose-100' : expiresSoon ? 'bg-amber-500/20 text-amber-100' : 'bg-emerald-500/20 text-emerald-100'}>
                          {isRevoked ? 'REVOKED' : expiresSoon ? 'EXPIRING' : 'ACTIVE'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
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

      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-foreground">Data Room Documents</CardTitle>
            <CardDescription>
              Upload and manage documents that investors can access in their data room.
            </CardDescription>
          </div>
          <DataRoomDocumentUpload
            dealId={dealId}
            onUploadComplete={refresh}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Upload Files
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          {documents?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Folder</TableHead>
                  <TableHead>Visible to Investors</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {doc.external_link ? (
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                        {doc.file_name || doc.file_key?.split('/').pop() || 'Untitled'}
                        {doc.external_link && (
                          <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Link
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.folder || 'Uncategorized'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={doc.visible_to_investors ? 'bg-emerald-500/20 text-emerald-100' : 'bg-gray-500/20 text-gray-200'}>
                        {doc.visible_to_investors ? 'YES' : 'NO'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.created_at ? format(new Date(doc.created_at), 'MMM d, yyyy') : '—'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDownloadDoc(doc)}
                        disabled={isSubmitting}
                      >
                        {doc.external_link ? (
                          <>
                            <ExternalLink className="h-4 w-4" />
                            View
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Download
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => openEditDocDialog(doc)}
                        disabled={isSubmitting}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-rose-300"
                        onClick={() => handleDeleteDoc(doc)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No documents have been published to the data room yet.
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
              <Select
                value={docFormValues.folder}
                onValueChange={value => setDocFormValues((prev: any) => ({ ...prev, folder: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="KYC">KYC</SelectItem>
                  <SelectItem value="Reports">Reports</SelectItem>
                  <SelectItem value="Presentations">Presentations</SelectItem>
                  <SelectItem value="Financial Models">Financial Models</SelectItem>
                  <SelectItem value="Misc">Misc</SelectItem>
                </SelectContent>
              </Select>
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
