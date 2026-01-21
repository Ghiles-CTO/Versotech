'use client'

import { Suspense, useEffect, useState } from 'react'
import { FunnelSkeleton } from './components/funnel-skeleton'
import { InvestmentFunnel } from './components/investment-funnel'
import { OnboardingFunnel } from './components/onboarding-funnel'
import { DropoffAnalysis } from './components/dropoff-analysis'

interface FunnelStage {
  stage: string
  count: number
  pctOfTotal: number
  pctOfPrevious: number
}

interface BiggestDropoff {
  fromStage: string
  toStage: string
  dropRate: number
}

interface FunnelData {
  investmentFunnel: FunnelStage[]
  onboardingFunnel: FunnelStage[]
  biggestDropoff: BiggestDropoff
}

function FunnelContent() {
  const [data, setData] = useState<FunnelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFunnelData() {
      try {
        const response = await fetch('/api/admin/growth/funnel')
        if (!response.ok) {
          throw new Error('Failed to fetch funnel data')
        }
        const result = await response.json()
        setData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchFunnelData()
  }, [])

  if (loading) {
    return <FunnelSkeleton />
  }

  if (error) {
    throw new Error(error) // This will be caught by the error boundary
  }

  return (
    <div className="space-y-6">
      {/* Two-column layout for funnels on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvestmentFunnel data={data?.investmentFunnel} />
        <OnboardingFunnel data={data?.onboardingFunnel} />
      </div>

      {/* Drop-off Analysis Card */}
      <DropoffAnalysis data={data?.biggestDropoff} />
    </div>
  )
}

export default function FunnelPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Conversion Funnels</h1>
        <p className="text-muted-foreground mt-1">
          Analyze conversion rates across investment and onboarding journeys
        </p>
      </div>

      {/* Main content with Suspense */}
      <Suspense fallback={<FunnelSkeleton />}>
        <FunnelContent />
      </Suspense>
    </div>
  )
}
