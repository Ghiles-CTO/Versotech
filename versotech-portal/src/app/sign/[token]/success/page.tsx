'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'

type SignatureSuccessPayload = {
  document_type?: string
  success_redirect_path?: string | null
}

export default function SignSuccessPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [loadingRedirect, setLoadingRedirect] = useState(true)
  const [redirectPath, setRedirectPath] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function resolveSuccessRedirect() {
      try {
        const response = await fetch(`/api/signature/${token}`, { cache: 'no-store' })
        if (!response.ok) {
          return
        }

        const data = (await response.json()) as SignatureSuccessPayload
        if (!active) return

        if (data.document_type === 'subscription' && data.success_redirect_path) {
          setRedirectPath(data.success_redirect_path)
          router.replace(data.success_redirect_path)
          return
        }
      } catch (error) {
        console.error('Failed to resolve signature success redirect:', error)
      } finally {
        if (active) {
          setLoadingRedirect(false)
        }
      }
    }

    if (token) {
      resolveSuccessRedirect()
    } else {
      setLoadingRedirect(false)
    }

    return () => {
      active = false
    }
  }, [router, token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 to-background p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-4">
          Document Signed Successfully
        </h1>

        {loadingRedirect ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing the next step...
          </div>
        ) : (
          <p className="text-muted-foreground mb-6">
            Thank you for signing the document. A copy of the signed document
            has been sent to your email address.
          </p>
        )}

        {redirectPath ? (
          <Button className="w-full" onClick={() => router.replace(redirectPath)}>
            Open Funding Instructions
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground/80">
            <p>
              You can now close this window. If you have any questions,
              please contact your relationship manager.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
