'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { TourProvider, useTour } from '@/contexts/tour-context'
import { TourSpotlight } from './tour-spotlight'
import { TourTooltip } from './tour-tooltip'
import { TourWelcomeModal } from './tour-welcome-modal'
import { TOUR_VERSION, getTourSteps, type TourStep } from '@/config/platform-tour'
import confetti from 'canvas-confetti'

const ACTIVE_TOUR_PERSONA_COOKIE = 'verso_active_tour_persona'

interface TourContentProps {
  steps: TourStep[]
  persona: string
}

function TourContent({ steps, persona }: TourContentProps) {
  const { isActive, currentStep } = useTour()
  const router = useRouter()
  const pathname = usePathname()
  const step = steps[currentStep]

  useEffect(() => {
    if (!isActive || !step || !step.navigateTo || !step.target) return
    const navigateTo = step.navigateTo

    const timer = setTimeout(() => {
      const targetExists = Boolean(document.querySelector(step.target))
      if (targetExists) return

      const stepRoute = navigateTo.split('?')[0] || navigateTo
      if (stepRoute && pathname !== stepRoute) {
        router.push(navigateTo)
      }
    }, 120)

    return () => clearTimeout(timer)
  }, [currentStep, isActive, pathname, router, step])

  if (!isActive || !step) return null

  return (
    <>
      <TourSpotlight
        targetSelector={step.target}
        isVisible={step.target !== 'body'}
        padding={step.highlightPadding}
      />
      <TourTooltip step={step} stepNumber={currentStep} persona={persona} />
    </>
  )
}

// Confetti celebration effect
function triggerConfetti() {
  const duration = 3 * 1000
  const end = Date.now() + duration

  // Multiple bursts from different angles
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899']

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  // Initial big burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors
  })

  // Continuous celebration
  frame()
}

// Haptic feedback for mobile
function triggerHaptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

interface PlatformTourProps {
  children: React.ReactNode
  activePersona: string
  hasCompletedTour: boolean
}

export function PlatformTour({
  children,
  activePersona,
  hasCompletedTour
}: PlatformTourProps) {
  const [showWelcome, setShowWelcome] = useState(!hasCompletedTour)
  const [isCompleted, setIsCompleted] = useState(hasCompletedTour)
  const completionTriggeredRef = useRef(false)

  const steps = getTourSteps(activePersona)

  useEffect(() => {
    setShowWelcome(!hasCompletedTour)
    setIsCompleted(hasCompletedTour)
    completionTriggeredRef.current = false
  }, [activePersona, hasCompletedTour])

  useEffect(() => {
    document.cookie = `${ACTIVE_TOUR_PERSONA_COOKIE}=${activePersona}; path=/; max-age=31536000; SameSite=Lax`
  }, [activePersona])

  // Extract step IDs for analytics
  const stepIds = steps.map(step => step.id || step.target)
  const persistenceKey = `verso_tour_progress:${activePersona}:${TOUR_VERSION}`

  const handleComplete = useCallback(async () => {
    if (isCompleted) return // Already completed, no need to call API again

    // Prevent double-triggering
    if (completionTriggeredRef.current) return
    completionTriggeredRef.current = true

    try {
      // Trigger celebration effects
      triggerConfetti()
      triggerHaptic()

      const response = await fetch('/api/profiles/tour-completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaKey: activePersona,
          version: TOUR_VERSION,
        }),
      })

      if (!response.ok) {
        let message = 'Failed to save tour completion'
        try {
          const payload = await response.json()
          if (payload?.error && typeof payload.error === 'string') {
            message = payload.error
          }
        } catch {
          // Keep default message
        }
        throw new Error(message)
      }

      setIsCompleted(true)
    } catch (error) {
      console.error('Failed to save tour completion:', error)
      completionTriggeredRef.current = false // Allow retry on error
      throw error
    }
  }, [activePersona, isCompleted])

  const handleSkipFromWelcome = useCallback(async () => {
    setShowWelcome(false)
    // Don't trigger confetti on skip
    try {
      const response = await fetch('/api/profiles/tour-completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaKey: activePersona,
          version: TOUR_VERSION,
        }),
      })

      if (!response.ok) {
        let message = 'Failed to save tour skip'
        try {
          const payload = await response.json()
          if (payload?.error && typeof payload.error === 'string') {
            message = payload.error
          }
        } catch {
          // Keep default message
        }
        throw new Error(message)
      }

      setIsCompleted(true)
    } catch (error) {
      console.error('Failed to save tour skip:', error)
      setShowWelcome(true)
    }
  }, [activePersona])

  // Analytics callbacks (can be connected to your analytics service)
  const analytics = {
    onStepView: (step: number, stepId: string) => {
      // console.log(`[Tour Analytics] Viewing step ${step}: ${stepId}`)
    },
    onStepComplete: (step: number, stepId: string, durationMs: number) => {
      // console.log(`[Tour Analytics] Completed step ${step}: ${stepId} in ${durationMs}ms`)
    },
    onTourComplete: (totalDurationMs: number) => {
      // console.log(`[Tour Analytics] Tour completed in ${totalDurationMs}ms`)
    },
    onTourSkip: (atStep: number) => {
      // console.log(`[Tour Analytics] Tour skipped at step ${atStep}`)
    }
  }

  return (
    <TourProvider
      totalSteps={steps.length}
      onComplete={handleComplete}
      analytics={analytics}
      stepIds={stepIds}
      enableKeyboardNav={true}
      enablePersistence={true}
      persistenceKey={persistenceKey}
    >
      {children}

      {/* Welcome modal for first-time users - now with persona-specific messaging */}
      {!isCompleted && (
        <TourWelcomeModal
          open={showWelcome}
          onClose={() => setShowWelcome(false)}
          onSkip={handleSkipFromWelcome}
          persona={activePersona}
        />
      )}

      {/* Tour overlay - only render when potentially active */}
      <TourContent steps={steps} persona={activePersona} />
    </TourProvider>
  )
}
