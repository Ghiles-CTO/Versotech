'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Plus, Edit2, Trash2, Star, Loader2, AlertCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export type EntityType = 'investor' | 'introducer' | 'arranger' | 'lawyer' | 'partner' | 'commercial_partner'

interface BankDetail {
  id: string
  entity_type: string
  entity_id: string
  bank_name: string
  account_holder_name: string
  account_number?: string
  routing_number?: string
  swift_bic?: string
  iban?: string
  currency: string
  is_primary: boolean
  notes?: string
  created_at: string
}

interface BankDetailsTabProps {
  entityType: EntityType
  entityId: string
  entityName?: string
  readOnly?: boolean
}

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'HKD', label: 'HKD - Hong Kong Dollar' },
]

const initialFormData = {
  bank_name: '',
  account_holder_name: '',
  account_number: '',
  routing_number: '',
  swift_bic: '',
  iban: '',
  currency: 'USD',
  is_primary: false,
  notes: '',
}

export function BankDetailsTab({ entityType, entityId, entityName, readOnly = false }: BankDetailsTabProps) {
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(initialFormData)

  const fetchBankDetails = useCallback(async () => {
    if (!entityId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/bank-details?entity_type=${entityType}&entity_id=${entityId}`)
      if (!response.ok) throw new Error('Failed to fetch bank details')

      const data = await response.json()
      setBankDetails(data.bankDetails || [])
    } catch (error) {
      console.error('Error fetching bank details:', error)
      toast.error('Failed to load bank details')
    } finally {
      setLoading(false)
    }
  }, [entityId, entityType])

  useEffect(() => {
    fetchBankDetails()
  }, [fetchBankDetails])

  const handleSubmit = async () => {
    if (!formData.bank_name.trim() || !formData.account_holder_name.trim()) {
      toast.error('Bank name and account holder name are required')
      return
    }

    setSaving(true)
    try {
      const url = editingId
        ? `/api/admin/bank-details/${editingId}`
        : '/api/admin/bank-details'

      const response = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          entity_type: entityType,
          entity_id: entityId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save bank details')
      }

      toast.success(editingId ? 'Bank details updated' : 'Bank account added')
      setDialogOpen(false)
      setEditingId(null)
      setFormData(initialFormData)
      await fetchBankDetails()
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.message || 'Failed to save bank details')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (bankDetail: BankDetail) => {
    setEditingId(bankDetail.id)
    setFormData({
      bank_name: bankDetail.bank_name,
      account_holder_name: bankDetail.account_holder_name,
      account_number: bankDetail.account_number || '',
      routing_number: bankDetail.routing_number || '',
      swift_bic: bankDetail.swift_bic || '',
      iban: bankDetail.iban || '',
      currency: bankDetail.currency,
      is_primary: bankDetail.is_primary,
      notes: bankDetail.notes || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bank account? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/bank-details/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Delete failed')
      }

      toast.success('Bank account deleted')
      await fetchBankDetails()
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to delete bank account')
    }
  }

  const handleSetPrimary = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/bank-details/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_primary: true }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to set as primary')
      }

      toast.success('Primary bank account updated')
      await fetchBankDetails()
    } catch (error: any) {
      console.error('Set primary error:', error)
      toast.error(error.message || 'Failed to update primary account')
    }
  }

  const openAddDialog = () => {
    setEditingId(null)
    setFormData(initialFormData)
    setDialogOpen(true)
  }

  const primaryAccount = bankDetails.find(b => b.is_primary)

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>
                {entityName ? `Bank accounts for ${entityName}` : 'Manage bank account information for payments and distributions'}
              </CardDescription>
            </div>
            {!readOnly && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Bank Account' : 'Add Bank Account'}</DialogTitle>
                    <DialogDescription>
                      {editingId ? 'Update bank account details' : 'Add a new bank account for this entity'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bank_name">Bank Name *</Label>
                        <Input
                          id="bank_name"
                          value={formData.bank_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                          placeholder="e.g., HSBC, Barclays"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map(curr => (
                              <SelectItem key={curr.value} value={curr.value}>
                                {curr.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account_holder_name">Account Holder Name *</Label>
                      <Input
                        id="account_holder_name"
                        value={formData.account_holder_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, account_holder_name: e.target.value }))}
                        placeholder="Name on the account"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="account_number">Account Number</Label>
                        <Input
                          id="account_number"
                          value={formData.account_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                          placeholder="Account number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="routing_number">Routing Number / Sort Code</Label>
                        <Input
                          id="routing_number"
                          value={formData.routing_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, routing_number: e.target.value }))}
                          placeholder="Routing/Sort code"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="swift_bic">SWIFT/BIC Code</Label>
                        <Input
                          id="swift_bic"
                          value={formData.swift_bic}
                          onChange={(e) => setFormData(prev => ({ ...prev, swift_bic: e.target.value }))}
                          placeholder="e.g., HSBCGB2L"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="iban">IBAN</Label>
                        <Input
                          id="iban"
                          value={formData.iban}
                          onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                          placeholder="e.g., GB82WEST..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes about this account"
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_primary"
                        checked={formData.is_primary}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_primary: checked }))}
                      />
                      <Label htmlFor="is_primary" className="text-sm">Set as primary account</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingId ? 'Update' : 'Add Account'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Primary Account Highlight */}
      {primaryAccount && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <CardTitle className="text-base">Primary Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Bank Name</p>
                <p className="text-sm font-medium">{primaryAccount.bank_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account Holder</p>
                <p className="text-sm font-medium">{primaryAccount.account_holder_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Currency</p>
                <p className="text-sm font-medium">{primaryAccount.currency}</p>
              </div>
              {primaryAccount.iban && (
                <div>
                  <p className="text-xs text-muted-foreground">IBAN</p>
                  <p className="text-sm font-medium font-mono">{primaryAccount.iban}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Bank Accounts</CardTitle>
          <CardDescription>
            {bankDetails.length} account{bankDetails.length !== 1 ? 's' : ''} on file
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : bankDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No bank accounts added yet</p>
              {!readOnly && (
                <Button variant="outline" className="mt-4" onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Account
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {bankDetails.map((bank) => (
                <div
                  key={bank.id}
                  className={`flex items-start justify-between gap-4 p-4 rounded-lg border transition-colors ${
                    bank.is_primary ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{bank.bank_name}</p>
                        {bank.is_primary && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                        <span className="text-xs bg-white/10 text-muted-foreground px-2 py-0.5 rounded-full">
                          {bank.currency}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{bank.account_holder_name}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {bank.account_number && (
                          <span>Account: •••{bank.account_number.slice(-4)}</span>
                        )}
                        {bank.swift_bic && (
                          <span>SWIFT: {bank.swift_bic}</span>
                        )}
                        {bank.iban && (
                          <span className="font-mono">IBAN: {bank.iban.slice(0, 4)}...{bank.iban.slice(-4)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!readOnly && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!bank.is_primary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetPrimary(bank.id)}
                          className="h-8 w-8 p-0"
                          title="Set as primary"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(bank)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(bank.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Helper Text */}
      <div className="text-xs text-muted-foreground space-y-1 border-t border-white/10 pt-4">
        <p>• Bank details are used for distributions and commission payments</p>
        <p>• The primary account will be used by default for payments</p>
        <p>• Only authorized staff can view and edit bank details</p>
        <p>• All changes are logged for audit purposes</p>
      </div>
    </div>
  )
}
