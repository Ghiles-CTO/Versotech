'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Edit, Trash2, UserPlus, ShieldCheck, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { toast } from 'sonner'

interface InvestorMember {
  id: string
  investor_id: string
  full_name: string
  role: string
  role_title?: string
  email?: string
  phone?: string
  residential_street?: string
  residential_city?: string
  residential_state?: string
  residential_postal_code?: string
  residential_country?: string
  nationality?: string
  id_type?: string
  id_number?: string
  id_expiry_date?: string
  ownership_percentage?: number
  is_beneficial_owner: boolean
  kyc_status: string
  is_active: boolean
  effective_from?: string
  effective_to?: string
  created_at: string
}

interface Investor {
  id: string
  type: string
  display_name: string
}

const ROLE_OPTIONS = [
  { value: 'director', label: 'Director' },
  { value: 'shareholder', label: 'Shareholder' },
  { value: 'beneficial_owner', label: 'Beneficial Owner' },
  { value: 'authorized_signatory', label: 'Authorized Signatory' },
  { value: 'officer', label: 'Officer' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
]

const ID_TYPE_OPTIONS = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'other', label: 'Other' },
]

export function InvestorMembersTab() {
  const [members, setMembers] = useState<InvestorMember[]>([])
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<InvestorMember | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    role_title: '',
    email: '',
    phone: '',
    residential_street: '',
    residential_city: '',
    residential_state: '',
    residential_postal_code: '',
    residential_country: '',
    nationality: '',
    id_type: '',
    id_number: '',
    id_expiry_date: '',
    ownership_percentage: '',
    is_beneficial_owner: false,
  })

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      const response = await fetch('/api/investors/me/members')
      if (!response.ok) throw new Error('Failed to load members')

      const data = await response.json()
      setMembers(data.members || [])
      setInvestors(data.investors || [])
    } catch (error) {
      console.error('Error loading members:', error)
      toast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      full_name: '',
      role: '',
      role_title: '',
      email: '',
      phone: '',
      residential_street: '',
      residential_city: '',
      residential_state: '',
      residential_postal_code: '',
      residential_country: '',
      nationality: '',
      id_type: '',
      id_number: '',
      id_expiry_date: '',
      ownership_percentage: '',
      is_beneficial_owner: false,
    })
    setEditingMember(null)
  }

  const handleOpenDialog = (member?: InvestorMember) => {
    if (member) {
      setEditingMember(member)
      setFormData({
        full_name: member.full_name || '',
        role: member.role || '',
        role_title: member.role_title || '',
        email: member.email || '',
        phone: member.phone || '',
        residential_street: member.residential_street || '',
        residential_city: member.residential_city || '',
        residential_state: member.residential_state || '',
        residential_postal_code: member.residential_postal_code || '',
        residential_country: member.residential_country || '',
        nationality: member.nationality || '',
        id_type: member.id_type || '',
        id_number: member.id_number || '',
        id_expiry_date: member.id_expiry_date || '',
        ownership_percentage: member.ownership_percentage?.toString() || '',
        is_beneficial_owner: member.is_beneficial_owner || false,
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.full_name || !formData.role) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)

    try {
      const payload = {
        full_name: formData.full_name,
        role: formData.role,
        role_title: formData.role_title || null,
        email: formData.email || null,
        phone: formData.phone || null,
        residential_street: formData.residential_street || null,
        residential_city: formData.residential_city || null,
        residential_state: formData.residential_state || null,
        residential_postal_code: formData.residential_postal_code || null,
        residential_country: formData.residential_country || null,
        nationality: formData.nationality || null,
        id_type: formData.id_type || null,
        id_number: formData.id_number || null,
        id_expiry_date: formData.id_expiry_date || null,
        ownership_percentage: formData.ownership_percentage ? parseFloat(formData.ownership_percentage) : null,
        is_beneficial_owner: formData.is_beneficial_owner,
      }

      const url = editingMember
        ? `/api/investors/me/members/${editingMember.id}`
        : '/api/investors/me/members'

      const response = await fetch(url, {
        method: editingMember ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save member')
      }

      toast.success(editingMember ? 'Member updated' : 'Member added')
      setDialogOpen(false)
      resetForm()
      await loadMembers()
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.message || 'Failed to save member')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    setDeleting(memberId)

    try {
      const response = await fetch(`/api/investors/me/members/${memberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove member')
      }

      toast.success('Member removed')
      await loadMembers()
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to remove member')
    } finally {
      setDeleting(null)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleInfo = ROLE_OPTIONS.find(r => r.value === role)
    return <Badge variant="outline">{roleInfo?.label || role}</Badge>
  }

  const getKYCStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><ShieldCheck className="w-3 h-3 mr-1" />Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">Not Submitted</Badge>
    }
  }

  // Check if user is entity-type investor
  const isEntityInvestor = investors.some(i => ['entity', 'institution'].includes(i.type))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isEntityInvestor) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Members management is only available for entity-type investors.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Entity Members
              </CardTitle>
              <CardDescription>
                Manage directors, shareholders, and beneficial owners of your entity.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No members added yet. Add directors, shareholders, or beneficial owners.
              </p>
              <Button onClick={() => handleOpenDialog()} variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Your First Member
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ownership %</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.full_name}
                      {member.is_beneficial_owner && (
                        <Badge variant="secondary" className="ml-2 text-xs">UBO</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(member.role)}
                      {member.role_title && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({member.role_title})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{member.email || 'N/A'}</TableCell>
                    <TableCell>
                      {member.ownership_percentage ? `${member.ownership_percentage}%` : 'N/A'}
                    </TableCell>
                    <TableCell>{getKYCStatusBadge(member.kyc_status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                          disabled={deleting === member.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
            <DialogDescription>
              {editingMember
                ? 'Update the details of this entity member'
                : 'Add a director, shareholder, or beneficial owner'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role_title">Title</Label>
                <Input
                  id="role_title"
                  value={formData.role_title}
                  onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                  placeholder="CEO, Managing Director, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="British, American, etc."
                />
              </div>
            </div>

            {/* Ownership */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownership_percentage">Ownership %</Label>
                <Input
                  id="ownership_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.ownership_percentage}
                  onChange={(e) => setFormData({ ...formData, ownership_percentage: e.target.value })}
                  placeholder="25.00"
                />
              </div>

              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_beneficial_owner}
                    onChange={(e) => setFormData({ ...formData, is_beneficial_owner: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Ultimate Beneficial Owner (UBO)</span>
                </label>
              </div>
            </div>

            {/* ID Information */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_type">ID Type</Label>
                <Select
                  value={formData.id_type}
                  onValueChange={(value) => setFormData({ ...formData, id_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ID_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_number">ID Number</Label>
                <Input
                  id="id_number"
                  value={formData.id_number}
                  onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                  placeholder="AB1234567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_expiry_date">ID Expiry Date</Label>
                <Input
                  id="id_expiry_date"
                  type="date"
                  value={formData.id_expiry_date}
                  onChange={(e) => setFormData({ ...formData, id_expiry_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
