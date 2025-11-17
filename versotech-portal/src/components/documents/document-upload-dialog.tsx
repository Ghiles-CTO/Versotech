'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { DocumentFolder } from '@/types/documents'
import { UploadDestinationBadge } from './upload/UploadDestinationBanner'

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderId?: string | null
  vehicleId?: string | null
  currentFolder?: DocumentFolder | null
  onSuccess?: () => void
}

interface FileWithMetadata extends File {
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  folderId,
  vehicleId,
  currentFolder,
  onSuccess
}: DocumentUploadDialogProps) {
  const [files, setFiles] = useState<FileWithMetadata[]>([])
  const [documentType, setDocumentType] = useState('Other')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileWithMetadata[] = acceptedFiles.map((file, index) => ({
      ...file,
      id: `${Date.now()}-${index}`,
      progress: 0,
      status: 'pending' as const
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: uploading
  })

  const removeFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId))
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file')
      return
    }

    setUploading(true)

    try {
      // Upload files one by one for better progress tracking
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', documentType)
        formData.append('tags', tags)
        formData.append('description', description)
        if (folderId) formData.append('folder_id', folderId)
        if (vehicleId) formData.append('vehicle_id', vehicleId)

        // Update file status
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'uploading' as const } : f
        ))

        try {
          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            throw new Error('Upload failed')
          }

          // Mark as success
          setFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, status: 'success' as const, progress: 100 } : f
          ))

        } catch (error) {
          // Mark as error
          setFiles(prev => prev.map(f =>
            f.id === file.id
              ? { ...f, status: 'error' as const, error: 'Upload failed' }
              : f
          ))
          console.error(`Error uploading ${file.name}:`, error)
        }
      }

      // Check if all succeeded
      const allSuccess = files.every(f => {
        const updatedFile = files.find(uf => uf.id === f.id)
        return updatedFile?.status === 'success'
      })

      if (allSuccess) {
        toast.success(`Successfully uploaded ${files.length} file(s)`)
        onSuccess?.()
        handleClose()
      } else {
        const failedCount = files.filter(f => f.status === 'error').length
        toast.error(`${failedCount} file(s) failed to upload`)
      }

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setFiles([])
      setDocumentType('Other')
      setTags('')
      setDescription('')
      onOpenChange(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>

        {/* Upload Destination Indicator */}
        {currentFolder && (
          <div className="px-6 py-3 -mx-6 -mt-2 mb-4 bg-slate-50 border-y border-slate-200">
            <UploadDestinationBadge currentFolder={currentFolder} />
          </div>
        )}

        <div className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400',
              uploading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-sm text-gray-600">Drop files here...</p>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-1">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-xs text-gray-500">
                  Supported: PDF, DOCX, XLSX, TXT, JPG, PNG (max 50MB each)
                </p>
              </>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({files.length})</Label>
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3">
                    <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    {file.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    {file.status === 'pending' && !uploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-type">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType} disabled={uploading}>
                <SelectTrigger id="document-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agreement">Agreement</SelectItem>
                  <SelectItem value="Subscription">Subscription</SelectItem>
                  <SelectItem value="KYC">KYC</SelectItem>
                  <SelectItem value="Statement">Statement</SelectItem>
                  <SelectItem value="NDA">NDA</SelectItem>
                  <SelectItem value="Report">Report</SelectItem>
                  <SelectItem value="Tax">Tax</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="quarterly, 2024, financial"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description for these documents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={uploadFiles} disabled={files.length === 0 || uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} File{files.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


