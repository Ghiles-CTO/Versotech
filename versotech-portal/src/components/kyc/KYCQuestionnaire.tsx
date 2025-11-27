'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KYCQuestionnaireWizard } from './wizard/KYCQuestionnaireWizard'
import type { KYCQuestionnaireData } from './schemas/kyc-questionnaire-schema'

interface KYCQuestionnaireProps {
  onComplete?: () => void
}

export function KYCQuestionnaire({ onComplete }: KYCQuestionnaireProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [existingData, setExistingData] = useState<Partial<KYCQuestionnaireData> | null>(null)
  const [submissionId, setSubmissionId] = useState<string | null>(null)

  useEffect(() => {
    const loadExistingData = async () => {
      setIsLoading(true)
      try {
        const profileResponse = await fetch('/api/investors/me/kyc-submissions')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()

          // Find the latest questionnaire submission
          const questionnaire = profileData.submissions?.find(
            (s: any) => s.document_type === 'questionnaire' && s.metadata?.wizardVersion === '2.0'
          )

          if (questionnaire && questionnaire.metadata) {
            setExistingData(questionnaire.metadata as Partial<KYCQuestionnaireData>)
            setSubmissionId(questionnaire.id)
          }
        }
      } catch (error) {
        console.error('Failed to load KYC data', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExistingData()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading questionnaire...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50">
        <CardTitle className="text-gray-900">Compliance Questionnaire</CardTitle>
        <CardDescription className="text-gray-600">
          Complete the following compliance questionnaire to proceed with your KYC verification.
          Your progress is saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <KYCQuestionnaireWizard
          initialData={existingData || undefined}
          submissionId={submissionId || undefined}
          onComplete={onComplete}
        />
      </CardContent>
    </Card>
  )
}
