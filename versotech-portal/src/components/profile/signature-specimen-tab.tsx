'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  PenTool,
  Upload,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Entity type determines which API endpoints to use for signature operations
type EntityType = 'investor' | 'commercial_partner' | 'partner' | 'introducer' | 'lawyer'

interface SignatureSpecimenTabProps {
  currentSignatureUrl?: string | null
  onSignatureUpdate?: (url: string | null) => void
  entityType?: EntityType
  entityId?: string
}

// API endpoint mapping for each entity type
function getSignatureApiEndpoints(entityType: EntityType = 'investor') {
  switch (entityType) {
    case 'commercial_partner':
      return {
        get: '/api/commercial-partners/me/signature',
        post: '/api/commercial-partners/me/upload-signature',
        delete: '/api/commercial-partners/me/signature',
      }
    case 'partner':
      return {
        get: '/api/partners/me/signature',
        post: '/api/partners/me/upload-signature',
        delete: '/api/partners/me/signature',
      }
    case 'introducer':
      return {
        get: '/api/introducers/me/signature',
        post: '/api/introducers/me/upload-signature',
        delete: '/api/introducers/me/signature',
      }
    case 'lawyer':
      return {
        get: '/api/lawyers/me/signature',
        post: '/api/lawyers/me/upload-signature',
        delete: '/api/lawyers/me/signature',
      }
    case 'investor':
    default:
      return {
        get: '/api/signature-specimen',
        post: '/api/signature-specimen',
        delete: '/api/signature-specimen',
      }
  }
}

