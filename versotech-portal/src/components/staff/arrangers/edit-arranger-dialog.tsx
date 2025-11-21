'use client'

import { useState, useTransition, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { ArrangersDashboardProps } from './arrangers-dashboard'

interface EditArrangerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  arranger: ArrangersDashboardProps['arrangers'][number] | null
}

export function EditArrangerDialog({ open, onOpenChange, arranger }: EditArrangerDialogProps) {
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
  const router = useRouter()

  useEffect(() => {
    if (arranger) {
      setLegalName(arranger.legalName)
      setRegistrationNumber(arranger.registrationNumber || '')
      setTaxId(arranger.taxId || '')
      setRegulator(arranger.regulator || 'none')
      setLicenseNumber(arranger.licenseNumber || '')
      setLicenseType(arranger.licenseType || '')
      setEmail(arranger.email || '')
      setPhone(arranger.phone || '')
      setAddress(arranger.address || '')
      setStatus(arranger.status)
    }
  }, [arranger])

  const handleUpdate = () => {
    if (!arranger) return

    startTransition(async () => {
      if (!legalName.trim()) {
        toast.error('Legal name is required')
        return
      }

      try {
        const response = await fetch(`/api/admin/arrangers/${arranger.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            legal_name: legalName.trim(),
            registration_number: registrationNumber.trim() || null,
            tax_id: taxId.trim() || null,
            regulator: regulator === 'none' ? null : regulator.trim() || null,
            license_number: licenseNumber.trim() || null,
            license_type: licenseType.trim() || null,
            email: email.trim() || null,
            phone: phone.trim() || null,
            address: address.trim() || null,
            status,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          console.error('[EditArrangerDialog] Failed to update arranger', data)
          toast.error(data?.error ?? 'Failed to update arranger entity')
          return
        }

        toast.success('Arranger entity updated successfully')
        onOpenChange(false)
        router.refresh()
      } catch (err) {
        console.error('[EditArrangerDialog] Unexpected error', err)
        toast.error('Failed to update arranger entity')
      }
    })
  }

  if (!arranger) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Arranger Entity</DialogTitle>
          <DialogDescription>Update information for {arranger.legalName}</DialogDescription>
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
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={registrationNumber}
                  onChange={(event) => setRegistrationNumber(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={taxId}
                  onChange={(event) => setTaxId(event.target.value)}
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
                    <SelectItem value="none">None / Not Specified</SelectItem>
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
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="licenseType">License Type</Label>
              <Input
                id="licenseType"
                value={licenseType}
                onChange={(event) => setLicenseType(event.target.value)}
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Registered Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isPending}>
            {isPending ? 'Updating…' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
