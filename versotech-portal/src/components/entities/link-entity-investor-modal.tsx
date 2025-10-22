'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Plus, Search, FileText } from 'lucide-react'
import type { EntityInvestorSummary } from './types'
import { toast } from 'sonner'

const allocationStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'committed', label: 'Committed' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' }
]

const investorTypeOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'entity', label: 'Entity' },
  { value: 'family_office', label: 'Family Office' },
  { value: 'fund', label: 'Fund' }
]

const subscriptionStatusOptions = allocationStatusOptions

interface StaffInvestorSummary {
  id: string
  legal_name: string
  display_name?: string | null
  email?: string | null
  type?: string | null
  status?: string | null
}

interface LinkEntityInvestorModalProps {
  entityId: string
  open: boolean
  onClose: () => void
  onSuccess: (investor: EntityInvestorSummary) => void
}

export function LinkEntityInvestorModal({
  entityId,
  open,
  onClose,
  onSuccess
}: LinkEntityInvestorModalProps) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [investors, setInvestors] = useState<StaffInvestorSummary[]>([])
  const [selectedInvestor, setSelectedInvestor] = useState<string>('')

  const [relationshipRole, setRelationshipRole] = useState('')
  const [allocationStatus, setAllocationStatus] = useState<string>('pending')
  const [notes, setNotes] = useState('')
  const [sendInvite, setSendInvite] = useState(true)

  const [commitment, setCommitment] = useState<string>('')
  const [currency, setCurrency] = useState<string>('USD')
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('pending')
  const [effectiveDate, setEffectiveDate] = useState<string>('')
  const [fundingDueAt, setFundingDueAt] = useState<string>('')
  const [units, setUnits] = useState<string>('')
  const [acknowledgementNotes, setAcknowledgementNotes] = useState<string>('')

  const [newInvestor, setNewInvestor] = useState({
    legal_name: '',
    display_name: '',
    type: 'institutional',
    email: '',
    phone: '',
    country: '',
    country_of_incorporation: '',
    tax_residency: ''
  })

  useEffect(() => {
    if (!open) {
      setMode('existing')
      setSearchQuery('')
      setSelectedInvestor('')
      setRelationshipRole('')
      setAllocationStatus('pending')
      setNotes('')
      setSendInvite(true)
      setCommitment('')
      setCurrency('USD')
      setSubscriptionStatus('pending')
      setEffectiveDate('')
      setFundingDueAt('')
      setUnits('')
      setAcknowledgementNotes('')
      setNewInvestor({
        legal_name: '',
        display_name: '',
        type: 'institutional',
        email: '',
        phone: '',
        country: '',
        country_of_incorporation: '',
        tax_residency: ''
      })
      return
    }

    setSearchLoading(true)
    fetch('/api/staff/investors')
      .then((res) => res.json())
      .then((data) => {
        setInvestors(data.investors || [])
      })
      .catch((error) => {
        console.error('Failed to load investors:', error)
      })
      .finally(() => setSearchLoading(false))
  }, [open])

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()

    const handler = setTimeout(() => {
      setSearchLoading(true)
      const url = searchQuery.trim()
        ? `/api/staff/investors?search=${encodeURIComponent(searchQuery.trim())}`
        : '/api/staff/investors'

      fetch(url, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setInvestors(data.investors || []))
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Investor search failed:', error)
          }
        })
        .finally(() => setSearchLoading(false))
    }, 300)

    return () => {
      controller.abort()
      clearTimeout(handler)
    }
  }, [searchQuery, open])

  const selectedInvestorSummary = useMemo(
    () => investors.find((inv) => inv.id === selectedInvestor),
    [investors, selectedInvestor]
  )

  const handleSubmit = useCallback(async () => {
    if (mode === 'existing' && !selectedInvestor) {
      return
    }

    if (mode === 'new' && !newInvestor.legal_name.trim()) {
      return
    }

    setLoading(true)

    try {
      const payload: Record<string, any> = {
        relationship_role: relationshipRole.trim() || null,
        allocation_status: allocationStatus,
        notes: notes.trim() || null,
        send_invite: sendInvite
      }

      const subscriptionPayload: Record<string, any> = {}
      if (commitment) {
        const value = Number(commitment)
        if (!Number.isNaN(value)) {
          subscriptionPayload.commitment = value
        }
      }
      if (units) {
        const value = Number(units)
        if (!Number.isNaN(value)) {
          subscriptionPayload.units = value
        }
      }

      if (Object.keys(subscriptionPayload).length > 0 || effectiveDate || fundingDueAt || acknowledgementNotes || subscriptionStatus !== 'pending' || currency !== 'USD') {
        subscriptionPayload.currency = currency.toUpperCase()
        subscriptionPayload.status = subscriptionStatus
        subscriptionPayload.effective_date = effectiveDate || null
        subscriptionPayload.funding_due_at = fundingDueAt || null
        subscriptionPayload.acknowledgement_notes = acknowledgementNotes.trim() || null
        payload.subscription = subscriptionPayload
      }

      if (mode === 'existing') {
        payload.investor_id = selectedInvestor
      } else {
        payload.investor = {
          legal_name: newInvestor.legal_name.trim(),
          display_name: newInvestor.display_name.trim() || null,
          type: newInvestor.type,
          email: newInvestor.email.trim() || null,
          phone: newInvestor.phone.trim() || null,
          country: newInvestor.country.trim() || null,
          country_of_incorporation: newInvestor.country_of_incorporation.trim() || null,
          tax_residency: newInvestor.tax_residency.trim() || null
        }
      }

      const response = await fetch(`/api/entities/${entityId}/investors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to link investor')
      }

      const data = await response.json()
      onSuccess(data.investor as EntityInvestorSummary)
      onClose()
    } catch (error) {
      console.error('Failed to link investor:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [
    mode,
    selectedInvestor,
    newInvestor,
    relationshipRole,
    allocationStatus,
    notes,
    sendInvite,
    commitment,
    units,
    currency,
    subscriptionStatus,
    effectiveDate,
    fundingDueAt,
    acknowledgementNotes,
    entityId,
    onClose,
    onSuccess
  ])

  const handleConfirm = async () => {
    try {
      await handleSubmit()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Failed to link investor. Please try again.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] bg-zinc-950 border-white/10 flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b border-white/10">
          <DialogTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-400" />
            Allocate Investor to Entity
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Link an existing investor or create a new profile and capture their subscription details.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-6 py-6">
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'existing' | 'new')}>
              <TabsList className="grid grid-cols-2 bg-white/5 border border-white/10 w-full">
                <TabsTrigger value="existing" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-100 text-white">
                  Select Existing Investor
                </TabsTrigger>
                <TabsTrigger value="new" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-100 text-white">
                  Create New Investor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="existing" className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="investor-search" className="text-sm font-medium text-white">
                    Search Investors
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="investor-search"
                      className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                      placeholder="Search by name, email, or type"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Start typing to filter the investor list</p>
                </div>

                <ScrollArea className="h-[240px] rounded-md border border-white/10 bg-white/5">
                  <div className="divide-y divide-white/5">
                    {searchLoading && (
                      <div className="flex items-center justify-center py-8 text-sm text-gray-400">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-400" />
                        <span>Loading investors...</span>
                      </div>
                    )}
                    {!searchLoading && investors.length === 0 && (
                      <div className="py-8 text-center text-sm text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                            <Search className="h-6 w-6" />
                          </div>
                          <p className="text-white">No investors found.</p>
                          <p className="text-xs">Try adjusting your search or create a new investor.</p>
                        </div>
                      </div>
                    )}
                    {investors.map((investor) => (
                      <button
                        key={investor.id}
                        type="button"
                        onClick={() => setSelectedInvestor(investor.id)}
                        className={`w-full px-4 py-3 text-left transition-all ${
                          selectedInvestor === investor.id
                            ? 'bg-emerald-500/10 border-l-2 border-emerald-400'
                            : 'hover:bg-white/10 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-white">{investor.legal_name}</p>
                            <p className="text-xs text-gray-400 capitalize">
                              {investor.type ? investor.type.replace(/_/g, ' ') : 'Type unknown'}
                              {investor.email ? ` • ${investor.email}` : ''}
                            </p>
                          </div>
                          {selectedInvestor === investor.id && (
                            <Badge variant="outline" className="text-xs bg-emerald-500/20 border-emerald-400/40 text-emerald-100">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>

                {selectedInvestorSummary && (
                  <div className="rounded-md border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <span className="text-emerald-200 font-semibold text-lg">
                          {selectedInvestorSummary.legal_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-emerald-100">{selectedInvestorSummary.legal_name}</p>
                        {selectedInvestorSummary.email && <p className="text-emerald-200 text-xs">{selectedInvestorSummary.email}</p>}
                        {selectedInvestorSummary.type && (
                          <p className="capitalize text-emerald-300 text-xs mt-1">{selectedInvestorSummary.type.replace(/_/g, ' ')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="new" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="new-legal-name" className="text-sm font-medium text-white">Legal Name *</Label>
                    <Input
                      id="new-legal-name"
                      value={newInvestor.legal_name}
                      onChange={(event) =>
                        setNewInvestor((prev) => ({ ...prev, legal_name: event.target.value }))
                      }
                      placeholder="Investor legal name"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-display-name" className="text-sm font-medium text-white">Display Name</Label>
                    <Input
                      id="new-display-name"
                      value={newInvestor.display_name}
                      onChange={(event) =>
                        setNewInvestor((prev) => ({ ...prev, display_name: event.target.value }))
                      }
                      placeholder="Optional short label"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-type" className="text-sm font-medium text-white">Investor Type</Label>
                    <Select
                      value={newInvestor.type}
                      onValueChange={(value) => setNewInvestor((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger id="new-type" className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10">
                        {investorTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-white">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-email" className="text-sm font-medium text-white">Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newInvestor.email}
                      onChange={(event) =>
                        setNewInvestor((prev) => ({ ...prev, email: event.target.value }))
                      }
                      placeholder="investor@email.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-phone" className="text-sm font-medium text-white">Phone</Label>
                    <Input
                      id="new-phone"
                      value={newInvestor.phone}
                      onChange={(event) =>
                        setNewInvestor((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      placeholder="+1 (555) 123-4567"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-country" className="text-sm font-medium text-white">Country</Label>
                    <Input
                      id="new-country"
                      value={newInvestor.country}
                      onChange={(event) =>
                        setNewInvestor((prev) => ({ ...prev, country: event.target.value }))
                      }
                      placeholder="Country of residence"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-incorporation" className="text-sm font-medium text-white">Country of Incorporation</Label>
                    <Input
                      id="new-incorporation"
                      value={newInvestor.country_of_incorporation}
                      onChange={(event) =>
                        setNewInvestor((prev) => ({
                          ...prev,
                          country_of_incorporation: event.target.value
                        }))
                      }
                      placeholder="Jurisdiction"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="new-tax-residency" className="text-sm font-medium text-white">Tax Residency</Label>
                    <Input
                      id="new-tax-residency"
                      value={newInvestor.tax_residency}
                      onChange={(event) =>
                        setNewInvestor((prev) => ({ ...prev, tax_residency: event.target.value }))
                      }
                      placeholder="Tax residency"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="rounded-lg border border-white/10 bg-white/5 p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Allocation Details</h3>
                  <p className="text-xs text-gray-400">Define the investor's role and subscription terms</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="relationship_role" className="text-sm font-medium text-white">Relationship Role</Label>
                  <Input
                    id="relationship_role"
                    value={relationshipRole}
                    onChange={(event) => setRelationshipRole(event.target.value)}
                    placeholder="e.g., Lead LP, Co-investor, Cornerstone"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allocation_status" className="text-sm font-medium text-white">Allocation Status</Label>
                  <Select
                    value={allocationStatus}
                    onValueChange={(value) => setAllocationStatus(value)}
                  >
                    <SelectTrigger id="allocation_status" className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10">
                      {allocationStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="commitment" className="text-sm font-medium text-white">Commitment Amount</Label>
                  <Input
                    id="commitment"
                    value={commitment}
                    onChange={(event) => setCommitment(event.target.value)}
                    placeholder="e.g., 2500000"
                    inputMode="numeric"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-white">Currency</Label>
                  <Input
                    id="currency"
                    value={currency}
                    maxLength={3}
                    onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscription_status" className="text-sm font-medium text-white">Subscription Status</Label>
                  <Select
                    value={subscriptionStatus}
                    onValueChange={(value) => setSubscriptionStatus(value)}
                  >
                    <SelectTrigger id="subscription_status" className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10">
                      {subscriptionStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="effective_date" className="text-sm font-medium text-white">Effective Date</Label>
                  <Input
                    id="effective_date"
                    type="date"
                    value={effectiveDate}
                    onChange={(event) => setEffectiveDate(event.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="funding_due_at" className="text-sm font-medium text-white">Funding Due Date</Label>
                  <Input
                    id="funding_due_at"
                    type="date"
                    value={fundingDueAt}
                    onChange={(event) => setFundingDueAt(event.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="units" className="text-sm font-medium text-white">Units</Label>
                  <Input
                    id="units"
                    value={units}
                    onChange={(event) => setUnits(event.target.value)}
                    placeholder="e.g., 1000"
                    inputMode="numeric"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ack-notes" className="text-sm font-medium text-white">Acknowledgement Notes</Label>
                <Textarea
                  id="ack-notes"
                  value={acknowledgementNotes}
                  onChange={(event) => setAcknowledgementNotes(event.target.value)}
                  placeholder="Internal notes about subscription acknowledgement or pending actions"
                  rows={2}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="investor-notes" className="text-sm font-medium text-white">Internal Notes</Label>
                <Textarea
                  id="investor-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add any context for the team (not shared with investors)"
                  rows={3}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                />
              </div>

              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 p-3">
                <Checkbox
                  id="send-invite"
                  checked={sendInvite}
                  onCheckedChange={(value) => setSendInvite(Boolean(value))}
                  className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <Label htmlFor="send-invite" className="text-sm text-white cursor-pointer">
                  Send investor portal invitation (if not already invited)
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 shrink-0 flex flex-col gap-2 sm:flex-row sm:justify-end border-t border-white/10 bg-zinc-950">
          <Button variant="outline" onClick={onClose} disabled={loading} className="border-white/20 text-white hover:bg-white/10 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || (mode === 'existing' && !selectedInvestor) || (mode === 'new' && !newInvestor.legal_name.trim())}
            className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Link Investor
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
