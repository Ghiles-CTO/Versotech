'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Search, Plus, User } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'

interface Director {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  nationality: string | null
  id_number: string | null
  notes: string | null
}

interface AddDirectorModalEnhancedProps {
  entityId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddDirectorModalEnhanced({ entityId, open, onClose, onSuccess }: AddDirectorModalEnhancedProps) {
  const [mode, setMode] = useState<'select' | 'create'>('select')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [directors, setDirectors] = useState<Director[]>([])
  const [selectedDirector, setSelectedDirector] = useState<Director | null>(null)
  
  const [assignmentForm, setAssignmentForm] = useState({
    role: '',
    effective_from: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const [newDirectorForm, setNewDirectorForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    nationality: '',
    id_number: '',
    notes: ''
  })

  // Fetch directors from registry
  useEffect(() => {
    if (open && mode === 'select') {
      fetchDirectors()
    }
  }, [open, mode, searchQuery])

  const fetchDirectors = async () => {
    setSearching(true)
    try {
      const url = searchQuery 
        ? `/api/director-registry?search=${encodeURIComponent(searchQuery)}`
        : '/api/director-registry'
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch directors')
      
      const data = await response.json()
      setDirectors(data.directors || [])
    } catch (err: any) {
      console.error('Failed to fetch directors:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleSelectDirector = (director: Director) => {
    setSelectedDirector(director)
    setAssignmentForm(prev => ({
      ...prev,
      role: prev.role || 'Director'
    }))
  }

  const handleAssignDirector = async () => {
    if (!selectedDirector) return
    
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/entity-directors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: entityId,
          full_name: selectedDirector.full_name,
          email: selectedDirector.email,
          role: assignmentForm.role || 'Director',
          effective_from: assignmentForm.effective_from,
          notes: assignmentForm.notes
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to assign director')
      }

      onSuccess()
      handleClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAndAssign = async () => {
    setLoading(true)
    setError(null)

    try {
      // First, register the new director
      const registerResponse = await fetch('/api/director-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDirectorForm)
      })

      if (!registerResponse.ok) {
        const data = await registerResponse.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to register director')
      }

      // Then, assign them to the entity
      const assignResponse = await fetch('/api/entity-directors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: entityId,
          full_name: newDirectorForm.full_name,
          email: newDirectorForm.email || null,
          role: assignmentForm.role || 'Director',
          effective_from: assignmentForm.effective_from,
          notes: assignmentForm.notes
        })
      })

      if (!assignResponse.ok) {
        const data = await assignResponse.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to assign director')
      }

      onSuccess()
      handleClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setMode('select')
    setSelectedDirector(null)
    setSearchQuery('')
    setAssignmentForm({ role: '', effective_from: new Date().toISOString().split('T')[0], notes: '' })
    setNewDirectorForm({ full_name: '', email: '', phone: '', nationality: '', id_number: '', notes: '' })
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] bg-zinc-950 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-400" />
            {mode === 'select' ? 'Add Director from Registry' : 'Register New Director'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'select'
              ? 'Select an existing director or register a new one'
              : 'Add a new director to the registry and assign to this entity'
            }
          </DialogDescription>
        </DialogHeader>

        {mode === 'select' ? (
          <div className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">Search Directors</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search directors by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                />
              </div>
              <p className="text-xs text-gray-400">Start typing to filter the director registry</p>
            </div>

            {/* Directors List */}
            <ScrollArea className="h-[300px] rounded border border-white/10 bg-white/5">
              <div className="p-2 space-y-2">
                {searching ? (
                  <div className="text-center py-8 text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
                    <p>Searching...</p>
                  </div>
                ) : directors.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2">
                      <User className="h-6 w-6" />
                    </div>
                    <p className="text-white">No directors found</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setMode('create')}
                      className="mt-2 text-emerald-400 hover:text-emerald-300"
                    >
                      Register new director
                    </Button>
                  </div>
                ) : (
                  directors.map((director) => (
                    <Card
                      key={director.id}
                      className={`p-3 cursor-pointer transition-all ${
                        selectedDirector?.id === director.id
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => handleSelectDirector(director)}
                    >
                      <div className="font-medium text-white">{director.full_name}</div>
                      {director.email && (
                        <div className="text-sm text-gray-400">{director.email}</div>
                      )}
                      {director.nationality && (
                        <div className="text-xs text-gray-400 mt-1">
                          {director.nationality}
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Assignment Form (shown when director is selected) */}
            {selectedDirector && (
              <div className="border-t border-white/10 pt-4 space-y-3">
                <h4 className="font-medium text-sm text-white">Assignment Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="role" className="text-sm font-medium text-white">Role</Label>
                    <Input
                      id="role"
                      value={assignmentForm.role}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="e.g., Director, Chairman"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="effective_from" className="text-sm font-medium text-white">Effective From</Label>
                    <Input
                      id="effective_from"
                      type="date"
                      value={assignmentForm.effective_from}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, effective_from: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white focus:border-emerald-400/50 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="assignment_notes" className="text-sm font-medium text-white">Notes (Optional)</Label>
                  <Textarea
                    id="assignment_notes"
                    value={assignmentForm.notes}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    rows={2}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
              </div>
            )}

            {/* Switch Mode Button */}
            <Button
              variant="outline"
              onClick={() => setMode('create')}
              className="w-full gap-2 border-white/10 text-white hover:bg-white/10"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              Register New Director
            </Button>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-3">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* New Director Form */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Director Information</h3>
                  <p className="text-xs text-gray-400">Enter the director's personal details</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="new_full_name" className="text-sm font-medium text-white">Full Name *</Label>
                  <Input
                    id="new_full_name"
                    value={newDirectorForm.full_name}
                    onChange={(e) => setNewDirectorForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="John Smith"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
                <div>
                  <Label htmlFor="new_email" className="text-sm font-medium text-white">Email</Label>
                  <Input
                    id="new_email"
                    type="email"
                    value={newDirectorForm.email}
                    onChange={(e) => setNewDirectorForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
                <div>
                  <Label htmlFor="new_phone" className="text-sm font-medium text-white">Phone</Label>
                  <Input
                    id="new_phone"
                    value={newDirectorForm.phone}
                    onChange={(e) => setNewDirectorForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 234 567 8900"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
                <div>
                  <Label htmlFor="new_nationality" className="text-sm font-medium text-white">Nationality</Label>
                  <Input
                    id="new_nationality"
                    value={newDirectorForm.nationality}
                    onChange={(e) => setNewDirectorForm(prev => ({ ...prev, nationality: e.target.value }))}
                    placeholder="e.g., British, American"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
                <div>
                  <Label htmlFor="new_id_number" className="text-sm font-medium text-white">ID/Passport Number</Label>
                  <Input
                    id="new_id_number"
                    value={newDirectorForm.id_number}
                    onChange={(e) => setNewDirectorForm(prev => ({ ...prev, id_number: e.target.value }))}
                    placeholder="AB123456"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="new_notes" className="text-sm font-medium text-white">Notes</Label>
                  <Textarea
                    id="new_notes"
                    value={newDirectorForm.notes}
                    onChange={(e) => setNewDirectorForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional information..."
                    rows={2}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
              </div>
            </div>

            {/* Assignment Details */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <h4 className="font-medium text-sm text-white">Entity Assignment</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="new_role" className="text-sm font-medium text-white">Role</Label>
                  <Input
                    id="new_role"
                    value={assignmentForm.role}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g., Director, Chairman"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
                <div>
                  <Label htmlFor="new_effective_from" className="text-sm font-medium text-white">Effective From</Label>
                  <Input
                    id="new_effective_from"
                    type="date"
                    value={assignmentForm.effective_from}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, effective_from: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white focus:border-emerald-400/50 focus:ring-emerald-400/20"
                  />
                </div>
              </div>
            </div>

            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => setMode('select')}
              className="w-full border-white/10 text-white hover:bg-white/10"
              disabled={loading}
            >
              Back to Selection
            </Button>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-3">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="border-t border-white/10 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="border-white/10 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          {mode === 'select' ? (
            <Button
              onClick={handleAssignDirector}
              disabled={loading || !selectedDirector}
              className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-semibold"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Director
            </Button>
          ) : (
            <Button
              onClick={handleCreateAndAssign}
              disabled={loading || !newDirectorForm.full_name.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-semibold"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register & Assign
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
