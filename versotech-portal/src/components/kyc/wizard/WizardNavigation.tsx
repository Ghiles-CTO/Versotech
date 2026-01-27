'use client'

import { ChevronLeft, ChevronRight, Save, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWizard } from './WizardContext'

interface WizardNavigationProps {
  onSubmit?: () => Promise<void>
  isSubmitting?: boolean
}

export function WizardNavigation({ onSubmit, isSubmitting }: WizardNavigationProps = {}) {
  const {
    isSaving,
    isFirstStep,
    isLastStep,
    canGoBack,
    nextStep,
    previousStep,
    saveProgress,
    submitQuestionnaire,
  } = useWizard()

  const loading = isSubmitting ?? isSaving

  const handleNext = async () => {
    await nextStep()
  }

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit()
    } else {
      await submitQuestionnaire()
    }
  }

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-zinc-700">
      {/* Left Side - Back & Save */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={previousStep}
          disabled={!canGoBack || loading}
          className="gap-2 border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => saveProgress()}
          disabled={loading}
          className="gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Progress
        </Button>
      </div>

      {/* Right Side - Next / Submit */}
      <div>
        {isLastStep ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Questionnaire
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Continue
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
