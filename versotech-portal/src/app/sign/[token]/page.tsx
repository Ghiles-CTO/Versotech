'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, RotateCcw } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'

interface SignatureRequest {
  id: string
  signer_name: string
  signer_email: string
  document_type: string
  unsigned_pdf_url: string | null
  google_drive_url: string | null
  status: string
  expires_at: string
  verification_required?: boolean
  verification_completed_at?: string
}

export default function SignPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const sigCanvasRef = useRef<SignatureCanvas>(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signatureRequest, setSignatureRequest] = useState<SignatureRequest | null>(null)
  const [hasDrawn, setHasDrawn] = useState(false)

  const fetchSignatureRequest = useCallback(async () => {
    try {
      const response = await fetch(`/api/signature/${token}`)

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load signature request')
        setLoading(false)
        return
      }

      const data = await response.json()

      // Check if email verification is required and not yet completed
      if (data.verification_required && !data.verification_completed_at) {
        // Redirect to verification page
        router.replace(`/sign/${token}/verify`)
        return
      }

      setSignatureRequest(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching signature request:', err)
      setError('Failed to load signature request')
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => {
    if (!token) {
      setError('Invalid signature token')
      setLoading(false)
      return
    }

    fetchSignatureRequest()
  }, [token, fetchSignatureRequest])

  const handleDrawEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      setHasDrawn(true)
      setError(null)
    }
  }

  const handleClear = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear()
      setHasDrawn(false)
    }
  }

  const handleSubmit = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
      setError('Please provide your signature')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Get trimmed canvas (removes whitespace around signature)
      const trimmedCanvas = sigCanvasRef.current.getTrimmedCanvas()
      const signature_data_url = trimmedCanvas.toDataURL('image/png')

      // Submit signature
      const response = await fetch('/api/signature/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          signature_data_url
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to submit signature')
        setSubmitting(false)
        return
      }

      // Success - redirect to confirmation page
      router.push(`/sign/${token}/success`)
    } catch (err) {
      console.error('Error submitting signature:', err)
      setError('Failed to submit signature. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 to-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading signature request...</p>
        </div>
      </div>
    )
  }

  if (error && !signatureRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 to-background p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-red-600 dark:text-red-400 text-xl font-semibold mb-4">
            {error}
          </div>
          <p className="text-muted-foreground">
            This signature link may be invalid, expired, or already used.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 to-background p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Document Signature
          </h1>
          <p className="text-muted-foreground">
            Please review and sign the document below
          </p>
        </div>

        {/* Document Info Card */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Document Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Signer:</span>
              <span className="font-medium text-foreground">{signatureRequest?.signer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium text-foreground">{signatureRequest?.signer_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Document Type:</span>
              <span className="font-medium text-foreground uppercase">{signatureRequest?.document_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires:</span>
              <span className="font-medium text-foreground">
                {signatureRequest?.expires_at
                  ? new Date(signatureRequest.expires_at).toLocaleDateString(undefined, { timeZone: 'UTC' })
                  : 'N/A'}
              </span>
            </div>
          </div>

          {/* PDF Preview/Download */}
          {(signatureRequest?.unsigned_pdf_url || signatureRequest?.google_drive_url) && (
            <div className="mt-4 pt-4 border-t">
              <a
                href={signatureRequest.unsigned_pdf_url || signatureRequest.google_drive_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Document (PDF)
              </a>
            </div>
          )}
        </Card>

        {/* Signature Canvas Card */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Signature</h2>

          <div className="mb-4">
            {/* Note: Signature canvas must remain white background for proper signature capture and PDF embedding */}
            <div className="border-2 border-dashed border-border rounded-lg bg-white overflow-hidden">
              <SignatureCanvas
                ref={sigCanvasRef}
                canvasProps={{
                  className: 'w-full cursor-crosshair',
                  style: { width: '100%', height: '192px' }
                }}
                penColor="black"
                backgroundColor="white"
                onEnd={handleDrawEnd}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Draw your signature using your mouse, finger, or stylus
            </p>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={submitting || !hasDrawn}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={submitting || !hasDrawn}
            className="min-w-[200px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Sign and Submit'
            )}
          </Button>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            By signing this document, you agree that your electronic signature
            is legally binding and has the same effect as a handwritten signature.
          </p>
        </div>
      </div>
    </div>
  )
}
