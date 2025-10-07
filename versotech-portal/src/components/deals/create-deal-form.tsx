'use client'

import { useState } from 'react'
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
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface CreateDealFormProps {
  entities: Array<{
    id: string
    name: string
    type: string
    currency: string
  }>
}

export function CreateDealForm({ entities }: CreateDealFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    company_name: '',
    deal_type: 'equity_secondary',
    vehicle_id: '',
    sector: '',
    stage: '',
    location: '',

    // Step 2: Financial Terms
    currency: 'USD',
    offer_unit_price: '',
    target_amount: '',
    minimum_investment: '',
    maximum_investment: '',

    // Step 3: Timeline & Description
    open_at: '',
    close_at: '',
    description: '',
    investment_thesis: ''
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const payload = {
        name: formData.name.trim(),
        company_name: formData.company_name.trim() || null,
        deal_type: formData.deal_type,
        vehicle_id: formData.vehicle_id || null,
        sector: formData.sector.trim() || null,
        stage: formData.stage.trim() || null,
        location: formData.location.trim() || null,
        currency: formData.currency,
        offer_unit_price: formData.offer_unit_price ? parseFloat(formData.offer_unit_price) : null,
        target_amount: formData.target_amount ? parseFloat(formData.target_amount) : null,
        minimum_investment: formData.minimum_investment ? parseFloat(formData.minimum_investment) : null,
        maximum_investment: formData.maximum_investment ? parseFloat(formData.maximum_investment) : null,
        open_at: formData.open_at || null,
        close_at: formData.close_at || null,
        description: formData.description.trim() || null,
        investment_thesis: formData.investment_thesis.trim() || null
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
      router.push(`/versotech/staff/deals/${deal.id}`)
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
        <Link href="/versotech/staff/deals">
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
                  : 'bg-white/10 text-muted-foreground'
              }`}
            >
              {s}
            </div>
            <span className={`text-sm ${s === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {s === 1 ? 'Basic Info' : s === 2 ? 'Financial Terms' : 'Timeline & Details'}
            </span>
            {s < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />}
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-foreground">
            {step === 1 ? 'Basic Information' : step === 2 ? 'Financial Terms' : 'Timeline & Description'}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? 'Enter the core details about this investment opportunity'
              : step === 2
              ? 'Define pricing and investment parameters'
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vehicle_id" className="text-foreground">
                      Entity (Optional)
                    </Label>
                  </div>
                  <Select value={formData.vehicle_id || 'none'} onValueChange={(v) => updateField('vehicle_id', v === 'none' ? '' : v)}>
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
                    <Link href="/versotech/staff/entities" className="text-emerald-300 hover:text-emerald-200 underline">
                      Entities
                    </Link>
                  </p>
                </div>

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
            </div>
          )}

          {/* Step 2: Financial Terms */}
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
                  <Label htmlFor="offer_unit_price" className="text-foreground">Offer Price per Unit</Label>
                  <Input
                    id="offer_unit_price"
                    type="number"
                    step="0.01"
                    placeholder="125.00"
                    value={formData.offer_unit_price}
                    onChange={(e) => updateField('offer_unit_price', e.target.value)}
                  />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimum_investment" className="text-foreground">Minimum Investment</Label>
                  <Input
                    id="minimum_investment"
                    type="number"
                    step="1"
                    placeholder="10000"
                    value={formData.minimum_investment}
                    onChange={(e) => updateField('minimum_investment', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maximum_investment" className="text-foreground">Maximum Investment</Label>
                  <Input
                    id="maximum_investment"
                    type="number"
                    step="1"
                    placeholder="500000"
                    value={formData.maximum_investment}
                    onChange={(e) => updateField('maximum_investment', e.target.value)}
                  />
                </div>
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
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
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
