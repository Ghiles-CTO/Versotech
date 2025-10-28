'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InvestorSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setIsSearching(true)
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (searchTerm.trim()) {
        params.set('q', searchTerm.trim())
      } else {
        params.delete('q')
      }

      // Reset to page 1 when searching
      params.set('page', '1')

      router.push(`${pathname}?${params.toString()}`)
      setIsSearching(false)
    }, 300) // 300ms debounce

    return () => {
      clearTimeout(timer)
      setIsSearching(false)
    }
  }, [searchTerm, router, pathname, searchParams])

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
