'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Copy,
  PenTool,
  Shield,
  MoreHorizontal,
  Loader2,
  Send,
  AlertCircle,
  Edit,
} from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type EntityType = 'partner' | 'investor' | 'introducer' | 'commercial_partner' | 'lawyer' | 'arranger'

interface Member {
  id: string
  user_id: string
  role: string
  is_primary: boolean
  can_sign?: boolean
  signature_specimen_url?: string
  created_at: string
  profile?: {
    display_name: string | null
    email: string | null
    avatar_url: string | null
  }
}

interface Invitation {
  id: string
  email: string
  role: string
  is_signatory: boolean
  status: string
  invited_by_name: string
  expires_at: string
  created_at: string
  accepted_at?: string
  invitation_token?: string
}

interface MembersManagementTabProps {
  entityType: EntityType
  entityId: string
  entityName: string
  initialMembers?: Member[]
  currentUserRole?: string
  isCurrentUserPrimary?: boolean
  canManageMembers?: boolean
  showSignatoryOption?: boolean
  onMembersChange?: () => void
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrator' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
]

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  partner: 'Partner',
  investor: 'Investor Entity',
  introducer: 'Introducer',
  commercial_partner: 'Commercial Partner',
  lawyer: 'Law Firm',
  arranger: 'Arranger'
}

