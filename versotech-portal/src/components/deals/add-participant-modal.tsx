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
type ReferringEntityType = 'partner' | 'introducer' | 'commercial_partner'

interface FeeComponent {
  kind: string
  rate_bps?: number
  flat_amount?: number
}

interface FeePlan {
  id: string
  name: string
  description?: string
  status: string
  is_default: boolean
  is_active: boolean
  accepted_at?: string
  fee_components: FeeComponent[]
}

interface FeePlansResponse {
  fee_plans: FeePlan[]
  accepted_plans: FeePlan[]
  can_dispatch: boolean
  message: string | null
  entity_name: string
}

interface TermSheet {
  id: string
  version: number
  status: string
  subscription_fee_percent: number | null
  management_fee_percent: number | null
  carried_interest_percent: number | null
  term_sheet_date: string | null
}

// Roles that require a referring entity and fee plan
const ROLES_REQUIRING_REFERRER: Record<string, ReferringEntityType> = {
  'partner_investor': 'partner',
  'introducer_investor': 'introducer',
  'commercial_partner_investor': 'commercial_partner',
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

  // Referring entity fields (for roles like introducer_investor, partner_investor)
  const [referringEntitySearch, setReferringEntitySearch] = useState('')
  const [referringEntityResults, setReferringEntityResults] = useState<any[]>([])
  const [selectedReferringEntity, setSelectedReferringEntity] = useState<any>(null)
  const [referringEntityLoading, setReferringEntityLoading] = useState(false)
  const [hasReferringEntitySearched, setHasReferringEntitySearched] = useState(false)

  // Fee plan selection (when dispatching through an entity)
  const [feePlansData, setFeePlansData] = useState<FeePlansResponse | null>(null)
  const [feePlansLoading, setFeePlansLoading] = useState(false)
  const [selectedFeePlanId, setSelectedFeePlanId] = useState<string | null>(null)

  // Term sheet selection (for all investors - determines investor class)
  const [publishedTermSheets, setPublishedTermSheets] = useState<TermSheet[]>([])
  const [selectedTermSheetId, setSelectedTermSheetId] = useState<string | null>(null)
  const [termSheetsLoading, setTermSheetsLoading] = useState(false)

  // Entity-specific fields (partner/introducer/commercial_partner)
  const [feePlanName, setFeePlanName] = useState('')
  const [feeComponents, setFeeComponents] = useState<FeeComponent[]>([
    { kind: 'subscription', rate_bps: 200 },
  ])

  // Check if current role requires a referring entity
  const requiresReferrer = !!ROLES_REQUIRING_REFERRER[investorRole]
  const referrerEntityType = ROLES_REQUIRING_REFERRER[investorRole]

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
      // Reset referring entity state
      setReferringEntitySearch('')
      setReferringEntityResults([])
      setSelectedReferringEntity(null)
      setHasReferringEntitySearched(false)
      setFeePlansData(null)
      setSelectedFeePlanId(null)
      // Reset term sheet state
      setPublishedTermSheets([])
      setSelectedTermSheetId(null)
    }
  }, [open])

  // Reset referring entity and term sheet when role changes
  useEffect(() => {
    setSelectedReferringEntity(null)
    setReferringEntitySearch('')
    setReferringEntityResults([])
    setHasReferringEntitySearched(false)
    setFeePlansData(null)
    setSelectedFeePlanId(null)
    // Keep term sheet selected if changing between investor roles
    // Only reset if switching to non-investor roles
  }, [investorRole])

  // Fetch published term sheets when category is investor
  useEffect(() => {
    if (category === 'investor') {
      fetchPublishedTermSheets()
    } else {
      setPublishedTermSheets([])
      setSelectedTermSheetId(null)
    }
  }, [category])

  // Reset fee plans when term sheet changes (re-fetch with term sheet filter)
  useEffect(() => {
    if (selectedReferringEntity && referrerEntityType && selectedTermSheetId) {
      fetchFeePlans()
    } else if (!selectedTermSheetId) {
      // Clear fee plans if no term sheet selected
      setFeePlansData(null)
      setSelectedFeePlanId(null)
    }
  }, [selectedTermSheetId])

  // Search referring entities when query changes
  useEffect(() => {
    if (!requiresReferrer || !referringEntitySearch || referringEntitySearch.length < 2) {
      setReferringEntityResults([])
      return
    }

    const timer = setTimeout(() => {
      searchReferringEntities()
    }, 300)

    return () => clearTimeout(timer)
  }, [referringEntitySearch, referrerEntityType])

  // Fetch fee plans when referring entity is selected AND term sheet is selected
  // Term sheet must be selected first to filter fee plans correctly
  useEffect(() => {
    if (selectedReferringEntity && referrerEntityType && selectedTermSheetId) {
      fetchFeePlans()
    }
  }, [selectedReferringEntity, referrerEntityType])

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

  // Search for referring entities (partners/introducers/commercial_partners)
  const searchReferringEntities = async () => {
    if (!referrerEntityType) return

    setReferringEntityLoading(true)
    setHasReferringEntitySearched(true)
    try {
      let endpoint = ''
      if (referrerEntityType === 'partner') {
        endpoint = `/api/admin/partners?search=${encodeURIComponent(referringEntitySearch)}&status=active`
      } else if (referrerEntityType === 'introducer') {
        endpoint = `/api/admin/introducers?search=${encodeURIComponent(referringEntitySearch)}&status=active`
      } else if (referrerEntityType === 'commercial_partner') {
        endpoint = `/api/admin/commercial-partners?search=${encodeURIComponent(referringEntitySearch)}&status=active`
      }

      const response = await fetch(endpoint)
      if (!response.ok) {
        setReferringEntityResults([])
        return
      }

      const data = await response.json()
      let results: any[] = []
      if (referrerEntityType === 'partner') {
        results = data.partners || data.data || []
      } else if (referrerEntityType === 'introducer') {
        results = data.introducers || data.data || []
      } else if (referrerEntityType === 'commercial_partner') {
        results = data.partners || data.commercial_partners || data.data || []
      }
      setReferringEntityResults(Array.isArray(results) ? results.slice(0, 10) : [])
    } catch (err) {
      console.error('Referring entity search failed:', err)
      setReferringEntityResults([])
    } finally {
      setReferringEntityLoading(false)
    }
  }

  // Fetch published term sheets for the deal
  const fetchPublishedTermSheets = async () => {
    setTermSheetsLoading(true)
    try {
      const response = await fetch(`/api/deals/${dealId}/fee-structures?status=published`)
      if (!response.ok) {
        console.error('Failed to fetch term sheets')
        setPublishedTermSheets([])
        return
      }
      const data = await response.json()
      // API returns { term_sheets: [...] }
      const termSheets = data.term_sheets || []
      setPublishedTermSheets(termSheets)
    } catch (err) {
      console.error('Term sheets fetch failed:', err)
      setPublishedTermSheets([])
    } finally {
      setTermSheetsLoading(false)
    }
  }

  // Fetch fee plans for the selected referring entity
  const fetchFeePlans = async () => {
    if (!selectedReferringEntity || !referrerEntityType) return

    setFeePlansLoading(true)
    setFeePlansData(null)
    setSelectedFeePlanId(null)
    try {
      // Include term_sheet_id filter if selected
      let endpoint = `/api/deals/${dealId}/dispatch/fee-plans?entity_id=${selectedReferringEntity.id}&entity_type=${referrerEntityType}`
      if (selectedTermSheetId) {
        endpoint += `&term_sheet_id=${selectedTermSheetId}`
      }
      const response = await fetch(endpoint)

      if (!response.ok) {
        console.error('Failed to fetch fee plans')
        return
      }

      const data: FeePlansResponse = await response.json()
      setFeePlansData(data)

      // Auto-select if only one accepted plan
      if (data.accepted_plans.length === 1) {
        setSelectedFeePlanId(data.accepted_plans[0].id)
      }
    } catch (err) {
      console.error('Fee plans fetch failed:', err)
    } finally {
      setFeePlansLoading(false)
    }
  }

  const handleSelectReferringEntity = (entity: any) => {
    setSelectedReferringEntity(entity)
    setReferringEntitySearch('')
    setReferringEntityResults([])
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
      // All investors must select a term sheet (investor class)
      if (!selectedTermSheetId) {
        setError('Please select a term sheet for this investor')
        return
      }
      // Validate referrer and fee plan for roles that require them
      if (requiresReferrer) {
        if (!selectedReferringEntity) {
          const entityLabel = referrerEntityType?.replace('_', ' ') || 'entity'
          setError(`Please select a ${entityLabel} for this investor role`)
          return
        }
        if (!feePlansData?.can_dispatch) {
          setError(feePlansData?.message || 'No accepted fee plan available for this entity')
          return
        }
        if (!selectedFeePlanId) {
          setError('Please select a fee plan')
          return
        }
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
        // Build request body with optional referrer and fee plan
        const requestBody: Record<string, any> = {
          investor_id: selectedEntity?.id || undefined,
          email: email || undefined,
          role: investorRole,
          send_notification: true,
          // Always include term sheet for investors
          term_sheet_id: selectedTermSheetId,
        }

        // Add referrer and fee plan if required
        if (requiresReferrer && selectedReferringEntity && selectedFeePlanId) {
          requestBody.referred_by_entity_id = selectedReferringEntity.id
          requestBody.referred_by_entity_type = referrerEntityType
          requestBody.assigned_fee_plan_id = selectedFeePlanId
        }

        // Add via deal_memberships
        const response = await fetch(`/api/deals/${dealId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || data.error || 'Failed to add investor')
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
      const hasInvestor = !!(selectedEntity || email.trim())
      if (!hasInvestor) return false
      // Additional validation for roles requiring referrer
      if (requiresReferrer) {
        if (!selectedReferringEntity) return false
        if (!feePlansData?.can_dispatch) return false
        if (!selectedFeePlanId) return false
      }
      return true
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

              {/* Term Sheet Selection - Required for ALL investors */}
              {category === 'investor' && (
                <div className="space-y-2">
                  <Label>Term Sheet (Investor Class)</Label>
                  {termSheetsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading term sheets...</span>
                    </div>
                  ) : publishedTermSheets.length === 0 ? (
                    <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-300 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>No published term sheets available for this deal. Please publish a term sheet first.</span>
                      </div>
                    </div>
                  ) : (
                    <Select value={selectedTermSheetId || ''} onValueChange={setSelectedTermSheetId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term sheet for this investor" />
                      </SelectTrigger>
                      <SelectContent>
                        {publishedTermSheets.map((ts) => (
                          <SelectItem key={ts.id} value={ts.id}>
                            v{ts.version} — {ts.subscription_fee_percent ?? 0}% sub / {ts.management_fee_percent ?? 0}% mgmt / {ts.carried_interest_percent ?? 0}% carry
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedTermSheetId && (
                    <p className="text-xs text-muted-foreground">
                      This term sheet will determine the fee structure the investor sees.
                    </p>
                  )}
                </div>
              )}

              {/* Referring Entity Selection - for roles requiring an introducer/partner/commercial_partner */}
              {category === 'investor' && requiresReferrer && (
                <div className="space-y-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <Label className="text-amber-300">
                      Referring {referrerEntityType?.replace('_', ' ')} Required
                    </Label>
                  </div>

                  {/* Search for Referring Entity */}
                  {!selectedReferringEntity && (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={`Search ${referrerEntityType?.replace('_', ' ')}s...`}
                          value={referringEntitySearch}
                          onChange={(e) => setReferringEntitySearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {referringEntityLoading && (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}

                      {!referringEntityLoading && hasReferringEntitySearched && referringEntityResults.length === 0 && referringEntitySearch.length >= 2 && (
                        <div className="text-center py-2 text-muted-foreground text-sm">
                          No {referrerEntityType?.replace('_', ' ')}s found
                        </div>
                      )}

                      {!referringEntityLoading && referringEntityResults.length > 0 && (
                        <div className="max-h-32 overflow-y-auto border border-white/10 rounded-lg">
                          {referringEntityResults.map((entity) => (
                            <div
                              key={entity.id}
                              onClick={() => handleSelectReferringEntity(entity)}
                              className="p-2 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 text-sm"
                            >
                              <p className="font-medium">{getEntityDisplayName(entity)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Selected Referring Entity */}
                  {selectedReferringEntity && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-amber-200">
                              {getEntityDisplayName(selectedReferringEntity)}
                            </p>
                            <p className="text-xs text-amber-300/70">
                              {referrerEntityType?.replace('_', ' ')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReferringEntity(null)
                              setFeePlansData(null)
                              setSelectedFeePlanId(null)
                            }}
                            className="text-amber-300 hover:text-amber-100"
                          >
                            Change
                          </Button>
                        </div>
                      </div>

                      {/* Warning: Term sheet required before fee plan selection */}
                      {!selectedTermSheetId && (
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-blue-300 font-medium">Term Sheet Required</p>
                              <p className="text-xs text-blue-300/80 mt-1">
                                Please select a term sheet above first. Fee plans are linked to specific term sheets.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Fee Plan Selection */}
                      {selectedTermSheetId && feePlansLoading && (
                        <div className="flex items-center justify-center py-3">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                          <span className="text-sm text-muted-foreground">Loading fee plans...</span>
                        </div>
                      )}

                      {selectedTermSheetId && !feePlansLoading && feePlansData && !feePlansData.can_dispatch && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                            <div>
                              <p className="text-sm text-destructive font-medium">Cannot Dispatch</p>
                              <p className="text-xs text-destructive/80 mt-1">
                                {feePlansData.message || 'No accepted fee plan available for this term sheet'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedTermSheetId && !feePlansLoading && feePlansData && feePlansData.can_dispatch && (
                        <div className="space-y-2">
                          <Label>Select Fee Plan</Label>
                          <Select
                            value={selectedFeePlanId || ''}
                            onValueChange={setSelectedFeePlanId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an accepted fee plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {feePlansData.accepted_plans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{plan.name}</span>
                                    {plan.is_default && (
                                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Display selected fee plan details */}
                          {selectedFeePlanId && (
                            <div className="p-2 rounded bg-muted/30 text-xs space-y-1">
                              {feePlansData.accepted_plans
                                .find(p => p.id === selectedFeePlanId)
                                ?.fee_components.map((fc, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span className="text-muted-foreground capitalize">
                                      {fc.kind.replace('_', ' ')}
                                    </span>
                                    <span>
                                      {fc.rate_bps !== undefined
                                        ? `${(fc.rate_bps / 100).toFixed(2)}%`
                                        : fc.flat_amount !== undefined
                                          ? `$${fc.flat_amount.toLocaleString()}`
                                          : '-'}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
