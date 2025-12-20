'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Upload, File, X, Loader2, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'

interface DocumentUploadProps {
  dealId: string
  onUploadComplete?: () => void
  trigger: React.ReactNode
}

interface DealFolder {
  id: string
  name: string
  path: string
  folder_type: string
}

// Fallback folders if database folders aren't available
const DEFAULT_FOLDERS = [
  'Term Sheets',
  'Data Room',
  'Subscription Documents',
  'Legal Documents',
  'Financial Reports',
  'Due Diligence'
]

export function DataRoomDocumentUpload({ dealId, onUploadComplete, trigger }: DocumentUploadProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [dealFolders, setDealFolders] = useState<DealFolder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [folder, setFolder] = useState('Data Room') // Default folder name for backward compatibility
  const [visibleToInvestors, setVisibleToInvestors] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file')
  const [externalLink, setExternalLink] = useState('')
  const [linkFileName, setLinkFileName] = useState('')
  const [loadingFolders, setLoadingFolders] = useState(false)

  const fetchDealFolders = useCallback(async () => {
    setLoadingFolders(true)
    try {
      const response = await fetch(`/api/deals/${dealId}/folders`)
      if (response.ok) {
        const data = await response.json()
        setDealFolders(data.folders || [])

        // Set default folder (prefer Data Room folder)
        const dataRoomFolder = data.folders?.find((f: DealFolder) =>
          f.name === 'Data Room' || f.path?.includes('/Data Room')
        )
        if (dataRoomFolder) {
          setSelectedFolderId(dataRoomFolder.id)
          setFolder('Data Room')
        } else if (data.folders?.length > 0) {
          setSelectedFolderId(data.folders[0].id)
          setFolder(data.folders[0].name)
        }
      } else {
        // If folder fetch fails, folders might not be created yet
        console.warn('Could not fetch deal folders, using defaults')
      }
    } catch (error) {
      console.error('Error fetching deal folders:', error)
    } finally {
      setLoadingFolders(false)
    }
  }, [dealId])

  // Fetch deal folders when dialog opens
  useEffect(() => {
    if (open && dealId) {
      fetchDealFolders()
    }
  }, [open, dealId, fetchDealFolders])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (uploadMode === 'file' && files.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    if (uploadMode === 'link') {
      if (!externalLink.trim()) {
        toast.error('Please enter a link')
        return
      }
      if (!linkFileName.trim()) {
        toast.error('Please enter a document name')
        return
      }
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      if (uploadMode === 'link') {
        // Upload external link
        const response = await fetch(`/api/deals/${dealId}/documents/link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            external_link: externalLink,
            file_name: linkFileName,
            folder,
            folder_id: selectedFolderId, // Include folder_id when available
            visible_to_investors: visibleToInvestors,
            is_featured: isFeatured
          })
        })

        if (!response.ok) {
          const error = await response.json()
          toast.error(`Failed to add link: ${error.error}`)
        } else {
          toast.success('Link added successfully')
        }

        setUploadProgress(100)
      } else {
        // Upload files
        let successCount = 0

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const formData = new FormData()
          formData.append('file', file)
          formData.append('folder', folder)
          if (selectedFolderId) {
            formData.append('folder_id', selectedFolderId) // Include folder_id when available
          }
          formData.append('visible_to_investors', visibleToInvestors.toString())
          formData.append('is_featured', isFeatured.toString())

          const response = await fetch(`/api/deals/${dealId}/documents/upload`, {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            const error = await response.json()
            toast.error(`Failed to upload ${file.name}: ${error.error}`)
            continue
          }

          successCount++
          setUploadProgress(Math.round(((i + 1) / files.length) * 100))
        }

        toast.success(`Successfully uploaded ${successCount} of ${files.length} files`)
      }

      // Reset form
      setFiles([])
      setFolder('Legal')
      setVisibleToInvestors(false)
      setIsFeatured(false)
      setExternalLink('')
      setLinkFileName('')
      setOpen(false)

      // Refresh to show new documents
      onUploadComplete?.()
      router.refresh()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload documents')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Documents</DialogTitle>
            <DialogDescription>
              Upload files or add links to external documents (Google Drive, Dropbox, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Mode Selector */}
            <div className="flex gap-2 border-b">
              <Button
                variant={uploadMode === 'file' ? 'default' : 'ghost'}
                onClick={() => setUploadMode('file')}
                className="flex-1"
              >
                Upload Files
              </Button>
              <Button
                variant={uploadMode === 'link' ? 'default' : 'ghost'}
                onClick={() => setUploadMode('link')}
                className="flex-1"
              >
                Add Link
              </Button>
            </div>

            {uploadMode === 'file' ? (
              <>
                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  {isDragActive ? (
                    <p className="text-blue-600 font-medium">Drop files here...</p>
                  ) : (
                    <>
                      <p className="text-gray-700 font-medium mb-1">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports all document types (PDF, DOCX, XLSX, JSON, etc.)
                      </p>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Link Input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkUrl">Document Link</Label>
                    <Input
                      id="linkUrl"
                      type="url"
                      value={externalLink}
                      onChange={(e) => setExternalLink(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                    />
                    <p className="text-xs text-gray-500">
                      Paste a Google Drive, Dropbox, or any public link
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkName">Document Name</Label>
                    <Input
                      id="linkName"
                      value={linkFileName}
                      onChange={(e) => setLinkFileName(e.target.value)}
                      placeholder="Q4 2024 Report"
                    />
                  </div>
                </div>
              </>
            )}

            {/* File List */}
            {uploadMode === 'file' && files.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({files.length})</Label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Folder</Label>
                <Select
                  value={selectedFolderId || folder}
                  onValueChange={(value) => {
                    // Check if value is a folder ID (UUID) or folder name
                    const folderObj = dealFolders.find(f => f.id === value)
                    if (folderObj) {
                      setSelectedFolderId(folderObj.id)
                      setFolder(folderObj.name)
                    } else {
                      // Fallback to using folder name directly
                      setSelectedFolderId(null)
                      setFolder(value)
                    }
                  }}
                  disabled={uploading || loadingFolders}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingFolders ? "Loading folders..." : "Select folder"} />
                  </SelectTrigger>
                  <SelectContent>
                    {dealFolders.length > 0 ? (
                      dealFolders.map(f => (
                        <SelectItem key={f.id} value={f.id}>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-3 w-3" />
                            <span>{f.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      DEFAULT_FOLDERS.map(f => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visible"
                    checked={visibleToInvestors}
                    onCheckedChange={(checked) => setVisibleToInvestors(checked as boolean)}
                    disabled={uploading}
                  />
                  <label
                    htmlFor="visible"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Visible to investors
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={isFeatured}
                    onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
                    disabled={uploading}
                  />
                  <label
                    htmlFor="featured"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Featured document
                  </label>
                </div>
              </div>
            </div>

            {/* Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading || (uploadMode === 'file' && files.length === 0)}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {uploadMode === 'link' ? 'Add Link' : `Upload ${files.length > 0 ? `(${files.length})` : ''}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

