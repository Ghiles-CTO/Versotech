'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ApproveCommitmentModalProps {
  dealId: string
  commitmentId: string
  investorName: string
  units: number
}

export function ApproveCommitmentModal({
  dealId,
  commitmentId,
  investorName,
  units
}: ApproveCommitmentModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [holdMinutes, setHoldMinutes] = useState('2880') // 48 hours

  const handleApprove = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/deals/${dealId}/commitments/${commitmentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          hold_minutes: parseInt(holdMinutes)
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to approve commitment')
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
        <Button size="sm" variant="outline" className="gap-2 border-emerald-400/30 text-emerald-600 dark:text-emerald-200 hover:bg-emerald-500/10">
          <CheckCircle className="h-4 w-4" />
          Approve
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Commitment</DialogTitle>
          <DialogDescription>
            This will create a reservation and lock inventory for {investorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Investor:</span>
                <span className="font-medium text-foreground">{investorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested Units:</span>
                <span className="font-medium text-foreground">{units.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hold_minutes">Reservation Hold (minutes)</Label>
            <Input
              id="hold_minutes"
              type="number"
              value={holdMinutes}
              onChange={(e) => setHoldMinutes(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Default: 2880 minutes (48 hours)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Approval Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this approval..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
            <Button onClick={handleApprove} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve & Reserve
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

