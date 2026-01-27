'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, RotateCcw } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'

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
  const sigCanvasRef = useRef<SignatureCanvas>(null)
  const [hasDrawn, setHasDrawn] = useState(false)

  const handleDrawEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      setHasDrawn(true)
    }
  }

  const handleClear = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear()
      setHasDrawn(false)
    }
  }

  const handleSubmit = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) return

    // Get trimmed canvas (removes whitespace around signature)
    const trimmedCanvas = sigCanvasRef.current.getTrimmedCanvas()
    const dataUrl = trimmedCanvas.toDataURL('image/png')
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
          <div className="border-2 border-border rounded-lg bg-white dark:bg-zinc-100 overflow-hidden">
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
            <RotateCcw className="h-4 w-4 mr-2" />
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
