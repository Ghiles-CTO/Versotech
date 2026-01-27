'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AddMemberModalProps {
  dealId: string
  onMemberAdded?: () => void
}

export function AddMemberModal({ dealId, onMemberAdded }: AddMemberModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [investors, setInvestors] = useState<any[]>([])
  const [selectedInvestor, setSelectedInvestor] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    role: 'investor'
  })

  // Fetch investors when modal opens
  useEffect(() => {
    if (open) {
      fetchInvestors()
    }
  }, [open])

  const fetchInvestors = async () => {
    try {
      // Only fetch investors that have linked user accounts
      const response = await fetch('/api/investors?has_users=true')
      if (response.ok) {
        const data = await response.json()
        setInvestors(data.investors || [])
      }
    } catch (err) {
      console.error('Failed to fetch investors:', err)
    }
  }

  const handleSubmit = async () => {
    if (!selectedInvestor && !formData.email) {
      setError('Please select an investor or enter an email')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/deals/${dealId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investor_id: selectedInvestor || undefined,
          email: formData.email || undefined,
          role: formData.role,
          send_notification: true
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add member')
      }

      // Reset form and close modal
      setFormData({ email: '', role: 'investor' })
      setSelectedInvestor('')
      setOpen(false)

      // Call callback to refresh members list instantly
      if (onMemberAdded) {
        onMemberAdded()
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvestors = investors.filter(inv =>
    inv.legal_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Deal Member</DialogTitle>
          <DialogDescription>
            Invite an investor or external participant to this deal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Existing Investors */}
          <div className="space-y-2">
            <Label>Search Existing Investors</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && filteredInvestors.length > 0 && (
              <div className="max-h-40 overflow-y-auto border border-border rounded-lg">
                {filteredInvestors.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setSelectedInvestor(inv.id)
                      setFormData(prev => ({ ...prev, email: '' }))
                      setSearchQuery('')
                    }}
                    className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-0"
                  >
                    <p className="font-medium text-foreground">{inv.legal_name}</p>
                    <p className="text-sm text-muted-foreground">{inv.type}</p>
                  </div>
                ))}
              </div>
            )}
            {selectedInvestor && (
              <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-400/30">
                <p className="text-sm text-emerald-600 dark:text-emerald-200">
                  Selected: {investors.find(i => i.id === selectedInvestor)?.legal_name}
                </p>
              </div>
            )}
          </div>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="px-3 text-sm text-muted-foreground">OR</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Email Input for New Users */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, email: e.target.value }))
                setSelectedInvestor('')
              }}
              disabled={!!selectedInvestor}
            />
            <p className="text-xs text-muted-foreground">
              Enter email for external participants (advisors, bankers, etc.)
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="co_investor">Co-Investor</SelectItem>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="advisor">Advisor</SelectItem>
                <SelectItem value="banker">Banker</SelectItem>
                <SelectItem value="introducer">Introducer</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-700 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Member'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

