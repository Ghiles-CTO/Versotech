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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Subscribe to {dealName}</DialogTitle>
              <DialogDescription>
                Submit your subscription request directly. The VERSO team will review and follow up.
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
