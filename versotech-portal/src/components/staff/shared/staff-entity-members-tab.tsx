'use client'

/**
 * Staff Entity Members Tab
 *
 * A staff-side component for managing entity members (directors, UBOs, signatories)
 * across all persona types: investor, arranger, partner, introducer, lawyer, commercial_partner
 *
 * Uses MemberKYCEditDialog for comprehensive KYC field editing.
 * Points to staff-specific API endpoints with elevated permissions.
 */

import { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus, Edit, Trash2, ShieldCheck, Clock, AlertCircle, FileWarning, CheckCircle, XCircle, Percent } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { MemberKYCEditDialog } from '@/components/shared/member-kyc-edit-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Entity types that support members
export type StaffEntityType = 'investor' | 'partner' | 'introducer' | 'lawyer' | 'arranger' | 'commercial_partner'

// Maps entity type to API path segment
const ENTITY_TYPE_TO_API_PATH: Record<StaffEntityType, string> = {
  investor: 'investors',
  partner: 'partners',
  introducer: 'introducers',
  lawyer: 'lawyers',
  arranger: 'arrangers',
  commercial_partner: 'commercial-partners',
}

// Member data structure
interface EntityMember {
  id: string
  full_name?: string
  first_name?: string
  middle_name?: string
  middle_initial?: string
  last_name?: string
  name_suffix?: string
  role: string
  role_title?: string
  email?: string
  phone_mobile?: string
  phone_office?: string
  date_of_birth?: string
  country_of_birth?: string
  nationality?: string
  residential_street?: string
  residential_line_2?: string
  residential_city?: string
  residential_state?: string
  residential_postal_code?: string
  residential_country?: string
  is_us_citizen?: boolean
  is_us_taxpayer?: boolean
  us_taxpayer_id?: string
  country_of_tax_residency?: string
  tax_id_number?: string
  id_type?: string
  id_number?: string
  id_issue_date?: string
  id_expiry_date?: string
  id_issuing_country?: string
  proof_of_address_date?: string
  proof_of_address_expiry?: string
  ownership_percentage?: number
  is_beneficial_owner?: boolean
  is_signatory?: boolean
  can_sign?: boolean
  kyc_status?: string
  kyc_approved_at?: string
  kyc_approved_by?: string
  kyc_expiry_date?: string
  kyc_notes?: string
  is_active?: boolean
  created_at?: string
  effective_from?: string
  effective_to?: string
}

interface StaffEntityMembersTabProps {
  entityType: StaffEntityType
  entityId: string
  entityName?: string
  /** Optional custom title */
  title?: string
  /** Optional custom description */
  description?: string
  /** Callback when member data changes */
  onDataChange?: () => void
}

const ROLE_LABELS: Record<string, string> = {
  director: 'Director',
  shareholder: 'Shareholder',
  beneficial_owner: 'Beneficial Owner',
  authorized_signatory: 'Authorized Signatory',
  officer: 'Officer',
  partner: 'Partner',
  ubo: 'UBO',
  signatory: 'Signatory',
  authorized_representative: 'Authorized Representative',
  beneficiary: 'Beneficiary',
  trustee: 'Trustee',
  managing_member: 'Managing Member',
  general_partner: 'General Partner',
  limited_partner: 'Limited Partner',
  other: 'Other',
}

