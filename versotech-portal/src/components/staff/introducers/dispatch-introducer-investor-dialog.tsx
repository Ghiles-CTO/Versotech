'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Users,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  FileSignature,
  ArrowRight,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface DispatchIntroducerInvestorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  introducerId: string
  introducerName: string
  feePlans: FeePlan[]
}

interface FeePlan {
  id: string
  name: string
  status: 'draft' | 'sent' | 'pending_signature' | 'accepted' | 'rejected'
  is_active: boolean
  deal: {
    id: string
    name: string
    status: string
  } | null
  term_sheet: {
    id: string
    version: number
  } | null
  introducer_agreement: {
    id: string
    reference_number: string | null
    status: string
    signed_date: string | null
  } | null
}

interface LinkableInvestor {
  user_id: string
  investor_id: string
  display_name: string
  email: string
  current_role: string
}

export function DispatchIntroducerInvestorDialog({
  open,
  onOpenChange,
  introducerId,
  introducerName,
  feePlans,
}: DispatchIntroducerInvestorDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Select Deal (only deals with valid fee plans + active agreements)
  const [selectedDealId, setSelectedDealId] = useState<string>('')

  // Step 2: Select Fee Plan (auto-populated from deal selection)
  const [selectedFeePlanId, setSelectedFeePlanId] = useState<string>('')
  const [selectedFeePlan, setSelectedFeePlan] = useState<FeePlan | null>(null)

  // Step 3: Select Investor
  const [linkableInvestors, setLinkableInvestors] = useState<LinkableInvestor[]>([])
  const [linkableInvestorsLoading, setLinkableInvestorsLoading] = useState(false)
  const [selectedInvestorId, setSelectedInvestorId] = useState<string>('')

  // Filter fee plans to only show those with:
  // 1. status='accepted' AND is_active=true
  // 2. introducer_agreement?.status='active' AND signed_date not null
  // Memoized to prevent infinite re-render loops
  const validFeePlans = useMemo(() =>
    feePlans.filter(fp =>
      fp.status === 'accepted' &&
      fp.is_active &&
      fp.introducer_agreement?.status === 'active' &&
      fp.introducer_agreement?.signed_date !== null &&
      fp.deal !== null
    ),
    [feePlans]
  )

  // Get unique deals from valid fee plans
  const dealsWithValidPlans = useMemo(() =>
    validFeePlans.reduce((acc, fp) => {
      if (fp.deal && !acc.find(d => d.id === fp.deal!.id)) {
        acc.push(fp.deal)
      }
      return acc
    }, [] as { id: string; name: string; status: string }[]),
    [validFeePlans]
  )

  // Get fee plans for selected deal
  const feePlansForDeal = useMemo(() =>
    selectedDealId
      ? validFeePlans.filter(fp => fp.deal?.id === selectedDealId)
      : [],
    [selectedDealId, validFeePlans]
  )

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedDealId('')
      setSelectedFeePlanId('')
      setSelectedFeePlan(null)
      setLinkableInvestors([])
      setSelectedInvestorId('')
      setError(null)
    }
  }, [open])

  // When deal changes, reset fee plan and investor
  useEffect(() => {
    setSelectedFeePlanId('')
    setSelectedFeePlan(null)
    setLinkableInvestors([])
    setSelectedInvestorId('')

    // Auto-select if only one fee plan for this deal
    // feePlansForDeal is already computed with new selectedDealId (useMemo runs before effects)
    if (feePlansForDeal.length === 1) {
      setSelectedFeePlanId(feePlansForDeal[0].id)
      setSelectedFeePlan(feePlansForDeal[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDealId]) // Only trigger on deal change, not feePlansForDeal reference change

  // Update selectedFeePlan when fee plan ID changes
  useEffect(() => {
    if (!selectedFeePlanId) {
      setSelectedFeePlan(null)
      setLinkableInvestors([])
      setSelectedInvestorId('')
      return
    }

    const fp = validFeePlans.find(p => p.id === selectedFeePlanId)
    setSelectedFeePlan(fp || null)
  }, [selectedFeePlanId, validFeePlans])

  // Fetch linkable investors when fee plan is selected
  // Uses AbortController to prevent race conditions when user quickly switches selections
  useEffect(() => {
    const dealId = selectedFeePlan?.deal?.id
    const termSheetId = selectedFeePlan?.term_sheet?.id

    if (!dealId || !termSheetId) {
      setLinkableInvestors([])
      setSelectedInvestorId('')
      return
    }

    const abortController = new AbortController()

    const fetchInvestors = async () => {
      setLinkableInvestorsLoading(true)
      setLinkableInvestors([])
      setSelectedInvestorId('')

      try {
        const response = await fetch(
          `/api/deals/${dealId}/linkable-investors?term_sheet_id=${termSheetId}`,
          { signal: abortController.signal }
        )
        if (response.ok) {
          const data = await response.json()
          setLinkableInvestors(data.investors || [])
        } else {
          // API returned an error - show empty list (error is non-critical)
          console.error('Failed to fetch linkable investors:', response.status, response.statusText)
          setLinkableInvestors([])
        }
      } catch (err: any) {
        // Ignore abort errors - they're expected when selection changes quickly
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch linkable investors:', err)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLinkableInvestorsLoading(false)
        }
      }
    }

    fetchInvestors()

    // Cleanup: abort the fetch if selection changes before it completes
    return () => abortController.abort()
  }, [selectedFeePlan])

  const handleSubmit = async () => {
    if (!selectedFeePlan || !selectedInvestorId) {
      setError('Please complete all selections')
      return
    }

    // Defensive check - deal should always exist for valid fee plans
    if (!selectedFeePlan.deal?.id) {
      setError('Invalid fee plan selected - missing deal information')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/deals/${selectedFeePlan.deal.id}/members/${selectedInvestorId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referred_by_entity_id: introducerId,
            referred_by_entity_type: 'introducer',
            assigned_fee_plan_id: selectedFeePlanId,
            role: 'introducer_investor'
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to link investor to introducer')
      }

      toast.success('Investor successfully linked to introducer')
      onOpenChange(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = selectedDealId && selectedFeePlanId && selectedInvestorId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Dispatch Investor for {introducerName}</DialogTitle>
          <DialogDescription>
            Link an investor to this introducer using an active fee agreement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* No valid fee plans warning */}
          {validFeePlans.length === 0 ? (
            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-300">No active fee agreements</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {introducerName} has no active fee agreements with signed terms.
                    Create and sign an introducer agreement from a deal first.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Select Deal */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-medium">1</span>
                  Select Deal
                </Label>
                <Select value={selectedDealId} onValueChange={setSelectedDealId}>
                  <SelectTrigger className={cn(selectedDealId && 'border-primary/50')}>
                    <SelectValue placeholder="Select a deal" />
                  </SelectTrigger>
                  <SelectContent>
                    {dealsWithValidPlans.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{deal.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Only deals with active signed agreements are shown
                </p>
              </div>

              {/* Step 2: Select Fee Plan */}
              {selectedDealId && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-medium">2</span>
                    Select Fee Plan
                  </Label>
                  {feePlansForDeal.length === 1 ? (
                    <div className="p-3 rounded-lg bg-muted/50 border border-primary/30">
                      <div className="flex items-center gap-3">
                        <FileSignature className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{feePlansForDeal[0].name}</p>
                          {feePlansForDeal[0].term_sheet && (
                            <p className="text-xs text-muted-foreground">
                              Term Sheet v{feePlansForDeal[0].term_sheet.version}
                            </p>
                          )}
                        </div>
                        <Badge className="ml-auto bg-green-500/20 text-green-400">
                          Active
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <Select value={selectedFeePlanId} onValueChange={setSelectedFeePlanId}>
                      <SelectTrigger className={cn(selectedFeePlanId && 'border-primary/50')}>
                        <SelectValue placeholder="Select a fee plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {feePlansForDeal.map((fp) => (
                          <SelectItem key={fp.id} value={fp.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{fp.name}</span>
                              {fp.term_sheet && (
                                <span className="text-xs text-muted-foreground">
                                  Term Sheet v{fp.term_sheet.version}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Step 3: Select Investor */}
              {selectedFeePlan && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-medium">3</span>
                    Select Investor
                  </Label>
                  {linkableInvestorsLoading ? (
                    <div className="flex items-center gap-2 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Loading eligible investors...</span>
                    </div>
                  ) : linkableInvestors.length === 0 ? (
                    <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-300">No eligible investors</p>
                          <p className="text-xs text-blue-300/80 mt-1">
                            No investors on this term sheet are available.
                            They may already be linked to an introducer.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Select value={selectedInvestorId} onValueChange={setSelectedInvestorId}>
                      <SelectTrigger className={cn(selectedInvestorId && 'border-primary/50')}>
                        <SelectValue placeholder="Select an investor" />
                      </SelectTrigger>
                      <SelectContent>
                        {linkableInvestors.map((investor) => (
                          <SelectItem key={investor.user_id} value={investor.user_id}>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <div className="flex flex-col">
                                <span>{investor.display_name}</span>
                                {investor.email && (
                                  <span className="text-xs text-muted-foreground">{investor.email}</span>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Summary */}
              {isFormValid && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-emerald-300 font-medium">Ready to dispatch</p>
                      <p className="text-emerald-300/80 text-xs mt-1">
                        The selected investor will be linked to <strong>{introducerName}</strong> using
                        the <strong>{selectedFeePlan?.name}</strong> fee plan.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !isFormValid || validFeePlans.length === 0}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Dispatch Investor
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
