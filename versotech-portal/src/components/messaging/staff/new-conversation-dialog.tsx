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
import type { ConversationFilters } from '@/types/messaging'
import { cn } from '@/lib/utils'

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

const CARD_CLASS = 'border border-slate-700 bg-slate-900/70 rounded-lg backdrop-blur'

type DirectoryItem =
  | { kind: 'section'; title: string; description: string; count: number }
  | { kind: 'group'; title: string }
  | { kind: 'staff'; entry: StaffDirectoryEntry }
  | { kind: 'investor'; entry: InvestorDirectoryEntry }
  | { kind: 'empty'; message: string }

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

  console.log('[NewConversationDialog] Mode:', mode, 'Staff:', staffDirectory.length, 'Investors:', investorDirectory.length)

  const isDM = mode === 'dm'
  const isGroup = mode === 'group'

  const totalSelected = selectedStaffIds.length + selectedInvestorIds.length
  const hasInvestors = selectedInvestorIds.length > 0
  
  // For DM mode, get the selected person's name
  const selectedPerson = useMemo(() => {
    const allPeople = [...staffDirectory, ...investorDirectory]
    const selectedId = [...selectedStaffIds, ...selectedInvestorIds][0]
    return allPeople.find(p => p.id === selectedId)
  }, [selectedStaffIds, selectedInvestorIds, staffDirectory, investorDirectory])

  // Filter and group data
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
  
  // Group investors by entity
  const investorsByEntity = useMemo(() => {
    const groups = new Map<string, InvestorDirectoryEntry[]>()
    
    filteredInvestors.forEach(investor => {
      const entityKey = investor.entity_name || 'Individual Investors'
      if (!groups.has(entityKey)) {
        groups.set(entityKey, [])
      }
      groups.get(entityKey)!.push(investor)
    })
    
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filteredInvestors])

  const combinedDirectoryItems = useMemo<DirectoryItem[]>(() => {
    const items: DirectoryItem[] = []

    items.push({
      kind: 'section',
      title: 'Staff Members',
      description: 'Internal team available for messaging',
      count: filteredStaff.length,
    })

    if (filteredStaff.length === 0) {
      items.push({
        kind: 'empty',
        message: searchQuery ? 'No staff found' : 'No staff members available',
      })
    } else {
      for (const entry of filteredStaff) {
        items.push({ kind: 'staff', entry })
      }
    }

    items.push({
      kind: 'section',
      title: 'Investors',
      description: 'Include investor contacts in this thread',
      count: filteredInvestors.length,
    })

    if (filteredInvestors.length === 0) {
      items.push({
        kind: 'empty',
        message: searchQuery ? 'No investors found' : 'No investors available',
      })
    } else {
      for (const [entityName, investors] of investorsByEntity) {
        items.push({ kind: 'group', title: entityName })
        for (const entry of investors) {
          items.push({ kind: 'investor', entry })
        }
      }
    }

    return items
  }, [filteredStaff, filteredInvestors, investorsByEntity, searchQuery])

  const handleToggleStaff = (id: string) => {
    if (isDM) {
      // DM mode: Only one person total
      setSelectedStaffIds([id])
      setSelectedInvestorIds([]) // Clear investors
    } else {
      // Group mode: Multiple people
    setSelectedStaffIds(prev =>
      prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id]
    )
    }
  }

  const handleToggleInvestor = (id: string) => {
    if (isDM) {
      // DM mode: Only one person total
      setSelectedInvestorIds([id])
      setSelectedStaffIds([]) // Clear staff
    } else {
      // Group mode: Multiple people
    setSelectedInvestorIds(prev =>
      prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id]
    )
    }
  }

  const resetForm = () => {
    setSubject('')
    setInitialMessage('')
    setSearchQuery('')
    setSelectedStaffIds([])
    setSelectedInvestorIds([])
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      resetForm()
    }
    onOpenChange(next)
  }

  const handleSubmit = () => {
    const participantIds = [...selectedStaffIds, ...selectedInvestorIds]
    
    // For DM mode, use the selected person's name as subject
    let finalSubject = subject.trim()
    if (isDM && selectedPerson) {
      finalSubject = selectedPerson.display_name || selectedPerson.email || 'Direct Message'
    } else if (!finalSubject) {
      finalSubject = 'Untitled conversation'
    }
    
    const effectiveVisibility: ConversationFilters['visibility'] = hasInvestors ? 'investor' : 'internal'
    const conversationType: ConversationFilters['type'] = isDM ? 'dm' : 'group'

    console.log('[NewConversationDialog] Submitting:', {
      mode,
      subject: finalSubject,
      participantIds,
      totalParticipants: participantIds.length,
      visibility: effectiveVisibility,
      type: conversationType,
    })

    onCreate({
      subject: finalSubject,
      participantIds,
      visibility: effectiveVisibility,
      type: conversationType,
      initialMessage: initialMessage.trim() || undefined,
    })
  }
  
  // Validation
  const canSubmit = isDM ? totalSelected === 1 : totalSelected > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[min(95vw,1100px)] rounded-2xl border border-slate-700 bg-slate-950 p-0 text-slate-50"
        showCloseButton={false}
      >
        <div className="flex h-[min(90vh,880px)] flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-6 py-5">
            <DialogHeader className="flex-1 gap-1">
              <DialogTitle className="text-2xl font-semibold text-white">
            {isDM ? 'Start New Direct Conversation' : 'Create New Group'}
          </DialogTitle>
              <DialogDescription className="mt-1 text-base text-slate-300">
            {isDM 
              ? 'Select one person to start a direct conversation with.'
              : 'Select multiple people and give your group a name.'}
          </DialogDescription>
        </DialogHeader>
            <DialogClose className="rounded-md border border-slate-600 px-3 py-1 text-sm text-slate-200 transition-colors hover:bg-slate-800 hover:text-white">
              Close
            </DialogClose>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto px-6 py-6 space-y-6">
          {isGroup && (
            <div className="space-y-2">
              <label htmlFor="group-name" className="text-sm font-semibold text-white">
                Group Name <span className="text-red-400">*</span>
              </label>
              <Input
                id="group-name"
                placeholder="e.g., Q4 Planning Team"
                value={subject}
                onChange={event => setSubject(event.target.value)}
                    className="h-11 bg-slate-900 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>
          )}
          
          {isDM && selectedPerson && (
                <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Starting conversation with</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                {selectedPerson.display_name || selectedPerson.email}
              </p>
              <p className="text-sm text-slate-300">{selectedPerson.email}</p>
            </div>
          )}

          <div className="space-y-3">
              <label htmlFor="initial-message" className="text-base font-semibold text-white">
                {isDM ? 'First message' : 'Initial message'} <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <Textarea
                id="initial-message"
                placeholder={isDM ? 'Say hello...' : 'Kick off the conversation...'}
                value={initialMessage}
                onChange={event => setInitialMessage(event.target.value)}
                rows={3}
                className="bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="search-people" className="text-base font-semibold text-white">
                {isDM ? 'Select one person' : 'Select participants'}
              </label>
              <Input
                id="search-people"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="h-12 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            <section className="rounded-xl border border-slate-800 bg-slate-900/70">
              <div className="max-h-[calc(80vh-240px)] overflow-y-auto px-5 py-4 space-y-4">
                {combinedDirectoryItems.map((item, index) => {
                  switch (item.kind) {
                    case 'section':
                      return (
                        <div key={`${item.kind}-${item.title}-${index}`} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.description}</p>
                          </div>
                          <Badge variant="outline" className="border-slate-600 bg-slate-800 text-xs font-semibold uppercase text-slate-200">
                            {item.count}
                          </Badge>
                        </div>
                      )
                    case 'group':
                      return (
                        <div key={`group-${item.title}-${index}`} className="pt-3 text-xs font-semibold uppercase tracking-wider text-slate-300">
                          {item.title}
                        </div>
                      )
                    case 'empty':
                      return (
                        <p key={`empty-${item.message}-${index}`} className="py-6 text-center text-sm text-slate-400">
                          {item.message}
                        </p>
                      )
                    case 'staff': {
                      const entry = item.entry
                      const isSelected = selectedStaffIds.includes(entry.id)
                      return (
                        <label
                          key={`staff-${entry.id}-${index}`}
                          className={cn(
                            'flex flex-col gap-2 rounded-xl border px-4 py-4 transition-colors',
                            isSelected
                              ? 'border-blue-500 bg-blue-500/15 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]'
                              : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/60'
                          )}
                          onClick={() => handleToggleStaff(entry.id)}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              {isGroup ? (
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleToggleStaff(entry.id)}
                                  className="h-5 w-5"
                                />
                              ) : (
                                <span
                                  className={cn(
                                    'flex h-5 w-5 items-center justify-center rounded-full border-2',
                                    isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-500'
                                  )}
                                >
                                  {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                                </span>
                              )}
                              <p className="text-base font-semibold text-white leading-tight whitespace-normal">
                                {entry.display_name || entry.email || 'Staff member'}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-slate-600 bg-slate-800 text-xs font-semibold uppercase text-slate-200">
                              {entry.role.replace('staff_', '')}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-300 leading-tight whitespace-normal">
                            {entry.email}
                          </p>
                        </label>
                      )
                    }
                    case 'investor': {
                      const entry = item.entry
                      const isSelected = selectedInvestorIds.includes(entry.id)
                      return (
                        <label
                          key={`investor-${entry.id}-${index}`}
                          className={cn(
                            'flex flex-col gap-2 rounded-xl border px-4 py-4 transition-colors',
                            isSelected
                              ? 'border-blue-500 bg-blue-500/15 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]'
                              : 'border-slate-700 hover-border-slate-600 hover:bg-slate-800/60'
                          )}
                          onClick={() => handleToggleInvestor(entry.id)}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              {isGroup ? (
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleToggleInvestor(entry.id)}
                                  className="h-5 w-5"
                                />
                              ) : (
                                <span
                                  className={cn(
                                    'flex h-5 w-5 items-center justify-center rounded-full border-2',
                                    isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-500'
                                  )}
                                >
                                  {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                                </span>
                              )}
                              <span className="text-base font-semibold text-white leading-tight whitespace-normal">
                                {entry.display_name || entry.email || 'Investor'}
                              </span>
                            </div>
                            {entry.entity_type && (
                              <Badge variant="outline" className="border-blue-400/60 bg-blue-500/10 text-xs font-semibold capitalize text-blue-200">
                                {entry.entity_type}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-300 leading-tight whitespace-normal">
                            {entry.email}
                          </p>
                        </label>
                      )
                    }
                  }
                })}
              </div>
            </section>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-6 py-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-white">Summary</p>
              <p className="mt-2 text-base text-white">
                {isDM ? (
                  totalSelected === 1 
                    ? `Ready to message ${selectedPerson?.display_name || selectedPerson?.email}`
                    : 'Select one person to continue'
                ) : (
                  `${totalSelected} participant${totalSelected === 1 ? '' : 's'} selected`
                )}
              </p>
              {hasInvestors && (
                <p className="mt-2 text-sm font-medium text-blue-300">
                  ✓ Contains investors • Visibility automatically set to Investor
                </p>
              )}
              {!canSubmit && (
                <p className="mt-2 text-sm text-red-300">
                  {isDM ? '⚠ Select exactly one person' : '⚠ Select at least one participant'}
                </p>
              )}
              {isGroup && !subject.trim() && (
                <p className="mt-2 text-sm text-red-300">⚠ Group name is required</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 border-t border-slate-800 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
            className="h-11 border border-slate-600 bg-slate-900 text-slate-100 transition-colors hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !canSubmit || (isGroup && !subject.trim())}
              className="h-11 bg-blue-600 px-8 text-base font-semibold text-white shadow-[0_8px_16px_rgba(37,99,235,0.35)] transition-colors hover:bg-blue-500"
          >
            {isSubmitting ? 'Creating…' : isDM ? 'Start Conversation' : 'Create Group'}
          </Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}