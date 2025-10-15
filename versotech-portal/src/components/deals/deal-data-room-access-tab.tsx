'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { Loader2, ShieldCheck, KeyRound, Clock, Trash2, Plus } from 'lucide-react'
import { DataRoomDocumentUpload } from './data-room-document-upload'

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<AccessFormState>(emptyForm)
  const [editingAccessId, setEditingAccessId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [items, setItems] = useState(accessRecords ?? [])

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
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupedDocuments.length ? (
            groupedDocuments.map(([folder, docs]) => (
              <div key={folder} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground">{folder}</h4>
                  <Badge variant="outline">{docs.length} files</Badge>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {docs.slice(0, 4).map(doc => (
                    <li key={doc.id} className="truncate">
                      • {doc.file_name || doc.file_key}
                    </li>
                  ))}
                  {docs.length > 4 && (
                    <li className="italic">and {docs.length - 4} more…</li>
                  )}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">
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
    </div>
  )
}
