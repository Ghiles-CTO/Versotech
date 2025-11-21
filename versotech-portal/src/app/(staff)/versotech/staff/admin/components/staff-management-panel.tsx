'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  UserPlus,
  UserX,
  Activity,
  MoreHorizontal,
  Shield,
  Clock,
  Mail,
  ChevronDown,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface StaffManagementPanelProps {
  staffMembers: any[]
  onStaffUpdate: () => void
}

export function StaffManagementPanel({ staffMembers, onStaffUpdate }: StaffManagementPanelProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    display_name: '',
    role: 'staff_ops',
    title: '',
  })
  const [loading, setLoading] = useState(false)

  const handleInviteStaff = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteFormData),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.message || 'Failed to invite staff member')
      } else {
        toast.success('Invitation sent successfully')
        setInviteDialogOpen(false)
        onStaffUpdate()
        setInviteFormData({
          email: '',
          display_name: '',
          role: 'staff_ops',
          title: '',
        })
      }
    } catch (error) {
      toast.error('Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to deactivate this staff member?')) return

    try {
      const response = await fetch(`/api/admin/staff/${staffId}/deactivate`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to deactivate staff')
      }

      toast.success('Staff member deactivated successfully')
      onStaffUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Failed to deactivate staff member')
    }
  }

  const handleViewActivity = async (staff: any) => {
    setSelectedStaff(staff)
    setActivityDialogOpen(true)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'staff_admin':
        return <Badge className="bg-purple-500">Admin</Badge>
      case 'staff_ops':
        return <Badge className="bg-blue-500">Operations</Badge>
      case 'staff_rm':
        return <Badge className="bg-green-500">Relationship Manager</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? <Badge variant="default">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Staff Management</CardTitle>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{staff.display_name || 'N/A'}</p>
                        {staff.title && (
                          <p className="text-xs text-muted-foreground">{staff.title}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {staff.email}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(staff.role)}</TableCell>
                    <TableCell>{getStatusBadge(staff.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {staff.is_super_admin && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Super Admin
                          </Badge>
                        )}
                        {staff.permissions.length > 0 && !staff.is_super_admin && (
                          <Badge variant="outline" className="text-xs">
                            {staff.permissions.length} permissions
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {staff.last_login_at ? (
                        <div className="text-sm">
                          <p>{new Date(staff.last_login_at).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(staff.last_login_at).toLocaleTimeString()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {staff.last_activity ? (
                        <div className="text-sm">
                          <p className="text-xs">{staff.last_action}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(staff.last_activity).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No activity</span>
                      )}
                      {staff.recent_failed_logins > 0 && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          {staff.recent_failed_logins} failed logins
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewActivity(staff)}>
                            <Activity className="h-4 w-4 mr-2" />
                            View Activity
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            Manage Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeactivateStaff(staff.id)}
                            disabled={staff.status === 'inactive'}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{staffMembers.length}</p>
              <p className="text-xs text-muted-foreground">Total Staff</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {staffMembers.filter(s => s.status === 'active').length}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {staffMembers.filter(s => s.is_super_admin).length}
              </p>
              <p className="text-xs text-muted-foreground">Super Admins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {staffMembers.filter(s => s.recent_failed_logins > 0).length}
              </p>
              <p className="text-xs text-muted-foreground">With Failed Logins</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Staff Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Staff Member</DialogTitle>
            <DialogDescription>
              Send an invitation to add a new staff member to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@verso.com"
                value={inviteFormData.email}
                onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                placeholder="John Doe"
                value={inviteFormData.display_name}
                onChange={(e) => setInviteFormData({ ...inviteFormData, display_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteFormData.role}
                onValueChange={(value) => setInviteFormData({ ...inviteFormData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff_admin">Admin</SelectItem>
                  <SelectItem value="staff_ops">Operations</SelectItem>
                  <SelectItem value="staff_rm">Relationship Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Senior Operations Manager"
                value={inviteFormData.title}
                onChange={(e) => setInviteFormData({ ...inviteFormData, title: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteStaff} disabled={loading}>
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Activity Log - {selectedStaff?.display_name || selectedStaff?.email}
            </DialogTitle>
            <DialogDescription>
              Recent activity and login history for this staff member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Activity tracking will show detailed logs once implemented.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}