'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Check,
  ChevronsUpDown,
  Filter,
  Building2,
  Users,
  Scale,
  Handshake,
  Globe,
  Landmark,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

// Types
interface EntityUser {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  isPrimary: boolean
  canSign: boolean
}

interface EntityGroup {
  id: string
  name: string
  type: 'investor' | 'partner' | 'lawyer' | 'commercial_partner' | 'introducer' | 'arranger'
  users: EntityUser[]
}

interface EntitiesResponse {
  success: boolean
  data?: EntityGroup[]
  error?: string
}

// Filter option types
interface FilterOption {
  value: string
  label: string
}

// Entity type options
const entityTypeOptions: FilterOption[] = [
  { value: 'investor', label: 'Investor' },
  { value: 'partner', label: 'Partner' },
  { value: 'lawyer', label: 'Law Firm' },
  { value: 'commercial_partner', label: 'Commercial Partner' },
  { value: 'introducer', label: 'Introducer' },
  { value: 'arranger', label: 'Arranger' },
]

// Entity type to icon mapping
const entityTypeIcons: Record<EntityGroup['type'], LucideIcon> = {
  investor: Building2,
  partner: Users,
  lawyer: Scale,
  commercial_partner: Handshake,
  introducer: Globe,
  arranger: Landmark,
}

// Entity type display names
const entityTypeLabels: Record<EntityGroup['type'], string> = {
  investor: 'Investor',
  partner: 'Partner',
  lawyer: 'Law Firm',
  commercial_partner: 'Commercial Partner',
  introducer: 'Introducer',
  arranger: 'Arranger',
}

// Multi-select filter component
interface MultiSelectFilterProps {
  title: string
  options: FilterOption[]
  selected: string[]
  onSelect: (values: string[]) => void
  className?: string
}

function MultiSelectFilter({
  title,
  options,
  selected,
  onSelect,
  className,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false)

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onSelect(selected.filter(v => v !== value))
    } else {
      onSelect([...selected, value])
    }
  }

  const clearSelection = () => {
    onSelect([])
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9 border-dashed',
            selected.length > 0 && 'border-primary',
            className
          )}
        >
          <Filter className="mr-2 h-4 w-4" />
          {title}
          {selected.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {selected.length}
              </Badge>
            </>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={clearSelection}
                    className="justify-center text-center"
                  >
                    Clear selection
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Get initials from display name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Loading skeleton
function EntitiesTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Building2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">No entities found</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        No entities match the current filters. Try adjusting your search or filter criteria.
      </p>
    </div>
  )
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Entity Card Component
function EntityCard({ entity }: { entity: EntityGroup }) {
  const [isOpen, setIsOpen] = useState(false)
  const Icon = entityTypeIcons[entity.type]

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="py-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base font-medium">{entity.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {entityTypeLabels[entity.type]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {entity.users.length} {entity.users.length === 1 ? 'user' : 'users'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entity.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <Link
                            href={`/versotech_admin/users/${user.id}`}
                            className="font-medium hover:underline"
                          >
                            {user.displayName}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.isPrimary ? 'default' : 'secondary'}>
                            {user.isPrimary ? 'Primary' : 'Member'}
                          </Badge>
                          {user.canSign && (
                            <Badge variant="outline">Can Sign</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/versotech_admin/users/${user.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default function EntitiesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize state from URL params
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [entityTypeFilters, setEntityTypeFilters] = useState<string[]>(
    searchParams.get('type')?.split(',').filter(Boolean) || []
  )

  const [entities, setEntities] = useState<EntityGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 300)

  // Check if any filters are active
  const hasActiveFilters = debouncedSearch.length > 0 || entityTypeFilters.length > 0

  // Update URL params when filters change
  const updateUrlParams = useCallback((params: {
    search?: string
    type?: string[]
  }) => {
    const newParams = new URLSearchParams(searchParams.toString())

    if (params.search !== undefined) {
      if (params.search) {
        newParams.set('search', params.search)
      } else {
        newParams.delete('search')
      }
    }

    if (params.type !== undefined) {
      if (params.type.length > 0) {
        newParams.set('type', params.type.join(','))
      } else {
        newParams.delete('type')
      }
    }

    const queryString = newParams.toString()
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
  }, [pathname, router, searchParams])

  // Fetch entities with users
  const fetchEntities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query params
      const params = new URLSearchParams()
      if (debouncedSearch) {
        params.set('search', debouncedSearch)
      }
      if (entityTypeFilters.length > 0) {
        params.set('type', entityTypeFilters.join(','))
      }

      const response = await fetch(`/api/admin/entities/users?${params}`)
      const data: EntitiesResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch entities')
      }

      setEntities(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, entityTypeFilters])

  // Fetch when filters change
  useEffect(() => {
    fetchEntities()
    updateUrlParams({
      search: debouncedSearch,
      type: entityTypeFilters,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, entityTypeFilters])

  // Clear all filters
  const clearAllFilters = () => {
    setSearchInput('')
    setEntityTypeFilters([])
  }

  // Calculate statistics
  const stats = {
    totalEntities: entities.length,
    totalUsers: entities.reduce((acc, e) => acc + e.users.length, 0),
    byType: entityTypeOptions.map(opt => ({
      type: opt.value,
      label: opt.label,
      count: entities.filter(e => e.type === opt.value).length
    })).filter(s => s.count > 0)
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <h3 className="font-medium text-destructive">Error loading entities</h3>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => fetchEntities()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users by Entity</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View users grouped by their entity associations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && entities.length > 0 && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Entities</p>
              <p className="text-2xl font-bold">{stats.totalEntities}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          {stats.byType.slice(0, 2).map((s) => (
            <Card key={s.type}>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{s.label}s</p>
                <p className="text-2xl font-bold">{s.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search entities or users..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-9"
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                onClick={() => setSearchInput('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter Dropdown */}
          <MultiSelectFilter
            title="Entity Type"
            options={entityTypeOptions}
            selected={entityTypeFilters}
            onSelect={setEntityTypeFilters}
          />
        </div>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-9"
          >
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {debouncedSearch && (
            <Badge variant="secondary" className="rounded-sm px-2 py-1">
              Search: &quot;{debouncedSearch}&quot;
              <button
                className="ml-1.5 ring-offset-background rounded-full outline-none hover:bg-muted-foreground/20"
                onClick={() => setSearchInput('')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {entityTypeFilters.map((type) => (
            <Badge key={type} variant="secondary" className="rounded-sm px-2 py-1">
              Type: {entityTypeOptions.find(o => o.value === type)?.label || type}
              <button
                className="ml-1.5 ring-offset-background rounded-full outline-none hover:bg-muted-foreground/20"
                onClick={() => setEntityTypeFilters(entityTypeFilters.filter(t => t !== type))}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <EntitiesTableSkeleton />
      ) : entities.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {entities.map((entity) => (
            <EntityCard key={`${entity.type}-${entity.id}`} entity={entity} />
          ))}

          {/* Total Count */}
          <div className="text-sm text-muted-foreground text-center pt-4">
            Showing {entities.length} {entities.length === 1 ? 'entity' : 'entities'} with {stats.totalUsers} linked users
          </div>
        </div>
      )}
    </div>
  )
}
