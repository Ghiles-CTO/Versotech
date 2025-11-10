'use client'

import { Card } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function SignSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Document Signed Successfully
        </h1>

        <p className="text-slate-600 mb-6">
          Thank you for signing the document. A copy of the signed document
          has been sent to your email address.
        </p>

        <div className="text-sm text-slate-500">
          <p>
            You can now close this window. If you have any questions,
            please contact your relationship manager.
          </p>
        </div>
      </Card>
    </div>
  )
}
