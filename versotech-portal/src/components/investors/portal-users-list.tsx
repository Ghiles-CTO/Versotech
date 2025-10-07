'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type PortalUsersListProps = {
  investorId: string
  users: Array<{
    user_id: string
    profiles: {
      id: string
      display_name: string
      email: string
      title: string
      role: string
    } | null
  }>
}

export function PortalUsersList({ investorId, users }: PortalUsersListProps) {
  const router = useRouter()

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!confirm(`Remove ${userName} from the investor portal?`)) {
      return
    }

    try {
      const response = await fetch(`/api/staff/investors/${investorId}/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove user')
      }

      toast.success('User removed successfully')
      
      // Force hard refresh to show updated list
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove user')
    }
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No portal users assigned</p>
        <p className="text-sm mt-1">Click "Add User" to invite someone to access the portal</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {users.map((iu) => (
        <div key={iu.user_id} className="flex items-center justify-between border border-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{iu.profiles?.display_name || 'Unknown User'}</div>
              <div className="text-xs text-muted-foreground">{iu.profiles?.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{iu.profiles?.role}</Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-red-100 hover:text-red-600"
              onClick={() => handleRemoveUser(iu.user_id, iu.profiles?.display_name || 'this user')}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
