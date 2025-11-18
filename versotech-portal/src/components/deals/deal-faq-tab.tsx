'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Loader2, HelpCircle } from 'lucide-react'
import { FaqFormDialog } from './faq-form-dialog'
import { FaqItem } from './faq-item'
import { toast } from 'sonner'

interface FAQ {
  id: string
  question: string
  answer: string
  display_order: number
  created_at: string
  updated_at: string
}

export function DealFaqTab({ dealId }: { dealId: string }) {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await fetch(`/api/deals/${dealId}/faqs`)
      const data = await res.json()
      setFaqs(data.faqs || [])
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      toast.error('Failed to load FAQs')
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    fetchFaqs()
  }, [fetchFaqs])

  const handleDelete = async (faqId: string) => {
    try {
      const res = await fetch(`/api/deals/${dealId}/faqs/${faqId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }

      setFaqs(faqs.filter((f) => f.id !== faqId))
      toast.success('FAQ deleted successfully')
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete FAQ')
    }
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq)
    setShowDialog(true)
  }

  const handleSave = () => {
    fetchFaqs()
    setShowDialog(false)
    setEditingFaq(null)
  }

  const handleAddNew = () => {
    setEditingFaq(null)
    setShowDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <CardTitle>Deal FAQs</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Manage frequently asked questions for this deal. Investors with data room access can view these FAQs.
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium mb-2">No FAQs yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add frequently asked questions to help investors understand this deal better.
              </p>
              <Button onClick={handleAddNew} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First FAQ
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <FaqItem
                  key={faq.id}
                  faq={faq}
                  onEdit={() => handleEdit(faq)}
                  onDelete={() => handleDelete(faq.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FaqFormDialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open)
          if (!open) setEditingFaq(null)
        }}
        dealId={dealId}
        faq={editingFaq}
        onSave={handleSave}
      />
    </div>
  )
}
