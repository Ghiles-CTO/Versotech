'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Edit2,
  Loader2,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

type VehicleBankLawyerOption = {
  id: string
  name: string
  firm_name: string | null
  email: string | null
  street_address: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string | null
}

type VehicleBankAccount = {
  id: string
  status: 'draft' | 'active' | 'archived'
  lawyer_id: string | null
  bank_name: string | null
  bank_address: string | null
  holder_name: string | null
  law_firm_address: string | null
  description: string | null
  iban: string | null
  bic: string | null
  currency: string | null
  published_at: string | null
  created_at: string
}

type VehicleBankAccountsResponse = {
  bankAccounts: VehicleBankAccount[]
  mainAccount: VehicleBankAccount | null
  draftAccount: VehicleBankAccount | null
  lawyers: VehicleBankLawyerOption[]
  canManage: boolean
  vehicle: {
    id: string
    name: string
    lawyer_id: string | null
    currency: string | null
    default_description: string
  }
}

type VehicleBankAccountFormState = {
  lawyer_id: string
  bank_name: string
  bank_address: string
  holder_name: string
  law_firm_address: string
  description: string
  iban: string
  bic: string
  currency: string
}

const CURRENCIES = [
  { value: 'USD', label: 'USD (United States, Dollars)' },
  { value: 'EUR', label: 'EUR (Eurozone, Euro)' },
  { value: 'GBP', label: 'GBP (United Kingdom, Pounds)' },
  { value: 'CHF', label: 'CHF (Switzerland, Francs)' },
  { value: 'JPY', label: 'JPY (Japan, Yen)' },
  { value: 'CAD', label: 'CAD (Canada, Dollars)' },
  { value: 'AUD', label: 'AUD (Australia, Dollars)' },
]

function buildInitialFormState(response: VehicleBankAccountsResponse, source?: VehicleBankAccount | null): VehicleBankAccountFormState {
  return {
    lawyer_id: source?.lawyer_id || response.draftAccount?.lawyer_id || response.vehicle.lawyer_id || '',
    bank_name: source?.bank_name || '',
    bank_address: source?.bank_address || '',
    holder_name: source?.holder_name || '',
    law_firm_address: source?.law_firm_address || '',
    description: source?.description || response.vehicle.default_description,
    iban: source?.iban || '',
    bic: source?.bic || '',
    currency: source?.currency || response.vehicle.currency || 'USD',
  }
}

function formatLawyerAddress(lawyer: VehicleBankLawyerOption | undefined) {
  if (!lawyer) return ''

  return [
    lawyer.street_address,
    lawyer.city,
    lawyer.state_province,
    lawyer.postal_code,
    lawyer.country,
  ].filter(Boolean).join(', ')
}

