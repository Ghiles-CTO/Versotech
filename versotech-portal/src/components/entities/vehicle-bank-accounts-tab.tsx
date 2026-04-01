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
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{value?.trim() || '—'}</p>
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
      <Card className="border border-white/10 bg-white/5">
        <CardContent className="flex items-center gap-3 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading vehicle bank accounts…
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Vehicle Bank Accounts</CardTitle>
            <CardDescription>
              Draft changes stay internal. Only the active main account is used in dispatch, escrow, and subscription packs.
            </CardDescription>
          </div>
          {canManage && (
            <Button onClick={() => openDraftEditor(draftAccount || mainAccount || null)}>
              <Plus className="mr-2 h-4 w-4" />
              {draftAccount ? 'Edit Draft' : mainAccount ? 'Prepare Replacement' : 'Create Draft'}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!mainAccount && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              <div className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Dispatch is blocked until one main bank account is published.</p>
                  <p className="mt-1 text-amber-50/90">
                    Create a draft for {vehicleName}, complete the required fields, then publish it as the main account.
                  </p>
                </div>
              </div>
            </div>
          )}

          {mainAccount && (
            <Card className="border border-emerald-400/20 bg-emerald-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">Main Account</CardTitle>
                    <CardDescription>
                      Visible to investors and used in all generated subscription packs.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-100 border border-emerald-400/30">
                      Active
                    </Badge>
                    {canManage && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => openDraftEditor(draftAccount || mainAccount)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit via Draft
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(mainAccount, 'main bank account')}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <AccountField label="Bank" value={mainAccount.bank_name} />
                <AccountField label="Holder" value={mainAccount.holder_name} />
                <AccountField label="Bank Address" value={mainAccount.bank_address} />
                <AccountField label="Law Firm Address" value={mainAccount.law_firm_address} />
                <AccountField label="Description" value={mainAccount.description} />
                <AccountField label="Reference" value={`Agency ${vehicleName}`} />
                <AccountField label="IBAN" value={mainAccount.iban} />
                <AccountField label="BIC" value={mainAccount.bic} />
                <AccountField label="Currency" value={mainAccount.currency} />
              </CardContent>
            </Card>
          )}

          {draftAccount ? (
            <Card className="border border-blue-400/20 bg-blue-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">Draft Replacement</CardTitle>
                    <CardDescription>
                      Investors cannot see this yet. Publish when you want it to replace the current main account.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-100 border border-blue-400/30">
                      Draft
                    </Badge>
                    {canManage && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => openDraftEditor(draftAccount)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Draft
                        </Button>
                        <Button variant="default" size="sm" onClick={handlePublish} disabled={publishing}>
                          {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                          Publish
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(draftAccount, 'draft bank account')}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <AccountField label="Bank" value={draftAccount.bank_name} />
                <AccountField label="Holder" value={draftAccount.holder_name} />
                <AccountField label="Bank Address" value={draftAccount.bank_address} />
                <AccountField label="Law Firm Address" value={draftAccount.law_firm_address} />
                <AccountField label="Description" value={draftAccount.description} />
                <AccountField label="Reference Preview" value={`Agency ${vehicleName}`} />
                <AccountField label="IBAN" value={draftAccount.iban} />
                <AccountField label="BIC" value={draftAccount.bic} />
                <AccountField label="Currency" value={draftAccount.currency} />
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-4 text-sm text-muted-foreground">
              No unpublished replacement exists. Create one when you want to change the live account without exposing draft data to investors.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{draftAccount ? 'Edit Draft Bank Account' : 'Create Draft Bank Account'}</DialogTitle>
            <DialogDescription>
              Save changes as a draft first. Publishing is a separate action and replaces the live main account.
            </DialogDescription>
          </DialogHeader>

          {formState && (
            <div className="grid gap-4 py-2 md:grid-cols-2">
              <div className="md:col-span-2 rounded-lg border border-blue-400/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Reference is generated automatically.</p>
                    <p className="mt-1 text-blue-50/90">{`Agency ${vehicleName}`}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="lawyer_id">Holder Preset</Label>
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

              <div>
                <Label htmlFor="currency">Currency</Label>
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

              <div>
                <Label htmlFor="bank_name">Bank</Label>
                <Input id="bank_name" value={formState.bank_name} onChange={(event) => setFormState((current) => current ? { ...current, bank_name: event.target.value } : current)} />
              </div>

              <div>
                <Label htmlFor="holder_name">Holder</Label>
                <Input id="holder_name" value={formState.holder_name} onChange={(event) => setFormState((current) => current ? { ...current, holder_name: event.target.value } : current)} />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="bank_address">Bank Address</Label>
                <Textarea id="bank_address" value={formState.bank_address} onChange={(event) => setFormState((current) => current ? { ...current, bank_address: event.target.value } : current)} rows={2} />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="law_firm_address">Law Firm Address</Label>
                <Textarea id="law_firm_address" value={formState.law_firm_address} onChange={(event) => setFormState((current) => current ? { ...current, law_firm_address: event.target.value } : current)} rows={2} />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={formState.description} onChange={(event) => setFormState((current) => current ? { ...current, description: event.target.value } : current)} />
              </div>

              <div>
                <Label htmlFor="iban">IBAN</Label>
                <Input id="iban" value={formState.iban} onChange={(event) => setFormState((current) => current ? { ...current, iban: event.target.value } : current)} />
              </div>

              <div>
                <Label htmlFor="bic">BIC</Label>
                <Input id="bic" value={formState.bic} onChange={(event) => setFormState((current) => current ? { ...current, bic: event.target.value } : current)} />
              </div>

              {selectedLawyer?.email && (
                <div className="md:col-span-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
                  Selected lawyer contact: <span className="font-medium text-foreground">{selectedLawyer.email}</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDraft} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
