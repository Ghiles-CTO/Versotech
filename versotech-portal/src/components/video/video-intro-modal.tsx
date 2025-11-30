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

  useEffect(() => {
    if (open) {
      setVideoEnded(false)
      setIsLoading(true)
      setHasError(false)
    }
  }, [open])

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
        className="!max-w-[95vw] !w-[1600px] !h-[90vh] !max-h-[90vh] p-0 overflow-hidden bg-slate-900 border-slate-700"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <DialogHeader className="p-6 pb-4 border-b border-slate-700 bg-slate-900 shrink-0">
            <DialogTitle className="text-xl font-semibold text-white">
              Welcome to VERSO
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-300">
              Please watch this short introduction to get started with the platform.
            </DialogDescription>
          </DialogHeader>

          {/* Video Container - overflow-hidden and absolute video */}
          <div className="relative flex-1 min-h-0 overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
              </div>
            )}

            {hasError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white z-10">
                <div className="text-center p-8">
                  <p className="text-lg font-medium mb-2">Unable to load video</p>
                  <p className="text-sm text-slate-400 mb-4">
                    Please check your connection and try again.
                  </p>
                  <Button variant="outline" onClick={() => { setHasError(false); setIsLoading(true); videoRef.current?.load() }}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-contain bg-slate-900"
                src={videoUrl}
                onEnded={() => setVideoEnded(true)}
                onLoadedData={() => setIsLoading(false)}
                onError={() => { setIsLoading(false); setHasError(true) }}
                autoPlay
                playsInline
                controls
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
              />
            )}
          </div>

          {/* Footer - ALWAYS visible */}
          <div className="p-6 pt-4 border-t border-slate-700 bg-slate-900 flex justify-end shrink-0">
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
