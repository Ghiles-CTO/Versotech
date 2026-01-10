'use client'

import { ReactNode, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { SubmitSubscriptionForm } from './submit-subscription-form'
import { Briefcase } from 'lucide-react'

interface SubscribeNowDialogProps {
  dealId: string
  dealName: string
  currency: string
  children: ReactNode
  existingSubmission?: {
    id: string
    status: string
    submitted_at: string
  } | null
}

export function SubscribeNowDialog({
  dealId,
  dealName,
  currency,
  children,
  existingSubmission
}: SubscribeNowDialogProps) {
  const [open, setOpen] = useState(false)

  // Map to the format expected by SubmitSubscriptionForm
  const formattedSubmission = existingSubmission
    ? {
        id: existingSubmission.id,
        status: existingSubmission.status,
        submitted_at: existingSubmission.submitted_at,
        payload_json: {}
      }
    : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <Briefcase className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Subscribe to Investment Opportunity</DialogTitle>
              <DialogDescription>
                Submit a subscription request for {dealName}. The team will review it before sending the NDA and
                subscription documents.
                <span className="block mt-1 text-amber-600 dark:text-amber-400 text-xs">
                  Note: This request does not include data room access.
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <SubmitSubscriptionForm
            dealId={dealId}
            currency={currency}
            existingSubmission={formattedSubmission}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
