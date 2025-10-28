import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  stakeholderFormSchema,
  StakeholderFormData,
  stakeholderEditSchema,
  StakeholderEditFormData
} from '@/lib/schemas/stakeholder-schema'
import { toast } from 'sonner'

// Hook for creating a stakeholder
interface UseStakeholderFormProps {
  entityId: string
  defaultValues?: Partial<StakeholderFormData>
  onSuccess?: (data: any) => void
}

export function useStakeholderForm({
  entityId,
  defaultValues,
  onSuccess
}: UseStakeholderFormProps) {
  const form = useForm<StakeholderFormData>({
    resolver: zodResolver(stakeholderFormSchema),
    defaultValues: defaultValues || {
      role: 'lawyer',
      company_name: '',
      contact_person: null,
      email: null,
      phone: null,
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: null,
      notes: null
    }
  })

  const onSubmit = async (data: StakeholderFormData) => {
    try {
      const response = await fetch(`/api/entities/${entityId}/stakeholders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add stakeholder')
      }

      const result = await response.json()
      toast.success('Stakeholder added successfully')
      onSuccess?.(result)
    } catch (error) {
      console.error('Failed to add stakeholder:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add stakeholder')
      throw error
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors
  }
}

// Hook for editing an existing stakeholder
interface UseStakeholderEditFormProps {
  entityId: string
  stakeholderId: string
  defaultValues?: Partial<StakeholderEditFormData>
  onSuccess?: (data: any) => void
}

export function useStakeholderEditForm({
  entityId,
  stakeholderId,
  defaultValues,
  onSuccess
}: UseStakeholderEditFormProps) {
  const form = useForm<StakeholderEditFormData>({
    resolver: zodResolver(stakeholderEditSchema),
    defaultValues: defaultValues || {
      role: 'lawyer',
      company_name: '',
      contact_person: null,
      email: null,
      phone: null,
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: null,
      notes: null
    }
  })

  const onSubmit = async (data: StakeholderEditFormData) => {
    try {
      const response = await fetch(`/api/entities/${entityId}/stakeholders/${stakeholderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update stakeholder')
      }

      const result = await response.json()
      toast.success('Stakeholder updated successfully')
      onSuccess?.(result)
    } catch (error) {
      console.error('Failed to update stakeholder:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update stakeholder')
      throw error
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors
  }
}
