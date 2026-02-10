'use client'

import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ConversationFilters } from '@/types/messaging'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/messaging/utils'
import { Search, X, Users, Building2, MessageSquarePlus, ChevronDown } from 'lucide-react'

export interface StaffDirectoryEntry {
  id: string
  display_name: string | null
  email: string | null
  role: string
}

export interface InvestorDirectoryEntry {
  id: string
  display_name: string | null
  email: string | null
  role: string
  investor_id: string | null
  entity_name: string | null
  entity_type: string | null
}

interface NewConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'dm' | 'group'
  onCreate: (payload: {
    subject: string
    participantIds: string[]
    visibility: ConversationFilters['visibility']
    type: ConversationFilters['type']
    initialMessage?: string
  }) => void
  staffDirectory: StaffDirectoryEntry[]
  investorDirectory: InvestorDirectoryEntry[]
  isSubmitting: boolean
}

type DirectoryItem =
  | { kind: 'section'; title: string; description: string; count: number }
  | { kind: 'group'; title: string }
  | { kind: 'staff'; entry: StaffDirectoryEntry }
  | { kind: 'investor'; entry: InvestorDirectoryEntry }
  | { kind: 'empty'; message: string }
  | { kind: 'show-more'; section: 'staff' | 'investors'; remaining: number }

const PAGE_SIZE = 8

