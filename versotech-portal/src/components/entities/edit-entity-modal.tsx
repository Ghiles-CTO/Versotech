'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'

interface EditEntityModalProps {
  entity: {
    id: string
    name: string
    entity_code: string | null
    platform: string | null
    investment_name: string | null
    former_entity: string | null
    status: string | null
    type: string
    domicile: string | null
    currency: string
    formation_date: string | null
    legal_jurisdiction: string | null
    registration_number: string | null
    reporting_type: string | null
    requires_reporting: boolean | null
    notes: string | null
  }
  open: boolean
  onClose: () => void
  onSuccess: (entity: any) => void
}

export function EditEntityModal({ entity, open, onClose, onSuccess }: EditEntityModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState({
    name: entity.name || '',
    entity_code: entity.entity_code || '',
    platform: entity.platform || '',
    investment_name: entity.investment_name || '',
    former_entity: entity.former_entity || '',
    status: entity.status || 'LIVE',
    type: entity.type || 'fund',
    domicile: entity.domicile || '',
    currency: entity.currency || 'EUR',
    formation_date: entity.formation_date || '',
    legal_jurisdiction: entity.legal_jurisdiction || '',
    registration_number: entity.registration_number || '',
    reporting_type: entity.reporting_type || 'Not Required',
    requires_reporting: entity.requires_reporting ?? false,
    notes: entity.notes || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Show confirmation dialog before saving
    setShowConfirmation(true)
  }

  const handleConfirmedSave = async () => {
    setShowConfirmation(false)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/vehicles/${entity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update entity')
      }

      const data = await response.json()
      onSuccess(data.vehicle)
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Entity Metadata</DialogTitle>
              <DialogDescription>
                Update all information for this entity. All changes will be logged.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Legal Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Verso Fund I SCSP"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="entity_code">Entity Code</Label>
                    <Input
                      id="entity_code"
                      value={formData.entity_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, entity_code: e.target.value }))}
                      placeholder="e.g., VC101"
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Input
                      id="platform"
                      value={formData.platform}
                      onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                      placeholder="e.g., VC1SCSP, VC2SCSP"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="investment_name">Investment Name</Label>
                    <Input
                      id="investment_name"
                      value={formData.investment_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, investment_name: e.target.value }))}
                      placeholder="e.g., CRANS, REVOLUT"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="former_entity">Former Entity Name</Label>
                  <Input
                    id="former_entity"
                    value={formData.former_entity}
                    onChange={(e) => setFormData(prev => ({ ...prev, former_entity: e.target.value }))}
                    placeholder="Previous name if entity was renamed"
                  />
                </div>
              </div>

              {/* Classification */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Classification</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Entity Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fund">Fund</SelectItem>
                        <SelectItem value="spv">SPV</SelectItem>
                        <SelectItem value="securitization">Securitization</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="venture_capital">Venture Capital</SelectItem>
                        <SelectItem value="private_equity">Private Equity</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LIVE">LIVE</SelectItem>
                        <SelectItem value="CLOSED">CLOSED</SelectItem>
                        <SelectItem value="TBD">TBD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Legal Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="domicile">Domicile</Label>
                    <Input
                      id="domicile"
                      value={formData.domicile}
                      onChange={(e) => setFormData(prev => ({ ...prev, domicile: e.target.value }))}
                      placeholder="e.g., Luxembourg"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="legal_jurisdiction">Legal Jurisdiction</Label>
                    <Input
                      id="legal_jurisdiction"
                      value={formData.legal_jurisdiction}
                      onChange={(e) => setFormData(prev => ({ ...prev, legal_jurisdiction: e.target.value }))}
                      placeholder="e.g., Luxembourg, Delaware"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="registration_number">Registration Number</Label>
                    <Input
                      id="registration_number"
                      value={formData.registration_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
                      placeholder="e.g., B123456"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="formation_date">Formation Date</Label>
                    <Input
                      id="formation_date"
                      type="date"
                      value={formData.formation_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, formation_date: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Financial Information</h3>

                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CHF">CHF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reporting Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Reporting Requirements</h3>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reporting_type">Reporting Type</Label>
                    <Select
                      value={formData.reporting_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, reporting_type: value }))}
                    >
                      <SelectTrigger id="reporting_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Required">Not Required</SelectItem>
                        <SelectItem value="Company Only">Company Only</SelectItem>
                        <SelectItem value="Online only">Online Only</SelectItem>
                        <SelectItem value="Company + Online">Company + Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="requires_reporting" className="text-sm font-medium">
                        Requires Reporting
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Enable if this entity has reporting obligations
                      </p>
                    </div>
                    <Switch
                      id="requires_reporting"
                      checked={formData.requires_reporting}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_reporting: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes about this entity..."
                  rows={3}
                />
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-3">
                  {error}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these changes to <strong>{entity.name}</strong>?
              This action will be logged in the entity's change history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSave}>
              Yes, Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