export function SignatureSpecimenTab({
  currentSignatureUrl,
  onSignatureUpdate,
  entityType = 'investor',
  entityId,
}: SignatureSpecimenTabProps) {
  // Get the appropriate API endpoints for this entity type
  const apiEndpoints = getSignatureApiEndpoints(entityType)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  const [hasDrawn, setHasDrawn] = useState(false)
  const [signatureUrl, setSignatureUrl] = useState<string | null>(currentSignatureUrl || null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw')
  const [error, setError] = useState<string | null>(null)
  const [canvasReady, setCanvasReady] = useState(false)

  // Load existing signature on mount
  useEffect(() => {
    loadExistingSignature()
  }, [])

  const loadExistingSignature = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(apiEndpoints.get)
      if (response.ok) {
        const data = await response.json()
        if (data.signature_url) {
          setSignatureUrl(data.signature_url)
        }
      }
    } catch (err) {
      console.error('Error loading signature:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize canvas with proper dimensions
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    // Set canvas size to match container exactly (1:1 pixel ratio for simplicity)
    // This avoids DPR scaling issues that cause coordinate misalignment
    canvas.width = rect.width
    canvas.height = rect.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fill with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Set drawing styles
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    setCanvasReady(true)
    setHasDrawn(false)
  }, [])

  // Setup canvas when draw tab is active
  useEffect(() => {
    if (activeTab === 'draw') {
      // Use requestAnimationFrame to ensure DOM is ready
      const timer = requestAnimationFrame(() => {
        initializeCanvas()
      })
      return () => cancelAnimationFrame(timer)
    }
  }, [activeTab, initializeCanvas])

  // Handle resize with ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      if (activeTab === 'draw') {
        initializeCanvas()
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [activeTab, initializeCanvas])

  // Get coordinates relative to canvas - simple and reliable
  const getCanvasCoordinates = useCallback((e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()

    let clientX: number
    let clientY: number

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ('clientX' in e) {
      clientX = e.clientX
      clientY = e.clientY
    } else {
      return null
    }

    // Calculate position relative to canvas, accounting for any CSS scaling
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }, [])

  // Drawing functions using native events for better reliability
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    // Capture pointer for smoother drawing
    canvas.setPointerCapture(e.pointerId)

    const coords = getCanvasCoordinates(e.nativeEvent as unknown as MouseEvent)
    if (!coords) return

    isDrawingRef.current = true
    lastPointRef.current = coords
    setHasDrawn(true)
    setError(null)
  }, [getCanvasCoordinates])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return
    e.preventDefault()

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const coords = getCanvasCoordinates(e.nativeEvent as unknown as MouseEvent)
    if (!coords) return

    // Draw line segment
    ctx.beginPath()
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()

    lastPointRef.current = coords
  }, [getCanvasCoordinates])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId)
    }
    isDrawingRef.current = false
    lastPointRef.current = null
  }, [])

  const handlePointerLeave = useCallback(() => {
    isDrawingRef.current = false
    lastPointRef.current = null
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear and fill with white
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Restore drawing styles
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    setHasDrawn(false)
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Please upload a PNG, JPEG, or WebP image')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB')
      return
    }

    setUploadedFile(file)
    setError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearUpload = () => {
    setUploadedFile(null)
    setUploadPreview(null)
  }

  const saveSignature = async () => {
    setIsSaving(true)
    setError(null)

    try {
      let blob: Blob

      if (activeTab === 'draw') {
        const canvas = canvasRef.current
        if (!canvas || !hasDrawn) {
          setError('Please draw your signature first')
          setIsSaving(false)
          return
        }

        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b)
            else reject(new Error('Failed to convert canvas to blob'))
          }, 'image/png')
        })
      } else {
        if (!uploadedFile) {
          setError('Please upload an image first')
          setIsSaving(false)
          return
        }
        blob = uploadedFile
      }

      const formData = new FormData()
      formData.append('signature', blob, 'signature.png')

      const response = await fetch(apiEndpoints.post, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save signature')
      }

      const data = await response.json()
      setSignatureUrl(data.signature_url)
      onSignatureUpdate?.(data.signature_url)

      if (activeTab === 'draw') {
        clearCanvas()
      } else {
        clearUpload()
      }

      toast.success('Signature saved successfully')
    } catch (err) {
      console.error('Error saving signature:', err)
      setError(err instanceof Error ? err.message : 'Failed to save signature')
      toast.error('Failed to save signature')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteSignature = async () => {
    if (!signatureUrl) return

    setIsSaving(true)
    try {
      const response = await fetch(apiEndpoints.delete, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete signature')
      }

      setSignatureUrl(null)
      onSignatureUpdate?.(null)
      toast.success('Signature removed')
    } catch (err) {
      console.error('Error deleting signature:', err)
      toast.error('Failed to remove signature')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Signature Preview */}
      {signatureUrl && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Current Signature
                </CardTitle>
                <CardDescription>
                  Your signature specimen on file
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteSignature}
                disabled={isSaving}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Remove
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white flex items-center justify-center">
              <img
                src={signatureUrl}
                alt="Your signature"
                className="max-h-24 object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signature Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {signatureUrl ? 'Update Signature' : 'Add Signature'}
          </CardTitle>
          <CardDescription>
            Draw your signature or upload an image. This will be used for document signing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'draw' | 'upload')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="draw" className="gap-2">
                <PenTool className="h-4 w-4" />
                Draw
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draw" className="mt-4 space-y-4">
              <div
                ref={containerRef}
                className="border-2 border-dashed rounded-lg bg-white overflow-hidden"
                style={{ height: '160px' }}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full cursor-crosshair"
                  style={{ touchAction: 'none' }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerLeave}
                  onPointerCancel={handlePointerUp}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Draw your signature using your mouse or touch screen
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearCanvas}
                  disabled={!hasDrawn}
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  onClick={saveSignature}
                  disabled={!hasDrawn || isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Signature
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="mt-4 space-y-4">
              {uploadPreview ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-white flex items-center justify-center">
                    <img
                      src={uploadPreview}
                      alt="Signature preview"
                      className="max-h-32 object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={clearUpload}
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Choose Different
                    </Button>
                    <Button
                      onClick={saveSignature}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Signature
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Label
                    htmlFor="signature-upload"
                    className={cn(
                      "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer",
                      "bg-gray-50 hover:bg-gray-100 transition-colors"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPEG or WebP (max 2MB)
                      </p>
                    </div>
                    <Input
                      id="signature-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </Label>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <PenTool className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">About Signature Specimens</p>
              <p className="text-blue-700 mt-1">
                Your signature specimen will be used for digitally signing documents such as
                subscription agreements, NDAs, and introducer agreements. Make sure your
                signature is clear and consistent with your legal documents.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
