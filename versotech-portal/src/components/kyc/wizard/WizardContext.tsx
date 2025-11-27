'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  KYCQuestionnaireData,
  getVisibleSteps,
  getStepDefaults,
  getStepSchema,
  STEP_CONFIG,
} from '../schemas/kyc-questionnaire-schema'

// ============================================================================
// Types
// ============================================================================
interface WizardState {
  currentStep: number
  formData: Partial<KYCQuestionnaireData>
  completedSteps: Set<number>
  isLoading: boolean
  isSaving: boolean
  lastSavedAt: Date | null
  submissionId: string | null
  errors: Record<number, string[]>
}

interface WizardContextValue {
  // Convenience accessors (same as state but easier to use)
  currentStep: number
  formData: Partial<KYCQuestionnaireData>
  isLoading: boolean
  isSaving: boolean
  lastSavedAt: Date | null

  // Computed values
  state: WizardState
  visibleSteps: number[]
  totalVisibleSteps: number
  currentStepIndex: number
  progress: number
  currentStepConfig: typeof STEP_CONFIG[number]
  isFirstStep: boolean
  isLastStep: boolean
  canGoNext: boolean
  canGoBack: boolean

  // Actions
  goToStep: (step: number) => void
  nextStep: () => Promise<boolean>
  previousStep: () => void
  updateStepData: <K extends keyof KYCQuestionnaireData>(stepKey: K, data: KYCQuestionnaireData[K]) => void
  validateCurrentStep: () => Promise<boolean>
  saveProgress: () => Promise<void>
  submitQuestionnaire: () => Promise<boolean>
  getStepData: <K extends keyof KYCQuestionnaireData>(stepKey: K) => KYCQuestionnaireData[K] | undefined
}

const WizardContext = createContext<WizardContextValue | null>(null)

// ============================================================================
// Provider
// ============================================================================
interface WizardProviderProps {
  children: React.ReactNode
  onComplete?: () => void
  initialData?: Partial<KYCQuestionnaireData>
  submissionId?: string | null
}

