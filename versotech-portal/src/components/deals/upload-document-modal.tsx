'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Loader2, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UploadDocumentModalProps {
  dealId?: string
  entityId?: string
  triggerLabel?: string
  onUploaded?: () => void
}

export function UploadDocumentModal({ dealId, entityId, triggerLabel, onUploaded }: UploadDocumentModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [docType, setDocType] = useState('contract')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const scopeProvided = Boolean(dealId || entityId)

  const handleSubmit = async () => {
    if (!scopeProvided) {
      setError('Document scope is not configured')
      return
    }

    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', docType)
      if (name.trim()) {
        formData.append('name', name.trim())
      }
      if (description.trim()) {
        formData.append('description', description.trim())
      }
      if (dealId) {
        formData.append('deal_id', dealId)
      }
      if (entityId) {
        formData.append('entity_id', entityId)
        formData.append('vehicle_id', entityId)
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload document')
      }

      setFile(null)
      setName('')
      setDescription('')
      setOpen(false)
      router.refresh()
      onUploaded?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          {triggerLabel || 'Upload Document'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add a document scoped to this {dealId ? 'deal' : 'entity'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc_type">Document Type *</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nda">NDA</SelectItem>
                <SelectItem value="term_sheet">Term Sheet</SelectItem>
                <SelectItem value="subscription">Subscription Agreement</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc_name">Title</Label>
            <Input
              id="doc_name"
              placeholder="e.g., Board Resolution - Jan 2025"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc_description">Description</Label>
            <Input
              id="doc_description"
              placeholder="Optional summary or context"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
                <span className="text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !file}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

