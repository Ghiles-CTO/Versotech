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
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { SubscriptionWithRelations } from '@/types/subscription'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SubscriptionEditDialogProps {
  subscription: SubscriptionWithRelations
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SubscriptionEditDialog({
  subscription,
  open,
  onOpenChange,
  onSuccess,
}: SubscriptionEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Info
    status: subscription.status || 'pending',
    effective_date: subscription.effective_date || '',
    committed_at: subscription.committed_at || '',
    funding_due_at: subscription.funding_due_at || '',
    contract_date: subscription.contract_date || '',
    opportunity_name: subscription.opportunity_name || '',
    sourcing_contract_ref: subscription.sourcing_contract_ref || '',

    // Financial Terms
    commitment: subscription.commitment?.toString() || '0',
    currency: subscription.currency || 'USD',
    units: subscription.units?.toString() || '',

    // Share Structure
    num_shares: subscription.num_shares?.toString() || '',
    price_per_share: subscription.price_per_share?.toString() || '',
    cost_per_share: subscription.cost_per_share?.toString() || '',
    spread_per_share: subscription.spread_per_share?.toString() || '',
    spread_fee_amount: subscription.spread_fee_amount?.toString() || '',

    // Fee Structure
    subscription_fee_percent: subscription.subscription_fee_percent?.toString() || '',
    subscription_fee_amount: subscription.subscription_fee_amount?.toString() || '',
    bd_fee_percent: subscription.bd_fee_percent?.toString() || '',
    bd_fee_amount: subscription.bd_fee_amount?.toString() || '',
    finra_fee_amount: subscription.finra_fee_amount?.toString() || '',
    performance_fee_tier1_percent: subscription.performance_fee_tier1_percent?.toString() || '',
    performance_fee_tier1_threshold: subscription.performance_fee_tier1_threshold?.toString() || '',
    performance_fee_tier2_percent: subscription.performance_fee_tier2_percent?.toString() || '',
    performance_fee_tier2_threshold: subscription.performance_fee_tier2_threshold?.toString() || '',

    // Tracking
    funded_amount: subscription.funded_amount?.toString() || '0',
    outstanding_amount: subscription.outstanding_amount?.toString() || '',
    capital_calls_total: subscription.capital_calls_total?.toString() || '0',
    distributions_total: subscription.distributions_total?.toString() || '0',
    current_nav: subscription.current_nav?.toString() || '',

    // Relationships
    introducer_id: subscription.introducer_id || '',
    introduction_id: subscription.introduction_id || '',

    // Notes
    acknowledgement_notes: subscription.acknowledgement_notes || '',
  })

  // Auto-calculate spread when price, cost, or num_shares changes
  useEffect(() => {
    const price = parseFloat(formData.price_per_share) || 0
    const cost = parseFloat(formData.cost_per_share) || 0
    const numShares = parseFloat(formData.num_shares) || 0

    if (price > 0 && cost > 0) {
      const spread = price - cost
      const spreadFee = spread * numShares
      setFormData(prev => ({
        ...prev,
        spread_per_share: spread.toFixed(6),
        spread_fee_amount: spreadFee.toFixed(2)
      }))
    }
  }, [formData.price_per_share, formData.cost_per_share, formData.num_shares])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updateData: any = {
        // Basic Info
        status: formData.status,
        effective_date: formData.effective_date || null,
        committed_at: formData.committed_at || null,
        funding_due_at: formData.funding_due_at || null,
        contract_date: formData.contract_date || null,
        opportunity_name: formData.opportunity_name || null,
        sourcing_contract_ref: formData.sourcing_contract_ref || null,

        // Financial Terms
        commitment: parseFloat(formData.commitment),
        currency: formData.currency,
        units: formData.units ? parseFloat(formData.units) : null,

        // Share Structure
        num_shares: formData.num_shares ? parseFloat(formData.num_shares) : null,
        price_per_share: formData.price_per_share ? parseFloat(formData.price_per_share) : null,
        cost_per_share: formData.cost_per_share ? parseFloat(formData.cost_per_share) : null,
        spread_per_share: formData.spread_per_share ? parseFloat(formData.spread_per_share) : null,
        spread_fee_amount: formData.spread_fee_amount ? parseFloat(formData.spread_fee_amount) : null,

        // Fee Structure
        subscription_fee_percent: formData.subscription_fee_percent ? parseFloat(formData.subscription_fee_percent) : null,
        subscription_fee_amount: formData.subscription_fee_amount ? parseFloat(formData.subscription_fee_amount) : null,
        bd_fee_percent: formData.bd_fee_percent ? parseFloat(formData.bd_fee_percent) : null,
        bd_fee_amount: formData.bd_fee_amount ? parseFloat(formData.bd_fee_amount) : null,
        finra_fee_amount: formData.finra_fee_amount ? parseFloat(formData.finra_fee_amount) : null,
        performance_fee_tier1_percent: formData.performance_fee_tier1_percent ? parseFloat(formData.performance_fee_tier1_percent) : null,
        performance_fee_tier1_threshold: formData.performance_fee_tier1_threshold ? parseFloat(formData.performance_fee_tier1_threshold) : null,
        performance_fee_tier2_percent: formData.performance_fee_tier2_percent ? parseFloat(formData.performance_fee_tier2_percent) : null,
        performance_fee_tier2_threshold: formData.performance_fee_tier2_threshold ? parseFloat(formData.performance_fee_tier2_threshold) : null,

        // Tracking
        funded_amount: parseFloat(formData.funded_amount),
        outstanding_amount: formData.outstanding_amount ? parseFloat(formData.outstanding_amount) : null,
        capital_calls_total: parseFloat(formData.capital_calls_total),
        distributions_total: parseFloat(formData.distributions_total),
        current_nav: formData.current_nav ? parseFloat(formData.current_nav) : null,

        // Relationships
        introducer_id: formData.introducer_id || null,
        introduction_id: formData.introduction_id || null,

        // Notes
        acknowledgement_notes: formData.acknowledgement_notes || null,
      }

      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update subscription')
      }

      toast.success('Subscription updated successfully')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update subscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-5xl max-h-[90vh] bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Subscription #{subscription.subscription_number}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update all subscription details for {subscription.investor?.legal_name || 'Unknown Investor'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full" id={`subscription-edit-tabs-${subscription.id}`}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 bg-muted">
              <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
              <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
              <TabsTrigger value="shares" className="text-xs">Shares</TabsTrigger>
              <TabsTrigger value="fees" className="text-xs">Fees</TabsTrigger>
              <TabsTrigger value="tracking" className="text-xs">Tracking</TabsTrigger>
              <TabsTrigger value="relationships" className="text-xs">Relations</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] pr-4">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-foreground">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                    >
                      <SelectTrigger id="status" className="bg-muted border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-muted border-border">
                        <SelectItem value="pending" className="text-foreground">Pending</SelectItem>
                        <SelectItem value="committed" className="text-foreground">Committed</SelectItem>
                        <SelectItem value="partially_funded" className="text-foreground">Partially Funded</SelectItem>
                        <SelectItem value="funded" className="text-foreground">Funded</SelectItem>
                        <SelectItem value="active" className="text-foreground">Active</SelectItem>
                        <SelectItem value="closed" className="text-foreground">Closed</SelectItem>
                        <SelectItem value="cancelled" className="text-foreground">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opportunity_name" className="text-foreground">Opportunity Name</Label>
                    <Input
                      id="opportunity_name"
                      type="text"
                      value={formData.opportunity_name}
                      onChange={(e) => setFormData({ ...formData, opportunity_name: e.target.value })}
                      className="bg-muted border-border text-foreground"
                      placeholder="Deal or opportunity name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effective_date" className="text-foreground">Effective Date</Label>
                    <Input
                      id="effective_date"
                      type="date"
                      value={formData.effective_date}
                      onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                      className="bg-muted border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="committed_at" className="text-foreground">Committed Date</Label>
                    <Input
                      id="committed_at"
                      type="date"
                      value={formData.committed_at}
                      onChange={(e) => setFormData({ ...formData, committed_at: e.target.value })}
                      className="bg-muted border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funding_due_at" className="text-foreground">Funding Due Date</Label>
                    <Input
                      id="funding_due_at"
                      type="date"
                      value={formData.funding_due_at}
                      onChange={(e) => setFormData({ ...formData, funding_due_at: e.target.value })}
                      className="bg-muted border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contract_date" className="text-foreground">Contract Date</Label>
                    <Input
                      id="contract_date"
                      type="date"
                      value={formData.contract_date}
                      onChange={(e) => setFormData({ ...formData, contract_date: e.target.value })}
                      className="bg-muted border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="sourcing_contract_ref" className="text-foreground">Sourcing Contract Reference</Label>
                    <Input
                      id="sourcing_contract_ref"
                      type="text"
                      value={formData.sourcing_contract_ref}
                      onChange={(e) => setFormData({ ...formData, sourcing_contract_ref: e.target.value })}
                      className="bg-muted border-border text-foreground"
                      placeholder="External contract reference"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Financial Terms Tab */}
              <TabsContent value="financial" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="commitment" className="text-foreground">Commitment Amount *</Label>
                    <Input
                      id="commitment"
                      type="number"
                      step="0.01"
                      value={formData.commitment}
                      onChange={(e) => setFormData({ ...formData, commitment: e.target.value })}
                      className="bg-muted border-border text-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-foreground">Currency *</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger id="currency" className="bg-muted border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-muted border-border">
                        <SelectItem value="USD" className="text-foreground">USD</SelectItem>
                        <SelectItem value="EUR" className="text-foreground">EUR</SelectItem>
                        <SelectItem value="GBP" className="text-foreground">GBP</SelectItem>
                        <SelectItem value="AUD" className="text-foreground">AUD</SelectItem>
                        <SelectItem value="CAD" className="text-foreground">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="units" className="text-foreground">Units</Label>
                    <Input
                      id="units"
                      type="number"
                      step="0.01"
                      value={formData.units}
                      onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                      className="bg-muted border-border text-foreground"
                      placeholder="Number of units"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Share Structure Tab */}
              <TabsContent value="shares" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="num_shares" className="text-foreground">Number of Shares</Label>
                    <Input
                      id="num_shares"
                      type="number"
                      step="1"
                      value={formData.num_shares}
                      onChange={(e) => setFormData({ ...formData, num_shares: e.target.value })}
                      className="bg-muted border-border text-foreground"
                      placeholder="Total shares"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_per_share" className="text-foreground">Price Per Share</Label>
                    <Input
                      id="price_per_share"
                      type="number"
                      step="0.01"
                      value={formData.price_per_share}
                      onChange={(e) => setFormData({ ...formData, price_per_share: e.target.value })}
                      className="bg-muted border-border text-foreground"
                      placeholder="Sell price"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost_per_share" className="text-foreground">Cost Per Share</Label>
                    <Input
                      id="cost_per_share"
                      type="number"
                      step="0.01"
                      value={formData.cost_per_share}
                      onChange={(e) => setFormData({ ...formData, cost_per_share: e.target.value })}
                      className="bg-muted border-border text-foreground"
                      placeholder="Acquisition cost"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="spread_per_share" className="text-foreground">
                      Spread Per Share
                      <span className="ml-2 text-xs text-amber-400">(auto-calculated)</span>
                    </Label>
                    <Input
                      id="spread_per_share"
                      type="number"
                      step="0.01"
                      value={formData.spread_per_share}
                      onChange={(e) => setFormData({ ...formData, spread_per_share: e.target.value })}
                      className="bg-muted border-amber-500/30 text-foreground"
                      placeholder="Spread markup"
                    />
                    <p className="text-xs text-muted-foreground/70">Price − Cost (can override)</p>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="spread_fee_amount" className="text-foreground">
                      Spread Fee Amount
                      <span className="ml-2 text-xs text-amber-400">(auto-calculated)</span>
                    </Label>
                    <Input
                      id="spread_fee_amount"
                      type="number"
                      step="0.01"
                      value={formData.spread_fee_amount}
                      onChange={(e) => setFormData({ ...formData, spread_fee_amount: e.target.value })}
                      className="bg-muted border-amber-500/30 text-foreground"
                      placeholder="Total spread fee"
                    />
                    <p className="text-xs text-muted-foreground/70">Spread × Shares (can override)</p>
                  </div>
                </div>
              </TabsContent>

              {/* Fee Structure Tab */}
              <TabsContent value="fees" className="space-y-4 mt-4">
                <div className="space-y-6">
                  {/* Subscription Fees */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Subscription Fees</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subscription_fee_percent" className="text-foreground">Subscription Fee %</Label>
                        <Input
                          id="subscription_fee_percent"
                          type="number"
                          step="0.01"
                          value={formData.subscription_fee_percent}
                          onChange={(e) => setFormData({ ...formData, subscription_fee_percent: e.target.value })}
                          className="bg-muted border-border text-foreground"
                          placeholder="e.g., 2.0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subscription_fee_amount" className="text-foreground">Subscription Fee Amount</Label>
                        <Input
                          id="subscription_fee_amount"
                          type="number"
                          step="0.01"
                          value={formData.subscription_fee_amount}
                          onChange={(e) => setFormData({ ...formData, subscription_fee_amount: e.target.value })}
                          className="bg-muted border-border text-foreground"
                          placeholder="Fixed amount"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Broker-Dealer Fees */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Broker-Dealer Fees</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bd_fee_percent" className="text-foreground">BD Fee %</Label>
                        <Input
                          id="bd_fee_percent"
                          type="number"
                          step="0.01"
                          value={formData.bd_fee_percent}
                          onChange={(e) => setFormData({ ...formData, bd_fee_percent: e.target.value })}
                          className="bg-muted border-border text-foreground"
                          placeholder="e.g., 1.5"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bd_fee_amount" className="text-foreground">BD Fee Amount</Label>
                        <Input
                          id="bd_fee_amount"
                          type="number"
                          step="0.01"
                          value={formData.bd_fee_amount}
                          onChange={(e) => setFormData({ ...formData, bd_fee_amount: e.target.value })}
                          className="bg-muted border-border text-foreground"
                          placeholder="Fixed amount"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FINRA Fee */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Regulatory Fees</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="finra_fee_amount" className="text-foreground">FINRA Fee Amount</Label>
                        <Input
                          id="finra_fee_amount"
                          type="number"
                          step="0.01"
                          value={formData.finra_fee_amount}
                          onChange={(e) => setFormData({ ...formData, finra_fee_amount: e.target.value })}
                          className="bg-muted border-border text-foreground"
                          placeholder="FINRA regulatory fee"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Performance Fees */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Performance Fees (Tier Structure)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="performance_fee_tier1_percent" className="text-foreground">Tier 1 %</Label>
                        <Input
                          id="performance_fee_tier1_percent"
                          type="number"
                          step="0.01"
                          value={formData.performance_fee_tier1_percent}
                          onChange={(e) => setFormData({ ...formData, performance_fee_tier1_percent: e.target.value })}
                          className="bg-muted border-border text-foreground"
                          placeholder="e.g., 20.0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="performance_fee_tier1_threshold" className="text-foreground">Tier 1 Threshold</Label>
                        <Input
                          id="performance_fee_tier1_threshold"
                          type="number"
                          step="0.01"
                          value={formData.performance_fee_tier1_threshold}
                          onChange={(e) => setFormData({ ...formData, performance_fee_tier1_threshold: e.target.value })}
                          className="bg-muted border-border text-foreground"
                          placeholder="Hurdle amount"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="performance_fee_tier2_percent" className="text-foreground">Tier 2 %</Label>
                        <Input
                          id="performance_fee_tier2_percent"
                          type="number"
                          step="0.01"
                          value={formData.performance_fee_tier2_percent}
                          onChange={(e) => setFormData({ ...formData, performance_fee_tier2_percent: e.target.value })}
                          className="bg-muted border-border text-foreground"
                          placeholder="e.g., 30.0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="performance_fee_tier2_threshold" className="text-foreground">Tier 2 Threshold</Label>
                        <Input
                          id="performance_fee_tier2_threshold"
                          type="number"
                          step="0.01"
                          value={formData.performance_fee_tier2_threshold}
                          onChange={(e) => setFormData({ ...formData, performance_fee_tier2_threshold: e.target.value })}
                          className="bg-muted border-border text-foreground"
                          placeholder="Higher hurdle"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tracking Tab */}
              <TabsContent value="tracking" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="funded_amount" className="text-foreground">Funded Amount</Label>
                    <Input
                      id="funded_amount"
                      type="number"
                      step="0.01"
                      value={formData.funded_amount}
                      onChange={(e) => setFormData({ ...formData, funded_amount: e.target.value })}
                      className="bg-muted border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outstanding_amount" className="text-foreground">Outstanding Amount</Label>
                    <Input
                      id="outstanding_amount"
                      type="number"
                      step="0.01"
                      value={formData.outstanding_amount}
                      onChange={(e) => setFormData({ ...formData, outstanding_amount: e.target.value })}
                      className="bg-muted border-border text-foreground"
                      placeholder="Unfunded commitment"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capital_calls_total" className="text-foreground">Capital Calls Total</Label>
                    <Input
                      id="capital_calls_total"
                      type="number"
                      step="0.01"
                      value={formData.capital_calls_total}
                      onChange={(e) => setFormData({ ...formData, capital_calls_total: e.target.value })}
                      className="bg-muted border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distributions_total" className="text-foreground">Distributions Total</Label>
                    <Input
                      id="distributions_total"
                      type="number"
                      step="0.01"
                      value={formData.distributions_total}
                      onChange={(e) => setFormData({ ...formData, distributions_total: e.target.value })}
                      className="bg-muted border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="current_nav" className="text-foreground">Current NAV</Label>
                    <Input
                      id="current_nav"
                      type="number"
                      step="0.01"
                      value={formData.current_nav}
                      onChange={(e) => setFormData({ ...formData, current_nav: e.target.value })}
                      className="bg-muted border-border text-foreground"
                      placeholder="Current net asset value"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Relationships Tab */}
              <TabsContent value="relationships" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="introducer_id" className="text-foreground">Introducer ID</Label>
                    <Input
                      id="introducer_id"
                      type="text"
                      value={formData.introducer_id}
                      onChange={(e) => setFormData({ ...formData, introducer_id: e.target.value })}
                      className="bg-muted border-border text-foreground"
                      placeholder="UUID of introducer"
                    />
                    <p className="text-xs text-muted-foreground/70">Link to introducer who referred this subscription</p>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="introduction_id" className="text-foreground">Introduction ID</Label>
                    <Input
                      id="introduction_id"
                      type="text"
                      value={formData.introduction_id}
                      onChange={(e) => setFormData({ ...formData, introduction_id: e.target.value })}
                      className="bg-muted border-border text-foreground"
                      placeholder="UUID of introduction record"
                    />
                    <p className="text-xs text-muted-foreground/70">Link to specific introduction event</p>
                  </div>
                </div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-foreground">Acknowledgement Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.acknowledgement_notes}
                    onChange={(e) => setFormData({ ...formData, acknowledgement_notes: e.target.value })}
                    className="bg-muted border-border text-foreground min-h-[300px]"
                    placeholder="Add any notes, acknowledgements, or special terms for this subscription..."
                  />
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-muted text-foreground border-border hover:bg-muted/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? 'Saving...' : 'Save All Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
