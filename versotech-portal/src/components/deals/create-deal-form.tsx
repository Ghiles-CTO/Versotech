'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, ArrowRight, Loader2, Upload } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface CreateDealFormProps {
  entities: Array<{
    id: string
    name: string
    type: string
    currency: string
    logo_url?: string | null
    website_url?: string | null
    arranger_entity_id?: string | null
  }>
  /** Base path for navigation (e.g., '/versotech/staff' or '/versotech_main') */
  basePath?: string
}

export function CreateDealForm({ entities, basePath = '/versotech/staff' }: CreateDealFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    company_name: '',
    deal_type: 'equity_secondary',
    stock_type: 'common',
    vehicle_id: '',
    arranger_entity_id: '',
    sector: '',
    stage: '',
    location: '',

    // Step 2: Pipeline & Currency
    // Note: offer_unit_price, minimum_investment, maximum_investment
    // are now ONLY set in the termsheet (source of truth)
    currency: 'USD',
    target_amount: '',

    // Step 3: Timeline & Description
    open_at: '',
    close_at: '',
    description: '',
    investment_thesis: ''
  })

  // Logo upload state
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>('')
  const [logoSource, setLogoSource] = useState<'entity' | 'manual' | 'none'>('none')

  const selectedEntity = useMemo(
    () => entities.find((entity) => entity.id === formData.vehicle_id),
    [entities, formData.vehicle_id]
  )
  const entityLogo = selectedEntity?.logo_url ?? ''

  useEffect(() => {
    if (!selectedEntity) {
      if (logoSource === 'entity') {
        setLogoSource(companyLogoUrl ? 'manual' : 'none')
      }
      return
    }

    if (entityLogo) {
      if (logoSource !== 'manual') {
        if (companyLogoUrl !== entityLogo) {
          setCompanyLogoUrl(entityLogo)
        }
        if (logoSource !== 'entity') {
          setLogoSource('entity')
        }
        setLogoError(null)
      }
    } else if (logoSource === 'entity') {
      setCompanyLogoUrl('')
      setLogoSource('none')
    }
  }, [selectedEntity, entityLogo, logoSource, companyLogoUrl])

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleVehicleSelect = (value: string) => {
    const normalized = value === 'none' ? '' : value
    updateField('vehicle_id', normalized)

    // Auto-set arranger from vehicle (arranger is always inherited from vehicle)
    if (normalized) {
      const vehicle = entities.find(e => e.id === normalized)
      if (vehicle?.arranger_entity_id) {
        updateField('arranger_entity_id', vehicle.arranger_entity_id)
      } else {
        updateField('arranger_entity_id', '')
      }
    } else {
      updateField('arranger_entity_id', '')
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const payload = {
        name: formData.name.trim(),
        company_name: formData.company_name.trim() || null,
        deal_type: formData.deal_type,
        stock_type: formData.stock_type || null,
        vehicle_id: formData.vehicle_id || null,
        arranger_entity_id: formData.arranger_entity_id || null,
        sector: formData.sector.trim() || null,
        stage: formData.stage.trim() || null,
        location: formData.location.trim() || null,
        currency: formData.currency,
        // Note: offer_unit_price, minimum_investment, maximum_investment are now ONLY in termsheet
        target_amount: formData.target_amount ? parseFloat(formData.target_amount) : null,
        open_at: formData.open_at || null,
        close_at: formData.close_at || null,
        description: formData.description.trim() || null,
        investment_thesis: formData.investment_thesis.trim() || null,
        company_logo_url: companyLogoUrl || undefined
      }
      
      console.log('[CreateDealForm] Submitting payload:', payload)
      
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        console.error('[CreateDealForm] Response not OK:', response.status, response.statusText)
        
        let data: any = {}
        try {
          data = await response.json()
          console.error('[CreateDealForm] Error response:', data)
        } catch (e) {
          console.error('[CreateDealForm] Failed to parse error response:', e)
          throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }
        
        // Show detailed validation errors if available
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
          throw new Error(`Validation failed: ${errorMessages}`)
        }
        
        throw new Error(data.error || data.details || `Failed to create deal (${response.status})`)
      }

      const { deal } = await response.json()
      router.push(`${basePath}/deals/${deal.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Deal</h1>
          <p className="text-muted-foreground mt-1">Set up a new investment opportunity</p>
        </div>
        <Link href={`${basePath}/deals`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Deals
          </Button>
        </Link>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                s === step
                  ? 'bg-emerald-500 text-white'
                  : s < step
                  ? 'bg-emerald-500/50 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s}
            </div>
            <span className={`text-sm ${s === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {s === 1 ? 'Basic Info' : s === 2 ? 'Pipeline' : 'Timeline & Details'}
            </span>
            {s < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />}
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="text-foreground">
            {step === 1 ? 'Basic Information' : step === 2 ? 'Pipeline & Currency' : 'Timeline & Description'}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? 'Enter the core details about this investment opportunity'
              : step === 2
              ? 'Set the target amount and currency. Investment limits (min/max) are defined in the termsheet.'
              : 'Set dates and provide context about the deal'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Deal Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Concluder Secondary Q1 2025"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name" className="text-foreground">Company Name</Label>
                  <Input
                    id="company_name"
                    placeholder="e.g., Concluder Inc."
                    value={formData.company_name}
                    onChange={(e) => updateField('company_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deal_type" className="text-foreground">Deal Type *</Label>
                  <Select value={formData.deal_type} onValueChange={(v) => updateField('deal_type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equity_secondary">Secondary Equity</SelectItem>
                      <SelectItem value="equity_primary">Primary Equity</SelectItem>
                      <SelectItem value="credit_trade_finance">Credit & Trade Finance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_type" className="text-foreground">Stock Type *</Label>
                  <Select value={formData.stock_type} onValueChange={(v) => updateField('stock_type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Common/Ordinary Shares</SelectItem>
                      <SelectItem value="preferred">Preferred Shares</SelectItem>
                      <SelectItem value="convertible">Convertible Notes</SelectItem>
                      <SelectItem value="warrant">Warrants</SelectItem>
                      <SelectItem value="bond">Bonds</SelectItem>
                      <SelectItem value="note">Notes</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vehicle_id" className="text-foreground">
                      Entity (Optional)
                    </Label>
                  </div>
                  <Select value={formData.vehicle_id || 'none'} onValueChange={handleVehicleSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity or skip" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No entity - Direct deal</SelectItem>
                      {entities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name} ({entity.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose an entity for pooled investments, or "No entity" for direct ownership deals. Manage entities from{' '}
                    <Link href={`${basePath}/entities`} className="text-emerald-300 hover:text-emerald-200 underline">
                      Entities
                    </Link>
                  </p>
                </div>

                {/* Arranger is inherited from vehicle - no manual selection needed */}

                <div className="space-y-2">
                  <Label htmlFor="sector" className="text-foreground">Sector</Label>
                  <Input
                    id="sector"
                    placeholder="e.g., SaaS, FinTech"
                    value={formData.sector}
                    onChange={(e) => updateField('sector', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage" className="text-foreground">Stage</Label>
                  <Input
                    id="stage"
                    placeholder="e.g., Series B, Growth"
                    value={formData.stage}
                    onChange={(e) => updateField('stage', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location" className="text-foreground">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, USA"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                  />
                </div>
              </div>

              {/* Company Logo Upload */}
              <div className="space-y-2">
                <Label className="text-foreground">Company Logo</Label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    {companyLogoUrl ? (
                      <Image
                        src={companyLogoUrl}
                        alt={`${(selectedEntity?.name ?? formData.name) || 'Deal'} logo`}
                        width={56}
                        height={56}
                        className="rounded-lg object-contain bg-white border border-gray-200 p-2"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground">
                        56×56
                      </div>
                    )}
                    <div className="space-y-2">
                      <label
                        className="inline-flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer text-sm"
                        onClick={() => {
                          if (logoSource === 'entity') {
                            setLogoSource('manual')
                            setCompanyLogoUrl('')
                          }
                        }}
                      >
                        <Upload className="h-4 w-4" />
                        <span>{logoSource === 'entity' ? 'Replace Logo' : 'Upload Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            setLogoError(null)
                            setLogoUploading(true)
                            try {
                              const formData = new FormData()
                              formData.append('file', file)
                              formData.append('deal_id', 'new')
                              const res = await fetch('/api/deals/logo-upload', {
                                method: 'POST',
                                body: formData
                              })
                              const payload = await res.json().catch(() => ({}))
                              if (!res.ok || !payload?.url) {
                                throw new Error(payload?.error || 'Failed to upload logo')
                              }
                              setCompanyLogoUrl(payload.url)
                              setLogoSource('manual')
                            } catch (err) {
                              setLogoError(err instanceof Error ? err.message : 'Failed to upload logo')
                            } finally {
                              setLogoUploading(false)
                              e.target.value = ''
                            }
                          }}
                        />
                      </label>
                      {selectedEntity?.logo_url && logoSource === 'manual' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="px-0 text-xs text-emerald-300 hover:text-emerald-200"
                          onClick={() => {
                            setCompanyLogoUrl(selectedEntity.logo_url ?? '')
                            setLogoSource('entity')
                            setLogoError(null)
                          }}
                        >
                          Use {selectedEntity.name} logo
                        </Button>
                      )}
                      {logoUploading && (
                        <span className="text-xs text-muted-foreground">Uploading…</span>
                      )}
                    </div>
                  </div>
                  {logoError && (
                    <p className="text-xs text-rose-500">{logoError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {logoSource === 'entity' && selectedEntity?.name
                      ? `Prefilled from ${selectedEntity.name}. Replace if you need a different logo.`
                      : 'Optional branding shown to investors.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pipeline & Currency */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-foreground">Currency *</Label>
                  <Select value={formData.currency} onValueChange={(v) => updateField('currency', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_amount" className="text-foreground">Target Amount</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    step="1"
                    placeholder="5000000"
                    value={formData.target_amount}
                    onChange={(e) => updateField('target_amount', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Total amount you aim to raise for this deal
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-700 dark:text-amber-200">
                  <strong>Note:</strong> Investment terms (price per share, minimum/maximum investment) are set in the Term Sheet
                  after creating this deal. The termsheet is the source of truth for investor-facing financial details.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Timeline & Description */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="open_at" className="text-foreground">Open Date</Label>
                  <Input
                    id="open_at"
                    type="datetime-local"
                    value={formData.open_at}
                    onChange={(e) => updateField('open_at', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="close_at" className="text-foreground">Close Date</Label>
                  <Input
                    id="close_at"
                    type="datetime-local"
                    value={formData.close_at}
                    onChange={(e) => updateField('close_at', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a brief overview of this investment opportunity..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment_thesis" className="text-foreground">Investment Thesis</Label>
                <Textarea
                  id="investment_thesis"
                  placeholder="Explain why this is an attractive investment..."
                  rows={6}
                  value={formData.investment_thesis}
                  onChange={(e) => updateField('investment_thesis', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-400/30 text-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(s => Math.min(3, s + 1))}
                disabled={!formData.name}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading || !formData.name}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Deal'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
