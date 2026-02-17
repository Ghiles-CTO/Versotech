'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Upload, File, X, Loader2, FolderOpen, Check, ChevronsUpDown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { DATA_ROOM_DEFAULT_FOLDERS, validateFolderName } from '@/lib/data-room/constants'
import { cn } from '@/lib/utils'

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

export function DataRoomDocumentUpload({ dealId, onUploadComplete, trigger }: DocumentUploadProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [dealFolders, setDealFolders] = useState<DealFolder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [folder, setFolder] = useState('Data Room')
  const [visibleToInvestors, setVisibleToInvestors] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file')
  const [externalLink, setExternalLink] = useState('')
  const [linkFileName, setLinkFileName] = useState('')
  const [loadingFolders, setLoadingFolders] = useState(false)
  const [folderComboOpen, setFolderComboOpen] = useState(false)
  const [folderSearch, setFolderSearch] = useState('')

  const allFolderOptions = useMemo(() => {
    const set = new Set<string>([...DATA_ROOM_DEFAULT_FOLDERS])
    dealFolders.forEach(f => set.add(f.name))
    return Array.from(set)
  }, [dealFolders])

  const fetchDealFolders = useCallback(async () => {
    setLoadingFolders(true)
    try {
      const response = await fetch(`/api/deals/${dealId}/folders`)
      if (response.ok) {
        const data = await response.json()
        setDealFolders(data.folders || [])

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
        console.warn('Could not fetch deal folders, using defaults')
      }
    } catch (error) {
      console.error('Error fetching deal folders:', error)
    } finally {
      setLoadingFolders(false)
    }
  }, [dealId])

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
        const response = await fetch(`/api/deals/${dealId}/documents/link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            external_link: externalLink,
            file_name: linkFileName,
            folder,
            folder_id: selectedFolderId,
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
        let successCount = 0

        for (let i = 0; i < files.length; i++) {
          const file = files[i]

          try {
            // Step 1: Get presigned upload URL (only JSON metadata, no file body)
            const presignRes = await fetch(`/api/deals/${dealId}/documents/presigned-upload`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileName: file.name,
                folder,
                contentType: file.type || 'application/octet-stream',
                fileSize: file.size
              })
            })

            if (!presignRes.ok) {
              const err = await presignRes.json()
              toast.error(`Failed to prepare upload for ${file.name}: ${err.error}`)
              continue
            }

            const { signedUrl, fileKey, token } = await presignRes.json()

            // Step 2: Upload file directly to Supabase Storage (bypasses Vercel 4.5MB limit)
            console.log(`[Upload] Step 2: Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB) to storage...`)
            const uploadRes = await fetch(signedUrl, {
              method: 'PUT',
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
              body: file
            })

            if (!uploadRes.ok) {
              const errText = await uploadRes.text().catch(() => 'unknown')
              console.error(`[Upload] Step 2 failed for ${file.name}: ${uploadRes.status} ${errText}`)
              toast.error(`Failed to upload ${file.name} to storage`)
              continue
            }
            console.log(`[Upload] Step 2 complete for ${file.name}`)

            // Step 3: Confirm upload and create DB record (only JSON metadata)
            const confirmRes = await fetch(`/api/deals/${dealId}/documents/presigned-upload`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileKey,
                token,
                fileName: file.name,
                folder,
                fileSize: file.size,
                mimeType: file.type || 'application/octet-stream',
                visibleToInvestors,
                isFeatured
              })
            })

            if (!confirmRes.ok) {
              const err = await confirmRes.json()
              toast.error(`Failed to register ${file.name}: ${err.error}`)
              continue
            }

            successCount++
          } catch (err) {
            console.error(`Upload error for ${file.name}:`, err)
            toast.error(`Failed to upload ${file.name}`)
            continue
          }

          setUploadProgress(Math.round(((i + 1) / files.length) * 100))
        }

        toast.success(`Successfully uploaded ${successCount} of ${files.length} files`)
      }

      // Reset form
      setFiles([])
      setFolder('Data Room')
      setVisibleToInvestors(false)
      setIsFeatured(false)
      setExternalLink('')
      setLinkFileName('')
      setOpen(false)

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
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  {isDragActive ? (
                    <p className="text-blue-600 dark:text-blue-400 font-medium">Drop files here...</p>
                  ) : (
                    <>
                      <p className="text-foreground font-medium mb-1">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports all file types — PDF, DOCX, XLSX, MP4, ZIP, and more (max 1GB each)
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
                    <p className="text-xs text-muted-foreground">
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
                      className="flex items-center justify-between p-2 bg-muted rounded border border-border"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
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
                <Popover open={folderComboOpen} onOpenChange={setFolderComboOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={folderComboOpen}
                      className="w-full justify-between font-normal"
                      disabled={uploading || loadingFolders}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" />
                        {folder || 'Select folder...'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search or create folder..."
                        value={folderSearch}
                        onValueChange={setFolderSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {folderSearch.trim() && (
                            <button
                              className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                              onClick={() => {
                                const result = validateFolderName(folderSearch.trim())
                                if (!result.valid) {
                                  toast.error(result.error)
                                  return
                                }
                                setFolder(folderSearch.trim())
                                setSelectedFolderId(null)
                                setFolderComboOpen(false)
                                setFolderSearch('')
                              }}
                            >
                              <Plus className="h-4 w-4" />
                              Create folder: &quot;{folderSearch.trim()}&quot;
                            </button>
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {allFolderOptions.map((f) => (
                            <CommandItem
                              key={f}
                              value={f}
                              onSelect={() => {
                                const folderObj = dealFolders.find(df => df.name === f)
                                if (folderObj) {
                                  setSelectedFolderId(folderObj.id)
                                } else {
                                  setSelectedFolderId(null)
                                }
                                setFolder(f)
                                setFolderComboOpen(false)
                                setFolderSearch('')
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  folder === f ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <FolderOpen className="mr-2 h-3.5 w-3.5" />
                              {f}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
