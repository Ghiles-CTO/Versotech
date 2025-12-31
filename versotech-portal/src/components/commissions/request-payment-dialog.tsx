'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CreditCard, Scale, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'

export type CommissionType = 'partner' | 'introducer' | 'commercial-partner'

interface Commission {
  id: string
  accrual_amount: number
  currency: string
  entity_name: string
  deal_id?: string
  deal?: {
    id: string
    name: string
  }
}

interface Lawyer {
  id: string
  firm_name: string
  display_name?: string
}

interface RequestPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commission: Commission | null
  commissionType: CommissionType
  onSuccess: () => void
}

const ENTITY_LABELS: Record<CommissionType, string> = {
  'partner': 'Partner',
  'introducer': 'Introducer',
  'commercial-partner': 'Commercial Partner',
}

/**
 * Generic Request Payment Dialog
 * Works for all commission types: partner, introducer, commercial-partner
 * Sends payment request to lawyers and CEO for approval
 */
export function RequestPaymentDialog({
  open,
  onOpenChange,
  commission,
  commissionType,
  onSuccess,
}: RequestPaymentDialogProps) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>('')
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [loadingLawyers, setLoadingLawyers] = useState(false)

  // Fetch lawyers assigned to the deal
  useEffect(() => {
    const fetchLawyers = async () => {
      if (!open || !commission?.deal_id) {
        setLawyers([])
        return
      }

      setLoadingLawyers(true)
      try {
        const supabase = createClient()

        // Get lawyer assignments for this deal
        const { data: assignments, error: assignError } = await supabase
          .from('deal_lawyer_assignments')
          .select('lawyer_id')
          .eq('deal_id', commission.deal_id)

        if (assignError || !assignments?.length) {
          setLawyers([])
          return
        }

        const lawyerIds = assignments.map(a => a.lawyer_id)

        // Fetch lawyer details
        const { data: lawyerData, error: lawyerError } = await supabase
          .from('lawyers')
          .select('id, firm_name, display_name')
          .in('id', lawyerIds)

        if (lawyerError) {
          console.error('[RequestPaymentDialog] Error fetching lawyers:', lawyerError)
          setLawyers([])
          return
        }

        setLawyers(lawyerData || [])
      } catch (err) {
        console.error('[RequestPaymentDialog] Unexpected error:', err)
        setLawyers([])
      } finally {
        setLoadingLawyers(false)
      }
    }

    fetchLawyers()
  }, [open, commission?.deal_id])

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setNotes('')
      setSelectedLawyerId('')
      setError(null)
    }
  }, [open])

  const handleSubmit = async () => {
    if (!commission) return

    setSending(true)
    setError(null)

    try {
      // Build API URL based on commission type
      const apiUrl = `/api/arrangers/me/${commissionType}-commissions/${commission.id}/request-payment`

      const requestBody: Record<string, any> = {}
      if (notes.trim()) requestBody.notes = notes.trim()
      if (selectedLawyerId && selectedLawyerId !== 'none') {
        requestBody.lawyer_id = selectedLawyerId
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to request payment')
      }

      const result = await response.json()

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('[RequestPaymentDialog] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to request payment')
    } finally {
      setSending(false)
    }
  }

  if (!commission) return null

  const entityLabel = ENTITY_LABELS[commissionType]
  const formattedAmount = formatCurrency(
    commission.accrual_amount,
    commission.currency || 'USD'
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Request Payment
          </DialogTitle>
          <DialogDescription>
            Send a payment request to lawyers and CEO for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Commission Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{entityLabel}:</span>
              <span className="font-medium">{commission.entity_name || 'Unknown'}</span>
            </div>
            {commission.deal && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deal:</span>
                <span className="font-medium">{commission.deal.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium text-green-600">{formattedAmount}</span>
            </div>
          </div>

          {/* Lawyer Selection */}
          <div className="space-y-2">
            <Label htmlFor="lawyer" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Priority Lawyer (Optional)
            </Label>
            {loadingLawyers ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading lawyers...
              </div>
            ) : lawyers.length > 0 ? (
              <Select value={selectedLawyerId} onValueChange={setSelectedLawyerId}>
                <SelectTrigger id="lawyer">
                  <SelectValue placeholder="Select a lawyer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific lawyer</SelectItem>
                  {lawyers.map((lawyer) => (
                    <SelectItem key={lawyer.id} value={lawyer.id}>
                      {lawyer.display_name || lawyer.firm_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                {commission.deal_id
                  ? 'No lawyers assigned to this deal'
                  : 'No deal associated - CEO will be notified'}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any payment instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg text-sm">
            <p className="text-blue-800 dark:text-blue-200">
              <strong>Who will be notified:</strong>
            </p>
            <ul className="mt-1 text-blue-700 dark:text-blue-300 list-disc list-inside space-y-0.5">
              {lawyers.length > 0 && (
                <li>Lawyers assigned to this deal ({lawyers.length})</li>
              )}
              <li>CEO / Staff administrators</li>
              {selectedLawyerId && selectedLawyerId !== 'none' && (
                <li>Priority notification to selected lawyer</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Request Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
