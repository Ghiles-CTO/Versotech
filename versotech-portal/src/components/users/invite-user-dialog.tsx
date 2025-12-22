'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Mail, User, Briefcase } from 'lucide-react'
import { toast } from 'sonner'

const inviteUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  title: z.string().optional(),
  role: z.string(),
  is_primary: z.boolean(),
  is_signatory: z.boolean(),
  can_sign: z.boolean(),
})

type InviteUserFormData = z.infer<typeof inviteUserSchema>

export type EntityType = 'investor' | 'arranger' | 'lawyer' | 'introducer' | 'partner' | 'commercial_partner'

interface InviteUserDialogProps {
  entityType: EntityType
  entityId: string
  entityName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  investor: 'Investor',
  arranger: 'Arranger',
  lawyer: 'Law Firm',
  introducer: 'Introducer',
  partner: 'Partner',
  commercial_partner: 'Commercial Partner',
}

const ROLE_OPTIONS = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
  { value: 'viewer', label: 'Viewer' },
]

export function InviteUserDialog({
  entityType,
  entityId,
  entityName,
  open,
  onOpenChange,
  onSuccess,
}: InviteUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
      display_name: '',
      title: '',
      role: 'member',
      is_primary: false,
      is_signatory: false,
      can_sign: false,
    },
  })

  const isPrimary = watch('is_primary')
  const isSignatory = watch('is_signatory')
  const canSign = watch('can_sign')
  const role = watch('role')

  const onSubmit = async (data: InviteUserFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/entity-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          ...data,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to invite user')
      }

      toast.success(result.message || `User invited to ${entityName}`)
      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Invite error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to invite user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite User to {ENTITY_TYPE_LABELS[entityType]}
          </DialogTitle>
          <DialogDescription>
            Send an invitation email to join <span className="font-medium">{entityName}</span>.
            They will receive instructions to set up their account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="display_name"
                placeholder="John Smith"
                className="pl-10"
                {...register('display_name')}
              />
            </div>
            {errors.display_name && (
              <p className="text-sm text-destructive">{errors.display_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="title"
                placeholder="Managing Director"
                className="pl-10"
                {...register('title')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setValue('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_primary" className="text-sm font-medium">
                Primary Contact
              </Label>
              <p className="text-xs text-muted-foreground">
                Set as the main point of contact for this entity
              </p>
            </div>
            <Switch
              id="is_primary"
              checked={isPrimary}
              onCheckedChange={(checked) => setValue('is_primary', checked)}
            />
          </div>

          {entityType === 'lawyer' && (
            <>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="is_signatory" className="text-sm font-medium">
                    Signatory
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Can act as signatory for legal documents
                  </p>
                </div>
                <Switch
                  id="is_signatory"
                  checked={isSignatory}
                  onCheckedChange={(checked) => setValue('is_signatory', checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="can_sign" className="text-sm font-medium">
                    Can Sign Documents
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Has authority to sign on behalf of the law firm
                  </p>
                </div>
                <Switch
                  id="can_sign"
                  checked={canSign}
                  onCheckedChange={(checked) => setValue('can_sign', checked)}
                />
              </div>
            </>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Invite...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
