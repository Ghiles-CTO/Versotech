'use client'

import { useState, useEffect, useCallback } from 'react'
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

  // Entity lists for dropdowns
  const [investors, setInvestors] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [introducers, setIntroducers] = useState<any[]>([])
  const [commercialPartners, setCommercialPartners] = useState<any[]>([])
  const [entitiesLoading, setEntitiesLoading] = useState(false)

  // Selected entity
  const [selectedEntityId, setSelectedEntityId] = useState<string>('')
  const [selectedEntity, setSelectedEntity] = useState<any>(null)

  // Investor-specific fields
  const [investorRole, setInvestorRole] = useState('investor')

  // Referring entity for investor roles that require it
  const [selectedReferringEntityId, setSelectedReferringEntityId] = useState<string>('')
  const [selectedReferringEntity, setSelectedReferringEntity] = useState<any>(null)

  // Fee plan selection (when dispatching through an entity)
  const [feePlansData, setFeePlansData] = useState<FeePlansResponse | null>(null)
  const [feePlansLoading, setFeePlansLoading] = useState(false)
  const [selectedFeePlanId, setSelectedFeePlanId] = useState<string>('')

  // Term sheet selection (for all investors - determines investor class)
  const [publishedTermSheets, setPublishedTermSheets] = useState<TermSheet[]>([])
  const [selectedTermSheetId, setSelectedTermSheetId] = useState<string>('')
  const [termSheetsLoading, setTermSheetsLoading] = useState(false)

  // Entity-specific fields (partner/introducer/commercial_partner)
  const [feePlanName, setFeePlanName] = useState('')
  const [feeComponents, setFeeComponents] = useState<FeeComponent[]>([
    { kind: 'subscription', rate_bps: 200 },
  ])

  // Check if current role requires a referring entity
  const requiresReferrer = !!ROLES_REQUIRING_REFERRER[investorRole]
  const referrerEntityType = ROLES_REQUIRING_REFERRER[investorRole]

  // ===== CALLBACKS (defined first, before useEffects) =====

  // Get the appropriate entity list for referring entity dropdown
  const getReferringEntityList = useCallback(() => {
    if (referrerEntityType === 'partner') return partners
    if (referrerEntityType === 'introducer') return introducers
    if (referrerEntityType === 'commercial_partner') return commercialPartners
    return []
  }, [referrerEntityType, partners, introducers, commercialPartners])

  const loadAllEntities = useCallback(async () => {
    setEntitiesLoading(true)
    try {
      // Load all entity types in parallel
      const [investorsRes, partnersRes, introducersRes, cpRes] = await Promise.all([
        fetch('/api/investors?has_users=true'),
        fetch('/api/admin/partners?status=active'),
        fetch('/api/admin/introducers?status=active'),
        fetch('/api/admin/commercial-partners?status=active'),
      ])

      if (investorsRes.ok) {
        const data = await investorsRes.json()
        setInvestors(data.investors || data.data || [])
      }
      if (partnersRes.ok) {
        const data = await partnersRes.json()
        setPartners(data.partners || data.data || [])
      }
      if (introducersRes.ok) {
        const data = await introducersRes.json()
        setIntroducers(data.introducers || data.data || [])
      }
      if (cpRes.ok) {
        const data = await cpRes.json()
        setCommercialPartners(data.partners || data.commercial_partners || data.data || [])
      }
    } catch (err) {
      console.error('Failed to load entities:', err)
    } finally {
      setEntitiesLoading(false)
    }
  }, [])

  const fetchPublishedTermSheets = useCallback(async () => {
    setTermSheetsLoading(true)
    try {
      const response = await fetch(`/api/deals/${dealId}/fee-structures?status=published`)
      if (response.ok) {
        const data = await response.json()
        setPublishedTermSheets(data.term_sheets || [])
      }
    } catch (err) {
      console.error('Term sheets fetch failed:', err)
    } finally {
      setTermSheetsLoading(false)
    }
  }, [dealId])

  const fetchFeePlans = useCallback(async () => {
    if (!selectedReferringEntity || !referrerEntityType) return

    setFeePlansLoading(true)
    setFeePlansData(null)
    setSelectedFeePlanId('')
    try {
      let endpoint = `/api/deals/${dealId}/dispatch/fee-plans?entity_id=${selectedReferringEntity.id}&entity_type=${referrerEntityType}`
      if (selectedTermSheetId) {
        endpoint += `&term_sheet_id=${selectedTermSheetId}`
      }
      const response = await fetch(endpoint)

      if (response.ok) {
        const data: FeePlansResponse = await response.json()
        setFeePlansData(data)
        // Auto-select if only one accepted plan
        if (data.accepted_plans.length === 1) {
          setSelectedFeePlanId(data.accepted_plans[0].id)
        }
      }
    } catch (err) {
      console.error('Fee plans fetch failed:', err)
    } finally {
      setFeePlansLoading(false)
    }
  }, [dealId, selectedReferringEntity, referrerEntityType, selectedTermSheetId])

  // ===== USE EFFECTS (after callbacks are defined) =====

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setCategory(null)
      setSelectedEntityId('')
      setSelectedEntity(null)
      setInvestorRole('investor')
      setFeePlanName('')
      setFeeComponents([{ kind: 'subscription', rate_bps: 200 }])
      setError(null)
      setSelectedReferringEntityId('')
      setSelectedReferringEntity(null)
      setFeePlansData(null)
      setSelectedFeePlanId('')
      setPublishedTermSheets([])
      setSelectedTermSheetId('')
    }
  }, [open])

  // Load all entity lists when modal opens
  useEffect(() => {
    if (open) {
      loadAllEntities()
    }
  }, [open, loadAllEntities])

  // Reset selections when category changes
  useEffect(() => {
    setSelectedEntityId('')
    setSelectedEntity(null)
    setInvestorRole('investor')
    setSelectedReferringEntityId('')
    setSelectedReferringEntity(null)
    setFeePlansData(null)
    setSelectedFeePlanId('')
    setFeePlanName('')
  }, [category])

  // Reset referring entity when role changes
  useEffect(() => {
    setSelectedReferringEntityId('')
    setSelectedReferringEntity(null)
    setFeePlansData(null)
    setSelectedFeePlanId('')
  }, [investorRole])

  // Fetch published term sheets when category is investor
  useEffect(() => {
    if (category === 'investor' && open) {
      fetchPublishedTermSheets()
    } else {
      setPublishedTermSheets([])
      setSelectedTermSheetId('')
    }
  }, [category, open, fetchPublishedTermSheets])

  // Fetch fee plans when referring entity is selected AND term sheet is selected
  useEffect(() => {
    if (selectedReferringEntity && referrerEntityType && selectedTermSheetId) {
      fetchFeePlans()
    } else {
      setFeePlansData(null)
      setSelectedFeePlanId('')
    }
  }, [selectedReferringEntity, referrerEntityType, selectedTermSheetId, fetchFeePlans])

  // Update selectedEntity when dropdown changes
  useEffect(() => {
    if (!selectedEntityId) {
      setSelectedEntity(null)
      return
    }

    let entityList: any[] = []
    if (category === 'investor') entityList = investors
    else if (category === 'partner') entityList = partners
    else if (category === 'introducer') entityList = introducers
    else if (category === 'commercial_partner') entityList = commercialPartners

    const entity = entityList.find(e => e.id === selectedEntityId)
    setSelectedEntity(entity || null)

    // Auto-fill fee plan name for non-investor entities
    if (entity && category !== 'investor') {
      const entityName = entity.name || entity.legal_name || 'Unknown'
      setFeePlanName(`${entityName} Fee Plan`)
    }
  }, [selectedEntityId, category, investors, partners, introducers, commercialPartners])

  // Update selectedReferringEntity when dropdown changes
  useEffect(() => {
    if (!selectedReferringEntityId) {
      setSelectedReferringEntity(null)
      return
    }

    const entityList = getReferringEntityList()
    const entity = entityList.find(e => e.id === selectedReferringEntityId)
    setSelectedReferringEntity(entity || null)
  }, [selectedReferringEntityId, getReferringEntityList])

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
      if (!selectedEntity) {
        setError('Please select an investor')
        return
      }
      if (!selectedTermSheetId) {
        setError('Please select a term sheet for this investor')
        return
      }
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
        const requestBody: Record<string, any> = {
          investor_id: selectedEntity.id,
          role: investorRole,
          send_notification: true,
          term_sheet_id: selectedTermSheetId,
        }

        if (requiresReferrer && selectedReferringEntity && selectedFeePlanId) {
          requestBody.referred_by_entity_id = selectedReferringEntity.id
          requestBody.referred_by_entity_type = referrerEntityType
          requestBody.assigned_fee_plan_id = selectedFeePlanId
        }

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

  // Get the entity list for current category
  const getEntityListForCategory = () => {
    if (category === 'investor') return investors
    if (category === 'partner') return partners
    if (category === 'introducer') return introducers
    if (category === 'commercial_partner') return commercialPartners
    return []
  }

  // Check if form is valid for submission
  const isFormValid = () => {
    if (!category) return false
    if (category === 'investor') {
      if (!selectedEntity) return false
      if (!selectedTermSheetId) return false
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
                    onClick={() => setCategory(cat.value)}
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

          {/* Step 2: Entity Selection Dropdown */}
          {category && (
            <>
              <div className="space-y-2">
                <Label>Select {selectedCategoryInfo?.label}</Label>
                {entitiesLoading ? (
                  <div className="flex items-center gap-2 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading {selectedCategoryInfo?.label.toLowerCase()}s...</span>
                  </div>
                ) : getEntityListForCategory().length === 0 ? (
                  <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-300 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>No {selectedCategoryInfo?.label.toLowerCase()}s available.</span>
                    </div>
                  </div>
                ) : (
                  <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                    <SelectTrigger className={cn(selectedEntity && selectedCategoryInfo?.color)}>
                      <SelectValue placeholder={`Select a ${selectedCategoryInfo?.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {getEntityListForCategory().map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          <div className="flex flex-col">
                            <span>{getEntityDisplayName(entity)}</span>
                            {entity.contact_email && (
                              <span className="text-xs text-muted-foreground">{entity.contact_email}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Investor Role Selection */}
              {category === 'investor' && selectedEntity && (
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
              {category === 'investor' && selectedEntity && (
                <div className="space-y-2">
                  <Label>Term Sheet (Investor Class) *</Label>
                  {termSheetsLoading ? (
                    <div className="flex items-center gap-2 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Loading term sheets...</span>
                    </div>
                  ) : publishedTermSheets.length === 0 ? (
                    <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-300 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>No published term sheets available. Please publish a term sheet first.</span>
                      </div>
                    </div>
                  ) : (
                    <Select value={selectedTermSheetId} onValueChange={setSelectedTermSheetId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term sheet" />
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
                </div>
              )}

              {/* Referring Entity Selection - for roles requiring an introducer/partner/commercial_partner */}
              {category === 'investor' && selectedEntity && requiresReferrer && (
                <div className="space-y-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <Label className="text-amber-300">
                      Referring {referrerEntityType?.replace('_', ' ')} Required
                    </Label>
                  </div>

                  <Select value={selectedReferringEntityId} onValueChange={setSelectedReferringEntityId}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${referrerEntityType?.replace('_', ' ')}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {getReferringEntityList().map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {getEntityDisplayName(entity)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Term sheet required message */}
                  {selectedReferringEntity && !selectedTermSheetId && (
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
                  {selectedReferringEntity && selectedTermSheetId && feePlansLoading && (
                    <div className="flex items-center gap-2 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Loading fee plans...</span>
                    </div>
                  )}

                  {selectedReferringEntity && selectedTermSheetId && !feePlansLoading && feePlansData && !feePlansData.can_dispatch && (
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

                  {selectedReferringEntity && selectedTermSheetId && !feePlansLoading && feePlansData && feePlansData.can_dispatch && (
                    <div className="space-y-2">
                      <Label>Fee Plan</Label>
                      <Select value={selectedFeePlanId} onValueChange={setSelectedFeePlanId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee plan" />
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

              {/* Fee Plan for entities (non-investor) */}
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
