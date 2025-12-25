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
import { Checkbox } from '@/components/ui/checkbox'
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
import { cn } from '@/lib/utils'

interface StaffManagementPanelProps {
  staffMembers: any[]
  onStaffUpdate: () => void
  isDark?: boolean
}

export function StaffManagementPanel({ staffMembers, onStaffUpdate, isDark = true }: StaffManagementPanelProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [activityData, setActivityData] = useState<any>(null)
  const [activityLoading, setActivityLoading] = useState(false)
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    display_name: '',
    role: 'staff_ops',
    title: '',
    is_super_admin: false,
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
        toast.error(error.error || 'Failed to invite staff member')
      } else {
        toast.success('Invitation sent successfully')
        setInviteDialogOpen(false)
        onStaffUpdate()
        setInviteFormData({
          email: '',
          display_name: '',
          role: 'staff_ops',
          title: '',
          is_super_admin: false,
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
    setActivityLoading(true)
    setActivityData(null)
    try {
      const response = await fetch(`/api/admin/staff/${staff.id}/activity?limit=50`)
      if (response.ok) {
        const result = await response.json()
        setActivityData(result.data)
      } else {
        toast.error('Failed to load activity data')
      }
    } catch (error) {
      toast.error('Failed to load activity data')
    } finally {
      setActivityLoading(false)
    }
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
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'invited':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Invited</Badge>
      default:
        return <Badge variant="secondary">Inactive</Badge>
    }
  }

  return (
    <>
      <Card className={cn(
        isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Staff Management</CardTitle>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            'rounded-md border',
            isDark ? 'border-zinc-700' : 'border-gray-200'
          )}>
            <Table>
              <TableHeader>
                <TableRow className={isDark ? 'border-zinc-700' : 'border-gray-200'}>
                  <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Name</TableHead>
                  <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Email</TableHead>
                  <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Role</TableHead>
                  <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Status</TableHead>
                  <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Permissions</TableHead>
                  <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Last Login</TableHead>
                  <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Last Activity</TableHead>
                  <TableHead className={cn(
                    'text-right',
                    isDark ? 'text-zinc-400' : 'text-gray-500'
                  )}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((staff) => (
                  <TableRow key={staff.id} className={cn(
                    isDark ? 'border-zinc-700 hover:bg-zinc-800/50' : 'border-gray-200 hover:bg-gray-50'
                  )}>
                    <TableCell className="font-medium">
                      <div>
                        <p className={isDark ? 'text-white' : 'text-gray-900'}>{staff.display_name || 'N/A'}</p>
                        {staff.title && (
                          <p className={cn(
                            'text-xs',
                            isDark ? 'text-zinc-400' : 'text-gray-500'
                          )}>{staff.title}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className={cn(
                          'h-3 w-3',
                          isDark ? 'text-zinc-400' : 'text-gray-500'
                        )} />
                        <span className={isDark ? 'text-zinc-300' : 'text-gray-700'}>{staff.email}</span>
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
                          <p className={isDark ? 'text-zinc-300' : 'text-gray-700'}>{new Date(staff.last_login_at).toLocaleDateString()}</p>
                          <p className={cn(
                            'text-xs',
                            isDark ? 'text-zinc-400' : 'text-gray-500'
                          )}>
                            {new Date(staff.last_login_at).toLocaleTimeString()}
                          </p>
                        </div>
                      ) : (
                        <span className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {staff.last_activity ? (
                        <div className="text-sm">
                          <p className={cn(
                            'text-xs',
                            isDark ? 'text-zinc-300' : 'text-gray-700'
                          )}>{staff.last_action}</p>
                          <p className={cn(
                            'text-xs',
                            isDark ? 'text-zinc-400' : 'text-gray-500'
                          )}>
                            {new Date(staff.last_activity).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <span className={isDark ? 'text-zinc-400' : 'text-gray-500'}>No activity</span>
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
                          <Button variant="ghost" className={cn(
                            'h-8 w-8 p-0',
                            isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                          )}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={cn(
                          isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
                        )}>
                          <DropdownMenuLabel className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewActivity(staff)}
                            className={cn(
                              isDark
                                ? 'text-zinc-300 focus:text-white focus:bg-zinc-700'
                                : 'text-gray-700 focus:text-gray-900 focus:bg-gray-100'
                            )}
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            View Activity
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className={isDark ? 'bg-zinc-700' : 'bg-gray-200'} />
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
            <div className={cn(
              'text-center p-4 rounded-lg',
              isDark ? 'bg-zinc-800/50' : 'bg-gray-100'
            )}>
              <p className={cn(
                'text-2xl font-bold',
                isDark ? 'text-white' : 'text-gray-900'
              )}>{staffMembers.length}</p>
              <p className={cn(
                'text-xs',
                isDark ? 'text-zinc-400' : 'text-gray-500'
              )}>Total Staff</p>
            </div>
            <div className={cn(
              'text-center p-4 rounded-lg',
              isDark ? 'bg-zinc-800/50' : 'bg-gray-100'
            )}>
              <p className={cn(
                'text-2xl font-bold',
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                {staffMembers.filter(s => s.status === 'active').length}
              </p>
              <p className={cn(
                'text-xs',
                isDark ? 'text-zinc-400' : 'text-gray-500'
              )}>Active</p>
            </div>
            <div className={cn(
              'text-center p-4 rounded-lg',
              isDark ? 'bg-zinc-800/50' : 'bg-gray-100'
            )}>
              <p className={cn(
                'text-2xl font-bold',
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                {staffMembers.filter(s => s.is_super_admin).length}
              </p>
              <p className={cn(
                'text-xs',
                isDark ? 'text-zinc-400' : 'text-gray-500'
              )}>Super Admins</p>
            </div>
            <div className={cn(
              'text-center p-4 rounded-lg',
              isDark ? 'bg-zinc-800/50' : 'bg-gray-100'
            )}>
              <p className={cn(
                'text-2xl font-bold',
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                {staffMembers.filter(s => s.recent_failed_logins > 0).length}
              </p>
              <p className={cn(
                'text-xs',
                isDark ? 'text-zinc-400' : 'text-gray-500'
              )}>With Failed Logins</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Staff Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className={cn(
          isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'
        )}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Invite New Staff Member</DialogTitle>
            <DialogDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
              Send an invitation to add a new staff member to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@verso.com"
                value={inviteFormData.email}
                onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                className={cn(
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name" className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Display Name</Label>
              <Input
                id="display_name"
                placeholder="John Doe"
                value={inviteFormData.display_name}
                onChange={(e) => setInviteFormData({ ...inviteFormData, display_name: e.target.value })}
                className={cn(
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Role</Label>
              <Select
                value={inviteFormData.role}
                onValueChange={(value) => setInviteFormData({ ...inviteFormData, role: value })}
              >
                <SelectTrigger className={cn(
                  isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={cn(
                  isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
                )}>
                  <SelectItem value="staff_admin">Admin</SelectItem>
                  <SelectItem value="staff_ops">Operations</SelectItem>
                  <SelectItem value="staff_rm">Relationship Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Senior Operations Manager"
                value={inviteFormData.title}
                onChange={(e) => setInviteFormData({ ...inviteFormData, title: e.target.value })}
                className={cn(
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                )}
              />
            </div>
            <div className={cn(
              'flex items-center space-x-2 pt-2 border-t',
              isDark ? 'border-zinc-700' : 'border-gray-200'
            )}>
              <Checkbox
                id="is_super_admin"
                checked={inviteFormData.is_super_admin}
                onCheckedChange={(checked) =>
                  setInviteFormData({ ...inviteFormData, is_super_admin: checked === true })
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="is_super_admin"
                  className={cn(
                    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2',
                    isDark ? 'text-zinc-300' : 'text-gray-700'
                  )}
                >
                  <Shield className="h-4 w-4 text-amber-500" />
                  Grant Super Admin Access
                </Label>
                <p className={cn(
                  'text-xs',
                  isDark ? 'text-zinc-400' : 'text-gray-500'
                )}>
                  Super admins have full access to system settings and can manage all staff.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
              className={cn(
                isDark ? 'border-zinc-700 text-zinc-400' : 'border-gray-300 text-gray-600'
              )}
            >
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
        <DialogContent className={cn(
          'max-w-2xl max-h-[80vh] overflow-hidden flex flex-col',
          isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'
        )}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>
              Activity Log - {selectedStaff?.display_name || selectedStaff?.email}
            </DialogTitle>
            <DialogDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
              Recent activity and login history for this staff member.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4">
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <Clock className={cn(
                  'h-6 w-6 animate-spin',
                  isDark ? 'text-zinc-400' : 'text-gray-500'
                )} />
              </div>
            ) : activityData ? (
              <>
                {/* Activity Stats */}
                {activityData.statistics && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className={cn(
                      'text-center p-3 rounded-lg',
                      isDark ? 'bg-zinc-800' : 'bg-gray-100'
                    )}>
                      <p className={cn(
                        'text-2xl font-bold',
                        isDark ? 'text-white' : 'text-gray-900'
                      )}>{activityData.statistics.actions_today || 0}</p>
                      <p className={cn(
                        'text-xs',
                        isDark ? 'text-zinc-400' : 'text-gray-500'
                      )}>Today</p>
                    </div>
                    <div className={cn(
                      'text-center p-3 rounded-lg',
                      isDark ? 'bg-zinc-800' : 'bg-gray-100'
                    )}>
                      <p className={cn(
                        'text-2xl font-bold',
                        isDark ? 'text-white' : 'text-gray-900'
                      )}>{activityData.statistics.actions_this_week || 0}</p>
                      <p className={cn(
                        'text-xs',
                        isDark ? 'text-zinc-400' : 'text-gray-500'
                      )}>This Week</p>
                    </div>
                    <div className={cn(
                      'text-center p-3 rounded-lg',
                      isDark ? 'bg-zinc-800' : 'bg-gray-100'
                    )}>
                      <p className={cn(
                        'text-2xl font-bold',
                        isDark ? 'text-white' : 'text-gray-900'
                      )}>{activityData.statistics.actions_this_month || 0}</p>
                      <p className={cn(
                        'text-xs',
                        isDark ? 'text-zinc-400' : 'text-gray-500'
                      )}>This Month</p>
                    </div>
                  </div>
                )}
                {/* Activity List */}
                {activityData.activities && activityData.activities.length > 0 ? (
                  <div className={cn(
                    'border rounded-lg divide-y',
                    isDark ? 'border-zinc-700 divide-zinc-700' : 'border-gray-200 divide-gray-200'
                  )}>
                    {activityData.activities.map((activity: any) => (
                      <div key={activity.id} className={cn(
                        'p-3 text-sm',
                        isDark ? 'bg-zinc-800/50' : 'bg-white'
                      )}>
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            'font-medium',
                            isDark ? 'text-white' : 'text-gray-900'
                          )}>{activity.action?.replace(/_/g, ' ')}</span>
                          <span className={cn(
                            'text-xs',
                            isDark ? 'text-zinc-400' : 'text-gray-500'
                          )}>
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {activity.entity_type && (
                          <p className={cn(
                            'text-xs mt-1',
                            isDark ? 'text-zinc-400' : 'text-gray-500'
                          )}>
                            {activity.entity_type} {activity.entity_id ? `(${activity.entity_id.slice(0, 8)}...)` : ''}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={cn(
                    'text-sm text-center py-4',
                    isDark ? 'text-zinc-400' : 'text-gray-500'
                  )}>
                    No activity recorded for this staff member.
                  </p>
                )}
              </>
            ) : (
              <p className={cn(
                'text-sm text-center py-4',
                isDark ? 'text-zinc-400' : 'text-gray-500'
              )}>
                Failed to load activity data.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActivityDialogOpen(false)}
              className={cn(
                isDark ? 'border-zinc-700 text-zinc-400' : 'border-gray-300 text-gray-600'
              )}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
