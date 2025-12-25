'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { FileSignature, Percent, Calendar, FileText, Loader2, Briefcase } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const AGREEMENT_TYPES = [
  { value: 'referral', label: 'Referral Fee' },
  { value: 'revenue_share', label: 'Revenue Share' },
  { value: 'fixed_fee', label: 'Fixed Fee' },
  { value: 'hybrid', label: 'Hybrid' },
] as const

const formSchema = z.object({
  agreement_type: z.enum(['referral', 'revenue_share', 'fixed_fee', 'hybrid']),
  default_commission_bps: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0, 'Commission must be at least 0').max(500, 'Commission cannot exceed 5%')
  ),
  effective_date: z.string().min(1, 'Effective date is required'),
  expiry_date: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = {
  agreement_type: 'referral' | 'revenue_share' | 'fixed_fee' | 'hybrid'
  default_commission_bps: number
  effective_date: string
  expiry_date?: string
  notes?: string
}

interface CreateAgreementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  introducerId: string
  introducerName: string
  defaultCommissionBps?: number
}

export function CreateAgreementDialog({
  open,
  onOpenChange,
  introducerId,
  introducerName,
  defaultCommissionBps = 100,
}: CreateAgreementDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      agreement_type: 'referral',
      default_commission_bps: defaultCommissionBps,
      effective_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      notes: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/introducer-agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          introducer_id: introducerId,
          agreement_type: data.agreement_type,
          default_commission_bps: data.default_commission_bps,
          effective_date: data.effective_date,
          expiry_date: data.expiry_date || null,
          notes: data.notes || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create agreement')
      }

      toast.success('Agreement created successfully')
      onOpenChange(false)
      form.reset()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create agreement')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-background border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
              <FileSignature className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">
                Create Fee Agreement
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                For {introducerName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Agreement Type */}
            <FormField
              control={form.control}
              name="agreement_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                    Agreement Type
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10 focus:border-amber-500/50">
                        <SelectValue placeholder="Select agreement type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AGREEMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Commission Rate */}
            <FormField
              control={form.control}
              name="default_commission_bps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                    Commission Rate (basis points)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        className="bg-white/5 border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20 pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        bps
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    100 bps = 1.00% | Current: {((field.value || 0) / 100).toFixed(2)}%
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effective_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      Effective Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="bg-white/5 border-white/10 focus:border-amber-500/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      Expiry Date
                      <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="bg-white/5 border-white/10 focus:border-amber-500/50"
                      />
                    </FormControl>
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
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Notes
                    <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special terms or conditions for this agreement..."
                      rows={3}
                      {...field}
                      className="bg-white/5 border-white/10 focus:border-amber-500/50 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileSignature className="h-4 w-4 mr-2" />
                    Create Agreement
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
