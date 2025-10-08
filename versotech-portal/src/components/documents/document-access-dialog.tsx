'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Loader2, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'

interface DocumentAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string | null
  documentName?: string
  onSuccess?: () => void
}

interface AccessGrant {
  id: string
  investor_id: string
  granted_at: string
  investor: {
    id: string
    legal_name: string
    type: string
    status: string
  }
  granted_by_profile?: {
    display_name: string
  }
}

export function DocumentAccessDialog({
  open,
  onOpenChange,
  documentId,
  documentName,
  onSuccess
}: DocumentAccessDialogProps) {
  const [grants, setGrants] = useState<AccessGrant[]>([])
  const [investors, setInvestors] = useState<any[]>([])
  const [selectedInvestorId, setSelectedInvestorId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [granting, setGranting] = useState(false)

  useEffect(() => {
    if (open && documentId) {
      loadAccessGrants()
      loadInvestors()
    }
  }, [open, documentId])

  const loadAccessGrants = async () => {
    if (!documentId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/staff/documents/${documentId}/access`)
      if (response.ok) {
        const data = await response.json()
        setGrants(data.grants || [])
      } else {
        toast.error('Failed to load access grants')
      }
    } catch (error) {
      console.error('Error loading grants:', error)
      toast.error('Failed to load access grants')
    } finally {
      setLoading(false)
    }
  }

  const loadInvestors = async () => {
    try {
      const response = await fetch('/api/staff/investors')
      if (response.ok) {
        const data = await response.json()
        setInvestors(data.investors || [])
      }
    } catch (error) {
      console.error('Error loading investors:', error)
    }
  }

  const handleGrantAccess = async () => {
    if (!selectedInvestorId || !documentId) {
      toast.error('Please select an investor')
      return
    }

    try {
      setGranting(true)
      const response = await fetch(`/api/staff/documents/${documentId}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investor_id: selectedInvestorId })
      })

      if (response.ok) {
        toast.success('Access granted successfully')
        setSelectedInvestorId('')
        loadAccessGrants()
        onSuccess?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to grant access')
      }
    } catch (error) {
      console.error('Error granting access:', error)
      toast.error('Failed to grant access')
    } finally {
      setGranting(false)
    }
  }

  const handleRevokeAccess = async (investorId: string) => {
    if (!confirm('Revoke access for this investor?')) return

    try {
      const response = await fetch(
        `/api/staff/documents/${documentId}/access?investor_id=${investorId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        toast.success('Access revoked successfully')
        loadAccessGrants()
        onSuccess?.()
      } else {
        toast.error('Failed to revoke access')
      }
    } catch (error) {
      console.error('Error revoking access:', error)
      toast.error('Failed to revoke access')
    }
  }

  const availableInvestors = investors.filter(
    inv => !grants.some(g => g.investor_id === inv.id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Manage Document Access - {documentName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Grant Access to Investor</Label>
            <div className="flex gap-2">
              <Select value={selectedInvestorId} onValueChange={setSelectedInvestorId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an investor..." />
                </SelectTrigger>
                <SelectContent>
                  {availableInvestors.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      All investors have access or no investors available
                    </div>
                  ) : (
                    availableInvestors.map(investor => (
                      <SelectItem key={investor.id} value={investor.id}>
                        {investor.legal_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleGrantAccess}
                disabled={!selectedInvestorId || granting}
              >
                {granting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Grant
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Investors with Access ({grants.length})</Label>
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
              </div>
            ) : grants.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                <p className="text-sm">No investors have access yet</p>
              </div>
            ) : (
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {grants.map((grant) => (
                  <div key={grant.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{grant.investor.legal_name}</p>
                      <p className="text-xs text-gray-500">
                        Granted {new Date(grant.granted_at).toLocaleDateString()}
                        {grant.granted_by_profile && ` by ${grant.granted_by_profile.display_name}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeAccess(grant.investor_id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

