'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type ExistingUser = {
  id: string
  display_name: string
  email: string
  role: string
}

type AddUserToInvestorModalProps = {
  investorId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddUserToInvestorModal({ investorId, open, onOpenChange }: AddUserToInvestorModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [mode, setMode] = useState<'existing' | 'invite'>('existing')
  const [email, setEmail] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [existingUsers, setExistingUsers] = useState<ExistingUser[]>([])

  // Fetch existing users when modal opens
  useEffect(() => {
    if (open) {
      fetchExistingUsers()
    }
  }, [open])

  const fetchExistingUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/profiles?role=investor')
      if (response.ok) {
        const data = await response.json()
        setExistingUsers(data.profiles || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate based on mode
    if (mode === 'existing' && !selectedUserId) {
      toast.error('Please select a user')
      return
    }
    
    if (mode === 'invite' && (!email || !email.includes('@'))) {
      toast.error('Valid email is required')
      return
    }

    setLoading(true)

    try {
      const submitEmail = mode === 'existing' 
        ? existingUsers.find(u => u.id === selectedUserId)?.email 
        : email

      console.log('[AddUser] Sending request:', { mode, email: submitEmail, userId: selectedUserId })
      
      const response = await fetch(`/api/staff/investors/${investorId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: submitEmail?.trim().toLowerCase(),
          user_id: mode === 'existing' ? selectedUserId : undefined
        }),
      })

      const data = await response.json()
      console.log('[AddUser] Response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add user')
      }

      if (data.invited) {
        toast.success(`Invitation sent to ${submitEmail}. They will receive an email to set up their account.`)
      } else {
        toast.success(`User ${submitEmail} has been linked to this investor.`)
      }
      
      setEmail('')
      setSelectedUserId('')
      setMode('existing')
      onOpenChange(false)
      
      // Force hard refresh to show new user
      window.location.reload()
    } catch (error: any) {
      console.error('[AddUser] Error:', error)
      toast.error(error.message || 'Failed to add user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Portal User</DialogTitle>
          <DialogDescription>
            Link an existing user or send an invitation to create a new account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Selection with Tabs */}
          <Tabs value={mode} onValueChange={(value: any) => setMode(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Select Existing User</TabsTrigger>
              <TabsTrigger value="invite">Send Invitation</TabsTrigger>
            </TabsList>

            {/* Existing User Selection */}
            <TabsContent value="existing" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="user_select">
                  Select User <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                  disabled={loadingUsers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUsers ? "Loading users..." : "Choose a user"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {existingUsers.length > 0 ? (
                      existingUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span>{user.display_name}</span>
                            <span className="text-xs text-muted-foreground">({user.email})</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled>
                        {loadingUsers ? "Loading..." : "No users found"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select from existing users in the system
                </p>
              </div>

              {/* Info Box */}
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 p-3 text-xs text-blue-900 dark:text-blue-300">
                <strong>How it works:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>User is immediately linked to this investor</li>
                  <li>They can access this investor's data in the portal</li>
                </ul>
              </div>
            </TabsContent>

            {/* New Email Invitation */}
            <TabsContent value="invite" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="newuser@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  An invitation email will be sent to this address
                </p>
              </div>

              {/* Info Box */}
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 p-3 text-xs text-blue-900 dark:text-blue-300">
                <strong>How it works:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Invitation email sent with signup link</li>
                  <li>They create account and get portal access</li>
                  <li>Automatically linked to this investor</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
