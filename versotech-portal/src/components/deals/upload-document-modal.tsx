'use client'

import { useEffect, useState } from 'react'
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
import { Upload, Loader2, FileText, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface FolderOption {
  id: string
  name: string
  path?: string
}

interface UploadDocumentModalProps {
  dealId?: string
  entityId?: string
  triggerLabel?: string
  onUploaded?: () => void
  defaultFolderId?: string | null
  folderOptions?: FolderOption[]
}

export function UploadDocumentModal({
  dealId,
  entityId,
  triggerLabel,
  onUploaded,
  defaultFolderId = null,
  folderOptions = []
}: UploadDocumentModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [docType, setDocType] = useState('contract')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState<'file' | 'link'>('file')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkType, setLinkType] = useState('external')
  const [folderId, setFolderId] = useState<string | null>(defaultFolderId)

  const scopeProvided = Boolean(dealId || entityId)
  const isFileMode = mode === 'file'

  useEffect(() => {
    if (!open) {
      setMode('file')
      setFile(null)
      setLinkUrl('')
      setLinkType('external')
      setError(null)
      setFolderId(defaultFolderId ?? null)
    }
  }, [open, defaultFolderId])

  const handleSubmit = async () => {
    if (!scopeProvided) {
      setError('Document scope is not configured')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (mode === 'file') {
        if (!file) {
          setError('Please select a file')
          setLoading(false)
          return
        }

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
        if (folderId) {
          formData.append('folder_id', folderId)
        }

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to upload document')
        }
      } else {
        if (!linkUrl.trim()) {
          setError('Please provide a valid external link')
          setLoading(false)
          return
        }

        const payload: Record<string, any> = {
          name: name.trim() || null,
          type: docType || null,
          description: description.trim() || null,
          external_url: linkUrl.trim(),
          link_type: linkType
        }

        if (dealId) {
          payload.deal_id = dealId
        }
        if (entityId) {
          payload.entity_id = entityId
          payload.vehicle_id = entityId
        }
        if (folderId) {
          payload.folder_id = folderId
        }

        const response = await fetch('/api/documents/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to save link')
        }
      }

      setFile(null)
      setName('')
      setDescription('')
      setLinkUrl('')
      setLinkType('external')
      setMode('file')
      setOpen(false)
      setFolderId(defaultFolderId ?? null)
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
      <DialogContent className="bg-zinc-950 border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Upload className="h-5 w-5 text-emerald-400" />
            Upload Document
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a document scoped to this {dealId ? 'deal' : 'entity'}
          </DialogDescription>
        </DialogHeader>

        {folderOptions.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label htmlFor="doc-folder-select" className="text-sm font-medium text-white">Folder</Label>
            <Select
              value={folderId ?? 'none'}
              onValueChange={(value) => setFolderId(value === 'none' ? null : value)}
            >
              <SelectTrigger id="doc-folder-select" className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10">
                <SelectItem value="none" className="text-white">Unfiled</SelectItem>
                {folderOptions.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id} className="text-white">
                    {folder.path ?? folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Tabs value={mode} onValueChange={(value) => setMode(value as 'file' | 'link')}>
          <TabsList className="grid grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger value="file" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-100 text-white">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="link" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-100 text-white">
              <FileText className="h-4 w-4 mr-2" />
              Link Document
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc_type_file" className="text-sm font-medium text-white">Document Type *</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger id="doc_type_file" className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10">
                  <SelectItem value="nda" className="text-white">NDA</SelectItem>
                  <SelectItem value="term_sheet" className="text-white">Term Sheet</SelectItem>
                  <SelectItem value="subscription" className="text-white">Subscription Agreement</SelectItem>
                  <SelectItem value="contract" className="text-white">Contract</SelectItem>
                  <SelectItem value="report" className="text-white">Report</SelectItem>
                  <SelectItem value="other" className="text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc_name_file" className="text-sm font-medium text-white">Title</Label>
              <Input
                id="doc_name_file"
                placeholder="e.g., Board Resolution - Jan 2025"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc_description_file" className="text-sm font-medium text-white">Description</Label>
              <Input
                id="doc_description_file"
                placeholder="Optional summary or context"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-input" className="text-sm font-medium text-white">File *</Label>
              <Input
                id="file-input"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="bg-white/5 border-white/10 text-white file:text-white"
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FileText className="h-4 w-4" />
                  <span className="text-white">{file.name}</span>
                  <span className="text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="link" className="mt-4 space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Link External Document</h3>
                  <p className="text-xs text-gray-400">Connect to documents stored in Google Drive or other platforms</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link-type" className="text-sm font-medium text-white">Link Source *</Label>
                <Select value={linkType} onValueChange={setLinkType}>
                  <SelectTrigger id="link-type" className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10">
                    <SelectItem value="google_drive" className="text-white">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-blue-500/20 flex items-center justify-center">
                          <span className="text-xs">G</span>
                        </div>
                        Google Drive
                      </div>
                    </SelectItem>
                    <SelectItem value="sharepoint" className="text-white">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-blue-500/20 flex items-center justify-center">
                          <span className="text-xs">S</span>
                        </div>
                        SharePoint
                      </div>
                    </SelectItem>
                    <SelectItem value="dropbox" className="text-white">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-blue-500/20 flex items-center justify-center">
                          <span className="text-xs">D</span>
                        </div>
                        Dropbox
                      </div>
                    </SelectItem>
                    <SelectItem value="external" className="text-white">External URL</SelectItem>
                    <SelectItem value="other" className="text-white">Other</SelectItem>
                  </SelectContent>
                </Select>
                {linkType === 'google_drive' && (
                  <p className="text-xs text-gray-400">
                    Make sure the Google Drive link has proper sharing permissions
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="link-url" className="text-sm font-medium text-white">
                  {linkType === 'google_drive' ? 'Google Drive Share Link' : 'External URL'} *
                </Label>
                <Input
                  id="link-url"
                  type="url"
                  placeholder={
                    linkType === 'google_drive'
                      ? 'https://drive.google.com/file/d/...'
                      : 'https://example.com/document.pdf'
                  }
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                />
                {linkType === 'google_drive' && linkUrl && (
                  <div className="flex items-start gap-2 p-2 rounded-md bg-blue-500/10 border border-blue-400/20">
                    <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-blue-200">
                      <p className="font-medium">Google Drive Link Detected</p>
                      <p className="mt-0.5 opacity-80">Verify the link is accessible to intended users</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc_type_link" className="text-sm font-medium text-white">Document Type *</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger id="doc_type_link" className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10">
                  <SelectItem value="nda" className="text-white">NDA</SelectItem>
                  <SelectItem value="term_sheet" className="text-white">Term Sheet</SelectItem>
                  <SelectItem value="subscription" className="text-white">Subscription Agreement</SelectItem>
                  <SelectItem value="contract" className="text-white">Contract</SelectItem>
                  <SelectItem value="report" className="text-white">Report</SelectItem>
                  <SelectItem value="other" className="text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc_name_link" className="text-sm font-medium text-white">Title</Label>
              <Input
                id="doc_name_link"
                placeholder="e.g., Investor Presentation August 2025"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc_description_link" className="text-sm font-medium text-white">Description</Label>
              <Input
                id="doc_description_link"
                placeholder="Optional summary or context"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-emerald-400/20"
              />
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading} className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || (isFileMode && !file) || (!isFileMode && !linkUrl.trim())} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isFileMode ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {isFileMode ? 'Upload' : 'Save Link'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

