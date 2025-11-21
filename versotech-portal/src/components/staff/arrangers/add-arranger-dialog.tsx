'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAddArranger } from '@/components/staff/arrangers/add-arranger-context'
import { toast } from 'sonner'

export function AddArrangerDialog() {
  const [legalName, setLegalName] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [taxId, setTaxId] = useState('')
  const [regulator, setRegulator] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [status, setStatus] = useState('active')
  const [isPending, startTransition] = useTransition()

  const { open, setOpen, refresh } = useAddArranger()

  const resetForm = () => {
    setLegalName('')
    setRegistrationNumber('')
    setTaxId('')
    setRegulator('')
    setLicenseNumber('')
    setLicenseType('')
    setEmail('')
    setPhone('')
    setAddress('')
    setStatus('active')
  }

  const handleCreate = () => {
    startTransition(async () => {
      if (!legalName.trim()) {
        toast.error('Legal name is required')
        return
      }

      try {
        const response = await fetch('/api/admin/arrangers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            legal_name: legalName.trim(),
            registration_number: registrationNumber.trim() || null,
            tax_id: taxId.trim() || null,
            regulator: regulator.trim() || null,
            license_number: licenseNumber.trim() || null,
            license_type: licenseType.trim() || null,
            email: email.trim() || null,
            phone: phone.trim() || null,
            address: address.trim() || null,
            status,
            kyc_status: 'draft',
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          console.error('[AddArrangerDialog] Failed to create arranger', data)
          toast.error(data?.error ?? 'Failed to create arranger entity')
          return
        }

        toast.success('Arranger entity created successfully')
        setOpen(false)
        resetForm()
        refresh()
      } catch (err) {
        console.error('[AddArrangerDialog] Unexpected error', err)
        toast.error('Failed to create arranger entity')
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) {
          resetForm()
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Arranger Entity</DialogTitle>
          <DialogDescription>Register a new regulated entity (advisor/arranger) for deal and vehicle management.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
            <div className="grid gap-2">
              <Label htmlFor="legalName">Legal Name *</Label>
              <Input
                id="legalName"
                value={legalName}
                onChange={(event) => setLegalName(event.target.value)}
                placeholder="e.g. VERSO MANAGEMENT LTD"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="registrationNumber">Company Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={registrationNumber}
                  onChange={(event) => setRegistrationNumber(event.target.value)}
                  placeholder="e.g. 12345678"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={taxId}
                  onChange={(event) => setTaxId(event.target.value)}
                  placeholder="e.g. EIN or UTR"
                />
              </div>
            </div>
          </div>

          {/* Regulatory Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Regulatory Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="regulator">Regulator</Label>
                <Select value={regulator} onValueChange={setRegulator}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select regulator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FCA">FCA (UK)</SelectItem>
                    <SelectItem value="SEC">SEC (US)</SelectItem>
                    <SelectItem value="FINMA">FINMA (Switzerland)</SelectItem>
                    <SelectItem value="MAS">MAS (Singapore)</SelectItem>
                    <SelectItem value="ASIC">ASIC (Australia)</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={licenseNumber}
                  onChange={(event) => setLicenseNumber(event.target.value)}
                  placeholder="e.g. FRN or CRD number"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="licenseType">License Type</Label>
              <Input
                id="licenseType"
                value={licenseType}
                onChange={(event) => setLicenseType(event.target.value)}
                placeholder="e.g. Investment Advisor, Broker-Dealer, Fund Manager"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="compliance@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+44 20 1234 5678"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Registered Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Street address, city, postal code, country"
                rows={2}
              />
            </div>
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? 'Creating…' : 'Create Arranger'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
