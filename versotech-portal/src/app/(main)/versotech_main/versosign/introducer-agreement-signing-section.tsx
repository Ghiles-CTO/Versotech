'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileSignature,
  PenLine,
  Loader2,
  Building2,
  Calendar,
  Percent,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SignatureCanvasWidget } from '@/components/signature/signature-canvas-widget'
import { InlinePdfViewer } from '@/components/signature/inline-pdf-viewer'

type IntroducerAgreementForSigning = {
  id: string
  status: string
  default_commission_bps: number | null
  introducer: {
    id: string
    legal_name: string
    email: string | null
  }
  ceo_signature_request_id: string | null
  introducer_signature_request_id: string | null
  pdf_url: string | null
  created_at: string
}

interface IntroducerAgreementSigningSectionProps {
  agreements: IntroducerAgreementForSigning[]
  isStaff: boolean
}

export function IntroducerAgreementSigningSection({
  agreements,
  isStaff,
}: IntroducerAgreementSigningSectionProps) {
  const router = useRouter()
  const [signingAgreementId, setSigningAgreementId] = useState<string | null>(null)
  const [signingMode, setSigningMode] = useState<{
    active: boolean
    agreement: IntroducerAgreementForSigning | null
    token: string | null
    pdfUrl: string | null
  }>({ active: false, agreement: null, token: null, pdfUrl: null })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatCommission = (bps: number | null) => {
    if (bps === null) return 'N/A'
    return `${(bps / 100).toFixed(2)}%`
  }

  const handleInitiateSign = async (agreement: IntroducerAgreementForSigning) => {
    setSigningAgreementId(agreement.id)

    try {
      // Create signature request via API
      const response = await fetch(`/api/introducer-agreements/${agreement.id}/sign`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to initiate signing')
      }

      const result = await response.json()

      if (result.signing_url) {
        // Enter signing mode with the token
        const token = result.signing_url.split('/sign/')[1]
        setSigningMode({
          active: true,
          agreement,
          token,
          pdfUrl: result.pdf_url || agreement.pdf_url,
        })
      } else {
        toast.error('No signing URL returned')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to initiate signing')
    } finally {
      setSigningAgreementId(null)
    }
  }

  const handleSignatureComplete = async (signatureDataUrl: string) => {
    if (!signingMode.token || !signingMode.agreement) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/signature/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: signingMode.token,
          signature_data_url: signatureDataUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete signature')
      }

      toast.success('Agreement signed successfully!')
      setSigningMode({ active: false, agreement: null, token: null, pdfUrl: null })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete signature')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelSigning = () => {
    setSigningMode({ active: false, agreement: null, token: null, pdfUrl: null })
  }

  // If in signing mode, show the signing interface
  if (signingMode.active && signingMode.agreement) {
    return (
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
        <CardHeader className="border-b border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
                <PenLine className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Sign Introducer Agreement</CardTitle>
                <CardDescription>
                  Agreement with {signingMode.agreement.introducer?.legal_name}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" onClick={handleCancelSigning} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PDF Viewer */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Document Preview</h3>
              {signingMode.pdfUrl ? (
                <div className="border rounded-lg overflow-hidden h-[500px]">
                  <InlinePdfViewer
                    pdfUrl={signingMode.pdfUrl}
                    documentName={`Introducer Agreement - ${signingMode.agreement.introducer?.legal_name}`}
                  />
                </div>
              ) : (
                <div className="border rounded-lg h-[500px] flex items-center justify-center bg-muted/50">
                  <p className="text-muted-foreground text-sm">PDF not available</p>
                </div>
              )}
            </div>

            {/* Signature Canvas */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Your Signature</h3>
              <SignatureCanvasWidget
                onSignatureCapture={handleSignatureComplete}
                signerName={signingMode.agreement.introducer?.legal_name || 'Introducer'}
                signerEmail={signingMode.agreement.introducer?.email || ''}
                isSubmitting={isSubmitting}
              />
              <p className="text-xs text-muted-foreground text-center">
                By signing, you agree to the terms of this introducer fee agreement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-500/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
            <FileSignature className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-lg">
              {isStaff ? 'Introducer Agreements Awaiting Your Signature' : 'Your Pending Agreement Signatures'}
            </CardTitle>
            <CardDescription>
              {isStaff
                ? 'These agreements have been approved and are ready for CEO signature'
                : 'These agreements are ready for your countersignature'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Introducer</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.map((agreement) => (
                <TableRow key={agreement.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{agreement.introducer?.legal_name}</p>
                        <p className="text-sm text-muted-foreground">{agreement.introducer?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{formatCommission(agreement.default_commission_bps)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(agreement.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/versotech_main/introducer-agreements/${agreement.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleInitiateSign(agreement)}
                        disabled={signingAgreementId === agreement.id}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white"
                      >
                        {signingAgreementId === agreement.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <PenLine className="h-4 w-4 mr-1" />
                            Sign Now
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
