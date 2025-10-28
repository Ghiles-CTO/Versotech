'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Loader2, Search, Plus, User, Edit } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import {
  useDirectorAssignmentForm,
  useDirectorCreateAndAssignForm,
  useDirectorEditForm
} from '@/hooks/use-director-form'
import { toast } from 'sonner'

interface Director {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  nationality: string | null
  id_number: string | null
  notes: string | null
}

interface EntityDirector {
  id: string
  full_name: string
  role: string | null
  email: string | null
  effective_from: string | null
  effective_to: string | null
  notes: string | null
  created_at: string
}

interface DirectorModalRefactoredProps {
  entityId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
  mode: 'create' | 'edit'
  existingDirector?: EntityDirector // For edit mode
}

export function DirectorModalRefactored({
  entityId,
  open,
  onClose,
  onSuccess,
  mode,
  existingDirector
}: DirectorModalRefactoredProps) {
  // UI state
  const [createMode, setCreateMode] = useState<'select' | 'create'>('select')
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [directors, setDirectors] = useState<Director[]>([])
  const [selectedDirector, setSelectedDirector] = useState<Director | null>(null)

  // Edit mode form
  const editForm = useDirectorEditForm({
    entityId,
    directorId: existingDirector?.id || '',
    defaultValues: existingDirector
      ? {
          role: existingDirector.role || 'Director',
          effective_from: existingDirector.effective_from || new Date().toISOString().split('T')[0],
          effective_to: existingDirector.effective_to || null,
          notes: existingDirector.notes || null
        }
      : undefined,
    onSuccess: () => {
      onSuccess()
      handleClose()
    }
  })

  // Assignment form (for selecting existing director)
  const assignmentForm = useDirectorAssignmentForm({
    entityId,
    directorData: selectedDirector || { full_name: '', email: null },
    defaultValues: {
      role: 'Director',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: null,
      notes: null
    },
    onSuccess: () => {
      onSuccess()
      handleClose()
    }
  })

  // Create and assign form
  const createAndAssignForm = useDirectorCreateAndAssignForm({
    entityId,
    defaultValues: {
      full_name: '',
      email: null,
      phone: null,
      nationality: null,
      id_number: null,
      director_notes: null,
      role: 'Director',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: null,
      assignment_notes: null
    },
    onSuccess: () => {
      onSuccess()
      handleClose()
    }
  })

  // Fetch directors from registry
  useEffect(() => {
    if (open && mode === 'create' && createMode === 'select') {
      fetchDirectors()
    }
  }, [open, mode, createMode, searchQuery])

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
      toast.error('Failed to load directors')
    } finally {
      setSearching(false)
    }
  }

  const handleSelectDirector = (director: Director) => {
    setSelectedDirector(director)
  }

  const handleClose = () => {
    setCreateMode('select')
    setSelectedDirector(null)
    setSearchQuery('')
    assignmentForm.form.reset()
    createAndAssignForm.form.reset()
    editForm.form.reset()
    onClose()
  }

  // Edit mode UI
  if (mode === 'edit' && existingDirector) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit className="h-5 w-5 text-emerald-400" />
              Edit Director Assignment
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update assignment details for {existingDirector.full_name}
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm.form}>
            <form onSubmit={editForm.onSubmit} className="space-y-4 py-4">
              <FormField
                control={editForm.form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Role *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Director, Chairman"
                        className="bg-white/5 border-white/10 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.form.control}
                  name="effective_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Effective From *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-white/5 border-white/10 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.form.control}
                  name="effective_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Effective To</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-white/5 border-white/10 text-white"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-400">
                        Leave empty if still active
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this assignment..."
                        rows={3}
                        className="bg-white/5 border-white/10 text-white"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="border-t border-white/10 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={editForm.isSubmitting}
                  className="border-white/10 text-white hover:bg-white/10 bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editForm.isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {editForm.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    )
  }

  // Create mode UI
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] bg-zinc-950 border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-400" />
            {createMode === 'select' ? 'Add Director from Registry' : 'Register New Director'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {createMode === 'select'
              ? 'Select an existing director or register a new one'
              : 'Add a new director to the registry and assign to this entity'}
          </DialogDescription>
        </DialogHeader>

        {createMode === 'select' ? (
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
                      onClick={() => setCreateMode('create')}
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
                      {director.email && <div className="text-sm text-gray-400">{director.email}</div>}
                      {director.nationality && (
                        <div className="text-xs text-gray-400 mt-1">{director.nationality}</div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Assignment Form (shown when director is selected) */}
            {selectedDirector && (
              <Form {...assignmentForm.form}>
                <form onSubmit={assignmentForm.onSubmit} className="border-t border-white/10 pt-4 space-y-3">
                  <h4 className="font-medium text-sm text-white">Assignment Details</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={assignmentForm.form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Role *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Director, Chairman"
                              className="bg-white/5 border-white/10 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={assignmentForm.form.control}
                      name="effective_from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Effective From *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="bg-white/5 border-white/10 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={assignmentForm.form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes..."
                            rows={2}
                            className="bg-white/5 border-white/10 text-white"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}

            {/* Switch Mode Button */}
            <Button
              variant="outline"
              onClick={() => setCreateMode('create')}
              className="w-full gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 bg-emerald-500/5"
              disabled={assignmentForm.isSubmitting}
            >
              <Plus className="h-4 w-4" />
              Register New Director
            </Button>

            <DialogFooter className="border-t border-white/10 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={assignmentForm.isSubmitting}
                className="border-white/10 text-white hover:bg-white/10 bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={assignmentForm.onSubmit}
                disabled={assignmentForm.isSubmitting || !selectedDirector}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {assignmentForm.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Director'
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...createAndAssignForm.form}>
            <form onSubmit={createAndAssignForm.onSubmit} className="space-y-4">
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
                    <FormField
                      control={createAndAssignForm.form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Smith"
                              className="bg-white/5 border-white/10 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createAndAssignForm.form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            className="bg-white/5 border-white/10 text-white"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createAndAssignForm.form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1 234 567 8900"
                            className="bg-white/5 border-white/10 text-white"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createAndAssignForm.form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Nationality</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., British, American"
                            className="bg-white/5 border-white/10 text-white"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createAndAssignForm.form.control}
                    name="id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">ID/Passport Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="AB123456"
                            className="bg-white/5 border-white/10 text-white"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-2">
                    <FormField
                      control={createAndAssignForm.form.control}
                      name="director_notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional information..."
                              rows={2}
                              className="bg-white/5 border-white/10 text-white"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <h4 className="font-medium text-sm text-white">Entity Assignment</h4>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={createAndAssignForm.form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Role *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Director, Chairman"
                            className="bg-white/5 border-white/10 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createAndAssignForm.form.control}
                    name="effective_from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Effective From *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-white/5 border-white/10 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createAndAssignForm.form.control}
                  name="assignment_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Assignment Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notes about this assignment..."
                          rows={2}
                          className="bg-white/5 border-white/10 text-white"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Back Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateMode('select')}
                className="w-full border-white/10 text-white hover:bg-white/10 bg-white/5"
                disabled={createAndAssignForm.isSubmitting}
              >
                Back to Selection
              </Button>

              <DialogFooter className="border-t border-white/10 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={createAndAssignForm.isSubmitting}
                  className="border-white/10 text-white hover:bg-white/10 bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAndAssignForm.isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {createAndAssignForm.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Register & Assign'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
