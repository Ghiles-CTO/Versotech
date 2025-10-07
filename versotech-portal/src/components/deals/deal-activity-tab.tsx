'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

interface DealActivityTabProps {
  dealId: string
}

export function DealActivityTab({ dealId }: DealActivityTabProps) {
  // TODO: Fetch audit logs for this deal
  
  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>Complete audit trail of all deal actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Activity log coming soon...
            <p className="text-sm mt-2">
              This will show a timeline of all deal actions, member changes, commitments, and allocations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

