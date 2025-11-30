'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface VideoIntroModalProps {
  open: boolean
  videoUrl: string
  onComplete: () => Promise<void>
}

export function VideoIntroModal({ open, videoUrl, onComplete }: VideoIntroModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setVideoEnded(false)
      setIsLoading(true)
      setHasError(false)
    }
  }, [open])

  const handleVideoEnded = () => {
    setVideoEnded(true)
  }

  const handleVideoLoaded = () => {
    setIsLoading(false)
  }

  const handleVideoError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleRetry = () => {
    setHasError(false)
    setIsLoading(true)
    videoRef.current?.load()
  }

  const handleContinue = async () => {
    setIsSubmitting(true)
    try {
      await onComplete()
    } catch (error) {
      console.error('Error marking video as seen:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-[90vw] w-[1280px] max-h-[90vh] p-0 overflow-hidden"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Welcome to VERSO
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Please watch this short introduction to get started with the platform.
            </DialogDescription>
          </DialogHeader>

          {/* Video Container - 16:9 aspect ratio */}
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
              </div>
            )}

            {hasError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white">
                <div className="text-center p-8">
                  <p className="text-lg font-medium mb-2">Unable to load video</p>
                  <p className="text-sm text-slate-400 mb-4">
                    Please check your connection and try again.
                  </p>
                  <Button variant="outline" onClick={handleRetry}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full object-contain bg-slate-900"
                src={videoUrl}
                onEnded={handleVideoEnded}
                onLoadedData={handleVideoLoaded}
                onError={handleVideoError}
                autoPlay
                playsInline
                controls
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
              />
            )}
          </div>

          <div className="p-6 pt-4 border-t flex justify-end">
            <Button
              size="lg"
              disabled={!videoEnded || isSubmitting}
              onClick={handleContinue}
              className="min-w-[160px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Please wait...
                </>
              ) : videoEnded ? (
                'Get Started'
              ) : (
                'Watch to continue...'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
