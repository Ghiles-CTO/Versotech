'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react'
import { WizardProvider, useWizard } from './WizardContext'
import { WizardProgress } from './WizardProgress'
import { WizardNavigation } from './WizardNavigation'
import { Step1AboutYou } from './steps/Step1AboutYou'
import { Step2InvestmentType } from './steps/Step2InvestmentType'
import { Step3WellInformed } from './steps/Step3WellInformed'
import { Step4Compliance } from './steps/Step4Compliance'
import { Step5USPerson } from './steps/Step5USPerson'
import { Step6OfferDetails } from './steps/Step6OfferDetails'
import { Step7USCompliance } from './steps/Step7USCompliance'
import { Step8Suitability } from './steps/Step8Suitability'
import { Step9WaiverRisk } from './steps/Step9WaiverRisk'
import { Step10ReviewSign } from './steps/Step10ReviewSign'
import { STEP_CONFIG } from '../schemas/kyc-questionnaire-schema'
import type { KYCQuestionnaireData } from '../schemas/kyc-questionnaire-schema'

interface KYCQuestionnaireWizardProps {
  initialData?: Partial<KYCQuestionnaireData>
  submissionId?: string
  onComplete?: () => void
}

function WizardContent({ onComplete }: { onComplete?: () => void }) {
  const { currentStep, visibleSteps, formData, isLoading, submitQuestionnaire } = useWizard()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Map step number to component
  const stepComponents: Record<number, React.ReactNode> = {
    1: <Step1AboutYou />,
    2: <Step2InvestmentType />,
    3: <Step3WellInformed />,
    4: <Step4Compliance />,
    5: <Step5USPerson />,
    6: <Step6OfferDetails />,
    7: <Step7USCompliance />,
    8: <Step8Suitability />,
    9: <Step9WaiverRisk />,
    10: <Step10ReviewSign />,
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const success = await submitQuestionnaire()
      if (!success) {
        // submitQuestionnaire already shows toast with specific error
        // Just don't show success screen - keep user on the form
        return
      }
      setSubmitSuccess(true)
      onComplete?.()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit questionnaire')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
          <p className="text-muted-foreground">Loading your questionnaire...</p>
        </div>
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-emerald-500/20 animate-pulse" />
            </div>
            <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500 relative z-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Questionnaire Submitted!
            </h2>
            <p className="text-muted-foreground">
              Thank you for completing your KYC questionnaire. Our compliance team will review your
              submission and contact you if any additional information is needed.
            </p>
          </div>
          <Alert className="bg-blue-500/10 border-blue-500/30 text-left">
            <AlertTitle>What happens next?</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Our team will review your submission within 2-3 business days</li>
                <li>You may be asked to provide supporting documentation</li>
                <li>You&apos;ll receive an email notification when your status is updated</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const currentStepConfig = STEP_CONFIG[currentStep - 1]

  return (
    <div className="space-y-6">
      {/* Progress */}
      <WizardProgress />

      {/* Current Step Header */}
      <div className="text-center py-2">
        <p className="text-sm text-muted-foreground">
          Step {visibleSteps.indexOf(currentStep) + 1} of {visibleSteps.length}
        </p>
      </div>

      {/* Error Alert */}
      {submitError && (
        <Alert className="bg-red-500/10 border-red-500/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Submission Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="min-h-[400px]">{stepComponents[currentStep]}</div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <WizardNavigation onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}

export function KYCQuestionnaireWizard({
  initialData,
  submissionId,
  onComplete,
}: KYCQuestionnaireWizardProps) {
  return (
    <WizardProvider
      initialData={initialData}
      submissionId={submissionId}
      onComplete={onComplete}
    >
      <WizardContent onComplete={onComplete} />
    </WizardProvider>
  )
}

// Compact version for embedding in profile page
export function KYCQuestionnaireCompact(props: KYCQuestionnaireWizardProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <KYCQuestionnaireWizard {...props} />
    </div>
  )
}
