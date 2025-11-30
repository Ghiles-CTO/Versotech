'use client'

import { useState } from 'react'
import { VideoIntroModal } from '@/components/video/video-intro-modal'

interface VideoIntroWrapperProps {
  children: React.ReactNode
  showIntroVideo: boolean
  videoUrl: string
}

export function VideoIntroWrapper({
  children,
  showIntroVideo,
  videoUrl
}: VideoIntroWrapperProps) {
  const [showModal, setShowModal] = useState(showIntroVideo)

  const handleVideoComplete = async () => {
    try {
      const response = await fetch('/api/profiles/intro-video-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) {
        throw new Error('Failed to mark video as seen')
      }
    } finally {
      setShowModal(false)
    }
  }

  return (
    <>
      <VideoIntroModal
        open={showModal}
        videoUrl={videoUrl}
        onComplete={handleVideoComplete}
      />
      {children}
    </>
  )
}