export function NewConversationDialog({
  open,
  onOpenChange,
  mode,
  onCreate,
  staffDirectory,
  investorDirectory,
  isSubmitting,
}: NewConversationDialogProps) {
  const [subject, setSubject] = useState('')
  const [initialMessage, setInitialMessage] = useState('')
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([])
  const [selectedInvestorIds, setSelectedInvestorIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllStaff, setShowAllStaff] = useState(false)
  const [showAllInvestors, setShowAllInvestors] = useState(false)

  const isDM = mode === 'dm'
  const isGroup = mode === 'group'

  const totalSelected = selectedStaffIds.length + selectedInvestorIds.length
  const hasInvestors = selectedInvestorIds.length > 0

  const selectedPeople = useMemo(() => {
    const people: Array<{ id: string; name: string; type: 'staff' | 'investor' }> = []
    for (const id of selectedStaffIds) {
      const entry = staffDirectory.find(s => s.id === id)
      if (entry) people.push({ id, name: entry.display_name || entry.email || 'Staff', type: 'staff' })
    }
    for (const id of selectedInvestorIds) {
      const entry = investorDirectory.find(i => i.id === id)
      if (entry) people.push({ id, name: entry.display_name || entry.email || 'Investor', type: 'investor' })
    }
    return people
  }, [selectedStaffIds, selectedInvestorIds, staffDirectory, investorDirectory])

  const selectedPerson = selectedPeople[0] || null

  const filteredStaff = useMemo(() => {
    if (!searchQuery) return staffDirectory
    const query = searchQuery.toLowerCase()
    return staffDirectory.filter(s =>
      s.display_name?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query)
    )
  }, [staffDirectory, searchQuery])

  const filteredInvestors = useMemo(() => {
    if (!searchQuery) return investorDirectory
    const query = searchQuery.toLowerCase()
    return investorDirectory.filter(i =>
      i.display_name?.toLowerCase().includes(query) ||
      i.email?.toLowerCase().includes(query) ||
      i.entity_name?.toLowerCase().includes(query)
    )
  }, [investorDirectory, searchQuery])

  const investorsByEntity = useMemo(() => {
    const groups = new Map<string, InvestorDirectoryEntry[]>()
    filteredInvestors.forEach(investor => {
      const entityKey = investor.entity_name || 'Individual Investors'
      if (!groups.has(entityKey)) groups.set(entityKey, [])
      groups.get(entityKey)!.push(investor)
    })
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filteredInvestors])

  // When searching, bypass pagination so all results are visible
  const isSearching = searchQuery.length > 0
  const effectiveShowAllStaff = showAllStaff || isSearching
  const effectiveShowAllInvestors = showAllInvestors || isSearching

  const combinedDirectoryItems = useMemo<DirectoryItem[]>(() => {
    const items: DirectoryItem[] = []

    items.push({
      kind: 'section',
      title: 'Staff Members',
      description: 'Internal team',
      count: filteredStaff.length,
    })

    if (filteredStaff.length === 0) {
      items.push({ kind: 'empty', message: searchQuery ? 'No staff found' : 'No staff members available' })
    } else {
      const staffToShow = effectiveShowAllStaff ? filteredStaff : filteredStaff.slice(0, PAGE_SIZE)
      for (const entry of staffToShow) items.push({ kind: 'staff', entry })
      if (!effectiveShowAllStaff && filteredStaff.length > PAGE_SIZE) {
        items.push({ kind: 'show-more', section: 'staff', remaining: filteredStaff.length - PAGE_SIZE })
      }
    }

    items.push({
      kind: 'section',
      title: 'Investors',
      description: 'External contacts',
      count: filteredInvestors.length,
    })

    if (filteredInvestors.length === 0) {
      items.push({ kind: 'empty', message: searchQuery ? 'No investors found' : 'No investors available' })
    } else {
      let investorCount = 0
      const limit = effectiveShowAllInvestors ? Infinity : PAGE_SIZE
      let hitLimit = false

      for (const [entityName, investors] of investorsByEntity) {
        if (hitLimit) break
        items.push({ kind: 'group', title: entityName })
        for (const entry of investors) {
          if (investorCount >= limit) { hitLimit = true; break }
          items.push({ kind: 'investor', entry })
          investorCount++
        }
      }
      if (!effectiveShowAllInvestors && filteredInvestors.length > PAGE_SIZE) {
        items.push({ kind: 'show-more', section: 'investors', remaining: filteredInvestors.length - PAGE_SIZE })
      }
    }

    return items
  }, [filteredStaff, filteredInvestors, investorsByEntity, searchQuery, effectiveShowAllStaff, effectiveShowAllInvestors])

  const handleToggleStaff = (id: string) => {
    if (isDM) {
      setSelectedStaffIds([id])
      setSelectedInvestorIds([])
    } else {
      setSelectedStaffIds(prev =>
        prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
      )
    }
  }

  const handleToggleInvestor = (id: string) => {
    if (isDM) {
      setSelectedInvestorIds([id])
      setSelectedStaffIds([])
    } else {
      setSelectedInvestorIds(prev =>
        prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
      )
    }
  }

  const handleRemovePerson = (id: string) => {
    setSelectedStaffIds(prev => prev.filter(v => v !== id))
    setSelectedInvestorIds(prev => prev.filter(v => v !== id))
  }

  const resetForm = () => {
    setSubject('')
    setInitialMessage('')
    setSearchQuery('')
    setSelectedStaffIds([])
    setSelectedInvestorIds([])
    setShowAllStaff(false)
    setShowAllInvestors(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm()
    onOpenChange(next)
  }

  const handleSubmit = () => {
    const participantIds = [...selectedStaffIds, ...selectedInvestorIds]
    let finalSubject = subject.trim()
    if (isDM && selectedPerson) {
      finalSubject = selectedPerson.name
    } else if (!finalSubject) {
      finalSubject = 'Untitled conversation'
    }

    const effectiveVisibility: ConversationFilters['visibility'] = hasInvestors ? 'investor' : 'internal'
    const conversationType: ConversationFilters['type'] = isDM ? 'dm' : 'group'

    onCreate({
      subject: finalSubject,
      participantIds,
      visibility: effectiveVisibility,
      type: conversationType,
      initialMessage: initialMessage.trim() || undefined,
    })
  }

  const canSubmit = isDM ? totalSelected === 1 : totalSelected > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[min(95vw,1000px)] max-w-[min(95vw,1000px)] sm:max-w-[min(95vw,1000px)] rounded-2xl border border-border bg-background p-0 gap-0"
        showCloseButton={false}
      >
        <div className="flex h-[min(85vh,720px)] flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
            <DialogHeader className="flex-1 gap-0.5">
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <MessageSquarePlus className="h-5 w-5 text-primary" />
                {isDM ? 'New Conversation' : 'New Group'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {isDM
                  ? 'Select one person to start a direct conversation.'
                  : 'Select people and name your group.'}
              </DialogDescription>
            </DialogHeader>
            <DialogClose className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              Close
            </DialogClose>
          </div>

          {/* Body — split panel */}
          <div className="flex flex-1 min-h-0 flex-col md:flex-row">
            {/* Left panel: Contact search + selection */}
            <div className="flex flex-1 flex-col min-h-0 border-b md:border-b-0 md:border-r">
              {/* Search */}
              <div className="relative px-4 py-3 border-b">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>

              {/* Contact list */}
              <ScrollArea className="flex-1">
                <div className="px-3 py-2 space-y-1">
                  {combinedDirectoryItems.map((item, index) => {
                    switch (item.kind) {
                      case 'section':
                        return (
                          <div
                            key={`section-${item.title}`}
                            className={cn(
                              'flex items-center justify-between px-2 py-2',
                              index > 0 && 'mt-3 border-t pt-3'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {item.title === 'Staff Members'
                                ? <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                : <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              }
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {item.title}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-[10px] font-medium h-5 px-1.5">
                              {item.count}
                            </Badge>
                          </div>
                        )
                      case 'group':
                        return (
                          <div
                            key={`group-${item.title}-${index}`}
                            className="flex items-center gap-1.5 px-2 pt-2.5 pb-1"
                          >
                            <Building2 className="h-3 w-3 text-muted-foreground/60" />
                            <span className="text-[11px] font-medium text-muted-foreground">
                              {item.title}
                            </span>
                          </div>
                        )
                      case 'empty':
                        return (
                          <p key={`empty-${index}`} className="py-6 text-center text-sm text-muted-foreground">
                            {item.message}
                          </p>
                        )
                      case 'staff': {
                        const entry = item.entry
                        const isSelected = selectedStaffIds.includes(entry.id)
                        return (
                          <button
                            key={`staff-${entry.id}`}
                            type="button"
                            onClick={() => handleToggleStaff(entry.id)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                              isSelected
                                ? 'bg-primary/10 ring-1 ring-primary/30'
                                : 'hover:bg-muted/60'
                            )}
                          >
                            {isGroup && (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleStaff(entry.id)}
                                className="h-4 w-4 shrink-0"
                              />
                            )}
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-xs bg-primary/15 text-primary font-medium">
                                {getInitials(entry.display_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {entry.display_name || entry.email || 'Staff member'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {entry.email}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {entry.role.replace('staff_', '')}
                            </Badge>
                            {isDM && !isSelected && (
                              <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                            )}
                            {isDM && isSelected && (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary shrink-0">
                                <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                              </span>
                            )}
                          </button>
                        )
                      }
                      case 'investor': {
                        const entry = item.entry
                        const isSelected = selectedInvestorIds.includes(entry.id)
                        return (
                          <button
                            key={`investor-${entry.id}`}
                            type="button"
                            onClick={() => handleToggleInvestor(entry.id)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                              isSelected
                                ? 'bg-primary/10 ring-1 ring-primary/30'
                                : 'hover:bg-muted/60'
                            )}
                          >
                            {isGroup && (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleInvestor(entry.id)}
                                className="h-4 w-4 shrink-0"
                              />
                            )}
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-xs bg-blue-500/15 text-blue-400 font-medium">
                                {getInitials(entry.display_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {entry.display_name || entry.email || 'Investor'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {entry.email}
                              </p>
                            </div>
                            {entry.entity_type && (
                              <Badge variant="outline" className="text-[10px] border-blue-400/30 text-blue-400 shrink-0">
                                {entry.entity_type}
                              </Badge>
                            )}
                            {isDM && !isSelected && (
                              <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                            )}
                            {isDM && isSelected && (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary shrink-0">
                                <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                              </span>
                            )}
                          </button>
                        )
                      }
                      case 'show-more':
                        return (
                          <button
                            key={`show-more-${item.section}`}
                            type="button"
                            onClick={() => {
                              if (item.section === 'staff') setShowAllStaff(true)
                              else setShowAllInvestors(true)
                            }}
                            className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-2.5 text-sm font-medium text-primary hover:bg-muted/60 transition-colors"
                          >
                            <ChevronDown className="h-4 w-4" />
                            Show {item.remaining} more
                          </button>
                        )
                    }
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Right panel: Setup + summary */}
            <div className="flex w-full md:w-[340px] flex-col min-h-0 bg-muted/30">
              <ScrollArea className="flex-1">
                <div className="px-5 py-4 space-y-5">
                  {/* Group name (group mode only) */}
                  {isGroup && (
                    <div className="space-y-1.5">
                      <label htmlFor="group-name" className="text-sm font-medium">
                        Group Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="group-name"
                        placeholder="e.g., Q4 Planning Team"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="h-10"
                      />
                    </div>
                  )}

                  {/* Selected people */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {isDM ? 'Selected' : 'Participants'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {totalSelected} {isDM ? 'of 1' : 'selected'}
                      </span>
                    </div>
                    {totalSelected === 0 ? (
                      <div className="flex items-center justify-center rounded-lg border border-dashed py-6">
                        <p className="text-sm text-muted-foreground">
                          {isDM ? 'Select a person from the left' : 'Select people from the left'}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPeople.map(person => (
                          <span
                            key={person.id}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-sm',
                              'bg-card border shadow-sm'
                            )}
                          >
                            <Avatar className="h-5 w-5">
                              <AvatarFallback
                                className={cn(
                                  'text-[9px] font-medium',
                                  person.type === 'staff'
                                    ? 'bg-primary/15 text-primary'
                                    : 'bg-blue-500/15 text-blue-400'
                                )}
                              >
                                {getInitials(person.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="max-w-[120px] truncate text-xs font-medium">
                              {person.name}
                            </span>
                            {isGroup && (
                              <button
                                type="button"
                                onClick={() => handleRemovePerson(person.id)}
                                className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Initial message */}
                  <div className="space-y-1.5">
                    <label htmlFor="initial-message" className="text-sm font-medium">
                      First message <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <Textarea
                      id="initial-message"
                      placeholder={isDM ? 'Say hello...' : 'Kick off the conversation...'}
                      value={initialMessage}
                      onChange={e => setInitialMessage(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Summary card */}
                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Summary
                    </p>
                    <p className="text-sm font-medium">
                      {isDM ? (
                        totalSelected === 1
                          ? `Ready to message ${selectedPerson?.name}`
                          : 'Select one person to continue'
                      ) : (
                        `${totalSelected} participant${totalSelected === 1 ? '' : 's'} selected`
                      )}
                    </p>
                    {hasInvestors && (
                      <p className="text-xs font-medium text-blue-400">
                        Contains investors — visibility set to Investor
                      </p>
                    )}
                    {!canSubmit && (
                      <p className="text-xs text-destructive">
                        {isDM ? 'Select exactly one person' : 'Select at least one participant'}
                      </p>
                    )}
                    {isGroup && !subject.trim() && totalSelected > 0 && (
                      <p className="text-xs text-destructive">Group name is required</p>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2 border-t px-5 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit || (isGroup && !subject.trim())}
              className="h-9 px-6"
            >
              {isSubmitting ? 'Creating...' : isDM ? 'Start Conversation' : 'Create Group'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
