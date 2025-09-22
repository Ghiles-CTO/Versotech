'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  MessageSquare,
  Send,
  Loader2,
  FileText,
  HelpCircle,
  Clock,
  CheckCircle2
} from 'lucide-react'

interface AskRequestFormProps {
  onSubmitted?: () => void
  dealId?: string
}

const requestCategories = [
  { id: 'reports', name: 'Reports & Analytics', description: 'Position statements, performance reports, tax docs' },
  { id: 'documents', name: 'Documents', description: 'Contracts, agreements, regulatory filings' },
  { id: 'kyc', name: 'KYC/Compliance', description: 'Identity verification, compliance requirements' },
  { id: 'performance', name: 'Performance', description: 'NAV updates, return calculations, benchmarks' },
  { id: 'capital', name: 'Capital Operations', description: 'Capital calls, distributions, funding' },
  { id: 'general', name: 'General Support', description: 'Other questions or requests' }
]

export function AskRequestForm({ onSubmitted, dealId }: AskRequestFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [details, setDetails] = useState('')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCategory || !subject.trim() || !details.trim()) {
      toast.error('Please complete all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
          subject: subject.trim(),
          details: details.trim(),
          priority,
          deal_id: dealId || null
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Request submitted successfully! We\'ll get back to you soon.')
        
        // Reset form
        setSelectedCategory('')
        setSubject('')
        setDetails('')
        setPriority('normal')
        
        // Callback to parent component
        onSubmitted?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit request')
      }
    } catch (error) {
      console.error('Request submission error:', error)
      toast.error('Error submitting request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategoryInfo = requestCategories.find(cat => cat.id === selectedCategory)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Ask for Support
        </CardTitle>
        <CardDescription>
          Can't find what you need? Submit a request and our team will help you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Category Selection */}
          <div>
            <Label className="text-base font-medium">What do you need help with?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {requestCategories.map((category) => (
                <div
                  key={category.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                </div>
              ))}
            </div>
            {selectedCategoryInfo && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedCategoryInfo.name}
                </div>
                <div className="text-xs text-blue-600">{selectedCategoryInfo.description}</div>
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject" className="text-base font-medium">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of what you need"
              className="mt-2"
              required
            />
          </div>

          {/* Details */}
          <div>
            <Label htmlFor="details" className="text-base font-medium">
              Details <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Please provide specific details about your request. Include relevant dates, vehicle names, amounts, or other information that will help us assist you quickly."
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              Be specific to help us process your request faster
            </div>
          </div>

          {/* Priority */}
          <div>
            <Label className="text-base font-medium">Priority Level</Label>
            <div className="flex gap-3 mt-2">
              {(['low', 'normal', 'high'] as const).map((level) => (
                <div
                  key={level}
                  className={`px-3 py-2 border rounded-lg cursor-pointer transition-all text-sm ${
                    priority === level
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPriority(level)}
                >
                  <div className="font-medium capitalize">{level}</div>
                  <div className="text-xs text-gray-500">
                    {level === 'low' && 'Within 5 business days'}
                    {level === 'normal' && 'Within 2 business days'}  
                    {level === 'high' && 'Within 24 hours'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deal Context */}
          {dealId && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-sm text-amber-800">
                <strong>Note:</strong> This request will be associated with the current deal for better context.
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting || !selectedCategory || !subject.trim() || !details.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit Request
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setSelectedCategory('')
                setSubject('')
                setDetails('')
                setPriority('normal')
              }}
            >
              Clear
            </Button>
          </div>

          {/* SLA Information */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="h-3 w-3" />
              <strong>Response Times:</strong>
            </div>
            <div>High priority: 24 hours • Normal: 2 business days • Low: 5 business days</div>
            <div className="mt-1">You'll receive email notifications when your request is updated.</div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
