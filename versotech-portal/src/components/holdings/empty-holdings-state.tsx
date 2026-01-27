'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building,
  Target,
  DollarSign,
  MessageSquare,
  FileText
} from 'lucide-react'

interface EmptyHoldingsStateProps {
  hasAnyHoldings: boolean
  onClearFilters: () => void
  message?: string
  description?: string
}

export function EmptyHoldingsState({ 
  hasAnyHoldings, 
  onClearFilters, 
  message,
  description 
}: EmptyHoldingsStateProps) {
  const defaultMessage = hasAnyHoldings ? 'No Holdings Match Your Filters' : 'No Investment Holdings Found'
  const defaultDescription = hasAnyHoldings 
    ? "Try adjusting your filters to see more holdings."
    : "You don&apos;t have access to any investment vehicles yet."

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="text-center py-16">
        <div className="flex justify-center mb-6">
          {hasAnyHoldings ? (
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-400" />
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-3 text-foreground">
          {message || defaultMessage}
        </h3>
        
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {description || defaultDescription}
        </p>
        
        <div className="flex gap-3 justify-center">
          {hasAnyHoldings ? (
            <Button variant="outline" onClick={onClearFilters} className="gap-2">
              <Building className="h-4 w-4" />
              Clear All Filters
            </Button>
          ) : (
            <>
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Contact Investment Team
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Request Information
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
