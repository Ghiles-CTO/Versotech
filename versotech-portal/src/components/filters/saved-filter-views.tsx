'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Bookmark,
  BookmarkCheck,
  Plus,
  Trash2,
  Star,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

export interface FilterState {
  search?: string
  kyc_status?: string
  type?: string
  status?: string
  primary_rm?: string
  risk_rating?: string
  [key: string]: string | undefined
}

interface SavedView {
  id: string
  name: string
  filters: FilterState
  is_default: boolean
  is_preset: boolean
  created_at: string
}

interface SavedFilterViewsProps {
  currentFilters: FilterState
  onApplyView: (filters: FilterState) => void
  entity: 'investor' | 'subscription'
}

// Preset views (read-only, available to all users)
const INVESTOR_PRESETS: Omit<SavedView, 'id' | 'created_at'>[] = [
  {
    name: 'Pending KYC',
    filters: { kyc_status: 'pending' },
    is_default: false,
    is_preset: true
  },
  {
    name: 'High Risk',
    filters: { risk_rating: 'high' },
    is_default: false,
    is_preset: true
  },
  {
    name: 'Active Investors',
    filters: { status: 'active' },
    is_default: false,
    is_preset: true
  },
  {
    name: 'Institutional Only',
    filters: { type: 'institutional' },
    is_default: false,
    is_preset: true
  },
  {
    name: 'Inactive Accounts',
    filters: { status: 'inactive' },
    is_default: false,
    is_preset: true
  }
]

const SUBSCRIPTION_PRESETS: Omit<SavedView, 'id' | 'created_at'>[] = [
  {
    name: 'Pending Review',
    filters: { status: 'pending' },
    is_default: false,
    is_preset: true
  },
  {
    name: 'Active Subscriptions',
    filters: { status: 'active' },
    is_default: false,
    is_preset: true
  },
  {
    name: 'Overdue Funding',
    filters: { status: 'overdue' },
    is_default: false,
    is_preset: true
  },
  {
    name: 'Missing Documents',
    filters: { status: 'missing_docs' },
    is_default: false,
    is_preset: true
  }
]

export function SavedFilterViews({ currentFilters, onApplyView, entity }: SavedFilterViewsProps) {
  const [customViews, setCustomViews] = useState<SavedView[]>([])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [viewName, setViewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const presets = entity === 'investor' ? INVESTOR_PRESETS : SUBSCRIPTION_PRESETS

  // Load custom views from API
  useEffect(() => {
    const loadCustomViews = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/staff/filter-views?entity=${entity}`)

        if (!response.ok) {
          throw new Error('Failed to load custom views')
        }

        const data = await response.json()
        setCustomViews(data.views || [])
      } catch (err) {
        console.error('Failed to load custom views:', err)
        // Silently fail - custom views are optional
      } finally {
        setLoading(false)
      }
    }

    loadCustomViews()
  }, [entity])

  const handleSaveView = async () => {
    if (!viewName.trim()) {
      toast.error('Please enter a name for this view')
      return
    }

    try {
      setSaving(true)

      const response = await fetch('/api/staff/filter-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: viewName.trim(),
          entity,
          filters: currentFilters
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save view')
      }

      const data = await response.json()
      setCustomViews(prev => [...prev, data.view])

      toast.success('View saved successfully', {
        description: `"${viewName}" is now available in your saved views`
      })

      setSaveDialogOpen(false)
      setViewName('')
    } catch (err) {
      console.error('Failed to save view:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to save view')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteView = async (viewId: string) => {
    try {
      const response = await fetch(`/api/staff/filter-views/${viewId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete view')
      }

      setCustomViews(prev => prev.filter(v => v.id !== viewId))
      toast.success('View deleted')
    } catch (err) {
      console.error('Failed to delete view:', err)
      toast.error('Failed to delete view')
    }
  }

  const handleApplyView = (view: SavedView | Omit<SavedView, 'id' | 'created_at'>) => {
    onApplyView(view.filters)
    toast.success(`Applied view: ${view.name}`)
  }

  const hasActiveFilters = Object.keys(currentFilters).some(
    key => currentFilters[key] !== undefined && currentFilters[key] !== ''
  )

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Saved Views
            {customViews.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {customViews.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Quick Filters</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSaveDialogOpen(true)}
                className="h-7 px-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                Save
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Preset Views */}
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Presets
          </DropdownMenuLabel>
          {presets.map((preset, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => handleApplyView(preset)}
              className="cursor-pointer"
            >
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              <span>{preset.name}</span>
            </DropdownMenuItem>
          ))}

          {/* Custom Views */}
          {customViews.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                My Views
              </DropdownMenuLabel>
              {customViews.map((view) => (
                <DropdownMenuItem
                  key={view.id}
                  className="cursor-pointer group flex items-center justify-between"
                >
                  <div
                    className="flex items-center flex-1"
                    onClick={() => handleApplyView(view)}
                  >
                    <BookmarkCheck className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{view.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteView(view.id)
                    }}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </>
          )}

          {/* Empty State */}
          {customViews.length === 0 && !loading && (
            <>
              <DropdownMenuSeparator />
              <div className="p-3 text-center text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mx-auto mb-1" />
                No custom views yet
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save View Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
            <DialogDescription>
              Give this filter combination a name so you can quickly access it later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="view-name">View Name</Label>
              <Input
                id="view-name"
                placeholder="e.g., High-Value Pending KYC"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveView()
                  }
                }}
              />
            </div>

            {/* Preview current filters */}
            <div className="space-y-2">
              <Label>Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(currentFilters)
                  .filter(([_, value]) => value)
                  .map(([key, value]) => (
                    <Badge key={key} variant="secondary">
                      {key}: {value}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveView} disabled={saving || !viewName.trim()}>
              {saving ? 'Saving...' : 'Save View'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
