import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { entityFormSchema, EntityFormData } from '@/lib/schemas/entity-schema'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface UseEntityFormProps {
  entityId?: string // If provided, we're editing; otherwise creating
  defaultValues?: Partial<EntityFormData>
  onSuccess?: (data: any) => void
  mode?: 'create' | 'edit'
}

export function useEntityForm({
  entityId,
  defaultValues,
  onSuccess,
  mode = 'edit'
}: UseEntityFormProps) {
  const router = useRouter()

  const form = useForm<EntityFormData>({
    resolver: zodResolver(entityFormSchema),
    defaultValues: defaultValues || {
      name: '',
      entity_code: '',
      platform: '',
      investment_name: '',
      former_entity: '',
      status: 'LIVE',
      type: 'fund',
      domicile: '',
      currency: 'USD',
      formation_date: null,
      legal_jurisdiction: '',
      registration_number: '',
      reporting_type: 'Not Required',
      requires_reporting: false,
      notes: '',
      logo_url: null,
      website_url: null
    }
  })

  const onSubmit = async (data: EntityFormData) => {
    try {
      const endpoint = mode === 'edit' && entityId ? `/api/entities/${entityId}` : '/api/vehicles'
      const method = mode === 'edit' ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${mode} entity`)
      }

      const result = await response.json()
      const successMessage =
        mode === 'edit' ? 'Entity updated successfully' : 'Entity created successfully'
      toast.success(successMessage)

      onSuccess?.(result)

      // If creating, redirect to the new entity
      if (mode === 'create' && result.vehicle?.id) {
        router.push(`/versotech_main/entities/${result.vehicle.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${mode} entity:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} entity`)
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
