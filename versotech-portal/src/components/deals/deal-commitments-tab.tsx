'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HandCoins, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ApproveCommitmentModal } from './approve-commitment-modal'
import { RejectCommitmentModal } from './reject-commitment-modal'
import { FinalizeAllocationModal } from './finalize-allocation-modal'

interface DealCommitmentsTabProps {
  dealId: string
  commitments: any[]
  allocations: any[]
  dealStatus: string
}

export function DealCommitmentsTab({
  dealId,
  commitments,
  allocations,
  dealStatus
}: DealCommitmentsTabProps) {
  const router = useRouter()
  
  const statusColors: Record<string, string> = {
    submitted: 'bg-blue-500/20 text-blue-200',
    under_review: 'bg-purple-500/20 text-purple-200',
    approved: 'bg-emerald-500/20 text-emerald-200',
    rejected: 'bg-red-500/20 text-red-200',
    cancelled: 'bg-gray-500/20 text-gray-200'
  }

  return (
    <div className="space-y-6">
      {/* Commitments */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Investor Commitments
          </CardTitle>
          <CardDescription>Review and approve investment requests</CardDescription>
        </CardHeader>
        <CardContent>
          {commitments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No commitments submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {commitments.map((commitment) => (
                <div
                  key={commitment.id}
                  className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {commitment.investors?.legal_name}
                        </span>
                        <Badge className={statusColors[commitment.status] || 'bg-white/20'}>
                          {commitment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Units:</span>
                          <span className="ml-2 text-foreground font-medium">
                            {commitment.requested_units?.toLocaleString() || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="ml-2 text-foreground font-medium">
                            ${commitment.requested_amount?.toLocaleString() || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fee Plan:</span>
                          <span className="ml-2 text-foreground">
                            {commitment.fee_plans?.name || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Submitted:</span>
                          <span className="ml-2 text-foreground">
                            {new Date(commitment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {commitment.status === 'submitted' && (
                      <div className="flex items-center gap-2">
                        <ApproveCommitmentModal 
                          dealId={dealId}
                          commitmentId={commitment.id}
                          investorName={commitment.investors?.legal_name}
                          units={commitment.requested_units}
                        />
                        <RejectCommitmentModal
                          dealId={dealId}
                          commitmentId={commitment.id}
                          investorName={commitment.investors?.legal_name}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finalized Allocations */}
      {allocations.length > 0 && (
        <Card className="border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Finalized Allocations
            </CardTitle>
            <CardDescription>Confirmed unit assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allocations.map((allocation) => (
                <div
                  key={allocation.id}
                  className="border border-emerald-400/30 rounded-lg p-4 bg-emerald-500/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {allocation.investors?.legal_name}
                        </span>
                        <Badge className="bg-emerald-500/20 text-emerald-200">
                          {allocation.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {allocation.units.toLocaleString()} units @ ${allocation.unit_price.toFixed(2)}
                        {allocation.approved_by_profile && (
                          <span className="ml-4">
                            Approved by: {allocation.approved_by_profile.display_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
