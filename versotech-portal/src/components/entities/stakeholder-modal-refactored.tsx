'use client'

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
import { PhoneInput } from '@/components/ui/phone-input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Loader2, Users, Edit, Plus } from 'lucide-react'
import { useStakeholderForm, useStakeholderEditForm } from '@/hooks/use-stakeholder-form'
import { stakeholderRoles, getStakeholderRoleLabel } from '@/lib/schemas/stakeholder-schema'

interface Stakeholder {
  id: string
  role: string
  company_name: string | null
  contact_person: string | null
  email: string | null
  phone: string | null
  effective_from: string | null
  effective_to: string | null
  notes: string | null
  created_at: string
}

interface StakeholderModalRefactoredProps {
  entityId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
  mode: 'create' | 'edit'
  existingStakeholder?: Stakeholder
}

export function StakeholderModalRefactored({
  entityId,
  open,
  onClose,
  onSuccess,
  mode,
  existingStakeholder
}: StakeholderModalRefactoredProps) {
  // Create form
  const createForm = useStakeholderForm({
    entityId,
    defaultValues: {
      role: 'lawyer',
      company_name: '',
      contact_person: null,
      email: null,
      phone: null,
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: null,
      notes: null
    },
    onSuccess: () => {
      onSuccess()
      handleClose()
    }
  })

  // Edit form
  const editForm = useStakeholderEditForm({
    entityId,
    stakeholderId: existingStakeholder?.id || '',
    defaultValues: existingStakeholder
      ? {
          role: existingStakeholder.role as any,
          company_name: existingStakeholder.company_name || '',
          contact_person: existingStakeholder.contact_person || null,
          email: existingStakeholder.email || null,
          phone: existingStakeholder.phone || null,
          effective_from:
            existingStakeholder.effective_from || new Date().toISOString().split('T')[0],
          effective_to: existingStakeholder.effective_to || null,
          notes: existingStakeholder.notes || null
        }
      : undefined,
    onSuccess: () => {
      onSuccess()
      handleClose()
    }
  })

  const form = mode === 'edit' ? editForm.form : createForm.form
  const onSubmit = mode === 'edit' ? editForm.onSubmit : createForm.onSubmit
  const isSubmitting = mode === 'edit' ? editForm.isSubmitting : createForm.isSubmitting

  const handleClose = () => {
    createForm.form.reset()
    editForm.form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-zinc-950 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {mode === 'edit' ? (
              <>
                <Edit className="h-5 w-5 text-emerald-400" />
                Edit Stakeholder
              </>
            ) : (
              <>
                <Users className="h-5 w-5 text-emerald-400" />
                Add Stakeholder
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'edit'
              ? 'Update stakeholder information and assignment details'
              : 'Add lawyers, accountants, auditors, administrators, or strategic partners to this entity'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 py-4">
            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Stakeholder Role *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-950 border-white/10">
                      {stakeholderRoles.map((role) => (
                        <SelectItem key={role} value={role} className="text-white">
                          {getStakeholderRoleLabel(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company/Firm Name */}
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Company / Firm Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Arendt & Medernach, KPMG Luxembourg"
                      className="bg-white/5 border-white/10 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Person */}
            <FormField
              control={form.control}
              name="contact_person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Contact Person</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Primary contact name"
                      className="bg-white/5 border-white/10 text-white"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email and Phone */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@firm.com"
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
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Phone</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Effective Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                      Leave empty if currently active
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any relevant information about this stakeholder..."
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
                disabled={isSubmitting}
                className="border-white/10 text-white hover:bg-white/10 bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'edit' ? 'Saving...' : 'Adding...'}
                  </>
                ) : mode === 'edit' ? (
                  'Save Changes'
                ) : (
                  'Add Stakeholder'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
