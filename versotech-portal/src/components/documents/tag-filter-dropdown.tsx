'use client'

import { useState, useEffect } from 'react'
import { Tag, X, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

interface TagFilterDropdownProps {
  selectedTags: Set<string>
  onTagsChange: (tags: Set<string>) => void
  className?: string
}

/**
 * TagFilterDropdown - Multi-select dropdown for filtering documents by tag
 *
 * Features:
 * - Fetches available tags from /api/staff/documents/tags
 * - Multi-select with checkboxes
 * - Shows selected count as badge
 * - Clear all button when tags selected
 */
export function TagFilterDropdown({
  selectedTags,
  onTagsChange,
  className,
}: TagFilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch available tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/staff/documents/tags')
        if (response.ok) {
          const data = await response.json()
          setAvailableTags(data.tags || [])
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTags()
  }, [])

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags)
    if (newTags.has(tag)) {
      newTags.delete(tag)
    } else {
      newTags.add(tag)
    }
    onTagsChange(newTags)
  }

  const clearAll = () => {
    onTagsChange(new Set())
  }

  const selectedCount = selectedTags.size

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9 px-3 gap-2',
            selectedCount > 0 && 'border-primary/50 bg-primary/5',
            className
          )}
        >
          <Tag className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Tags</span>
          {selectedCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 text-xs bg-primary/20 text-primary border-0"
            >
              {selectedCount}
            </Badge>
          )}
          <ChevronDown className="w-3.5 h-3.5 opacity-50" strokeWidth={2} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Filter tags..." className="h-9" />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Loading tags...' : 'No tags found.'}
            </CommandEmpty>
            <CommandGroup>
              {availableTags.map((tag) => {
                const isSelected = selectedTags.has(tag)
                return (
                  <CommandItem
                    key={tag}
                    value={tag}
                    onSelect={() => toggleTag(tag)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded border',
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                    </div>
                    <span className="flex-1">{tag}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
          {/* Clear All Footer */}
          {selectedCount > 0 && (
            <div className="border-t border-border p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault()
                  clearAll()
                }}
              >
                <X className="w-3.5 h-3.5 mr-2" strokeWidth={2} />
                Clear filters
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
