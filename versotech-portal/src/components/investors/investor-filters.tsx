'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Filter, X, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function InvestorFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isApplying, setIsApplying] = useState(false)

  const currentStatus = searchParams.get('status')
  const currentType = searchParams.get('type')

  const hasFilters = currentStatus || currentType

  const applyFilter = (key: string, value: string) => {
    setIsApplying(true)
    const params = new URLSearchParams(searchParams.toString())

    if (params.get(key) === value) {
      // Remove filter if clicking the same one
      params.delete(key)
    } else {
      params.set(key, value)
    }

    // Reset to page 1 when filtering
    params.set('page', '1')

    router.push(`/versotech_main/investors?${params.toString()}`)

    // Reset loading state after navigation starts
    setTimeout(() => setIsApplying(false), 500)
  }

  const clearAllFilters = () => {
    setIsApplying(true)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('status')
    params.delete('type')
    params.set('page', '1')
    router.push(`/versotech_main/investors?${params.toString()}`)
    setTimeout(() => setIsApplying(false), 500)
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isApplying}>
            {isApplying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Filter className="h-4 w-4 mr-2" />
            )}
            Filter
            {hasFilters && !isApplying && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {(currentStatus ? 1 : 0) + (currentType ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>KYC Status</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => applyFilter('status', 'pending')}>
            {currentStatus === 'pending' && '✓ '}Pending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyFilter('status', 'review')}>
            {currentStatus === 'review' && '✓ '}In Review
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyFilter('status', 'approved')}>
            {currentStatus === 'approved' && '✓ '}Approved
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyFilter('status', 'completed')}>
            {currentStatus === 'completed' && '✓ '}Completed
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Investor Type</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => applyFilter('type', 'individual')}>
            {currentType === 'individual' && '✓ '}Individual
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyFilter('type', 'entity')}>
            {currentType === 'entity' && '✓ '}Entity
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyFilter('type', 'institutional')}>
            {currentType === 'institutional' && '✓ '}Institutional
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyFilter('type', 'family_office')}>
            {currentType === 'family_office' && '✓ '}Family Office
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyFilter('type', 'fund')}>
            {currentType === 'fund' && '✓ '}Fund
          </DropdownMenuItem>
          
          {hasFilters && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearAllFilters} className="text-red-500">
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

