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
      <DialogContent className="bg-zinc-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Add Portal User</DialogTitle>
          <DialogDescription className="text-gray-400">
            Link an existing user or send an invitation to create a new account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Selection with Tabs */}
          <Tabs value={mode} onValueChange={(value: any) => setMode(value)}>
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border-white/10">
              <TabsTrigger value="existing" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Select Existing User
              </TabsTrigger>
              <TabsTrigger value="invite" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Send Invitation
              </TabsTrigger>
            </TabsList>

            {/* Existing User Selection */}
            <TabsContent value="existing" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="user_select" className="text-white">
                  Select User <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                  disabled={loadingUsers}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder={loadingUsers ? "Loading users..." : "Choose a user"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] bg-zinc-950 border-white/10">
                    {existingUsers.length > 0 ? (
                      existingUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id} className="text-white">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span>{user.display_name}</span>
                            <span className="text-xs text-gray-400">({user.email})</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled className="text-gray-400">
                        {loadingUsers ? "Loading..." : "No users found"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">
                  Select from existing users in the system
                </p>
              </div>

              {/* Info Box */}
              <div className="rounded-md bg-blue-500/10 border border-blue-400/20 p-3 text-xs text-blue-100">
                <strong className="text-blue-100">How it works:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 text-blue-200">
                  <li>User is immediately linked to this investor</li>
                  <li>They can access this investor's data in the portal</li>
                </ul>
              </div>
            </TabsContent>

            {/* New Email Invitation */}
            <TabsContent value="invite" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="newuser@email.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-400">
                  An invitation email will be sent to this address
                </p>
              </div>

              {/* Info Box */}
              <div className="rounded-md bg-blue-500/10 border border-blue-400/20 p-3 text-xs text-blue-100">
                <strong className="text-blue-100">How it works:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 text-blue-200">
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
              className="border-white/10 text-white hover:bg-white/10 bg-white/5"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
