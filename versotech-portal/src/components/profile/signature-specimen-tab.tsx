'use client'

import { useState, useRef, useEffect } from 'react'
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
import SignatureCanvas from 'react-signature-canvas'

type EntityType = 'investor' | 'commercial_partner' | 'partner' | 'introducer' | 'lawyer'

interface SignatureSpecimenTabProps {
  currentSignatureUrl?: string | null
  onSignatureUpdate?: (url: string | null) => void
  entityType?: EntityType
  entityId?: string
}

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
}: SignatureSpecimenTabProps) {
  const apiEndpoints = getSignatureApiEndpoints(entityType)
  const sigCanvasRef = useRef<SignatureCanvas>(null)

  const [hasDrawn, setHasDrawn] = useState(false)
  const [signatureUrl, setSignatureUrl] = useState<string | null>(currentSignatureUrl || null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw')
  const [error, setError] = useState<string | null>(null)

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

  const handleDrawEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      setHasDrawn(true)
      setError(null)
    }
  }

  const clearCanvas = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear()
      setHasDrawn(false)
    }
  }

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
        if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
          setError('Please draw your signature first')
          setIsSaving(false)
          return
        }

        // Get trimmed canvas data URL (removes whitespace around signature)
        const trimmedCanvas = sigCanvasRef.current.getTrimmedCanvas()
        const dataUrl = trimmedCanvas.toDataURL('image/png')

        // Convert data URL to blob
        const response = await fetch(dataUrl)
        blob = await response.blob()
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

      const apiResponse = await fetch(apiEndpoints.post, {
        method: 'POST',
        body: formData,
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || 'Failed to save signature')
      }

      const data = await apiResponse.json()
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
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
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
              <div className="border-2 border-dashed rounded-lg bg-white overflow-hidden">
                <SignatureCanvas
                  ref={sigCanvasRef}
                  canvasProps={{
                    className: 'w-full h-40 cursor-crosshair',
                    style: { width: '100%', height: '160px' }
                  }}
                  penColor="black"
                  backgroundColor="white"
                  onEnd={handleDrawEnd}
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
                      "bg-muted/50 hover:bg-muted transition-colors"
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

      <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <PenTool className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">About Signature Specimens</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
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