export function WizardProvider({
  children,
  onComplete,
  initialData,
  submissionId: initialSubmissionId,
}: WizardProviderProps) {
  const [state, setState] = useState<WizardState>(() => ({
    currentStep: initialData?.lastCompletedStep ? Math.min(initialData.lastCompletedStep + 1, 10) : 1,
    formData: initialData || {},
    completedSteps: new Set(
      initialData?.lastCompletedStep
        ? Array.from({ length: initialData.lastCompletedStep }, (_, i) => i + 1)
        : []
    ),
    isLoading: false,
    isSaving: false,
    lastSavedAt: null,
    submissionId: initialSubmissionId || null,
    errors: {},
  }))

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isDirtyRef = useRef(false)
  const isSavingRef = useRef(false) // Ref for immediate saving state check
  const saveProgressRef = useRef<(() => Promise<void>) | undefined>(undefined) // Ref to latest saveProgress

  // Calculate visible steps based on US Person status
  const visibleSteps = getVisibleSteps(state.formData)
  const totalVisibleSteps = visibleSteps.length
  const rawCurrentStepIndex = visibleSteps.indexOf(state.currentStep)

  // BUG FIX 2.3: Handle currentStepIndex = -1 (step became hidden)
  const currentStepIndex = rawCurrentStepIndex === -1 ? 0 : rawCurrentStepIndex
  const safeCurrentStep = rawCurrentStepIndex === -1 ? visibleSteps[0] : state.currentStep

  // Auto-navigate when current step becomes hidden (e.g., US Person changes from 'yes' to 'no')
  useEffect(() => {
    if (rawCurrentStepIndex === -1 && visibleSteps.length > 0) {
      // Find nearest valid step (prefer staying on same or earlier step)
      const nearestStep = visibleSteps.find(s => s >= state.currentStep) || visibleSteps[visibleSteps.length - 1]
      setState(prev => ({ ...prev, currentStep: nearestStep }))
    }
  }, [rawCurrentStepIndex, visibleSteps, state.currentStep])

  const progress = Math.max(0, Math.round(((currentStepIndex + 1) / totalVisibleSteps) * 100))
  const currentStepConfig = STEP_CONFIG[safeCurrentStep - 1]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === totalVisibleSteps - 1
  const canGoNext = !isLastStep
  const canGoBack = !isFirstStep

  // BUG FIX 2.1: Auto-save with proper closure handling using ref
  useEffect(() => {
    if (isDirtyRef.current && saveProgressRef.current) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveProgressRef.current?.()
      }, 30000)
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [state.formData])

  // Get step data helper
  const getStepData = useCallback(<K extends keyof KYCQuestionnaireData>(stepKey: K) => {
    return state.formData[stepKey]
  }, [state.formData])

  // Update step data
  const updateStepData = useCallback(<K extends keyof KYCQuestionnaireData>(
    stepKey: K,
    data: KYCQuestionnaireData[K]
  ) => {
    isDirtyRef.current = true
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [stepKey]: data,
      },
      errors: {
        ...prev.errors,
        [parseInt(stepKey.replace('step', ''))]: [],
      },
    }))
  }, [])

  // Validate current step
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const stepKey = `step${state.currentStep}` as keyof KYCQuestionnaireData
    const stepData = state.formData[stepKey]
    const schema = getStepSchema(state.currentStep)

    if (!schema) return true

    try {
      await schema.parseAsync(stepData || getStepDefaults(state.currentStep))
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [state.currentStep]: [] },
      }))
      return true
    } catch (error: any) {
      const messages = error.errors?.map((e: any) => e.message) || ['Validation failed']
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [state.currentStep]: messages },
      }))
      return false
    }
  }, [state.currentStep, state.formData])

  // Save progress - BUG FIX 3.1: Use ref for immediate isSaving check
  const saveProgress = useCallback(async () => {
    // Use ref for immediate check to prevent race conditions
    if (isSavingRef.current) return

    isSavingRef.current = true
    setState(prev => ({ ...prev, isSaving: true }))

    try {
      const payload = {
        document_type: 'questionnaire',
        custom_label: 'KYC Compliance Questionnaire',
        metadata: {
          ...state.formData,
          lastCompletedStep: Math.max(...Array.from(state.completedSteps), 0),
          wizardVersion: '2.0',
        },
        status: 'draft',
      }

      let response: Response

      if (state.submissionId) {
        // Update existing draft
        response = await fetch(`/api/investors/me/kyc-submissions/${state.submissionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        // Create new draft
        response = await fetch('/api/investors/me/kyc-submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        throw new Error('Failed to save progress')
      }

      const data = await response.json()

      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSavedAt: new Date(),
        submissionId: data.submission?.id || prev.submissionId,
      }))

      isDirtyRef.current = false
    } catch (error) {
      console.error('Failed to save progress:', error)
      setState(prev => ({ ...prev, isSaving: false }))
      toast.error('Failed to save progress. Your changes may not be saved.')
    } finally {
      isSavingRef.current = false
    }
  }, [state.formData, state.completedSteps, state.submissionId])

  // Keep saveProgressRef updated with latest saveProgress
  useEffect(() => {
    saveProgressRef.current = saveProgress
  }, [saveProgress])

  // Go to specific step - BUG FIX 4.1: Add feedback when step blocked
  const goToStep = useCallback((step: number) => {
    if (visibleSteps.includes(step)) {
      setState(prev => ({ ...prev, currentStep: step }))
    } else {
      toast.error('This step is not available')
    }
  }, [visibleSteps])

  // Next step - BUG FIX 2.2: Use functional setState to avoid race conditions
  const nextStep = useCallback(async (): Promise<boolean> => {
    // Validate current step
    const isValid = await validateCurrentStep()
    if (!isValid) {
      toast.error('Please complete all required fields')
      return false
    }

    // Mark current step as completed and move to next in single state update
    // to avoid race condition between separate setState calls
    const currentVisibleSteps = getVisibleSteps(state.formData)
    const currentIdx = currentVisibleSteps.indexOf(state.currentStep)

    setState(prev => {
      const newCompleted = new Set(prev.completedSteps)
      newCompleted.add(prev.currentStep)

      // Calculate next step from current state
      const latestVisibleSteps = getVisibleSteps(prev.formData)
      const latestIdx = latestVisibleSteps.indexOf(prev.currentStep)
      const nextIdx = latestIdx + 1
      const nextStep = nextIdx < latestVisibleSteps.length
        ? latestVisibleSteps[nextIdx]
        : prev.currentStep

      return {
        ...prev,
        completedSteps: newCompleted,
        currentStep: nextStep,
      }
    })

    // Save progress after state update
    await saveProgress()

    return true
  }, [validateCurrentStep, saveProgress, state.formData, state.currentStep])

  // Previous step
  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setState(prev => ({
        ...prev,
        currentStep: visibleSteps[currentStepIndex - 1],
      }))
    }
  }, [currentStepIndex, visibleSteps])

  // Submit questionnaire - BUG FIX 1.3: Filter hidden steps data
  const submitQuestionnaire = useCallback(async (): Promise<boolean> => {
    // Get current visible steps
    const currentVisibleSteps = getVisibleSteps(state.formData)

    // Validate all visible steps
    for (const step of currentVisibleSteps) {
      const stepKey = `step${step}` as keyof KYCQuestionnaireData
      const stepData = state.formData[stepKey]
      const schema = getStepSchema(step)

      if (schema) {
        try {
          await schema.parseAsync(stepData || getStepDefaults(step))
        } catch (error) {
          toast.error(`Please complete Step ${step}: ${STEP_CONFIG[step - 1].title}`)
          goToStep(step)
          return false
        }
      }
    }

    setState(prev => ({ ...prev, isSaving: true }))

    try {
      // BUG FIX 1.3: Only include data for visible steps (security fix)
      // This prevents leaking US Person step data when user later changes answer to 'no'
      const filteredFormData: Record<string, unknown> = {}
      for (const step of currentVisibleSteps) {
        const stepKey = `step${step}` as keyof KYCQuestionnaireData
        if (state.formData[stepKey]) {
          filteredFormData[stepKey] = state.formData[stepKey]
        }
      }

      const payload = {
        document_type: 'questionnaire',
        custom_label: 'KYC Compliance Questionnaire',
        metadata: {
          ...filteredFormData,
          lastCompletedStep: 10,
          wizardVersion: '2.0',
          submittedAt: new Date().toISOString(),
        },
        status: 'pending',
      }

      let response: Response

      if (state.submissionId) {
        response = await fetch(`/api/investors/me/kyc-submissions/${state.submissionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch('/api/investors/me/kyc-submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        throw new Error('Failed to submit questionnaire')
      }

      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSavedAt: new Date(),
      }))

      toast.success('Questionnaire submitted successfully!')
      onComplete?.()
      return true
    } catch (error) {
      console.error('Failed to submit:', error)
      setState(prev => ({ ...prev, isSaving: false }))
      toast.error('Failed to submit questionnaire')
      return false
    }
  }, [state.formData, state.submissionId, goToStep, onComplete])

  const value: WizardContextValue = {
    // Convenience accessors
    currentStep: state.currentStep,
    formData: state.formData,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    lastSavedAt: state.lastSavedAt,
    // State and computed values
    state,
    visibleSteps,
    totalVisibleSteps,
    currentStepIndex,
    progress,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoBack,
    // Actions
    goToStep,
    nextStep,
    previousStep,
    updateStepData,
    validateCurrentStep,
    saveProgress,
    submitQuestionnaire,
    getStepData,
  }

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================
export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}
