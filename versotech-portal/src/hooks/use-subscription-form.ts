import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  subscriptionFormSchema,
  SubscriptionFormData
} from '@/lib/schemas/subscription-schema'
import { toast } from 'sonner'

interface UseSubscriptionFormProps {
  entityId: string
  investorId: string
  defaultValues?: Partial<SubscriptionFormData>
  onSuccess?: (data: any) => void
}

export function useSubscriptionForm({
  entityId,
  investorId,
  defaultValues,
  onSuccess
}: UseSubscriptionFormProps) {
  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: defaultValues || {
      commitment: 0,
      currency: 'USD',
      status: 'pending'
    }
  })

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      const response = await fetch(`/api/entities/${entityId}/investors/${investorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allocation_status: data.status,
          subscription: data
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update subscription')
      }

      const result = await response.json()
      toast.success('Subscription updated successfully')
      onSuccess?.(result)
    } catch (error) {
      console.error('Failed to update subscription:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update subscription')
      throw error
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting
  }
}
