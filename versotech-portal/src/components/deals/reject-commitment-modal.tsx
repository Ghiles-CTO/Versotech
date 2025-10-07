'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { XCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RejectCommitmentModalProps {
  dealId: string
  commitmentId: string
  investorName: string
}

export function RejectCommitmentModal({
  dealId,
  commitmentId,
  investorName
}: RejectCommitmentModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const handleReject = async () => {
    if (!reason || reason.length < 10) {
      setError('Please provide a detailed rejection reason (at least 10 characters)')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/deals/${dealId}/commitments/${commitmentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reject commitment')
      }

      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2 border-red-400/30 text-red-200 hover:bg-red-500/10">
          <XCircle className="h-4 w-4" />
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Commitment</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this commitment from {investorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Explain why this commitment is being rejected..."
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be communicated to the investor
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={loading}
              variant="destructive"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Commitment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

