'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
import { useSubscriptionForm } from '@/hooks/use-subscription-form'
import { Loader2, Edit } from 'lucide-react'

interface SubscriptionEditModalProps {
  open: boolean
  onClose: () => void
  entityId: string
  investorId: string
  defaultValues?: any
  onSuccess?: (data: any) => void
}

export function SubscriptionEditModal({
  open,
  onClose,
  entityId,
  investorId,
  defaultValues,
  onSuccess
}: SubscriptionEditModalProps) {
  const { form, onSubmit, isSubmitting } = useSubscriptionForm({
    entityId,
    investorId,
    defaultValues,
    onSuccess: (data) => {
      onSuccess?.(data.investor)
      onClose()
    }
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Edit className="h-5 w-5 text-emerald-400" />
            Edit Subscription
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Update subscription details for this investor&apos;s commitment to the vehicle
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="commitment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Commitment Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="bg-white/5 border-white/10 text-white"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Currency *</FormLabel>
                    <FormControl>
                      <Input
                        maxLength={3}
                        placeholder="USD"
                        className="bg-white/5 border-white/10 text-white uppercase"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-950 border-white/10">
                      <SelectItem value="pending" className="text-white">
                        Pending
                      </SelectItem>
                      <SelectItem value="committed" className="text-white">
                        Committed
                      </SelectItem>
                      <SelectItem value="active" className="text-white">
                        Active
                      </SelectItem>
                      <SelectItem value="closed" className="text-white">
                        Closed
                      </SelectItem>
                      <SelectItem value="cancelled" className="text-white">
                        Cancelled
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effective_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Effective Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
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
                name="funding_due_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Funding Due Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-white/5 border-white/10 text-white"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-400">
                      Must be after effective date
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="units"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Units</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Number of units"
                      className="bg-white/5 border-white/10 text-white"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acknowledgement_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Acknowledgement Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Internal notes about this subscription"
                      className="bg-white/5 border-white/10 text-white"
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
