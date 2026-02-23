'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react'

// Default storage key for tour progress persistence
const DEFAULT_STORAGE_KEY = 'verso_tour_progress'

// Analytics interface for tracking tour events
interface TourAnalytics {
  onStepView?: (step: number, stepId: string) => void
  onStepComplete?: (step: number, stepId: string, durationMs: number) => void
  onTourComplete?: (totalDurationMs: number) => void
  onTourSkip?: (atStep: number) => void
}

// Stored progress for resumption
interface StoredProgress {
  currentStep: number
  isPaused: boolean
  startTime: number
  lastActiveTime: number
}

interface TourContextType {
  // Core state
  isActive: boolean
  currentStep: number
  totalSteps: number
  isPaused: boolean

  // Core actions
  startTour: () => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => Promise<void>
  completeTour: () => Promise<void>
  closeTour: () => void

  // Enhanced actions
  goToStep: (step: number) => void
  restartTour: () => void
  pauseTour: () => void
  resumeTour: () => void

  // Step IDs for analytics (optional)
  setStepIds?: (ids: string[]) => void
}

const TourContext = createContext<TourContextType | null>(null)

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within TourProvider')
  }
  return context
}

// Safe hook that returns null outside provider (for optional usage)
export function useTourOptional() {
  return useContext(TourContext)
}

interface TourProviderProps {
  children: ReactNode
  totalSteps: number
  onComplete: () => Promise<void>
  onSkip?: () => Promise<void>
  analytics?: TourAnalytics
  stepIds?: string[]
  enableKeyboardNav?: boolean
  enablePersistence?: boolean
  persistenceKey?: string
}