export function MembersManagementTab({
  entityType,
  entityId,
  entityName,
  initialMembers = [],
  currentUserRole = 'member',
  isCurrentUserPrimary = false,
  canManageMembers = false,
  showSignatoryOption = true,
  onMembersChange
}: MembersManagementTabProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [userPermissions, setUserPermissions] = useState({
    role: currentUserRole,
    is_primary: isCurrentUserPrimary,
    can_manage: canManageMembers
  })

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [isSignatory, setIsSignatory] = useState(false)

  // Edit member state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [editRole, setEditRole] = useState('member')
  const [editCanSign, setEditCanSign] = useState(false)
  const [editIsPrimary, setEditIsPrimary] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchMembers()
    fetchInvitations()
  }, [entityType, entityId])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/members?entity_type=${entityType}&entity_id=${entityId}`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
        if (data.current_user) {
          setUserPermissions(data.current_user)
        }
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`/api/members/invite?entity_type=${entityType}&entity_id=${entityId}`)
      if (response.ok) {
        const data = await response.json()
        setInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error('Error fetching invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Open edit dialog with member data
  const handleEditMember = (member: Member) => {
    setEditingMember(member)
    setEditRole(member.role)
    setEditCanSign(member.can_sign || false)
    setEditIsPrimary(member.is_primary)
    setEditDialogOpen(true)
  }

  // Save member edits
  const handleSaveEdit = async () => {
    if (!editingMember) return

    setSaving(true)
    try {
      const response = await fetch(`/api/members/${editingMember.user_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          role: editRole,
          can_sign: editCanSign,
          is_primary: editIsPrimary,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to update member')
        return
      }

      toast.success('Member updated successfully')
      setEditDialogOpen(false)
      setEditingMember(null)
      fetchMembers() // Refresh the list
    } catch (error) {
      console.error('Error updating member:', error)
      toast.error('Failed to update member')
    } finally {
      setSaving(false)
    }
  }

  // Remove member
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const response = await fetch(
        `/api/members/${memberId}?entity_type=${entityType}&entity_id=${entityId}`,
        { method: 'DELETE' }
      )

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to remove member')
        return
      }

      toast.success('Member removed successfully')
      fetchMembers() // Refresh the list
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('Failed to remove member')
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address')
      return
    }

    setSending(true)

    try {
      const response = await fetch('/api/members/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          email: inviteEmail,
          role: inviteRole,
          is_signatory: isSignatory
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to send invitation')
        return
      }

      // Show appropriate message based on whether CEO approval is required
      if (data.requires_approval) {
        toast.success(`Invitation request created for ${inviteEmail}. Awaiting CEO approval.`, {
          description: 'The invitation email will be sent after approval.',
          duration: 5000
        })
      } else {
        toast.success(`Invitation sent to ${inviteEmail}`)
      }
      setInviteDialogOpen(false)
      setInviteEmail('')
      setInviteRole('member')
      setIsSignatory(false)
      fetchInvitations()

      // Copy invite link to clipboard
      if (data.invitation?.accept_url) {
        await navigator.clipboard.writeText(data.invitation.accept_url)
        toast.info('Invitation link copied to clipboard')
      }
    } catch (error) {
      toast.error('Failed to send invitation')
    } finally {
      setSending(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    setCancelling(invitationId)

    try {
      const response = await fetch(`/api/members/invite?id=${invitationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to cancel invitation')
        return
      }

      toast.success('Invitation cancelled')
      fetchInvitations()
    } catch (error) {
      toast.error('Failed to cancel invitation')
    } finally {
      setCancelling(null)
    }
  }

  const copyInviteLink = async (token: string) => {
    const url = `${window.location.origin}/invitation/accept?token=${token}`
    await navigator.clipboard.writeText(url)
    toast.success('Invitation link copied!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'pending_approval':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30"><Clock className="w-3 h-3 mr-1" />Awaiting CEO Approval</Badge>
      case 'accepted':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Accepted</Badge>
      case 'expired':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/30"><Clock className="w-3 h-3 mr-1" />Expired</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingInvitations = invitations.filter(i => ['pending', 'pending_approval'].includes(i.status))
  const pastInvitations = invitations.filter(i => !['pending', 'pending_approval'].includes(i.status))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage who has access to {entityName}
          </p>
        </div>
        {userPermissions.can_manage && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      <Tabs defaultValue="members" className="w-full" id="members-management-tabs">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitations ({pendingInvitations.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Members Tab */}
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {members.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No members yet</p>
                  {userPermissions.can_manage && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setInviteDialogOpen(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite First Member
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      {userPermissions.can_manage && <TableHead className="w-10"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              {member.profile?.avatar_url ? (
                                <img
                                  src={member.profile.avatar_url}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium">
                                  {(member.profile?.display_name || member.profile?.email || '?')[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {member.profile?.display_name || 'Unknown User'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.profile?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {member.role}
                            </Badge>
                            {member.is_primary && (
                              <Badge variant="secondary">
                                <Shield className="w-3 h-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                            {member.can_sign && (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                                <PenTool className="w-3 h-3 mr-1" />
                                Signatory
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.can_sign && !member.signature_specimen_url ? (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Needs Signature
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(member.created_at)}
                        </TableCell>
                        {userPermissions.can_manage && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Member
                                </DropdownMenuItem>
                                {!member.is_primary && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleRemoveMember(member.user_id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove Member
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="mt-4 space-y-4">
          {/* Pending Invitations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Invitations</CardTitle>
              <CardDescription>
                Invitations waiting to be accepted
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : pendingInvitations.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No pending invitations</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{invitation.email}</span>
                            {invitation.is_signatory && (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                                <PenTool className="w-3 h-3 mr-1" />
                                Signatory
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {invitation.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {invitation.invited_by_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invitation.expires_at)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {invitation.invitation_token && (
                                <DropdownMenuItem onClick={() => copyInviteLink(invitation.invitation_token!)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </DropdownMenuItem>
                              )}
                              {userPermissions.can_manage && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleCancelInvitation(invitation.id)}
                                  disabled={cancelling === invitation.id}
                                >
                                  {cancelling === invitation.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Cancel Invitation
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Past Invitations */}
          {pastInvitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Invitation History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastInvitations.slice(0, 10).map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>{invitation.email}</TableCell>
                        <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invitation.accepted_at || invitation.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join {entityName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
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

            {showSignatoryOption && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="signatory"
                  checked={isSignatory}
                  onCheckedChange={(checked) => setIsSignatory(checked === true)}
                />
                <Label htmlFor="signatory" className="flex items-center gap-2 cursor-pointer">
                  <PenTool className="h-4 w-4" />
                  Authorized Signatory
                  <span className="text-xs text-muted-foreground">(can sign documents)</span>
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={sending || !inviteEmail}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update {editingMember?.profile?.display_name || editingMember?.profile?.email || 'member'} settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Role */}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Signatory Option */}
            {showSignatoryOption && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="edit-signatory"
                  checked={editCanSign}
                  onCheckedChange={(checked) => setEditCanSign(checked === true)}
                />
                <Label htmlFor="edit-signatory" className="flex items-center gap-2 cursor-pointer">
                  <PenTool className="h-4 w-4" />
                  Authorized Signatory
                  <span className="text-xs text-muted-foreground">(can sign documents)</span>
                </Label>
              </div>
            )}

            {/* Primary Contact Option (only if user is already primary) */}
            {userPermissions.is_primary && !editingMember?.is_primary && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="edit-primary"
                  checked={editIsPrimary}
                  onCheckedChange={(checked) => setEditIsPrimary(checked === true)}
                />
                <Label htmlFor="edit-primary" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="h-4 w-4" />
                  Make Primary Contact
                  <span className="text-xs text-muted-foreground">(transfers primary status)</span>
                </Label>
              </div>
            )}

            {editingMember?.is_primary && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Shield className="h-4 w-4 inline mr-2" />
                This member is the primary contact. To change primary status,
                select another member and make them primary.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
