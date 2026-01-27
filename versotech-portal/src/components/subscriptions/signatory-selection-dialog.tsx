'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { UserCheck, Users, Loader2, AlertCircle, Send, Mail, Briefcase, Building2, Check } from 'lucide-react'

interface Signatory {
  id: string
  full_name: string
  email: string
  role: string
  role_title?: string
  is_signatory: boolean
  is_primary: boolean
}

interface Arranger {
  id: string
  company_name: string
  legal_name: string
}

interface DocumentCountersigner {
  countersigner_type: 'ceo' | 'arranger' | null
  countersigner_name: string | null
  countersigner_title: string | null
}

interface SignatorySelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriptionId: string
  documentId: string
  documentName: string
  onConfirm: (signatoryIds: string[], countersignerType?: 'ceo' | 'arranger', arrangerId?: string) => Promise<void>
}

export function SignatorySelectionDialog({
  open,
  onOpenChange,
  subscriptionId,
  documentId,
  documentName,
  onConfirm
}: SignatorySelectionDialogProps) {
  const [signatories, setSignatories] = useState<Signatory[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [investorType, setInvestorType] = useState<string>('individual')
  const [arranger, setArranger] = useState<Arranger | null>(null)
  const [countersignerType, setCountersignerType] = useState<'ceo' | 'arranger'>('ceo')
  const [documentCountersigner, setDocumentCountersigner] = useState<DocumentCountersigner | null>(null)

  useEffect(() => {
    if (open) {
      fetchSignatories()
    }
  }, [open, subscriptionId])

  const fetchSignatories = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch signatories and document countersigner in parallel
      const [signatoriesResponse, documentResponse] = await Promise.all([
        fetch(`/api/subscriptions/${subscriptionId}/signatories`),
        fetch(`/api/documents/${documentId}`)
      ])

      if (!signatoriesResponse.ok) {
        throw new Error('Failed to fetch signatories')
      }
      const data = await signatoriesResponse.json()

      // Get all designated signatories (is_signatory = true or is_primary for individuals)
      const allSignatories = data.signatories || []
      const designatedSignatories = allSignatories.filter((s: Signatory) =>
        s.is_signatory || s.is_primary
      )

      setSignatories(designatedSignatories)
      setInvestorType(data.investor_type || 'individual')

      // Check if deal has an arranger - auto-select arranger as countersigner
      if (data.arranger) {
        setArranger(data.arranger)
        setCountersignerType('arranger') // Auto-select arranger when present
      } else {
        setArranger(null)
        setCountersignerType('ceo') // Default to CEO when no arranger
      }

      // Check if document already has countersigner info stored
      if (documentResponse.ok) {
        const docData = await documentResponse.json()
        if (docData.countersigner_type) {
          setDocumentCountersigner({
            countersigner_type: docData.countersigner_type,
            countersigner_name: docData.countersigner_name,
            countersigner_title: docData.countersigner_title
          })
          // Use the stored countersigner type
          setCountersignerType(docData.countersigner_type)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (signatories.length === 0) {
      setError('No signatories found for this investor')
      return
    }

    setSending(true)
    try {
      // Send to all designated signatories
      const signatoryIds = signatories.map(s => s.id)
      await onConfirm(
        signatoryIds,
        countersignerType,
        countersignerType === 'arranger' && arranger ? arranger.id : undefined
      )
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send for signature')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <UserCheck className="h-5 w-5 text-emerald-500" />
            Confirm Signatories
          </DialogTitle>
          <DialogDescription>
            The following signatories will receive signature requests for "{documentName}"
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : signatories.length === 0 ? (
            <Alert className="bg-amber-500/10 border-amber-500/30">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-700 dark:text-amber-200">
                No designated signatories found for this investor. Please add signatories to the investor entity first.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Signatory Count Badge */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                  <Users className="h-3 w-3 mr-1" />
                  {signatories.length} {signatories.length === 1 ? 'Signatory' : 'Signatories'}
                </Badge>
              </div>

              {/* Signatory List (Read-only) */}
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {signatories.map((signatory) => (
                  <div
                    key={signatory.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10"
                  >
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">
                          {signatory.full_name}
                        </span>
                        {signatory.is_primary && (
                          <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400 bg-blue-500/10">
                            Primary
                          </Badge>
                        )}
                        {signatory.is_signatory && !signatory.is_primary && (
                          <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                            Signatory
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground truncate">
                          {signatory.email || 'No email'}
                        </span>
                      </div>
                      {signatory.role_title && (
                        <span className="text-xs text-muted-foreground capitalize block mt-1">
                          {signatory.role_title}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* VERSO Signatories Section - Issuer + Arranger */}
              <div className="space-y-3 pt-4 border-t border-border">
                <Label className="text-sm font-medium text-foreground">
                  VERSO Signatories (Added Automatically)
                </Label>

                {/* Issuer - CEO always signs as party_b */}
                <div className="flex items-start gap-3 p-3 rounded-lg border border-blue-500/30 bg-blue-500/10">
                  <Check className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-400" />
                      <span className="font-medium text-foreground">VERSO Capital 2 GP SARL</span>
                      <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400 bg-blue-500/10">
                        Issuer
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Signed by CEO on behalf of the Issuer
                    </p>
                  </div>
                </div>

                {/* Arranger - signs as party_c if present */}
                {arranger && (
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-emerald-400" />
                        <span className="font-medium text-foreground">
                          {arranger.company_name || arranger.legal_name}
                        </span>
                        <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                          Arranger
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Signed as Attorney under Clause 6
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Note */}
              <Alert className="bg-blue-500/10 border-blue-500/30">
                <Users className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700 dark:text-blue-200 text-sm">
                  {signatories.length + 1 + (arranger ? 1 : 0)} signature requests will be created. The document will be marked complete after all parties have signed.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || sending || signatories.length === 0}
            className="gap-2 bg-emerald-500 hover:bg-emerald-600"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send for Signature
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
