'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, AlertCircle, Loader2, CheckCircle2, Folder } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { DocumentFolder } from '@/types/documents'

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderId?: string | null
  vehicleId?: string | null
  currentFolder?: DocumentFolder | null
  onSuccess?: () => void
  /** Pre-populated files from external drag-drop */
  initialFiles?: File[]
  /** If provided, uploads to deal data room instead of regular documents */
  dataRoomDealId?: string | null
  /** Deal name for display when uploading to data room */
  dataRoomDealName?: string | null
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
  onSuccess,
  initialFiles,
  dataRoomDealId,
  dataRoomDealName
}: DocumentUploadDialogProps) {
  const [files, setFiles] = useState<FileWithMetadata[]>([])
  const [documentType, setDocumentType] = useState('Other')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folderId || null)
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [loadingFolders, setLoadingFolders] = useState(false)

  // Fetch available folders
  useEffect(() => {
    if (!open) return

    const fetchFolders = async () => {
      setLoadingFolders(true)
      try {
        const response = await fetch('/api/staff/documents/folders')
        if (response.ok) {
          const data = await response.json()
          setFolders(data.folders || [])
        }
      } catch (error) {
        console.error('Error fetching folders:', error)
      } finally {
        setLoadingFolders(false)
      }
    }

    fetchFolders()
  }, [open])

  // Reset selected folder when folderId prop changes
  useEffect(() => {
    setSelectedFolderId(folderId || null)
  }, [folderId])

  // Process initialFiles when dialog opens with pre-populated files
  useEffect(() => {
    if (open && initialFiles && initialFiles.length > 0) {
      const newFiles: FileWithMetadata[] = initialFiles.map((file, index) => ({
        ...file,
        id: `${Date.now()}-${index}`,
        progress: 0,
        status: 'pending' as const
      }))
      setFiles(newFiles)
    }
  }, [open, initialFiles])

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
    maxSize: 1024 * 1024 * 1024, // 1GB
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

    // Track results during the loop (not relying on React state)
    let successCount = 0
    let failedCount = 0
    const totalFiles = files.length

    // Both paths now use presigned uploads to bypass Vercel 4.5MB body limit
    const isDataRoomUpload = !!dataRoomDealId

    try {
      // Upload files one by one for better progress tracking
      for (const file of files) {
        // Update file status
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'uploading' as const } : f
        ))

        try {
          if (isDataRoomUpload) {
            // Data room presigned upload flow
            const presignRes = await fetch(`/api/deals/${dataRoomDealId}/documents/presigned-upload`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileName: file.name,
                folder: documentType,
                contentType: file.type || 'application/octet-stream',
                fileSize: file.size
              })
            })

            if (!presignRes.ok) {
              const err = await presignRes.json()
              throw new Error(err.error || 'Failed to prepare upload')
            }

            const { signedUrl, fileKey, token } = await presignRes.json()

            const uploadRes = await fetch(signedUrl, {
              method: 'PUT',
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
              body: file
            })

            if (!uploadRes.ok) {
              throw new Error('Failed to upload to storage')
            }

            const confirmRes = await fetch(`/api/deals/${dataRoomDealId}/documents/presigned-upload`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileKey,
                token,
                fileName: file.name,
                folder: documentType,
                fileSize: file.size,
                mimeType: file.type || 'application/octet-stream',
                visibleToInvestors: false,
                isFeatured: false
              })
            })

            if (!confirmRes.ok) {
              throw new Error('Failed to create document record')
            }
          } else {
            // Regular document presigned upload flow — bypasses Vercel 4.5MB limit
            // Step 1: Get presigned URL
            const presignRes = await fetch('/api/documents/presigned-upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileName: file.name,
                documentType,
                contentType: file.type || 'application/octet-stream',
                fileSize: file.size
              })
            })

            if (!presignRes.ok) {
              const err = await presignRes.json()
              throw new Error(err.error || 'Failed to prepare upload')
            }

            const { signedUrl, fileKey } = await presignRes.json()

            // Step 2: Upload file directly to Supabase Storage
            const uploadRes = await fetch(signedUrl, {
              method: 'PUT',
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
              body: file
            })

            if (!uploadRes.ok) {
              throw new Error('Failed to upload to storage')
            }

            // Step 3: Confirm upload and create DB record
            const confirmRes = await fetch('/api/documents/presigned-upload', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileKey,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type || 'application/octet-stream',
                documentType,
                documentName: file.name.replace(/\.[^/.]+$/, ''),
                description,
                folderId: selectedFolderId,
                vehicleId,
                tags,
                confidential: false,
              })
            })

            if (!confirmRes.ok) {
              const err = await confirmRes.json()
              throw new Error(err.error || 'Failed to create document record')
            }
          }

          // Mark as success
          setFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, status: 'success' as const, progress: 100 } : f
          ))
          successCount++

        } catch (error) {
          // Mark as error
          setFiles(prev => prev.map(f =>
            f.id === file.id
              ? { ...f, status: 'error' as const, error: 'Upload failed' }
              : f
          ))
          failedCount++
          console.error(`Error uploading ${file.name}:`, error)
        }
      }

      // Check results using tracked counts (not stale React state)
      if (failedCount === 0) {
        const destination = isDataRoomUpload ? `Data Room (${dataRoomDealName})` : 'documents'
        toast.success(`Successfully uploaded ${totalFiles} file(s) to ${destination}`)
        onSuccess?.()
        handleClose()
      } else {
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
                  Supports all file types — PDF, DOCX, XLSX, MP4, ZIP, and more (max 1GB each)
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
              <Label htmlFor="folder">Destination Folder</Label>
              <Select
                value={selectedFolderId || 'root'}
                onValueChange={(value) => setSelectedFolderId(value === 'root' ? null : value)}
                disabled={uploading || loadingFolders}
              >
                <SelectTrigger id="folder">
                  <SelectValue>
                    {loadingFolders ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading folders...
                      </span>
                    ) : selectedFolderId ? (
                      <span className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        {folders.find(f => f.id === selectedFolderId)?.path || 'Unknown folder'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        Root / No Folder
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="root">
                    <span className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      Root / No Folder
                    </span>
                  </SelectItem>
                  {folders.map((folder) => {
                    const depth = (folder.path.match(/\//g) || []).length - 1
                    return (
                      <SelectItem key={folder.id} value={folder.id}>
                        <span className="flex items-center gap-2" style={{ paddingLeft: `${depth * 16}px` }}>
                          <Folder className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{folder.path}</span>
                        </span>
                      </SelectItem>
                    )
                  })}
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