export function StaffEntityMembersTab({
  entityType,
  entityId,
  entityName,
  title = 'Entity Members',
  description = 'Manage directors, shareholders, beneficial owners, and signatories',
  onDataChange,
}: StaffEntityMembersTabProps) {
  const [members, setMembers] = useState<EntityMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<EntityMember | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingMember, setDeletingMember] = useState<EntityMember | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [updatingSignatoryMemberId, setUpdatingSignatoryMemberId] = useState<string | null>(null)

  // Build API endpoint for staff
  const apiPath = ENTITY_TYPE_TO_API_PATH[entityType]
  const apiEndpoint = `/api/staff/${apiPath}/${entityId}/members`

  // Load members
  const loadMembers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(apiEndpoint)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to load members')
      }

      const data = await response.json()
      setMembers(data.members || [])
    } catch (err) {
      console.error('Error loading members:', err)
      setError(err instanceof Error ? err.message : 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const handleAddMember = () => {
    setEditingMember(null)
    setEditDialogOpen(true)
  }

  const handleEditMember = (member: EntityMember) => {
    setEditingMember(member)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (member: EntityMember) => {
    setDeletingMember(member)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingMember) return

    setIsDeleting(true)
    try {
      const response = await fetch(`${apiEndpoint}/${deletingMember.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete member')
      }

      toast.success('Member removed successfully')
      setDeleteDialogOpen(false)
      setDeletingMember(null)
      await loadMembers()
      onDataChange?.()
    } catch (err) {
      console.error('Error deleting member:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to delete member')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDialogSuccess = () => {
    loadMembers()
    onDataChange?.()
  }

  const getDisplayName = (member: EntityMember) => {
    if (member.full_name) return member.full_name
    const parts = [member.first_name, member.middle_name, member.last_name, member.name_suffix].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : 'Unknown'
  }

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      director: 'bg-blue-500',
      shareholder: 'bg-purple-500',
      beneficial_owner: 'bg-amber-500',
      ubo: 'bg-amber-500',
      authorized_signatory: 'bg-green-500',
      signatory: 'bg-green-500',
      trustee: 'bg-indigo-500',
      general_partner: 'bg-cyan-500',
      limited_partner: 'bg-teal-500',
    }
    const color = roleColors[role] || 'bg-gray-500'
    return <Badge className={color}>{ROLE_LABELS[role] || role}</Badge>
  }

  const getKYCStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-500">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'submitted':
        return (
          <Badge className="bg-blue-500">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Submitted
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-500">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      case 'expired':
        return (
          <Badge className="bg-orange-500">
            <FileWarning className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Submitted
          </Badge>
        )
    }
  }

  const isSignatory = (member: EntityMember) =>
    Boolean(
      member.is_signatory ||
      member.can_sign ||
      member.role === 'signatory' ||
      member.role === 'authorized_signatory'
    )

  const handleSetSignatory = async (member: EntityMember, nextValue: boolean) => {
    setUpdatingSignatoryMemberId(member.id)

    try {
      const payload: Record<string, unknown> = {
        entity_id: entityId,
        member_id: member.id,
        is_signatory: nextValue,
      }
      if (entityType === 'investor') {
        payload.can_sign = nextValue
      }

      const response = await fetch(`${apiEndpoint}/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update signatory')
      }

      toast.success('Signatory updated')
      await loadMembers()
      onDataChange?.()
    } catch (err) {
      console.error('Error updating signatory:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update signatory')
    } finally {
      setUpdatingSignatoryMemberId(null)
    }
  }

  // Check if ID is expiring soon (within 30 days)
  const isIdExpiringSoon = (member: EntityMember) => {
    if (!member.id_expiry_date) return false
    const expiryDate = new Date(member.id_expiry_date)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  // Check if ID is expired
  const isIdExpired = (member: EntityMember) => {
    if (!member.id_expiry_date) return false
    const expiryDate = new Date(member.id_expiry_date)
    return expiryDate < new Date()
  }

  // Convert member data to form format for MemberKYCEditDialog
  const getMemberInitialData = (member: EntityMember | null) => {
    if (!member) return undefined

    return {
      role: member.role as 'director' | 'ubo' | 'signatory' | 'authorized_representative' | 'beneficiary',
      is_signatory: Boolean(
        member.is_signatory ||
        member.can_sign ||
        member.role === 'signatory' ||
        member.role === 'authorized_signatory'
      ),
      first_name: member.first_name || '',
      middle_name: member.middle_name || '',
      last_name: member.last_name || '',
      name_suffix: member.name_suffix || '',
      date_of_birth: member.date_of_birth || '',
      country_of_birth: member.country_of_birth || '',
      nationality: member.nationality || '',
      email: member.email || '',
      phone_mobile: member.phone_mobile || '',
      phone_office: member.phone_office || '',
      residential_street: member.residential_street || '',
      residential_line_2: member.residential_line_2 || '',
      residential_city: member.residential_city || '',
      residential_state: member.residential_state || '',
      residential_postal_code: member.residential_postal_code || '',
      residential_country: member.residential_country || '',
      is_us_citizen: member.is_us_citizen || false,
      is_us_taxpayer: member.is_us_taxpayer || false,
      us_taxpayer_id: member.us_taxpayer_id || '',
      country_of_tax_residency: member.country_of_tax_residency || '',
      tax_id_number: member.tax_id_number || '',
      id_type: member.id_type || '',
      id_number: member.id_number || '',
      id_issue_date: member.id_issue_date || '',
      id_expiry_date: member.id_expiry_date || '',
      id_issuing_country: member.id_issuing_country || '',
      ownership_percentage: member.ownership_percentage,
    }
  }

  // Summary stats
  const totalUBOs = members.filter(m => m.is_beneficial_owner || m.role === 'ubo' || m.role === 'beneficial_owner').length
  const totalSignatories = members.filter(m => m.is_signatory || m.can_sign || m.role === 'signatory' || m.role === 'authorized_signatory').length
  const totalOwnership = members.reduce((sum, m) => sum + (m.ownership_percentage || 0), 0)
  const pendingKYC = members.filter(m => !m.kyc_status || m.kyc_status === 'pending' || m.kyc_status === 'submitted').length
  const expiredDocs = members.filter(m => isIdExpired(m)).length

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse">Loading members...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <p className="text-destructive">{error}</p>
          <Button onClick={loadMembers} variant="outline" className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {members.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="py-4">
              <div className="text-sm text-muted-foreground">Total Members</div>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-sm text-muted-foreground">UBOs</div>
              <div className="text-2xl font-bold">{totalUBOs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-sm text-muted-foreground">Signatories</div>
              <div className="text-2xl font-bold">{totalSignatories}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-sm text-muted-foreground">Total Ownership</div>
              <div className="text-2xl font-bold flex items-center">
                {totalOwnership.toFixed(1)}%
                {totalOwnership > 100 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="w-4 h-4 ml-2 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>Ownership exceeds 100%</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-sm text-muted-foreground">Pending KYC</div>
              <div className={`text-2xl font-bold ${pendingKYC > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                {pendingKYC}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expired/Expiring Documents Warning */}
      {expiredDocs > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-700">
              <FileWarning className="w-5 h-5" />
              <span className="font-medium">
                {expiredDocs} member{expiredDocs > 1 ? 's have' : ' has'} expired ID documents
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button onClick={handleAddMember}>
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
              <Button onClick={handleAddMember} variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Add First Member
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Ownership</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Signatory</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>ID Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{getDisplayName(member)}</span>
                        <div className="flex gap-1 mt-1">
                          {(member.is_beneficial_owner || member.role === 'ubo' || member.role === 'beneficial_owner') && (
                            <Badge variant="secondary" className="text-xs">UBO</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getRoleBadge(member.role)}
                        {member.role_title && (
                          <span className="text-xs text-muted-foreground">{member.role_title}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.ownership_percentage != null ? (
                        <div className="flex items-center gap-1">
                          <Percent className="w-3 h-3 text-muted-foreground" />
                          <span>{member.ownership_percentage}%</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.email || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isSignatory(member)}
                          onCheckedChange={(checked) => handleSetSignatory(member, checked)}
                          disabled={updatingSignatoryMemberId === member.id}
                        />
                        <span className={`text-xs ${isSignatory(member) ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}`}>
                          {isSignatory(member) ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getKYCStatusBadge(member.kyc_status)}</TableCell>
                    <TableCell>
                      {member.id_expiry_date ? (
                        <div className="flex items-center gap-1">
                          {isIdExpired(member) ? (
                            <Badge variant="destructive" className="text-xs">
                              <XCircle className="w-3 h-3 mr-1" />
                              Expired
                            </Badge>
                          ) : isIdExpiringSoon(member) ? (
                            <Badge className="bg-amber-500 text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Expiring Soon
                            </Badge>
                          ) : (
                            <span className="text-sm">
                              {new Date(member.id_expiry_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditMember(member)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Member</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(member)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove Member</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Member Dialog */}
      <MemberKYCEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        entityType={entityType}
        entityId={entityId}
        memberId={editingMember?.id}
        memberName={editingMember ? getDisplayName(editingMember) : undefined}
        initialData={getMemberInitialData(editingMember)}
        apiEndpoint={apiEndpoint}
        onSuccess={handleDialogSuccess}
        mode={editingMember ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deletingMember ? getDisplayName(deletingMember) : 'this member'}</strong>?
              <br /><br />
              This will mark the member as inactive. The record will be preserved for audit purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Removing...' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
