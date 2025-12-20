'use client'

import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWizard } from './WizardContext'
import { STEP_CONFIG } from '../schemas/kyc-questionnaire-schema'

export function WizardProgress() {
  const {
    state,
    visibleSteps,
    currentStepIndex,
    progress,
    goToStep,
  } = useWizard()

  return (
    <div className="w-full space-y-4">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span className="font-medium">
            Step {currentStepIndex + 1} of {visibleSteps.length}
          </span>
          <span className="flex items-center gap-2">
            {state.isSaving && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {!state.isSaving && state.lastSavedAt && (
              <span className="text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Saved
              </span>
            )}
            <span>{progress}% complete</span>
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between gap-1 pt-2">
        {visibleSteps.map((stepNum, index) => {
          const config = STEP_CONFIG[stepNum - 1]
          const isCompleted = state.completedSteps.has(stepNum)
          const isCurrent = stepNum === state.currentStep
          const isAccessible = isCompleted || index <= currentStepIndex + 1

          return (
            <button
              key={stepNum}
              onClick={() => isAccessible && goToStep(stepNum)}
              disabled={!isAccessible}
              className={cn(
                'group flex flex-col items-center flex-1 transition-all duration-200',
                isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              )}
              title={config.title}
            >
              {/* Step Circle */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                  isCompleted && 'bg-emerald-500 text-white',
                  isCurrent && !isCompleted && 'bg-emerald-100 border-2 border-emerald-500 text-emerald-600',
                  !isCompleted && !isCurrent && 'bg-gray-100 text-gray-500 border border-gray-200',
                  isAccessible && !isCurrent && 'group-hover:scale-110'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step Label - Hidden on mobile */}
              <span
                className={cn(
                  'hidden md:block text-[10px] mt-1 text-center max-w-[60px] truncate transition-colors',
                  isCurrent ? 'text-emerald-600 font-medium' : 'text-gray-500'
                )}
              >
                {config.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
