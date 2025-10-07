'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FinalizeAllocationModalProps {
  dealId: string
  reservationId: string
  investorName: string
  units: number
}

export function FinalizeAllocationModal({
  dealId,
  reservationId,
  investorName,
  units
}: FinalizeAllocationModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const handleFinalize = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/deals/${dealId}/allocations/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_id: reservationId,
          notes
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to finalize allocation')
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
        <Button size="sm" className="gap-2 bg-emerald-500 hover:bg-emerald-600">
          <CheckCircle className="h-4 w-4" />
          Finalize Allocation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalize Allocation</DialogTitle>
          <DialogDescription>
            Convert this reservation into a permanent allocation for {investorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-400/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-200 mt-0.5" />
              <div className="text-sm text-amber-200">
                <p className="font-medium mb-1">This action cannot be undone</p>
                <p>
                  Finalizing will create a position, generate invoices for fees and spread,
                  and permanently remove units from available inventory.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Investor:</span>
                <span className="font-medium text-foreground">{investorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Units:</span>
                <span className="font-medium text-foreground">{units.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this allocation..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
            <Button onClick={handleFinalize} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finalizing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Finalize Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

