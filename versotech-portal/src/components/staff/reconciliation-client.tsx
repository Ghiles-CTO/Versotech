'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, RefreshCw, Link, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function UploadCSVDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/staff/reconciliation/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload CSV')
      }

      toast.success(data.message || `Imported ${data.imported} transactions`)
      setIsOpen(false)
      setFile(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload CSV')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import Bank Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Bank Transactions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Expected columns: date, amount, counterparty (plus optional: currency, memo, reference)
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? 'Uploading...' : 'Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AutoMatchButton() {
  const [isRunning, setIsRunning] = useState(false)
  const router = useRouter()

  const handleAutoMatch = async () => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/staff/reconciliation/auto-match', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run auto-match')
      }

      toast.success(data.message || `Found ${data.matches} suggested matches`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to run auto-match')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Button onClick={handleAutoMatch} disabled={isRunning}>
      <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
      Run Auto-Match
    </Button>
  )
}

interface MatchActionsProps {
  suggestedMatchId: string
}

export function MatchActions({ suggestedMatchId }: MatchActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleAccept = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/staff/reconciliation/match/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggested_match_id: suggestedMatchId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept match')
      }

      toast.success(data.message || 'Match accepted')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept match')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/staff/reconciliation/match/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggested_match_id: suggestedMatchId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject match')
      }

      toast.success(data.message || 'Match rejected')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject match')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleAccept} disabled={isProcessing}>
        <Check className="h-4 w-4 mr-1" />
        Accept
      </Button>
      <Button variant="outline" size="sm" onClick={handleReject} disabled={isProcessing}>
        <X className="h-4 w-4 mr-1" />
        Reject
      </Button>
    </div>
  )
}

interface ResolveDiscrepancyDialogProps {
  bankTransactionId: string
}

export function ResolveDiscrepancyDialog({ bankTransactionId }: ResolveDiscrepancyDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [resolutionType, setResolutionType] = useState('')
  const [notes, setNotes] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const router = useRouter()

  const handleResolve = async () => {
    setIsResolving(true)
    try {
      const response = await fetch('/api/staff/reconciliation/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_transaction_id: bankTransactionId,
          resolution_type: resolutionType,
          notes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve discrepancy')
      }

      toast.success(data.message || 'Discrepancy resolved')
      setIsOpen(false)
      setResolutionType('')
      setNotes('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve discrepancy')
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Resolve
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Discrepancy</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Resolution Type</Label>
            <Select value={resolutionType} onValueChange={setResolutionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank Fee">Bank Fee</SelectItem>
                <SelectItem value="Wire Transfer Fee">Wire Transfer Fee</SelectItem>
                <SelectItem value="Currency Conversion">Currency Conversion</SelectItem>
                <SelectItem value="Partial Payment">Partial Payment</SelectItem>
                <SelectItem value="Amount Error">Amount Error</SelectItem>
                <SelectItem value="Duplicate Entry">Duplicate Entry</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain the resolution..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isResolving}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!resolutionType || isResolving}>
              {isResolving ? 'Resolving...' : 'Resolve'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
