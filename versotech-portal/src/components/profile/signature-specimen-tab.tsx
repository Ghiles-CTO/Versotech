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

interface SignatureSpecimenTabProps {
  currentSignatureUrl?: string | null
  onSignatureUpdate?: (url: string | null) => void
}

export function SignatureSpecimenTab({
  currentSignatureUrl,
  onSignatureUpdate
}: SignatureSpecimenTabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [signatureUrl, setSignatureUrl] = useState<string | null>(currentSignatureUrl || null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw')
  const [error, setError] = useState<string | null>(null)

  // Load existing signature on mount
  useEffect(() => {
    loadExistingSignature()
  }, [])

  const loadExistingSignature = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/signature-specimen')
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

  // Get the appropriate stroke color based on theme
  const getStrokeColor = useCallback(() => {
    // Always use a dark color for signatures - signatures should be black/dark on white
    return '#000000'
  }, [])

  // Canvas initialization function
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Get the display size (CSS pixels)
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return // Not visible yet

    const dpr = window.devicePixelRatio || 1

    // Set the canvas internal size (scaled for high-DPI)
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    // Scale all drawing operations by the dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Fill with white background FIRST (signatures are always on white)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Set drawing styles - use black for maximum visibility
    ctx.strokeStyle = getStrokeColor()
    ctx.lineWidth = 2.5  // Slightly thicker for better visibility
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [getStrokeColor])

  // Canvas setup on tab change
  useEffect(() => {
    if (activeTab === 'draw') {
      // Small delay to ensure canvas is mounted and has proper dimensions
      const timer = setTimeout(initializeCanvas, 50)
      return () => clearTimeout(timer)
    }
  }, [activeTab, initializeCanvas])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (activeTab === 'draw') {
        initializeCanvas()
        setHasDrawn(false) // Reset drawing state on resize
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeTab, initializeCanvas])

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    // For mouse events, use nativeEvent.offsetX/Y which is more reliable
    if ('nativeEvent' in e && 'offsetX' in e.nativeEvent) {
      const mouseEvent = e.nativeEvent as MouseEvent
      return {
        x: mouseEvent.offsetX,
        y: mouseEvent.offsetY
      }
    }

    // For touch events, calculate from clientX/Y
    if ('touches' in e && e.touches.length > 0) {
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }
    }

    // Fallback for other mouse events
    const rect = canvas.getBoundingClientRect()
    if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    return null
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const coords = getCoordinates(e)
    if (!coords) return

    // Store the starting point for segment drawing
    lastPointRef.current = coords
    setIsDrawing(true)
    setHasDrawn(true)
    setError(null)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPointRef.current) return
    e.preventDefault()

    const coords = getCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Ensure transform and styles are set for this draw operation
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Use pure black for maximum contrast
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Draw a single segment from last point to current point
    ctx.beginPath()
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()

    // Update last point for next segment
    lastPointRef.current = coords
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    lastPointRef.current = null
  }

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Get the CSS dimensions for the fill area
    const rect = canvas.getBoundingClientRect()

    // Re-apply the transform (it may have been reset)
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Clear and fill with white (signatures are always on white background)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Restore drawing styles with black stroke for visibility
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    setHasDrawn(false)
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Please upload a PNG, JPEG, or WebP image')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB')
      return
    }

    setUploadedFile(file)
    setError(null)

    // Create preview
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
        // Get canvas data
        const canvas = canvasRef.current
        if (!canvas || !hasDrawn) {
          setError('Please draw your signature first')
          setIsSaving(false)
          return
        }

        // Convert canvas to blob
        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b)
            else reject(new Error('Failed to convert canvas to blob'))
          }, 'image/png')
        })
      } else {
        // Use uploaded file
        if (!uploadedFile) {
          setError('Please upload an image first')
          setIsSaving(false)
          return
        }
        blob = uploadedFile
      }

      // Upload to API
      const formData = new FormData()
      formData.append('signature', blob, 'signature.png')

      const response = await fetch('/api/signature-specimen', {
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

      // Clear the inputs after successful save
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
      const response = await fetch('/api/signature-specimen', {
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
              <div className="border-2 border-dashed rounded-lg p-1 bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full h-40 cursor-crosshair touch-none rounded"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  onTouchCancel={stopDrawing}
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
