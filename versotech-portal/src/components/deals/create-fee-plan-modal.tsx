'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CreateFeePlanModalProps {
  dealId: string
}

export function CreateFeePlanModal({ dealId }: CreateFeePlanModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_default: false
  })

  const handleSubmit = async () => {
    if (!formData.name) {
      setError('Plan name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/deals/${dealId}/fee-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create fee plan')
      }

      // Reset and close
      setFormData({ name: '', description: '', is_default: false })
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Fee Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Fee Plan</DialogTitle>
          <DialogDescription>
            Define a fee structure for this deal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              placeholder="e.g., All-In 5% or 2+20"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the fee structure..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_default: checked === true }))
              }
            />
            <Label htmlFor="is_default" className="cursor-pointer">
              Set as default (recommended) plan
            </Label>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Plan'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

