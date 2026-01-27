'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tag, X, Check, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

interface TagManagementPopoverProps {
  documentId: string
  documentName: string
  currentTags: string[]
  onTagsUpdated?: (newTags: string[]) => void
  trigger?: React.ReactNode
}

/**
 * TagManagementPopover - Manage document tags inline
 *
 * Features:
 * - Shows current tags as removable badges
 * - Input with autocomplete from existing tags
 * - Save via PATCH API on each change
 * - Real-time feedback with toasts
 */
export function TagManagementPopover({
  documentId,
  documentName,
  currentTags,
  onTagsUpdated,
  trigger,
}: TagManagementPopoverProps) {
  const [open, setOpen] = useState(false)
  const [tags, setTags] = useState<string[]>(currentTags || [])
  const [allTags, setAllTags] = useState<string[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [inputValue, setInputValue] = useState('')

  // Fetch available tags when popover opens
  useEffect(() => {
    if (open && allTags.length === 0) {
      fetchAllTags()
    }
  }, [open, allTags.length])

  // Sync with parent state when currentTags changes
  useEffect(() => {
    setTags(currentTags || [])
  }, [currentTags])

  const fetchAllTags = async () => {
    setIsLoadingTags(true)
    try {
      const response = await fetch('/api/staff/documents/tags')
      if (response.ok) {
        const data = await response.json()
        setAllTags(data.tags || [])
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setIsLoadingTags(false)
    }
  }

  const saveTags = useCallback(async (newTags: string[]) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/staff/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: newTags }),
      })

      if (!response.ok) {
        throw new Error('Failed to update tags')
      }

      setTags(newTags)
      onTagsUpdated?.(newTags)
      toast.success('Tags updated')
    } catch (error) {
      console.error('Failed to save tags:', error)
      toast.error('Failed to update tags')
      // Revert to original tags
      setTags(currentTags || [])
    } finally {
      setIsSaving(false)
    }
  }, [documentId, currentTags, onTagsUpdated])

  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (!trimmedTag) return

    if (tags.includes(trimmedTag)) {
      toast.info(`Tag "${trimmedTag}" already exists`)
      return
    }

    const newTags = [...tags, trimmedTag]
    saveTags(newTags)
    setInputValue('')

    // Add to allTags if it's new
    if (!allTags.includes(trimmedTag)) {
      setAllTags(prev => [...prev, trimmedTag].sort())
    }
  }, [tags, allTags, saveTags])

  const removeTag = useCallback((tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove)
    saveTags(newTags)
  }, [tags, saveTags])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
    }
  }

  // Filter suggestions: show tags that match input and aren't already added
  const suggestions = allTags.filter(
    tag => !tags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())
  )

  // Check if current input is a new tag (not in suggestions)
  const isNewTag = inputValue.trim() && !allTags.includes(inputValue.trim().toLowerCase())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Tag className="w-4 h-4 mr-1" strokeWidth={2} />
            Manage Tags
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-foreground">
              Manage Tags
            </h4>
            {isSaving && (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {documentName}
          </p>
        </div>

        {/* Current Tags */}
        {tags.length > 0 && (
          <div className="p-3 border-b border-border">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={cn(
                    "text-xs py-0.5 pl-2 pr-1 flex items-center gap-1",
                    "border border-slate-200 bg-slate-50 text-slate-700",
                    "dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                  )}
                >
                  <Tag className="w-3 h-3" strokeWidth={2} />
                  {tag}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTag(tag)
                    }}
                    disabled={isSaving}
                    className={cn(
                      "ml-0.5 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700",
                      "transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
                    )}
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="w-3 h-3" strokeWidth={2} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add New Tag with Autocomplete */}
        <Command className="border-0" shouldFilter={false}>
          <CommandInput
            placeholder="Type to add tag..."
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
            className="border-0"
          />
          <CommandList>
            {isLoadingTags ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <>
                {/* Option to create new tag */}
                {isNewTag && (
                  <CommandGroup heading="Create new">
                    <CommandItem
                      value={`create-${inputValue}`}
                      onSelect={() => addTag(inputValue)}
                    >
                      <Plus className="w-4 h-4 mr-2 text-primary" strokeWidth={2} />
                      <span>Create &quot;{inputValue.trim()}&quot;</span>
                    </CommandItem>
                  </CommandGroup>
                )}

                {/* Existing tag suggestions */}
                {suggestions.length > 0 && (
                  <CommandGroup heading="Suggestions">
                    {suggestions.slice(0, 8).map((tag) => (
                      <CommandItem
                        key={tag}
                        value={tag}
                        onSelect={() => addTag(tag)}
                      >
                        <Tag className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={2} />
                        <span>{tag}</span>
                        {tags.includes(tag) && (
                          <Check className="w-4 h-4 ml-auto text-primary" strokeWidth={2} />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Empty state */}
                {!isNewTag && suggestions.length === 0 && inputValue && (
                  <CommandEmpty>No matching tags found</CommandEmpty>
                )}

                {/* Initial state when no input */}
                {!inputValue && allTags.length > 0 && (
                  <CommandGroup heading="Available tags">
                    {allTags
                      .filter(tag => !tags.includes(tag))
                      .slice(0, 8)
                      .map((tag) => (
                        <CommandItem
                          key={tag}
                          value={tag}
                          onSelect={() => addTag(tag)}
                        >
                          <Tag className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={2} />
                          <span>{tag}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>

        {/* Helper text */}
        <div className="p-2 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Press Enter to add a tag
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
