'use client'

import { useState, useTransition, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/format'
import type { ArrangersDashboardProps } from './arrangers-dashboard'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

interface ArrangerKYCDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  arranger: ArrangersDashboardProps['arrangers'][number] | null
}

export function ArrangerKYCDialog({ open, onOpenChange, arranger }: ArrangerKYCDialogProps) {
  const [kycStatus, setKycStatus] = useState('draft')
  const [kycNotes, setKycNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    if (arranger) {
      setKycStatus(arranger.kycStatus)
      setKycNotes(arranger.kycNotes || '')
    }
  }, [arranger])

  const handleUpdate = () => {
    if (!arranger) return

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/arrangers/${arranger.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kyc_status: kycStatus,
            kyc_notes: kycNotes.trim() || null,
            kyc_approved_at: kycStatus === 'approved' ? new Date().toISOString() : null,
            kyc_expires_at: kycStatus === 'approved'
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
              : null,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          console.error('[ArrangerKYCDialog] Failed to update KYC', data)
          toast.error(data?.error ?? 'Failed to update KYC status')
          return
        }

        toast.success('KYC status updated successfully')
        onOpenChange(false)
        router.refresh()
      } catch (err) {
        console.error('[ArrangerKYCDialog] Unexpected error', err)
        toast.error('Failed to update KYC status')
      }
    })
  }

  if (!arranger) return null

  const kycStatusConfig = {
    draft: { icon: Clock, color: 'text-yellow-400', label: 'Draft / Pending' },
    approved: { icon: CheckCircle2, color: 'text-green-400', label: 'Approved' },
    expired: { icon: XCircle, color: 'text-red-400', label: 'Expired' },
    rejected: { icon: XCircle, color: 'text-red-400', label: 'Rejected' },
  }

  const currentConfig = kycStatusConfig[arranger.kycStatus as keyof typeof kycStatusConfig] || kycStatusConfig.draft
  const StatusIcon = currentConfig.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>KYC Management</DialogTitle>
          <DialogDescription>Manage KYC status for {arranger.legalName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Current Status Display */}
          <div className="border border-white/10 rounded-lg p-4 bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Current Status</span>
              <Badge className={`capitalize ${currentConfig.color}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {currentConfig.label}
              </Badge>
            </div>
            {arranger.kycApprovedAt && (
              <p className="text-sm text-muted-foreground">
                Approved: {formatDate(arranger.kycApprovedAt)}
              </p>
            )}
            {arranger.kycExpiresAt && (
              <p className="text-sm text-muted-foreground">
                Expires: {formatDate(arranger.kycExpiresAt)}
              </p>
            )}
          </div>

          {/* KYC Status Selector */}
          <div className="grid gap-2">
            <Label>Update KYC Status</Label>
            <Select value={kycStatus} onValueChange={setKycStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft / Pending Review</SelectItem>
                <SelectItem value="approved">Approved (Valid 1 year)</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* KYC Notes */}
          <div className="grid gap-2">
            <Label htmlFor="kycNotes">KYC Notes</Label>
            <Textarea
              id="kycNotes"
              value={kycNotes}
              onChange={(event) => setKycNotes(event.target.value)}
              placeholder="Document verification notes, compliance findings, etc."
              rows={4}
            />
          </div>

          {/* Metadata Display */}
          {arranger.metadata && Object.keys(arranger.metadata).length > 0 && (
            <div className="border border-white/10 rounded-lg p-4 bg-white/5">
              <h4 className="text-sm font-semibold text-foreground mb-2">Additional Metadata</h4>
              <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                {JSON.stringify(arranger.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Helper Text */}
          <p className="text-xs text-muted-foreground">
            Approving KYC will set the approval date to today and expiry date to 1 year from now.
            Ensure all required documents have been uploaded and verified before approval.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isPending}>
            {isPending ? 'Updating…' : 'Update KYC Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
