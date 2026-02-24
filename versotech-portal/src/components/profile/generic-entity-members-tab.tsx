'use client'

/**
 * Generic Entity Members Tab
 *
 * A reusable component for managing entity members (directors, UBOs, signatories)
 * across all persona types: investor, arranger, partner, introducer, lawyer, commercial_partner
 *
 * Uses MemberKYCEditDialog for comprehensive KYC field editing.
 */

import { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus, Edit, Trash2, ShieldCheck, Clock, AlertCircle, Send } from 'lucide-react'
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

// Entity types that support members
export type EntityType = 'investor' | 'partner' | 'introducer' | 'lawyer' | 'arranger' | 'commercial_partner'

// Member data structure
interface EntityMember {
  id: string
  full_name?: string
  first_name?: string
  middle_name?: string
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
  ownership_percentage?: number
  is_beneficial_owner?: boolean
  is_signatory?: boolean
  can_sign?: boolean
  kyc_status?: string
  is_active?: boolean
  created_at?: string
}

interface GenericEntityMembersTabProps {
  entityType: EntityType
  entityId: string
  entityName?: string
  /** Base API endpoint for members, e.g., '/api/investors/me/members' */
  apiEndpoint: string
  /** Whether the current user can manage members */
  canManage?: boolean
  /** Optional custom title */
  title?: string
  /** Optional custom description */
  description?: string
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

export function GenericEntityMembersTab({
  entityType,
  entityId,
  entityName,
  apiEndpoint,
  canManage = true,
  title = 'Entity Members',
  description = 'Manage directors, shareholders, and beneficial owners',
}: GenericEntityMembersTabProps) {
  const [members, setMembers] = useState<EntityMember[]>([])
  const [memberSnapshots, setMemberSnapshots] = useState<Record<string, Record<string, unknown>>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<EntityMember | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [submittingMemberId, setSubmittingMemberId] = useState<string | null>(null)
  const [updatingSignatoryMemberId, setUpdatingSignatoryMemberId] = useState<string | null>(null)

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

  // Load snapshots for change detection (separate from members to avoid loops)
  const loadSnapshots = useCallback(async () => {
    try {
      const res = await fetch(`/api/me/member-kyc-snapshots?entityType=${entityType}&entityId=${entityId}`)
      if (res.ok) {
        const data = await res.json()
        setMemberSnapshots(data.snapshots || {})
      }
    } catch {
      // Non-critical — button will stay enabled if snapshots fail to load
    }
  }, [entityType, entityId])

  useEffect(() => {
    loadMembers()
    loadSnapshots()
  }, [loadMembers, loadSnapshots])

  const handleAddMember = () => {
    setEditingMember(null)
    setEditDialogOpen(true)
  }

  const handleEditMember = (member: EntityMember) => {
    setEditingMember(member)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (memberId: string) => {
    setDeletingMemberId(memberId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingMemberId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`${apiEndpoint}/${deletingMemberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete member')
      }

      toast.success('Member removed successfully')
      setDeleteDialogOpen(false)
      setDeletingMemberId(null)
      await loadMembers()
    } catch (err) {
      console.error('Error deleting member:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to delete member')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDialogSuccess = () => {
    loadMembers()
    loadSnapshots()
  }

  const handleSubmitMemberKyc = async (memberId: string) => {
    setSubmittingMemberId(memberId)
    try {
      const response = await fetch('/api/me/personal-kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          memberId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        const missing = data.missing as string[] | undefined
        if (missing && missing.length > 0) {
          toast.error(`Please complete: ${missing.join(', ')}`)
          return
        }
        throw new Error(data.error || 'Failed to submit member KYC')
      }

      toast.success('Personal KYC saved')
      await loadMembers()
      await loadSnapshots()
    } catch (err) {
      console.error('Error submitting member KYC:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to submit member KYC')
    } finally {
      setSubmittingMemberId(null)
    }
  }

  const isSignatory = (member: EntityMember) =>
    Boolean(member.is_signatory || member.can_sign)

  // Compare member's current data against the last saved snapshot (same pattern as overview page)
  const memberHasUnsavedChanges = (member: EntityMember): boolean => {
    const snapshot = memberSnapshots[member.id]
    // No snapshot means never saved — there are changes to save
    if (!snapshot || Object.keys(snapshot).length === 0) return true

    const normalize = (value: unknown): string | null => {
      if (value === null || value === undefined) return null
      if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : null
      }
      if (typeof value === 'number' || typeof value === 'boolean') return String(value)
      return JSON.stringify(value)
    }

    const fields: Array<{ current: unknown; key: string }> = [
      { current: member.first_name, key: 'first_name' },
      { current: member.middle_name, key: 'middle_name' },
      { current: member.last_name, key: 'last_name' },
      { current: member.name_suffix, key: 'name_suffix' },
      { current: member.date_of_birth, key: 'date_of_birth' },
      { current: member.country_of_birth, key: 'country_of_birth' },
      { current: member.nationality, key: 'nationality' },
      { current: member.email, key: 'email' },
      { current: member.phone_mobile, key: 'phone_mobile' },
      { current: member.phone_office, key: 'phone_office' },
      { current: member.residential_street, key: 'residential_street' },
      { current: member.residential_line_2, key: 'residential_line_2' },
      { current: member.residential_city, key: 'residential_city' },
      { current: member.residential_state, key: 'residential_state' },
      { current: member.residential_postal_code, key: 'residential_postal_code' },
      { current: member.residential_country, key: 'residential_country' },
      { current: member.is_us_citizen, key: 'is_us_citizen' },
      { current: member.is_us_taxpayer, key: 'is_us_taxpayer' },
      { current: member.us_taxpayer_id, key: 'us_taxpayer_id' },
      { current: member.country_of_tax_residency, key: 'country_of_tax_residency' },
      { current: member.tax_id_number, key: 'tax_id_number' },
      { current: member.id_type, key: 'id_type' },
      { current: member.id_number, key: 'id_number' },
      { current: member.id_issue_date, key: 'id_issue_date' },
      { current: member.id_expiry_date, key: 'id_expiry_date' },
      { current: member.id_issuing_country, key: 'id_issuing_country' },
    ]

    return fields.some(({ current, key }) =>
      normalize(current) !== normalize(snapshot[key])
    )
  }

  const handleSetSignatory = async (member: EntityMember, nextValue: boolean) => {
    if (!canManage) return

    setUpdatingSignatoryMemberId(member.id)

    // Optimistically update the local state so the Switch flips immediately
    setMembers(prev => prev.map(m =>
      m.id === member.id
        ? { ...m, is_signatory: nextValue, can_sign: nextValue }
        : m
    ))

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
    } catch (err) {
      console.error('Error updating signatory:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update signatory')
      // Revert on error
      await loadMembers()
    } finally {
      setUpdatingSignatoryMemberId(null)
    }
  }

  const getDisplayName = (member: EntityMember) => {
    if (member.full_name) return member.full_name
    const parts = [member.first_name, member.middle_name, member.last_name, member.name_suffix].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : 'Unknown'
  }

  const getRoleBadge = (role: string) => {
    return <Badge variant="outline">{ROLE_LABELS[role] || role}</Badge>
  }

  const getKYCStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><ShieldCheck className="w-3 h-3 mr-1" />Approved</Badge>
      case 'pending':
      case 'submitted':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-500"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">Not Submitted</Badge>
    }
  }

  // Convert member data to form format for MemberKYCEditDialog
  const getMemberInitialData = (member: EntityMember | null) => {
    if (!member) return undefined

    // Fall back to parsing full_name when first/last name fields are empty
    let firstName = member.first_name || ''
    let lastName = member.last_name || ''
    if (!firstName && !lastName && member.full_name) {
      const parts = member.full_name.trim().split(/\s+/)
      firstName = parts[0] || ''
      lastName = parts.slice(1).join(' ') || ''
    }

    return {
      role: member.role as any,
      is_signatory: Boolean(member.is_signatory || member.can_sign),
      first_name: firstName,
      middle_name: member.middle_name || '',
      last_name: lastName,
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
            {canManage && (
              <Button onClick={handleAddMember}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No members added yet. Add directors, shareholders, or beneficial owners.
              </p>
              {canManage && (
                <Button onClick={handleAddMember} variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Your First Member
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ownership %</TableHead>
                  <TableHead>Signatory</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {getDisplayName(member)}
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
                      {member.ownership_percentage != null ? `${member.ownership_percentage}%` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isSignatory(member)}
                          onCheckedChange={(checked) => handleSetSignatory(member, checked)}
                          disabled={!canManage || updatingSignatoryMemberId === member.id}
                        />
                        <span className={`text-xs ${isSignatory(member) ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}`}>
                          {isSignatory(member) ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getKYCStatusBadge(member.kyc_status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                            size="sm"
                            onClick={() => handleSubmitMemberKyc(member.id)}
                            disabled={submittingMemberId === member.id || !memberHasUnsavedChanges(member)}
                          >
                            <Send className="w-4 h-4 mr-1.5" />
                            {submittingMemberId === member.id ? 'Saving...' : 'Save'}
                          </Button>
                        {canManage && (
                          <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMember(member)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(member.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Member Dialog - Uses MemberKYCEditDialog */}
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
              Are you sure you want to remove this member? This action can be undone by contacting support.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
