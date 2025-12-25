'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  FileText,
  Send,
  Clock,
  CheckCircle2,
  PenLine,
  XCircle,
  User,
  UserCheck,
} from 'lucide-react'
import { formatDate } from '@/lib/format'

type SignatureRequest = {
  id: string
  status: string
  signer_name: string
  signer_email: string
  signature_timestamp: string | null
  signed_pdf_path: string | null
} | null

interface AgreementStatusTimelineProps {
  status: string
  createdAt: string
  signedDate: string | null
  ceoSignature: SignatureRequest
  introducerSignature: SignatureRequest
}

type TimelineStep = {
  id: string
  label: string
  description: string
  icon: any
  status: 'completed' | 'current' | 'upcoming' | 'failed'
  timestamp?: string | null
}

export function AgreementStatusTimeline({
  status,
  createdAt,
  signedDate,
  ceoSignature,
  introducerSignature,
}: AgreementStatusTimelineProps) {
  const getTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        id: 'created',
        label: 'Agreement Created',
        description: 'Draft agreement prepared',
        icon: FileText,
        status: 'completed',
        timestamp: createdAt,
      },
      {
        id: 'sent',
        label: 'Sent to Introducer',
        description: 'Agreement sent for review',
        icon: Send,
        status: ['draft'].includes(status) ? 'upcoming' : 'completed',
        timestamp: null,
      },
      {
        id: 'approval',
        label: 'Introducer Review',
        description: status === 'rejected' ? 'Agreement rejected' : 'Awaiting approval',
        icon: status === 'rejected' ? XCircle : Clock,
        status: getApprovalStatus(),
        timestamp: null,
      },
      {
        id: 'ceo_signature',
        label: 'CEO Signature',
        description: getCeoSignatureDescription(),
        icon: PenLine,
        status: getCeoSignatureStatus(),
        timestamp: ceoSignature?.signature_timestamp,
      },
      {
        id: 'introducer_signature',
        label: 'Introducer Signature',
        description: getIntroducerSignatureDescription(),
        icon: PenLine,
        status: getIntroducerSignatureStatus(),
        timestamp: introducerSignature?.signature_timestamp,
      },
      {
        id: 'active',
        label: 'Agreement Active',
        description: 'Fee agreement in effect',
        icon: CheckCircle2,
        status: status === 'active' ? 'completed' : 'upcoming',
        timestamp: signedDate,
      },
    ]

    return steps
  }

  const getApprovalStatus = (): 'completed' | 'current' | 'upcoming' | 'failed' => {
    if (status === 'rejected') return 'failed'
    if (['draft', 'sent'].includes(status)) return 'upcoming'
    if (status === 'pending_approval') return 'current'
    return 'completed'
  }

  const getCeoSignatureStatus = (): 'completed' | 'current' | 'upcoming' | 'failed' => {
    if (['draft', 'sent', 'pending_approval', 'rejected'].includes(status)) return 'upcoming'
    if (['approved', 'pending_ceo_signature'].includes(status)) return 'current'
    if (ceoSignature?.status === 'signed') return 'completed'
    return 'completed'
  }

  const getCeoSignatureDescription = (): string => {
    if (ceoSignature?.status === 'signed') {
      return `Signed by ${ceoSignature.signer_name}`
    }
    if (['approved', 'pending_ceo_signature'].includes(status)) {
      return 'Awaiting CEO signature'
    }
    return 'CEO to sign first'
  }

  const getIntroducerSignatureStatus = (): 'completed' | 'current' | 'upcoming' | 'failed' => {
    if (['draft', 'sent', 'pending_approval', 'approved', 'pending_ceo_signature', 'rejected'].includes(status)) {
      return 'upcoming'
    }
    if (status === 'pending_introducer_signature') return 'current'
    if (introducerSignature?.status === 'signed' || status === 'active') return 'completed'
    return 'upcoming'
  }

  const getIntroducerSignatureDescription = (): string => {
    if (introducerSignature?.status === 'signed') {
      return `Signed by ${introducerSignature.signer_name}`
    }
    if (status === 'pending_introducer_signature') {
      return 'Awaiting introducer signature'
    }
    return 'Introducer to countersign'
  }

  const steps = getTimelineSteps()

  const getStepStyles = (step: TimelineStep) => {
    switch (step.status) {
      case 'completed':
        return {
          line: 'bg-gradient-to-b from-emerald-500 to-emerald-400',
          circle: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25',
          text: 'text-foreground',
          glow: false,
        }
      case 'current':
        return {
          line: 'bg-gradient-to-b from-emerald-500 via-amber-400 to-amber-500',
          circle: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-4 ring-amber-400/30 shadow-lg shadow-amber-500/40 animate-pulse',
          text: 'text-foreground font-semibold',
          glow: true,
        }
      case 'failed':
        return {
          line: 'bg-gradient-to-b from-rose-500 to-red-600',
          circle: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/25',
          text: 'text-rose-600 dark:text-rose-400 font-medium',
          glow: false,
        }
      case 'upcoming':
      default:
        return {
          line: 'bg-muted/50',
          circle: 'bg-muted/80 text-muted-foreground border-2 border-muted-foreground/20',
          text: 'text-muted-foreground',
          glow: false,
        }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Agreement Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {steps.map((step, index) => {
            const styles = getStepStyles(step)
            const Icon = step.icon
            const isLast = index === steps.length - 1

            return (
              <div key={step.id} className="flex gap-4 pb-6 last:pb-0 group">
                {/* Timeline line and circle */}
                <div className="flex flex-col items-center relative">
                  {/* Glow effect for current step */}
                  {styles.glow && (
                    <div className="absolute inset-0 w-10 h-10 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
                  )}
                  <div
                    className={cn(
                      'relative flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-all duration-300',
                      styles.circle
                    )}
                  >
                    <Icon className={cn('h-5 w-5', step.status === 'current' && 'drop-shadow-sm')} />
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        'w-0.5 flex-1 min-h-[28px] mt-2 rounded-full transition-all',
                        styles.line
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={cn(
                  'flex-1 pt-1.5 transition-all',
                  step.status === 'current' && 'pl-2 border-l-2 border-amber-400/50 -ml-2'
                )}>
                  <p className={cn('text-sm font-medium transition-colors', styles.text)}>
                    {step.label}
                  </p>
                  <p className={cn(
                    'text-xs mt-0.5',
                    step.status === 'current' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                  )}>
                    {step.description}
                  </p>
                  {step.timestamp && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(step.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
