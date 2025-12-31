'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Loader2,
  Search,
  Users,
  Building2,
  Briefcase,
  UserCircle,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface AddParticipantModalProps {
  dealId: string
  onParticipantAdded?: () => void
}

type ParticipantCategory = 'investor' | 'partner' | 'introducer' | 'commercial_partner'

interface FeeComponent {
  kind: string
  rate_bps?: number
  flat_amount?: number
}

const PARTICIPANT_CATEGORIES = [
  {
    value: 'investor' as const,
    label: 'Investor',
    icon: UserCircle,
    description: 'Individual or entity investing in this deal',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    value: 'partner' as const,
    label: 'Partner',
    icon: Building2,
    description: 'Distribution or syndicate partner',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    value: 'introducer' as const,
    label: 'Introducer',
    icon: Users,
    description: 'Individual or entity introducing investors',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
  {
    value: 'commercial_partner' as const,
    label: 'Commercial Partner',
    icon: Briefcase,
    description: 'Wealth manager, placement agent, etc.',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
]

const INVESTOR_ROLES = [
  { value: 'investor', label: 'Investor' },
  { value: 'co_investor', label: 'Co-Investor' },
  { value: 'partner_investor', label: 'Partner Investor' },
  { value: 'introducer_investor', label: 'Introducer Investor' },
  { value: 'commercial_partner_investor', label: 'Commercial Partner Investor' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'banker', label: 'Banker' },
  { value: 'viewer', label: 'Viewer' },
]

const FEE_KINDS = [
  { value: 'subscription', label: 'Subscription Fee' },
  { value: 'management', label: 'Management Fee' },
  { value: 'performance', label: 'Performance Fee' },
  { value: 'spread_markup', label: 'Spread Markup' },
  { value: 'flat', label: 'Flat Fee' },
]

export function AddParticipantModal({ dealId, onParticipantAdded }: AddParticipantModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Category selection
  const [category, setCategory] = useState<ParticipantCategory | null>(null)

  // Step 2: Entity/User selection
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Investor-specific fields
  const [investorRole, setInvestorRole] = useState('investor')
  const [email, setEmail] = useState('')

  // Entity-specific fields (partner/introducer/commercial_partner)
  const [feePlanName, setFeePlanName] = useState('')
  const [feeComponents, setFeeComponents] = useState<FeeComponent[]>([
    { kind: 'subscription', rate_bps: 200 },
  ])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setCategory(null)
      setSearchQuery('')
      setSearchResults([])
      setSelectedEntity(null)
      setInvestorRole('investor')
      setEmail('')
      setFeePlanName('')
      setFeeComponents([{ kind: 'subscription', rate_bps: 200 }])
      setError(null)
      setSearchError(null)
      setHasSearched(false)
    }
  }, [open])

  // Search when query changes
  useEffect(() => {
    if (!category || !searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(() => {
      searchEntities()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, category])

  const searchEntities = async () => {
    if (!category) return

    setSearchLoading(true)
    setSearchError(null)
    setHasSearched(true)
    try {
      let endpoint = ''
      if (category === 'investor') {
        endpoint = `/api/investors?has_users=true&search=${encodeURIComponent(searchQuery)}`
      } else if (category === 'partner') {
        endpoint = `/api/admin/partners?search=${encodeURIComponent(searchQuery)}&status=active`
      } else if (category === 'introducer') {
        endpoint = `/api/admin/introducers?search=${encodeURIComponent(searchQuery)}&status=active`
      } else if (category === 'commercial_partner') {
        endpoint = `/api/admin/commercial-partners?search=${encodeURIComponent(searchQuery)}&status=active`
      }

      const response = await fetch(endpoint)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 403) {
          setSearchError('You do not have permission to search ' + category.replace('_', ' ') + 's')
        } else {
          setSearchError(errorData.error || 'Failed to search')
        }
        setSearchResults([])
        return
      }

      const data = await response.json()
      // Handle different response structures based on category
      let results: any[] = []
      if (category === 'investor') {
        results = data.investors || data.data || []
      } else if (category === 'partner') {
        results = data.partners || data.data || []
      } else if (category === 'introducer') {
        results = data.introducers || data.data || []
      } else if (category === 'commercial_partner') {
        // Note: commercial-partners API returns { partners: [...] }, not commercial_partners
        results = data.partners || data.commercial_partners || data.data || []
      }
      setSearchResults(Array.isArray(results) ? results.slice(0, 10) : [])
    } catch (err) {
      console.error('Search failed:', err)
      setSearchError('Network error. Please try again.')
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSelectEntity = (entity: any) => {
    setSelectedEntity(entity)
    setSearchQuery('')
    setSearchResults([])

    // Auto-fill fee plan name for entities
    if (category !== 'investor') {
      const entityName = entity.name || entity.legal_name || 'Unknown'
      setFeePlanName(`${entityName} Fee Plan`)
    }
  }

  const handleAddFeeComponent = () => {
    setFeeComponents([...feeComponents, { kind: 'subscription', rate_bps: 100 }])
  }

  const handleRemoveFeeComponent = (index: number) => {
    setFeeComponents(feeComponents.filter((_, i) => i !== index))
  }

  const handleFeeComponentChange = (index: number, field: keyof FeeComponent, value: any) => {
    const updated = [...feeComponents]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'rate_bps') delete updated[index].flat_amount
    if (field === 'flat_amount') delete updated[index].rate_bps
    setFeeComponents(updated)
  }

  const handleSubmit = async () => {
    if (!category) {
      setError('Please select a participant type')
      return
    }

    if (category === 'investor') {
      if (!selectedEntity && !email) {
        setError('Please select an investor or enter an email')
        return
      }
    } else {
      if (!selectedEntity) {
        setError(`Please select a ${category.replace('_', ' ')}`)
        return
      }
      if (!feePlanName.trim()) {
        setError('Please enter a fee plan name')
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      if (category === 'investor') {
        // Add via deal_memberships
        const response = await fetch(`/api/deals/${dealId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            investor_id: selectedEntity?.id || undefined,
            email: email || undefined,
            role: investorRole,
            send_notification: true,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to add investor')
        }
      } else {
        // Add via fee_plans (partners/introducers/commercial_partners)
        const response = await fetch(`/api/deals/${dealId}/partners`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entity_type: category,
            entity_id: selectedEntity.id,
            fee_plan_name: feePlanName.trim(),
            fee_components: feeComponents.filter(fc =>
              (fc.rate_bps !== undefined && fc.rate_bps !== null) ||
              (fc.flat_amount !== undefined && fc.flat_amount !== null)
            ),
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || `Failed to add ${category.replace('_', ' ')}`)
        }
      }

      setOpen(false)
      onParticipantAdded?.()
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getEntityDisplayName = (entity: any) => {
    return entity.legal_name || entity.name || 'Unknown'
  }

  const selectedCategoryInfo = PARTICIPANT_CATEGORIES.find(c => c.value === category)

  // Check if form is valid for submission
  const isFormValid = () => {
    if (!category) return false
    if (category === 'investor') {
      return !!(selectedEntity || email.trim())
    } else {
      return !!(selectedEntity && feePlanName.trim())
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Participant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Deal Participant</DialogTitle>
          <DialogDescription>
            Add an investor, partner, introducer, or commercial partner to this deal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Category Selection */}
          <div className="space-y-3">
            <Label>Participant Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {PARTICIPANT_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isSelected = category === cat.value
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setCategory(cat.value)
                      setSelectedEntity(null)
                      setSearchQuery('')
                      setSearchResults([])
                      setSearchError(null)
                      setHasSearched(false)
                      setEmail('')
                    }}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all',
                      isSelected
                        ? cat.color + ' border-2'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{cat.label}</div>
                        <div className="text-xs text-muted-foreground">{cat.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Search & Select */}
          {category && (
            <>
              <div className="space-y-3">
                <Label>
                  Search {selectedCategoryInfo?.label}s
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search by name...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Search Results */}
                {searchLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* Search Error */}
                {!searchLoading && searchError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {searchError}
                  </div>
                )}

                {/* No Results Found */}
                {!searchLoading && !searchError && hasSearched && searchResults.length === 0 && searchQuery.length >= 2 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No {selectedCategoryInfo?.label.toLowerCase()}s found matching "{searchQuery}"
                  </div>
                )}

                {!searchLoading && !searchError && searchResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto border border-white/10 rounded-lg">
                    {searchResults.map((entity) => (
                      <div
                        key={entity.id}
                        onClick={() => handleSelectEntity(entity)}
                        className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                      >
                        <p className="font-medium">{getEntityDisplayName(entity)}</p>
                        <p className="text-sm text-muted-foreground">
                          {entity.type || entity.partner_type || entity.cp_type || 'Entity'}
                          {entity.country && ` • ${entity.country}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Entity */}
                {selectedEntity && (
                  <div className={cn('p-3 rounded-lg border', selectedCategoryInfo?.color)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{getEntityDisplayName(selectedEntity)}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedEntity.contact_email || selectedEntity.email || 'No email'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEntity(null)}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                )}

                {/* Email input for investors only */}
                {category === 'investor' && !selectedEntity && (
                  <>
                    <div className="relative flex items-center">
                      <div className="flex-grow border-t border-white/10"></div>
                      <span className="px-3 text-sm text-muted-foreground">OR</span>
                      <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Invite by Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Investor Role Selection */}
              {category === 'investor' && (
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={investorRole} onValueChange={setInvestorRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVESTOR_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Fee Plan for entities */}
              {category !== 'investor' && selectedEntity && (
                <>
                  <div className="space-y-2">
                    <Label>Fee Plan Name</Label>
                    <Input
                      value={feePlanName}
                      onChange={(e) => setFeePlanName(e.target.value)}
                      placeholder="e.g., Standard Partner Fee"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Fee Components</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAddFeeComponent}
                        className="gap-1 text-xs"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {feeComponents.map((fc, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
                          <Select
                            value={fc.kind}
                            onValueChange={(v) => handleFeeComponentChange(idx, 'kind', v)}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FEE_KINDS.map((k) => (
                                <SelectItem key={k.value} value={k.value}>
                                  {k.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Rate %"
                            value={fc.rate_bps !== undefined && fc.rate_bps !== null ? fc.rate_bps / 100 : ''}
                            onChange={(e) =>
                              handleFeeComponentChange(
                                idx,
                                'rate_bps',
                                e.target.value ? parseFloat(e.target.value) * 100 : undefined
                              )
                            }
                            className="w-20"
                          />
                          <span className="text-xs text-muted-foreground">or</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Flat $"
                            value={fc.flat_amount !== undefined && fc.flat_amount !== null ? fc.flat_amount : ''}
                            onChange={(e) =>
                              handleFeeComponentChange(
                                idx,
                                'flat_amount',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            className="w-20"
                          />

                          {feeComponents.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFeeComponent(idx)}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
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
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add ${selectedCategoryInfo?.label || 'Participant'}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