export function TourProvider({
  children,
  totalSteps,
  onComplete,
  onSkip,
  analytics,
  stepIds = [],
  enableKeyboardNav = true,
  enablePersistence = true,
  persistenceKey = DEFAULT_STORAGE_KEY,
}: TourProviderProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [stepIdsState, setStepIdsState] = useState<string[]>(stepIds)

  // Timing refs
  const tourStartTime = useRef<number | null>(null)
  const stepStartTime = useRef<number | null>(null)

  useEffect(() => {
    setStepIdsState(stepIds)
  }, [stepIds])

  // Load persisted progress on mount
  useEffect(() => {
    if (!enablePersistence) return

    try {
      const stored = localStorage.getItem(persistenceKey)
      if (stored) {
        const progress: StoredProgress = JSON.parse(stored)
        // Only resume if within last 24 hours
        const hoursSinceActive = (Date.now() - progress.lastActiveTime) / (1000 * 60 * 60)
        if (hoursSinceActive < 24 && progress.currentStep > 0 && progress.currentStep < totalSteps) {
          setCurrentStep(progress.currentStep)
          setIsPaused(true)
          // Don't auto-start, let user explicitly resume
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [enablePersistence, totalSteps, persistenceKey])

  // Persist progress whenever it changes
  useEffect(() => {
    if (!enablePersistence || !isActive) return

    try {
      const progress: StoredProgress = {
        currentStep,
        isPaused,
        startTime: tourStartTime.current || Date.now(),
        lastActiveTime: Date.now()
      }
      localStorage.setItem(persistenceKey, JSON.stringify(progress))
    } catch {
      // Ignore localStorage errors
    }
  }, [currentStep, isPaused, isActive, enablePersistence, persistenceKey])

  // Track step views
  useEffect(() => {
    if (isActive && analytics?.onStepView) {
      const stepId = stepIdsState[currentStep] || `step-${currentStep}`
      analytics.onStepView(currentStep, stepId)
      stepStartTime.current = Date.now()
    }
  }, [currentStep, isActive, analytics, stepIdsState])

  const clearPersistedProgress = useCallback(() => {
    if (enablePersistence) {
      try {
        localStorage.removeItem(persistenceKey)
      } catch {
        // Ignore
      }
    }
  }, [enablePersistence, persistenceKey])

  const finalizeTour = useCallback(() => {
    setIsActive(false)
    setCurrentStep(0)
    setIsPaused(false)
    clearPersistedProgress()
  }, [clearPersistedProgress])

  const startTour = useCallback(() => {
    setCurrentStep(0)
    setIsActive(true)
    setIsPaused(false)
    tourStartTime.current = Date.now()
    stepStartTime.current = Date.now()
  }, [])

  const nextStep = useCallback(async () => {
    // Track step completion
    if (analytics?.onStepComplete && stepStartTime.current) {
      const stepId = stepIdsState[currentStep] || `step-${currentStep}`
      const duration = Date.now() - stepStartTime.current
      analytics.onStepComplete(currentStep, stepId, duration)
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
      stepStartTime.current = Date.now()
    } else {
      try {
        await onComplete()

        // Track tour completion only after successful completion save
        if (analytics?.onTourComplete && tourStartTime.current) {
          const totalDuration = Date.now() - tourStartTime.current
          analytics.onTourComplete(totalDuration)
        }

        // Last step - complete the tour
        finalizeTour()
      } catch (error) {
        console.error('[TourProvider] Failed to complete tour:', error)
      }
    }
  }, [currentStep, totalSteps, onComplete, analytics, stepIdsState, finalizeTour])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      stepStartTime.current = Date.now()
    }
  }, [currentStep])

  const skipTour = useCallback(async () => {
    // Track skip event
    if (analytics?.onTourSkip) {
      analytics.onTourSkip(currentStep)
    }

    try {
      const skipHandler = onSkip || onComplete
      await skipHandler()
      finalizeTour()
    } catch (error) {
      console.error('[TourProvider] Failed to skip tour:', error)
    }
  }, [onSkip, onComplete, analytics, currentStep, finalizeTour])

  const completeTour = useCallback(async () => {
    try {
      await onComplete()

      // Track tour completion only after successful completion save
      if (analytics?.onTourComplete && tourStartTime.current) {
        const totalDuration = Date.now() - tourStartTime.current
        analytics.onTourComplete(totalDuration)
      }

      finalizeTour()
    } catch (error) {
      console.error('[TourProvider] Failed to complete tour:', error)
    }
  }, [onComplete, analytics, finalizeTour])

  const closeTour = useCallback(() => {
    if (!isActive) return

    setIsActive(false)
    setIsPaused(true)

    if (!enablePersistence) return

    try {
      const progress: StoredProgress = {
        currentStep,
        isPaused: true,
        startTime: tourStartTime.current || Date.now(),
        lastActiveTime: Date.now()
      }
      localStorage.setItem(persistenceKey, JSON.stringify(progress))
    } catch {
      // Ignore localStorage errors
    }
  }, [isActive, enablePersistence, currentStep, persistenceKey])

  // Enhanced actions
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step)
      stepStartTime.current = Date.now()
      if (!isActive) {
        setIsActive(true)
        setIsPaused(false)
        tourStartTime.current = Date.now()
      }
    }
  }, [totalSteps, isActive])

  const restartTour = useCallback(() => {
    setCurrentStep(0)
    setIsActive(true)
    setIsPaused(false)
    tourStartTime.current = Date.now()
    stepStartTime.current = Date.now()
    clearPersistedProgress()
  }, [clearPersistedProgress])

  const pauseTour = useCallback(() => {
    if (isActive) {
      setIsPaused(true)
    }
  }, [isActive])

  const resumeTour = useCallback(() => {
    if (isPaused) {
      setIsPaused(false)
      setIsActive(true)
      stepStartTime.current = Date.now()
    }
  }, [isPaused])

  const setStepIds = useCallback((ids: string[]) => {
    setStepIdsState(ids)
  }, [])

  // Keyboard navigation - using refs to avoid stale closures
  const skipTourRef = useRef(skipTour)
  const closeTourRef = useRef(closeTour)
  const nextStepRef = useRef(nextStep)
  const prevStepRef = useRef(prevStep)

  // Keep refs updated
  useEffect(() => {
    skipTourRef.current = skipTour
    closeTourRef.current = closeTour
    nextStepRef.current = nextStep
    prevStepRef.current = prevStep
  }, [skipTour, closeTour, nextStep, prevStep])

  useEffect(() => {
    if (!enableKeyboardNav || !isActive || isPaused) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input elements
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          closeTourRef.current()
          break
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault()
          nextStepRef.current()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prevStepRef.current()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, isPaused, enableKeyboardNav])

  return (
    <TourContext.Provider value={{
      // Core state
      isActive,
      currentStep,
      totalSteps,
      isPaused,

      // Core actions
      startTour,
      nextStep,
      prevStep,
      skipTour,
      completeTour,
      closeTour,

      // Enhanced actions
      goToStep,
      restartTour,
      pauseTour,
      resumeTour,

      // Step IDs setter
      setStepIds
    }}>
      {children}
    </TourContext.Provider>
  )
}
