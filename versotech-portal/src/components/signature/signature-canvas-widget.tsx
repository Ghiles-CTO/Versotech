'use client'

import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface SignatureCanvasWidgetProps {
  onSignatureCapture: (dataUrl: string) => Promise<void>
  signerName: string
  signerEmail: string
  isSubmitting?: boolean
}

export function SignatureCanvasWidget({
  onSignatureCapture,
  signerName,
  signerEmail,
  isSubmitting = false
}: SignatureCanvasWidgetProps) {
  const canvasRef = useRef<SignatureCanvas>(null)
  const [hasDrawn, setHasDrawn] = useState(false)

  const handleClear = () => {
    canvasRef.current?.clear()
    setHasDrawn(false)
  }

  const handleSubmit = async () => {
    if (!canvasRef.current || !hasDrawn) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    await onSignatureCapture(dataUrl)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Sign Document</CardTitle>
        <CardDescription>
          Draw your signature below to execute this document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Signing as:</p>
          <div className="rounded-lg bg-muted p-3">
            <p className="font-semibold">{signerName}</p>
            <p className="text-sm text-muted-foreground">{signerEmail}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Your Signature</p>
          <div className="border-2 border-gray-300 rounded-lg bg-white">
            <SignatureCanvas
              ref={canvasRef}
              canvasProps={{
                className: 'w-full h-48 cursor-crosshair touch-none',
                style: { touchAction: 'none' }
              }}
              onBegin={() => setHasDrawn(true)}
              backgroundColor="rgb(255, 255, 255)"
              penColor="rgb(0, 0, 0)"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Draw your signature using your mouse or touchscreen
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!hasDrawn || isSubmitting}
            className="flex-1"
          >
            Clear
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasDrawn || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Signature'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
