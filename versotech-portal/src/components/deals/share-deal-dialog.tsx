'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Share2, Users, UserPlus, Percent, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

/**
 * ShareDealDialog - PRD Rows 95-96
 *
 * Row 95: Partner shares deal to INVESTOR only
 * Row 96: Partner shares deal to INVESTOR + INTRODUCER (co-referral)
 *
 * This creates a deal_membership with:
 * - referred_by_entity_id = partner.id
 * - referred_by_entity_type = 'partner'
 * - dispatched_at = now()
 *
 * And automatically applies the partner's fee model from partner_fee_models
 */

interface Investor {
  id: string
  display_name: string | null
  legal_name: string | null
  email: string | null
  type: 'individual' | 'entity'
}

interface Introducer {
  id: string
  name: string
  email: string | null
}

interface FeeModel {
  id: string
  fee_type: string
  percentage_rate: number | null
  flat_amount: number | null
  currency: string | null
}

interface ShareDealDialogProps {
  dealId: string
  dealName: string
  partnerId: string
  children: React.ReactNode
}

export function ShareDealDialog({
  dealId,
  dealName,
  partnerId,
  children
}: ShareDealDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Data
  const [investors, setInvestors] = useState<Investor[]>([])
  const [introducers, setIntroducers] = useState<Introducer[]>([])
  const [feeModel, setFeeModel] = useState<FeeModel | null>(null)
  const [alreadySharedWith, setAlreadySharedWith] = useState<Set<string>>(new Set())

  // Form state
  const [selectedInvestorId, setSelectedInvestorId] = useState<string>('')
  const [selectedIntroducerId, setSelectedIntroducerId] = useState<string>('')
  const [includeIntroducer, setIncludeIntroducer] = useState(false)
  const [searchInvestor, setSearchInvestor] = useState('')

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, partnerId, dealId])

  async function fetchData() {
    setLoading(true)
    try {
      const supabase = createClient()

      // Fetch investors (all investors, partner will pick one to share with)
      const { data: investorsData, error: investorsError } = await supabase
        .from('investors')
        .select('id, display_name, legal_name, email, type')
        .order('display_name')
        .limit(100)

      if (investorsError) throw investorsError
      setInvestors(investorsData || [])

      // Fetch introducers associated with this partner
      const { data: introducersData, error: introducersError } = await supabase
        .from('introducers')
        .select('id, name, email')
        .order('name')
        .limit(50)

      if (introducersError) {
        console.warn('Could not fetch introducers:', introducersError)
      }
      setIntroducers(introducersData || [])

      // Fetch partner's fee model for this deal
      const { data: feeModelData, error: feeModelError } = await supabase
        .from('partner_fee_models')
        .select('id, fee_type, percentage_rate, flat_amount, currency')
        .eq('partner_id', partnerId)
        .eq('deal_id', dealId)
        .maybeSingle()

      if (feeModelError) {
        console.warn('Could not fetch fee model:', feeModelError)
      }
      setFeeModel(feeModelData)

      // Check which investors already have deal membership for this deal
      // (to prevent duplicate shares)
      const { data: existingMemberships, error: membershipsError } = await supabase
        .from('deal_memberships')
        .select('investor_id')
        .eq('deal_id', dealId)
        .not('investor_id', 'is', null)

      if (membershipsError) {
        console.warn('Could not fetch existing memberships:', membershipsError)
      }

      const sharedSet = new Set<string>()
      existingMemberships?.forEach(m => {
        if (m.investor_id) sharedSet.add(m.investor_id)
      })
      setAlreadySharedWith(sharedSet)

    } catch (err) {
      console.error('[ShareDealDialog] Error fetching data:', err)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleShare() {
    if (!selectedInvestorId) {
      toast.error('Please select an investor')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/partners/me/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: dealId,
          investor_id: selectedInvestorId,
          introducer_id: includeIntroducer ? selectedIntroducerId : null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to share deal')
      }

      setSuccess(true)
      toast.success('Deal shared successfully!')

      // Update the already shared list
      setAlreadySharedWith(prev => new Set([...prev, selectedInvestorId]))

      // Reset form after 2 seconds
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setSelectedInvestorId('')
        setSelectedIntroducerId('')
        setIncludeIntroducer(false)
      }, 2000)

    } catch (err) {
      console.error('[ShareDealDialog] Error sharing deal:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to share deal')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter investors by search
  const filteredInvestors = investors.filter(inv => {
    if (!searchInvestor) return true
    const name = inv.display_name || inv.legal_name || ''
    const email = inv.email || ''
    const search = searchInvestor.toLowerCase()
    return name.toLowerCase().includes(search) || email.toLowerCase().includes(search)
  })

  // Available investors (not already shared with)
  const availableInvestors = filteredInvestors.filter(inv => !alreadySharedWith.has(inv.id))

  const selectedInvestor = investors.find(inv => inv.id === selectedInvestorId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            Share Deal with Investor
          </DialogTitle>
          <DialogDescription>
            Share <strong>{dealName}</strong> with an investor in your network.
            {feeModel && (
              <span className="block mt-1 text-emerald-600">
                Your commission: {feeModel.percentage_rate ? `${feeModel.percentage_rate}%` : `${feeModel.currency} ${feeModel.flat_amount}`}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">Deal Shared Successfully!</h3>
            <p className="text-muted-foreground mt-1">
              The investor will receive an invitation to view this opportunity.
            </p>
          </div>
        ) : loading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Investor Selection */}
            <div className="space-y-2">
              <Label htmlFor="investor" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Select Investor *
              </Label>
              <Input
                placeholder="Search investors by name or email..."
                value={searchInvestor}
                onChange={(e) => setSearchInvestor(e.target.value)}
                className="mb-2"
              />
              <Select value={selectedInvestorId} onValueChange={setSelectedInvestorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an investor" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableInvestors.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      {alreadySharedWith.size > 0
                        ? 'All matching investors already have access'
                        : 'No investors found'}
                    </div>
                  ) : (
                    availableInvestors.map((investor) => (
                      <SelectItem key={investor.id} value={investor.id}>
                        <div className="flex items-center gap-2">
                          <span>{investor.display_name || investor.legal_name || 'Unknown'}</span>
                          <Badge variant="outline" className="text-xs">
                            {investor.type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedInvestor?.email && (
                <p className="text-xs text-muted-foreground pl-1">{selectedInvestor.email}</p>
              )}
            </div>

            {/* Co-referral with Introducer (PRD Row 96) */}
            {introducers.length > 0 && (
              <div className="border border-border rounded-lg p-4 bg-muted space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-introducer"
                    checked={includeIntroducer}
                    onCheckedChange={(checked) => setIncludeIntroducer(checked === true)}
                  />
                  <Label htmlFor="include-introducer" className="flex items-center gap-2 cursor-pointer">
                    <UserPlus className="h-4 w-4 text-purple-600" />
                    Co-refer with Introducer
                  </Label>
                </div>

                {includeIntroducer && (
                  <Select value={selectedIntroducerId} onValueChange={setSelectedIntroducerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an introducer" />
                    </SelectTrigger>
                    <SelectContent>
                      {introducers.map((introducer) => (
                        <SelectItem key={introducer.id} value={introducer.id}>
                          {introducer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Fee Model Display (PRD Row 77) */}
            {feeModel && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Percent className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">
                    Your Commission Rate
                  </p>
                  <p className="text-xs text-emerald-600">
                    {feeModel.fee_type}: {feeModel.percentage_rate
                      ? `${feeModel.percentage_rate}% of investment`
                      : `${feeModel.currency} ${feeModel.flat_amount} flat fee`}
                  </p>
                </div>
              </div>
            )}

            {/* Warning if no fee model */}
            {!feeModel && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    No Fee Model Assigned
                  </p>
                  <p className="text-xs text-amber-600">
                    Contact your arranger to set up a commission structure for this deal.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {!success && !loading && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={submitting || !selectedInvestorId}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share Deal
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
