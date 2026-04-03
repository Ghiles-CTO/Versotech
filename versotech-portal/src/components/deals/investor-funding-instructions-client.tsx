'use client'

import { useEffect, useState } from 'react'
import { Banknote, Download, Eye, Loader2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

import { downloadFileFromUrl } from '@/lib/browser-download'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FundingInstructionsSummary = {
  subscription_id: string
  cycle_id: string | null
  is_available: boolean
  auto_open: boolean
  currency: string
  amount_due: number
  amount_original: number
  amount_received: number
  due_at: string | null
  bank_details: {
    bank_name: string
    bank_address: string
    account_holder: string
    escrow_agent: string
    law_firm_address: string
    iban: string
    bic: string
    wire_currency_code: string
    wire_currency_long: string
    wire_description: string
  }
  reference: string
  contact_email: string
  funding_document_id: string | null
  funding_document_name: string | null
  signed_pack_path: string | null
}

function formatCurrency(amount: number | null, currency: string = 'USD'): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value: string | null): string {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

export function InvestorFundingInstructionsClient({
  fundingInstructions,
  autoOpen,
}: {
  fundingInstructions: FundingInstructionsSummary | null
  autoOpen: boolean
}) {
  const [showFundingDialog, setShowFundingDialog] = useState(false)
  const [showFundingShareDialog, setShowFundingShareDialog] = useState(false)
  const [fundingShareEmail, setFundingShareEmail] = useState('')
  const [fundingShareLoading, setFundingShareLoading] = useState(false)

  useEffect(() => {
    if (fundingInstructions?.is_available && autoOpen) {
      setShowFundingDialog(true)
    }
  }, [autoOpen, fundingInstructions?.is_available])

  if (!fundingInstructions?.is_available) {
    return null
  }

  const handleDownloadFundingInstructions = async () => {
    if (!fundingInstructions.subscription_id) {
      toast.error('Funding PDF is not available yet.')
      return
    }

    try {
      const fileName = fundingInstructions.funding_document_name || 'Funding Instructions.pdf'
      await downloadFileFromUrl(
        `/api/investors/me/subscriptions/${fundingInstructions.subscription_id}/funding-download`,
        fileName
      )
    } catch (error) {
      console.error('Failed to download funding instructions:', error)
      toast.error('Failed to download funding instructions.')
    }
  }

  const handleViewSignedPack = async () => {
    if (!fundingInstructions.signed_pack_path) return

    try {
      const buckets = ['signatures', 'deal-documents']
      for (const bucket of buckets) {
        const response = await fetch(
          `/api/storage/signed-url?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(fundingInstructions.signed_pack_path)}`
        )
        const data = await response.json()
        if (response.ok && data.signedUrl) {
          window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
          return
        }
      }

      throw new Error('Unable to open the signed subscription pack.')
    } catch (error) {
      console.error('Failed to open signed subscription pack:', error)
      toast.error(error instanceof Error ? error.message : 'Unable to open the signed subscription pack.')
    }
  }

  const handleSubmitFundingShare = async () => {
    if (!fundingInstructions.subscription_id) {
      toast.error('Funding instructions are not available yet.')
      return
    }

    if (!fundingShareEmail.trim()) {
      toast.error('Enter an email address first.')
      return
    }

    try {
      setFundingShareLoading(true)
      const response = await fetch(
        `/api/investors/me/subscriptions/${fundingInstructions.subscription_id}/funding-share`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientEmail: fundingShareEmail.trim(),
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to share funding instructions.')
      }

      toast.success('Funding instructions shared by email.')
      setShowFundingShareDialog(false)
      setFundingShareEmail('')
    } catch (error) {
      console.error('Failed to share funding instructions:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to share funding instructions.')
    } finally {
      setFundingShareLoading(false)
    }
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-emerald-50/40 px-4 py-3.5 dark:border-emerald-800/50 dark:from-emerald-950/30 dark:to-emerald-950/10">
        <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 dark:bg-emerald-400" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Funding instructions ready
              </div>
              <div className="mt-0.5 text-sm text-emerald-700/80 dark:text-emerald-300/70">
                <span className="font-medium text-emerald-800 dark:text-emerald-200">{formatCurrency(fundingInstructions.amount_due, fundingInstructions.currency)}</span> due
                {fundingInstructions.due_at ? ` by ${formatDate(fundingInstructions.due_at)}` : ''}
              </div>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            onClick={() => setShowFundingDialog(true)}
          >
            <Eye className="mr-2 h-3.5 w-3.5" />
            View Instructions
          </Button>
        </div>
      </div>

      <Dialog open={showFundingDialog} onOpenChange={setShowFundingDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Funding Instructions
            </DialogTitle>
            <DialogDescription>
              Review the capital call summary and use the actions below to wire the signed amount.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-50/80 to-background p-4 dark:from-emerald-950/20">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Amount Due
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(fundingInstructions.amount_due, fundingInstructions.currency)}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Total amount to wire {formatCurrency(fundingInstructions.amount_original, fundingInstructions.currency)}
                  {fundingInstructions.amount_received > 0
                    ? ` · Received ${formatCurrency(fundingInstructions.amount_received, fundingInstructions.currency)}`
                    : ''}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl border bg-muted/20 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Funding Deadline
                </div>
                <div className="mt-2 text-xl font-semibold">
                  {formatDate(fundingInstructions.due_at)}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {fundingInstructions.due_at && new Date(fundingInstructions.due_at) < new Date()
                    ? 'This deadline has passed. Please contact the team if the transfer is still pending.'
                    : 'Please use the exact reference below so the funds can be matched correctly.'}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border">
              <div className="border-b bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bank Details
              </div>
              <div className="divide-y">
                {[
                  ['Bank', fundingInstructions.bank_details.bank_name],
                  ['Bank address', fundingInstructions.bank_details.bank_address],
                  ['Account holder', fundingInstructions.bank_details.account_holder],
                  ['Escrow agent', fundingInstructions.bank_details.escrow_agent],
                  ['Law firm address', fundingInstructions.bank_details.law_firm_address],
                  ['IBAN', fundingInstructions.bank_details.iban],
                  ['BIC / SWIFT', fundingInstructions.bank_details.bic],
                  ['Reference', fundingInstructions.reference],
                  ['Wire description', fundingInstructions.bank_details.wire_description],
                  ['Contact email', fundingInstructions.contact_email],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value], idx) => (
                    <div key={label} className={`grid gap-1 px-4 py-2.5 md:grid-cols-[160px,1fr] ${idx % 2 === 0 ? 'bg-muted/10' : ''}`}>
                      <div className="text-xs font-medium text-muted-foreground">{label}</div>
                      <div className="text-sm font-medium break-words">{value}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleDownloadFundingInstructions}>
                <Download className="mr-2 h-3.5 w-3.5" />
                Download PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFundingShareEmail('')
                  setShowFundingShareDialog(true)
                }}
              >
                <MessageSquare className="mr-2 h-3.5 w-3.5" />
                Share by Email
              </Button>
              {fundingInstructions.signed_pack_path ? (
                <Button type="button" variant="outline" size="sm" onClick={handleViewSignedPack}>
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  View Signed Pack
                </Button>
              ) : null}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowFundingDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFundingShareDialog} onOpenChange={setShowFundingShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Funding Instructions</DialogTitle>
            <DialogDescription>
              Enter the email address that should receive the funding PDF and wire details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="funding-share-email">Recipient email</Label>
            <Input
              id="funding-share-email"
              type="email"
              autoFocus
              value={fundingShareEmail}
              onChange={(event) => setFundingShareEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFundingShareDialog(false)}
              disabled={fundingShareLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitFundingShare}
              disabled={fundingShareLoading || !fundingShareEmail.trim()}
            >
              {fundingShareLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Email'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
