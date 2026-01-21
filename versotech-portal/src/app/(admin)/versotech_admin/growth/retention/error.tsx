'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function RetentionError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Retention page error:', error)
  }, [error])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Retention Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Analyze user retention patterns and identify at-risk users
        </p>
      </div>

      {/* Error card */}
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Failed to load retention data
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              {error.message || 'An unexpected error occurred while loading the retention analytics.'}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <Button onClick={reset} variant="outline" className="mt-4">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
