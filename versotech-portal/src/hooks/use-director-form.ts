import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  directorAssignmentSchema,
  DirectorAssignmentFormData,
  directorCreateAndAssignSchema,
  DirectorCreateAndAssignFormData,
  directorEditSchema,
  DirectorEditFormData
} from '@/lib/schemas/director-schema'
import { toast } from 'sonner'

// Hook for assigning an existing director to an entity
interface UseDirectorAssignmentFormProps {
  entityId: string
  directorData: {
    full_name: string
    email: string | null
  }
  defaultValues?: Partial<DirectorAssignmentFormData>
  onSuccess?: (data: any) => void
}

export function useDirectorAssignmentForm({
  entityId,
  directorData,
  defaultValues,
  onSuccess
}: UseDirectorAssignmentFormProps) {
  const form = useForm<DirectorAssignmentFormData>({
    resolver: zodResolver(directorAssignmentSchema),
    defaultValues: defaultValues || {
      role: 'Director',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: null,
      notes: null
    }
  })

  const onSubmit = async (data: DirectorAssignmentFormData) => {
    try {
      const response = await fetch('/api/entity-directors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: entityId,
          full_name: directorData.full_name,
          email: directorData.email,
          role: data.role,
          effective_from: data.effective_from,
          effective_to: data.effective_to,
          notes: data.notes
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to assign director')
      }

      const result = await response.json()
      toast.success('Director assigned successfully')
      onSuccess?.(result)
    } catch (error) {
      console.error('Failed to assign director:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to assign director')
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

// Hook for creating and assigning a director in one step
interface UseDirectorCreateAndAssignFormProps {
  entityId: string
  defaultValues?: Partial<DirectorCreateAndAssignFormData>
  onSuccess?: (data: any) => void
}

export function useDirectorCreateAndAssignForm({
  entityId,
  defaultValues,
  onSuccess
}: UseDirectorCreateAndAssignFormProps) {
  const form = useForm<DirectorCreateAndAssignFormData>({
    resolver: zodResolver(directorCreateAndAssignSchema),
    defaultValues: defaultValues || {
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
    }
  })

  const onSubmit = async (data: DirectorCreateAndAssignFormData) => {
    try {
      // First, register the new director
      const registerResponse = await fetch('/api/director-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          nationality: data.nationality,
          id_number: data.id_number,
          notes: data.director_notes
        })
      })

      if (!registerResponse.ok) {
        const error = await registerResponse.json()
        throw new Error(error.error || 'Failed to register director')
      }

      // Then, assign them to the entity
      const assignResponse = await fetch('/api/entity-directors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: entityId,
          full_name: data.full_name,
          email: data.email,
          role: data.role,
          effective_from: data.effective_from,
          effective_to: data.effective_to,
          notes: data.assignment_notes
        })
      })

      if (!assignResponse.ok) {
        const error = await assignResponse.json()
        throw new Error(error.error || 'Failed to assign director')
      }

      const result = await assignResponse.json()
      toast.success('Director registered and assigned successfully')
      onSuccess?.(result)
    } catch (error) {
      console.error('Failed to create and assign director:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create and assign director')
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

// Hook for editing an existing director assignment
interface UseDirectorEditFormProps {
  entityId: string
  directorId: string
  defaultValues?: Partial<DirectorEditFormData>
  onSuccess?: (data: any) => void
}

export function useDirectorEditForm({
  entityId,
  directorId,
  defaultValues,
  onSuccess
}: UseDirectorEditFormProps) {
  const form = useForm<DirectorEditFormData>({
    resolver: zodResolver(directorEditSchema),
    defaultValues: defaultValues || {
      role: '',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: null,
      notes: null
    }
  })

  const onSubmit = async (data: DirectorEditFormData) => {
    try {
      const response = await fetch(`/api/entities/${entityId}/directors/${directorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: data.role,
          effective_from: data.effective_from,
          effective_to: data.effective_to,
          notes: data.notes
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update director')
      }

      const result = await response.json()
      toast.success('Director updated successfully')
      onSuccess?.(result)
    } catch (error) {
      console.error('Failed to update director:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update director')
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
