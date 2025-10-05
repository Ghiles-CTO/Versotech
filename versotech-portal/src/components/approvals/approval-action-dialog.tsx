'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { Approval } from '@/types/approvals'
import { toast } from 'sonner'

interface ApprovalActionDialogProps {
  approval: Approval | null
  action: 'approve' | 'reject' | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const REJECTION_REASONS = [
  { value: 'kyc_incomplete', label: 'KYC Documentation Incomplete' },
  { value: 'insufficient_funds', label: 'Insufficient Funds' },
  { value: 'deal_closed', label: 'Deal Closed/No Longer Available' },
  { value: 'minimum_not_met', label: 'Minimum Investment Not Met' },
  { value: 'compliance_issue', label: 'Compliance Issue' },
  { value: 'investor_ineligible', label: 'Investor Ineligible' },
  { value: 'documentation_error', label: 'Documentation Error' },
  { value: 'other', label: 'Other (please specify)' }
]

export function ApprovalActionDialog({
  approval,
  action,
  open,
  onOpenChange,
  onSuccess
}: ApprovalActionDialogProps) {
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    setNotes('')
    setRejectionReason('')
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!approval || !action) return

    // Validation
    if (action === 'reject' && !rejectionReason) {
      toast.error('Please select a rejection reason')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/approvals/${approval.id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          notes: notes.trim() || undefined,
          rejection_reason: action === 'reject' ? rejectionReason : undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} approval`)
      }

      toast.success(data.message || `Successfully ${action}d approval`)
      handleClose()
      onSuccess()
    } catch (error) {
      console.error(`Error ${action}ing approval:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${action} approval`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!approval || !action) return null

  const isApprove = action === 'approve'
  const entityAmount = approval.entity_metadata?.requested_amount ||
    approval.entity_metadata?.amount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApprove ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Approve Request
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Reject Request
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? 'Review the details below and confirm your approval.'
              : 'Provide a reason for rejection. The requester will be notified.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Request Details */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Request Type:</span>
                <p className="font-medium capitalize mt-1">
                  {approval.entity_type.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Requested By:</span>
                <p className="font-medium mt-1">
                  {approval.requested_by_profile?.display_name || 'Unknown'}
                </p>
              </div>
              {entityAmount && (
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <p className="font-medium mt-1">
                    ${parseFloat(entityAmount).toLocaleString()}
                  </p>
                </div>
              )}
              {approval.related_investor && (
                <div>
                  <span className="text-muted-foreground">Investor:</span>
                  <p className="font-medium mt-1">
                    {approval.related_investor.legal_name}
                  </p>
                </div>
              )}
              {approval.related_deal && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Deal:</span>
                  <p className="font-medium mt-1">
                    {approval.related_deal.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Warning for high-value approvals */}
          {isApprove && entityAmount && parseFloat(entityAmount) > 50000 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-200">High-Value Approval</p>
                <p className="text-amber-800 dark:text-amber-300 mt-1">
                  This approval involves an amount greater than $50,000. Please ensure all
                  documentation is complete.
                </p>
              </div>
            </div>
          )}

          {/* Rejection Reason Selection */}
          {!isApprove && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-sm font-medium">
                Rejection Reason *
              </Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger id="rejection-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              {isApprove ? 'Additional Notes (Optional)' : 'Additional Details *'}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                isApprove
                  ? 'Add any notes about this approval...'
                  : 'Provide specific details about why this request is being rejected...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {isApprove
                ? 'Notes will be saved in the approval history.'
                : 'This message will be sent to the requester along with the rejection reason.'
              }
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={isApprove ? 'default' : 'destructive'}
            onClick={handleSubmit}
            disabled={isSubmitting || (!isApprove && !rejectionReason)}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Processing...</span>
              </>
            ) : (
              <>
                {isApprove ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirm Approval
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Confirm Rejection
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
