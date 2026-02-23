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
import { Checkbox } from '@/components/ui/checkbox'
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
  action: 'approve' | 'reject' | 'request_info' | null
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

const REQUEST_INFO_SECTION_OPTIONS = [
  { value: 'general', label: 'General Information' },
  { value: 'entity_info', label: 'Entity Information' },
  { value: 'personal_info', label: 'Personal Information' },
  { value: 'documents', label: 'KYC Documents' },
  { value: 'members', label: 'Members / Signatories' },
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
  const [requestSections, setRequestSections] = useState<string[]>(['general'])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    setNotes('')
    setRejectionReason('')
    setRequestSections(['general'])
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!approval || !action) return

    // Validation
    if (action === 'reject' && !rejectionReason) {
      toast.error('Please select a rejection reason')
      return
    }

    if (action === 'request_info' && !notes.trim()) {
      toast.error('Please provide what information is missing')
      return
    }

    setIsSubmitting(true)
    const actionLabel = action === 'request_info' ? 'request more information for' : action

    try {
      const response = await fetch(`/api/approvals/${approval.id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          action,
          notes: notes.trim() || undefined,
          rejection_reason: action === 'reject' || action === 'request_info' ? rejectionReason || undefined : undefined,
          request_sections: action === 'request_info' ? requestSections : undefined,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${actionLabel} this approval`)
      }

      toast.success(data.message || `Successfully ${action}d approval`)
      handleClose()
      onSuccess()
    } catch (error) {
      console.error(`Error processing ${action}:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${actionLabel} this approval`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!approval || !action) return null

  const isApprove = action === 'approve'
  const isRequestInfo = action === 'request_info'
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
            ) : isRequestInfo ? (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Request More Information
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
              : isRequestInfo
              ? 'Specify what is missing. The approval stays pending until resubmission.'
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
                {isRequestInfo ? 'Reason (Optional)' : 'Rejection Reason *'}
              </Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger id="rejection-reason">
                  <SelectValue placeholder={isRequestInfo ? 'Select a reason (optional)' : 'Select a reason'} />
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

          {isRequestInfo && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Requested Sections</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-border p-3">
                {REQUEST_INFO_SECTION_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={requestSections.includes(option.value)}
                      onCheckedChange={(checked) => {
                        setRequestSections((prev) => {
                          if (checked) {
                            return prev.includes(option.value) ? prev : [...prev, option.value]
                          }
                          const next = prev.filter(section => section !== option.value)
                          return next.length > 0 ? next : ['general']
                        })
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              {isApprove ? 'Additional Notes (Optional)' : isRequestInfo ? 'What should be updated? *' : 'Additional Details *'}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                isApprove
                  ? 'Add any notes about this approval...'
                  : isRequestInfo
                  ? 'Specify exactly what information or documents should be corrected...'
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
                : isRequestInfo
                ? 'This message will be sent to the investor and shown in their profile.'
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
            variant={isApprove ? 'default' : isRequestInfo ? 'secondary' : 'destructive'}
            onClick={handleSubmit}
            disabled={isSubmitting || (!isApprove && !isRequestInfo && !rejectionReason) || (isRequestInfo && !notes.trim())}
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
                ) : isRequestInfo ? (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Request Info
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
