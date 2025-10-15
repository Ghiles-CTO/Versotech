'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Upload, File, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DocumentUploadProps {
  dealId: string
  onUploadComplete?: () => void
  trigger: React.ReactNode
}

const FOLDERS = [
  'Legal',
  'KYC',
  'Reports',
  'Presentations',
  'Financial Models',
  'Misc'
]

export function DataRoomDocumentUpload({ dealId, onUploadComplete, trigger }: DocumentUploadProps) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [folder, setFolder] = useState('Legal')
  const [visibleToInvestors, setVisibleToInvestors] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

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
    if (files.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let successCount = 0
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)
        formData.append('visible_to_investors', visibleToInvestors.toString())

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
      
      // Reset form
      setFiles([])
      setFolder('Legal')
      setVisibleToInvestors(false)
      setOpen(false)

      if (onUploadComplete) {
        onUploadComplete()
      }
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
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              Upload files to the deal data room. Drag and drop or click to browse.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
                    Supports all document types (PDF, DOCX, XLSX, etc.)
                  </p>
                </>
              )}
            </div>

            {/* File List */}
            {files.length > 0 && (
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Folder</Label>
                <Select value={folder} onValueChange={setFolder} disabled={uploading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOLDERS.map(f => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <div className="flex items-center space-x-2 h-10">
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
              <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload {files.length > 0 && `(${files.length})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

