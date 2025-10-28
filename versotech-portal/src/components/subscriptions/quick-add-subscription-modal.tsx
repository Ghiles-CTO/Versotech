'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface QuickAddSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultInvestorId?: string
  defaultVehicleId?: string
}

interface Investor {
  id: string
  legal_name: string
  email?: string
}

interface Vehicle {
  id: string
  name: string
  type: string
}

export function QuickAddSubscriptionModal({
  open,
  onOpenChange,
  defaultInvestorId,
  defaultVehicleId
}: QuickAddSubscriptionModalProps) {
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [investorId, setInvestorId] = useState(defaultInvestorId || '')
  const [vehicleId, setVehicleId] = useState(defaultVehicleId || '')
  const [commitment, setCommitment] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [status, setStatus] = useState('draft')

  // Data loading state
  const [investors, setInvestors] = useState<Investor[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search state
  const [investorSearch, setInvestorSearch] = useState('')
  const [vehicleSearch, setVehicleSearch] = useState('')

  // Load investors and vehicles on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true)

        // Load investors
        const { data: investorsData, error: investorsError } = await supabase
          .from('investors')
          .select('id, legal_name, email')
          .eq('status', 'active')
          .order('legal_name')
          .limit(100)

        if (investorsError) throw investorsError
        setInvestors(investorsData || [])

        // Load vehicles
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id, name, type')
          .eq('status', 'active')
          .order('name')

        if (vehiclesError) throw vehiclesError
        setVehicles(vehiclesData || [])
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load investors and vehicles')
      } finally {
        setLoadingData(false)
      }
    }

    if (open) {
      loadData()
    }
  }, [open, supabase])

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setInvestorId(defaultInvestorId || '')
      setVehicleId(defaultVehicleId || '')
      setCommitment('')
      setCurrency('USD')
      setStatus('draft')
      setError(null)
      setInvestorSearch('')
      setVehicleSearch('')
    }
  }, [open, defaultInvestorId, defaultVehicleId])

  // Filter investors based on search
  const filteredInvestors = investors.filter(investor =>
    investor.legal_name.toLowerCase().includes(investorSearch.toLowerCase()) ||
    investor.email?.toLowerCase().includes(investorSearch.toLowerCase())
  )

  // Filter vehicles based on search
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.name.toLowerCase().includes(vehicleSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!investorId) {
      setError('Please select an investor')
      return
    }
    if (!vehicleId) {
      setError('Please select a vehicle')
      return
    }
    if (!commitment || parseFloat(commitment) <= 0) {
      setError('Please enter a valid commitment amount')
      return
    }

    try {
      setSubmitting(true)

      // Create subscription
      const { data, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          investor_id: investorId,
          vehicle_id: vehicleId,
          commitment: parseFloat(commitment),
          currency,
          status,
          subscription_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      toast.success('Subscription created successfully', {
        description: `Created subscription for ${investors.find(i => i.id === investorId)?.legal_name}`,
        action: {
          label: 'View',
          onClick: () => router.push(`/versotech/staff/subscriptions`)
        }
      })

      // Close modal and refresh
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      console.error('Failed to create subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to create subscription')
      toast.error('Failed to create subscription')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Add Subscription
          </DialogTitle>
          <DialogDescription>
            Create a new subscription quickly. Press Cmd/Ctrl+Shift+S to open this dialog.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Investor Selection */}
              <div className="space-y-2">
                <Label htmlFor="investor">Investor *</Label>
                <Select value={investorId} onValueChange={setInvestorId}>
                  <SelectTrigger id="investor">
                    <SelectValue placeholder="Select investor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Search investors..."
                        value={investorSearch}
                        onChange={(e) => setInvestorSearch(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    {filteredInvestors.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No investors found
                      </div>
                    ) : (
                      filteredInvestors.map((investor) => (
                        <SelectItem key={investor.id} value={investor.id}>
                          {investor.legal_name}
                          {investor.email && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {investor.email}
                            </span>
                          )}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Selection */}
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle *</Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger id="vehicle">
                    <SelectValue placeholder="Select vehicle..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Search vehicles..."
                        value={vehicleSearch}
                        onChange={(e) => setVehicleSearch(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    {filteredVehicles.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No vehicles found
                      </div>
                    ) : (
                      filteredVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name}
                          <span className="text-xs text-muted-foreground ml-2">
                            {vehicle.type}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Commitment Amount */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="commitment">Commitment Amount *</Label>
                  <Input
                    id="commitment"
                    type="number"
                    placeholder="1000000"
                    value={commitment}
                    onChange={(e) => setCommitment(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CHF">CHF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || loadingData}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Subscription
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