function useVehicleBankAccounts(vehicleId: string) {
  const [data, setData] = useState<VehicleBankAccountsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/bank-accounts`)
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to load vehicle bank accounts')
      }

      const payload = await response.json()
      setData(payload)
    } catch (error) {
      console.error('[vehicle-bank-accounts] fetch error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load vehicle bank accounts')
    } finally {
      setLoading(false)
    }
  }, [vehicleId])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    refresh: fetchData,
  }
}

function AccountField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{label}</p>
      <p className="mt-0.5 text-sm text-foreground whitespace-pre-wrap break-words">{value?.trim() || '—'}</p>
    </div>
  )
}

export function VehicleBankAccountSummaryCard({
  vehicleId,
}: {
  vehicleId: string
}) {
  const { data, loading } = useVehicleBankAccounts(vehicleId)

  if (loading) {
    return (
      <Card className="border border-white/10 bg-white/5">
        <CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading bank account summary…
        </CardContent>
      </Card>
    )
  }

  const mainAccount = data?.mainAccount

  return (
    <Card className="border border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-lg">Main Bank Account</CardTitle>
        <CardDescription>
          This is the only vehicle bank account used for dispatch validation and investor-facing documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!mainAccount ? (
          <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            No main bank account is published for this vehicle yet. Dispatch will stay blocked until one is published.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-100 border border-emerald-400/30">
                Active
              </Badge>
              <span className="text-sm text-muted-foreground">
                Reference preview: <span className="font-medium text-foreground">{`Agency ${data?.vehicle.name || 'Vehicle'}`}</span>
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AccountField label="Bank" value={mainAccount.bank_name} />
              <AccountField label="Holder" value={mainAccount.holder_name} />
              <AccountField label="IBAN" value={mainAccount.iban} />
              <AccountField label="BIC" value={mainAccount.bic} />
              <AccountField label="Currency" value={mainAccount.currency} />
              <AccountField label="Description" value={mainAccount.description} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function VehicleBankAccountsTab({
  vehicleId,
  vehicleName,
}: {
  vehicleId: string
  vehicleName: string
}) {
  const { data, loading, refresh } = useVehicleBankAccounts(vehicleId)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formState, setFormState] = useState<VehicleBankAccountFormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const mainAccount = data?.mainAccount ?? null
  const draftAccount = data?.draftAccount ?? null
  const lawyers = data?.lawyers ?? []
  const canManage = Boolean(data?.canManage)

  const selectedLawyer = useMemo(
    () => lawyers.find((lawyer) => lawyer.id === formState?.lawyer_id),
    [formState?.lawyer_id, lawyers]
  )

  const openDraftEditor = useCallback((source?: VehicleBankAccount | null) => {
    if (!data) return
    setFormState(buildInitialFormState(data, source))
    setDialogOpen(true)
  }, [data])

  const handleLawyerChange = (lawyerId: string) => {
    const lawyer = lawyers.find((option) => option.id === lawyerId)
    setFormState((current) => {
      if (!current) return current
      return {
        ...current,
        lawyer_id: lawyerId,
        holder_name: lawyer?.name || current.holder_name,
        law_firm_address: formatLawyerAddress(lawyer) || current.law_firm_address,
      }
    })
  }

  const handleSaveDraft = async () => {
    if (!data || !formState) return

    setSaving(true)
    try {
      const payload = {
        lawyer_id: formState.lawyer_id || null,
        bank_name: formState.bank_name,
        bank_address: formState.bank_address,
        holder_name: formState.holder_name,
        law_firm_address: formState.law_firm_address,
        description: formState.description,
        iban: formState.iban,
        bic: formState.bic,
        currency: formState.currency,
      }

      const isEditingExistingDraft = Boolean(draftAccount)
      const isReplacingMainWithDraft = Boolean(mainAccount && !draftAccount)
      const url = isEditingExistingDraft
        ? `/api/vehicles/${vehicleId}/bank-accounts/${draftAccount?.id}`
        : `/api/vehicles/${vehicleId}/bank-accounts`

      const response = await fetch(url, {
        method: isEditingExistingDraft ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to save draft bank account')
      }

      toast.success(
        isReplacingMainWithDraft
          ? 'Replacement draft saved. Investors still see the current main account until you publish the draft.'
          : 'Bank account draft saved.'
      )
      setDialogOpen(false)
      await refresh()
    } catch (error) {
      console.error('[vehicle-bank-accounts] save draft error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save draft bank account')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!draftAccount) return
    setPublishing(true)
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/bank-accounts/${draftAccount.id}/publish`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to publish bank account')
      }

      toast.success('Draft published as the new main bank account.')
      await refresh()
    } catch (error) {
      console.error('[vehicle-bank-accounts] publish error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to publish bank account')
    } finally {
      setPublishing(false)
    }
  }

  const handleDelete = async (account: VehicleBankAccount, label: string) => {
    if (!confirm(`Delete this ${label}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/bank-accounts/${account.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to delete bank account')
      }

      toast.success(`${label} deleted.`)
      await refresh()
    } catch (error) {
      console.error('[vehicle-bank-accounts] delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete bank account')
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border/40 bg-card p-8">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading vehicle bank accounts...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Bank Accounts</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Only the active main account is used in dispatch, escrow, and subscription packs.
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => openDraftEditor(draftAccount || mainAccount || null)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {draftAccount ? 'Edit Draft' : mainAccount ? 'Prepare Replacement' : 'Create Draft'}
          </Button>
        )}
      </div>

      {/* Dispatch blocked warning */}
      {!mainAccount && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="text-sm">
            <p className="font-medium text-amber-600 dark:text-amber-400">Dispatch is blocked</p>
            <p className="mt-0.5 text-muted-foreground">
              Create and publish a bank account for {vehicleName} before dispatching subscriptions.
            </p>
          </div>
        </div>
      )}

      {/* Main Account Card */}
      {mainAccount && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03]">
          <div className="flex items-center justify-between border-b border-emerald-500/10 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 items-center rounded-full bg-emerald-500/10 px-2.5">
                <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
              <span className="text-sm font-medium text-foreground">Main Account</span>
            </div>
            {canManage && (
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openDraftEditor(draftAccount || mainAccount)}>
                  <Edit2 className="mr-1 h-3 w-3" />
                  Edit via Draft
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(mainAccount, 'main bank account')}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <AccountField label="Bank" value={mainAccount.bank_name} />
            <AccountField label="Holder" value={mainAccount.holder_name} />
            <AccountField label="Currency" value={mainAccount.currency} />
            <AccountField label="IBAN" value={mainAccount.iban} />
            <AccountField label="BIC" value={mainAccount.bic} />
            <AccountField label="Reference" value={`Agency ${vehicleName}`} />
            <div className="sm:col-span-2 lg:col-span-3">
              <AccountField label="Bank Address" value={mainAccount.bank_address} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <AccountField label="Law Firm Address" value={mainAccount.law_firm_address} />
            </div>
            {mainAccount.description && (
              <div className="sm:col-span-2 lg:col-span-3">
                <AccountField label="Description" value={mainAccount.description} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Draft Card */}
      {draftAccount ? (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.03]">
          <div className="flex items-center justify-between border-b border-blue-500/10 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 items-center rounded-full bg-blue-500/10 px-2.5">
                <Edit2 className="mr-1 h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Draft</span>
              </div>
              <span className="text-sm font-medium text-foreground">Replacement</span>
            </div>
            {canManage && (
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openDraftEditor(draftAccount)}>
                  <Edit2 className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button size="sm" className="h-7 px-2.5 text-xs" onClick={handlePublish} disabled={publishing}>
                  {publishing ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <CheckCircle2 className="mr-1 h-3 w-3" />}
                  Publish
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(draftAccount, 'draft bank account')}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <AccountField label="Bank" value={draftAccount.bank_name} />
            <AccountField label="Holder" value={draftAccount.holder_name} />
            <AccountField label="Currency" value={draftAccount.currency} />
            <AccountField label="IBAN" value={draftAccount.iban} />
            <AccountField label="BIC" value={draftAccount.bic} />
            <AccountField label="Reference Preview" value={`Agency ${vehicleName}`} />
            <div className="sm:col-span-2 lg:col-span-3">
              <AccountField label="Bank Address" value={draftAccount.bank_address} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <AccountField label="Law Firm Address" value={draftAccount.law_firm_address} />
            </div>
            {draftAccount.description && (
              <div className="sm:col-span-2 lg:col-span-3">
                <AccountField label="Description" value={draftAccount.description} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 px-5 py-6 text-center text-sm text-muted-foreground">
          No unpublished replacement exists. Create one when you need to change the live account.
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{draftAccount ? 'Edit Draft Bank Account' : 'Create Draft Bank Account'}</DialogTitle>
            <DialogDescription>
              Changes are saved as a draft. Publishing replaces the live main account.
            </DialogDescription>
          </DialogHeader>

          {formState && (
            <div className="space-y-6 py-2">
              {/* Auto-reference notice */}
              <div className="flex items-center gap-2.5 rounded-md bg-muted/50 px-3.5 py-2.5 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Reference: <span className="font-medium text-foreground">{`Agency ${vehicleName}`}</span>
                </span>
              </div>

              {/* Section: Account Holder */}
              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Holder</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="lawyer_id" className="text-xs">Holder Preset</Label>
                    <Select value={formState.lawyer_id || 'manual'} onValueChange={(value) => handleLawyerChange(value === 'manual' ? '' : value)}>
                      <SelectTrigger id="lawyer_id">
                        <SelectValue placeholder="Select a law firm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual entry</SelectItem>
                        {lawyers.map((lawyer) => (
                          <SelectItem key={lawyer.id} value={lawyer.id}>
                            {lawyer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="holder_name" className="text-xs">Holder Name</Label>
                    <Input id="holder_name" value={formState.holder_name} onChange={(event) => setFormState((current) => current ? { ...current, holder_name: event.target.value } : current)} placeholder="Legal entity name" />
                  </div>
                </div>
                {selectedLawyer?.email && (
                  <p className="text-xs text-muted-foreground">
                    Contact: <span className="font-medium text-foreground">{selectedLawyer.email}</span>
                  </p>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="law_firm_address" className="text-xs">Law Firm Address</Label>
                  <Textarea id="law_firm_address" value={formState.law_firm_address} onChange={(event) => setFormState((current) => current ? { ...current, law_firm_address: event.target.value } : current)} rows={2} placeholder="Full law firm address" className="resize-none" />
                </div>
              </fieldset>

              {/* Section: Bank Details */}
              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bank Details</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="bank_name" className="text-xs">Bank Name</Label>
                    <Input id="bank_name" value={formState.bank_name} onChange={(event) => setFormState((current) => current ? { ...current, bank_name: event.target.value } : current)} placeholder="e.g. HSBC, BNP Paribas" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="currency" className="text-xs">Currency</Label>
                    <Select value={formState.currency || 'USD'} onValueChange={(value) => setFormState((current) => current ? { ...current, currency: value } : current)}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bank_address" className="text-xs">Bank Address</Label>
                  <Textarea id="bank_address" value={formState.bank_address} onChange={(event) => setFormState((current) => current ? { ...current, bank_address: event.target.value } : current)} rows={2} placeholder="Full bank address" className="resize-none" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="iban" className="text-xs">IBAN</Label>
                    <Input id="iban" value={formState.iban} onChange={(event) => setFormState((current) => current ? { ...current, iban: event.target.value } : current)} placeholder="e.g. LU12 3456 7890 1234 5678" className="font-mono text-sm tracking-wide" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bic" className="text-xs">BIC / SWIFT</Label>
                    <Input id="bic" value={formState.bic} onChange={(event) => setFormState((current) => current ? { ...current, bic: event.target.value } : current)} placeholder="e.g. BCEELULL" className="font-mono text-sm tracking-wide" />
                  </div>
                </div>
              </fieldset>

              {/* Section: Additional */}
              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Additional</legend>
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs">Description</Label>
                  <Input id="description" value={formState.description} onChange={(event) => setFormState((current) => current ? { ...current, description: event.target.value } : current)} placeholder="Purpose or notes for this account" />
                </div>
              </fieldset>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDraft} disabled={saving}>
              {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
              Save Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
