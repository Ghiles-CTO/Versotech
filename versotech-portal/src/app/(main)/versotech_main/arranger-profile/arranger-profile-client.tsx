'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Briefcase,
  User,
  Edit,
  Loader2,
} from 'lucide-react'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

type ArrangerInfo = {
  id: string
  legal_name: string
  company_name: string | null
  registration_number: string | null
  tax_id: string | null
  regulator: string | null
  license_number: string | null
  license_type: string | null
  license_expiry_date: string | null
  email: string | null
  phone: string | null
  address: string | null
  kyc_status: string
  kyc_approved_at: string | null
  kyc_expires_at: string | null
  status: string
  is_active: boolean
  created_at: string | null
}

type ArrangerUserInfo = {
  role: string
  is_active: boolean
}

type Profile = {
  full_name: string | null
  email: string
  avatar_url: string | null
}

interface ArrangerProfileClientProps {
  userEmail: string
  profile: Profile | null
  arrangerInfo: ArrangerInfo | null
  arrangerUserInfo: ArrangerUserInfo
  dealCount: number
}

const KYC_STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pending_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
  not_started: 'bg-gray-100 text-gray-800 border-gray-200',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
}

export function ArrangerProfileClient({
  userEmail,
  profile,
  arrangerInfo,
  arrangerUserInfo,
  dealCount,
}: ArrangerProfileClientProps) {
  if (!arrangerInfo) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Arranger Profile Not Found
          </h3>
          <p className="text-muted-foreground">
            Unable to load your arranger profile. Please contact support.
          </p>
        </div>
      </div>
    )
  }

  const isLicenseExpiringSoon = () => {
    if (!arrangerInfo.license_expiry_date) return false
    const expiryDate = new Date(arrangerInfo.license_expiry_date)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiryDate <= thirtyDaysFromNow && expiryDate > new Date()
  }

  const isLicenseExpired = () => {
    if (!arrangerInfo.license_expiry_date) return false
    return new Date(arrangerInfo.license_expiry_date) < new Date()
  }

  const isKycExpiringSoon = () => {
    if (!arrangerInfo.kyc_expires_at) return false
    const expiryDate = new Date(arrangerInfo.kyc_expires_at)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiryDate <= thirtyDaysFromNow && expiryDate > new Date()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {arrangerInfo.company_name || arrangerInfo.legal_name}
            </h1>
            <p className="text-muted-foreground">
              {profile?.full_name || userEmail} - {arrangerUserInfo.role || 'Member'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className={cn('capitalize', STATUS_STYLES[arrangerInfo.status] || STATUS_STYLES.inactive)}
          >
            {arrangerInfo.status}
          </Badge>
          <Badge
            variant="outline"
            className={cn('capitalize', KYC_STATUS_STYLES[arrangerInfo.kyc_status] || KYC_STATUS_STYLES.not_started)}
          >
            KYC: {arrangerInfo.kyc_status?.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Alerts */}
      {isLicenseExpiringSoon() && (
        <Card className="border-amber-500/30 bg-amber-50/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-foreground">License Expiring Soon</p>
                <p className="text-sm text-muted-foreground">
                  Your license expires on {formatDate(arrangerInfo.license_expiry_date!)}. Please renew before expiry.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLicenseExpired() && (
        <Card className="border-red-500/30 bg-red-50/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-foreground">License Expired</p>
                <p className="text-sm text-muted-foreground">
                  Your license expired on {formatDate(arrangerInfo.license_expiry_date!)}. Please contact VERSO to renew.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {arrangerInfo.kyc_status === 'pending' && (
        <Card className="border-blue-500/30 bg-blue-50/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-foreground">KYC Verification Pending</p>
                <p className="text-sm text-muted-foreground">
                  Your KYC documents are being reviewed. This usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Mandates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Deals managed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              KYC Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {arrangerInfo.kyc_status === 'approved' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : arrangerInfo.kyc_status === 'pending' ? (
                <Clock className="h-5 w-5 text-yellow-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className="text-lg font-semibold capitalize">
                {arrangerInfo.kyc_status?.replace('_', ' ')}
              </span>
            </div>
            {arrangerInfo.kyc_approved_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Approved {formatDate(arrangerInfo.kyc_approved_at)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              License
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {arrangerInfo.license_type || 'Not specified'}
            </div>
            {arrangerInfo.license_expiry_date && (
              <p className={cn(
                "text-xs mt-1",
                isLicenseExpired() ? "text-red-600 font-medium" :
                isLicenseExpiringSoon() ? "text-amber-600 font-medium" :
                "text-muted-foreground"
              )}>
                Expires {formatDate(arrangerInfo.license_expiry_date)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Details Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Entity Details</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Entity Details</CardTitle>
              <CardDescription>Legal and registration information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Legal Name</label>
                  <p className="text-foreground mt-1">{arrangerInfo.legal_name}</p>
                </div>
                {arrangerInfo.company_name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                    <p className="text-foreground mt-1">{arrangerInfo.company_name}</p>
                  </div>
                )}
                {arrangerInfo.registration_number && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                    <p className="text-foreground mt-1 font-mono">{arrangerInfo.registration_number}</p>
                  </div>
                )}
                {arrangerInfo.tax_id && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tax ID</label>
                    <p className="text-foreground mt-1 font-mono">{arrangerInfo.tax_id}</p>
                  </div>
                )}
                {arrangerInfo.created_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="text-foreground mt-1">{formatDate(arrangerInfo.created_at)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulatory">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Information</CardTitle>
              <CardDescription>Licensing and compliance details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arrangerInfo.regulator && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Regulator</label>
                    <p className="text-foreground mt-1">{arrangerInfo.regulator}</p>
                  </div>
                )}
                {arrangerInfo.license_number && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">License Number</label>
                    <p className="text-foreground mt-1 font-mono">{arrangerInfo.license_number}</p>
                  </div>
                )}
                {arrangerInfo.license_type && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">License Type</label>
                    <p className="text-foreground mt-1">{arrangerInfo.license_type}</p>
                  </div>
                )}
                {arrangerInfo.license_expiry_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">License Expiry</label>
                    <p className={cn(
                      "mt-1",
                      isLicenseExpired() ? "text-red-600 font-medium" :
                      isLicenseExpiringSoon() ? "text-amber-600 font-medium" :
                      "text-foreground"
                    )}>
                      {formatDate(arrangerInfo.license_expiry_date)}
                    </p>
                  </div>
                )}
              </div>

              {/* KYC Details */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-foreground mb-3">KYC Verification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={cn('capitalize', KYC_STATUS_STYLES[arrangerInfo.kyc_status] || KYC_STATUS_STYLES.not_started)}
                      >
                        {arrangerInfo.kyc_status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {arrangerInfo.kyc_approved_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Approved Date</label>
                      <p className="text-foreground mt-1">{formatDate(arrangerInfo.kyc_approved_at)}</p>
                    </div>
                  )}
                  {arrangerInfo.kyc_expires_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">KYC Expiry</label>
                      <p className={cn(
                        "mt-1",
                        isKycExpiringSoon() ? "text-amber-600 font-medium" : "text-foreground"
                      )}>
                        {formatDate(arrangerInfo.kyc_expires_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How to reach the arranger entity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arrangerInfo.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-foreground">{arrangerInfo.email}</p>
                    </div>
                  </div>
                )}
                {arrangerInfo.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-foreground">{arrangerInfo.phone}</p>
                    </div>
                  </div>
                )}
                {arrangerInfo.address && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="text-foreground whitespace-pre-line">{arrangerInfo.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {!arrangerInfo.email && !arrangerInfo.phone && !arrangerInfo.address && (
                <div className="text-center py-8 text-muted-foreground">
                  No contact information on file.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Update Request */}
      <ProfileUpdateCard arrangerInfo={arrangerInfo} />
    </div>
  )
}

function ProfileUpdateCard({ arrangerInfo }: { arrangerInfo: ArrangerInfo }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    email: arrangerInfo.email || '',
    phone: arrangerInfo.phone || '',
    address: arrangerInfo.address || '',
    notes: '',
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/arrangers/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit request')
      }

      setSubmitted(true)
      setTimeout(() => {
        setIsOpen(false)
        setSubmitted(false)
      }, 2000)
    } catch (error) {
      console.error('Error submitting profile update:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Request Profile Update
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Need to update your contact information or profile details?
          Submit a request and our team will review and process your changes.
        </p>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              Request Update
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Profile Update</DialogTitle>
              <DialogDescription>
                Submit your requested changes. Our team will review and process your request.
              </DialogDescription>
            </DialogHeader>
            {submitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="text-lg font-medium">Request Submitted!</p>
                <p className="text-sm text-muted-foreground">
                  Our team will review your request shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter full address"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional changes or context..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Submit Request
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
