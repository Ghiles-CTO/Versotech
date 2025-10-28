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
import { Loader2, Users } from 'lucide-react'

interface AddStakeholderModalProps {
  entityId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const stakeholderRoles = [
  { value: 'lawyer', label: 'Lawyer / Legal Counsel' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'strategic_partner', label: 'Strategic Partner' },
  { value: 'shareholder', label: 'Shareholder' },
  { value: 'other', label: 'Other' },
]

export function AddStakeholderModal({ entityId, open, onClose, onSuccess }: AddStakeholderModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    role: 'lawyer',
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/entities/${entityId}/stakeholders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          effective_to: formData.effective_to || null
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to add stakeholder')
      }

      // Reset form
      setFormData({
        role: 'lawyer',
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: '',
        notes: ''
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-zinc-950 border-white/10">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" />
              Add Stakeholder
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Add lawyers, accountants, auditors, administrators, or strategic partners to this entity
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Role Selection */}
            <div className="grid gap-2">
              <Label htmlFor="role" className="text-sm font-medium text-white">Stakeholder Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                required
              >
                <SelectTrigger id="role" className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10">
                  {stakeholderRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value} className="text-white">
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company/Firm Name */}
            <div className="grid gap-2">
              <Label htmlFor="company_name" className="text-sm font-medium text-white">Company / Firm Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="e.g., Arendt & Medernach, KPMG Luxembourg"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                required
              />
            </div>

            {/* Contact Person */}
            <div className="grid gap-2">
              <Label htmlFor="contact_person" className="text-sm font-medium text-white">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                placeholder="Primary contact name"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
              />
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@firm.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-sm font-medium text-white">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+352 123 456"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                />
              </div>
            </div>

            {/* Effective Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="effective_from" className="text-sm font-medium text-white">Effective From *</Label>
                <Input
                  id="effective_from"
                  type="date"
                  value={formData.effective_from}
                  onChange={(e) => setFormData(prev => ({ ...prev, effective_from: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="effective_to" className="text-sm font-medium text-white">Effective To (Optional)</Label>
                <Input
                  id="effective_to"
                  type="date"
                  value={formData.effective_to}
                  onChange={(e) => setFormData(prev => ({ ...prev, effective_to: e.target.value }))}
                  placeholder="Leave empty if currently active"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-sm font-medium text-white">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any relevant information about this stakeholder..."
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-3">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-white/10 text-white hover:bg-white/10 bg-white/5"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-semibold">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Stakeholder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
