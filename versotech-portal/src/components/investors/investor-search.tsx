'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InvestorSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentQ = searchParams.get('q') || ''
  const [searchTerm, setSearchTerm] = useState(currentQ)
  const [isSearching, setIsSearching] = useState(false)
  const isInitialMount = useRef(true)

  // Memoized function to build and navigate
  const navigateWithSearch = useCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (term.trim()) {
      params.set('q', term.trim())
    } else {
      params.delete('q')
    }

    // Reset to page 1 when searching
    params.set('page', '1')

    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  useEffect(() => {
    // Skip the initial mount to prevent unnecessary navigation
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Don't navigate if the search term hasn't actually changed from URL
    if (searchTerm === currentQ) {
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      navigateWithSearch(searchTerm)
      setIsSearching(false)
    }, 300) // 300ms debounce

    return () => {
      clearTimeout(timer)
      setIsSearching(false)
    }
  }, [searchTerm]) // Only depend on searchTerm - intentionally exclude others to prevent loop

  // Sync local state if URL changes externally (e.g., browser back/forward)
  useEffect(() => {
    if (currentQ !== searchTerm && !isSearching) {
      setSearchTerm(currentQ)
    }
  }, [currentQ]) // Only sync when URL query changes

  const clearSearch = () => {
    setSearchTerm('')
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search investors by name, email, or ID..."
        className="pl-10 pr-10"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSearch}
          className="absolute right-1 top-1 h-7 w-7 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {isSearching && (
        <div className="absolute right-10 top-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
}
